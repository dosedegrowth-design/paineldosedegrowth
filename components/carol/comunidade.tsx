import {
  Gift,
  Handshake,
  HeartHandshake,
  MessageCircleHeart,
  MonitorPlay,
  Package,
  Users,
  type LucideIcon,
} from "lucide-react";
import { BranchEucalyptus, SprigRosemary } from "./botanicals";
import { CountUp } from "./count-up";
import { Reveal } from "./reveal";
import {
  COMUNIDADE_CTA_URL,
  COMUNIDADE_STATS,
  DEPOIMENTOS,
  FORMATOS_MARCAS,
  MOSTRAR_DEPOIMENTOS,
  ORCAMENTO_URL,
} from "./site-data";

const ICONES_FORMATOS: Record<string, LucideIcon> = {
  Gift,
  MonitorPlay,
  Package,
  Handshake,
};

const PILARES = [
  {
    icone: Users,
    titulo: "Referência, não anúncio",
    texto:
      "Dentro da comunidade, Carolina não é uma publicidade passando no feed — é a referência que essas mulheres escolheram acompanhar e ouvir.",
  },
  {
    icone: HeartHandshake,
    titulo: "Confiança construída",
    texto:
      "Uma publi comum interrompe. Uma recomendação dentro de comunidade chega com o peso de quem já provou que se importa com o grupo.",
  },
  {
    icone: MessageCircleHeart,
    titulo: "Conversa, não impressão",
    texto:
      "O conteúdo vira assunto: as participantes comentam, perguntam e compartilham — o alcance continua depois do post.",
  },
] as const;

export function CarolComunidade() {
  return (
    <section
      id="comunidade"
      className="carol-dark-section relative overflow-hidden bg-[var(--carol-dark)] py-24 text-[var(--carol-dark-fg)] md:py-32"
    >
      <span aria-hidden className="carol-watermark bottom-4 left-[-2%] text-[18vw]">juntas</span>
      <SprigRosemary className="absolute -right-6 top-10 h-56 rotate-[24deg] text-[var(--carol-accent-light)]/15" />
      <BranchEucalyptus className="absolute -left-8 top-1/3 h-64 rotate-[-18deg] text-[var(--carol-accent-light)]/12" />

      <div className="relative mx-auto max-w-6xl px-5 md:px-8">
        <Reveal className="max-w-2xl">
          <p className="carol-eyebrow">A comunidade · projeto social</p>
          <h2 className="carol-display mt-4 text-4xl md:text-5xl">
            O ponto forte da Carol:{" "}
            <span className="carol-display-italic text-[var(--carol-accent-light)]">
              mulheres juntas
            </span>
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-[var(--carol-dark-muted)]">
            Mais que audiência: um projeto social. Uma comunidade de mulheres
            que trocam, se apoiam e crescem juntas no grupo do WhatsApp — com
            encontros ao vivo pelo Google Meet no planejamento. Foi esse
            projeto que ressignificou o conteúdo da Carol, hoje 100% focado
            em mulheres.
          </p>
        </Reveal>

        {/* Números da comunidade */}
        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {COMUNIDADE_STATS.map((s, i) => (
            <Reveal key={s.rotulo} delay={i * 0.08}>
              <div className="rounded-3xl border border-[var(--carol-dark-line)] bg-[var(--carol-dark-soft)] p-7 text-center">
                <p className="carol-display text-5xl text-[var(--carol-accent-light)]">
                  <CountUp value={s.valor} />
                </p>
                <p className="mt-2 text-[13px] font-bold uppercase tracking-[0.14em]">
                  {s.rotulo}
                </p>
                <p className="mt-1 text-[12.5px] text-[var(--carol-dark-muted)]">
                  {s.detalhe}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {PILARES.map((p, i) => (
            <Reveal key={p.titulo} delay={i * 0.08}>
              <div className="h-full rounded-3xl border border-[var(--carol-dark-line)] bg-[var(--carol-dark-soft)] p-7">
                <p.icone className="h-6 w-6 text-[var(--carol-accent-light)]" />
                <h3 className="mt-4 text-[16px] font-bold">{p.titulo}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--carol-dark-muted)]">
                  {p.texto}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Como uma marca entra — formatos citados pela Carol */}
        <Reveal delay={0.08} className="mt-16 max-w-2xl">
          <p className="carol-eyebrow">Pra marcas</p>
          <h3 className="carol-display mt-3 text-3xl md:text-4xl">
            Quatro jeitos de entrar{" "}
            <span className="carol-display-italic text-[var(--carol-accent-light)]">
              nesse círculo
            </span>
          </h3>
        </Reveal>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {FORMATOS_MARCAS.map((f, i) => {
            const Icone = ICONES_FORMATOS[f.icone] ?? Gift;
            return (
              <Reveal key={f.titulo} delay={i * 0.06}>
                <div className="flex h-full gap-5 rounded-3xl border border-[var(--carol-dark-line)] bg-[var(--carol-dark-soft)] p-7">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--carol-accent-light)]/12 text-[var(--carol-accent-light)]">
                    <Icone className="h-5 w-5" />
                  </span>
                  <div>
                    <h4 className="text-[15.5px] font-bold">{f.titulo}</h4>
                    <p className="mt-1.5 text-[13.5px] leading-relaxed text-[var(--carol-dark-muted)]">
                      {f.texto}
                    </p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* Depoimentos reais em marquee — liga quando as participantes
            autorizarem (MOSTRAR_DEPOIMENTOS em site-data) */}
        {MOSTRAR_DEPOIMENTOS && DEPOIMENTOS.length > 0 && (
          <div className="carol-marquee carol-marquee-slow mt-14" >
            <div className="carol-marquee-track !items-stretch">
              {[...DEPOIMENTOS, ...DEPOIMENTOS].map((d, i) => (
                <figure
                  key={`${d.nome}-${i}`}
                  aria-hidden={i >= DEPOIMENTOS.length}
                  className="mx-3 w-[320px] shrink-0 whitespace-normal rounded-3xl border border-[var(--carol-dark-line)] bg-[var(--carol-dark-soft)] p-7"
                >
                  <blockquote className="carol-display-italic text-lg leading-relaxed">
                    &ldquo;{d.texto}&rdquo;
                  </blockquote>
                  <figcaption className="mt-4 text-[13px] font-bold text-[var(--carol-accent-light)]">
                    {d.nome}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        )}

        <Reveal delay={0.15} className="mt-14 flex flex-col items-start gap-3 sm:flex-row">
          <a
            href={COMUNIDADE_CTA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="carol-btn carol-btn-accent"
          >
            Sou mulher, quero entrar
          </a>
          <a
            href={ORCAMENTO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="carol-btn carol-btn-ghost"
          >
            Sou marca, quero conversar
          </a>
        </Reveal>
      </div>
    </section>
  );
}
