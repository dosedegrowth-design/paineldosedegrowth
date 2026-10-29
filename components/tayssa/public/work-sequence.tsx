"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { topoNoDocumento, useProgressoRolagem } from "@/components/tayssa/ui/rolagem";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/**
 * Um serviço da apresentação. `frase` é a diferença em poucas palavras, no
 * corpo grande (das palavras da Tayssa; `*assim*` é a palavra em destaque,
 * que vira itálico); `texto` é o jeito dela de fazer, na coluna que corre.
 * Sem texto no formulário dela (volume egípcio e marrom), o serviço entra
 * só com o nome.
 */
export type ItemTrabalho = {
  slug: string;
  nome: string;
  frase: string | null;
  texto: string | null;
};

const dois = (n: number) => String(n).padStart(2, "0");

/** `*assim*` vira a palavra em destaque. */
function comEnfase(frase: string): ReactNode[] {
  return frase.split(/\*([^*]+)\*/).map((parte, i) => (i % 2 ? <em key={i}>{parte}</em> : parte));
}

/**
 * A apresentação das técnicas: todos os serviços da casa, para a cliente
 * conhecer as opções e a diferença entre elas. Só apresenta: valor, tempo e
 * fotos de cada técnica ficam na lista de serviços, e cada item leva até lá
 * (pedido da Tayssa, 29/10/2026: a técnica não se explica duas vezes).
 *
 * No desktop a coluna da esquerda fica grudada: nome do serviço em corpo
 * grande, a frase com a palavra em itálico, o contador e o índice em mono
 * que acende no serviço ativo. A coluna da direita corre com o jeito dela de
 * fazer cada um; quem cruza o meio da tela vira o ativo. No celular a mesma
 * matéria vira pilha, cada serviço com o seu nome grande — sem coluna
 * grudada, que no toque só atrapalha. Sem foto: as fotos moram na galeria
 * de cada serviço, logo abaixo.
 */
