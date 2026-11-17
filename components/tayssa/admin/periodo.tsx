import Link from "next/link";
import { parametrosDoPeriodo, periodoVizinho, resolverPeriodo, type Periodo, type TipoPeriodo } from "@/lib/tayssa/financeiro";

/**
 * O seletor de período do painel (Atendimentos realizados, Financeiro,
 * Visão geral e Relatórios): atalhos (hoje, semana, mês…), as setas para o
 * período ao lado e o período personalizado. Funciona sem JavaScript
 * (links e um formulário GET), e mantém os outros filtros do endereço.
 */
export function PeriodoSeletor({
  base,
  periodo,
  hoje,
  opcoes,
  manter = {},
  ancora = "",
}: {
  base: string;
  periodo: Periodo;
  hoje: string;
  opcoes: { tipo: TipoPeriodo; rotulo: string }[];
  manter?: Record<string, string | undefined>;
  ancora?: string;
}) {
  const fixos = Object.fromEntries(Object.entries(manter).filter(([, v]) => v)) as Record<string, string>;
  const link = (p: Periodo) => `${base}?${new URLSearchParams({ ...fixos, ...parametrosDoPeriodo(p) }).toString()}${ancora}`;
  const ativo = (tipo: TipoPeriodo) => {
    const alvo = resolverPeriodo({ periodo: tipo }, hoje);
    return alvo.de === periodo.de && alvo.ate === periodo.ate;
  };
  const anterior = periodoVizinho(periodo, -1, hoje);
  const seguinte = periodoVizinho(periodo, 1, hoje);
  return (
    <div className="tyap">
      <div className="tyap__atalhos" role="group" aria-label="Período">
        {opcoes.map((o) => (
          <Link key={o.tipo} href={link(resolverPeriodo({ periodo: o.tipo }, hoje))} prefetch={false} scroll={false} className="tya-chip" data-on={ativo(o.tipo) || undefined} aria-current={ativo(o.tipo) ? "true" : undefined}>
            {o.rotulo}
          </Link>
        ))}
      </div>
      <div className="tyap__nav">
        <Link href={link(anterior)} prefetch={false} scroll={false} className="tyac__seta" aria-label={`Antes: ${anterior.rotulo}`}>
          <svg viewBox="0 0 24 24" aria-hidden>
            <path d="M14.5 6 8.5 12l6 6" />
          </svg>
        </Link>
        <strong className="tyap__rotulo">{periodo.rotulo}</strong>
        <Link href={link(seguinte)} prefetch={false} scroll={false} className="tyac__seta" aria-label={`Depois: ${seguinte.rotulo}`}>
          <svg viewBox="0 0 24 24" aria-hidden>
            <path d="m9.5 6 6 6-6 6" />
          </svg>
        </Link>
      </div>
      <details className="tyap__livre" open={periodo.tipo === "personalizado" || undefined}>
        <summary>Escolher as datas</summary>
        <form method="get" action={base} className="tyap__form">
          {Object.entries(fixos).map(([k, v]) => (
            <input key={k} type="hidden" name={k} value={v} />
          ))}
          <input type="hidden" name="periodo" value="personalizado" />
          <label>
            <span>De</span>
            <input type="date" name="de" defaultValue={periodo.de} className="tya-field" required />
          </label>
          <label>
            <span>Até</span>
            <input type="date" name="ate" defaultValue={periodo.ate} className="tya-field" required />
          </label>
          <button type="submit" className="tya-btn tya-btn--ghost">
            Ver o período
          </button>
        </form>
      </details>
    </div>
  );
}
