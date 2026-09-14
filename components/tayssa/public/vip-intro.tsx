"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ROUTES } from "@/lib/tayssa/config";
import type { BenefitRow } from "@/lib/tayssa/types";
import { MaskedLines, Reveal } from "@/components/tayssa/ui/reveal";
import { TransitionLink } from "@/components/tayssa/ui/transition";
import { Magnetic } from "@/components/tayssa/ui/magnetic";
import { useIsMobile } from "@/components/tayssa/ui/use-media";

/* tokens dia -> noite, interpolados pelo scroll */
const DAY = { bg: [244, 239, 232], fg: [26, 21, 18], fg2: [107, 90, 78], line: [26, 21, 18], accent: [110, 47, 69], photo: [217, 207, 195] };
const NIGHT = { bg: [16, 13, 11], fg: [241, 234, 225], fg2: [241, 234, 225], line: [241, 234, 225], accent: [165, 100, 122], photo: [42, 35, 32] };

function mix(a: number[], b: number[], t: number) {
  return a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(",");
}

const PRIVILEGES = [
  {
    n: "01",
    key: "referral",
    title: "Indicação",
    text: "Indique alguém novo. Depois que a Tayssa confirma o primeiro atendimento, o benefício é seu.",
  },
  {
    n: "02",
    key: "loyalty",
    title: "Fidelidade",
    text: "Cada atendimento confirmado soma na sua jornada. Marcos desbloqueiam cuidados extras, escolhidos por ela.",
  },
  {
    n: "03",
    key: "birthday",
    title: "Aniversário",
    text: "Na semana do seu aniversário, uma experiência pensada para você. Exclusiva para quem tem acesso VIP.",
  },
];

/**
 * Transição 6 — a luz abaixa.
 * Conforme esta seção se aproxima, os tokens da página inteira vão de
 * marfim a noir. Não é um bloco escuro: é a página escurecendo.
 * Privilégios como tipografia + linhas, não cards.
 */
