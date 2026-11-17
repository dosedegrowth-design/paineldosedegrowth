import { ROUTES } from "@/lib/tayssa/config";
import { SITUACAO_PAGAMENTO, brl, type SituacaoPagamento } from "@/lib/tayssa/financeiro";
import { dayMonth, plural, weekdayShort } from "@/lib/tayssa/format";
import type { AtendimentoRealizado } from "@/lib/tayssa/queries/gestao";
import { TransitionLink } from "@/components/tayssa/ui/transition";

/**
 * "Quem eu atendi" na Visão geral (Lucas, 17/11/2026: "um card de datas e um
 * card de atendimentos realizados, assim ela escolhe a data e vê quem ela
 * atendeu nesse período; tá confuso pra ela ver só pelo relatório").
 * Os atendimentos realizados do período escolhido no cartão de datas, por
 * dia (o mais novo primeiro) e, dentro do dia, pela hora. Os primeiros
 * aparecem aqui; o resto, em Atendimentos realizados.
 */

const TOM: Record<SituacaoPagamento, "ok" | "warn" | "bad" | "quiet"> = {
  pago: "ok",
  parcial: "warn",
  pendente: "bad",
  sem_valor: "quiet",
};

export function AtendimentosDoPeriodo({
  lista,
  hoje,
  rotulo,
  verTodos,
  limite = 10,
}: {
  lista: AtendimentoRealizado[];
  hoje: string;
  rotulo: string;
  verTodos: string;
  limite?: number;
}) {
  // o dia mais novo primeiro; no dia, pela hora (sem hora, registrado pela ficha, no fim do dia)
  const ordem = [...lista].sort((a, b) => b.data.localeCompare(a.data) || (a.hora ?? "99").localeCompare(b.hora ?? "99"));
  const mostrados = ordem.slice(0, limite);
  const dias: { iso: string; itens: AtendimentoRealizado[] }[] = [];
  for (const a of mostrados) {
    const ultimo = dias[dias.length - 1];
    if (ultimo?.iso === a.data) ultimo.itens.push(a);
    else dias.push({ iso: a.data, itens: [a] });
  }
  const clientes = new Set(lista.map((a) => a.clienteId)).size;
  const total = lista.reduce((s, a) => s + (a.valor ?? 0), 0);
  const ontem = (() => {
    const [y, m, d] = hoje.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d - 1)).toISOString().slice(0, 10);
  })();
  const nomeDoDia = (iso: string) => `${iso === hoje ? "Hoje · " : iso === ontem ? "Ontem · " : ""}${weekdayShort(iso)}, ${dayMonth(iso)}`;

  return (
    <div className="tyad-quem">
      <div className="tya-head">
        <h2>Atendimentos realizados</h2>
        {lista.length ? (
          <TransitionLink href={verTodos} className="ty-link ty-link--caps">
            Ver todos
          </TransitionLink>
        ) : null}
      </div>
      <p className="tyad-quem__resumo">
        <span>Quem você atendeu · {rotulo}</span>
        {lista.length ? (
          <b>
            {lista.length} {plural(lista.length, "atendimento", "atendimentos")} · {clientes} {plural(clientes, "cliente", "clientes")} · {brl(total)}
          </b>
        ) : null}
      </p>
      {dias.length ? (
        <div className="tyad-quem__dias">
          {dias.map((d) => (
            <section key={d.iso} className="tyad-quem__dia" aria-label={nomeDoDia(d.iso)}>
              <h3>{nomeDoDia(d.iso)}</h3>
              <ul>
                {d.itens.map((a) => (
                  <li key={a.id}>
                    <span className="tyad-quem__hora tya-num" data-sem-hora={a.hora ? undefined : true}>
                      {a.hora ?? "sem hora"}
                    </span>
                    <div className="tyad-quem__corpo">
                      <TransitionLink href={ROUTES.adminClient(a.clienteId)} className="tyad-quem__nome">
                        {a.cliente}
                      </TransitionLink>
                      <span className="tyad-quem__servico">{a.servico}</span>
                    </div>
                    <div className="tyad-quem__valor">
                      <b className="tya-num">{a.valor != null ? brl(a.valor) : "sem valor"}</b>
                      <span className={`tya-pill tya-pill--${TOM[a.situacao]}`}>{SITUACAO_PAGAMENTO[a.situacao]}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <p className="tyad-quem__vazio">Nenhum atendimento realizado neste período. Escolha outra data no cartão acima.</p>
      )}
      {lista.length > mostrados.length ? (
        <TransitionLink href={verTodos} className="tya-btn tya-btn--ghost tyad-quem__mais">
          Ver os {lista.length} atendimentos do período
        </TransitionLink>
      ) : null}
    </div>
  );
}
