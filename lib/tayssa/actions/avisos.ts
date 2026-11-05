"use server";

import { z } from "zod";
import { vipDb } from "@/lib/tayssa/db";
import { assertAdmin } from "@/lib/tayssa/auth/guards";
import { avisarTayssa, chavesDosAvisos } from "@/lib/tayssa/avisos";
import { ROUTES } from "@/lib/tayssa/config";
import { BusinessError, runAction } from "@/lib/tayssa/actions/_helpers";
import type { ActionResult } from "@/lib/tayssa/types";

/** A chave pública que o celular usa para assinar os avisos (só a Tayssa pede). */
export async function chaveDosAvisosAction(): Promise<ActionResult<{ publicKey: string }>> {
  return runAction("avisos.chave", async () => {
    await assertAdmin();
    const { publicKey } = await chavesDosAvisos();
    return { publicKey };
  });
}

const aparelhoSchema = z.object({
  endpoint: z.string().url().max(1000).startsWith("https://"),
  p256dh: z.string().min(10).max(300),
  auth: z.string().min(8).max(100),
  aparelho: z.string().max(200).optional(),
});

/** Liga os avisos neste aparelho e manda um de boas-vindas, para ela ver que chegou. */
export async function ativarAvisosAction(input: z.input<typeof aparelhoSchema>): Promise<ActionResult> {
  return runAction("avisos.ativar", async () => {
    const admin = await assertAdmin();
    const p = aparelhoSchema.parse(input);
    const { error } = await vipDb()
      .from("avisos_aparelhos")
      .upsert(
        { user_id: admin.id, endpoint: p.endpoint, p256dh: p.p256dh, auth: p.auth, aparelho: p.aparelho ?? null },
        { onConflict: "endpoint" },
      );
    if (error) throw new Error(error.message);
    await avisarTayssa(
      { titulo: "Avisos ligados", corpo: "Quando uma cliente marcar um horário, o aviso chega aqui.", url: ROUTES.adminAgenda, tag: "avisos-ligados" },
      admin.id,
    );
    return undefined;
  });
}

export async function desativarAvisosAction(input: { endpoint: string }): Promise<ActionResult> {
  return runAction("avisos.desativar", async () => {
    const admin = await assertAdmin();
    const endpoint = z.string().url().max(1000).parse(input.endpoint);
    const { error } = await vipDb().from("avisos_aparelhos").delete().eq("endpoint", endpoint).eq("user_id", admin.id);
    if (error) throw new Error(error.message);
    return undefined;
  });
}

/** "Mandar um teste": confere que o aviso chega neste celular. */
export async function testarAvisoAction(): Promise<ActionResult<{ enviados: number }>> {
  return runAction("avisos.testar", async () => {
    const admin = await assertAdmin();
    const enviados = await avisarTayssa(
      { titulo: "Teste de aviso", corpo: "Está chegando. Os pedidos novos aparecem assim.", url: ROUTES.adminAgenda, tag: "avisos-teste" },
      admin.id,
    );
    if (!enviados) throw new BusinessError("Nenhum aparelho recebeu. Ative os avisos de novo neste celular.");
    return { enviados };
  });
}
