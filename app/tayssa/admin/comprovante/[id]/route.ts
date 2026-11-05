import { NextResponse } from "next/server";
import { vipDb, logServerError } from "@/lib/tayssa/db";
import { getSessionUser } from "@/lib/tayssa/auth/session";
import { COMPROVANTE_BUCKET, COMPROVANTE_TIPOS } from "@/lib/tayssa/config";

/**
 * "Ver comprovante" no painel: o arquivo mora num bucket privado e só sai
 * por aqui, para a Tayssa logada. Nada de endereço público ou assinado
 * circulando: o servidor baixa e entrega, sem guardar em cache.
 */
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") return new NextResponse("Sem acesso.", { status: 403 });
  const { id } = await params;
  if (!UUID.test(id)) return new NextResponse("Comprovante não encontrado.", { status: 404 });
  try {
    const db = vipDb();
    const { data, error } = await db
      .from("appointments")
      .select("comprovante_path, comprovante_tipo")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    const linha = data as { comprovante_path: string | null; comprovante_tipo: string | null } | null;
    if (!linha?.comprovante_path) return new NextResponse("Esse pedido ainda não tem comprovante.", { status: 404 });
    const { data: arquivo, error: dErr } = await db.storage.from(COMPROVANTE_BUCKET).download(linha.comprovante_path);
    if (dErr || !arquivo) throw new Error(dErr?.message ?? "sem arquivo");
    // só os tipos aceitos no envio; o navegador não tenta adivinhar outro (nosniff)
    const tipo =
      linha.comprovante_tipo && COMPROVANTE_TIPOS[linha.comprovante_tipo]
        ? linha.comprovante_tipo
        : "application/octet-stream";
    const ext = COMPROVANTE_TIPOS[tipo] ?? "bin";
    return new NextResponse(await arquivo.arrayBuffer(), {
      headers: {
        "content-type": tipo,
        "content-disposition": `inline; filename="comprovante-${id.slice(0, 8)}.${ext}"`,
        "cache-control": "private, no-store",
        "x-content-type-options": "nosniff",
        "x-robots-tag": "noindex",
      },
    });
  } catch (e) {
    logServerError("comprovante.ver", e);
    return new NextResponse("Não deu para abrir o comprovante agora. Tente de novo.", { status: 502 });
  }
}
