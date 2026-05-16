"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import crypto from "node:crypto";

/**
 * Meta OAuth 2.0 flow.
 * Doc: https://developers.facebook.com/docs/facebook-login/guides/advanced/manual-flow
 *
 * Fluxo:
 * 1. /clientes/[slug] → botão "Conectar via Facebook" → server action gera state + redirect URL
 * 2. Browser → facebook.com/dialog/oauth com state
 * 3. Facebook redireciona pra /api/oauth/meta/callback?code=...&state=cliente_id
 * 4. Callback troca code por access_token, lista ad accounts, salva no Supabase
 */

const META_APP_ID = process.env.META_APP_ID;
const META_APP_SECRET = process.env.META_APP_SECRET;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://paineldosedegrowth.vercel.app";

const REDIRECT_URI = `${APP_URL}/api/oauth/meta/callback`;
const REQUIRED_SCOPES = [
  "ads_management",
  "ads_read",
  "business_management",
  "pages_show_list",
  "read_insights",
].join(",");

export async function iniciarOAuthMeta(
  clienteId: string,
  origem: "wizard" | "configuracoes" = "configuracoes",
  modo: "popup" | "redirect" = "redirect"
): Promise<{ ok: boolean; url?: string; error?: string }> {
  if (!META_APP_ID) {
    return {
      ok: false,
      error:
        "META_APP_ID não configurado nas env vars. Configure em /configuracoes ou adicione no Vercel.",
    };
  }

  // State: cliente_id.origem.modo.nonce — valida CSRF, destino e modo de retorno
  const nonce = crypto.randomBytes(8).toString("hex");
  const state = `${clienteId}.${origem}.${modo}.${nonce}`;

  // Salva state no Supabase pra validar no callback
  const supabase = await createClient();
  await supabase
    .schema("trafego_ddg")
    .from("clientes_acessos")
    .update({
      // Reusa campo (pendente até callback completar)
      meta_ultimo_erro: `oauth_state:${state}`,
    })
    .eq("cliente_id", clienteId);

  const params = new URLSearchParams({
    client_id: META_APP_ID,
    redirect_uri: REDIRECT_URI,
    state,
    scope: REQUIRED_SCOPES,
    response_type: "code",
  });

  const url = `https://www.facebook.com/v22.0/dialog/oauth?${params.toString()}`;
  return { ok: true, url };
}

/**
 * Troca o code por access_token de longa duração.
 * Chamado no /api/oauth/meta/callback.
 */
