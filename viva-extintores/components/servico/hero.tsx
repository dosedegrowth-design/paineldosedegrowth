import type { Area } from "@/lib/areas";
import { FotoReal } from "@/components/ui/foto-real";
import { Linhas, Parallax, Reveal } from "@/components/ui/motion";

/** Abertura da página de área: foto real de obra por trás, texto por cima. */
export function HeroServico({ area }: { area: Area }) {
  return (
    <section className="v-hero" aria-labelledby="titulo-area">
      <Parallax className="v-hero__bg" intensidade={0.16}>
        <FotoReal
          foto={area.heroFoto}
          ratio="fill"
          priority
          sizes="100vw"
          style={{ height: "100%" }}
        />
      </Parallax>
      <div className="v-hero__scrim" />

      <div className="v-wrap">
        <div className="v-hero__grid">
          <div>
            <Reveal delay={0.04} naEntrada>
              <p className="v-eyebrow">Portfólio</p>
              <p className="v-sub">{area.heroSublinha}</p>
            </Reveal>
            <Linhas
              as="h1"
              id="titulo-area"
              className="v-display v-h1 v-hero__title"
              linhas={area.heroTitulo}
              ponto
              atraso={0.12}
              naEntrada
            />
            <Reveal delay={0.34} naEntrada>
              <p className="v-lead v-hero__text">{area.heroTexto}</p>
            </Reveal>
          </div>

          <Reveal className="v-hero__aside" delay={0.5} naEntrada>
            <p className="v-aside">
              {area.heroAside.filter(Boolean).map((l, i) => (
                <span key={i}>
                  {l}
                  <br />
                </span>
              ))}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