export function WorkSequence({ servicos }: { servicos: ItemTrabalho[] }) {
  const reduced = useReducedMotion();
  const corridaRef = useRef<HTMLOListElement>(null);
  const [ativo, setAtivo] = useState(0);
  // progresso da coluna que corre: alimenta a barrinha do contador
  const scrollYProgress = useProgressoRolagem(corridaRef, ["start center", "end center"]);

  // ativa = a última técnica cujo topo já cruzou a linha do meio da tela.
  // Medir posição (em vez de observar entrada) mantém a coluna grudada
  // certa mesmo num salto de âncora, e independe da altura do item. A
  // posição de cada técnica no documento é medida só quando a página muda
  // de tamanho; no scroll é só comparar com `scrollY` — nada de ler layout
  // a cada quadro.
  useEffect(() => {
    const itens = Array.from(corridaRef.current?.querySelectorAll<HTMLElement>("[data-tecnica]") ?? []);
    if (!itens.length) return;
    let topos: number[] = [];
    let linha = 0;
    let quadro = 0;
    const escolher = () => {
      const y = window.scrollY + linha;
      let i = 0;
      topos.forEach((t, k) => {
        if (t <= y) i = k;
      });
      setAtivo(i);
    };
    const medir = () => {
      quadro = 0;
      // sem transform: a entrada animada do item não desloca a medida
      topos = itens.map(topoNoDocumento);
      linha = document.documentElement.clientHeight * 0.52;
      escolher();
    };
    const remedir = () => {
      if (!quadro) quadro = requestAnimationFrame(medir);
    };
    medir();
    const ro = new ResizeObserver(remedir);
    ro.observe(document.body);
    window.addEventListener("scroll", escolher, { passive: true });
    window.addEventListener("resize", remedir);
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", escolher);
      window.removeEventListener("resize", remedir);
      if (quadro) cancelAnimationFrame(quadro);
    };
  }, [servicos.length]);

  const total = servicos.length;
  // quem não quer movimento recebe o mesmo desenho, sem tempo de animação.
  // Duração zero não basta: o `initial` de cada bloco também tem de sair
  // (`initial={reduced ? false : ...}`), senão o estado escondido é o que
  // vale enquanto o bloco não entra em vista.
  const tempo = (s: number) => ({ duration: reduced ? 0 : s, ease: EASE });
  if (!total) return null;
  const atual = servicos[Math.min(ativo, total - 1)];

  return (
    <section id="trabalho" className="ty-section tyw" aria-labelledby="tyw-titulo">
      <div className="ty-container">
        {/* ficha da seção */}
        <div className="tyw__topo">
          <span className="ty-mono ty-mono--ink">Trabalho</span>
          <span className="ty-mono">01 a {dois(total)}</span>
        </div>

        <div className="tyw__cabeca">
          <h2 id="tyw-titulo" className="tyw__titulo">
            Cada serviço, um <em>olhar</em>.
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
                <b>{dois(ativo + 1)}</b> / {dois(total)}
              </span>
              <span className="tyw__barra">
                <motion.i style={{ scaleX: reduced ? (ativo + 1) / total : scrollYProgress }} />
              </span>
            </div>

            <div className="tyw__palco">
              <AnimatePresence initial={false}>
                <motion.div
                  key={atual.slug}
                  className="tyw__tecnica"
                  initial={{ clipPath: "inset(0% 0% 100% 0%)", y: "12%" }}
                  animate={{ clipPath: "inset(0% 0% 0% 0%)", y: "0%" }}
                  exit={{ opacity: 0, y: "-7%", transition: tempo(0.34) }}
                  transition={tempo(0.72)}
                >
                  <span className="tyw__nome">{atual.nome}</span>
                  {atual.frase ? <p className="tyw__dizer">{comEnfase(atual.frase)}</p> : null}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* com muitos serviços o índice vira duas colunas: inteiro na tela */}
            <ul className="tyw__indice" data-colunas={total > 6 ? "2" : undefined}>
              {servicos.map((t, i) => (
                <li key={t.slug} className="tyw__indice-item" data-ativo={i === ativo}>
                  <span>{dois(i + 1)}</span>
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
              {servicos.map((t, i) => {
                return (
                  <motion.li
                    key={t.slug}
                    data-tecnica={i}
                    data-reveal=""
                    className="tyw__item"
                    initial={reduced ? false : { opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-8% 0px -8% 0px" }}
                    transition={tempo(0.85)}
                  >
                    <div className="tyw__marca">
                      <span className="ty-mono">{dois(i + 1)}</span>
                      <h3 className="tyw__marca-nome">{t.nome}</h3>
                    </div>

                    {/* no celular o nome grande mora aqui; no desktop ele
                        vive na coluna grudada e este bloco sai do fluxo.
                        Nas duas larguras é desenho: o nome é eco do h3 e a
                        frase tem a cópia abaixo, que é a que vai ser lida. */}
                    <div className="tyw__item-nome" aria-hidden>
                      <span className="tyw__nome">{t.nome}</span>
                      {t.frase ? <p className="tyw__dizer">{comEnfase(t.frase)}</p> : null}
                    </div>

                    {/* a frase da técnica como conteúdo de verdade: as duas
                        cópias visíveis (coluna grudada no desktop, bloco
                        acima no celular) saem do leitor de tela, e uma dessas
                        duas está sempre em `display: none` — esta aqui é a
                        única que entra na árvore de acessibilidade, em
                        qualquer largura, e sem leitura dobrada */}
                    {t.frase ? <p className="sr-only">{comEnfase(t.frase)}</p> : null}

                    {t.texto ? <p className="ty-body ty-measure tyw__texto">{t.texto}</p> : null}

                    {/* valor, tempo e fotos da técnica: na lista de serviços, logo abaixo */}
                    <a href={`#servico-${t.slug}`} className="ty-link ty-link--caps tyw__ver">
                      Valor e fotos
                    </a>
                  </motion.li>
                );
              })}
            </ol>

            {/* fecho em bloco chapado: a cor da casa entra como peça, não como enfeite */}
            <motion.div
              data-reveal=""
              className="tyw__fecho ty-block"
              initial={reduced ? false : { opacity: 0, clipPath: "inset(0% 0% 100% 0%)" }}
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
