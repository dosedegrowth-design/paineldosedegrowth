import type { Metadata } from "next";
import { SOBRE } from "@/lib/institucional";
import { FOTOS } from "@/lib/photos";
import { MENSAGENS, whatsappUrl } from "@/lib/whatsapp";
import { MARCA } from "@/lib/config";
import { HeroPagina } from "@/components/secoes/hero-pagina";
import { Numeros } from "@/components/secoes/numeros";
import { FaixaCta } from "@/components/secoes/faixa-cta";
import { Fecho } from "@/components/secoes/fecho";
import { FotoReal } from "@/components/ui/foto-real";
import { Reveal } from "@/components/ui/motion";

export const metadata: Metadata = {
  title: "Sobre nós",
  description:
    "Engenharia de segurança contra incêndio: a VIVA projeta, executa, regulariza e mantém — do diagnóstico à aprovação no Corpo de Bombeiros.",
};

export default function Page() {
  return (
    <>
      <HeroPagina
        sublinha={SOBRE.hero.sublinha}
        titulo={SOBRE.hero.titulo}
        texto={SOBRE.hero.texto}
        aside={SOBRE.hero.aside}
        foto={FOTOS.site.sobre}
      />

      <section className="v-section">
        <div className="v-wrap">
          <Reveal className="v-duo">
            <div>
              <h2 className="v-display v-h2">
                {SOBRE.historia.titulo[0]}
                <br />
                <span className="v-dot">{SOBRE.historia.titulo[1]?.replace(/\.$/, "")}</span>
              </h2>
              <p className="v-lead" style={{ marginTop: 16, color: "var(--v-on-light-soft)" }}>
                {SOBRE.historia.texto}
              </p>
            </div>
            <FotoReal foto={FOTOS.site.equipe} sizes="(max-width: 1080px) 100vw, 46vw" />
          </Reveal>
        </div>
      </section>

      <Numeros />

      <section className="v-section">
        <div className="v-wrap">
          <p className="v-eyebrow">Por que a VIVA</p>
          <ol className="v-pilares">
            {SOBRE.pilares.map((p, i) => (
              <Reveal as="li" className="v-pilar" key={p.titulo} delay={i * 0.06}>
                <span className="v-pilar__n">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="v-display v-pilar__t">{p.titulo}</h3>
                <p className="v-pilar__x">{p.texto}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <FaixaCta
        titulo={["Segurança é", "continuidade."]}
        texto="Fale com quem entende. Conte com uma equipe técnica especializada."
        href={whatsappUrl(MENSAGENS.geral)}
      />
      <Fecho frase={MARCA.frase} />
    </>
  );
}
