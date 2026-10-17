"use client";

import { useRef, type ReactNode } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import type { NumeroSite, NumerosSettings } from "@/lib/tayssa/config";
import { partesDoNumero } from "@/lib/tayssa/numeros";
import { Conta } from "@/components/tayssa/ui/conta";
import { MaskedLines, Reveal } from "@/components/tayssa/ui/reveal";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const TITULO = ["O perfil dela,", <em key="n">em números</em>];

/** Ícone do selo pelo assunto do número. */
function iconeDe(rotulo: string): ReactNode {
  const r = rotulo.toLowerCase();
  if (/visualiza|views|alcan|impress/.test(r)) {
    return (
      <>
        <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
        <circle cx="12" cy="12" r="3" />
      </>
    );
  }
  if (/seguid/.test(r)) {
    return (
      <>
        <circle cx="10" cy="8" r="3.5" />
        <path d="M3.5 19.5a6.5 6.5 0 0 1 13 0M19 8v6M16 11h6" />
      </>
    );
  }
  if (/curt|like|intera|engaj|cora/.test(r)) {
    return <path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z" />;
  }
  return <path d="M12 3.5 14.4 9.6 20.5 12l-6.1 2.4L12 20.5l-2.4-6.1L3.5 12l6.1-2.4z" />;
}

/**
 * O quadro de números: título, os números subindo na tela, e o celular
 * com o Insights dela — o destaque grande, a barra de quem ainda não segue
 * e as linhas — com dois selos flutuando em volta. Tudo sai do que a
 * Tayssa escreveu em Configurações → Números do site; sem número, a seção
 * não existe.
 */
export function Numeros({ numeros, handle }: { numeros: NumerosSettings; handle: string }) {
  const itens = numeros.itens.filter((n) => n.valor && n.rotulo && partesDoNumero(n.valor));
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const visto = useInView(ref, { once: true, amount: 0.25 });
  if (!itens.length) return null;
  const [destaque, segundo] = itens;
  const fonteEPeriodo = [numeros.fonte, numeros.periodo.toLowerCase()].filter(Boolean).join(" · ");

  return (
    <section ref={ref} className="tynu ty-night" id="numeros" aria-label="Números">
      <span className="tynu__marca" aria-hidden>
        {destaque.valor}
      </span>
      <div className="tynu__miolo">
        <div className="tynu__texto">
          <Reveal y={12}>
            <span className="ty-mono tynu__olho">{fonteEPeriodo || "Instagram"}</span>
          </Reveal>
          <MaskedLines as="h2" className="ty-display tynu__titulo" lines={TITULO} />
          <Reveal delay={0.12}>
            <p className="ty-body tynu__lead">
              Direto do {numeros.fonte || "Instagram"} da Tayssa: quanta gente vê o trabalho que sai do estúdio, mês a mês.
            </p>
          </Reveal>

          <ul className="tynu__grade">
            {itens.map((n, i) => (
              <motion.li
                key={`${n.rotulo}-${i}`}
                className="tynu__item"
                initial={reduced ? false : { opacity: 0, y: 26 }}
                animate={visto ? { opacity: 1, y: 0 } : undefined}
                transition={{ duration: 0.8, delay: 0.15 + i * 0.07, ease: EASE }}
              >
                <b className="tynu__valor">
                  <Conta valor={n.valor} atraso={150 + i * 70} />
                </b>
                <span className="tynu__rotulo">{n.rotulo}</span>
                {n.detalhe ? <span className="tynu__detalhe">{n.detalhe}</span> : null}
              </motion.li>
            ))}
          </ul>
        </div>

        <motion.div
          className="tynu__palco"
          initial={reduced ? false : { opacity: 0, y: 60, rotate: 8 }}
          animate={visto ? { opacity: 1, y: 0, rotate: 3 } : undefined}
          transition={{ duration: 1.2, delay: 0.1, ease: EASE }}
        >
          <Insights numeros={numeros} itens={itens} handle={handle} visto={visto || Boolean(reduced)} />
          <Selo n={destaque} lado="esq" />
          {segundo ? <Selo n={segundo} lado="dir" /> : null}
        </motion.div>
      </div>
    </section>
  );
}

function Selo({ n, lado }: { n: NumeroSite; lado: "esq" | "dir" }) {
  return (
    <span className={`tynu__selo tynu__selo--${lado}`} aria-hidden>
      <span className="tynu__selo-rotulo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
          {iconeDe(n.rotulo)}
        </svg>
        {n.rotulo}
      </span>
      <b>
        <Conta valor={n.valor} atraso={500} />
      </b>
    </span>
  );
}

/** O Insights do Instagram dentro do celular, com os números dela. */
function Insights({ numeros, itens, handle, visto }: { numeros: NumerosSettings; itens: NumeroSite[]; handle: string; visto: boolean }) {
  const [destaque, ...linhas] = itens;
  const pct = numeros.nao_seguidores;
  const fmt = (v: number) => v.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
  return (
    <div className="tynu__aparelho" aria-label={`Insights de ${handle}`} role="img">
      <div className="tynu__tela">
        <div className="tynu__app-topo">
          <svg viewBox="0 0 24 24" aria-hidden>
            <path d="M14.5 5.5 8 12l6.5 6.5" />
          </svg>
          <b>Insights</b>
          <span />
        </div>
        <div className="tynu__app-periodo">
          <span>{numeros.periodo || "Últimos 30 dias"}</span>
          <svg viewBox="0 0 24 24" aria-hidden>
            <path d="m7 10 5 5 5-5" />
          </svg>
        </div>
        <div className="tynu__app-destaque">
          <span>{destaque.rotulo}</span>
          <b>
            <Conta valor={destaque.valor} atraso={300} />
          </b>
          {destaque.detalhe ? <small>{destaque.detalhe}</small> : null}
          {pct != null ? (
            <>
              <span className="tynu__app-barra" data-visto={visto || undefined}>
                <i style={{ width: `${pct}%` }} />
                <i style={{ width: `${100 - pct}%` }} />
              </span>
              <span className="tynu__app-legenda">
                <span>{fmt(pct)}% não seguidores</span>
                <span>{fmt(100 - pct)}% seguidores</span>
              </span>
            </>
          ) : null}
        </div>
        <ul className="tynu__app-linhas">
          {linhas.slice(0, 5).map((n, i) => (
            <li key={`${n.rotulo}-${i}`}>
              <span>{n.rotulo}</span>
              <b>
                <Conta valor={n.valor} atraso={400 + i * 90} />
              </b>
            </li>
          ))}
        </ul>
        <p className="tynu__app-fonte">Dados do {numeros.fonte || "Instagram"} de {handle}</p>
      </div>
    </div>
  );
}
