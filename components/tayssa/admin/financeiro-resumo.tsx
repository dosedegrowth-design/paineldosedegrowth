import { FORMAS, LISTA_FORMAS, brl, diaMes, type ResumoDoRelatorio, type ResumoFinanceiro } from "@/lib/tayssa/financeiro";

/**
 * A divisão Tayssa/Larissa do período no modelo do repasse (Lucas,
 * 17/11/2026): toda cliente paga no salão (Pix ou maquininha da Larissa) e a
 * Larissa repassa a parte da Tayssa por quinzena, do dia 1 ao 15 no dia 15 e
 * do dia 16 ao fim do mês no dia 1º. Por isso aqui não existe "já recebido"
 * nem "a receber" da cliente: a Tayssa tem o repasse, com a data.
 */
const pct = (n: number) => `${String(Math.round(n * 10) / 10).replace(".", ",")}%`;

export function DivisaoTabela({ resumo, larissa, pctPadrao = 70 }: { resumo: ResumoDoRelatorio; larissa: string; pctPadrao?: number }) {
  const pctT = resumo.pctTayssa ?? pctPadrao;
  return (
    <div className="tyaf-partes">
      <div className="tyaf-parte">
        <p className="tyaf-parte__quem">
          <b>Tayssa</b>
          <span>{pct(pctT)}</span>
        </p>
        <strong className="tya-num">{brl(resumo.tayssa)}</strong>
        <ul className="tyaf-parte__repasses">
          {resumo.repasses.map((q) => (
            <li key={q.inicio}>
              <span>
                Repasse dia {diaMes(q.repasseEm)} <small>({q.nome})</small>
              </span>
              <b className="tya-num">{brl(q.tayssa)}</b>
            </li>
          ))}
        </ul>
      </div>
      <div className="tyaf-parte">
        <p className="tyaf-parte__quem">
          <b>{larissa}</b>
          <span>{pct(100 - pctT)}</span>
        </p>
        <strong className="tya-num">{brl(resumo.larissa)}</strong>
        <p className="tyaf-parte__nota">Fica no salão: as clientes pagam no Pix ou na maquininha dela.</p>
      </div>
    </div>
  );
}

/** O repasse de cada quinzena do período, com os dias, a data e o valor. */
export function RepasseLista({ resumo }: { resumo: ResumoDoRelatorio }) {
  return (
    <ul className="tyaf-repasse">
      {resumo.repasses.map((q) => (
        <li key={q.inicio}>
          <div>
            <b>{q.nome}</b>
            <span>
              {diaMes(q.inicio)} a {diaMes(q.fim)} · {q.atendimentos} {q.atendimentos === 1 ? "atendimento" : "atendimentos"} · faturamento {brl(q.faturamento)}
            </span>
          </div>
          <div className="tyaf-repasse__valor">
            <b className="tya-num">{brl(q.tayssa)}</b>
            <span>repasse dia {diaMes(q.repasseEm)}</span>
          </div>
        </li>
      ))}
      {resumo.repasses.length > 1 ? (
        <li className="tyaf-repasse__total">
          <div>
            <b>Total do período</b>
          </div>
          <div className="tyaf-repasse__valor">
            <b className="tya-num">{brl(resumo.tayssa)}</b>
          </div>
        </li>
      ) : null}
    </ul>
  );
}

/** Como as clientes pagaram no salão (Pix, dinheiro, cartão), quando a forma foi informada. */
export function FormasDePagamento({ resumo }: { resumo: ResumoFinanceiro }) {
  const informado = LISTA_FORMAS.reduce((s, f) => s + resumo.porForma[f], 0);
  const semForma = Math.max(0, Math.round((resumo.bruto - informado) * 100) / 100);
  const linhas = [
    ...LISTA_FORMAS.map((f) => ({ id: f as string, nome: FORMAS[f], valor: resumo.porForma[f] })),
    { id: "pendente", nome: "Forma não informada", valor: semForma },
  ].filter((l) => l.valor > 0 || l.id === "pix" || l.id === "dinheiro");
  const maior = Math.max(1, ...linhas.map((l) => l.valor));
  return (
    <ul className="tyaf-formas">
      {linhas.map((l) => (
        <li key={l.id} data-forma={l.id}>
          <span className="tyaf-formas__nome">{l.nome}</span>
          <span className="tyaf-formas__barra" aria-hidden>
            <i style={{ width: `${(l.valor / maior) * 100}%` }} />
          </span>
          <b className="tya-num">{brl(l.valor)}</b>
        </li>
      ))}
      <li className="tyaf-formas__total">
        <span className="tyaf-formas__nome">Faturamento</span>
        <span />
        <b className="tya-num">{brl(resumo.bruto)}</b>
      </li>
    </ul>
  );
}
