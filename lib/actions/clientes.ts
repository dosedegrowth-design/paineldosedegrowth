"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ==================== TYPES ====================

export type TipoNegocio = "ecommerce" | "lead_whatsapp" | "hibrido";
export type StatusConexao =
  | "nao_conectado"
  | "pendente"
  | "aguardando_selecao"
  | "conectado"
  | "erro";

export interface ClienteCompleto {
  id: string;
  slug: string;
  nome: string;
  tipo_negocio: TipoNegocio;
  cor_primaria: string;
  cac_maximo: number | null;
  ticket_medio: number | null;
  ativo: boolean;
  criado_em: string;
  // de clientes_acessos
  status_meta: StatusConexao;
  status_google: StatusConexao;
  status_painel_comercial: StatusConexao;
  meta_ad_account_id: string | null;
  google_customer_id: string | null;
  ultima_sync_meta: string | null;
  ultima_sync_google: string | null;
  meta_ultimo_erro: string | null;
  google_ultimo_erro: string | null;
  ultima_sync_status: string | null;
  // de cliente_config
  plataforma_ecom: string | null;
  dominio_site: string | null;
  frequencia_vendas_manuais: string | null;
  painel_comercial_tipo: string | null;
  setup_concluido: boolean;
}

// ==================== SCHEMAS ====================

const slugSchema = z
  .string()
  .min(3, "Slug deve ter pelo menos 3 caracteres")
  .max(40, "Slug muito longo")
  .regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens");

const CreateClienteSchema = z.object({
  slug: slugSchema,
  nome: z.string().min(2, "Nome muito curto").max(100),
  tipo_negocio: z.enum(["ecommerce", "lead_whatsapp", "hibrido"]),
  cor_primaria: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#F15839"),
  cac_maximo: z.number().nonnegative().nullable().default(null),
  ticket_medio: z.number().nonnegative().nullable().default(null),
  // ecommerce
  plataforma_ecom: z.string().nullable().optional(),
  dominio_site: z.string().nullable().optional(),
  pixel_instalado: z.boolean().optional(),
  webhook_carrinho_abandonado: z.boolean().optional(),
  // lead_whatsapp
  frequencia_vendas_manuais: z.enum(["semanal", "quinzenal", "mensal"]).optional(),
  painel_comercial_tipo: z.string().nullable().optional(),
  painel_comercial_url: z.string().nullable().optional(),
  // observações
  observacoes: z.string().nullable().optional(),
});

export type CreateClienteInput = z.infer<typeof CreateClienteSchema>;

// ==================== ACTIONS ====================

export async function listClientes(): Promise<ClienteCompleto[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .schema("trafego_ddg")
      .from("clientes")
      .select(
        `
        *,
        acessos:clientes_acessos(*),
        config:cliente_config(*)
      `
      )
      .eq("ativo", true)
      .order("criado_em", { ascending: true });

    if (error) {
      console.error("listClientes error:", error);
      return [];
    }

    return (data ?? []).map((c) => {
      const acessos = Array.isArray(c.acessos) ? c.acessos[0] : c.acessos;
      const config = Array.isArray(c.config) ? c.config[0] : c.config;
      return {
        id: c.id,
        slug: c.slug,
        nome: c.nome,
        tipo_negocio: c.tipo_negocio,
        cor_primaria: c.cor_primaria,
        cac_maximo: c.cac_maximo,
        ticket_medio: c.ticket_medio,
        ativo: c.ativo,
        criado_em: c.criado_em,
        status_meta: acessos?.status_meta ?? "nao_conectado",
        status_google: acessos?.status_google ?? "nao_conectado",
        status_painel_comercial: acessos?.status_painel_comercial ?? "nao_conectado",
        meta_ad_account_id: acessos?.meta_ad_account_id ?? null,
        google_customer_id: acessos?.google_customer_id ?? null,
        ultima_sync_meta: acessos?.ultima_sync_meta ?? null,
        ultima_sync_google: acessos?.ultima_sync_google ?? null,
        meta_ultimo_erro: acessos?.meta_ultimo_erro ?? null,
        google_ultimo_erro: acessos?.google_ultimo_erro ?? null,
        ultima_sync_status: acessos?.ultima_sync_status ?? null,
        plataforma_ecom: config?.plataforma_ecom ?? null,
        dominio_site: config?.dominio_site ?? null,
        frequencia_vendas_manuais: config?.frequencia_vendas_manuais ?? null,
        painel_comercial_tipo: config?.painel_comercial_tipo ?? null,
        setup_concluido: config?.setup_concluido ?? false,
      };
    });
  } catch (err) {
    console.error("listClientes exception:", err);
    return [];
  }
}

