"use client";

import { useEffect, useState } from "react";
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
      <div className="ty-faixa__trilho">
        {[0, 1].map((k) => (
          <div key={k} className="ty-faixa__trilho" style={{ animation: "none" }}>
            {volta.map((t, i) => (
              <span key={`${k}-${i}`} className="ty-faixa__item">
                {t}
                <span className="ty-faixa__flor">
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
  const [on, setOn] = useState(false);
  useEffect(() => {
    const ver = () => {
      const fim = document.documentElement.scrollHeight - window.innerHeight - 260;
      setOn(window.scrollY > window.innerHeight * 0.85 && window.scrollY < fim);
    };
    ver();
    window.addEventListener("scroll", ver, { passive: true });
    return () => window.removeEventListener("scroll", ver);
  }, []);
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="ty-agendar-flutua"
      data-on={on}
      aria-hidden={!on}
      tabIndex={on ? undefined : -1}
    >
      <span className="ty-agendar-flutua__flor" aria-hidden>
        <Bloom seed={5} tom="pétala" />
      </span>
      Agendar
    </a>
  );
}
