"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export type Role = "adm_geral" | "gestor_ddg" | "viewer_cliente";

export interface UsuarioCliente {
  user_id: string;
  email: string;
  nome: string | null;
  role: Role;
  vinculado_em: string;
}

const InviteSchema = z.object({
  cliente_id: z.string().uuid(),
  email: z.string().email("Email inválido"),
  nome: z.string().min(2).optional(),
  role: z.enum(["adm_geral", "gestor_ddg", "viewer_cliente"]),
});

export async function listarUsuariosDoCliente(
  clienteId: string
): Promise<UsuarioCliente[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .schema("trafego_ddg")
      .from("clientes_users")
      .select("user_id, role, criado_em")
      .eq("cliente_id", clienteId);

    if (error || !data) return [];

    // Buscar emails via admin (não dá pra ver auth.users via PostgREST normal)
    const admin = createAdminClient();
    const result: UsuarioCliente[] = [];

    for (const row of data) {
      const { data: u } = await admin.auth.admin.getUserById(row.user_id);
      if (u.user) {
        const meta = u.user.user_metadata as { name?: string } | null;
        result.push({
          user_id: row.user_id,
          email: u.user.email ?? "",
          nome: meta?.name ?? null,
          role: row.role,
          vinculado_em: row.criado_em,
        });
      }
    }
    return result;
  } catch (err) {
    console.error("listarUsuariosDoCliente:", err);
    return [];
  }
}

export async function convidarUsuario(
  input: z.input<typeof InviteSchema>
): Promise<{ ok: boolean; error?: string; senha_temporaria?: string }> {
  const parsed = InviteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors.map((e) => e.message).join(", ") };
  }

  try {
    const admin = createAdminClient();

    // 1. Verificar se já existe
    const { data: existing } = await admin.auth.admin.listUsers();
    let userId: string | null = null;
    const found = existing?.users?.find((u) => u.email === parsed.data.email);

    if (found) {
      userId = found.id;
    } else {
      // 2. Criar usuário com senha temporária
      const senhaTemporaria =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).toUpperCase().slice(-4) +
        "!9";

      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email: parsed.data.email,
        password: senhaTemporaria,
        email_confirm: true,
        user_metadata: parsed.data.nome ? { name: parsed.data.nome } : undefined,
      });

      if (createErr || !created.user) {
        return { ok: false, error: createErr?.message ?? "Falha ao criar usuário" };
      }

      userId = created.user.id;

      // 3. Vincular ao cliente
      const supabase = await createClient();
      const { error: linkErr } = await supabase
        .schema("trafego_ddg")
        .from("clientes_users")
        .insert({
          cliente_id: parsed.data.cliente_id,
          user_id: userId,
          role: parsed.data.role,
        });

      if (linkErr) {
        return { ok: false, error: linkErr.message };
      }

      revalidatePath(`/clientes`);
      return { ok: true, senha_temporaria: senhaTemporaria };
    }

    // Já existe — só vincular
    const supabase = await createClient();
    const { error: linkErr } = await supabase
      .schema("trafego_ddg")
      .from("clientes_users")
      .upsert({
        cliente_id: parsed.data.cliente_id,
        user_id: userId,
        role: parsed.data.role,
      });

    if (linkErr) return { ok: false, error: linkErr.message };

    revalidatePath(`/clientes`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

export async function removerUsuarioDoCliente(
  clienteId: string,
  userId: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .schema("trafego_ddg")
      .from("clientes_users")
      .delete()
      .eq("cliente_id", clienteId)
      .eq("user_id", userId);

    if (error) return { ok: false, error: error.message };

    revalidatePath(`/clientes`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

export async function alterarRoleUsuario(
  clienteId: string,
  userId: string,
  novoRole: Role
): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .schema("trafego_ddg")
      .from("clientes_users")
      .update({ role: novoRole })
      .eq("cliente_id", clienteId)
      .eq("user_id", userId);

    if (error) return { ok: false, error: error.message };

    revalidatePath(`/clientes`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}
