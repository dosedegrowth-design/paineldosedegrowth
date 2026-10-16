"use client";

import { ROUTES } from "@/lib/tayssa/config";
import { MaskedLines, Reveal } from "@/components/tayssa/ui/reveal";
import { Magnetic } from "@/components/tayssa/ui/magnetic";
import { TransitionLink } from "@/components/tayssa/ui/transition";
import { Jornada, type Parada } from "@/components/tayssa/ui/jornada";

/** A declaração, quebrada como o olho lê: três tempos, o último em itálico. */
const DECLARACAO = ["Indicar alguém", "é emprestar", <em key="confianca">a sua confiança.</em>];

/**
 * Os três tempos do gesto. Cada texto diz, por si, quem confirma: a
 * indicação não vale na promessa, vale na confirmação dela.
 */
const TEMPOS: Parada[] = [
  {
    n: "01",
    nome: "Você passa o nome",
    texto: "Nome e WhatsApp de quem ainda não conhece o trabalho da Tayssa. Nada além disso.",
    icone: "mensagem",
  },
  {
    n: "02",
    nome: "Ela atende",
    texto: "A Tayssa combina o horário com essa pessoa e faz o primeiro atendimento dela.",
    icone: "olho",
  },
  {
    n: "03",
    nome: "Ela confirma",
    texto:
      "Com o atendimento feito, a Tayssa confirma — e é aí que a indicação passa a contar como sua.",
    icone: "check",
  },
];

/**
 * Transição 7 — a indicação, que qualquer pessoa pode fazer.
 *
 * Não é um CTA: é um gesto. A declaração grande abre a seção com a
 * coluna de voz descendo em diagonal ao lado; embaixo, os três tempos
 * em tríptico, cada coluna capeada pela sua régua e com a ficha alinhada
 * no pé. Fecha com a regra da casa dita sem rodeio — a indicação só
 * conta depois que a Tayssa confirma o primeiro atendimento de quem foi
 * indicada — e o caminho real: o formulário de indicar.
 *
 * Nenhuma foto participa, e nenhuma faria falta: aqui a matéria é
 * tipografia, régua e ar.
 */
export function ReferralCta() {
  return (
    <section id="indicar" className="ty-section tyr" aria-label="Indicação">
      <div className="ty-container">
        {/* ficha de topo: o assunto de um lado, quem pode indicar do outro */}
        <Reveal className="tyr__topo" y={14}>
          <span className="ty-mono ty-mono--ink">Indicação</span>
          <span className="ty-mono">não precisa ser VIP para indicar</span>
        </Reveal>
        <div className="ty-rule" />

        {/* a declaração, com a voz da casa descendo ao lado */}
        <div className="ty-split ty-split--wide-left ty-split--offset tyr__cabeca">
          <MaskedLines as="h2" className="ty-display tyr__declaracao" lines={DECLARACAO} />
          <div className="tyr__lado">
            <Reveal delay={0.12}>
              <p className="ty-lead ty-measure">
                Quando você passa um nome pra Tayssa, não é um contato que muda de mão: é alguém
                de quem você gosta cruzando a porta do estúdio pela primeira vez. É o elogio mais
                honesto que o trabalho dela pode receber.
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <span className="ty-oval">um nome de cada vez</span>
            </Reveal>
          </div>
        </div>

        {/* os três tempos do gesto */}
        <Reveal className="tyr__chapeu" y={14}>
          <span className="ty-mono ty-mono--ink">Como funciona</span>
          <span className="ty-index">
            <b>03</b> tempos
          </span>
        </Reveal>
        <Jornada paradas={TEMPOS} className="tyr__jornada" />

        {/* a regra da casa, sem rodeio — e o caminho de indicar */}
        <div className="tyr__regra">
          <Reveal>
            <span className="ty-mono tyr__selo">a regra da casa</span>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="tyr__regra-linha">
              A indicação conta <em>depois</em> que a Tayssa confirma o primeiro atendimento de
              quem você indicou — nunca na promessa. É ela quem confere cada atendimento e quem
              libera cada benefício: automático, aqui, não existe.
            </p>
            <div className="tyr__acoes">
              <Magnetic>
                <TransitionLink href={ROUTES.refer} className="ty-btn ty-btn--solid">
                  <span>Indicar alguém</span>
                  <span className="ty-btn__arrow" aria-hidden />
                </TransitionLink>
              </Magnetic>
              <span className="ty-mono">
                o formulário pede o seu nome, o nome dela e os dois WhatsApp
              </span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
