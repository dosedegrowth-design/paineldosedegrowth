"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion, useTransform, type MotionValue } from "framer-motion";
import { useProgressoRolagem } from "@/components/tayssa/ui/rolagem";
import type { PhotoSlot } from "@/lib/tayssa/photos";
import type { FloraTom } from "@/lib/tayssa/flora";
import { RealPhoto } from "@/components/tayssa/ui/real-photo";
import { MaskedLines, Reveal } from "@/components/tayssa/ui/reveal";
import { Bloom } from "@/components/tayssa/flora/bloom";
import { PortfolioCelulares } from "@/components/tayssa/public/portfolio";
import type { ItemPortfolio } from "@/lib/tayssa/portfolio";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** A chamada, em três tempos — o do meio em itálico, ligando o cartaz. */
const CHAMADA = ["O trabalho sai", <em key="estudio">do estúdio e vai</em>, "direto pro perfil."];

/**
 * Lugares da colagem, em % da seção (centro da peça). As fotos ocupam os
 * lugares na ordem; as flores ficam nos dela. `m` = posição no celular
 * (sem `m`, a peça não aparece no celular): acima e abaixo do texto.
 */
type Lugar = { x: number; y: number; r: number; w: string; d: number; m?: [number, number] };
const LUGARES_FOTO: Lugar[] = [
  { x: 13, y: 22, r: -9, w: "clamp(120px, 15vw, 240px)", d: 0.8, m: [22, 7] },
  { x: 86, y: 18, r: 7, w: "clamp(110px, 13vw, 210px)", d: 1.1, m: [72, 9] },
  { x: 9, y: 74, r: 6, w: "clamp(110px, 12vw, 200px)", d: 0.5 },
  { x: 90, y: 72, r: -6, w: "clamp(130px, 16vw, 250px)", d: 0.9, m: [76, 91] },
  { x: 27, y: 90, r: -4, w: "clamp(100px, 10vw, 170px)", d: 1.3 },
  { x: 72, y: 92, r: 10, w: "clamp(100px, 11vw, 180px)", d: 0.6, m: [26, 93] },
];
const LUGARES_FLOR: (Lugar & { tom: FloraTom; seed: number; kind: "flor" | "botao" })[] = [
  { x: 30, y: 12, r: -18, w: "clamp(90px, 9vw, 150px)", d: 1.4, tom: "magenta", seed: 5, kind: "flor", m: [50, 4] },
  { x: 70, y: 40, r: 22, w: "clamp(50px, 5vw, 80px)", d: 1.6, tom: "vinho", seed: 3, kind: "botao" },
  { x: 4, y: 48, r: 12, w: "clamp(70px, 7vw, 120px)", d: 0.4, tom: "rosa", seed: 9, kind: "flor" },
  { x: 96, y: 46, r: -14, w: "clamp(60px, 6vw, 100px)", d: 1.2, tom: "magenta", seed: 13, kind: "flor", m: [50, 96] },
];

/** Com os celulares, as flores ficam só nas laterais do cartaz (em % do cartaz). */
const LUGARES_FLOR_PORTFOLIO: (Lugar & { tom: FloraTom; seed: number; kind: "flor" | "botao" })[] = [
  { x: 12, y: 30, r: -18, w: "clamp(90px, 9vw, 150px)", d: 1.2, tom: "magenta", seed: 5, kind: "flor" },
  { x: 88, y: 22, r: 16, w: "clamp(70px, 7vw, 120px)", d: 0.8, tom: "rosa", seed: 9, kind: "flor" },
  { x: 20, y: 82, r: 22, w: "clamp(44px, 4vw, 70px)", d: 1.5, tom: "vinho", seed: 3, kind: "botao" },
  { x: 84, y: 76, r: -14, w: "clamp(60px, 6vw, 100px)", d: 1, tom: "magenta", seed: 13, kind: "flor" },
];

/**
 * O convite ao Instagram — a colagem do Delta, com o trabalho dela.
 *
 * O cartaz fica no meio; em volta, as fotos reais em moldura de papel,
 * inclinadas, cada uma numa profundidade (correm em velocidades
 * diferentes no scroll) e as flores da casa entre elas. Elas entram
 * girando quando a seção chega; no mouse, a foto endireita e sobe.
 *
 * Com o portfólio (mídia publicada no painel ou Reels do conteúdo), as
 * molduras de papel dão lugar aos celulares com a cara do Instagram,
 * flutuando embaixo do cartaz — tocar abre o trabalho aqui mesmo.
 *
 * Só entra foto que existe (a página filtra). Sem nenhuma, a colagem é só
 * de flores e o cartaz continua inteiro.
 */
