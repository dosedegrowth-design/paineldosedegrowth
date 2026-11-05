"use server";

import { randomUUID } from "node:crypto";
import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { vipDb, logServerError } from "@/lib/tayssa/db";
import { assertClient } from "@/lib/tayssa/auth/guards";
import { logAudit } from "@/lib/tayssa/audit";
import { COMPROVANTE_BUCKET, COMPROVANTE_MAX_BYTES, COMPROVANTE_TIPOS, ROUTES } from "@/lib/tayssa/config";
import { avisarTayssa } from "@/lib/tayssa/avisos";
import { diaLegivel, horaLegivel } from "@/lib/tayssa/agendar";
import { BusinessError, runAction } from "@/lib/tayssa/actions/_helpers";
import type { ActionResult } from "@/lib/tayssa/types";

/**
 * O comprovante do sinal (Lucas, 05/11/2026, no modelo do Reflexo do Santo):
 * a cliente paga pelo Pix copia e cola e anexa o comprovante no pedido dela.
 * Em dois tempos, como a galeria do painel: o arquivo vai do celular direto
 * para o Storage privado por um endereço assinado (não passa pelo servidor
 * do site) e depois o pedido ganha o comprovante. Tudo derivado da sessão:
 * ela só anexa no pedido dela, na pasta dela.
 */

const idSchema = z.string().uuid("Pedido inválido");

type Pedido = {
  id: string;
  status: string;
  service_name: string;
  scheduled_date: string;
  scheduled_time: string;
  comprovante_path: string | null;
};

async function pedidoDaCliente(id: string, clienteId: string): Promise<Pedido> {
  const { data, error } = await vipDb()
    .from("appointments")
    .select("id, status, service_name, scheduled_date, scheduled_time, comprovante_path")
    .eq("id", id)
    .eq("client_id", clienteId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new BusinessError("Esse horário não está na sua conta.");
  const p = data as Pedido;
  if (p.status !== "requested") {
    throw new BusinessError(
      p.status === "confirmed"
        ? "Esse horário já está confirmado pela Tayssa."
        : "Esse horário não está mais esperando o sinal.",
    );
  }
  return p;
}

function conferirArquivo(mime: string, bytes?: number) {
  if (!COMPROVANTE_TIPOS[mime])
    throw new BusinessError("Mande uma foto (JPG ou PNG) ou o PDF do comprovante.", "arquivo");
  if (bytes !== undefined) {
    if (!(bytes > 0)) throw new BusinessError("Escolha o arquivo do comprovante.", "arquivo");
    if (bytes > COMPROVANTE_MAX_BYTES)
      throw new BusinessError("O arquivo passa de 8 MB. Mande um print do comprovante.", "arquivo");
  }
}

/** 1º tempo: o endereço assinado para o arquivo ir direto ao Storage privado. */
export async function prepararComprovanteAction(input: {
  id: string;
  mime: string;
  bytes: number;
}): Promise<ActionResult<{ path: string; signedUrl: string }>> {
  return runAction("comprovante.preparar", async () => {
    const me = await assertClient();
    const id = idSchema.parse(input.id);
    conferirArquivo(input.mime, input.bytes);
    await pedidoDaCliente(id, me.id);
    const path = `${me.id}/${id}/${Date.now()}-${randomUUID().slice(0, 8)}.${COMPROVANTE_TIPOS[input.mime]}`;
    const { data, error } = await vipDb().storage.from(COMPROVANTE_BUCKET).createSignedUploadUrl(path);
    if (error || !data) throw new Error(`storage: ${error?.message ?? "sem endereço"}`);
    return { path, signedUrl: data.signedUrl };
  });
}

/** 2º tempo: o arquivo já chegou; o pedido ganha o comprovante e a Tayssa recebe o aviso. */
export async function salvarComprovanteAction(input: {
  id: string;
  path: string;
  mime: string;
}): Promise<ActionResult<{ em: string }>> {
  return runAction("comprovante.salvar", async () => {
    const me = await assertClient();
    const id = idSchema.parse(input.id);
    conferirArquivo(input.mime);
    // só a pasta dela, deste pedido (o endereço assinado também só valia para ele)
    const caminho = String(input.path ?? "");
    if (!caminho.startsWith(`${me.id}/${id}/`) || caminho.includes("..") || !/^[\w\-/.]+$/.test(caminho)) {
      throw new BusinessError("Não deu para anexar. Tente de novo.", "arquivo");
    }
    const pedido = await pedidoDaCliente(id, me.id);
    const db = vipDb();
    const { data: chegou } = await db.storage.from(COMPROVANTE_BUCKET).exists(caminho);
    if (!chegou) throw new BusinessError("O arquivo não chegou. Tente anexar de novo.", "arquivo");

    const em = new Date().toISOString();
    const { data: atualizado, error } = await db
      .from("appointments")
      .update({ comprovante_path: caminho, comprovante_tipo: input.mime, comprovante_em: em })
      .eq("id", id)
      .eq("client_id", me.id)
      .eq("status", "requested")
      .select("id");
    if (error) throw new Error(error.message);
    if (!atualizado?.length) throw new BusinessError("Esse horário não está mais esperando o sinal.");

    // trocou o arquivo: o anterior sai do Storage
    if (pedido.comprovante_path && pedido.comprovante_path !== caminho) {
      const { error: rmErr } = await db.storage.from(COMPROVANTE_BUCKET).remove([pedido.comprovante_path]);
      if (rmErr) logServerError("comprovante.trocar", rmErr);
    }
    await logAudit({
      actorId: me.id,
      actorRole: "client",
      action: "comprovante_anexado",
      entityType: "appointment",
      entityId: id,
      meta: { tipo: input.mime },
    });
    // o aviso no celular da Tayssa sai depois da resposta: ela confere e confirma
    after(() =>
      avisarTayssa({
        titulo: "Comprovante do sinal",
        corpo: `${me.name} · ${pedido.service_name} · ${diaLegivel(pedido.scheduled_date)} às ${horaLegivel(pedido.scheduled_time)}. Confira e confirme.`,
        url: `${ROUTES.adminAgenda}#pedidos`,
        tag: `comprovante-${id}`,
      }),
    );
    revalidatePath(ROUTES.vip, "layout");
    revalidatePath(ROUTES.admin, "layout");
    return { em };
  });
}
