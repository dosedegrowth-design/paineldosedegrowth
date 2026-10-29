"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useReducedMotion } from "framer-motion";
import type { ServiceRow } from "@/lib/tayssa/types";
import type { ServicoDetalhe } from "@/lib/tayssa/content";
import { estiloFoco, roloAbaixoDaCapa, type CapaServico, type MidiaCatalogo } from "@/lib/tayssa/catalogo";
import { duracaoLegivel, ehManutencao, reais, valorLegivel } from "@/lib/tayssa/agendar";
import { Icone, type IconeNome } from "@/components/tayssa/ui/icones";
import { MaskedLines, Reveal } from "@/components/tayssa/ui/reveal";
import { LinkAgendar } from "@/components/tayssa/public/agendar";

/** O gesto de cada cuidado, pelo nome (serviço novo acha o seu sozinho; o resto cai na flor). */
function iconeDo(slug: string, nome: string): IconeNome {
  const n = `${slug} ${nome}`.toLowerCase();
  if (/manuten/.test(n)) return "calendario";
  if (/remo[cç]/.test(n)) return "brilho";
  if (/sobrancelh|brow/.test(n)) return "flor";
  if (/l[aá]bio|lip|gloss|boca/.test(n)) return "coracao";
  if (/volume|fox|lash|c[ií]lio|extens/.test(n)) return "olho";
  return "flor";
}
/**
 * Onde mora o cartão da vez: o meio no celular (o trilho tem meia tela de
 * folga de cada lado) e o começo do conteúdo no computador.
 */
const folga = (t: HTMLElement) => parseFloat(getComputedStyle(t).paddingLeft) || 0;
/** As cores da casa, em rodízio: o carrossel é a paleta inteira. */
const CORES = ["vinho", "magenta", "rosa", "ameixa", "bordo", "blush"] as const;

/**
 * O link de agendar de cada serviço. A mensagem que a Tayssa escreveu nas
 * configurações continua intacta: só acrescenta no fim o serviço que a
 * cliente abriu, para a conversa já começar no assunto certo.
 *
 * O complemento é concatenado, nunca reserializado. `URLSearchParams`
 * regravaria a query inteira em form-urlencoded e os espaços virariam
 * `+`, que o wa.me não traduz de volta para espaço. Aqui o complemento vai
 * com `encodeURIComponent`, o mesmo encoding que `whatsappUrl()` usou.
 */
