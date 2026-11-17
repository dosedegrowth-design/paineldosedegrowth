import type { CSSProperties } from "react";
import { brl } from "@/lib/tayssa/financeiro";
import {
  arcos,
  escala,
  passoDosRotulos,
  reaisCurto,
  rotuloDaColuna,
  type BarraDeServico,
  type Fatia,
  type SerieDoPeriodo,
} from "@/lib/tayssa/graficos";
import { plural } from "@/lib/tayssa/format";
import { ComDica } from "@/components/tayssa/admin/grafico-dica";

/**
 * Os gráficos do painel (Visão geral e Financeiro; Lucas, 17/11/2026: "o
 * Dash tá mó seco"). Desenhados no servidor, em HTML e SVG, e animados só
 * com CSS na hora de abrir (quem pede menos movimento no celular vê tudo
 * parado). Cores validadas para daltonismo e contraste (vinho, dourado,
 * azul petróleo, terracota; o pendente em rosé claro), em `admin.css`.
 * As contas moram em `lib/tayssa/graficos.ts`.
 */

const NOME_DO_GRUPO = { dia: "dia", semana: "semana", mes: "mês" } as const;

function v(vars: Record<string, string | number>): CSSProperties {
  return vars as CSSProperties;
}

/** Faturamento por dia (semana, mês): colunas finas, o maior com o valor no topo, hoje marcado. */
export function ColunasDoPeriodo({ serie }: { serie: SerieDoPeriodo }) {
  const { topo, marcas } = escala(serie.maior);
  const n = serie.pontos.length;
  const passo = passoDosRotulos(n);
  const iMaior = serie.maior > 0 ? serie.pontos.findIndex((p) => p.valor === serie.maior) : -1;
  const grupo = NOME_DO_GRUPO[serie.grupo];
  return (
    <figure className="tyg tyg-colunas" style={v({ "--n": n, "--passo": `${Math.min(30, Math.round(420 / n))}ms` })}>
      <figcaption className="tyg__titulo">
        <b>Faturamento por {grupo}</b>
        <span>valor dos atendimentos realizados</span>
      </figcaption>
      <ComDica className="tyg-colunas__corpo" rotulo={`Faturamento por ${grupo}. Use as setas para ver cada ${grupo}.`}>
        <div className="tyg-colunas__eixo" aria-hidden>
          {marcas.map((m) => (
            <span key={m} style={v({ "--y": m / topo })}>
              {reaisCurto(m)}
            </span>
          ))}
        </div>
        <div className="tyg-colunas__plot">
          {marcas.map((m) => (
            <i key={m} className="tyg-colunas__grade" style={v({ "--y": m / topo })} aria-hidden />
          ))}
          {serie.pontos.map((p, i) => (
            <div
              key={p.inicio}
              className="tyg-colunas__faixa"
              data-dica={brl(p.valor)}
              data-dica-rotulo={`${p.rotuloLongo} · ${p.atendimentos} ${plural(p.atendimentos, "atendimento", "atendimentos")}`}
              data-atual={p.atual || undefined}
              style={v({ "--i": i })}
            >
              {p.valor > 0 ? <span className="tyg-colunas__barra" style={v({ "--h": p.valor / topo })} /> : null}
              {i === iMaior ? (
                <span
                  className="tyg-colunas__topo"
                  data-borda={i < 2 ? "inicio" : i > n - 3 ? "fim" : undefined}
                  style={v({ "--h": p.valor / topo })}
                >
                  {reaisCurto(p.valor)}
                </span>
              ) : null}
            </div>
          ))}
        </div>
        <div className="tyg-colunas__x" aria-hidden>
          {serie.pontos.map((p, i) => {
            const r = rotuloDaColuna(p, serie.grupo, n);
            return (
              <span key={p.inicio} data-atual={p.atual || undefined}>
                {i % passo === 0 ? (
                  <>
                    {r.cima ? <small>{r.cima}</small> : null}
                    {r.baixo}
                  </>
                ) : null}
              </span>
            );
          })}
        </div>
      </ComDica>
      <details className="tyg-tabela">
        <summary>Ver em tabela</summary>
        <table>
          <thead>
            <tr>
              <th scope="col">{serie.grupo === "dia" ? "Dia" : serie.grupo === "semana" ? "Semana" : "Mês"}</th>
              <th scope="col">Atendimentos</th>
              <th scope="col" className="tya-num">
                Faturamento
              </th>
            </tr>
          </thead>
          <tbody>
            {serie.pontos.map((p) => (
              <tr key={p.inicio}>
                <td>{p.rotuloLongo}</td>
                <td>{p.atendimentos}</td>
                <td className="tya-num">{brl(p.valor)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}

/** "Como entrou": a rosca do período (formas de pagamento e o pendente) com a legenda dos valores. */
export function RoscaDoPeriodo({ fatias, total }: { fatias: Fatia[]; total: number }) {
  const R = 46;
  const vazio = !fatias.length;
  const partes = arcos(fatias);
  // vão de ~2px entre as fatias (na volta de 100); com uma fatia só, o anel fecha
  const vao = fatias.length > 1 ? 0.9 : 0;
  return (
    <figure className="tyg tyg-rosca">
      <figcaption className="tyg__titulo">
        <b>Como entrou o dinheiro</b>
        <span>como as clientes pagaram no salão</span>
      </figcaption>
      <div className="tyg-rosca__corpo">
        <ComDica className="tyg-rosca__desenho" rotulo="Como entrou o dinheiro. Use as setas para ver cada parte.">
          <svg viewBox="0 0 120 120" aria-hidden>
            {vazio ? <circle className="tyg-rosca__trilho" cx="60" cy="60" r={R} /> : null}
            <g transform="rotate(-90 60 60)">
              {fatias.map((f, i) => {
                const a = partes[i];
                const tam = Math.max(0.0001, (a.fim - a.inicio) * 100 - vao);
                const ang = a.meio * 2 * Math.PI - Math.PI / 2;
                return (
                  <circle
                    key={f.id}
                    className="tyg-rosca__fatia"
                    data-fatia={f.id}
                    cx="60"
                    cy="60"
                    r={R}
                    pathLength={100}
                    strokeDasharray={`${tam} ${100 - tam}`}
                    strokeDashoffset={-(a.inicio * 100 + vao / 2)}
                    style={v({ "--i": i })}
                    data-dica={`${brl(f.valor)} · ${f.pct}%`}
                    data-dica-rotulo={f.nome}
                    data-dica-x={((60 + R * Math.cos(ang)) / 120).toFixed(4)}
                    data-dica-y={((60 + R * Math.sin(ang)) / 120).toFixed(4)}
                  />
                );
              })}
            </g>
          </svg>
          <div className="tyg-rosca__meio" aria-hidden={vazio || undefined}>
            {vazio ? (
              <span>sem valores</span>
            ) : (
              <>
                <span className="tyg-rosca__moeda">R$</span>
                <b data-longo={reaisCurto(total).length > 8 || undefined}>{reaisCurto(total).replace(/^R\$\s*/, "")}</b>
                <span>faturado</span>
              </>
            )}
          </div>
        </ComDica>
        {vazio ? (
          <p className="tyg-vazio">Nenhum atendimento com valor neste período.</p>
        ) : (
          <ul className="tyg-legenda">
            {fatias.map((f, i) => (
              <li key={f.id} data-fatia={f.id} style={v({ "--i": i })}>
                <i aria-hidden />
                <span>{f.nome}</span>
                <b className="tya-num">{brl(f.valor)}</b>
                <small className="tya-num">{f.pct}%</small>
              </li>
            ))}
          </ul>
        )}
      </div>
    </figure>
  );
}

/** Serviços mais feitos: barras deitadas, a maior primeiro, o número na ponta. */
export function BarrasDeServicos({ barras }: { barras: BarraDeServico[] }) {
  const max = Math.max(1, ...barras.map((b) => b.vezes));
  return (
    <figure className="tyg tyg-barras">
      <figcaption className="tyg__titulo">
        <b>Serviços mais feitos</b>
        <span>quantas vezes no período</span>
      </figcaption>
      {barras.length ? (
        <ul>
          {barras.map((b, i) => (
            <li key={b.nome} data-outros={b.outros || undefined} style={v({ "--i": i, "--w": b.vezes / max })}>
              <span className="tyg-barras__nome">{b.nome}</span>
              <span className="tyg-barras__linha">
                <span className="tyg-barras__barra" aria-hidden />
                <b className="tya-num">{b.vezes}</b>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="tyg-vazio">Nenhum atendimento realizado neste período.</p>
      )}
    </figure>
  );
}
