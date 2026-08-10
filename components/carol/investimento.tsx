import { Check, Handshake } from "lucide-react";
import { Reveal } from "./reveal";
import { MODELOS, ORCAMENTO_URL } from "./site-data";

export function CarolInvestimento() {
  return (
    <section id="investimento" className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="carol-eyebrow">Investimento</p>
          <h2 className="carol-display mt-4 text-4xl text-[var(--carol-ink)] md:text-5xl">
            Dois jeitos de trabalhar{" "}
            <span className="carol-display-italic text-[var(--carol-accent-deep)]">
              com a Carol
            </span>
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-[var(--carol-muted)]">
            Cada projeto é orçado sob medida — formato, volume de conteúdo e
            direitos de uso definem o valor.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {MODELOS.map((m, i) => (
            <Reveal key={m.nome} delay={i * 0.1}>
              <div className="carol-card flex h-full flex-col p-8 md:p-10">
                <span className="carol-chip self-start">{m.tag}</span>
                <h3 className="carol-display mt-5 text-3xl text-[var(--carol-ink)]">
                  {m.nome}
                </h3>
                <p className="mt-4 text-[14.5px] leading-relaxed text-[var(--carol-muted)]">
                  {m.descricao}
                </p>
                <ul className="mt-6 space-y-3">
                  {m.beneficios.map((b) => (
                    <li key={b} className="flex items-start gap-3 text-[13.5px] text-[var(--carol-ink)]/80">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--carol-accent)]" />
                      {b}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex flex-1 flex-col justify-end">
                  <p className="carol-display-italic text-xl text-[var(--carol-muted)]">
                    Valores sob consulta
                  </p>
                  <a
                    href={ORCAMENTO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="carol-btn carol-btn-primary mt-4 w-full"
                  >
                    Solicitar orçamento
                  </a>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Permutas — exceção estratégica, separada dos modelos padrão */}
        <Reveal delay={0.15}>
          <div className="mt-8 flex flex-col items-start gap-5 rounded-3xl border border-dashed border-[var(--carol-gold)]/50 bg-[var(--carol-gold)]/8 p-7 sm:flex-row sm:items-center md:p-8">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--carol-gold)]/15 text-[var(--carol-gold)]">
              <Handshake className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <h3 className="text-[15px] font-bold text-[var(--carol-ink)]">
                Permutas com marcas selecionadas
              </h3>
              <p className="mt-1 text-[13.5px] leading-relaxed text-[var(--carol-muted)]">
                Exceção reservada a parcerias estratégicas — não é uma opção
                padrão. Sob consulta.
              </p>
            </div>
            <a
              href={ORCAMENTO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13.5px] font-bold text-[var(--carol-gold)] underline-offset-4 hover:underline"
            >
              Consultar →
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
