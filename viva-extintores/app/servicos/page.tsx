import type { Metadata } from "next";
import Link from "next/link";
import { SERVICOS, SERVICOS_PAGINA } from "@/lib/institucional";
import { FOTOS } from "@/lib/photos";
import { MENSAGENS, whatsappUrl } from "@/lib/whatsapp";
import { HeroPagina } from "@/components/secoes/hero-pagina";
import { FaixaCta } from "@/components/secoes/faixa-cta";
import { Fecho } from "@/components/secoes/fecho";
import { Linhas, Reveal } from "@/components/ui/motion";
import { Seta } from "@/components/ui/icones";

export const metadata: Metadata = {
  title: "Serviços",
  description:
    "Projetos, obras, regularização, manutenção, extintores e treinamento de brigada — os serviços da VIVA Extintores de ponta a ponta.",
};

/**
 * Serviços é um índice, não um mostruário.
 *
 * Sete caixas iguais não dizem nada: viram ruído. Aqui cada serviço é uma
 * linha — número, nome grande, uma frase — e a linha inteira é o alvo do
 * toque. Lê-se de cima a baixo, no polegar, sem precisar caçar qual
 * cartão é qual.
 */
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

      <section className="v-section" aria-labelledby="servicos-titulo">
        <div className="v-wrap">
          <p className="v-eyebrow">O que a VIVA executa</p>
          <Linhas
            as="h2"
            id="servicos-titulo"
            className="v-display v-h2 v-indice__cab"
            linhas={["Do projeto executivo à", "manutenção do que já existe"]}
          />

          <ol className="v-indice">
            {SERVICOS.map((s, i) => {
              const conteudo = (
                <>
                  <span className="v-indice__n">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="v-indice__nome v-display">{s.titulo}</span>
                  <span className="v-indice__txt">{s.texto}</span>
                  <span className="v-indice__acao">
                    {s.href ? <Seta /> : null}
                  </span>
                </>
              );
              return (
                <Reveal as="li" className="v-indice__item" key={s.titulo} delay={i * 0.04}>
                  {s.href ? (
                    <Link href={s.href} className="v-indice__linha">
                      {conteudo}
                    </Link>
                  ) : (
                    <div className="v-indice__linha v-indice__linha--fixa">{conteudo}</div>
                  )}
                </Reveal>
              );
            })}
          </ol>

          <p className="v-body" style={{ marginTop: "var(--s-4)" }}>
            {SERVICOS_PAGINA.nota}
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
