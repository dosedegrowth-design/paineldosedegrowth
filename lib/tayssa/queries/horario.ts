import "server-only";
import { cache } from "react";
import { vipDb, isDbConfigured, logServerError } from "@/lib/tayssa/db";
import type { AppointmentStatus } from "@/lib/tayssa/types";
import { getSettings } from "@/lib/tayssa/settings";
import { taxaDoHorario } from "@/lib/tayssa/rules";

/**
 * O horário que vai no "folder" do WhatsApp (05/11/2026): a página
 * /tayssa/horario/<id> e a imagem dela. É a única página pública com um id
 * na URL, porque o WhatsApp só monta o cartão de um link que abre sem
 * login; o id do pedido (uuid aleatório) é o segredo do link. Por isso
 * mostra só o pedido (serviço, dia, hora, valor, situação): nunca o nome,
 * o telefone ou qualquer dado de quem marcou.
 */
export type HorarioPublico = {
  id: string;
  servico: string;
  /** "Volume inglês", quando é manutenção */
  volume: string | null;
  dia: string;
  hora: string;
  duracao: number | null;
  status: AppointmentStatus;
  /** a cliente já anexou o comprovante do sinal */
  comprovante: boolean;
  criadoEm: string;
  valor: number | null;
  /** taxa de horário especial do horário (dezembro), em reais; 0 = nenhuma */
  taxa: number;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * null só quando o pedido não existe (o link é de um pedido de teste que foi
 * apagado, ou chegou cortado). Uma falha do banco tenta de novo uma vez e,
 * se continuar, sobe como erro: a página mostra "Tentar de novo" em vez de
 * dizer que o horário não existe. Antes, um soluço da rede virava 404.
 */
export const getHorarioPublico = cache(async (id: string): Promise<HorarioPublico | null> => {
  if (!UUID.test(id) || !isDbConfigured()) return null;
  try {
    return await buscarHorario(id);
  } catch {
    await new Promise((r) => setTimeout(r, 350));
    try {
      return await buscarHorario(id);
    } catch (e) {
      logServerError("horario.publico", e);
      throw e;
    }
  }
});

async function buscarHorario(id: string): Promise<HorarioPublico | null> {
  const db = vipDb();
  const { data, error } = await db
    .from("appointments")
    .select("id, service_id, service_name, scheduled_date, scheduled_time, duration_min, status, created_at, client_note, comprovante_em")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const a = data as unknown as {
    id: string;
    service_id: string | null;
    service_name: string;
    scheduled_date: string;
    scheduled_time: string;
    duration_min: number | null;
    status: AppointmentStatus;
    created_at: string;
    client_note: string | null;
    comprovante_em: string | null;
  };
  // manutenção: o valor é o da manutenção do volume dela (a nota diz qual)
  const volume = a.client_note?.match(/^Manutenção do (.+)\.$/)?.[1] ?? null;
  let valor: number | null = null;
  const { data: servicos } = await db.from("services").select("id, name, preco, preco_manutencao");
  const lista = (servicos ?? []) as { id: string; name: string; preco: number | null; preco_manutencao: number | null }[];
  if (volume) {
    const v = lista.find((s) => s.name === volume);
    valor = v?.preco_manutencao != null ? Number(v.preco_manutencao) : null;
  }
  if (valor == null) {
    const s = lista.find((x) => x.id === a.service_id);
    valor = s?.preco != null ? Number(s.preco) : null;
  }
  return {
    id: a.id,
    servico: a.service_name,
    volume,
    dia: a.scheduled_date,
    hora: a.scheduled_time.slice(0, 5),
    duracao: a.duration_min,
    status: a.status,
    comprovante: Boolean(a.comprovante_em),
    criadoEm: a.created_at,
    valor,
    taxa: taxaDoHorario((await getSettings()).booking, a.scheduled_date, a.scheduled_time),
  };
}
