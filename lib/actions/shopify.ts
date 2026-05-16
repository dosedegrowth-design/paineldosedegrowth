"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ==================== TYPES ====================

export interface PedidoShopify {
  id: string;
  cliente_id: string;
  pedido_id: string;
  numero: string | null;
  nome: string | null;
  email: string | null;
  customer_id: string | null;
  total_price: number;
  subtotal_price: number;
  total_discounts: number;
  total_shipping: number;
  currency: string | null;
  financial_status: string | null;
  fulfillment_status: string | null;
  source_name: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  tags: string | null;
  line_items_count: number;
  cancelado_em: string | null;
  pedido_criado_em: string;
}

export interface CarrinhoAbandonadoShopify {
  id: string;
  checkout_id: string;
  email: string | null;
  total_price: number;
  currency: string | null;
  abandoned_checkout_url: string | null;
  recovered: boolean;
  recovered_at: string | null;
  line_items_count: number;
  utm_source: string | null;
  utm_campaign: string | null;
  carrinho_criado_em: string;
}

export interface ProdutoMaisVendido {
  produto_id: string;
  nome: string;
  sku: string | null;
  total_vendido: number;
  receita_total: number;
}

export interface StatsLojaShopify {
  total_pedidos: number;
  pedidos_pagos: number;
  pedidos_cancelados: number;
  faturamento_bruto: number;
  faturamento_liquido: number; // descontos descontados
  ticket_medio: number;
  total_clientes: number;
  novos_clientes: number;
  recorrentes: number;
  taxa_recompra: number;
  carrinhos_abandonados: number;
  valor_carrinhos_abandonados: number;
  taxa_abandono: number; // carrinhos / (carrinhos + pedidos)
  // Breakdown por fonte
  por_utm_source: Array<{ source: string; pedidos: number; receita: number }>;
}

// ==================== STATS AGREGADOS ====================

