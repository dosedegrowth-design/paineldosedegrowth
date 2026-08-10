import { Instagram, Mail, MessageCircle, Music2 } from "lucide-react";
import { Reveal } from "./reveal";
import {
  COMUNIDADE_URL,
  EMAIL_CONTATO,
  IG_HANDLE,
  IG_URL,
  ORCAMENTO_URL,
  TIKTOK_URL,
  WHATSAPP_URL,
} from "./site-data";

export function CarolContato() {
  return (
    <section id="contato" className="relative overflow-hidden bg-[var(--carol-bg-soft)] pb-14 pt-24 md:pt-32">
      <span aria-hidden className="carol-watermark left-1/2 top-2 -translate-x-1/2 text-[16vw]">
        vamos?
      </span>

      <div className="relative mx-auto max-w-4xl px-5 text-center md:px-8">
        <Reveal>
          <p className="carol-eyebrow">Contato</p>
          <h2 className="carol-display mt-4 text-5xl text-[var(--carol-ink)] md:text-7xl">
            Vamos trabalhar{" "}
            <span className="carol-display-italic text-[var(--carol-accent-deep)]">
              juntas?
            </span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-[var(--carol-muted)]">
            Me conta o que a sua marca precisa e eu volto com uma proposta
            pensada pro seu objetivo — não um pacote de prateleira.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href={ORCAMENTO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="carol-btn carol-btn-accent w-full sm:w-auto"
          >
            <Instagram className="h-4 w-4" />
            Chamar no Instagram
          </a>
          <a
            href={TIKTOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="carol-btn carol-btn-ghost w-full sm:w-auto"
          >
            <Music2 className="h-4 w-4" />
            TikTok
          </a>
          {WHATSAPP_URL && (
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="carol-btn carol-btn-ghost w-full sm:w-auto"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          )}
          {EMAIL_CONTATO && (
            <a
              href={`mailto:${EMAIL_CONTATO}`}
              className="carol-btn carol-btn-ghost w-full sm:w-auto"
            >
              <Mail className="h-4 w-4" />
              E-mail
            </a>
          )}
        </Reveal>

        <Reveal delay={0.18}>
          <p className="mt-8 text-[13px] text-[var(--carol-muted)]">
            @{IG_HANDLE} no Instagram e no TikTok
            {COMUNIDADE_URL && (
              <>
                {" · "}
                <a
                  href={COMUNIDADE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[var(--carol-accent-deep)] underline-offset-4 hover:underline"
                >
                  entrar na comunidade
                </a>
              </>
            )}
          </p>
        </Reveal>
      </div>

      <footer className="relative mt-20 border-t border-[var(--carol-line)] pt-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 text-center sm:flex-row md:px-8">
          <p className="text-xs text-[var(--carol-muted)]">
            © {new Date().getFullYear()} Carolina Kühn. Todos os direitos
            reservados.
          </p>
          <p className="text-xs text-[var(--carol-muted)]">
            Site por{" "}
            <a
              href="https://www.dosedegrowth.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[var(--carol-ink)]/70 underline-offset-4 hover:underline"
            >
              Dose de Growth
            </a>
          </p>
        </div>
      </footer>
    </section>
  );
}
