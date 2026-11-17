import "server-only";
import { cache } from "react";
import { vipDb } from "@/lib/tayssa/db";
import { COMPROVANTE_TIPOS } from "@/lib/tayssa/config";
import { limitesDoMes, limitesDoPeriodo, type ComprovanteDoRelatorio } from "@/lib/tayssa/relatorios";
import { somaDoPedido } from "@/lib/tayssa/agendar";
import { formatBrPhone } from "@/lib/tayssa/phone";
import { situacaoDoPedido, type AppointmentStatus, type ServicoDoPedido } from "@/lib/tayssa/types";

/** O comprovante do relatório com o que só o painel usa: o arquivo no bucket privado e a ficha da cliente. */
export type ComprovanteComArquivo = ComprovanteDoRelatorio & {
  path: string;
  status: AppointmentStatus;
  clienteId: string | null;
};

type Linha = {
  id: string;
  service_id: string | null;
  service_name: string;
  scheduled_date: string;
  scheduled_time: string;
  status: AppointmentStatus;
  client_note: string | null;
  comprovante_path: string;
  comprovante_tipo: string | null;
  comprovante_em: string;
  servicos: ServicoDoPedido[] | null;
  client: { id: string; name: string; nickname: string | null; phone: string | null } | null;
};

type Catalogo = { id: string; name: string; preco: number | null; preco_manutencao: number | null }[];

/**
 * O valor do pedido: a soma dos serviços como estavam na hora de marcar
 * (pedido de agora) ou, no pedido de antes dos vários serviços, o preço do
 * catálogo (na manutenção, o da manutenção do volume que a nota diz).
 */
function valorDoPedido(a: Linha, catalogo: Catalogo): number | null {
  if (a.servicos?.length) return somaDoPedido(a.servicos).valor;
  const volume = a.client_note?.match(/^Manutenção do (.+)\.$/)?.[1];
  if (volume) {
    const v = catalogo.find((s) => s.name === volume);
    if (v?.preco_manutencao != null) return Number(v.preco_manutencao);
  }
  const s = catalogo.find((x) => x.id === a.service_id);
  return s?.preco != null ? Number(s.preco) : null;
}

/**
 * Os comprovantes do sinal enviados no mês (pela data em que ela anexou,
 * no horário de Brasília), do mais antigo ao mais novo. Pedido cancelado
 * depois do Pix continua na lista: o dinheiro entrou.
 */
export const getComprovantesDoMes = cache(async (mes: string): Promise<ComprovanteComArquivo[]> => {
  const { de, ate } = limitesDoMes(mes);
  return comprovantesEntre(de, ate);
});

/** Os comprovantes anexados entre dois dias (inclusive), para os relatórios de qualquer período. */
export const getComprovantesDoPeriodo = cache(async (deIso: string, ateIso: string): Promise<ComprovanteComArquivo[]> => {
  const { de, ate } = limitesDoPeriodo(deIso, ateIso);
  return comprovantesEntre(de, ate);
});

async function comprovantesEntre(de: string, ate: string): Promise<ComprovanteComArquivo[]> {
  const db = vipDb();
  const [pedidos, servicos] = await Promise.all([
    db
      .from("appointments")
      .select(
        "id, service_id, service_name, scheduled_date, scheduled_time, status, client_note, comprovante_path, comprovante_tipo, comprovante_em, servicos, client:users!appointments_client_id_fkey(id, name, nickname, phone)",
      )
      .not("comprovante_path", "is", null)
      .gte("comprovante_em", de)
      .lt("comprovante_em", ate)
      .order("comprovante_em", { ascending: true }),
    db.from("services").select("id, name, preco, preco_manutencao"),
  ]);
  if (pedidos.error) throw new Error(pedidos.error.message);
  if (servicos.error) throw new Error(servicos.error.message);
  const catalogo = (servicos.data ?? []) as Catalogo;
  return ((pedidos.data ?? []) as unknown as Linha[]).map((a) => ({
    id: a.id,
    enviadoEm: a.comprovante_em,
    cliente: a.client?.name ?? "Cliente",
    whatsapp: a.client?.phone ? formatBrPhone(a.client.phone) : null,
    servico: a.service_name,
    dia: a.scheduled_date,
    hora: a.scheduled_time.slice(0, 5),
    situacao: situacaoDoPedido({ status: a.status, comprovante_em: a.comprovante_em }),
    valor: valorDoPedido(a, catalogo),
    ext: (a.comprovante_tipo && COMPROVANTE_TIPOS[a.comprovante_tipo]) || "bin",
    path: a.comprovante_path,
    status: a.status,
    clienteId: a.client?.id ?? null,
  }));
}
