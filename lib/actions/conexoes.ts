"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import crypto from "node:crypto";

// ==================== META ADS ====================

const MetaConfigSchema = z.object({
  cliente_id: z.string().uuid(),
  ad_account_id: z.string().regex(/^act_\d+$/, 'Formato esperado: "act_123456789"'),
  pixel_id: z.string().regex(/^\d+$/, "Pixel ID deve ser numérico"),
  business_id: z.string().optional().nullable(),
  long_lived_token: z.string().min(20, "Token muito curto").optional().nullable(),
  conversion_action_id: z.string().optional().nullable(),
});

export async function configurarMeta(
  input: z.input<typeof MetaConfigSchema>
): Promise<{ ok: boolean; error?: string }> {
  const parsed = MetaConfigSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors.map((e) => e.message).join(", ") };
  }

  const supabase = await createClient();
  const newStatus = parsed.data.long_lived_token ? "pendente" : "nao_conectado";

  const { error } = await supabase
    .schema("trafego_ddg")
    .from("clientes_acessos")
    .update({
      meta_ad_account_id: parsed.data.ad_account_id,
      meta_pixel_id: parsed.data.pixel_id,
      meta_business_id: parsed.data.business_id,
      meta_long_lived_token: parsed.data.long_lived_token,
      meta_conversion_action_id: parsed.data.conversion_action_id,
      status_meta: newStatus,
      meta_ultimo_erro: null,
    })
    .eq("cliente_id", parsed.data.cliente_id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/clientes");
  return { ok: true };
}

export async function testarConexaoMeta(
  clienteId: string
): Promise<{ ok: boolean; error?: string; mensagem?: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .schema("trafego_ddg")
    .from("clientes_acessos")
    .select("meta_ad_account_id, meta_long_lived_token")
    .eq("cliente_id", clienteId)
    .single();

  if (error || !data) return { ok: false, error: "Cliente não encontrado" };
  if (!data.meta_ad_account_id || !data.meta_long_lived_token) {
    return { ok: false, error: "Configure ad_account_id e token primeiro" };
  }

  // TODO Fase 1: chamar Meta API real
  // const url = `https://graph.facebook.com/v22.0/${data.meta_ad_account_id}?fields=name,account_status&access_token=${data.meta_long_lived_token}`;
  // const res = await fetch(url);
  // if (!res.ok) {
  //   await supabase.schema("trafego_ddg").from("clientes_acessos").update({
  //     status_meta: "erro",
  //     meta_ultimo_erro: await res.text(),
  //   }).eq("cliente_id", clienteId);
  //   return { ok: false, error: "Token inválido ou ad account inacessível" };
  // }

  // Simulação no MVP
  await supabase
    .schema("trafego_ddg")
    .from("clientes_acessos")
    .update({
      status_meta: "conectado",
      meta_ultimo_erro: null,
    })
    .eq("cliente_id", clienteId);

  revalidatePath("/clientes");
  return {
    ok: true,
    mensagem: "Conexão validada (modo simulação no MVP — chamada real ativada na Fase 1)",
  };
}

// ==================== GOOGLE ADS ====================

const GoogleConfigSchema = z.object({
  cliente_id: z.string().uuid(),
  customer_id: z.string().regex(/^\d{3}-\d{3}-\d{4}$|^\d{10}$/, 'Formato: "123-456-7890" ou "1234567890"'),
  login_customer_id: z.string().optional().nullable(),
  oauth_refresh_token: z.string().min(20).optional().nullable(),
  conversion_action_id: z.string().optional().nullable(),
});

export async function configurarGoogle(
  input: z.input<typeof GoogleConfigSchema>
): Promise<{ ok: boolean; error?: string }> {
  const parsed = GoogleConfigSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors.map((e) => e.message).join(", ") };
  }

  const supabase = await createClient();
  const newStatus = parsed.data.oauth_refresh_token ? "pendente" : "nao_conectado";

  const { error } = await supabase
    .schema("trafego_ddg")
    .from("clientes_acessos")
    .update({
      google_customer_id: parsed.data.customer_id.replace(/-/g, ""),
      google_login_customer_id: parsed.data.login_customer_id,
      google_oauth_refresh_token: parsed.data.oauth_refresh_token,
      google_conversion_action_id: parsed.data.conversion_action_id,
      status_google: newStatus,
      google_ultimo_erro: null,
    })
    .eq("cliente_id", parsed.data.cliente_id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/clientes");
  return { ok: true };
}

export async function testarConexaoGoogle(
  clienteId: string
): Promise<{ ok: boolean; error?: string; mensagem?: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .schema("trafego_ddg")
    .from("clientes_acessos")
    .select("google_customer_id, google_oauth_refresh_token")
    .eq("cliente_id", clienteId)
    .single();

  if (error || !data) return { ok: false, error: "Cliente não encontrado" };
  if (!data.google_customer_id || !data.google_oauth_refresh_token) {
    return { ok: false, error: "Configure customer_id e refresh_token primeiro" };
  }

  // TODO Fase 1: OAuth refresh + chamada Google Ads API real

  await supabase
    .schema("trafego_ddg")
    .from("clientes_acessos")
    .update({
      status_google: "conectado",
      google_ultimo_erro: null,
    })
    .eq("cliente_id", clienteId);

  revalidatePath("/clientes");
  return {
    ok: true,
    mensagem: "Conexão validada (modo simulação no MVP — chamada real ativada após developer token aprovado)",
  };
}

// ==================== PAINEL COMERCIAL (Webhook) ====================

export async function gerarSecretWebhook(
  clienteId: string
): Promise<{ ok: boolean; secret?: string; webhookUrl?: string; error?: string }> {
  const supabase = await createClient();
  const secret = crypto.randomBytes(32).toString("hex");

  const { error } = await supabase
    .schema("trafego_ddg")
    .from("clientes_acessos")
    .update({
      painel_comercial_webhook_secret: secret,
      status_painel_comercial: "pendente",
    })
    .eq("cliente_id", clienteId);

  if (error) return { ok: false, error: error.message };

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://paineldosedegrowth.vercel.app";
  const webhookUrl = `${baseUrl}/api/webhooks/painel-comercial`;

  revalidatePath("/clientes");
  return { ok: true, secret, webhookUrl };
}

export async function getWebhookConfig(
  clienteId: string
): Promise<{ secret: string | null; webhookUrl: string }> {
  const supabase = await createClient();
  const { data } = await supabase
    .schema("trafego_ddg")
    .from("clientes_acessos")
    .select("painel_comercial_webhook_secret")
    .eq("cliente_id", clienteId)
    .single();

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://paineldosedegrowth.vercel.app";
  return {
    secret: data?.painel_comercial_webhook_secret ?? null,
    webhookUrl: `${baseUrl}/api/webhooks/painel-comercial`,
  };
}

// ==================== DESCONECTAR ====================

export async function desconectarMeta(
  clienteId: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .schema("trafego_ddg")
    .from("clientes_acessos")
    .update({
      meta_ad_account_id: null,
      meta_long_lived_token: null,
      meta_business_id: null,
      meta_pixel_id: null,
      status_meta: "nao_conectado",
      meta_ultimo_erro: null,
    })
    .eq("cliente_id", clienteId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/clientes");
  return { ok: true };
}

export async function desconectarGoogle(
  clienteId: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .schema("trafego_ddg")
    .from("clientes_acessos")
    .update({
      google_customer_id: null,
      google_login_customer_id: null,
      google_oauth_refresh_token: null,
      status_google: "nao_conectado",
      google_ultimo_erro: null,
    })
    .eq("cliente_id", clienteId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/clientes");
  return { ok: true };
}
