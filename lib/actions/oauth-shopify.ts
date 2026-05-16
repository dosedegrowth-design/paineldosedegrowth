"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import crypto from "node:crypto";

/**
 * Shopify OAuth 2.0 flow.
 * Doc: https://shopify.dev/docs/apps/build/authentication-authorization/access-tokens/authorization-code-grant
 *
 * Fluxo:
 * 1. Painel DDG → botão "Conectar via Shopify" → server action gera state + redirect URL
 * 2. Browser → {shop}.myshopify.com/admin/oauth/authorize?client_id&scope&redirect_uri&state
 * 3. Shopify redireciona pra /api/oauth/shopify/callback?code=...&state=...&shop=...&hmac=...
 * 4. Callback valida HMAC, troca code por access_token (não-expirante), salva no Supabase
 */

const SHOPIFY_APP_CLIENT_ID = process.env.SHOPIFY_APP_CLIENT_ID;
const SHOPIFY_APP_CLIENT_SECRET = process.env.SHOPIFY_APP_CLIENT_SECRET;
const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://paineldosedegrowth.vercel.app";

const REDIRECT_URI = `${APP_URL}/api/oauth/shopify/callback`;
const REQUIRED_SCOPES = [
  "read_orders",
  "read_products",
  "read_customers",
  "read_checkouts",
].join(",");

function normalizeDomain(domain: string): string {
  let d = domain.trim().toLowerCase();
  d = d.replace(/^https?:\/\//, "");
  d = d.replace(/\/.*$/, "");
  if (!d.includes(".")) d = `${d}.myshopify.com`;
  return d;
}

export async function iniciarOAuthShopify(
  clienteId: string,
  shopDomain: string,
  origem: "wizard" | "configuracoes" = "configuracoes",
  modo: "popup" | "redirect" = "redirect"
): Promise<{ ok: boolean; url?: string; error?: string }> {
  if (!SHOPIFY_APP_CLIENT_ID) {
    return {
      ok: false,
      error:
        "SHOPIFY_APP_CLIENT_ID não configurado nas env vars. Adicione no Vercel/painel.",
    };
  }

  if (!shopDomain.trim()) {
    return { ok: false, error: "Informe o domínio da loja Shopify" };
  }

  const domain = normalizeDomain(shopDomain);

  // Valida formato shopify
  if (!domain.endsWith(".myshopify.com")) {
    return {
      ok: false,
      error: `Domínio inválido: ${domain}. Deve ser xxxxx.myshopify.com`,
    };
  }

  // State: cliente_id.origem.modo.nonce (mesmo padrão do Meta)
  const nonce = crypto.randomBytes(8).toString("hex");
  const state = `${clienteId}.${origem}.${modo}.${nonce}`;

  // Salva state no banco (reusa campo de erro como prévia)
  const supabase = await createClient();
  await supabase
    .schema("trafego_ddg")
    .from("clientes_acessos")
    .update({
      shopify_shop_domain: domain,
      shopify_ultimo_erro: `oauth_state:${state}`,
    })
    .eq("cliente_id", clienteId);

  const params = new URLSearchParams({
    client_id: SHOPIFY_APP_CLIENT_ID,
    scope: REQUIRED_SCOPES,
    redirect_uri: REDIRECT_URI,
    state,
    // Custom Apps no Dev Dashboard usam grant_options[]=per-user (sem refresh)
    // Default é offline access (token não expira) — não passamos grant_options
  });

  const url = `https://${domain}/admin/oauth/authorize?${params.toString()}`;
  return { ok: true, url };
}

/**
 * Valida HMAC vindo do Shopify (anti-CSRF).
 * Doc: https://shopify.dev/docs/apps/build/authentication-authorization/access-tokens/authorization-code-grant#step-3-verify-the-installation-request
 */
function validarHmac(params: URLSearchParams): boolean {
  if (!SHOPIFY_APP_CLIENT_SECRET) return false;
  const hmac = params.get("hmac");
  if (!hmac) return false;

  // Remove hmac e ordena demais params
  const filtered: [string, string][] = [];
  params.forEach((value, key) => {
    if (key !== "hmac" && key !== "signature") {
      filtered.push([key, value]);
    }
  });
  filtered.sort(([a], [b]) => a.localeCompare(b));
  const message = filtered.map(([k, v]) => `${k}=${v}`).join("&");

  const hash = crypto
    .createHmac("sha256", SHOPIFY_APP_CLIENT_SECRET)
    .update(message)
    .digest("hex");

  // Constant-time compare
  if (hash.length !== hmac.length) return false;
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(hmac));
}

