"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type RefObject,
} from "react";
import { COPY, ESTIMATE, WHATSAPP_MESSAGE, WHATSAPP_NUMBER } from "@/lib/simulador/config";
import { formatBRL, formatBRLWhole, positionInRange } from "@/lib/simulador/estimate";
import { firstName, titleCaseName } from "@/lib/simulador/name";
import { buildWhatsappUrl } from "@/lib/simulador/whatsapp";
import { useReducedMotion } from "./use-reduced-motion";
import { ScreenShell } from "./screen-shell";
import type { Lead } from "./lead-form";
import {
  CheckIcon,
  ChevronDownIcon,
  InfoIcon,
  RefreshIcon,
  SpinnerIcon,
  WhatsappIcon,
} from "./icons";

const COUNT_UP_MS = 1000;
const stagger = (i: number) => ({ "--i": i }) as CSSProperties;

/** Conta de 0 até o valor (em reais inteiros). Desligado, mostra o valor direto. */
function useCountUp(targetCents: number, enabled: boolean): number {
  const [cents, setCents] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    let frame = 0;
    const start = performance.now();
    const targetReais = targetCents / 100;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / COUNT_UP_MS);
      const eased = 1 - Math.pow(1 - t, 3);
      setCents(Math.round(targetReais * eased) * 100);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [targetCents, enabled]);
  return enabled ? cents : targetCents;
}

export function ResultScreen({
  lead,
  estimateCents,
  redirecting,
  onRedirect,
  onRestart,
  headingRef,
}: {
  lead: Lead;
  estimateCents: number;
  redirecting: boolean;
  onRedirect: () => void;
  onRestart: () => void;
  headingRef: RefObject<HTMLHeadingElement | null>;
}) {
  const reduced = useReducedMotion();
  const shownCents = useCountUp(estimateCents, !reduced);
  const valor = formatBRL(estimateCents);
  const position = positionInRange(estimateCents, ESTIMATE);
  const whatsappUrl = buildWhatsappUrl(WHATSAPP_NUMBER, WHATSAPP_MESSAGE, {
    nome: titleCaseName(lead.nome),
    valor,
  });

  const [explainerOpen, setExplainerOpen] = useState(false);
  const explainerId = useId();
  const explainerRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!explainerOpen) return;
    const el = explainerRef.current;
    el?.focus({ preventScroll: true });
    el?.scrollIntoView({ block: "nearest", behavior: reduced ? "auto" : "smooth" });
  }, [explainerOpen, reduced]);

  function handleCta(e: MouseEvent<HTMLAnchorElement>) {
    if (redirecting) {
      e.preventDefault();
      return;
    }
    onRedirect();
  }

  const rangeMin = formatBRLWhole(ESTIMATE.minBRL);
  const rangeMax = formatBRLWhole(ESTIMATE.maxBRL);

  return (
    <ScreenShell
      band={
        <>
          <p className="sim-eyebrow sim-eyebrow--done sim-stagger" style={stagger(0)}>
            <CheckIcon size={14} strokeWidth={2.5} />
            {COPY.result.eyebrow}
          </p>
          <h1 ref={headingRef} tabIndex={-1} className="sim-h1 sim-stagger" style={stagger(1)}>
            {COPY.result.greeting.replace("{nome}", firstName(lead.nome))}
          </h1>
          <p className="sim-sub sim-stagger" style={stagger(2)}>
            {COPY.result.lead}
          </p>
        </>
      }
    >
      <section className="sim-card" aria-labelledby="sim-card-label">
        <p id="sim-card-label" className="sim-card__label">
          {COPY.result.cardLabel}
        </p>
        <p className="sim-card__value" data-testid="estimate-value">
          <span aria-hidden="true">{formatBRL(shownCents)}</span>
          <span className="sim-sr">{valor}</span>
        </p>
        <div
          className="sim-range"
          role="img"
          aria-label={`${COPY.result.rangeLabel}: de ${rangeMin} a ${rangeMax}`}
        >
          <p className="sim-range__title" aria-hidden="true">
            {COPY.result.rangeLabel}
          </p>
          <div className="sim-range__bar">
            <div className="sim-range__fill" style={{ width: `${position * 100}%` }} />
            <span className="sim-range__dot" style={{ left: `${position * 100}%` }} />
          </div>
          <div className="sim-range__labels" aria-hidden="true">
            <span>{rangeMin}</span>
            <span>{rangeMax}</span>
          </div>
        </div>
      </section>

      <p className="sim-disclaimer">
        <InfoIcon size={16} />
        <span>{COPY.result.disclaimer}</span>
      </p>

      <div className="sim-actions">
        <a
          className="sim-btn sim-btn--primary sim-btn--xl sim-btn--whatsapp"
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleCta}
          aria-disabled={redirecting || undefined}
          data-testid="cta-whatsapp"
        >
          {redirecting ? <SpinnerIcon size={22} /> : <WhatsappIcon size={22} />}
          <span className="sim-btn__stack">
            <span>{redirecting ? COPY.result.ctaRedirecting : COPY.result.ctaPrimary}</span>
            <small>{COPY.result.ctaPrimaryHint}</small>
          </span>
        </a>

        <button
          type="button"
          className="sim-btn sim-btn--ghost"
          aria-expanded={explainerOpen}
          aria-controls={explainerId}
          onClick={() => setExplainerOpen((open) => !open)}
        >
          <span>{COPY.result.ctaSecondary}</span>
          <ChevronDownIcon size={18} className="sim-btn__chev" />
        </button>

        {explainerOpen ? (
          <section
            id={explainerId}
            ref={explainerRef}
            tabIndex={-1}
            className="sim-explainer"
            aria-labelledby={`${explainerId}-title`}
          >
            <h2 id={`${explainerId}-title`} className="sim-explainer__title">
              {COPY.result.explainer.title}
            </h2>
            <ul>
              {COPY.result.explainer.items.map((item) => (
                <li key={item}>
                  <CheckIcon size={16} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <div className="sim-restart">
          <button type="button" className="sim-btn sim-btn--text" onClick={onRestart}>
            <RefreshIcon size={18} />
            <span>{COPY.result.restart}</span>
          </button>
        </div>
      </div>
    </ScreenShell>
  );
}