export async function statsLojaShopify(
  clienteId: string,
  daysBack: number = 30
): Promise<StatsLojaShopify> {
  const fallback: StatsLojaShopify = {
    total_pedidos: 0,
    pedidos_pagos: 0,
    pedidos_cancelados: 0,
    faturamento_bruto: 0,
    faturamento_liquido: 0,
    ticket_medio: 0,
    total_clientes: 0,
    novos_clientes: 0,
    recorrentes: 0,
    taxa_recompra: 0,
    carrinhos_abandonados: 0,
    valor_carrinhos_abandonados: 0,
    taxa_abandono: 0,
    por_utm_source: [],
  };

  try {
    const supabase = await createClient();
    const desde = new Date(Date.now() - daysBack * 86400000).toISOString();

    const { data: pedidos } = await supabase
      .schema("trafego_ddg")
      .from("shopify_pedidos")
      .select(
        "total_price, total_discounts, financial_status, cancelado_em, customer_id, utm_source, pedido_criado_em"
      )
      .eq("cliente_id", clienteId)
      .gte("pedido_criado_em", desde);

    const lista = pedidos ?? [];
    const ativos = lista.filter((p) => !p.cancelado_em);
    const pagos = ativos.filter(
      (p) =>
        p.financial_status === "paid" ||
        p.financial_status === "partially_paid" ||
        p.financial_status === "authorized"
    );

    const faturamentoBruto = pagos.reduce(
      (s, p) => s + Number(p.total_price ?? 0),
      0
    );
    const totalDesc = pagos.reduce(
      (s, p) => s + Number(p.total_discounts ?? 0),
      0
    );
    const faturamentoLiquido = faturamentoBruto - totalDesc;
    const ticketMedio = pagos.length > 0 ? faturamentoBruto / pagos.length : 0;

    // Clientes únicos
    const customers = new Set<string>();
    for (const p of pagos) if (p.customer_id) customers.add(p.customer_id);

    // Carrinhos abandonados
    const { data: carrinhos } = await supabase
      .schema("trafego_ddg")
      .from("shopify_carrinhos_abandonados")
      .select("total_price, recovered")
      .eq("cliente_id", clienteId)
      .gte("carrinho_criado_em", desde);
    const carrinhosLista = carrinhos ?? [];
    const carrinhosNaoRecuperados = carrinhosLista.filter((c) => !c.recovered);
    const valorCarrinhos = carrinhosNaoRecuperados.reduce(
      (s, c) => s + Number(c.total_price ?? 0),
      0
    );

    // Novos vs recorrentes (precisa olhar tabela shopify_clientes)
    const { data: shopCustomers } = await supabase
      .schema("trafego_ddg")
      .from("shopify_clientes")
      .select("customer_id, orders_count, cliente_criado_em")
      .eq("cliente_id", clienteId)
      .in("customer_id", customers.size ? Array.from(customers) : ["___"]);

    let novos = 0;
    let recorrentes = 0;
    for (const c of shopCustomers ?? []) {
      if ((c.orders_count ?? 0) > 1) recorrentes++;
      else novos++;
    }
    const taxaRecompra =
      customers.size > 0 ? (recorrentes / customers.size) * 100 : 0;

    // Por UTM source
    const porUtmMap = new Map<string, { pedidos: number; receita: number }>();
    for (const p of pagos) {
      const src = p.utm_source ?? "(direto)";
      const prev = porUtmMap.get(src) ?? { pedidos: 0, receita: 0 };
      prev.pedidos++;
      prev.receita += Number(p.total_price ?? 0);
      porUtmMap.set(src, prev);
    }
    const porUtm = Array.from(porUtmMap.entries())
      .map(([source, v]) => ({ source, ...v }))
      .sort((a, b) => b.receita - a.receita);

    const carrinhosTotal = carrinhosLista.length;
    const denominadorAbandono = carrinhosTotal + ativos.length;
    const taxaAbandono =
      denominadorAbandono > 0 ? (carrinhosTotal / denominadorAbandono) * 100 : 0;

    return {
      total_pedidos: ativos.length,
      pedidos_pagos: pagos.length,
      pedidos_cancelados: lista.length - ativos.length,
      faturamento_bruto: Number(faturamentoBruto.toFixed(2)),
      faturamento_liquido: Number(faturamentoLiquido.toFixed(2)),
      ticket_medio: Number(ticketMedio.toFixed(2)),
      total_clientes: customers.size,
      novos_clientes: novos,
      recorrentes,
      taxa_recompra: Number(taxaRecompra.toFixed(2)),
      carrinhos_abandonados: carrinhosTotal,
      valor_carrinhos_abandonados: Number(valorCarrinhos.toFixed(2)),
      taxa_abandono: Number(taxaAbandono.toFixed(2)),
      por_utm_source: porUtm.slice(0, 8),
    };
  } catch (err) {
    console.error("statsLojaShopify exception:", err);
    return fallback;
  }
}

// ==================== LIST PEDIDOS ====================

export async function listarPedidosShopify(
  clienteId: string,
  limit: number = 50
): Promise<PedidoShopify[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .schema("trafego_ddg")
      .from("shopify_pedidos")
      .select(
        "id, cliente_id, pedido_id, numero, nome, email, customer_id, total_price, subtotal_price, total_discounts, total_shipping, currency, financial_status, fulfillment_status, source_name, utm_source, utm_medium, utm_campaign, tags, line_items_count, cancelado_em, pedido_criado_em"
      )
      .eq("cliente_id", clienteId)
      .order("pedido_criado_em", { ascending: false })
      .limit(limit);
    if (error) {
      console.error("listarPedidosShopify:", error);
      return [];
    }
    return (data ?? []).map((p) => ({
      ...p,
      total_price: Number(p.total_price ?? 0),
      subtotal_price: Number(p.subtotal_price ?? 0),
      total_discounts: Number(p.total_discounts ?? 0),
      total_shipping: Number(p.total_shipping ?? 0),
    })) as PedidoShopify[];
  } catch (err) {
    console.error("listarPedidosShopify exception:", err);
    return [];
  }
}

// ==================== CARRINHOS ====================