/**
 * Troca o code por access_token permanente.
 * Chamado no /api/oauth/shopify/callback.
 */
export async function trocarCodeShopify(params: {
  code: string;
  state: string;
  shop: string;
  hmac: string;
  rawUrl: string;
}): Promise<{
  ok: boolean;
  clienteId?: string;
  origem?: string;
  modo?: string;
  error?: string;
}> {
  if (!SHOPIFY_APP_CLIENT_ID || !SHOPIFY_APP_CLIENT_SECRET) {
    return { ok: false, error: "Shopify App não configurado" };
  }

  try {
    // 1. Valida state (CSRF + descobre cliente_id)
    const partes = params.state.split(".");
    if (partes.length !== 4) {
      return { ok: false, error: "State inválido" };
    }
    const [clienteId, origem, modo] = partes;

    const supabase = await createClient();
    const { data: acesso } = await supabase
      .schema("trafego_ddg")
      .from("clientes_acessos")
      .select("shopify_ultimo_erro, shopify_shop_domain")
      .eq("cliente_id", clienteId)
      .single();

    if (acesso?.shopify_ultimo_erro !== `oauth_state:${params.state}`) {
      return { ok: false, error: "State não bate (CSRF). Tente novamente." };
    }

    // 2. Valida HMAC
    const url = new URL(params.rawUrl);
    if (!validarHmac(url.searchParams)) {
      return { ok: false, error: "HMAC inválido — request não veio do Shopify" };
    }

    // 3. Valida shop domain
    const shopDomain = normalizeDomain(params.shop);
    if (!shopDomain.endsWith(".myshopify.com")) {
      return { ok: false, error: "Shop domain inválido" };
    }

    // 4. Troca code por access_token
    const tokenRes = await fetch(
      `https://${shopDomain}/admin/oauth/access_token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: SHOPIFY_APP_CLIENT_ID,
          client_secret: SHOPIFY_APP_CLIENT_SECRET,
          code: params.code,
        }),
      }
    );

    if (!tokenRes.ok) {
      const txt = await tokenRes.text();
      return {
        ok: false,
        error: `Shopify ${tokenRes.status}: ${txt.slice(0, 200)}`,
      };
    }

    const tokenData = (await tokenRes.json()) as {
      access_token: string;
      scope: string;
    };

    if (!tokenData.access_token) {
      return { ok: false, error: "Token não retornado pelo Shopify" };
    }

    // 5. Persiste no banco
    const { error: upErr } = await supabase
      .schema("trafego_ddg")
      .from("clientes_acessos")
      .update({
        shopify_shop_domain: shopDomain,
        shopify_access_token: tokenData.access_token,
        status_shopify: "conectado",
        shopify_ultimo_erro: null,
      })
      .eq("cliente_id", clienteId);

    if (upErr) {
      return { ok: false, error: `Erro ao salvar: ${upErr.message}` };
    }

    // 6. Dispara sync inicial em background
    fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/sync-shopify`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cliente_id: clienteId, days_back: 60 }),
      }
    ).catch((e) => console.error("sync-shopify trigger fail:", e));

    revalidatePath("/clientes");
    revalidatePath(`/clientes/${clienteId}`);
    revalidatePath("/dashboard");

    return { ok: true, clienteId, origem, modo };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}
