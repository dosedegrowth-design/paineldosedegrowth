"use client";

import { useEffect, useRef } from "react";
import { useMotionValueEvent, useReducedMotion } from "framer-motion";
import { useProgressoRolagem } from "@/components/tayssa/ui/rolagem";
import type { ServiceRow } from "@/lib/tayssa/types";
import { Icone, type IconeNome } from "@/components/tayssa/ui/icones";
import { linkDoServico } from "@/components/tayssa/public/services";
import { LinkAgendar } from "@/components/tayssa/public/agendar";

/** O gesto de cada cuidado; serviço novo cai na flor. */
const ICONE: Record<string, IconeNome> = {
  "aplicacao-cilios": "olho",
  "manutencao-cilios": "calendario",
  "design-sobrancelhas": "flor",
  "lip-spa": "coracao",
  "limpeza-de-pele": "brilho",
};
/** As cores da casa, em rodízio: a faixa é a paleta inteira de uma vez. */
const CORES = ["vinho", "magenta", "rosa", "ameixa", "bordo", "blush"] as const;

/**
 * A faixa de serviços logo depois da abertura (a fileira colorida do
 * Delta). Os nomes vêm do catálogo de verdade; cada cartão leva ao
 * WhatsApp com o serviço já na mensagem.
 *
 * A faixa é uma rolagem lateral de verdade: o dedo arrasta para o lado
 * (e o trackpad no computador). Enquanto ninguém mexe nela, ela desliza
 * sozinha conforme a página desce, percorrendo toda a largura. Antes ela
 * só andava com a página (um `transform` preso à rolagem) e o arrasto
 * lateral não fazia nada. Quando alguém rola a faixa (ou entra nela pelo
 * teclado), ela passa a ser de quem mexeu e a página para de empurrar.
 * Um dedo que só desce a página por cima dela não conta: quem decide é a
 * própria rolagem lateral, não o toque.
 */
export function ServiceStrip({ services, scheduleUrl }: { services: ServiceRow[]; scheduleUrl: string }) {
  const ref = useRef<HTMLElement>(null);
  const janela = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const solta = useRef(false);
  // onde a página deixou a faixa por último: rolagem fora disso é de alguém
  const alvo = useRef<number | null>(null);
  const scrollYProgress = useProgressoRolagem(ref, ["start end", "end start"]);

  // a página empurra a faixa: mesmo trecho de antes (10% a 90% da passagem)
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const j = janela.current;
    if (!j || solta.current || reduced) return;
    const curso = j.scrollWidth - j.clientWidth;
    if (curso <= 0) return;
    const p = Math.min(1, Math.max(0, (v - 0.1) / 0.8));
    alvo.current = Math.round(p * curso);
    j.scrollLeft = alvo.current;
  });

  useEffect(() => {
    const j = janela.current;
    if (!j) return;
    const soltar = () => {
      solta.current = true;
    };
    const aoRolar = () => {
      if (solta.current) return;
      if (alvo.current !== null && Math.abs(j.scrollLeft - alvo.current) <= 2) return;
      soltar();
    };
    j.addEventListener("scroll", aoRolar, { passive: true });
    j.addEventListener("focusin", soltar);
    return () => {
      j.removeEventListener("scroll", aoRolar);
      j.removeEventListener("focusin", soltar);
    };
  }, []);

  const lista = services.filter((s) => s.slug !== "outro");
  if (!lista.length) return null;

  return (
    <section ref={ref} className="tyfx" aria-label="Serviços em destaque">
      {/* gesto lateral do trackpad fica com a faixa (o Lenis só cuida do vertical) */}
      <div ref={janela} className="tyfx__janela" data-lenis-prevent-horizontal="">
        <ul className="tyfx__trilho">
          {lista.map((s, i) => (
            <li key={s.id}>
              <LinkAgendar
                className="tyfx__cartao ty-ico-gatilho"
                data-cor={CORES[i % CORES.length]}
                href={linkDoServico(scheduleUrl, s.name)}
                servico={s.slug}
                aria-label={`Agendar ${s.name}`}
              >
                <span className="tyfx__n">{String(i + 1).padStart(2, "0")}</span>
                <Icone nome={ICONE[s.slug] ?? "flor"} className="tyfx__icone" />
                <span className="tyfx__nome">{s.name}</span>
                <span className="tyfx__acao" aria-hidden>
                  Agendar
                  <span className="ty-btn__arrow" />
                </span>
              </LinkAgendar>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
