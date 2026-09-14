import { HERO } from "@/lib/home";
import { FOTOS } from "@/lib/photos";
import { MENSAGENS, whatsappUrl } from "@/lib/whatsapp";
import { Botao } from "@/components/ui/botao";
import { FotoReal } from "@/components/ui/foto-real";

/**
 * Abertura da página-mãe (§5).
 *
 * Fundo com fotografia real e impactante de combate/proteção contra
 * incêndio, atmosfera escura. Nada de banco de imagens artificial — por
 * isso o slot fica vazio até a VIVA entregar a foto certa.
 */
export function HeroHome() {
  return (
    <section className="v-hero" aria-labelledby="titulo-home">
      <div className="v-hero__bg">
        <FotoReal
          foto={FOTOS.home.hero}
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
            <p className="v-eyebrow">{HERO.eyebrow}</p>
            <h1 className="v-display v-h1 v-hero__title" id="titulo-home">
              {HERO.titulo[0]}
              <br />
              {HERO.titulo[1]}
              <br />
              <span className="v-dot">{HERO.titulo[2]?.replace(/\.$/, "")}</span>
            </h1>
            <p className="v-lead v-hero__text">{HERO.texto}</p>
            <div className="v-hero__cta">
              <Botao href={whatsappUrl(MENSAGENS.geral)}>{HERO.cta}</Botao>
            </div>
          </div>

          <div className="v-hero__aside">
            <p className="v-aside">
              {HERO.aside[0]}
              <br />
              {HERO.aside[1]}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
