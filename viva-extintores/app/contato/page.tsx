import type { Metadata } from "next";
import { CONTATO_PAGINA } from "@/lib/institucional";
import { CONTATO, CTA_PRINCIPAL, MARCA } from "@/lib/config";
import { FOTOS } from "@/lib/photos";
import { MENSAGENS, whatsappUrl } from "@/lib/whatsapp";
import { HeroPagina } from "@/components/secoes/hero-pagina";
import { Fecho } from "@/components/secoes/fecho";
import { Botao } from "@/components/ui/botao";
import { Reveal } from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: "Contato",
  description:
    "Fale com a equipe técnica da VIVA Extintores: avaliação da sua edificação e um caminho técnico claro, por escrito.",
};

export default function Page() {
  const temContato = Boolean(CONTATO.whatsapp || CONTATO.telefone || CONTATO.email);

  return (
    <>
      <HeroPagina
        sublinha={CONTATO_PAGINA.hero.sublinha}
        titulo={CONTATO_PAGINA.hero.titulo}
        texto={CONTATO_PAGINA.hero.texto}
        aside={CONTATO_PAGINA.hero.aside}
        foto={FOTOS.site.contato}
      >
        <div className="v-hero__cta">
          <Botao href={whatsappUrl(MENSAGENS.geral)}>{CTA_PRINCIPAL}</Botao>
        </div>
      </HeroPagina>

      <section className="v-section">
        <div className="v-wrap">
          <h2 className="v-eyebrow">Como funciona</h2>
          <ol className="v-etapas v-etapas--3">
            {CONTATO_PAGINA.passos.map((p) => (
              <li className="v-etapa" key={p.n}>
                <p className="v-etapa__n">{p.n}</p>
                <p className="v-etapa__t">{p.titulo}</p>
                <p className="v-etapa__x">{p.texto}</p>
              </li>
            ))}
          </ol>

          <Reveal>
            <div className="v-cards" style={{ marginTop: 28 }}>
              {CONTATO.telefone ? (
                <div className="v-card">
                  <h3 className="v-card__t">Telefone</h3>
                  <p className="v-card__x">
                    <a href={`tel:${CONTATO.telefone.replace(/\D/g, "")}`}>{CONTATO.telefone}</a>
                  </p>
                </div>
              ) : null}
              {CONTATO.whatsapp ? (
                <div className="v-card">
                  <h3 className="v-card__t">WhatsApp</h3>
                  <p className="v-card__x">
                    <a href={whatsappUrl(MENSAGENS.geral)} target="_blank" rel="noopener noreferrer">
                      Abrir conversa
                    </a>
                  </p>
                </div>
              ) : null}
              {CONTATO.email ? (
                <div className="v-card">
                  <h3 className="v-card__t">E-mail</h3>
                  <p className="v-card__x">
                    <a href={`mailto:${CONTATO.email}`}>{CONTATO.email}</a>
                  </p>
                </div>
              ) : null}
              {!temContato ? (
                <div className="v-vazio">
                  <span className="v-vazio__tag">Contato · a preencher</span>
                  <span className="v-vazio__txt">
                    Telefone, WhatsApp, e-mail, endereço e horário de atendimento da
                    VIVA. Definidos nas variáveis de ambiente — ver README.
                  </span>
                </div>
              ) : null}
            </div>
          </Reveal>
        </div>
      </section>

      <Fecho frase={MARCA.frase} />
    </>
  );
}
