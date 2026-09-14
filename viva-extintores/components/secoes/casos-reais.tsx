import Image from "next/image";
import { CASOS, JANELAS_VAZIAS, type Janela } from "@/lib/casos";
import type { AreaSlug } from "@/lib/areas";
import { SetaBaixo } from "@/components/ui/icones";
import { Reveal } from "@/components/ui/reveal";

/**
 * §17 e §18 — a transição. "Eu entendi o que vocês fazem" → "agora me
 * mostre que vocês realmente fazem".
 *
 * A frase, a seta, e PARA. Abaixo ficam poucas janelas (foto ou vídeo) —
 * não é para virar catálogo infinito (§24).
 */
export function CasosReais({ area, frase }: { area: AreaSlug; frase: string }) {
  const janelas = CASOS[area];

  return (
    <section className="v-section" id="casos-reais" aria-labelledby="casos-titulo">
      <div className="v-wrap">
        <Reveal className="v-casos__head">
          <p className="v-casos__frase">{frase}</p>
          <h2 className="v-display v-casos__chamada" id="casos-titulo">
            Veja alguns dos nossos casos reais
          </h2>
          <SetaBaixo className="v-seta" />
        </Reveal>

        <ul className="v-janelas">
          {janelas.length > 0
            ? janelas.map((j) => (
                <li key={j.titulo}>
                  <JanelaCaso janela={j} />
                </li>
              ))
            : Array.from({ length: JANELAS_VAZIAS }).map((_, i) => (
                <li key={i}>
                  <div className="v-janela">
                    <div className="v-vazio" style={{ aspectRatio: "4 / 3", border: 0 }}>
                      <span className="v-vazio__tag">Janela {i + 1} · a preencher</span>
                      <span className="v-vazio__txt">
                        Foto ou vídeo de um caso real desta área, com nome e local.
                      </span>
                    </div>
                  </div>
                </li>
              ))}
        </ul>
      </div>
    </section>
  );
}

function JanelaCaso({ janela }: { janela: Janela }) {
  return (
    <article className="v-janela">
      {janela.video ? (
        janela.videoTipo === "youtube" ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${janela.video}`}
            title={janela.titulo}
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        ) : (
          <video controls preload="metadata" playsInline>
            <source src={`/videos/${janela.video}`} type="video/mp4" />
          </video>
        )
      ) : janela.imagem ? (
        <div className="v-photo" style={{ aspectRatio: "4 / 3" }}>
          <Image
            src={`/photos/casos/${janela.imagem}.jpg`}
            alt={janela.titulo}
            fill
            sizes="(max-width: 900px) 100vw, 33vw"
            style={{ objectFit: "cover" }}
          />
        </div>
      ) : null}

      <div className="v-janela__cap">
        <h3 className="v-janela__titulo">{janela.titulo}</h3>
        {janela.local ? <p className="v-janela__local">{janela.local}</p> : null}
      </div>
    </article>
  );
}
