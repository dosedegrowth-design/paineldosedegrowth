"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { topoNoDocumento, useProgressoRolagem } from "@/components/tayssa/ui/rolagem";
import { NavDeck, useDeck } from "@/components/tayssa/ui/deck";
import { useCelular } from "@/components/tayssa/ui/use-media";
import { Icone } from "@/components/tayssa/ui/icones";
import { LinkAgendar } from "@/components/tayssa/public/agendar";
import { Visor } from "@/components/tayssa/public/rolo";
import { iconeDoServico } from "@/components/tayssa/public/services";
import { estiloFoco, type CapaServico, type MidiaCatalogo } from "@/lib/tayssa/catalogo";

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
  /** a capa (Mídia → Capas, ou a primeira foto do serviço); sem foto, o ícone do cuidado */
  capa: CapaServico | null;
  /** as fotos e vídeos do serviço, a capa primeiro: tocar na foto abre a fila no visor */
  midias: MidiaCatalogo[];
  /** o link de agendar (WhatsApp) quando a folha não abre */
  agendar: string;
};

const dois = (n: number) => String(n).padStart(2, "0");

/** `*assim*` vira a palavra em destaque. */
function comEnfase(frase: string): ReactNode[] {
  return frase.split(/\*([^*]+)\*/).map((parte, i) => (i % 2 ? <em key={i}>{parte}</em> : parte));
}

/**
 * A foto do serviço no cartão do celular: a capa grande, com o nome e a
 * frase por cima (no pé, sobre o véu vinho), e quantas fotos tem. Tocar
 * abre todas as fotos dele em tela cheia. Sem foto, o ícone do cuidado
 * num campo vinho: o cartão continua do mesmo tamanho.
 */
function FotoDoCartao({ item, onAbrir }: { item: ItemTrabalho; onAbrir: () => void }) {
  const fotos = item.midias.length;
  const miolo = (
    <>
      <span className="tyw__foto-quadro" aria-hidden>
        {item.capa ? (
          <Image
            src={item.capa.url}
            alt=""
            fill
            sizes="(max-width: 899px) 86vw, 1px"
            style={estiloFoco(item.capa.foco)}
            draggable={false}
          />
        ) : (
          <Icone nome={iconeDoServico(item.slug, item.nome)} className="tyw__foto-icone" />
        )}
      </span>
      <span className="tyw__foto-veu" aria-hidden />
      {fotos > 1 ? (
        <span className="tyw__foto-conta" aria-hidden>
          {fotos} fotos
        </span>
      ) : null}
      {/* o nome grande e a frase: desenho (o h3 e a frase de verdade estão logo abaixo) */}
      <span className="tyw__item-nome" aria-hidden>
        <span className="tyw__nome">{item.nome}</span>
        {item.frase ? <span className="tyw__dizer">{comEnfase(item.frase)}</span> : null}
      </span>
    </>
  );
  return fotos ? (
    <button type="button" className="tyw__foto" onClick={onAbrir} aria-label={`Ver as fotos: ${item.nome}`}>
      {miolo}
    </button>
  ) : (
    <div className="tyw__foto">{miolo}</div>
  );
}

/**
 * Cada serviço, um olhar: todos os serviços da casa num bloco só, com a
 * foto de cada um, a diferença em uma frase, o jeito dela de fazer e o
 * "Agendar". Era duas seções (o carrossel colorido com quadradinhos de foto
 * passando e esta apresentação sem foto) dizendo a mesma coisa; o Lucas
 * pediu uma só (05/11/2026). Valor, tempo e a galeria inteira continuam na
 * lista de serviços, logo abaixo ("Valor e fotos").
 *
 * No celular cada serviço é um cartão: a capa grande no alto, com o nome e a
 * frase por cima; o texto e as ações embaixo. Os cartões passam de lado com
 * o dedo, com o contador e as setas embaixo; tocar na foto abre as fotos do
 * serviço em tela cheia. No desktop a coluna da esquerda fica grudada: a
 * capa e o nome do serviço ativo, a frase, o contador e o índice; a coluna
 * da direita corre com o jeito dela de fazer cada um, e quem cruza o meio
 * da tela vira o ativo.
 */
