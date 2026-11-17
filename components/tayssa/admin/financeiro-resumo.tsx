import { FORMAS, LISTA_FORMAS, brl, type ResumoFinanceiro } from "@/lib/tayssa/financeiro";
import { Medidor } from "@/components/tayssa/admin/graficos";

/**
 * A divisão Tayssa/Larissa do período (Financeiro, Visão geral e
 * Relatórios): o percentual, a parte de cada uma no faturado e, dentro
 * dela, o que já entrou e o que falta receber, com a barrinha do quanto já
 * entrou.
 */
export function DivisaoTabela({ resumo, larissa }: { resumo: ResumoFinanceiro; larissa: string }) {
  const pct = (n: number) => `${String(n).replace(".", ",")}%`;
  return (
    <div className="tyaf-partes">
      {[
        { nome: "Tayssa", p: resumo.tayssa, quem: "tayssa" as const },
        { nome: larissa, p: resumo.larissa, quem: "larissa" as const },
      ].map(({ nome, p, quem }) => (
        <div key={nome} className="tyaf-parte">
          <p className="tyaf-parte__quem">
            <b>{nome}</b>
            <span>{pct(p.pct)}</span>
          </p>
          <strong className="tya-num">{brl(p.bruto)}</strong>
          <dl>
            <div>
              <dt>Já recebido</dt>
              <dd className="tya-num">{brl(p.recebido)}</dd>
            </div>
            <div>
              <dt>A receber</dt>
              <dd className="tya-num">{brl(p.aReceber)}</dd>
            </div>
          </dl>
          <Medidor parte={p.recebido} total={p.bruto} quem={quem} />
        </div>
      ))}
    </div>
  );
}

/** Quanto entrou em cada forma de pagamento, e o pendente, com a barra do tamanho de cada um. */
export function FormasDePagamento({ resumo }: { resumo: ResumoFinanceiro }) {
  const linhas = [
    ...LISTA_FORMAS.map((f) => ({ id: f as string, nome: FORMAS[f], valor: resumo.porForma[f] })),
    { id: "pendente", nome: "Pendente (não recebido)", valor: resumo.pendente },
  ].filter((l) => l.valor > 0 || l.id === "pix" || l.id === "dinheiro" || l.id === "pendente");
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
        <span className="tyaf-formas__nome">Total efetivamente recebido</span>
        <span />
        <b className="tya-num">{brl(resumo.recebido)}</b>
      </li>
    </ul>
  );
}
