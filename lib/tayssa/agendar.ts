/**
 * Agendar pelo site: a cliente escolhe serviço, técnica, dia e horário numa
 * folha, e o pedido segue pronto para o WhatsApp da Tayssa — com o pedido
 * do Pix do sinal. Nada é gravado no banco: quem fecha a agenda é ela, na
 * conversa. Puro (sem banco, sem React) para ser testado e usado no client.
 */

export type DiaAgenda = {
  iso: string;
  slots: { time: string; available: boolean }[];
};

export type PedidoAgenda = {
  /** nome do serviço, como no catálogo ("Aplicação de cílios") */
  servico: string;
  /** volume ou técnica, quando ela escolheu ("Volume brasileiro") */
  tecnica?: string | null;
  /** "AAAA-MM-DD" */
  dia: string;
  /** "HH:MM" */
  hora: string;
  nome: string;
  /** valor do serviço/produto, quando a Tayssa cadastrou */
  valor?: number | null;
  /** valor do sinal, em reais */
  sinal: number;
};

const DIAS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
const DIAS_CURTOS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const MESES_CURTOS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

/** "AAAA-MM-DD" como data civil (sem virar o dia por fuso) */
function civil(iso: string) {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(a, (m ?? 1) - 1, d ?? 1);
}

/** "14:00" → "14h"; "10:30" → "10h30" */
export function horaLegivel(hhmm: string): string {
  const [h, m] = hhmm.slice(0, 5).split(":");
  return m && m !== "00" ? `${Number(h)}h${m}` : `${Number(h)}h`;
}

/** "sexta, 24/10" */
export function diaLegivel(iso: string): string {
  const d = civil(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${DIAS[d.getDay()]}, ${dd}/${mm}`;
}

/** Peças do cartão de dia: { semana: "sex", numero: "24", mes: "out" } */
export function partesDoDia(iso: string) {
  const d = civil(iso);
  return { semana: DIAS_CURTOS[d.getDay()], numero: String(d.getDate()), mes: MESES_CURTOS[d.getMonth()] };
}

/** "R$ 50", "R$ 1.200", "R$ 37,50" (sem centavos quando é redondo) */
export function reais(v: number): string {
  const [int, dec] = v.toFixed(2).split(".");
  const milhar = int.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return dec === "00" ? `R$ ${milhar}` : `R$ ${milhar},${dec}`;
}

/** Só os dias com pelo menos um horário livre. */
export function diasAbertos(dias: DiaAgenda[]): DiaAgenda[] {
  return dias.filter((d) => d.slots.some((s) => s.available));
}

/** A mensagem que chega no WhatsApp dela. */
export function mensagemAgendamento(p: PedidoAgenda): string {
  const servico = p.tecnica ? `${p.servico} — ${p.tecnica}` : p.servico;
  const nome = p.nome.trim();
  return [
    "Oi, Tayssa! Quero agendar pelo site.",
    "",
    `Serviço: ${servico}`,
    `Dia: ${diaLegivel(p.dia)}`,
    `Horário: ${horaLegivel(p.hora)}`,
    ...(p.valor != null ? [`Valor: ${reais(p.valor)}`] : []),
    ...(nome ? [`Nome: ${nome}`] : []),
    "",
    `Pode me mandar a chave Pix do sinal de ${reais(p.sinal)} para eu garantir o horário?`,
  ].join("\n");
}