export function WorkSequence({ servicos }: { servicos: ItemTrabalho[] }) {
  const reduced = useReducedMotion();
  const corridaRef = useRef<HTMLOListElement>(null);
  const [ativo, setAtivo] = useState(0);
  // progresso da coluna que corre: alimenta a barrinha do contador
  const scrollYProgress = useProgressoRolagem(corridaRef, ["start center", "end center"]);
  // celular: os cartões de lado. Entram todos quando o trilho aparece (o
  // escondido à direita não pode chegar apagado quando o dedo o traz)
  const celular = useCelular();
  const trilhoVisto = useInView(corridaRef, { once: true, amount: 0.15 });
  const deck = useDeck(corridaRef);
  // as fotos de um serviço em tela cheia (tocar na foto)
  const [visto, setVisto] = useState<{ slug: string; i: number } | null>(null);

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
  const abrir = (slug: string) => setVisto({ slug, i: 0 });
  const fila = visto ? (servicos.find((s) => s.slug === visto.slug)?.midias ?? []) : [];

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
                  {/* a capa do serviço ativo; o clique abre as fotos dele (no
                      teclado, as fotos estão na galeria da lista de serviços) */}
                  <button
                    type="button"
                    tabIndex={-1}
                    className="tyw__palco-foto"
                    disabled={!atual.midias.length}
                    onClick={() => abrir(atual.slug)}
                  >
                    {atual.capa ? (
                      <Image
                        src={atual.capa.url}
                        alt=""
                        fill
                        sizes="(min-width: 900px) 300px, 1px"
                        style={estiloFoco(atual.capa.foco)}
                        draggable={false}
                      />
                    ) : (
                      <Icone nome={iconeDoServico(atual.slug, atual.nome)} className="tyw__foto-icone" />
                    )}
                  </button>
                  <div className="tyw__tecnica-texto">
                    <span className="tyw__nome">{atual.nome}</span>
                    {atual.frase ? <p className="tyw__dizer">{comEnfase(atual.frase)}</p> : null}
                  </div>
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
                    animate={celular && trilhoVisto ? { opacity: 1, y: 0 } : undefined}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-8% 0px -8% 0px" }}
                    // no celular só os dois primeiros cartões (os que estão à
                    // vista) entram com movimento; os outros já chegam prontos,
                    // sem doze animações ao mesmo tempo no celular
                    transition={celular && i > 1 ? { duration: 0 } : { ...tempo(0.85), delay: celular && !reduced ? i * 0.08 : 0 }}
                  >
                    {/* celular: a capa grande com o nome e a frase por cima;
                        no desktop a capa mora na coluna grudada e este bloco
                        sai do fluxo */}
                    <FotoDoCartao item={t} onAbrir={() => abrir(t.slug)} />

                    <div className="tyw__marca">
                      <span className="ty-mono">{dois(i + 1)}</span>
                      <h3 className="tyw__marca-nome">{t.nome}</h3>
                    </div>

                    {/* a frase da técnica como conteúdo de verdade: as duas
                        cópias visíveis (coluna grudada no desktop, bloco
                        acima no celular) saem do leitor de tela, e uma dessas
                        duas está sempre em `display: none` — esta aqui é a
                        única que entra na árvore de acessibilidade, em
                        qualquer largura, e sem leitura dobrada */}
                    {t.frase ? <p className="sr-only">{comEnfase(t.frase)}</p> : null}

                    {t.texto ? <p className="ty-body ty-measure tyw__texto">{t.texto}</p> : null}

                    <div className="tyw__acoes">
                      <LinkAgendar
                        className="ty-btn ty-btn--sm tyw__agendar"
                        href={t.agendar}
                        servico={t.slug}
                        aria-label={`Agendar ${t.nome}`}
                      >
                        <span>Agendar</span>
                        <span className="ty-btn__arrow" aria-hidden />
                      </LinkAgendar>
                      {/* valor, tempo e a galeria inteira: na lista de serviços, logo abaixo */}
                      <a href={`#servico-${t.slug}`} className="ty-link ty-link--caps tyw__ver">
                        Valor e fotos
                      </a>
                    </div>
                  </motion.li>
                );
              })}
            </ol>
            {/* só no celular, onde a lista vira cartões de lado */}
            <NavDeck atual={deck.atual} total={total} ir={deck.ir} barra={deck.barra} nome="técnica" />

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
      <Visor
        itens={fila}
        aberto={visto ? visto.i : null}
        onMudar={(i) => setVisto((v) => (v && i !== null ? { ...v, i } : null))}
      />
    </section>
  );
}
