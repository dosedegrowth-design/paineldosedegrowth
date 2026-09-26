"use client";

import { useEffect, useId, useRef, useState, type MouseEvent, type RefObject } from "react";
import { COPY, ESTIMATE, WHATSAPP_MESSAGE, WHATSAPP_NUMBER } from "@/lib/simulador/config";
import { formatBRL, formatBRLWhole, positionInRange } from "@/lib/simulador/estimate";
import { firstName, titleCaseName } from "@/lib/simulador/name";
import { buildWhatsappUrl } from "@/lib/simulador/whatsapp";
import { useReducedMotion } from "./use-reduced-motion";
import { ScreenShell } from "./screen-shell";
import type { Lead } from "./lead-form";
import {
  AlertIcon,
  CheckIcon,
  ChevronDownIcon,
  RefreshIcon,
  SpinnerIcon,
  WhatsappIcon,
} from "./icons";

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
    <ScreenShell>
      <section className="sim-hero">
        <p className="sim-status">
          <CheckIcon size={16} strokeWidth={3} />
          {COPY.result.eyebrow}
        </p>
        <h1 ref={headingRef} tabIndex={-1} className="sim-h1">
          {COPY.result.greeting.replace("{nome}", firstName(lead.nome))}
        </h1>
        <p className="sim-lead">{COPY.result.lead}</p>
      </section>

      <section className="sim-panel" aria-labelledby="sim-result-title">
        <div className="sim-panel__head">
          <h2 id="sim-result-title" className="sim-panel__title">
            {COPY.result.panelTitle}
          </h2>
        </div>
        <div className="sim-panel__body">
          <p className="sim-value__label">{COPY.result.cardLabel}</p>
          <p className="sim-value" data-testid="estimate-value">
            {valor}
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

          <div className="sim-notice sim-notice--warn sim-disclaimer" role="note">
            <AlertIcon size={20} />
            <p className="sim-notice__title">{COPY.result.attention}</p>
            <p className="sim-notice__body">{COPY.result.disclaimer}</p>
          </div>

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
              className="sim-btn sim-btn--secondary"
              aria-expanded={explainerOpen}
              aria-controls={explainerId}
              onClick={() => setExplainerOpen((open) => !open)}
              data-testid="cta-explain"
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
                <h3 id={`${explainerId}-title`} className="sim-explainer__title">
                  {COPY.result.explainer.title}
                </h3>
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
              <button type="button" className="sim-btn sim-btn--link" onClick={onRestart} data-testid="cta-restart">
                <RefreshIcon size={18} />
                <span>{COPY.result.restart}</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </ScreenShell>
  );
}
