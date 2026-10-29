"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useReducedMotion } from "framer-motion";
import type { ServiceRow } from "@/lib/tayssa/types";
import { estiloFoco, midiasDoServico, type CapaServico, type MidiaCatalogo } from "@/lib/tayssa/catalogo";
import { Icone, type IconeNome } from "@/components/tayssa/ui/icones";
import { linkDoServico } from "@/components/tayssa/public/services";
import { LinkAgendar } from "@/components/tayssa/public/agendar";
import { Visor } from "@/components/tayssa/public/rolo";

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
 * Onde mora o cartão da vez: o meio no celular (o trilho tem meia tela de
 * folga de cada lado) e o começo do conteúdo no computador.
 */
const folga = (t: HTMLElement) => parseFloat(getComputedStyle(t).paddingLeft) || 0;

/**
 * As fotos do serviço passando dentro do cartão, a capa primeiro. Duas
 * cópias da fila, cada uma com o espaço do fim dentro dela: andar metade do
 * trilho é andar uma cópia, e a emenda não aparece. Com uma foto só, ela
 * fica parada.
 */
function Tira({ fotos }: { fotos: MidiaCatalogo[] }) {
  if (fotos.length === 1) {
    return (
      <span className="tyfx__tira tyfx__tira--uma" aria-hidden>
        <span className="tyfx__tira-foto">
          <Image src={fotos[0].url} alt="" fill sizes="104px" style={estiloFoco(fotos[0].foco)} draggable={false} />
        </span>
      </span>
    );
  }
  const base: MidiaCatalogo[] = [];
  while (base.length < 6) base.push(...fotos);
  return (
    <span className="tyfx__tira" aria-hidden>
      <span className="tyfx__tira-trilho" style={{ "--dur": `${base.length * 2.8}s` } as CSSProperties}>
        {[...base, ...base].map((m, i) => (
          <span key={`${m.id}-${i}`} className="tyfx__tira-foto">
            <Image src={m.url} alt="" fill sizes="104px" style={estiloFoco(m.foco)} draggable={false} />
          </span>
        ))}
      </span>
    </span>
  );
}

/**
 * Os serviços em carrossel logo depois da abertura. Carrossel de verdade:
 * o dedo passa para o lado, um cartão de cada vez (encaixa no meio), e os
 * pontinhos embaixo mostram onde está e levam a cada cartão. O carrossel
 * não anda sozinho; dentro de cada cartão, as fotos daquele serviço passam.
 * Tocar no cartão abre as fotos grandes (a capa primeiro); o "Agendar" abre
 * a folha de agendar com o serviço já escolhido. Serviço sem foto mostra o
 * ícone do cuidado, e o cartão inteiro agenda, como sempre foi.
 */