export async function trocarCodeMeta(params: {
  code: string;
  state: string;
}): Promise<{ ok: boolean; clienteId?: string; origem?: string; modo?: string; error?: string }> {
  if (!META_APP_ID || !META_APP_SECRET) {
    return { ok: false, error: "Meta App não configurado" };
  }

  // Validar state — formato novo: cliente_id.origem.modo.nonce
  // Legado v2: cliente_id.origem.nonce ; Legado v1: cliente_id.nonce
  const partes = params.state.split(".");
  if (partes.length < 2) return { ok: false, error: "State inválido" };
  const clienteId = partes[0];
  let origem = "configuracoes";
  let modo = "redirect";
  if (partes.length === 4) {
    origem = partes[1];
    modo = partes[2];
  } else if (partes.length === 3) {
    origem = partes[1];
  }
  if (!clienteId) return { ok: false, error: "State inválido" };

  const supabase = await createClient();
  const { data: acesso } = await supabase
    .schema("trafego_ddg")
    .from("clientes_acessos")
    .select("meta_ultimo_erro")
    .eq("cliente_id", clienteId)
    .single();

  if (!acesso || acesso.meta_ultimo_erro !== `oauth_state:${params.state}`) {
    return { ok: false, error: "State não corresponde — possível CSRF" };
  }

  try {
    // 1. Trocar code por short-lived token
    const shortRes = await fetch(
      `https://graph.facebook.com/v22.0/oauth/access_token?` +
        new URLSearchParams({
          client_id: META_APP_ID,
          client_secret: META_APP_SECRET,
          redirect_uri: REDIRECT_URI,
          code: params.code,
        })
    );
    if (!shortRes.ok) {
      const errText = await shortRes.text();
      return { ok: false, error: `OAuth falhou: ${errText.slice(0, 200)}` };
    }
    const shortData = (await shortRes.json()) as { access_token: string };

    // 2. Trocar short-lived por long-lived (60 dias)
    const longRes = await fetch(
      `https://graph.facebook.com/v22.0/oauth/access_token?` +
        new URLSearchParams({
          grant_type: "fb_exchange_token",
          client_id: META_APP_ID,
          client_secret: META_APP_SECRET,
          fb_exchange_token: shortData.access_token,
        })
    );
    if (!longRes.ok) {
      const errText = await longRes.text();
      return { ok: false, error: `Long-lived token falhou: ${errText.slice(0, 200)}` };
    }
    const longData = (await longRes.json()) as { access_token: string };

    // 3. Buscar TODOS os recursos disponíveis (ad accounts, pixels, pages)
    const token = longData.access_token;

    // 3a. Ad Accounts
    const adAccRes = await fetch(
      `https://graph.facebook.com/v22.0/me/adaccounts?fields=id,name,account_status,currency,business&limit=200&access_token=${token}`
    );
    const adAccounts: Array<{
      id: string;
      name: string;
      account_status: number;
      currency?: string;
      business?: { id: string; name: string };
    }> = [];
    if (adAccRes.ok) {
      const adAccData = (await adAccRes.json()) as { data: typeof adAccounts };
      adAccounts.push(...(adAccData.data ?? []));
    }

    // 3b. Pixels (de cada ad account ativa)
    const pixels: Array<{ id: string; name: string; ad_account_id: string }> = [];
    const adAccountsAtivas = adAccounts.filter((a) => a.account_status === 1);
    for (const acc of adAccountsAtivas.slice(0, 10)) {
      try {
        const pxRes = await fetch(
          `https://graph.facebook.com/v22.0/${acc.id}/adspixels?fields=id,name&access_token=${token}`
        );
        if (pxRes.ok) {
          const pxData = (await pxRes.json()) as {
            data?: Array<{ id: string; name: string }>;
          };
          for (const p of pxData.data ?? []) {
            pixels.push({ id: p.id, name: p.name, ad_account_id: acc.id });
          }
        }
      } catch (_e) {
        // Ignora pixel fetch errors (alguns BMs bloqueiam, vida segue)
      }
    }

    // 3c. Páginas (Facebook + Instagram conectado)
    const pages: Array<{
      id: string;
      name: string;
      category?: string;
      instagram_business_account?: { id: string };
    }> = [];
    try {
      const pagesRes = await fetch(
        `https://graph.facebook.com/v22.0/me/accounts?fields=id,name,category,instagram_business_account&limit=200&access_token=${token}`
      );
      if (pagesRes.ok) {
        const pagesData = (await pagesRes.json()) as { data: typeof pages };
        pages.push(...(pagesData.data ?? []));
      }
    } catch (_e) {
      // Ignora se user negou permissao de pages
    }

    // SEMPRE mostra modal de seleção pra user confirmar Ad Account/Pixel/Page
    // Evita auto-select silencioso que pode pegar conta errada do Business Manager
    const recursosDisponiveis = {
      ad_accounts: adAccounts,
      pixels,
      pages,
    };

    // 5. Salvar — status aguardando_selecao até user confirmar no modal
    const { error } = await supabase
      .schema("trafego_ddg")
      .from("clientes_acessos")
      .update({
        meta_long_lived_token: token,
        meta_ad_account_id: null,
        meta_pixel_id: null,
        meta_page_id: null,
        meta_recursos_disponiveis: recursosDisponiveis,
        status_meta: "aguardando_selecao",
        meta_ultimo_erro: null,
        ultima_sync_meta: new Date().toISOString(),
      })
      .eq("cliente_id", clienteId);

    if (error) return { ok: false, error: error.message };

    revalidatePath("/clientes");
    return { ok: true, clienteId, origem, modo };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

export async function metaAppConfigurado(): Promise<boolean> {
  return !!(META_APP_ID && META_APP_SECRET);
}

// ==================== SELECAO DE RECURSOS POS-OAUTH ====================

export interface MetaRecursosDisponiveis {
  ad_accounts: Array<{
    id: string;
    name: string;
    account_status: number;
    currency?: string;
    business?: { id: string; name: string };
  }>;
  pixels: Array<{ id: string; name: string; ad_account_id: string }>;
  pages: Array<{
    id: string;
    name: string;
    category?: string;
    instagram_business_account?: { id: string };
  }>;
}

export async function getMetaRecursosDisponiveis(
  clienteId: string
): Promise<MetaRecursosDisponiveis | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .schema("trafego_ddg")
    .from("clientes_acessos")
    .select("meta_recursos_disponiveis")
    .eq("cliente_id", clienteId)
    .single();
  return (data?.meta_recursos_disponiveis as MetaRecursosDisponiveis) ?? null;
}

export async function selecionarRecursosMeta(input: {
  clienteId: string;
  adAccountId: string;
  pixelId?: string | null;
  businessId?: string | null;
  pageId?: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  if (!input.clienteId || !input.adAccountId) {
    return { ok: false, error: "Cliente ID e Ad Account ID são obrigatórios" };
  }
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .schema("trafego_ddg")
      .from("clientes_acessos")
      .update({
        meta_ad_account_id: input.adAccountId,
        meta_pixel_id: input.pixelId ?? null,
        meta_business_id: input.businessId ?? null,
        meta_page_id: input.pageId ?? null,
        status_meta: "conectado",
        meta_ultimo_erro: null,
      })
      .eq("cliente_id", input.clienteId);
    if (error) return { ok: false, error: error.message };

    revalidatePath("/clientes");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}