export async function listarCarrinhosAbandonados(
  clienteId: string,
  apenasNaoRecuperados: boolean = true,
  limit: number = 50
): Promise<CarrinhoAbandonadoShopify[]> {
  try {
    const supabase = await createClient();
    let query = supabase
      .schema("trafego_ddg")
      .from("shopify_carrinhos_abandonados")
      .select(
        "id, checkout_id, email, total_price, currency, abandoned_checkout_url, recovered, recovered_at, line_items_count, utm_source, utm_campaign, carrinho_criado_em"
      )
      .eq("cliente_id", clienteId);
    if (apenasNaoRecuperados) query = query.eq("recovered", false);
    const { data, error } = await query
      .order("carrinho_criado_em", { ascending: false })
      .limit(limit);
    if (error) {
      console.error("listarCarrinhosAbandonados:", error);
      return [];
    }
    return (data ?? []).map((c) => ({
      ...c,
      total_price: Number(c.total_price ?? 0),
    })) as CarrinhoAbandonadoShopify[];
  } catch (err) {
    console.error("listarCarrinhosAbandonados exception:", err);
    return [];
  }
}

// ==================== PRODUTOS MAIS VENDIDOS ====================

export async function topProdutosShopify(
  clienteId: string,
  limit: number = 10
): Promise<ProdutoMaisVendido[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .schema("trafego_ddg")
      .from("shopify_produtos_vendidos")
      .select("produto_id, nome, sku, total_vendido, receita_total")
      .eq("cliente_id", clienteId)
      .order("receita_total", { ascending: false })
      .limit(limit);
    if (error) {
      console.error("topProdutosShopify:", error);
      return [];
    }
    return (data ?? []).map((p) => ({
      ...p,
      total_vendido: Number(p.total_vendido ?? 0),
      receita_total: Number(p.receita_total ?? 0),
    })) as ProdutoMaisVendido[];
  } catch (err) {
    console.error("topProdutosShopify exception:", err);
    return [];
  }
}

// ==================== CONEXÃO (custom app) ====================

const conectarSchema = z.object({
  cliente_id: z.string().uuid(),
  shop_domain: z.string().min(3).max(200),
  access_token: z.string().min(20).max(500),
});

export async function conectarShopify(input: {
  cliente_id: string;
  shop_domain: string;
  access_token: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = conectarSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  try {
    const supabase = await createClient();

    // Valida fazendo uma chamada simples na Shopify (shop.json)
    const domainNorm = parsed.data.shop_domain
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/\/.*$/, "");
    const fullDomain = domainNorm.includes(".")
      ? domainNorm
      : `${domainNorm}.myshopify.com`;

    const testRes = await fetch(
      `https://${fullDomain}/admin/api/2024-10/shop.json`,
      {
        headers: {
          "X-Shopify-Access-Token": parsed.data.access_token,
          "Content-Type": "application/json",
        },
      }
    );

    if (!testRes.ok) {
      const txt = await testRes.text();
      return {
        ok: false,
        error: `Shopify rejeitou (${testRes.status}): ${txt.slice(0, 200)}`,
      };
    }

    // Persiste
    const { error } = await supabase
      .schema("trafego_ddg")
      .from("clientes_acessos")
      .upsert({
        cliente_id: parsed.data.cliente_id,
        shopify_shop_domain: fullDomain,
        shopify_access_token: parsed.data.access_token,
        status_shopify: "conectado",
        shopify_ultimo_erro: null,
      });

    if (error) return { ok: false, error: error.message };

    revalidatePath("/clientes");
    revalidatePath(`/clientes/${parsed.data.cliente_id}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

export async function desconectarShopify(clienteId: string) {
  const supabase = await createClient();
  await supabase
    .schema("trafego_ddg")
    .from("clientes_acessos")
    .update({
      shopify_shop_domain: null,
      shopify_access_token: null,
      status_shopify: "nao_conectado",
      ultima_sync_shopify: null,
      shopify_ultimo_erro: null,
    })
    .eq("cliente_id", clienteId);
  revalidatePath("/clientes");
}

export async function dispararSyncShopify(
  clienteId: string,
  daysBack: number = 60
): Promise<{ ok: true; resultado: unknown } | { ok: false; error: string }> {
  try {
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/sync-shopify`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cliente_id: clienteId, days_back: daysBack }),
    });
    if (!res.ok) {
      const txt = await res.text();
      return { ok: false, error: `Edge function ${res.status}: ${txt.slice(0, 300)}` };
    }
    const json = await res.json();
    revalidatePath("/dashboard");
    revalidatePath("/carrinho-abandonado");
    return { ok: true, resultado: json };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}
