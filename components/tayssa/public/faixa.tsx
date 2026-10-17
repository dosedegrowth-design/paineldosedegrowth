"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionValueEvent } from "framer-motion";
import { useRolagemY } from "@/components/tayssa/ui/rolagem";
import { LinkAgendar } from "@/components/tayssa/public/agendar";
import { Bloom } from "@/components/tayssa/flora/bloom";

/**
 * A faixa que corre sozinha logo depois da abertura (como a da iWin):
 * os serviços da casa em sequência, com a flor girando entre eles. A
 * lista é duplicada para o laço não ter emenda; o mouse em cima pausa.
 */
export function Faixa({ itens }: { itens: string[] }) {
  const lista = itens.length ? itens : ["Cílios", "VIP"];
  const volta = [...lista, ...lista, ...lista];
  return (
    <div className="ty-faixa" aria-hidden>
      <div className="ty-faixa__trilho" data-janela>
        {[0, 1].map((k) => (
          <div key={k} className="ty-faixa__trilho" style={{ animation: "none" }}>
            {volta.map((t, i) => (
              <span key={`${k}-${i}`} className="ty-faixa__item">
                {t}
                <span className="ty-faixa__flor" data-janela-item>
                  <Bloom seed={(i % 7) + 2} tom={i % 2 ? "rosa" : "magenta"} />
                </span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** O caminho mais curto até ela: aparece depois da abertura e some no fim. */
export function AgendarFlutua({ url }: { url: string }) {
  const y = useRolagemY();
  const [on, setOn] = useState(false);
  // altura da tela e da página medidas só quando mudam; no scroll, só conta
  const medidas = useRef({ tela: 0, fim: Infinity });
  const visivel = (v: number) => v > medidas.current.tela * 0.85 && v < medidas.current.fim;
  useEffect(() => {
    const medir = () => {
      const tela = document.documentElement.clientHeight;
      medidas.current = { tela, fim: document.documentElement.scrollHeight - tela - 260 };
      const v = window.scrollY;
      setOn(v > tela * 0.85 && v < medidas.current.fim);
    };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(document.body);
    window.addEventListener("resize", medir);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", medir);
    };
  }, []);
  useMotionValueEvent(y, "change", (v) => setOn(visivel(v)));
  return (
    <LinkAgendar
      href={url}
      className="ty-agendar-flutua"
      data-on={on}
      aria-hidden={!on}
      tabIndex={on ? undefined : -1}
    >
      <span className="ty-agendar-flutua__flor" aria-hidden>
        <Bloom seed={5} tom="pétala" />
      </span>
      Agendar
    </LinkAgendar>
  );
}
