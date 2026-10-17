"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import type { ServiceRow } from "@/lib/tayssa/types";
import { Icone, type IconeNome } from "@/components/tayssa/ui/icones";
import { linkDoServico } from "@/components/tayssa/public/services";

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
 * WhatsApp com o serviço já na mensagem. A faixa desliza para o lado
 * conforme a página desce — e percorre toda a sua largura, então no
 * celular todos os cartões passam pela tela sem precisar arrastar.
 */
export function ServiceStrip({ services, scheduleUrl }: { services: ServiceRow[]; scheduleUrl: string }) {
  const ref = useRef<HTMLElement>(null);
  const trilho = useRef<HTMLUListElement>(null);
  const reduced = useReducedMotion();
  const [sobra, setSobra] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0.1, 0.9], reduced ? [0, 0] : [0, -sobra]);

  useEffect(() => {
    const medir = () => {
      const t = trilho.current;
      if (!t) return;
      setSobra(Math.max(0, t.scrollWidth - (t.parentElement?.clientWidth ?? 0)));
    };
    medir();
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, [services.length]);

  const lista = services.filter((s) => s.slug !== "outro");
  if (!lista.length) return null;

  return (
    <section ref={ref} className="tyfx" aria-label="Serviços em destaque">
      <div className="tyfx__janela">
        <motion.ul ref={trilho} className="tyfx__trilho" style={{ x }}>
          {lista.map((s, i) => (
            <li key={s.id}>
              <a
                className="tyfx__cartao ty-ico-gatilho"
                data-cor={CORES[i % CORES.length]}
                href={linkDoServico(scheduleUrl, s.name)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Agendar ${s.name} no WhatsApp`}
              >
                <span className="tyfx__n">{String(i + 1).padStart(2, "0")}</span>
                <Icone nome={ICONE[s.slug] ?? "flor"} className="tyfx__icone" />
                <span className="tyfx__nome">{s.name}</span>
                <span className="tyfx__acao" aria-hidden>
                  Agendar
                  <span className="ty-btn__arrow" />
                </span>
              </a>
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
