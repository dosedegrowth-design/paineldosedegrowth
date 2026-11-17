import { NextResponse } from "next/server";
import { logServerError } from "@/lib/tayssa/db";
import { getSessionUser } from "@/lib/tayssa/auth/session";
import { agoraNaCasa, montarRelatorio } from "@/lib/tayssa/queries/gestao";
import { resolverPeriodo } from "@/lib/tayssa/financeiro";
import { gerarPdfRelatorio } from "@/lib/tayssa/relatorio-pdf";

/**
 * "Baixar relatório em PDF" (Relatórios, 17/11/2026): o relatório do período
 * escolhido, montado na hora com os dados do banco. Só a Tayssa logada.
 */
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") return new NextResponse("Sem acesso.", { status: 403 });
  const q = Object.fromEntries(new URL(req.url).searchParams.entries());
  const periodo = resolverPeriodo(q, agoraNaCasa().iso, "mes");
  try {
    const pdf = await gerarPdfRelatorio(await montarRelatorio(periodo));
    const nome = periodo.de === periodo.ate ? periodo.de : `${periodo.de}_a_${periodo.ate}`;
    return new NextResponse(Buffer.from(pdf), {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `attachment; filename="relatorio-tayssa-${nome}.pdf"`,
        "cache-control": "private, no-store",
        "x-robots-tag": "noindex",
      },
    });
  } catch (e) {
    logServerError("relatorios.pdf", e);
    return new NextResponse("Não deu para gerar o PDF agora. Tente de novo.", { status: 502 });
  }
}
