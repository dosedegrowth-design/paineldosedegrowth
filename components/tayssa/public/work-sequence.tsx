"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll } from "framer-motion";
import type { PhotoSlot } from "@/lib/tayssa/photos";
import { RealPhoto } from "@/components/tayssa/ui/real-photo";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/**
 * As três técnicas da casa. `dizer` é a frase curta que vai no corpo
 * grande — a palavra em <em> é a que carrega a emoção e vira itálico
 * serifado. `texto` é a explicação, na coluna que corre.
 */
const TECNICAS: { n: string; nome: string; dizer: ReactNode; texto: string }[] = [
  {
    n: "01",
    nome: "Fio a fio",
    dizer: (
      <>
        Natural e leve, aplicado um a <em>um</em>.
      </>
    ),
    texto:
      "Uma extensão para cada cílio seu, na curvatura e no tamanho que o seu olho pede. Fecha a linha, define o contorno e continua parecendo seu: ninguém vê o fio, vê o olho.",
  },
  {
    n: "02",
    nome: "Volume",
    dizer: (
      <>
        <em>Presença</em>, sem exagero.
      </>
    ),
    texto:
      "Leques leves, abertos fio por fio na hora da aplicação. Preenchem a falha e marcam a raiz sem pesar na pálpebra — o olhar fica mais cheio, nunca mais pesado.",
  },
  {
    n: "03",
    nome: "Manutenção",
    dizer: (
      <>
        O cuidado que <em>mantém</em> o resultado.
      </>
    ),
    texto:
      "Retoque no ritmo do seu ciclo: sai o que cresceu, entra o que caiu, o desenho volta ao lugar. É a parte que faz o resultado durar.",
  },
];

/**
 * Trabalho — as três técnicas como peça editorial.
 *
 * No desktop a coluna da esquerda fica grudada: nome da técnica em corpo
 * grande, a frase com a palavra em itálico serifado, o contador e o
 * índice em mono que acende na técnica ativa. A coluna da direita corre
 * com a explicação de cada uma; quem cruza o meio da tela vira a ativa.
 * No celular a mesma matéria vira pilha, cada técnica com o seu nome
 * grande — sem coluna grudada, que no toque só atrapalha.
 *
 * A seção se sustenta em tipografia, régua e bloco chapado: sem foto ela
 * está completa. Quando a biblioteca tiver foto, ela entra chapada na
 * coluna que corre e melhora a composição — nunca é requisito.
 */