export async function createCliente(
  input: CreateClienteInput
): Promise<{ ok: true; clienteId: string } | { ok: false; error: string }> {
  try {
    const parsed = CreateClienteSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        error: parsed.error.errors.map((e) => e.message).join(", "),
      };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Não autenticado" };

    // 1. Cria cliente
    const { data: cliente, error: e1 } = await supabase
      .schema("trafego_ddg")
      .from("clientes")
      .insert({
        slug: parsed.data.slug,
        nome: parsed.data.nome,
        tipo_negocio: parsed.data.tipo_negocio,
        cor_primaria: parsed.data.cor_primaria,
        cac_maximo: parsed.data.cac_maximo,
        ticket_medio: parsed.data.ticket_medio,
      })
      .select("id")
      .single();

    if (e1 || !cliente) {
      return {
        ok: false,
        error: e1?.code === "23505" ? `Slug "${parsed.data.slug}" já existe` : (e1?.message ?? "Erro desconhecido"),
      };
    }

    // 2. Cria registro de acessos (status pendente em todos)
    const { error: e2 } = await supabase
      .schema("trafego_ddg")
      .from("clientes_acessos")
      .insert({
        cliente_id: cliente.id,
        status_meta: "nao_conectado",
        status_google: "nao_conectado",
        status_painel_comercial: "nao_conectado",
      });

    if (e2) console.error("Erro criando acessos:", e2);

    // 3. Cria config
    const { error: e3 } = await supabase
      .schema("trafego_ddg")
      .from("cliente_config")
      .insert({
        cliente_id: cliente.id,
        plataforma_ecom: parsed.data.plataforma_ecom ?? null,
        dominio_site: parsed.data.dominio_site ?? null,
        pixel_instalado: parsed.data.pixel_instalado ?? false,
        webhook_carrinho_abandonado: parsed.data.webhook_carrinho_abandonado ?? false,
        frequencia_vendas_manuais: parsed.data.frequencia_vendas_manuais ?? "semanal",
        painel_comercial_tipo: parsed.data.painel_comercial_tipo ?? null,
        painel_comercial_url: parsed.data.painel_comercial_url ?? null,
        observacoes: parsed.data.observacoes ?? null,
        setup_concluido: false,
      });

    if (e3) console.error("Erro criando config:", e3);

    // 4. Vincula o user atual como adm_geral
    const { error: e4 } = await supabase
      .schema("trafego_ddg")
      .from("clientes_users")
      .insert({
        cliente_id: cliente.id,
        user_id: user.id,
        role: "adm_geral",
      });

    if (e4) console.error("Erro vinculando user:", e4);

    revalidatePath("/clientes");
    revalidatePath("/dashboard");

    return { ok: true, clienteId: cliente.id };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

export async function deleteCliente(
  clienteId: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .schema("trafego_ddg")
      .from("clientes")
      .update({ ativo: false })
      .eq("id", clienteId);

    if (error) return { ok: false, error: error.message };
    revalidatePath("/clientes");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

const UpdateClienteSchema = z.object({
  cliente_id: z.string().uuid(),
  nome: z.string().min(2).max(100),
  cor_primaria: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  cac_maximo: z.number().nonnegative().nullable(),
  ticket_medio: z.number().nonnegative().nullable(),
  tipo_negocio: z.enum(["ecommerce", "lead_whatsapp", "hibrido"]),
});

export async function updateCliente(
  input: z.input<typeof UpdateClienteSchema>
): Promise<{ ok: boolean; error?: string }> {
  const parsed = UpdateClienteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors.map((e) => e.message).join(", ") };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .schema("trafego_ddg")
    .from("clientes")
    .update({
      nome: parsed.data.nome,
      cor_primaria: parsed.data.cor_primaria,
      cac_maximo: parsed.data.cac_maximo,
      ticket_medio: parsed.data.ticket_medio,
      tipo_negocio: parsed.data.tipo_negocio,
      atualizado_em: new Date().toISOString(),
    })
    .eq("id", parsed.data.cliente_id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/clientes");
  return { ok: true };
}

export async function getClienteBySlug(
  slug: string
): Promise<ClienteCompleto | null> {
  const all = await listClientes();
  return all.find((c) => c.slug === slug) ?? null;
}

// ==================== WIZARD: PARTIAL CREATE / UPDATE ====================
// Cria cliente após passos 1+2 do wizard (nome, slug, tipo).
// setup_concluido permanece false até finalizarSetupCliente().
// Permite OAuth Meta/Google funcionarem nos passos 3 e 4.

const CreateClienteParcialSchema = z.object({
  slug: slugSchema,
  nome: z.string().min(2).max(100),
  tipo_negocio: z.enum(["ecommerce", "lead_whatsapp", "hibrido"]),
  cor_primaria: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#F15839"),
});

export type CreateClienteParcialResult =
  | { ok: true; clienteId: string }
  | { ok: false; error: string }
  | {
      ok: false;
      conflito: "slug_arquivado";
      slug: string;
      clienteId: string;
      nome: string;
      setupConcluido: boolean;
      error: string;
    };

export async function createClienteParcial(
  input: z.input<typeof CreateClienteParcialSchema>
): Promise<CreateClienteParcialResult> {
  try {
    const parsed = CreateClienteParcialSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.errors.map((e) => e.message).join(", ") };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Não autenticado" };

    // 1. Cria cliente
    const { data: cliente, error: e1 } = await supabase
      .schema("trafego_ddg")
      .from("clientes")
      .insert({
        slug: parsed.data.slug,
        nome: parsed.data.nome,
        tipo_negocio: parsed.data.tipo_negocio,
        cor_primaria: parsed.data.cor_primaria,
      })
      .select("id")
      .single();

    if (e1 || !cliente) {
      // Conflito de slug → checa se é cliente arquivado
      if (e1?.code === "23505") {
        const arquivado = await checarSlugArquivado(parsed.data.slug);
        if (arquivado.arquivado) {
          return {
            ok: false,
            conflito: "slug_arquivado",
            slug: parsed.data.slug,
            clienteId: arquivado.clienteId!,
            nome: arquivado.nome ?? parsed.data.slug,
            setupConcluido: arquivado.setupConcluido ?? false,
            error: `Slug "${parsed.data.slug}" pertence a um cliente arquivado.`,
          };
        }
        return { ok: false, error: `Slug "${parsed.data.slug}" já existe (ativo)` };
      }
      return {
        ok: false,
        error: e1?.message ?? "Erro desconhecido",
      };
    }

    // 2. Cria registro de acessos (status nao_conectado em todos)
    const { error: e2 } = await supabase
      .schema("trafego_ddg")
      .from("clientes_acessos")
      .insert({
        cliente_id: cliente.id,
        status_meta: "nao_conectado",
        status_google: "nao_conectado",
        status_painel_comercial: "nao_conectado",
      });
    if (e2) console.error("Erro criando acessos parcial:", e2);

    // 3. Cria config vazio com setup_concluido=false (rascunho)
    const { error: e3 } = await supabase
      .schema("trafego_ddg")
      .from("cliente_config")
      .insert({
        cliente_id: cliente.id,
        setup_concluido: false,
      });
    if (e3) console.error("Erro criando config parcial:", e3);

    // 4. Vincula user atual como adm_geral
    const { error: e4 } = await supabase
      .schema("trafego_ddg")
      .from("clientes_users")
      .insert({
        cliente_id: cliente.id,
        user_id: user.id,
        role: "adm_geral",
      });
    if (e4) console.error("Erro vinculando user parcial:", e4);

    revalidatePath("/clientes");
    return { ok: true, clienteId: cliente.id };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

const FinalizarSetupSchema = z.object({
  cliente_id: z.string().uuid(),
  cac_maximo: z.number().nonnegative().nullable().optional(),
  ticket_medio: z.number().nonnegative().nullable().optional(),
  plataforma_ecom: z.string().nullable().optional(),
  dominio_site: z.string().nullable().optional(),
  pixel_instalado: z.boolean().optional(),
  webhook_carrinho_abandonado: z.boolean().optional(),
  frequencia_vendas_manuais: z.enum(["semanal", "quinzenal", "mensal"]).optional(),
  painel_comercial_tipo: z.string().nullable().optional(),
  painel_comercial_url: z.string().nullable().optional(),
  observacoes: z.string().nullable().optional(),
});

export async function finalizarSetupCliente(
  input: z.input<typeof FinalizarSetupSchema>
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const parsed = FinalizarSetupSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.errors.map((e) => e.message).join(", ") };
    }
    const supabase = await createClient();

    // 1. Atualiza cliente (cac/ticket)
    const { error: e1 } = await supabase
      .schema("trafego_ddg")
      .from("clientes")
      .update({
        cac_maximo: parsed.data.cac_maximo ?? null,
        ticket_medio: parsed.data.ticket_medio ?? null,
        atualizado_em: new Date().toISOString(),
      })
      .eq("id", parsed.data.cliente_id);
    if (e1) return { ok: false, error: e1.message };

    // 2. Atualiza config + marca setup_concluido=true
    const { error: e2 } = await supabase
      .schema("trafego_ddg")
      .from("cliente_config")
      .update({
        plataforma_ecom: parsed.data.plataforma_ecom ?? null,
        dominio_site: parsed.data.dominio_site ?? null,
        pixel_instalado: parsed.data.pixel_instalado ?? false,
        webhook_carrinho_abandonado: parsed.data.webhook_carrinho_abandonado ?? false,
        frequencia_vendas_manuais: parsed.data.frequencia_vendas_manuais ?? "semanal",
        painel_comercial_tipo: parsed.data.painel_comercial_tipo ?? null,
        painel_comercial_url: parsed.data.painel_comercial_url ?? null,
        observacoes: parsed.data.observacoes ?? null,
        setup_concluido: true,
      })
      .eq("cliente_id", parsed.data.cliente_id);
    if (e2) return { ok: false, error: e2.message };

    revalidatePath("/clientes");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

// Cancela rascunho: deleta cliente parcial (soft delete via ativo=false)
export async function cancelarRascunhoCliente(
  clienteId: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    // Apenas cancela se setup_concluido=false
    const { data: config } = await supabase
      .schema("trafego_ddg")
      .from("cliente_config")
      .select("setup_concluido")
      .eq("cliente_id", clienteId)
      .single();

    if (config?.setup_concluido) {
      return { ok: false, error: "Cliente já finalizado — use deleteCliente" };
    }

    const { error } = await supabase
      .schema("trafego_ddg")
      .from("clientes")
      .update({ ativo: false })
      .eq("id", clienteId);
    if (error) return { ok: false, error: error.message };

    revalidatePath("/clientes");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

// Hard delete: apaga de vez do banco (cascade mata acessos, config, snapshots)
// Libera o slug pra reuso. Use com cautela — não tem desfazer.
export async function hardDeleteCliente(
  clienteId: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .schema("trafego_ddg")
      .from("clientes")
      .delete()
      .eq("id", clienteId);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/clientes");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

// Restaura cliente arquivado: ativo=false → true
export async function restaurarCliente(
  clienteId: string
): Promise<{ ok: boolean; slug?: string; error?: string }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .schema("trafego_ddg")
      .from("clientes")
      .update({ ativo: true })
      .eq("id", clienteId)
      .select("slug")
      .single();
    if (error) return { ok: false, error: error.message };
    revalidatePath("/clientes");
    return { ok: true, slug: data?.slug };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

// Verifica se slug está sendo ocupado por cliente arquivado (ativo=false).
export async function checarSlugArquivado(slug: string): Promise<{
  arquivado: boolean;
  clienteId?: string;
  nome?: string;
  setupConcluido?: boolean;
}> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .schema("trafego_ddg")
      .from("clientes")
      .select("id, nome, ativo")
      .eq("slug", slug)
      .eq("ativo", false)
      .maybeSingle();
    if (!data) return { arquivado: false };

    const { data: cfg } = await supabase
      .schema("trafego_ddg")
      .from("cliente_config")
      .select("setup_concluido")
      .eq("cliente_id", data.id)
      .maybeSingle();

    return {
      arquivado: true,
      clienteId: data.id,
      nome: data.nome,
      setupConcluido: cfg?.setup_concluido ?? false,
    };
  } catch {
    return { arquivado: false };
  }
}
