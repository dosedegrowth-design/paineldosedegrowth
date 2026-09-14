import type { Area } from "@/lib/areas";
import { FotoReal } from "@/components/ui/foto-real";

/** Abertura da página de área: foto real de obra por trás, texto por cima. */
export function HeroServico({ area }: { area: Area }) {
  return (
    <section className="v-hero" aria-labelledby="titulo-area">
      <div className="v-hero__bg">
        <FotoReal
          foto={area.heroFoto}
          ratio="fill"
          priority
          sizes="100vw"
          style={{ height: "100%" }}
        />
      </div>
      <div className="v-hero__scrim" />

      <div className="v-wrap">
        <div className="v-hero__grid">
          <div>
            <p className="v-eyebrow">Portfólio</p>
            <p className="v-sub">{area.heroSublinha}</p>
            <h1 className="v-display v-h1 v-hero__title" id="titulo-area">
              {area.heroTitulo[0]}
              {area.heroTitulo[1] ? (
                <>
                  <br />
                  {area.heroTitulo[1]}
                </>
              ) : null}
            </h1>
            <p className="v-lead v-hero__text">{area.heroTexto}</p>
          </div>

          <div className="v-hero__aside">
            <p className="v-aside">
              {area.heroAside.filter(Boolean).map((l, i) => (
                <span key={i}>
                  {l}
                  <br />
                </span>
              ))}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