export function Details({
  instagramUrl,
  handle,
  photos,
  portfolio = [],
}: {
  instagramUrl: string;
  handle: string;
  /** já filtradas na página: só fotos reais */
  photos?: PhotoSlot[];
  /** o trabalho dela nos celulares (vazio = a colagem de fotos de sempre) */
  portfolio?: ItemPortfolio[];
}) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const naTela = useInView(ref, { once: true, amount: 0.2 });
  const entra = naTela || Boolean(reduced);
  const scrollYProgress = useProgressoRolagem(ref, ["start end", "end start"]);
  const comPortfolio = portfolio.length > 0;
  const fotos = comPortfolio ? [] : (photos ?? []).slice(0, LUGARES_FOTO.length);

  return (
    <section ref={ref} className={`tyco${comPortfolio ? " tyco--portfolio" : ""}`} id="instagram" aria-label="Instagram">
      <Cabeca ativo={comPortfolio}>
        <div className="tyco__pecas" aria-hidden>
          {fotos.map((foto, i) => (
            <Peca key={foto.src} lugar={LUGARES_FOTO[i]} i={i} entra={entra} progresso={scrollYProgress} parado={Boolean(reduced)}>
              <figure className="tyco__foto">
                <RealPhoto photo={foto} ratio={4 / 5} sizes="(max-width: 899px) 40vw, 16vw" />
                <figcaption>{handle}</figcaption>
              </figure>
            </Peca>
          ))}
          {(comPortfolio ? LUGARES_FLOR_PORTFOLIO : LUGARES_FLOR).map((l, i) => (
            <Peca key={`f${i}`} lugar={l} i={i + fotos.length} entra={entra} progresso={scrollYProgress} parado={Boolean(reduced)}>
              <Bloom kind={l.kind} seed={l.seed} tom={l.tom} open={entra} delay={300 + i * 120} />
            </Peca>
          ))}
        </div>

        <div className="tyco__centro">
          <Reveal y={12}>
            <span className="ty-mono ty-mono--ink">Instagram · {handle}</span>
          </Reveal>
          <MaskedLines as="h2" className="ty-display tyco__chamada" lines={CHAMADA} />
          <Reveal delay={0.15}>
            <p className="ty-body tyco__texto">
              {comPortfolio
                ? "O trabalho recente, do jeito que aparece no perfil. Toque num celular para assistir aqui mesmo e, se quiser, abrir a publicação no Instagram."
                : "Aqui o site conta o essencial: o que a casa faz e como funciona o VIP. O trabalho recente fica no Instagram: é lá que o olhar aparece de perto, um por um."}
            </p>
          </Reveal>
          <Reveal delay={0.25}>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ty-btn ty-btn--solid"
              aria-label={`Abrir o perfil ${handle} no Instagram`}
            >
              <span>Abrir o perfil</span>
              <span className="ty-btn__arrow" aria-hidden />
            </a>
          </Reveal>
        </div>
      </Cabeca>

      {comPortfolio ? <PortfolioCelulares itens={portfolio} handle={handle} perfilUrl={instagramUrl} /> : null}
    </section>
  );
}

/** Com o portfólio, o cartaz e as flores ficam juntos numa caixa só (as flores medem por ela). */
function Cabeca({ ativo, children }: { ativo: boolean; children: React.ReactNode }) {
  return ativo ? <div className="tyco__cabeca">{children}</div> : <>{children}</>;
}

/** Uma peça da colagem: entra girando, corre no scroll na sua profundidade. */
function Peca({
  lugar,
  i,
  entra,
  progresso,
  parado,
  children,
}: {
  lugar: Lugar;
  i: number;
  entra: boolean;
  progresso: MotionValue<number>;
  parado: boolean;
  children: React.ReactNode;
}) {
  const y = useTransform(progresso, [0, 1], parado ? [0, 0] : [lugar.d * 140, lugar.d * -140]);
  return (
    <motion.div
      className="tyco__peca"
      data-celular={lugar.m ? "sim" : "nao"}
      style={{
        ["--x" as string]: `${lugar.x}%`,
        ["--y" as string]: `${lugar.y}%`,
        ["--mx" as string]: `${lugar.m?.[0] ?? lugar.x}%`,
        ["--my" as string]: `${lugar.m?.[1] ?? lugar.y}%`,
        width: lugar.w,
        y,
      }}
    >
      <motion.div
        className="tyco__giro"
        initial={parado ? false : { opacity: 0, scale: 0.55, rotate: lugar.r * 3 }}
        animate={entra ? { opacity: 1, scale: 1, rotate: lugar.r } : parado ? { rotate: lugar.r } : {}}
        transition={{ duration: 1.1, delay: 0.08 * i, ease: EASE }}
        whileHover={parado ? undefined : { rotate: 0, scale: 1.06, transition: { duration: 0.4, ease: EASE } }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
