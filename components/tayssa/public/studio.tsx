"use client";

import type { ConteudoSite } from "@/lib/tayssa/content";
import { temEspaco } from "@/lib/tayssa/content";
import { VIDEOS, temVideo, type VideoPresence } from "@/lib/tayssa/media";
import type { PhotoSlot } from "@/lib/tayssa/photos";
import { MotionMedia } from "@/components/tayssa/ui/motion-media";
import { MaskedLines, Reveal } from "@/components/tayssa/ui/reveal";
import { Pendente, useEstrutura } from "@/components/tayssa/ui/estrutura";
import { Arranjo, type Peca } from "@/components/tayssa/flora/arranjo";

const FLORES: Peca[] = [
  { kind: "flor", seed: 53, tom: "vinho", x: 97, y: 4, size: "clamp(90px, 11vw, 170px)", rotate: 12, depth: 0.6 },
  { kind: "folha", x: 90, y: -2, size: "clamp(24px, 2.6vw, 40px)", rotate: 40, depth: 0.5 },
  { kind: "flor", seed: 59, tom: "pétala", x: 2, y: 100, size: "clamp(140px, 18vw, 280px)", rotate: -20, depth: -0.3 },
];

/**
 * O estúdio — onde o atendimento acontece.
 *
 * Mídia larga (vídeo do espaço > foto do estúdio > campo tonal) com as
 * flores mordendo os cantos, e ao lado o que ela disser do lugar: como
 * é, onde fica, o link do mapa. Sem nada real, a seção não entra.
 */
export function Studio({
  conteudo,
  video,
  photo,
}: {
  conteudo: ConteudoSite;
  video?: VideoPresence;
  photo?: PhotoSlot;
}) {
  const estrutura = useEstrutura();
  const temMidia = temVideo(video) || Boolean(photo);
  if (!temEspaco(conteudo) && !temMidia && !estrutura) return null;
  const { descricao, endereco, mapaUrl } = conteudo.espaco;

  return (
    <section id="estudio" className="ty-section tyst ty-night" aria-label="O estúdio">
      <div className="ty-container">
        <Reveal className="tyst__topo" y={14}>
          <span className="ty-mono ty-mono--ink">O estúdio</span>
          <span className="ty-mono">onde o cuidado acontece</span>
        </Reveal>
        <div className="ty-rule" />

        <div className="tyst__grade">
          <div className="tyst__midia-wrap">
            <MotionMedia
              video={VIDEOS.espaco}
              presence={video}
              photo={photo}
              className="tyst__midia"
              sizes="(max-width: 899px) 100vw, 60vw"
              pendente={{
                titulo: "Vídeo ou foto do estúdio",
                detalhe:
                  "Vídeo 10–20 s (16:9 + 9:16) ou foto horizontal 16:10 ≥ 1800 px (studio.jpg): a cadeira, a luz, os detalhes do lugar.",
              }}
            />
            <Arranjo pecas={FLORES} className="tyst__flores" label="estudio" />
          </div>

          <div className="tyst__texto">
            <MaskedLines as="h2" className="ty-display tyst__titulo" lines={["Um lugar", <em key="seu">seu</em>, "por uma hora."]} />
            {descricao ? (
              <Reveal>
                <p className="ty-lead ty-measure">{descricao}</p>
              </Reveal>
            ) : (
              <Pendente titulo="Como é o estúdio" detalhe="1 parágrafo: o ambiente, o conforto, o que a cliente encontra ao chegar." />
            )}
            {endereco ? (
              <Reveal className="tyst__onde">
                <span className="ty-mono ty-mono--ink">Onde</span>
                <p>{endereco}</p>
                {mapaUrl ? (
                  <a className="ty-link ty-link--caps" href={mapaUrl} target="_blank" rel="noopener noreferrer">
                    Abrir no mapa
                  </a>
                ) : null}
              </Reveal>
            ) : (
              <Pendente
                titulo="Endereço"
                detalhe="Como ela quer publicar: completo, ou só bairro e cidade (o endereço exato pode ir só na confirmação do horário). Link do Google Maps opcional."
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
