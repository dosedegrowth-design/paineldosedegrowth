import Image from "next/image";
import { INSTAGRAM, POSTS } from "@/lib/instagram";
import { Seta } from "@/components/ui/icones";
import { Reveal } from "@/components/ui/reveal";

/**
 * Instagram — obra nova toda semana.
 *
 * Hoje os posts vêm de `lib/instagram.ts`. Quando a VIVA liberar o token
 * da Graph API, trocar a origem da lista resolve: o componente não muda.
 */
export function InstagramFaixa() {
  return (
    <section className="v-section v-section--tight" aria-labelledby="ig-titulo">
      <div className="v-wrap">
        <Reveal>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 16,
              alignItems: "baseline",
              justifyContent: "space-between",
            }}
          >
            <div>
              <p className="v-eyebrow">Instagram</p>
              <h2 className="v-display v-h3" id="ig-titulo" style={{ marginTop: 10 }}>
                Obra nova toda semana
              </h2>
            </div>
            {INSTAGRAM.url ? (
              <a
                href={INSTAGRAM.url}
                target="_blank"
                rel="noopener noreferrer"
                className="v-navlink"
                style={{ display: "inline-flex", alignItems: "center", gap: 10 }}
              >
                Seguir {INSTAGRAM.handle}
                <Seta className="v-btn__arrow" />
              </a>
            ) : null}
          </div>

          <ul className="v-janelas" style={{ marginTop: 22 }}>
            {POSTS.length > 0
              ? POSTS.slice(0, 3).map((p) => (
                  <li key={p.url}>
                    <a
                      className="v-janela"
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: "block" }}
                    >
                      <div className="v-photo" style={{ aspectRatio: "4 / 3" }}>
                        <Image
                          src={`/photos/instagram/${p.imagem}.jpg`}
                          alt={p.legenda}
                          fill
                          sizes="(max-width: 900px) 100vw, 33vw"
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                      <div className="v-janela__cap">
                        <p className="v-janela__local">{p.legenda}</p>
                      </div>
                    </a>
                  </li>
                ))
              : Array.from({ length: 3 }).map((_, i) => (
                  <li className="v-vazio" key={i} style={{ aspectRatio: "4 / 3" }}>
                    <span className="v-vazio__tag">Post {i + 1} · a preencher</span>
                    <span className="v-vazio__txt">
                      Post real do perfil da VIVA — ou o feed da Graph API,
                      quando o token estiver liberado.
                    </span>
                  </li>
                ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
