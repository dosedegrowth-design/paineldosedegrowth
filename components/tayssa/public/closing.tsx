"use client";

import type { ReactNode } from "react";
import { ROUTES } from "@/lib/tayssa/config";
import { MaskedLines, Reveal } from "@/components/tayssa/ui/reveal";
import { TransitionLink } from "@/components/tayssa/ui/transition";

/** A declaração final, em três tempos — o último em itálico serifado. */
const DECLARACAO = ["Começa com", "uma mensagem.", <em key="cuidado">O resto é cuidado.</em>];

type Caminho = {
  n: string;
  nome: string;
  dizer: string;
  ficha: string;
  href: string;
  /** true = WhatsApp/Instagram, abre fora; false = rota do site */
  externo: boolean;
};

/**
 * Transição 8 — o fechamento.
 *
 * Não é "fale conosco": é o convite, e os três caminhos que existem de
 * verdade. A declaração é o maior corpo da página depois da marca;
 * embaixo, os caminhos como índice editorial — a linha inteira é o link
 * e reage sozinha (régua de cassis, nome que desliza, seta). Nenhum
 * botão que não leva a lugar nenhum, e nenhuma foto: a composição se
 * sustenta em tipografia, régua e ar.
 */
export function Closing({ scheduleUrl }: { scheduleUrl: string }) {
  const caminhos: Caminho[] = [
    {
      n: "01",
      nome: "Agendar no WhatsApp",
      dizer: "Você fala direto com a Tayssa e vocês combinam o dia e o horário.",
      ficha: "abre o whatsapp",
      href: scheduleUrl,
      externo: true,
    },
    {
      n: "02",
      nome: "Pedir acesso ao clube",
      dizer: "O cadastro é um pedido de entrada: ela lê, confere e responde.",
      ficha: "aprovação dela",
      href: ROUTES.signup,
      externo: false,
    },
    {
      n: "03",
      nome: "Indicar alguém",
      dizer: "Passar o nome de quem você quer ver bem cuidada também é um caminho.",
      ficha: "nome e whatsapp",
      href: ROUTES.refer,
      externo: false,
    },
  ];

  return (
    <section className="ty-section tycl" aria-label="Começar">
      <div className="ty-container">
        {/* ficha de topo: o momento de um lado, a escolha do outro */}
        <Reveal className="tycl__topo" y={14}>
          <span className="ty-mono ty-mono--ink">Daqui pra frente</span>
          <span className="ty-mono">você escolhe por onde</span>
        </Reveal>
        <div className="ty-rule" />

        <MaskedLines as="h2" className="ty-display tycl__declaracao" lines={DECLARACAO} />

        {/* o índice dos caminhos: os três existem, e levam a lugar de verdade */}
        <Reveal className="tycl__chapeu" y={14}>
          <span className="ty-mono ty-mono--ink">Por onde seguir</span>
          <span className="ty-index">
            <b>03</b> caminhos
          </span>
        </Reveal>
        <ul className="tycl__lista">
          {caminhos.map((c, i) => (
            <Reveal key={c.n} as="li" className="tycl__item" delay={i * 0.07} amount={0.25}>
              <Linha caminho={c} />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/**
 * Uma linha do índice. A linha inteira é o link: externo abre em outra
 * aba, interno passa pela cortina de transição. O conteúdo é o mesmo nos
 * dois casos — a reação de hover e de teclado mora no CSS.
 */
function Linha({ caminho }: { caminho: Caminho }) {
  const miolo: ReactNode = (
    <>
      <span className="tycl__fio" aria-hidden />
      <span className="ty-num tycl__n">{caminho.n}</span>
      <h3 className="tycl__nome">{caminho.nome}</h3>
      <p className="tycl__dizer">{caminho.dizer}</p>
      <span className="tycl__acao">
        {caminho.ficha}
        <span className="ty-btn__arrow" aria-hidden />
      </span>
    </>
  );

  if (caminho.externo) {
    return (
      <a className="tycl__linha" href={caminho.href} target="_blank" rel="noopener noreferrer">
        {miolo}
      </a>
    );
  }
  return (
    <TransitionLink className="tycl__linha" href={caminho.href}>
      {miolo}
    </TransitionLink>
  );
}