export function VipIntro({ benefits, vipInfoUrl }: { benefits: BenefitRow[]; vipInfoUrl: string }) {
  const ref = useRef<HTMLElement>(null);
  const isMobile = useIsMobile();
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 95%", "start 30%"] });
  const t = useTransform(scrollYProgress, [0, 1], [0, 1]);

  useMotionValueEvent(t, "change", (v) => {
    const scope = document.querySelector<HTMLElement>(".ty-scope[data-theme='day']");
    if (!scope) return;
    const k = Math.max(0, Math.min(1, v));
    scope.style.setProperty("--t-bg", `rgb(${mix(DAY.bg, NIGHT.bg, k)})`);
    scope.style.setProperty("--t-fg", `rgb(${mix(DAY.fg, NIGHT.fg, k)})`);
    scope.style.setProperty("--t-fg-2", `rgba(${mix(DAY.fg2, NIGHT.fg2, k)},${(1 - k) * 1 + k * 0.62})`);
    scope.style.setProperty("--t-line", `rgba(${mix(DAY.line, NIGHT.line, k)},0.14)`);
    scope.style.setProperty("--t-line-strong", `rgba(${mix(DAY.line, NIGHT.line, k)},0.33)`);
    scope.style.setProperty("--t-accent", `rgb(${mix(DAY.accent, NIGHT.accent, k)})`);
    scope.style.setProperty("--t-photo", `rgb(${mix(DAY.photo, NIGHT.photo, k)})`);
    scope.style.setProperty("--t-accent-fg", k > 0.5 ? "#100d0b" : "#ffffff");
    document.body.style.background = `rgb(${mix(DAY.bg, NIGHT.bg, k)})`;
  });

  // ao desmontar (troca de rota), limpa os overrides
  useEffect(() => {
    return () => {
      const scope = document.querySelector<HTMLElement>(".ty-scope[data-theme='day']");
      if (scope) {
        ["--t-bg", "--t-fg", "--t-fg-2", "--t-line", "--t-line-strong", "--t-accent", "--t-photo", "--t-accent-fg"].forEach((p) =>
          scope.style.removeProperty(p)
        );
      }
      document.body.style.background = "";
    };
  }, []);

  const byType = (type: string) => benefits.find((b) => b.type === type);

  return (
    <section id="vip" ref={ref} className="ty-section" aria-label="Tayssa VIP" style={{ paddingTop: "clamp(120px, 16vw, 240px)" }}>
      <div className="ty-container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "minmax(0, 7fr) minmax(0, 5fr)",
            gap: isMobile ? 40 : "clamp(40px, 6vw, 120px)",
            alignItems: "end",
          }}
        >
          <div>
            <Reveal>
              <span className="ty-eyebrow" style={{ display: "block", marginBottom: 22 }}>
                Tayssa VIP
              </span>
            </Reveal>
            <MaskedLines
              as="h2"
              className="ty-display"
              lineClassName="ty-vip-title"
              lines={["Um espaço", "privado para", <em key="e">clientes selecionadas.</em>]}
            />
          </div>
          <Reveal delay={0.25}>
            <p className="ty-lead" style={{ maxWidth: 420 }}>
              Não é um clube de desconto. É a forma da Tayssa reconhecer quem faz
              parte da rotina do estúdio, com acesso, não com cupom.
            </p>
          </Reveal>
        </div>

        <ul style={{ listStyle: "none", margin: "clamp(56px, 8vw, 120px) 0 0", padding: 0 }}>
          {PRIVILEGES.map((p, i) => {
            const b = byType(p.key);
            return (
              <Reveal key={p.n} as="li" delay={i * 0.08} amount={0.35}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "auto 1fr" : "80px minmax(0, 5fr) minmax(0, 6fr)",
                    gap: isMobile ? "16px 18px" : "0 clamp(24px, 3vw, 56px)",
                    padding: "clamp(26px, 3vw, 44px) 0",
                    borderTop: "1px solid var(--t-line-strong)",
                    borderBottom: i === PRIVILEGES.length - 1 ? "1px solid var(--t-line-strong)" : undefined,
                    alignItems: "start",
                  }}
                >
                  <span className="ty-num ty-muted" style={{ fontSize: 11, letterSpacing: "0.2em", paddingTop: 12 }}>
                    {p.n}
                  </span>
                  <h3 className="ty-display" style={{ fontSize: "clamp(34px, 4vw, 66px)" }}>
                    {p.title}
                  </h3>
                  <div style={{ gridColumn: isMobile ? "1 / -1" : undefined, paddingTop: isMobile ? 0 : 12 }}>
                    <p className="ty-body" style={{ maxWidth: 520, fontSize: 16 }}>
                      {p.text}
                    </p>
                    {b?.description && p.key === "referral" ? (
                      <p className="ty-small" style={{ marginTop: 10 }}>
                        Hoje: {b.description} Após {b.threshold ?? 3} indicações confirmadas.
                      </p>
                    ) : null}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </ul>

        <div
          style={{
            marginTop: "clamp(48px, 6vw, 96px)",
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "minmax(0, 5fr) minmax(0, 7fr)",
            gap: isMobile ? 28 : "clamp(32px, 5vw, 96px)",
            alignItems: "start",
          }}
        >
          <Reveal>
            <h3 className="ty-h" style={{ fontSize: "clamp(26px, 2.6vw, 40px)" }}>
              Como se entra
            </h3>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="ty-body" style={{ maxWidth: 520, fontSize: 16 }}>
              O acesso é liberado pela Tayssa para clientes com relação estabelecida
              com o estúdio. Não existe cadastro aberto. Quem recebe o convite
              recebe também um acesso só seu.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 18, alignItems: "center", marginTop: 30 }}>
              <Magnetic>
                <button className="ty-btn ty-btn--solid" onClick={() => setOpen((v) => !v)} aria-expanded={open} data-cursor="Abrir">
                  <span>Quero fazer parte</span>
                  <span className="ty-btn__arrow" aria-hidden />
                </button>
              </Magnetic>
              <TransitionLink href={ROUTES.login} className="ty-link ty-link--caps">
                Já sou VIP · Entrar
              </TransitionLink>
            </div>
            <AnimatePresence initial={false}>
              {open ? (
                <motion.div
                  key="how"
                  initial={reduced ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  style={{ overflow: "hidden" }}
                >
                  <div style={{ paddingTop: 28, borderTop: "1px solid var(--t-line)", marginTop: 28, maxWidth: 520 }}>
                    <p className="ty-lead" style={{ fontSize: 18 }}>
                      Seu acesso à experiência VIP é liberado pela Tayssa para clientes elegíveis.
                    </p>
                    <p className="ty-body" style={{ marginTop: 12 }}>
                      Fale com ela. Se fizer sentido, você recebe um convite com o seu acesso.
                    </p>
                    <a href={vipInfoUrl} target="_blank" rel="noopener noreferrer" className="ty-btn ty-btn--sm" style={{ marginTop: 22 }} data-cursor="WhatsApp">
                      <span>Falar com Tayssa</span>
                      <span className="ty-btn__arrow" aria-hidden />
                    </a>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </Reveal>
        </div>
      </div>
      <style>{`.ty-vip-title { font-size: clamp(42px, 6vw, 104px); }`}</style>
    </section>
  );
}
