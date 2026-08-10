import { HeartHandshake, MessageCircleHeart, Users } from "lucide-react";
import { Reveal } from "./reveal";
import {
  COMUNIDADE_URL,
  DEPOIMENTOS,
  MOSTRAR_DEPOIMENTOS,
  ORCAMENTO_URL,
} from "./site-data";

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

      <div className="relative mx-auto max-w-6xl px-5 md:px-8">
        <Reveal className="max-w-2xl">
          <p className="carol-eyebrow">A comunidade</p>
          <h2 className="carol-display mt-4 text-4xl md:text-5xl">
            Publicidade dentro de comunidade tem{" "}
            <span className="carol-display-italic text-[#e75a93]">outro peso</span>
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-[var(--carol-dark-muted)]">
            Carolina lidera uma comunidade de mulheres que a acompanham de
            perto. Ali, o nível de confiança é de conversa entre amigas — algo
            que uma publi comum não constrói.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {PILARES.map((p, i) => (
            <Reveal key={p.titulo} delay={i * 0.08}>
              <div className="h-full rounded-3xl border border-[var(--carol-dark-line)] bg-[var(--carol-dark-soft)] p-7">
                <p.icone className="h-6 w-6 text-[#e75a93]" />
                <h3 className="mt-4 text-[16px] font-bold">{p.titulo}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--carol-dark-muted)]">
                  {p.texto}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Depoimentos reais — aguardando autorização das participantes */}
        {MOSTRAR_DEPOIMENTOS && DEPOIMENTOS.length > 0 && (
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {DEPOIMENTOS.map((d, i) => (
              <Reveal key={d.nome} delay={i * 0.08}>
                <figure className="h-full rounded-3xl border border-[var(--carol-dark-line)] bg-[var(--carol-dark-soft)] p-7">
                  <blockquote className="carol-display-italic text-lg leading-relaxed">
                    &ldquo;{d.texto}&rdquo;
                  </blockquote>
                  <figcaption className="mt-4 text-[13px] font-bold text-[#e75a93]">
                    {d.nome}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        )}

        <Reveal delay={0.15} className="mt-12 flex flex-col items-start gap-3 sm:flex-row">
          {/* Botão de entrada só quando a Carol passar o link real */}
          {COMUNIDADE_URL && (
            <a
              href={COMUNIDADE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="carol-btn carol-btn-accent"
            >
              Quero entrar na comunidade
            </a>
          )}
          <a
            href={ORCAMENTO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={COMUNIDADE_URL ? "carol-btn carol-btn-ghost" : "carol-btn carol-btn-accent"}
          >
            Quero anunciar na comunidade
          </a>
        </Reveal>
      </div>
    </section>
  );
}