export function WorkSequence({ photos }: { photos?: PhotoSlot[] }) {
  const reduced = useReducedMotion();
  const corridaRef = useRef<HTMLOListElement>(null);
  const [ativo, setAtivo] = useState(0);
  // progresso da coluna que corre: alimenta a barrinha do contador
  const { scrollYProgress } = useScroll({
    target: corridaRef,
    offset: ["start center", "end center"],
  });

  // ativa = a última técnica cujo topo já cruzou a linha do meio da tela.
  // Medir posição (em vez de observar entrada) mantém a coluna grudada
  // certa mesmo num salto de âncora, e independe da altura do item.
  useEffect(() => {
    const itens = Array.from(corridaRef.current?.querySelectorAll<HTMLElement>("[data-tecnica]") ?? []);
    if (!itens.length) return;
    let quadro = 0;
    const medir = () => {
      quadro = 0;
      const linha = window.innerHeight * 0.52;
      let i = 0;
      itens.forEach((el, k) => {
        if (el.getBoundingClientRect().top <= linha) i = k;
      });
      setAtivo(i);
    };
    const aoRolar = () => {
      if (!quadro) quadro = requestAnimationFrame(medir);
    };
    medir();
    window.addEventListener("scroll", aoRolar, { passive: true });
    window.addEventListener("resize", aoRolar);
    return () => {
      window.removeEventListener("scroll", aoRolar);
      window.removeEventListener("resize", aoRolar);
      if (quadro) cancelAnimationFrame(quadro);
    };
  }, []);

  const atual = TECNICAS[ativo] ?? TECNICAS[0];
  const fotos = photos ?? [];
  // quem não quer movimento recebe o mesmo desenho, sem tempo de animação:
  // o alvo é sempre o estado visível, então nada fica preso no caminho
  const tempo = (s: number) => ({ duration: reduced ? 0 : s, ease: EASE });

  return (
    <section id="trabalho" className="ty-section tyw" aria-labelledby="tyw-titulo">
      <div className="ty-container">
        {/* ficha da seção */}
        <div className="tyw__topo">
          <span className="ty-mono ty-mono--ink">Trabalho</span>
          <span className="ty-mono">01 — 03</span>
        </div>

        <div className="tyw__cabeca">
          <h2 id="tyw-titulo" className="tyw__titulo">
            Três técnicas, um <em>olhar</em>.
          </h2>
          <p className="ty-body ty-measure--tight">
            Não é sobre colocar cílio: é sobre devolver ao olho o desenho que ele já tem.
          </p>
        </div>

        <hr className="ty-rule" />

        <div className="tyw__grade">
          {/* coluna grudada: quem fala alto no desktop. Espelho do que já
              está escrito na coluna que corre, então sai do leitor de tela. */}
          <div className="tyw__fixa" aria-hidden>
            <div className="tyw__conta">
              <span className="ty-index">
                <b>{atual.n}</b> / 03
              </span>
              <span className="tyw__barra">
                <motion.i style={{ scaleX: reduced ? (ativo + 1) / TECNICAS.length : scrollYProgress }} />
              </span>
            </div>

            <div className="tyw__palco">
              <AnimatePresence initial={false}>
                <motion.div
                  key={atual.n}
                  className="tyw__tecnica"
                  initial={{ clipPath: "inset(0% 0% 100% 0%)", y: "12%" }}
                  animate={{ clipPath: "inset(0% 0% 0% 0%)", y: "0%" }}
                  exit={{ opacity: 0, y: "-7%", transition: tempo(0.34) }}
                  transition={tempo(0.72)}
                >
                  <span className="tyw__nome">{atual.nome}</span>
                  <p className="tyw__dizer">{atual.dizer}</p>
                </motion.div>
              </AnimatePresence>
            </div>

            <ul className="tyw__indice">
              {TECNICAS.map((t, i) => (
                <li key={t.n} className="tyw__indice-item" data-ativo={i === ativo}>
                  <span>{t.n}</span>
                  <span className="tyw__fio">
                    <i />
                  </span>
                  <span>{t.nome}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* coluna que corre */}
          <div className="tyw__corre">
            <ol className="tyw__corrida" ref={corridaRef}>
              {TECNICAS.map((t, i) => {
                const foto = fotos[i];
                return (
                  <motion.li
                    key={t.n}
                    data-tecnica={i}
                    className="tyw__item"
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-8% 0px -8% 0px" }}
                    transition={tempo(0.85)}
                  >
                    <div className="tyw__marca">
                      <span className="ty-mono">{t.n}</span>
                      <h3 className="tyw__marca-nome">{t.nome}</h3>
                    </div>

                    {/* no celular o nome grande mora aqui; no desktop ele
                        vive na coluna grudada e este bloco sai do fluxo */}
                    <div className="tyw__item-nome" aria-hidden>
                      <span className="tyw__nome">{t.nome}</span>
                      <p className="tyw__dizer">{t.dizer}</p>
                    </div>

                    <p className="ty-body ty-measure tyw__texto">{t.texto}</p>

                    {/* foto é bônus: entra chapada, sem moldura, só se existir */}
                    {foto ? (
                      <figure className="tyw__figura">
                        <div className="ty-figure">
                          <RealPhoto photo={foto} ratio={4 / 5} sizes="(max-width: 899px) 100vw, 42vw" />
                        </div>
                        <figcaption className="tyw__legenda">
                          <span>{t.nome}</span>
                          {/* a legenda da biblioteca só entra quando diz algo
                              além do nome que já está do lado */}
                          <span>
                            {foto.caption && foto.caption.trim().toLowerCase() !== t.nome.toLowerCase()
                              ? foto.caption
                              : "@1.tayssa"}
                          </span>
                        </figcaption>
                      </figure>
                    ) : null}
                  </motion.li>
                );
              })}
            </ol>

            {/* fecho em bloco chapado: a cor da casa entra como peça, não como enfeite */}
            <motion.div
              className="tyw__fecho ty-block"
              initial={{ opacity: 0, clipPath: "inset(0% 0% 100% 0%)" }}
              whileInView={{ opacity: 1, clipPath: "inset(0% 0% 0% 0%)" }}
              viewport={{ once: true, margin: "-8% 0px -8% 0px" }}
              transition={tempo(1)}
            >
              <span className="ty-mono">Como escolher</span>
              <p className="tyw__fecho-linha">
                Na prática, a técnica se escolhe <em>sozinha</em>: no seu cílio natural, no seu rosto, na sua
                rotina.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
