"use client";

import { useState, type ReactNode } from "react";
import type { BusinessSettings } from "@/lib/tayssa/config";
import type { ConteudoSite } from "@/lib/tayssa/content";
import { temSobre } from "@/lib/tayssa/content";
import type { PhotoSlot } from "@/lib/tayssa/photos";
import { RealPhoto } from "@/components/tayssa/ui/real-photo";
import { MaskedLines, Reveal } from "@/components/tayssa/ui/reveal";
import { Pendente, useEstrutura } from "@/components/tayssa/ui/estrutura";
import { Arranjo, type Peca } from "@/components/tayssa/flora/arranjo";

/* o retrato fica entre flores: uma peônia atrás do ombro do quadro, um
   botão que cruza a borda da frente */
const FLORES: Peca[] = [
  { kind: "flor", seed: 29, tom: "rosa", x: 92, y: 12, size: "48%", rotate: 18, depth: -0.4 },
  { kind: "folha", x: 2, y: 72, size: "9%", rotate: -140, depth: 0.3 },
  { kind: "botao", seed: 31, tom: "bordo", x: 6, y: 86, size: "18%", rotate: -160, depth: 0.7, delay: 300 },
];

/** `*assim*` no texto dela vira destaque: a frase que a leitura rápida pega. */
function comDestaques(texto: string): ReactNode[] {
  return texto.split(/\*([^*]+)\*/).map((parte, i) => (i % 2 ? <strong key={i}>{parte}</strong> : parte));
}

/**
 * A Tayssa — a profissional por trás do trabalho.
 *
 * Só fala o que ela mesma disse: o nome e a especialidade vêm das
 * configurações; a biografia, a formação e a assinatura vêm do
 * manifesto de conteúdo (lib/tayssa/content.ts) e começam vazias. Sem
 * biografia, a seção não entra no site publicado.
 */
export function About({
  business,
  conteudo,
  portrait,
  instagramUrl,
}: {
  business: BusinessSettings;
  conteudo: ConteudoSite;
  portrait?: PhotoSlot;
  instagramUrl: string;
}) {
  const estrutura = useEstrutura();
  if (!temSobre(conteudo) && !estrutura) return null;
  const { bio, formacao, assinatura } = conteudo.sobre;
  const primeiro = business.name.trim().split(/\s+/)[0] ?? "Tayssa";

  return (
    <section id="sobre" className="ty-section tyab" aria-label={`${primeiro}, a profissional`}>
      <div className="ty-container">
        <Reveal className="tyab__topo" y={14}>
          <span className="ty-mono ty-mono--ink">A profissional</span>
          <span className="ty-mono">{business.specialty}</span>
        </Reveal>
        <div className="ty-rule" />

        <div className="tyab__grade">
          <div className="tyab__retrato">
            {portrait ? (
              <div className="tyab__quadro ty-figure">
                <RealPhoto photo={portrait} ratio={4 / 5} sizes="(max-width: 899px) 90vw, 40vw" />
              </div>
            ) : (
              <div className="tyab__quadro tyab__quadro--vazio">
                <Pendente
                  titulo="Retrato da Tayssa"
                  detalhe="Vertical 4:5, ≥ 1600 px no lado maior, luz natural, fundo limpo. Nome do arquivo: portrait.jpg."
                  midia
                />
              </div>
            )}
            <Arranjo pecas={FLORES} className="tyab__flores" label="sobre" />
          </div>

          <div className="tyab__texto">
            <MaskedLines
              as="h2"
              className="ty-display tyab__titulo"
              lines={[primeiro + ",", <em key="perto">de perto.</em>]}
            />

            {/* a história abre com o primeiro parágrafo (até o primeiro curso) e
                o resto vem num toque (Lucas, 09/11/2026: "diminuir aquele
                texto"). Nenhuma palavra saiu: o resto continua aqui, nas
                partes com título de 29/10/2026 */}
            {bio?.length ? <Bio bio={bio} /> : (
              <Pendente
                titulo="Biografia profissional"
                detalhe="2 a 4 parágrafos curtos, na voz dela: como começou, o que a guia no atendimento, o que a cliente pode esperar. Nada de número que ela não confirme."
              />
            )}

            {formacao?.length ? (
              <Reveal className="tyab__formacao">
                <span className="ty-mono ty-mono--ink">Formação · cursos presenciais</span>
                <ul>
                  {formacao.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </Reveal>
            ) : (
              <Pendente
                titulo="Formação e cursos (opcional)"
                detalhe="Só os que ela quiser mostrar, com o nome real da instituição e o ano."
              />
            )}

            {assinatura ? (
              <Reveal>
                <p className="tyab__assinatura">
                  <em>{assinatura}</em>
                </p>
              </Reveal>
            ) : null}

            <Reveal>
              <a className="ty-link ty-link--caps tyab__ig" href={instagramUrl} target="_blank" rel="noopener noreferrer">
                Ver o trabalho no Instagram
              </a>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * A história dela: à vista, o começo (o rótulo "Como começou" e o primeiro
 * parágrafo); "Continuar a minha história" abre o resto ali mesmo, sem
 * pular a página (a caixa cresce de 0fr para 1fr). Fechado, o resto fica
 * `inert`: nem o Tab nem o leitor de tela entram no que não aparece.
 */
function Bio({ bio }: { bio: NonNullable<ConteudoSite["sobre"]["bio"]> }) {
  const [inteira, setInteira] = useState(false);
  const [primeiro, ...outros] = bio;
  const [abertura, ...continua] = primeiro.paragrafos;
  const temResto = continua.length > 0 || outros.length > 0 || Boolean(primeiro.frase);

  const parte = (trecho: (typeof bio)[number], n: number, paragrafos: string[], comRotulo: boolean) => (
    <div key={trecho.rotulo} className="tyab__parte">
      {comRotulo ? (
        <span className="ty-mono tyab__rotulo">
          <b>{String(n).padStart(2, "0")}</b>
          {trecho.rotulo}
        </span>
      ) : null}
      {paragrafos.map((p, j) => (
        <p key={j} className="ty-body">
          {comDestaques(p)}
        </p>
      ))}
      {trecho.frase ? <blockquote className="tyab__frase">{trecho.frase}</blockquote> : null}
    </div>
  );

  return (
    <div className="tyab__bio">
      <Reveal className="tyab__parte">
        <span className="ty-mono tyab__rotulo">
          <b>01</b>
          {primeiro.rotulo}
        </span>
        <p className="ty-lead">{comDestaques(abertura)}</p>
        {temResto ? (
          <>
            <div id="tyab-resto" className="tyab__resto" data-aberto={inteira} inert={!inteira}>
              <div className="tyab__resto-dentro">
                {continua.length || primeiro.frase ? parte(primeiro, 1, continua, false) : null}
                {outros.map((t, i) => parte(t, i + 2, t.paragrafos, true))}
              </div>
            </div>
            {!inteira ? (
              <div className="tyab__mais">
                <button
                  type="button"
                  className="ty-link ty-link--caps tyab__continuar"
                  aria-expanded={inteira}
                  aria-controls="tyab-resto"
                  onClick={() => setInteira(true)}
                >
                  Continuar a minha história
                  <svg viewBox="0 0 24 24" aria-hidden>
                    <path d="M6 9.5l6 6 6-6" />
                  </svg>
                </button>
              </div>
            ) : null}
          </>
        ) : null}
      </Reveal>
    </div>
  );
}
