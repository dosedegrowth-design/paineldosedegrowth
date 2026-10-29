"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import type { ServiceRow } from "@/lib/tayssa/types";
import type { PhotoSlot } from "@/lib/tayssa/photos";
import { FotoAmbiente } from "@/components/tayssa/ui/foto-ambiente";
import { Rolo } from "@/components/tayssa/public/rolo";
import { estiloFoco, midiasDoServico, type CapaServico, type MidiaCatalogo } from "@/lib/tayssa/catalogo";
import { MaskedLines, Reveal } from "@/components/tayssa/ui/reveal";
import { useFinePointer } from "@/components/tayssa/ui/use-media";
import { Magnetic } from "@/components/tayssa/ui/magnetic";
import { LinkAgendar } from "@/components/tayssa/public/agendar";
import { duracaoLegivel, ehManutencao, reais, valorLegivel } from "@/lib/tayssa/agendar";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** Mesmos nomes do banco: a lista só existe para a página nunca abrir vazia. */
const FALLBACK: ServiceRow[] = [
  { id: "1", slug: "volume-brasileiro", name: "Volume brasileiro", description: null, point_value: 0, active: true, sort_order: 1 },
  { id: "2", slug: "volume-ingles", name: "Volume inglês", description: null, point_value: 0, active: true, sort_order: 2 },
  { id: "3", slug: "volume-egipcio", name: "Volume egípcio", description: null, point_value: 0, active: true, sort_order: 3 },
  { id: "4", slug: "volume-marrom", name: "Volume marrom", description: null, point_value: 0, active: true, sort_order: 4 },
  { id: "5", slug: "volume-fox-eyes", name: "Volume Fox eyes", description: null, point_value: 0, active: true, sort_order: 5 },
  { id: "6", slug: "manutencao-cilios", name: "Manutenção de cílios", description: null, point_value: 0, active: true, sort_order: 6 },
  { id: "7", slug: "lash-lifting", name: "Lash lifting", description: null, point_value: 0, active: true, sort_order: 7 },
  { id: "8", slug: "remocao-extensao", name: "Remoção da extensão", description: null, point_value: 0, active: true, sort_order: 8 },
  { id: "9", slug: "brow-lamination", name: "Brow Lamination", description: null, point_value: 0, active: true, sort_order: 9 },
  { id: "10", slug: "design-sobrancelhas", name: "Design de sobrancelhas", description: null, point_value: 0, active: true, sort_order: 10 },
  { id: "11", slug: "hidragloss", name: "Hidragloss", description: null, point_value: 0, active: true, sort_order: 11 },
  { id: "12", slug: "lip-spa", name: "Lip spa", description: null, point_value: 0, active: true, sort_order: 12 },
];

/** Palavras que só ligam: nunca são elas que carregam a emoção do nome. */
const LIGACAO = new Set(["de", "do", "da", "dos", "das", "e", "com", "no", "na", "em", "a", "o", "para"]);

/**
 * Destaca no nome a palavra que nomeia o cuidado — "Aplicação de
 * **cílios**" — e deixa o resto em sans. O `<em>` vira itálico serifado
 * pelo CSS da seção. Nome de uma palavra fica como está: destacar o
 * todo não é destaque, é enfeite.
 */
function nomeComEnfase(nome: string): ReactNode {
  const partes = nome.trim().split(/\s+/);
  if (partes.length < 2) return nome;
  const ligacao = partes.findIndex((p) => LIGACAO.has(p.toLowerCase()));
  const corte = ligacao >= 0 && ligacao + 1 < partes.length ? ligacao + 1 : partes.length - 1;
  // o espaço vai no mesmo texto da primeira parte: sozinho, entre a
  // expressão e o <em>, o Chrome tirava o nó da árvore de acessibilidade e o
  // leitor de tela dizia "Aplicação decílios", "Lipspa"
  return (
    <>
      {`${partes.slice(0, corte).join(" ")} `}
      <em>{partes.slice(corte).join(" ")}</em>
    </>
  );
}

/**
 * O link de agendar de cada linha. A mensagem que a Tayssa escreveu nas
 * configurações continua intacta: só acrescenta no fim o serviço que a
 * cliente abriu, para a conversa já começar no assunto certo.
 *
 * O complemento é concatenado, nunca reserializado. `URLSearchParams`
 * regravaria a query inteira em form-urlencoded e os espaços virariam
 * `+` — e o wa.me não traduz `+` de volta para espaço: a mensagem
 * chegaria com sinal de mais entre todas as palavras. Aqui o complemento
 * vai codificado com `encodeURIComponent`, o mesmo encoding que
 * `whatsappUrl()` (`lib/tayssa/whatsapp.ts`) usou para montar `base`,
 * então o link inteiro sai com `%20`, igual ao CTA do pé da seção.
 */
/** A capa do serviço com o enquadramento que a Tayssa escolheu (Mídia → Capas). */
function FotoCapa({ capa, sizes }: { capa: CapaServico; sizes: string }) {
  return (
    <div className="ty-photo" style={{ aspectRatio: 3 / 4 }}>
      <Image src={capa.url} alt={capa.alt} fill sizes={sizes} style={estiloFoco(capa.foco)} />
    </div>
  );
}

