"use server";

import { z, ZodError } from "zod";
import { marinaDb } from "@/lib/marina/db";
import { LIMITE_COMENTARIO, LINKS, type Resultado } from "@/lib/marina/aprovar";

/**
 * Guarda a resposta de um item. Uma linha por (link, item), a última vale,
 * para o Lucas consultar depois. Sem login, igual ao briefing: quem tem o
 * link responde.
 */

const schema = z.object({
  link: z.enum(LINKS),
  itemId: z.string().trim().min(1).max(120),
  resposta: z.enum(["sim", "nao"]).nullable(),
  comentario: z.string().max(LIMITE_COMENTARIO).default(""),
});

export async function salvarRespostaAction(input: unknown): Promise<Resultado> {
  let dados: z.infer<typeof schema>;
  try {
    dados = schema.parse(input);
  } catch (e) {
    const msg = e instanceof ZodError ? (e.issues[0]?.message ?? "Dados inválidos") : "Dados inválidos";
    return { ok: false, error: msg };
  }

  const { error } = await marinaDb()
    .from("aprovacoes")
    .upsert(
      {
        link: dados.link,
        item_id: dados.itemId,
        resposta: dados.resposta,
        comentario: dados.comentario.trim() || null,
        atualizado_em: new Date().toISOString(),
      },
      { onConflict: "link,item_id" },
    );

  if (error) return { ok: false, error: "Não deu para salvar agora. Tenta de novo." };
  return { ok: true };
}
