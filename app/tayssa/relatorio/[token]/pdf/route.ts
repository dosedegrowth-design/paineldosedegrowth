import { NextResponse } from "next/server";
import { logServerError } from "@/lib/tayssa/db";
import { relatorioDoToken } from "@/lib/tayssa/queries/gestao";
import { gerarPdfRelatorio } from "@/lib/tayssa/relatorio-pdf";

/** O PDF do relatório compartilhado: a mesma foto do fechamento que a página mostra, só com o token. */
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  try {
    const r = await relatorioDoToken(token);
    if (r.estado !== "ok") return new NextResponse(r.estado === "revogado" ? "Este link foi desativado." : "Relatório não encontrado.", { status: r.estado === "revogado" ? 410 : 404 });
    const pdf = await gerarPdfRelatorio(r.dados);
    const nome = r.dados.periodo.de === r.dados.periodo.ate ? r.dados.periodo.de : `${r.dados.periodo.de}_a_${r.dados.periodo.ate}`;
    return new NextResponse(Buffer.from(pdf), {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `attachment; filename="relatorio-tayssa-${nome}.pdf"`,
        "cache-control": "private, no-store",
        "x-robots-tag": "noindex",
      },
    });
  } catch (e) {
    logServerError("relatorio.compartilhado.pdf", e);
    return new NextResponse("Não deu para gerar o PDF agora. Tente de novo.", { status: 502 });
  }
}
