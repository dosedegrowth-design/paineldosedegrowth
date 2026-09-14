import type { Metadata } from "next";
import Link from "next/link";
import { SERVICOS, SERVICOS_PAGINA } from "@/lib/institucional";
import { FOTOS } from "@/lib/photos";
import { MENSAGENS, whatsappUrl } from "@/lib/whatsapp";
import { ROUTES } from "@/lib/config";
import { HeroPagina } from "@/components/secoes/hero-pagina";
import { FaixaCta } from "@/components/secoes/faixa-cta";
import { Fecho } from "@/components/secoes/fecho";
import { Reveal } from "@/components/ui/motion";
import {
  IconeAlarme,
  IconeBomba,
  IconeDocumento,
  IconeExtintor,
  IconeRaio,
  Pessoas,
  Prancheta,
  Seta,
} from "@/components/ui/icones";

export const metadata: Metadata = {
  title: "Serviços",
  description:
    "Projetos, obras, regularização, manutenção, extintores e treinamento de brigada — os serviços da VIVA Extintores de ponta a ponta.",
};

const ICONES = {
  bomba: IconeBomba,
  alarme: IconeAlarme,
  raio: IconeRaio,
  documento: IconeDocumento,
  extintor: IconeExtintor,
  prancheta: Prancheta,
  pessoas: Pessoas,
};

export default function Page() {
  return (
    <>
      <HeroPagina
        sublinha={SERVICOS_PAGINA.hero.sublinha}
        titulo={SERVICOS_PAGINA.hero.titulo}
        texto={SERVICOS_PAGINA.hero.texto}
        aside={SERVICOS_PAGINA.hero.aside}
        foto={FOTOS.site.servicos}
      />

      <section className="v-section">
        <div className="v-wrap">
          <h2 className="v-eyebrow">O que a VIVA executa</h2>
          <ul className="v-cards">
            {SERVICOS.map((s, i) => {
              const Icone = ICONES[s.icone];
              return (
                <Reveal as="li" className="v-card" key={s.titulo} delay={i * 0.04}>
                  <Icone />
                  <h3 className="v-card__t">{s.titulo}</h3>
                  <p className="v-card__x">{s.texto}</p>
                  {s.href ? (
                    <Link className="v-card__link" href={s.href}>
                      Ver obras reais
                      <Seta />
                    </Link>
                  ) : null}
                </Reveal>
              );
            })}
          </ul>

          <p className="v-body" style={{ marginTop: 26 }}>
            {SERVICOS_PAGINA.nota}{" "}
            <Link href={ROUTES.portfolio} style={{ color: "var(--v-red)", fontWeight: 600 }}>
              Ver o portfólio
            </Link>
          </p>
        </div>
      </section>

      <FaixaCta
        titulo={["Seu projeto com", "a equipe certa."]}
        texto="Fale com nossos especialistas e receba um orçamento sob medida."
        href={whatsappUrl(MENSAGENS.geral)}
      />
      <Fecho frase="Da execução do projeto às obras corretivas e preventivas do seu edifício." />
    </>
  );
}
