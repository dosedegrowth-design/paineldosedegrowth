import type { ReactNode } from "react";
import type { FotoSlot } from "@/lib/photos";
import { FotoReal } from "@/components/ui/foto-real";

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
}: {
  sublinha: string;
  titulo: readonly string[];
  /** última linha, em vermelho */
  destaque?: string;
  texto: string;
  aside: readonly string[];
  foto: FotoSlot;
  children?: ReactNode;
}) {
  return (
    <section className="v-hero" aria-labelledby="titulo-pagina">
      <div className="v-hero__bg">
        <FotoReal foto={foto} ratio="fill" priority sizes="100vw" style={{ height: "100%" }} />
      </div>
      <div className="v-hero__scrim" />

      <div className="v-wrap">
        <div className="v-hero__grid">
          <div>
            <p className="v-eyebrow">{sublinha}</p>
            <h1 className="v-display v-h1 v-hero__title" id="titulo-pagina">
              {titulo.map((l, i) => (
                <span key={i}>
                  {l}
                  <br />
                </span>
              ))}
              {destaque ? <span style={{ color: "var(--v-red)" }}>{destaque}</span> : null}
            </h1>
            <p className="v-lead v-hero__text">{texto}</p>
            {children}
          </div>

          <div className="v-hero__aside">
            <p className="v-aside">
              {aside.map((l, i) => (
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
