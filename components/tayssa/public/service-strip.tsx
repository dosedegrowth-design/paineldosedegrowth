"use client";

import { useEffect, useRef, useState } from "react";
import type { ServiceRow } from "@/lib/tayssa/types";
import { Icone, type IconeNome } from "@/components/tayssa/ui/icones";
import { linkDoServico } from "@/components/tayssa/public/services";
import { LinkAgendar } from "@/components/tayssa/public/agendar";

/** O gesto de cada cuidado, pelo nome (serviço novo acha o seu sozinho; o resto cai na flor). */
function iconeDo(slug: string, nome: string): IconeNome {
  const n = `${slug} ${nome}`.toLowerCase();
  if (/manuten/.test(n)) return "calendario";
  if (/remo[cç]/.test(n)) return "brilho";
  if (/sobrancelh|brow/.test(n)) return "flor";
  if (/l[aá]bio|lip|gloss|boca/.test(n)) return "coracao";
  if (/volume|fox|lash|c[ií]lio|extens/.test(n)) return "olho";
  return "flor";
}
/** As cores da casa, em rodízio: o carrossel é a paleta inteira. */
const CORES = ["vinho", "magenta", "rosa", "ameixa", "bordo", "blush"] as const;

/**
 * Os serviços em carrossel logo depois da abertura. Carrossel de verdade:
 * o dedo passa para o lado, um cartão de cada vez (encaixa no meio), e os
 * pontinhos embaixo mostram onde está e levam a cada cartão. Nada anda
 * sozinho: antes a fileira corria para o lado enquanto a página descia.
 * Cada cartão abre a folha de agendar com o serviço já escolhido.
 */
export function ServiceStrip({ services, scheduleUrl }: { services: ServiceRow[]; scheduleUrl: string }) {
  const trilho = useRef<HTMLUListElement>(null);
  const [atual, setAtual] = useState(0);
  const lista = services.filter((s) => s.slug !== "outro");

  // o cartão do meio é o atual (um cálculo por quadro, só quando rola)
  useEffect(() => {
    const t = trilho.current;
    if (!t) return;
    let raf = 0;
    const medir = () => {
      raf = 0;
      const meio = t.scrollLeft + t.clientWidth / 2;
      let melhor = 0;
      let menor = Infinity;
      Array.from(t.children).forEach((el, i) => {
        const li = el as HTMLElement;
        const d = Math.abs(li.offsetLeft + li.offsetWidth / 2 - meio);
        if (d < menor) {
          menor = d;
          melhor = i;
        }
      });
      setAtual(melhor);
    };
    const aoRolar = () => {
      if (!raf) raf = requestAnimationFrame(medir);
    };
    t.addEventListener("scroll", aoRolar, { passive: true });
    return () => {
      t.removeEventListener("scroll", aoRolar);
      cancelAnimationFrame(raf);
    };
  }, []);

  const irPara = (i: number) => {
    const t = trilho.current;
    const li = t?.children[i] as HTMLElement | undefined;
    if (!t || !li) return;
    t.scrollTo({ left: li.offsetLeft - (t.clientWidth - li.offsetWidth) / 2, behavior: "smooth" });
  };

  if (!lista.length) return null;

  return (
    <section className="tyfx" aria-label="Serviços em destaque">
      {/* gesto lateral do trackpad fica com o carrossel (o Lenis só cuida do vertical) */}
      <ul ref={trilho} className="tyfx__trilho" data-lenis-prevent-horizontal="">
        {lista.map((s, i) => (
          <li key={s.id} className="tyfx__item">
            <LinkAgendar
              className="tyfx__cartao ty-ico-gatilho"
              data-cor={CORES[i % CORES.length]}
              href={linkDoServico(scheduleUrl, s.name)}
              servico={s.slug}
              aria-label={`Agendar ${s.name}`}
            >
              <span className="tyfx__selo">
                <Icone nome={iconeDo(s.slug, s.name)} className="tyfx__icone" />
              </span>
              <span className="tyfx__nome">{s.name}</span>
              <span className="tyfx__acao" aria-hidden>
                Agendar
                <span className="ty-btn__arrow" />
              </span>
            </LinkAgendar>
          </li>
        ))}
      </ul>
      {lista.length > 1 ? (
        <div className="tyfx__pontos">
          {lista.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className="tyfx__ponto"
              data-on={i === atual}
              aria-label={`Ver ${s.name}`}
              aria-current={i === atual ? "true" : undefined}
              onClick={() => irPara(i)}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
