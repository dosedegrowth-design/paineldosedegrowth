import { NextResponse } from "next/server";
import { logServerError } from "@/lib/tayssa/db";
import { getSessionUser } from "@/lib/tayssa/auth/session";
import { getSettings } from "@/lib/tayssa/settings";
import { dateTime } from "@/lib/tayssa/format";
import { getComprovantesDoMes, getComprovantesDoPeriodo } from "@/lib/tayssa/queries/relatorios";
import { mesValido, planilhaDosComprovantes } from "@/lib/tayssa/relatorios";

/**
 * "Baixar planilha" (Relatórios): uma linha por comprovante do sinal do mês,
 * com o nome do arquivo que está no .zip. Abre direto no Excel em português.
 */
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") return new NextResponse("Sem acesso.", { status: 403 });
  // o mês (?mes=2026-11) ou qualquer período do relatório (?de=2026-11-01&ate=2026-11-15)
  const q = new URL(req.url).searchParams;
  const iso = /^\d{4}-\d{2}-\d{2}$/;
  const de = q.get("de");
  const ate = q.get("ate");
  const porPeriodo = Boolean(de && ate && iso.test(de) && iso.test(ate) && de <= ate);
  const mes = q.get("mes");
  if (!porPeriodo && !mesValido(mes)) return new NextResponse("Período inválido.", { status: 400 });
  const nomeDoPeriodo = porPeriodo ? (de === ate ? de! : `${de}_a_${ate}`) : mes!;
  const buscar = () => (porPeriodo ? getComprovantesDoPeriodo(de!, ate!) : getComprovantesDoMes(mes!));
  try {
    const [lista, settings] = await Promise.all([buscar(), getSettings()]);
    const csv = planilhaDosComprovantes(lista, settings.booking.deposit_reais, (t) => dateTime(t));
    return new NextResponse(csv, {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="comprovantes-sinal-${nomeDoPeriodo}.csv"`,
        "cache-control": "private, no-store",
        "x-robots-tag": "noindex",
      },
    });
  } catch (e) {
    logServerError("relatorios.planilha", e);
    return new NextResponse("Não deu para montar a planilha agora. Tente de novo.", { status: 502 });
  }
}