export function linkDoServico(base: string, nome: string): string {
  // só é seguro concatenar se `text` for o último parâmetro e tiver
  // valor — é assim que whatsappUrl() monta o link. Qualquer outro
  // formato fica exatamente como chegou.
  if (!/[?&]text=[^&#]+$/.test(base)) return base;
  // espaço no fim da mensagem salva sai antes (o `.trim()` de sempre, já codificado)
  const inicio = base.replace(/(?:%20)+$/, "");
  return inicio + encodeURIComponent(` Quero saber sobre: ${nome}.`);
}

/**
 * Serviços — o que a casa faz, como índice editorial.
 *
 * Cada serviço é uma linha: índice em mono, nome em corpo grande com a
 * palavra do cuidado em itálico serifado, a explicação numa coluna
 * estreita e o caminho de ação (agendar no WhatsApp) na ponta. A linha
 * inteira é o link — no mouse, no toque e no teclado.
 *
 * A reação de hover vive no CSS (cor, deslocamento, régua de cassis que
 * corre, o índice em mono que troca de lugar), então ela não depende de
 * foto nem de estado em JS: funciona no `:focus-visible` igual. Quando a
 * biblioteca tiver foto, ela entra chapada — seguindo o cursor no
 * desktop, dentro da linha no toque. Sem foto, nada de caixote: a
 * composição já está completa em tipografia, régua e ar.
 *
 * Pontos (`point_value`) não aparecem: aquilo é moeda do clube VIP, não
 * matéria do site.
 */
export function Services({
  services,
  scheduleUrl,
  capas = {},
  rolos = {},
  ambiente,
}: {
  /** a capa de cada serviço: a escolhida em Mídia → Capas, ou a primeira foto dele */
  capas?: Record<string, CapaServico | null>;
  /** as fotos e vídeos de cada serviço: a galeria embaixo das informações */
  rolos?: Record<string, MidiaCatalogo[]>;
  /** foto real que vira o fundo da seção, com pouca luz */
  ambiente?: PhotoSlot;
  services: ServiceRow[];
  scheduleUrl: string;
}) {
  const list = (services.length ? services : FALLBACK).filter((s) => s.slug !== "outro");
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const [ativo, setAtivo] = useState<number | null>(null);

  // a foto que segue o cursor: só existe se a linha ativa tiver foto
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 120, damping: 22, mass: 0.5 });
  const sy = useSpring(my, { stiffness: 120, damping: 22, mass: 0.5 });
  const onMove = (e: React.PointerEvent) => {
    mx.set(e.clientX);
    my.set(e.clientY);
  };
  const fotoAtiva = ativo === null ? undefined : capas[list[ativo]?.slug ?? ""] ?? undefined;
  // quem pediu menos movimento recebe o mesmo desenho, sem tempo de animação
  const tempo = (s: number) => ({ duration: reduced ? 0 : s, ease: EASE });

  return (
    <section
      id="servicos"
      className="ty-section tysv ty-night ty-amb-sec"
      aria-label="Serviços"
      onPointerMove={fine ? onMove : undefined}
    >
      <FotoAmbiente photo={ambiente} posicao="50% 40%" />
      <div className="ty-container">
        {/* ficha da seção */}
        <div className="tysv__topo">
          <span className="ty-mono ty-mono--ink">Serviços</span>
        </div>

        <div className="tysv__cabeca">
          <MaskedLines
            as="h2"
            className="tysv__titulo"
            lines={["O que a", <em key="marca">Tayssa</em>, "faz."]}
          />
          <Reveal delay={0.14}>
            <p className="ty-body ty-measure--tight tysv__lead">
              O valor e o tempo de cada cuidado. O horário você escolhe aqui e
              confirma com ela, numa <em>conversa</em> no WhatsApp.
            </p>
          </Reveal>
        </div>

        <ul className="tysv__lista">
          {list.map((s, i) => {
            const n = String(i + 1).padStart(2, "0");
            // a galeria do serviço: a capa primeiro, depois as outras fotos e vídeos dele
            const galeria = midiasDoServico(rolos[s.slug] ?? [], capas[s.slug] ?? null, s.name);
            const ficha = fichaDo(s, list);
            return (
              <Reveal
                key={s.id}
                as="li"
                id={`servico-${s.slug}`}
                className="tysv__item"
                delay={Math.min(i, 4) * 0.05}
                amount={0.25}
              >
                <LinkAgendar
                  className="tysv__linha"
                  href={linkDoServico(scheduleUrl, s.name)}
                  servico={s.slug}
                  aria-label={`Agendar ${s.name}`}
                  onPointerEnter={fine ? () => setAtivo(i) : undefined}
                  onPointerLeave={fine ? () => setAtivo(null) : undefined}
                >
                  {/* a régua da linha acende em cassis quando ela é a escolhida */}
                  <span className="tysv__fio" aria-hidden />
                  {/* o índice troca de lugar: o número sai por cima e volta em cassis */}
                  <span className="tysv__num" aria-hidden>
                    <i>{n}</i>
                    <i>{n}</i>
                  </span>
                  <h3 className="tysv__nome">{nomeComEnfase(s.name)}</h3>
                  {/* o efeito numa frase e as informações práticas; o jeito dela
                      de fazer já foi contado na apresentação das técnicas */}
                  {s.description || ficha.length ? (
                    <div className="tysv__dizer">
                      {s.description ? <p className="ty-body ty-measure--tight">{s.description}</p> : null}
                      {ficha.length ? (
                        <dl className="tysv__ficha">
                          {ficha.map((f) => (
                            <div key={f.rotulo}>
                              <dt>{f.rotulo}</dt>
                              <dd>{f.valor}</dd>
                            </div>
                          ))}
                        </dl>
                      ) : null}
                    </div>
                  ) : (
                    // mantém a prumada das colunas quando o serviço não tem
                    // texto (no celular não há coluna: a casca some)
                    <span className="tysv__vazio" aria-hidden />
                  )}
                  <span className="tysv__acao ty-btn ty-btn--sm">
                    <span>Agendar</span>
                    <span className="ty-btn__arrow" aria-hidden />
                  </span>
                </LinkAgendar>
                <Galeria itens={galeria} nome={s.name} sentido={i % 2 ? -1 : 1} />
              </Reveal>
            );
          })}
        </ul>

        <Reveal className="tysv__pe" delay={0.08}>
          <p className="tysv__pe-linha">
            Me conta o que você tem hoje e o que quer ver no espelho. O desenho
            a gente escolhe <em>junto</em>.
          </p>
          <Magnetic>
            <LinkAgendar href={scheduleUrl} className="ty-btn">
              <span>Agendar atendimento</span>
              <span className="ty-btn__arrow" aria-hidden />
            </LinkAgendar>
          </Magnetic>
        </Reveal>
      </div>

      {/* foto chapada que segue o cursor (só mouse, só quando existe foto) */}
      {fine ? (
        <motion.div
          className="tysv__segue"
          aria-hidden
          style={{ x: reduced ? mx : sx, y: reduced ? my : sy, translateX: "-50%", translateY: "-58%", rotate: -3 }}
        >
          <AnimatePresence>
            {fotoAtiva ? (
              <motion.div
                key={fotoAtiva.url}
                className="ty-figure"
                initial={{ opacity: 0, clipPath: "inset(18% 0 18% 0)" }}
                animate={{ opacity: 1, clipPath: "inset(0% 0 0% 0)" }}
                exit={{ opacity: 0, transition: tempo(0.24) }}
                transition={tempo(0.55)}
              >
                <FotoCapa capa={fotoAtiva} sizes="260px" />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      ) : null}
    </section>
  );
}

/**
 * As informações práticas de cada serviço, na ordem em que a cliente
 * procura: valor da aplicação, tempo e manutenção (do catálogo: mudou no
 * painel, muda aqui). Só o que a Tayssa cadastrou; vazio não aparece.
 */
function fichaDo(s: ServiceRow, todos: ServiceRow[]): { rotulo: string; valor: string }[] {
  const valor = valorLegivel(
    s.preco != null ? Number(s.preco) : null,
    // a manutenção do Fox eyes custa mais: a manutenção começa "a partir de"
    ehManutencao(s.slug, s.name) ? todos.map((v) => (v.preco_manutencao != null ? Number(v.preco_manutencao) : null)) : []
  );
  const tempo = duracaoLegivel(s.duration_min);
  const manutencao = s.preco_manutencao != null ? reais(Number(s.preco_manutencao)) : null;
  return [
    valor ? { rotulo: manutencao ? "Aplicação" : "Valor", valor } : null,
    tempo ? { rotulo: "Tempo", valor: tempo } : null,
    manutencao ? { rotulo: "Manutenção", valor: manutencao } : null,
  ].filter((f): f is { rotulo: string; valor: string } => Boolean(f));
}

/**
 * A galeria do serviço, depois das informações: várias fotos do mesmo
 * trabalho para ver os resultados, os detalhes e comparar os acabamentos.
 * Tocar abre a foto grande, com as setas para ir e voltar.
 */
function Galeria({ itens, nome, sentido }: { itens: MidiaCatalogo[]; nome: string; sentido: 1 | -1 }) {
  if (!itens.length) return null;
  const fotos = itens.filter((m) => m.tipo === "image").length;
  const videos = itens.length - fotos;
  const conta = [
    fotos ? `${fotos} ${fotos === 1 ? "foto" : "fotos"}` : null,
    videos ? `${videos} ${videos === 1 ? "vídeo" : "vídeos"}` : null,
  ]
    .filter(Boolean)
    .join(" e ");
  return (
    <div className="tysv__rolo">
      <p className="ty-mono tysv__galeria">
        {conta} de {nome} · toque para ver de perto
      </p>
      <Rolo itens={itens} tamanho="mini" rotulo={`Fotos de ${nome}`} sentido={sentido} />
    </div>
  );
}
