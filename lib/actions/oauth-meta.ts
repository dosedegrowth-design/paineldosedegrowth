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
  origem: "wizard" | "configuracoes" = "configuracoes"
): Promise<{ ok: boolean; url?: string; error?: string }> {
  if (!META_APP_ID) {
    return {
      ok: false,
      error:
        "META_APP_ID não configurado nas env vars. Configure em /configuracoes ou adicione no Vercel.",
    };
  }

  // State: cliente_id.origem.nonce — valida CSRF e identifica destino do callback
  const nonce = crypto.randomBytes(8).toString("hex");
  const state = `${clienteId}.${origem}.${nonce}`;

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
}): Promise<{ ok: boolean; clienteId?: string; origem?: string; error?: string }> {
  if (!META_APP_ID || !META_APP_SECRET) {
    return { ok: false, error: "Meta App não configurado" };
  }

  // Validar state — formato novo: cliente_id.origem.nonce ; legado: cliente_id.nonce
  const partes = params.state.split(".");
  if (partes.length < 2) return { ok: false, error: "State inválido" };
  const clienteId = partes[0];
  // Se tem 3 partes, segunda é origem; se tem 2, é state legado (= configuracoes)
  const origem = partes.length === 3 ? partes[1] : "configuracoes";
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

    // 3. Buscar primeira ad account (cliente DDG seleciona depois se tiver várias)
    const adAccRes = await fetch(
      `https://graph.facebook.com/v22.0/me/adaccounts?fields=id,name,account_status&access_token=${longData.access_token}`
    );
    let adAccountId: string | null = null;
    if (adAccRes.ok) {
      const adAccData = (await adAccRes.json()) as {
        data: Array<{ id: string; name: string; account_status: number }>;
      };
      // Pega primeira ativa
      const ativa = adAccData.data.find((a) => a.account_status === 1);
      adAccountId = ativa?.id ?? adAccData.data[0]?.id ?? null;
    }

    // 4. Salvar
    const { error } = await supabase
      .schema("trafego_ddg")
      .from("clientes_acessos")
      .update({
        meta_long_lived_token: longData.access_token,
        meta_ad_account_id: adAccountId,
        status_meta: "conectado",
        meta_ultimo_erro: null,
        ultima_sync_meta: new Date().toISOString(),
      })
      .eq("cliente_id", clienteId);

    if (error) return { ok: false, error: error.message };

    revalidatePath("/clientes");
    return { ok: true, clienteId, origem };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

export async function metaAppConfigurado(): Promise<boolean> {
  return !!(META_APP_ID && META_APP_SECRET);
}
