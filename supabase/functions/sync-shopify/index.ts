/**
 * sync-shopify
 *
 * Sincroniza dados da loja Shopify do cliente:
 * - Pedidos (orders) com UTMs, status, valor
 * - Produtos mais vendidos (agregado por período)
 * - Carrinhos abandonados (checkouts)
 * - Clientes (customers) com LTV
 *
 * Body opcional: { cliente_id?: string, days_back?: number (default 60) }
 * Quando cliente_id omitido, processa todos com status_shopify='conectado'.
 *
 * Auth: Custom App Access Token (cabeçalho X-Shopify-Access-Token).
 * API: Admin REST 2024-10
 */
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SHOPIFY_API_VERSION = "2024-10";

interface ShopifyAcesso {
  cliente_id: string;
  shopify_shop_domain: string;
  shopify_access_token: string;
}

interface SyncResult {
  cliente_id: string;
  cliente_nome: string;
  ok: boolean;
  pedidos: number;
  carrinhos: number;
  produtos: number;
  customers: number;
  error?: string;
  duration_ms: number;
}

function normalizeDomain(domain: string): string {
  // aceita "loja.myshopify.com", "loja", "https://loja.myshopify.com"
  let d = domain.trim().toLowerCase();
  d = d.replace(/^https?:\/\//, "");
  d = d.replace(/\/.*$/, "");
  if (!d.includes(".")) d = `${d}.myshopify.com`;
  return d;
}

function dateRangeIso(daysBack: number): string {
  const ini = new Date(Date.now() - daysBack * 86400000);
  return ini.toISOString();
}

interface ShopifyOrder {
  id: number;
  name: string;
  order_number: number;
  email: string | null;
  customer: { id: number } | null;
  total_price: string;
  subtotal_price: string;
  total_discounts: string;
  total_shipping_price_set?: { shop_money: { amount: string } };
  total_tax: string;
  currency: string;
  financial_status: string | null;
  fulfillment_status: string | null;
  source_name: string | null;
  referring_site: string | null;
  landing_site: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
  line_items: Array<{
    id: number;
    product_id: number | null;
    variant_id: number | null;
    title: string;
    sku: string | null;
    quantity: number;
    price: string;
  }>;
  note_attributes?: Array<{ name: string; value: string }>;
  tags?: string;
}

interface ShopifyCheckout {
  id: number;
  token: string;
  email: string | null;
  customer: { id: number } | null;
  total_price: string;
  subtotal_price: string;
  currency: string;
  abandoned_checkout_url: string | null;
  completed_at: string | null;
  created_at: string;
  line_items: Array<{ title: string; quantity: number; price: string }>;
  note_attributes?: Array<{ name: string; value: string }>;
}

interface ShopifyCustomer {
  id: number;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  orders_count: number;
  total_spent: string;
  created_at: string;
  updated_at: string;
  state: string | null;
  tags?: string;
}

/**
 * Fetch paginado via header Link (cursor-based) — padrão Shopify Admin REST 2024.
 */
async function shopifyFetchAll<T>(
  domain: string,
  token: string,
  path: string,
  params: Record<string, string>
): Promise<T[]> {
  const all: T[] = [];
  const u = new URL(`https://${domain}/admin/api/${SHOPIFY_API_VERSION}/${path}`);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  u.searchParams.set("limit", "250");

  let next: string | null = u.toString();
  let safety = 0;
  while (next && safety < 100) {
    safety++;
    const res = await fetch(next, {
      headers: {
        "X-Shopify-Access-Token": token,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Shopify ${res.status} em ${path}: ${txt.slice(0, 400)}`);
    }
    const json: Record<string, T[]> = await res.json();
    const key = Object.keys(json)[0];
    const page = json[key] ?? [];
    all.push(...page);

    // Parse Link header for next cursor
    const link = res.headers.get("link") || res.headers.get("Link");
    next = null;
    if (link) {
      const matches = link.match(/<([^>]+)>;\s*rel="next"/);
      if (matches) next = matches[1];
    }
  }
  return all;
}

function extrairUtm(
  noteAttrs: Array<{ name: string; value: string }> | undefined,
  landing: string | null
): Record<string, string | null> {
  const out: Record<string, string | null> = {
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    utm_content: null,
    utm_term: null,
  };

  // 1) Tenta extrair do note_attributes (Shopify guarda UTMs aqui)
  if (noteAttrs?.length) {
    for (const a of noteAttrs) {
      const key = a.name?.toLowerCase().trim();
      if (key && key in out && a.value) out[key] = a.value;
    }
  }

  // 2) Se ainda vazio, tenta da landing_site URL
  if (!out.utm_source && landing) {
    try {
      const url = new URL(landing.startsWith("http") ? landing : `https://x.com${landing}`);
      for (const k of Object.keys(out)) {
        const v = url.searchParams.get(k);
        if (v) out[k] = v;
      }
    } catch {
      // landing pode ser path inválido — ignora
    }
  }

  return out;
}

async function processarCliente(
  supabase: ReturnType<typeof createClient>,
  acesso: ShopifyAcesso,
  cliente: { id: string; nome: string },
  daysBack: number
): Promise<SyncResult> {
  const inicio = Date.now();
  const r: SyncResult = {
    cliente_id: cliente.id,
    cliente_nome: cliente.nome,
    ok: false,
    pedidos: 0,
    carrinhos: 0,
    produtos: 0,
    customers: 0,
    duration_ms: 0,
  };

  try {
    const domain = normalizeDomain(acesso.shopify_shop_domain);
    const token = acesso.shopify_access_token;
    const sinceIso = dateRangeIso(daysBack);

    // ============ 1. PEDIDOS ============
    const orders = await shopifyFetchAll<ShopifyOrder>(domain, token, "orders.json", {
      status: "any",
      created_at_min: sinceIso,
      fields:
        "id,name,order_number,email,customer,total_price,subtotal_price,total_discounts,total_shipping_price_set,total_tax,currency,financial_status,fulfillment_status,source_name,referring_site,landing_site,cancelled_at,created_at,updated_at,line_items,note_attributes,tags",
    });
    r.pedidos = orders.length;

    const pedidosRows = orders.map((o) => {
      const utms = extrairUtm(o.note_attributes, o.landing_site);
      return {
        cliente_id: cliente.id,
        pedido_id: String(o.id),
        numero: String(o.order_number ?? ""),
        nome: o.name,
        email: o.email,
        customer_id: o.customer?.id ? String(o.customer.id) : null,
        total_price: Number(o.total_price ?? 0),
        subtotal_price: Number(o.subtotal_price ?? 0),
        total_discounts: Number(o.total_discounts ?? 0),
        total_shipping: Number(o.total_shipping_price_set?.shop_money?.amount ?? 0),
        total_tax: Number(o.total_tax ?? 0),
        currency: o.currency,
        financial_status: o.financial_status,
        fulfillment_status: o.fulfillment_status,
        source_name: o.source_name,
        referring_site: o.referring_site,
        landing_site: o.landing_site,
        utm_source: utms.utm_source,
        utm_medium: utms.utm_medium,
        utm_campaign: utms.utm_campaign,
        utm_content: utms.utm_content,
        utm_term: utms.utm_term,
        tags: o.tags ?? null,
        line_items_count: o.line_items?.length ?? 0,
        cancelado_em: o.cancelled_at,
        pedido_criado_em: o.created_at,
        pedido_atualizado_em: o.updated_at,
        raw_jsonb: o as unknown as Record<string, unknown>,
        sincronizado_em: new Date().toISOString(),
      };
    });

    if (pedidosRows.length > 0) {
      // Upsert em batches de 500 pra não estourar payload
      const chunkSize = 500;
      for (let i = 0; i < pedidosRows.length; i += chunkSize) {
        const chunk = pedidosRows.slice(i, i + chunkSize);
        const { error } = await supabase
          .schema("trafego_ddg")
          .from("shopify_pedidos")
          .upsert(chunk, { onConflict: "cliente_id,pedido_id" });
        if (error) throw new Error(`shopify_pedidos: ${error.message}`);
      }
    }

    // ============ 2. PRODUTOS VENDIDOS (agregado dos pedidos) ============
    const periodoIni = sinceIso.split("T")[0];
    const periodoFim = new Date().toISOString().split("T")[0];

    type ProdAgg = {
      produto_id: string;
      variant_id: string | null;
      nome: string;
      sku: string | null;
      preco: number;
      qtd: number;
      receita: number;
    };
    const prodMap = new Map<string, ProdAgg>();
    for (const o of orders) {
      // Não conta pedido cancelado
      if (o.cancelled_at) continue;
      for (const li of o.line_items ?? []) {
        const pid = li.product_id ? String(li.product_id) : `_li_${li.id}`;
        const key = `${pid}::${li.variant_id ?? "null"}`;
        const prev = prodMap.get(key);
        const preco = Number(li.price ?? 0);
        const qtd = Number(li.quantity ?? 0);
        if (prev) {
          prev.qtd += qtd;
          prev.receita += preco * qtd;
        } else {
          prodMap.set(key, {
            produto_id: pid,
            variant_id: li.variant_id ? String(li.variant_id) : null,
            nome: li.title,
            sku: li.sku,
            preco,
            qtd,
            receita: preco * qtd,
          });
        }
      }
    }

    const produtosRows = Array.from(prodMap.values()).map((p) => ({
      cliente_id: cliente.id,
      produto_id: p.produto_id,
      variant_id: p.variant_id,
      nome: p.nome,
      sku: p.sku,
      preco_unitario: p.preco,
      total_vendido: p.qtd,
      receita_total: Number(p.receita.toFixed(2)),
      periodo_inicio: periodoIni,
      periodo_fim: periodoFim,
      imagem_url: null,
      atualizado_em: new Date().toISOString(),
    }));
    r.produtos = produtosRows.length;

    if (produtosRows.length > 0) {
      // Limpa período atual primeiro (snapshot agregado)
      await supabase
        .schema("trafego_ddg")
        .from("shopify_produtos_vendidos")
        .delete()
        .eq("cliente_id", cliente.id)
        .eq("periodo_inicio", periodoIni)
        .eq("periodo_fim", periodoFim);

      const { error } = await supabase
        .schema("trafego_ddg")
        .from("shopify_produtos_vendidos")
        .insert(produtosRows);
      if (error) throw new Error(`shopify_produtos_vendidos: ${error.message}`);
    }

    // ============ 3. CARRINHOS ABANDONADOS ============
    const carrinhos = await shopifyFetchAll<ShopifyCheckout>(
      domain,
      token,
      "checkouts.json",
      {
        status: "open",
        created_at_min: sinceIso,
      }
    );
    r.carrinhos = carrinhos.length;

    const carrinhosRows = carrinhos.map((c) => {
      const utms = extrairUtm(c.note_attributes, null);
      return {
        cliente_id: cliente.id,
        checkout_id: String(c.id ?? c.token),
        email: c.email,
        customer_id: c.customer?.id ? String(c.customer.id) : null,
        total_price: Number(c.total_price ?? 0),
        subtotal_price: Number(c.subtotal_price ?? 0),
        currency: c.currency,
        abandoned_checkout_url: c.abandoned_checkout_url,
        recovered: !!c.completed_at,
        recovered_at: c.completed_at,
        line_items_count: c.line_items?.length ?? 0,
        utm_source: utms.utm_source,
        utm_medium: utms.utm_medium,
        utm_campaign: utms.utm_campaign,
        carrinho_criado_em: c.created_at,
        raw_jsonb: c as unknown as Record<string, unknown>,
        sincronizado_em: new Date().toISOString(),
      };
    });

    if (carrinhosRows.length > 0) {
      const chunkSize = 500;
      for (let i = 0; i < carrinhosRows.length; i += chunkSize) {
        const chunk = carrinhosRows.slice(i, i + chunkSize);
        const { error } = await supabase
          .schema("trafego_ddg")
          .from("shopify_carrinhos_abandonados")
          .upsert(chunk, { onConflict: "cliente_id,checkout_id" });
        if (error) throw new Error(`shopify_carrinhos_abandonados: ${error.message}`);
      }
    }

    // ============ 4. CUSTOMERS ============
    const customers = await shopifyFetchAll<ShopifyCustomer>(
      domain,
      token,
      "customers.json",
      {
        updated_at_min: sinceIso,
      }
    );
    r.customers = customers.length;

    const customersRows = customers.map((c) => ({
      cliente_id: cliente.id,
      customer_id: String(c.id),
      email: c.email,
      first_name: c.first_name,
      last_name: c.last_name,
      orders_count: c.orders_count ?? 0,
      total_spent: Number(c.total_spent ?? 0),
      primeiro_pedido_em: null, // calculado por aggregate query depois se quiser
      ultimo_pedido_em: c.updated_at,
      cliente_criado_em: c.created_at,
      state: c.state,
      tags: c.tags ?? null,
      raw_jsonb: c as unknown as Record<string, unknown>,
      sincronizado_em: new Date().toISOString(),
    }));

    if (customersRows.length > 0) {
      const chunkSize = 500;
      for (let i = 0; i < customersRows.length; i += chunkSize) {
        const chunk = customersRows.slice(i, i + chunkSize);
        const { error } = await supabase
          .schema("trafego_ddg")
          .from("shopify_clientes")
          .upsert(chunk, { onConflict: "cliente_id,customer_id" });
        if (error) throw new Error(`shopify_clientes: ${error.message}`);
      }
    }

    // Marca último sync
    await supabase
      .schema("trafego_ddg")
      .from("clientes_acessos")
      .update({
        ultima_sync_shopify: new Date().toISOString(),
        shopify_ultimo_erro: null,
        status_shopify: "conectado",
      })
      .eq("cliente_id", cliente.id);

    r.ok = true;
  } catch (err) {
    r.ok = false;
    r.error = err instanceof Error ? err.message : String(err);
    await supabase
      .schema("trafego_ddg")
      .from("clientes_acessos")
      .update({
        shopify_ultimo_erro: r.error?.slice(0, 1000),
        status_shopify: "erro",
      })
      .eq("cliente_id", cliente.id);
  }

  r.duration_ms = Date.now() - inicio;
  return r;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*" },
    });
  }

  let clienteIdFiltro: string | undefined;
  let daysBack = 60;
  try {
    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      clienteIdFiltro = body.cliente_id;
      daysBack = Number(body.days_back ?? 60);
    }
  } catch {
    /* ignore */
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
    auth: { persistSession: false },
  });

  let query = supabase
    .schema("trafego_ddg")
    .from("clientes")
    .select(
      "id, nome, clientes_acessos!inner(shopify_shop_domain, shopify_access_token, status_shopify)"
    )
    .eq("ativo", true)
    .eq("clientes_acessos.status_shopify", "conectado");

  if (clienteIdFiltro) query = query.eq("id", clienteIdFiltro);

  const { data: clientes, error } = await query;
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const results: SyncResult[] = [];
  for (const c of clientes ?? []) {
    const acessoArr = (c as unknown as { clientes_acessos: ShopifyAcesso[] }).clientes_acessos;
    const acesso = Array.isArray(acessoArr) ? acessoArr[0] : acessoArr;
    if (!acesso?.shopify_shop_domain || !acesso?.shopify_access_token) continue;
    const r = await processarCliente(
      supabase,
      { ...acesso, cliente_id: (c as { id: string }).id },
      { id: (c as { id: string }).id, nome: (c as { nome: string }).nome },
      daysBack
    );
    results.push(r);
  }

  return new Response(
    JSON.stringify({ ok: true, processados: results.length, results }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
});
