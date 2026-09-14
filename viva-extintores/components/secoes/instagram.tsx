"use client";

import { useEffect } from "react";
import { INSTAGRAM, POSTS, POSTS_VAZIOS } from "@/lib/instagram";
import { Seta } from "@/components/ui/icones";

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

const EMBED_JS = "https://www.instagram.com/embed.js";

/**
 * Instagram — obra nova toda semana.
 *
 * São publicações reais, renderizadas pelo incorporador oficial do
 * Instagram a partir do permalink. Clicar leva para a publicação.
 *
 * Se o script do Instagram não carregar (bloqueador, rede da obra), o
 * `blockquote` continua sendo um link para o post — o visitante nunca
 * fica olhando para um buraco.
 */
export function InstagramFaixa() {
  useEffect(() => {
    if (POSTS.length === 0) return;

    if (window.instgrm) {
      window.instgrm.Embeds.process();
      return;
    }

    const existente = document.querySelector<HTMLScriptElement>(
      `script[src="${EMBED_JS}"]`,
    );
    if (existente) return;

    const s = document.createElement("script");
    s.src = EMBED_JS;
    s.async = true;
    document.body.appendChild(s);
  }, []);

  return (
    <section className="v-section v-white" aria-labelledby="ig-titulo">
      <div className="v-wrap">
        <div className="v-ig__cab">
          <div>
            <p className="v-eyebrow">Instagram</p>
            <h2 className="v-display v-h3" id="ig-titulo" style={{ marginTop: 8 }}>
              Obra nova toda semana
            </h2>
          </div>
          {INSTAGRAM.url ? (
            <a
              href={INSTAGRAM.url}
              target="_blank"
              rel="noopener noreferrer"
              className="v-card__link"
            >
              Seguir {INSTAGRAM.handle}
              <Seta />
            </a>
          ) : null}
        </div>

        {POSTS.length > 0 ? (
          <ul className="v-ig">
            {POSTS.map((url) => (
              <li key={url}>
                <blockquote
                  className="instagram-media"
                  data-instgrm-permalink={url}
                  data-instgrm-version="14"
                >
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    Ver esta publicação no Instagram
                  </a>
                </blockquote>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="v-ig">
            {Array.from({ length: POSTS_VAZIOS }).map((_, i) => (
              <li className="v-vazio v-ig__vazio" key={i}>
                <span className="v-vazio__tag">Post {i + 1} · a preencher</span>
                <span className="v-vazio__txt">
                  Cole em <code>lib/instagram.ts</code> o link de uma publicação
                  real do perfil da VIVA (no post: “…” → “Copiar link”). O post
                  aparece aqui de verdade e o clique leva para o Instagram.
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
