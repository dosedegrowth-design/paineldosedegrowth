import type { ReactNode } from "react";
import type { FotoSlot } from "@/lib/photos";
import { FotoReal } from "@/components/ui/foto-real";
import { Linhas, Parallax, Reveal } from "@/components/ui/motion";

/**
 * Abertura das páginas fora do portfólio. Mesma gramática do hero das
 * áreas — foto real por trás, texto por cima, frase no canto — para o
 * site inteiro parecer um site só.
 */
export function HeroPagina({
  sublinha,
  titulo,
  destaque,
  texto,
  aside,
  foto,
  children,
  grande = false,
}: {
  sublinha?: string;
  titulo: readonly string[];
  /** última linha, em vermelho */
  destaque?: string;
  texto: string;
  aside: readonly string[];
  foto: FotoSlot;
  children?: ReactNode;
  /** abertura do site: o título ocupa a tela */
  grande?: boolean;
}) {
  return (
    <section className="v-hero" aria-labelledby="titulo-pagina">
      <Parallax className="v-hero__bg" intensidade={0.16}>
        <FotoReal foto={foto} ratio="fill" priority sizes="100vw" style={{ height: "100%" }} />
      </Parallax>
      <div className="v-hero__scrim" />

      <div className="v-wrap">
        <div className="v-hero__grid">
          <div>
            {sublinha ? (
              <Reveal delay={0.05} naEntrada>
                <p className="v-eyebrow">{sublinha}</p>
              </Reveal>
            ) : null}
            <Linhas
              as="h1"
              id="titulo-pagina"
              className={`v-display ${grande ? "v-xl" : "v-h1"} v-hero__title`}
              linhas={titulo}
              destaque={destaque}
              ponto={!destaque}
              atraso={0.12}
              naEntrada
            />
            <Reveal delay={0.34} naEntrada>
              <p className="v-lead v-hero__text">{texto}</p>
            </Reveal>
            {children ? <Reveal delay={0.44} naEntrada>{children}</Reveal> : null}
          </div>

          <Reveal className="v-hero__aside" delay={0.5} naEntrada>
            <p className="v-aside">
              {aside.map((l, i) => (
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
