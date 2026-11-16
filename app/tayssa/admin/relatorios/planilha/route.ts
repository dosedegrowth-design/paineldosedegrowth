import { NextResponse } from "next/server";
import { logServerError } from "@/lib/tayssa/db";
import { getSessionUser } from "@/lib/tayssa/auth/session";
import { getSettings } from "@/lib/tayssa/settings";
import { dateTime } from "@/lib/tayssa/format";
import { getComprovantesDoMes } from "@/lib/tayssa/queries/relatorios";
import { mesValido, planilhaDosComprovantes } from "@/lib/tayssa/relatorios";

/**
 * "Baixar planilha" (Relatórios): uma linha por comprovante do sinal do mês,
 * com o nome do arquivo que está no .zip. Abre direto no Excel em português.
 */
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") return new NextResponse("Sem acesso.", { status: 403 });
  const mes = new URL(req.url).searchParams.get("mes");
  if (!mesValido(mes)) return new NextResponse("Mês inválido.", { status: 400 });
  try {
    const [lista, settings] = await Promise.all([getComprovantesDoMes(mes), getSettings()]);
    const csv = planilhaDosComprovantes(lista, settings.booking.deposit_reais, (t) => dateTime(t));
    return new NextResponse(csv, {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="comprovantes-sinal-${mes}.csv"`,
        "cache-control": "private, no-store",
        "x-robots-tag": "noindex",
      },
    });
  } catch (e) {
    logServerError("relatorios.planilha", e);
    return new NextResponse("Não deu para montar a planilha agora. Tente de novo.", { status: 502 });
  }
}
