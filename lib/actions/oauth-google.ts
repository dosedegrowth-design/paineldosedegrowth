"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import crypto from "node:crypto";

/**
 * Google Ads OAuth 2.0 flow.
 * Doc: https://developers.google.com/google-ads/api/docs/oauth/overview
 *
 * Fluxo:
 * 1. Usuário clica "Conectar Google" → server action gera state + redirect URL
 * 2. Browser → accounts.google.com/o/oauth2/v2/auth com state
 * 3. Google redireciona pra /api/oauth/google/callback?code=...&state=cliente_id
 * 4. Callback troca code por refresh_token, valida customer_id contra MCC, salva no Supabase
 */

const GOOGLE_CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
const GOOGLE_LOGIN_CUSTOMER_ID = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://paineldosedegrowth.vercel.app";

const REDIRECT_URI = `${APP_URL}/api/oauth/google/callback`;
const REQUIRED_SCOPES = ["https://www.googleapis.com/auth/adwords"].join(" ");

export async function iniciarOAuthGoogle(
  clienteId: string,
  origem: "wizard" | "configuracoes" = "configuracoes",
  modo: "popup" | "redirect" = "redirect"
): Promise<{ ok: boolean; url?: string; error?: string }> {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return {
      ok: false,
      error: "GOOGLE_OAUTH_CLIENT_ID/SECRET não configurados nas env vars do Vercel.",
    };
  }

  // State: cliente_id.origem.modo.nonce — valida CSRF, destino e modo de retorno
  const nonce = crypto.randomBytes(8).toString("hex");
  const state = `${clienteId}.${origem}.${modo}.${nonce}`;

  // Salva state pra validar no callback
  const supabase = await createClient();
  await supabase
    .schema("trafego_ddg")
    .from("clientes_acessos")
    .update({
      google_ultimo_erro: `oauth_state:${state}`,
    })
    .eq("cliente_id", clienteId);

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: REQUIRED_SCOPES,
    access_type: "offline",
    prompt: "consent",
    state,
  });

  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  return { ok: true, url };
}

/**
 * Troca code por refresh_token, busca customer ID acessível, salva no Supabase.
 */
export async function trocarCodeGoogle(params: {
  code: string;
  state: string;
}): Promise<{ ok: boolean; clienteId?: string; origem?: string; modo?: string; error?: string }> {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return { ok: false, error: "Google OAuth não configurado" };
  }

  // Validar state: cliente_id.origem.modo.nonce (4 partes) ou cliente_id.origem.nonce (legado)
  const partes = params.state.split(".");
  if (partes.length < 3) return { ok: false, error: "State inválido" };
  const clienteId = partes[0];
  const origem = partes[1];
  const modo = partes.length === 4 ? partes[2] : "redirect";

  const supabase = await createClient();
  const { data: acesso } = await supabase
    .schema("trafego_ddg")
    .from("clientes_acessos")
    .select("google_ultimo_erro")
    .eq("cliente_id", clienteId)
    .single();

  if (!acesso || acesso.google_ultimo_erro !== `oauth_state:${params.state}`) {
    return { ok: false, error: "State não corresponde — possível CSRF" };
  }

  try {
    // 1. Trocar code por tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: params.code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      return { ok: false, error: `Token exchange falhou: ${errText.slice(0, 200)}` };
    }

    const tokens = (await tokenRes.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in: number;
      scope: string;
      token_type: string;
    };

    if (!tokens.refresh_token) {
      return {
        ok: false,
        error: "Google não retornou refresh_token. Revogue acesso e tente novamente.",
      };
    }

    // 2. Buscar customer IDs acessíveis (sob a MCC ou diretos)
    let customerId: string | null = null;
    if (GOOGLE_LOGIN_CUSTOMER_ID) {
      // Lista contas acessíveis pra esse usuário OAuth
      const listRes = await fetch(
        "https://googleads.googleapis.com/v17/customers:listAccessibleCustomers",
        {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
            "developer-token": process.env.GOOGLE_ADS_DEVELOPER_TOKEN ?? "",
          },
        }
      );
      if (listRes.ok) {
        const listData = (await listRes.json()) as { resourceNames?: string[] };
        // resourceNames vêm como ["customers/1234567890", ...]
        // Pega primeiro que NÃO seja a MCC (queremos a conta cliente)
        const ids = (listData.resourceNames ?? [])
          .map((rn) => rn.replace("customers/", ""))
          .filter((id) => id !== GOOGLE_LOGIN_CUSTOMER_ID);
        customerId = ids[0] ?? null;
      }
      // Se não conseguiu listar (developer token em test mode), salva mesmo assim
    }

    // 3. Salvar
    const { error } = await supabase
      .schema("trafego_ddg")
      .from("clientes_acessos")
      .update({
        google_oauth_refresh_token: tokens.refresh_token,
        google_customer_id: customerId,
        google_login_customer_id: GOOGLE_LOGIN_CUSTOMER_ID ?? null,
        status_google: "conectado",
        google_ultimo_erro: null,
        ultima_sync_google: new Date().toISOString(),
      })
      .eq("cliente_id", clienteId);

    if (error) return { ok: false, error: error.message };

    revalidatePath("/clientes");
    return { ok: true, clienteId, origem, modo };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

export async function googleOAuthConfigurado(): Promise<boolean> {
  return !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET);
}
