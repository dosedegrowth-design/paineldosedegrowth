"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import type { ServiceRow } from "@/lib/tayssa/types";
import type { PhotoSlot } from "@/lib/tayssa/photos";
import { RealPhoto } from "@/components/tayssa/ui/real-photo";
import { FotoAmbiente } from "@/components/tayssa/ui/foto-ambiente";
import { Rolo } from "@/components/tayssa/public/rolo";
import { categoriaDoServico, itensDaCategoria, type CategoriaCatalogo } from "@/lib/tayssa/catalogo";
import { MaskedLines, Reveal } from "@/components/tayssa/ui/reveal";
import { useFinePointer } from "@/components/tayssa/ui/use-media";
import { Magnetic } from "@/components/tayssa/ui/magnetic";
import type { ServicoDetalhe } from "@/lib/tayssa/content";
import { Pendente } from "@/components/tayssa/ui/estrutura";
import { LinkAgendar } from "@/components/tayssa/public/agendar";
import { reais } from "@/lib/tayssa/agendar";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** Mesmos nomes do banco: a lista só existe para a página nunca abrir vazia. */
const FALLBACK: ServiceRow[] = [
  { id: "1", slug: "aplicacao-cilios", name: "Aplicação de cílios", description: "Aplicação completa, fio a fio ou volume.", point_value: 0, active: true, sort_order: 1 },
  { id: "2", slug: "manutencao-cilios", name: "Manutenção de cílios", description: "Manutenção periódica da aplicação.", point_value: 0, active: true, sort_order: 2 },
  { id: "3", slug: "design-sobrancelhas", name: "Design de sobrancelhas", description: "Design e acabamento.", point_value: 0, active: true, sort_order: 3 },
  { id: "4", slug: "lip-spa", name: "Lip spa", description: "Hidratação e cuidado dos lábios.", point_value: 0, active: true, sort_order: 4 },
  { id: "5", slug: "limpeza-de-pele", name: "Limpeza de pele", description: "Facial e limpeza profunda.", point_value: 0, active: true, sort_order: 5 },
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
  return (
    <>
      {partes.slice(0, corte).join(" ")} <em>{partes.slice(corte).join(" ")}</em>
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
  photoBySlug,
  detalhes = {},
  ambiente,
  catalogo = [],
}: {
  /** rolos por categoria: cada serviço mostra o da sua categoria */
  catalogo?: CategoriaCatalogo[];
  /** foto real que vira o fundo da seção, com pouca luz */
  ambiente?: PhotoSlot;
  services: ServiceRow[];
  scheduleUrl: string;
  /** só chega aqui foto que existe de verdade (a página filtra antes) */
  photoBySlug?: Record<string, PhotoSlot>;
  /** duração, valor e diferencial que a Tayssa informou (lib/tayssa/content.ts) */
  detalhes?: Record<string, ServicoDetalhe>;
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
  const fotoAtiva = ativo === null ? undefined : photoBySlug?.[list[ativo]?.slug ?? ""];
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
              Valores e disponibilidade direto com ela, no WhatsApp. Sem tabela
              genérica: cada olhar pede uma <em>conversa</em>.
            </p>
          </Reveal>
        </div>

        <ul className="tysv__lista">
          {list.map((s, i) => {
            const foto = photoBySlug?.[s.slug];
            const n = String(i + 1).padStart(2, "0");
            const rolo = itensDaCategoria(catalogo, categoriaDoServico(s.slug, s.name));
            return (
              <Reveal key={s.id} as="li" className="tysv__item" delay={Math.min(i, 4) * 0.05} amount={0.25}>
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
                  <h3 className="tysv__nome">
                    {nomeComEnfase(s.name)}
                    {s.preco != null ? <span className="tysv__preco">{reais(Number(s.preco))}</span> : null}
                  </h3>
                  {s.description || detalhes[s.slug] ? (
                    <div className="tysv__dizer">
                      {s.description ? <p className="ty-body ty-measure--tight">{s.description}</p> : null}
                      <Ficha d={detalhes[s.slug]} />
                    </div>
                  ) : (
                    // mantém a prumada das colunas quando o serviço não tem
                    // texto (no celular não há coluna: a casca some)
                    <span className="tysv__vazio" aria-hidden />
                  )}
                  {/* foto é bônus: no toque ela mora dentro da linha; no mouse,
                      o CSS esconde esta e a foto passa a seguir o cursor */}
                  {foto ? (
                    <figure className="tysv__figura">
                      <div className="ty-figure">
                        <RealPhoto photo={foto} ratio={3 / 4} sizes="(max-width: 899px) 80vw, 300px" />
                      </div>
                      <figcaption className="tysv__legenda">
                        {/* a legenda da biblioteca só entra quando diz algo
                            além do nome que já está logo acima */}
                        <span>
                          {foto.caption && foto.caption.trim().toLowerCase() !== s.name.toLowerCase()
                            ? foto.caption
                            : s.name}
                        </span>
                        <span>@1.tayssa</span>
                      </figcaption>
                    </figure>
                  ) : null}
                  <span className="tysv__acao">
                    <span>Agendar</span>
                    <span className="ty-btn__arrow" aria-hidden />
                  </span>
                </LinkAgendar>
                {rolo.length ? (
                  <div className="tysv__rolo">
                    <Rolo itens={rolo} tamanho="mini" rotulo={`Fotos e vídeos: ${s.name}`} sentido={i % 2 ? -1 : 1} />
                  </div>
                ) : null}
              </Reveal>
            );
          })}
        </ul>

        {Object.keys(detalhes).length === 0 ? (
          <div className="tysv__pendente">
            <Pendente
              titulo="Detalhes de cada serviço"
              detalhe="Confirmar a lista real de serviços e, para cada um: descrição curta, diferencial, duração e preço (só se ela quiser divulgar — senão fica 'valor no WhatsApp'). Fotos ou vídeo por serviço."
            />
          </div>
        ) : null}

        <Reveal className="tysv__pe" delay={0.08}>
          <p className="tysv__pe-linha">
            Me conta o que você tem hoje e o que quer ver no espelho — o desenho
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
                key={fotoAtiva.src}
                className="ty-figure"
                initial={{ opacity: 0, clipPath: "inset(18% 0 18% 0)" }}
                animate={{ opacity: 1, clipPath: "inset(0% 0 0% 0)" }}
                exit={{ opacity: 0, transition: tempo(0.24) }}
                transition={tempo(0.55)}
              >
                <RealPhoto photo={fotoAtiva} ratio={3 / 4} sizes="260px" />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      ) : null}
    </section>
  );
}

/** Ficha do serviço em mono: só o que a Tayssa informou. */
function Ficha({ d }: { d?: ServicoDetalhe }) {
  if (!d) return null;
  const itens = [d.duracao, d.preco].filter(Boolean) as string[];
  return (
    <>
      {d.diferencial ? <p className="ty-body ty-measure--tight tysv__dif">{d.diferencial}</p> : null}
      {itens.length ? <p className="ty-mono tysv__ficha">{itens.join(" · ")}</p> : null}
    </>
  );
}
