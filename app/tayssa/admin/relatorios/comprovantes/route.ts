import { NextResponse } from "next/server";
import { vipDb, logServerError } from "@/lib/tayssa/db";
import { getSessionUser } from "@/lib/tayssa/auth/session";
import { COMPROVANTE_BUCKET } from "@/lib/tayssa/config";
import { nowInBusinessTz } from "@/lib/tayssa/format";
import { getComprovantesDoMes } from "@/lib/tayssa/queries/relatorios";
import { mesValido, montadorDeZip, nomesDosArquivos } from "@/lib/tayssa/relatorios";

/**
 * "Baixar os comprovantes (.zip)" em Relatórios: os comprovantes do sinal
 * do mês num .zip, para a Tayssa mandar para a Larissa. Só a Tayssa
 * logada; os arquivos saem do bucket privado pelo servidor, sem link
 * público. Sai em fluxo, um arquivo de cada vez (sem limite de tamanho).
 */
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** quantos comprovantes descem do Storage ao mesmo tempo */
const JUNTOS = 4;

export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") return new NextResponse("Sem acesso.", { status: 403 });
  const mes = new URL(req.url).searchParams.get("mes");
  if (!mesValido(mes)) return new NextResponse("Mês inválido.", { status: 400 });
  let lista;
  try {
    lista = await getComprovantesDoMes(mes);
  } catch (e) {
    logServerError("relatorios.zip", e);
    return new NextResponse("Não deu para juntar os comprovantes agora. Tente de novo.", { status: 502 });
  }
  if (!lista.length) return new NextResponse("Nenhum comprovante neste mês.", { status: 404 });

  const nomes = nomesDosArquivos(lista);
  const db = vipDb();
  const zip = montadorDeZip();
  const baixar = async (i: number): Promise<Uint8Array> => {
    const { data, error } = await db.storage.from(COMPROVANTE_BUCKET).download(lista[i].path);
    if (error || !data) throw new Error(`${lista[i].id}: ${error?.message ?? "sem arquivo"}`);
    return new Uint8Array(await data.arrayBuffer());
  };
  // os próximos já vão descendo enquanto o atual sai
  const fila: Promise<Uint8Array>[] = [];
  let pedido = 0;
  let enviado = 0;
  const encher = () => {
    while (fila.length < JUNTOS && pedido < lista.length) {
      const p = baixar(pedido++);
      p.catch(() => {}); // o erro aparece quando chegar a vez dele
      fila.push(p);
    }
  };

  const corpo = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        if (enviado >= lista.length) {
          controller.enqueue(zip.fim());
          controller.close();
          return;
        }
        encher();
        const dados = await fila.shift()!;
        const c = lista[enviado];
        for (const parte of zip.arquivo({ nome: nomes[enviado], dados, data: nowInBusinessTz(new Date(c.enviadoEm)) })) {
          controller.enqueue(parte);
        }
        enviado++;
      } catch (e) {
        logServerError("relatorios.zip", e);
        controller.error(e);
      }
    },
  });

  return new NextResponse(corpo, {
    headers: {
      "content-type": "application/zip",
      "content-disposition": `attachment; filename="comprovantes-sinal-${mes}.zip"`,
      "cache-control": "private, no-store",
      "x-robots-tag": "noindex",
    },
  });
}