export function ServiceStrip({
  services,
  scheduleUrl,
  capas = {},
  rolos = {},
}: {
  services: ServiceRow[];
  scheduleUrl: string;
  /** a capa de cada serviço (`capasDosServicos`), pela slug */
  capas?: Record<string, CapaServico | null>;
  /** as fotos e vídeos de cada serviço (`rolosDosServicos`), pela slug */
  rolos?: Record<string, MidiaCatalogo[]>;
}) {
  const reduced = useReducedMotion();
  const trilho = useRef<HTMLUListElement>(null);
  const [atual, setAtual] = useState(0);
  // o serviço aberto no visor e a foto da vez
  const [visto, setVisto] = useState<{ slug: string; i: number } | null>(null);
  const lista = services.filter((s) => s.slug !== "outro");
  const midias: Record<string, MidiaCatalogo[]> = Object.fromEntries(
    lista.map((s) => [s.slug, midiasDoServico(rolos[s.slug] ?? [], capas[s.slug] ?? null, s.name)])
  );

  // o cartão da vez (um cálculo por quadro, só quando rola)
  useEffect(() => {
    const t = trilho.current;
    if (!t) return;
    let raf = 0;
    const medir = () => {
      raf = 0;
      const primeiro = t.children[0] as HTMLElement | undefined;
      const alvo = t.scrollLeft + folga(t) + (primeiro?.offsetWidth ?? 0) / 2;
      let melhor = 0;
      let menor = Infinity;
      Array.from(t.children).forEach((el, i) => {
        const li = el as HTMLElement;
        const d = Math.abs(li.offsetLeft + li.offsetWidth / 2 - alvo);
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
    const li = t?.children[Math.max(0, Math.min(lista.length - 1, i))] as HTMLElement | undefined;
    if (!t || !li) return;
    t.scrollTo({ left: li.offsetLeft - folga(t), behavior: reduced ? "auto" : "smooth" });
  };

  if (!lista.length) return null;

  return (
    <section className="tyfx" aria-label="Serviços em destaque">
      {/* gesto lateral do trackpad fica com o carrossel (o Lenis só cuida do vertical) */}
      <ul ref={trilho} className="tyfx__trilho" data-lenis-prevent-horizontal="">
        {lista.map((s, i) => {
          const cor = CORES[i % CORES.length];
          const todas = midias[s.slug];
          const fotos = todas.filter((m) => m.tipo === "image").slice(0, 10);
          const vitrine = (
            <span className="tyfx__vitrine">
              {fotos.length ? (
                <Tira fotos={fotos} />
              ) : (
                <span className="tyfx__selo">
                  <Icone nome={iconeDo(s.slug, s.name)} className="tyfx__icone" />
                </span>
              )}
            </span>
          );
          // sem foto nem vídeo: o cartão inteiro agenda, como sempre foi
          if (!todas.length) {
            return (
              <li key={s.id} className="tyfx__item">
                <LinkAgendar
                  className="tyfx__cartao ty-ico-gatilho"
                  data-cor={cor}
                  href={linkDoServico(scheduleUrl, s.name)}
                  servico={s.slug}
                  aria-label={`Agendar ${s.name}`}
                >
                  {vitrine}
                  <span className="tyfx__nome">{s.name}</span>
                  <span className="tyfx__acao" aria-hidden>
                    Agendar
                    <span className="ty-btn__arrow" />
                  </span>
                </LinkAgendar>
              </li>
            );
          }
          return (
            <li key={s.id} className="tyfx__item">
              <div className="tyfx__cartao ty-ico-gatilho" data-cor={cor}>
                {/* o cartão inteiro abre as fotos; o "Agendar" fica por cima e agenda */}
                <button
                  type="button"
                  className="tyfx__ver"
                  aria-label={`Ver as fotos: ${s.name}`}
                  onClick={() => setVisto({ slug: s.slug, i: 0 })}
                />
                {vitrine}
                <span className="tyfx__nome">{s.name}</span>
                <LinkAgendar
                  className="tyfx__acao"
                  href={linkDoServico(scheduleUrl, s.name)}
                  servico={s.slug}
                  aria-label={`Agendar ${s.name}`}
                >
                  Agendar
                  <span className="ty-btn__arrow" aria-hidden />
                </LinkAgendar>
              </div>
            </li>
          );
        })}
      </ul>
      {lista.length > 1 ? (
        <div className="tyfx__nav">
          <button
            type="button"
            className="tyfx__seta tyfx__seta--ant"
            aria-label="Serviço anterior"
            disabled={atual === 0}
            onClick={() => irPara(atual - 1)}
          />
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
          <button
            type="button"
            className="tyfx__seta tyfx__seta--prox"
            aria-label="Próximo serviço"
            disabled={atual === lista.length - 1}
            onClick={() => irPara(atual + 1)}
          />
        </div>
      ) : null}
      <Visor
        itens={visto ? (midias[visto.slug] ?? []) : []}
        aberto={visto ? visto.i : null}
        onMudar={(i) => setVisto((v) => (v && i !== null ? { ...v, i } : null))}
      />
    </section>
  );
}
