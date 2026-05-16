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

    // 2. Buscar TODAS contas Google Ads acessíveis (sob MCC ou diretas)
    const customers: GoogleCustomer[] = [];
    const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN ?? "";
    let listError: string | null = null;
    let customerIds: string[] = [];

    const listRes = await fetch(
      "https://googleads.googleapis.com/v23/customers:listAccessibleCustomers",
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
          "developer-token": developerToken,
        },
      }
    );

    if (listRes.ok) {
      const listData = (await listRes.json()) as { resourceNames?: string[] };
      customerIds = (listData.resourceNames ?? []).map((rn) =>
        rn.replace("customers/", "")
      );
    } else {
      const errText = await listRes.text();
      listError = `listAccessibleCustomers ${listRes.status}: ${errText.slice(0, 300)}`;
      console.error("[oauth-google]", listError);
    }

    // Se a API retornou contas, busca metadata de cada uma
    if (customerIds.length > 0) {

      // Para cada customer, buscar metadata via SearchStream
      for (const cid of customerIds.slice(0, 50)) {
        try {
          const metaRes = await fetch(
            `https://googleads.googleapis.com/v23/customers/${cid}/googleAds:search`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${tokens.access_token}`,
                "developer-token": developerToken,
                "Content-Type": "application/json",
                ...(GOOGLE_LOGIN_CUSTOMER_ID
                  ? { "login-customer-id": GOOGLE_LOGIN_CUSTOMER_ID }
                  : {}),
              },
              body: JSON.stringify({
                query: `SELECT customer.id, customer.descriptive_name, customer.currency_code, customer.time_zone, customer.manager, customer.test_account, customer.status FROM customer LIMIT 1`,
              }),
            }
          );
          if (metaRes.ok) {
            const metaData = (await metaRes.json()) as {
              results?: Array<{
                customer?: {
                  id?: string;
                  descriptiveName?: string;
                  currencyCode?: string;
                  timeZone?: string;
                  manager?: boolean;
                  testAccount?: boolean;
                  status?: string;
                };
              }>;
            };
            const cust = metaData.results?.[0]?.customer;
            if (cust) {
              customers.push({
                id: cust.id ?? cid,
                name: cust.descriptiveName ?? `Conta ${cid}`,
                currency: cust.currencyCode ?? null,
                time_zone: cust.timeZone ?? null,
                manager: !!cust.manager,
                test_account: !!cust.testAccount,
                status: cust.status ?? "UNKNOWN",
              });
            } else {
              customers.push({
                id: cid,
                name: `Conta ${cid}`,
                currency: null,
                time_zone: null,
                manager: false,
                test_account: false,
                status: "UNKNOWN",
              });
            }
          } else {
            // Falha individual: salva sem metadata
            customers.push({
              id: cid,
              name: `Conta ${cid}`,
              currency: null,
              time_zone: null,
              manager: false,
              test_account: false,
              status: "UNKNOWN",
            });
          }
        } catch {
          customers.push({
            id: cid,
            name: `Conta ${cid}`,
            currency: null,
            time_zone: null,
            manager: false,
            test_account: false,
            status: "UNKNOWN",
          });
        }
      }
    }

    // SEMPRE mostra modal de seleção (mesmo com 1 conta) pro user confirmar
    // qual conta usar — evita auto-select silencioso de conta errada
    const recursosDisponiveis = { customers, listError };

    // 3. Salvar — status sempre aguardando_selecao até user confirmar
    // Frontend abre modal e chama selecionarRecursoGoogle() pra finalizar
    const { error } = await supabase
      .schema("trafego_ddg")
      .from("clientes_acessos")
      .update({
        google_oauth_refresh_token: tokens.refresh_token,
        google_customer_id: null, // só preenche quando user confirmar no modal
        google_login_customer_id: GOOGLE_LOGIN_CUSTOMER_ID ?? null,
        google_recursos_disponiveis: recursosDisponiveis,
        status_google: "aguardando_selecao",
        google_ultimo_erro: listError,
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

// ==================== TIPOS + SERVER ACTIONS PARA SELEÇÃO ====================

export interface GoogleCustomer {
  id: string;
  name: string;
  currency: string | null;
  time_zone: string | null;
  manager: boolean;
  test_account: boolean;
  status: string;
}

export interface GoogleRecursosDisponiveis {
  customers: GoogleCustomer[];
  listError?: string | null;
}

export async function getGoogleRecursosDisponiveis(
  clienteId: string
): Promise<GoogleRecursosDisponiveis | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .schema("trafego_ddg")
    .from("clientes_acessos")
    .select("google_recursos_disponiveis")
    .eq("cliente_id", clienteId)
    .single();
  return (data?.google_recursos_disponiveis as GoogleRecursosDisponiveis) ?? null;
}

export async function selecionarRecursoGoogle(input: {
  clienteId: string;
  customerId: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (!input.clienteId || !input.customerId) {
    return { ok: false, error: "Cliente ID e Customer ID são obrigatórios" };
  }
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .schema("trafego_ddg")
      .from("clientes_acessos")
      .update({
        google_customer_id: input.customerId,
        status_google: "conectado",
        google_ultimo_erro: null,
      })
      .eq("cliente_id", input.clienteId);
    if (error) return { ok: false, error: error.message };

    revalidatePath("/clientes");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}
