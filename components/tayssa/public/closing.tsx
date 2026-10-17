"use client";

import { useRef, type ReactNode } from "react";
import { ROUTES } from "@/lib/tayssa/config";
import { MaskedLines, Reveal } from "@/components/tayssa/ui/reveal";
import { TransitionLink } from "@/components/tayssa/ui/transition";
import { LinkAgendar } from "@/components/tayssa/public/agendar";
import { Arranjo, type Peca } from "@/components/tayssa/flora/arranjo";
import { Icone, type IconeNome } from "@/components/tayssa/ui/icones";
import { FotoAmbiente } from "@/components/tayssa/ui/foto-ambiente";
import type { PhotoSlot } from "@/lib/tayssa/photos";

/** A declaração final, em três tempos — o último em itálico serifado. */
const DECLARACAO = ["Começa com", "uma mensagem.", <em key="cuidado">O resto é cuidado.</em>];

/* flores soltas no ar, em profundidades diferentes (os pacotes de café
   flutuando do Delta): as da frente correm mais e são maiores */
const FLUTUAM: Peca[] = [
  { kind: "flor", seed: 5, tom: "magenta", x: 8, y: 10, size: "clamp(80px, 9vw, 150px)", rotate: -16, depth: 1.2 },
  { kind: "botao", seed: 2, tom: "rosa", x: 24, y: 28, size: "clamp(34px, 3vw, 52px)", rotate: 20, depth: 0.4 },
  { kind: "flor", seed: 9, tom: "vinho", x: 90, y: 8, size: "clamp(60px, 6vw, 110px)", rotate: 14, depth: 0.7 },
  { kind: "flor", seed: 13, tom: "rosa", x: 78, y: 30, size: "clamp(40px, 4vw, 70px)", rotate: -24, depth: 0.3, hideBelow: 768 },
  { kind: "botao", seed: 4, tom: "magenta", x: 96, y: 44, size: "clamp(40px, 3.6vw, 62px)", rotate: -30, depth: 1.4 },
  { kind: "flor", seed: 17, tom: "magenta", x: 4, y: 52, size: "clamp(50px, 5vw, 90px)", rotate: 26, depth: 0.5, hideBelow: 768 },
  { kind: "flor", seed: 21, tom: "pétala", x: 60, y: 6, size: "clamp(40px, 3.6vw, 64px)", rotate: 8, depth: 0.2, hideBelow: 768 },
];

type Caminho = {
  n: string;
  nome: string;
  dizer: string;
  ficha: string;
  href: string;
  /** true = WhatsApp/Instagram, abre fora; false = rota do site */
  /** abre a folha de agendar (sem JS, o WhatsApp) */
  agendar: boolean;
  icone: IconeNome;
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
export function Closing({ scheduleUrl, ambiente }: { scheduleUrl: string; ambiente?: PhotoSlot }) {
  const caminhos: Caminho[] = [
    {
      n: "01",
      nome: "Agendar horário",
      dizer: "Escolha o serviço, o dia e o horário livres: a mensagem chega pronta no WhatsApp da Tayssa.",
      ficha: "escolher o horário",
      href: scheduleUrl,
      agendar: true,
      icone: "mensagem",
    },
    {
      n: "02",
      nome: "Pedir acesso ao VIP",
      dizer: "O cadastro é um pedido de entrada: ela lê, confere e responde.",
      ficha: "aprovação dela",
      href: ROUTES.signup,
      agendar: false,
      icone: "flor",
    },
    {
      n: "03",
      nome: "Indicar alguém",
      dizer: "Passar o nome de quem você quer ver bem cuidada também é um caminho.",
      ficha: "nome e whatsapp",
      href: ROUTES.refer,
      agendar: false,
      icone: "coracao",
    },
  ];

  const ref = useRef<HTMLElement>(null);
  return (
    <section ref={ref} className="ty-section tycl ty-amb-sec ty-night" aria-label="Começar">
      <FotoAmbiente photo={ambiente} posicao="50% 45%" />
      <Arranjo pecas={FLUTUAM} className="tycl__flutua" track={ref} label="fechamento" />
      <div className="ty-container tycl__miolo">
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
 * Uma linha do índice. A linha inteira é o link: agendar abre a folha de
 * horário, interno passa pela cortina de transição. O conteúdo é o mesmo nos
 * dois casos — a reação de hover e de teclado mora no CSS.
 */
function Linha({ caminho }: { caminho: Caminho }) {
  const miolo: ReactNode = (
    <>
      <span className="tycl__fio" aria-hidden />
      <span className="tycl__icone">
        <Icone nome={caminho.icone} />
      </span>
      <h3 className="tycl__nome">{caminho.nome}</h3>
      <p className="tycl__dizer">{caminho.dizer}</p>
      <span className="tycl__acao">
        {caminho.ficha}
        <span className="ty-btn__arrow" aria-hidden />
      </span>
    </>
  );

  if (caminho.agendar) {
    return (
      <LinkAgendar className="tycl__linha ty-ico-gatilho" href={caminho.href}>
        {miolo}
      </LinkAgendar>
    );
  }
  return (
    <TransitionLink className="tycl__linha ty-ico-gatilho" href={caminho.href}>
      {miolo}
    </TransitionLink>
  );
}