export function linkDoServico(base: string, nome: string): string {
  // só é seguro concatenar se `text` for o último parâmetro e tiver valor
  if (!/[?&]text=[^&#]+$/.test(base)) return base;
  // espaço no fim da mensagem salva sai antes (o `.trim()` de sempre, já codificado)
  const inicio = base.replace(/(?:%20)+$/, "");
  return inicio + encodeURIComponent(` Quero saber sobre: ${nome}.`);
}

/**
 * As outras fotos do serviço passando dentro do cartão, embaixo da capa.
 * Duas cópias da fila, cada uma com o espaço do fim dentro dela: andar
 * metade do trilho é andar uma cópia, e a emenda não aparece.
 */
function Tira({ itens }: { itens: MidiaCatalogo[] }) {
  const fotos = itens.filter((m) => m.tipo === "image").slice(0, 10);
  if (fotos.length < 2) return null;
  const base: MidiaCatalogo[] = [];
  while (base.length < 6) base.push(...fotos);
  return (
    <span className="tyfx__tira" aria-hidden>
      <span className="tyfx__tira-trilho" style={{ "--dur": `${base.length * 2.6}s` } as CSSProperties}>
        {[...base, ...base].map((m, i) => (
          <span key={`${m.id}-${i}`} className="tyfx__tira-foto">
            <Image src={m.url} alt="" fill sizes="96px" style={estiloFoco(m.foco)} draggable={false} />
          </span>
        ))}
      </span>
    </span>
  );
}

/**
 * Os serviços, logo depois da abertura: um carrossel de verdade (o dedo
 * passa para o lado, o cartão encaixa no meio, os pontinhos mostram onde
 * está). Cada cartão é um serviço: a capa que a Tayssa escolheu no painel
 * e, logo abaixo, dentro do mesmo cartão, as outras fotos dele passando;
 * depois o valor, o tempo e o "Agendar". Serviço sem foto fica sem foto
 * (nunca a de outro serviço): no lugar, o ícone do cuidado.
 */
export function ServiceStrip({
  services,
  scheduleUrl,
  capas = {},
  rolos = {},
  detalhes = {},
}: {
  services: ServiceRow[];
  scheduleUrl: string;
  /** a capa de cada serviço (`capasDosServicos`), pela slug */
  capas?: Record<string, CapaServico | null>;
  /** as fotos de cada serviço (`rolosDosServicos`), pela slug */
  rolos?: Record<string, MidiaCatalogo[]>;
  /** o diferencial que a Tayssa escreveu, para quem não tem descrição */
  detalhes?: Record<string, ServicoDetalhe>;
}) {
  const reduced = useReducedMotion();
  const trilho = useRef<HTMLUListElement>(null);
  const [atual, setAtual] = useState(0);
  const lista = services.filter((s) => s.slug !== "outro");

  // o cartão da vez (um cálculo por quadro, só quando rola)
  useEffect(() => {
    const t = trilho.current;
    if (!t) return;
    let raf = 0;
    const medir = () => {
      raf = 0;
      const primeiro = t.children[0] as HTMLElement | undefined;
      const alvo = t.scrollLeft + folga(t) + (primeiro?.offsetWidth ?? 0) / 2;
      let melhor = 0;
      let menor = Infinity;
      Array.from(t.children).forEach((el, i) => {
        const li = el as HTMLElement;
        const d = Math.abs(li.offsetLeft + li.offsetWidth / 2 - alvo);
        if (d < menor) {
          menor = d;
          melhor = i;
        }
      });
      setAtual(melhor);
    };
    const aoRolar = () => {
      if (!raf) raf = requestAnimationFrame(medir);
    };
    t.addEventListener("scroll", aoRolar, { passive: true });
    return () => {
      t.removeEventListener("scroll", aoRolar);
      cancelAnimationFrame(raf);
    };
  }, []);

  const irPara = (i: number) => {
    const t = trilho.current;
    const li = t?.children[Math.max(0, Math.min(lista.length - 1, i))] as HTMLElement | undefined;
    if (!t || !li) return;
    t.scrollTo({ left: li.offsetLeft - folga(t), behavior: reduced ? "auto" : "smooth" });
  };

  if (!lista.length) return null;

  return (
    <section id="servicos" className="tyfx ty-night" aria-label="Serviços">
      <div className="ty-container">
        <div className="tysv__cabeca tyfx__cabeca">
          <MaskedLines as="h2" className="tysv__titulo" lines={["O que a", <em key="marca">Tayssa</em>, "faz."]} />
          <Reveal delay={0.14}>
            <p className="ty-body ty-measure--tight tysv__lead">
              Passe para o lado: cada cuidado com as fotos do trabalho, o valor e o tempo. O horário você escolhe aqui e
              confirma com ela no WhatsApp.
            </p>
          </Reveal>
        </div>
      </div>

      {/* gesto lateral do trackpad fica com o carrossel (o Lenis só cuida do vertical) */}
      <ul ref={trilho} className="tyfx__trilho" data-lenis-prevent-horizontal="">
        {lista.map((s, i) => {
          const capa = capas[s.slug] ?? null;
          const valor = valorLegivel(
            s.preco != null ? Number(s.preco) : null,
            // a manutenção do Fox eyes custa mais: a manutenção começa "a partir de"
            ehManutencao(s.slug, s.name) ? lista.map((v) => (v.preco_manutencao != null ? Number(v.preco_manutencao) : null)) : []
          );
          const texto = s.description?.trim() || detalhes[s.slug]?.diferencial || null;
          const ficha = [
            duracaoLegivel(s.duration_min),
            s.preco_manutencao != null ? `manutenção ${reais(Number(s.preco_manutencao))}` : null,
          ].filter(Boolean);
          return (
            <li key={s.id} className="tyfx__item">
              <LinkAgendar
                className="tyfx__cartao ty-ico-gatilho"
                data-cor={CORES[i % CORES.length]}
                href={linkDoServico(scheduleUrl, s.name)}
                servico={s.slug}
                aria-label={`Agendar ${s.name}`}
              >
                {/* em cima, sempre no mesmo formato: a capa, ou o ícone do cuidado quando não há foto */}
                <span className="tyfx__capa">
                  {capa ? (
                    <Image
                      src={capa.url}
                      alt={capa.alt}
                      fill
                      sizes="(max-width: 1099px) 80vw, 320px"
                      style={estiloFoco(capa.foco)}
                      draggable={false}
                    />
                  ) : (
                    <span className="tyfx__selo">
                      <Icone nome={iconeDo(s.slug, s.name)} className="tyfx__icone" />
                    </span>
                  )}
                </span>
                {/* embaixo da capa, as outras fotos do mesmo serviço passando */}
                <Tira itens={roloAbaixoDaCapa(rolos[s.slug] ?? [], capa)} />
                <span className="tyfx__corpo">
                  <span className="tyfx__nome">{s.name}</span>
                  {valor ? <span className="tyfx__preco">{valor}</span> : null}
                  {texto ? <span className="tyfx__texto">{texto}</span> : null}
                  {ficha.length ? <span className="tyfx__ficha">{ficha.join(" · ")}</span> : null}
                  <span className="tyfx__acao" aria-hidden>
                    Agendar
                    <span className="ty-btn__arrow" />
                  </span>
                </span>
              </LinkAgendar>
            </li>
          );
        })}
      </ul>

      {lista.length > 1 ? (
        <div className="tyfx__nav">
          <button
            type="button"
            className="tyfx__seta tyfx__seta--ant"
            aria-label="Serviço anterior"
            disabled={atual === 0}
            onClick={() => irPara(atual - 1)}
          />
          <div className="tyfx__pontos">
            {lista.map((s, i) => (
              <button
                key={s.id}
                type="button"
                className="tyfx__ponto"
                data-on={i === atual}
                aria-label={`Ver ${s.name}`}
                aria-current={i === atual ? "true" : undefined}
                onClick={() => irPara(i)}
              />
            ))}
          </div>
          <button
            type="button"
            className="tyfx__seta tyfx__seta--prox"
            aria-label="Próximo serviço"
            disabled={atual === lista.length - 1}
            onClick={() => irPara(atual + 1)}
          />
        </div>
      ) : null}
    </section>
  );
}
