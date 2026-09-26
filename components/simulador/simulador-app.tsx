"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { COPY, ESTIMATE } from "@/lib/simulador/config";
import { generateEstimateCents } from "@/lib/simulador/estimate";
import { useReducedMotion } from "./use-reduced-motion";
import { BrandHeader } from "./brand-header";
import { SiteFooter } from "./site-footer";
import { Stepper } from "./stepper";
import { HowItWorks } from "./how-it-works";
import { HelpSection } from "./help-section";
import { LandingScreen } from "./landing-screen";
import { ProcessingScreen } from "./processing-screen";
import { ResultScreen } from "./result-screen";
import type { FormStatus, Lead } from "./lead-form";

/**
 * Máquina de estados do simulador. Tudo acontece no navegador; nenhum dado
 * sai da página (o WhatsApp abre por link, com nome e valor — nunca o CPF).
 *
 * Estados do fluxo, expostos em `data-state` no elemento raiz:
 *   1 idle · 2 filled · 3 error · 4 processing · 5 result · 6 redirecting · 7 restart
 */
type View =
  | { name: "landing" }
  | { name: "processing"; lead: Lead }
  | { name: "result"; lead: Lead; estimateCents: number };

export type AppState =
  | FormStatus
  | "processing"
  | "result"
  | "redirecting"
  | "restart";

/** Saída da etapa atual antes de montar a próxima (ver `.sim-screen[data-leaving]`). */
const EXIT_MS = 120;
/** Tempo que o botão fica em "Abrindo WhatsApp..." depois do toque. */
const REDIRECT_MS = 1600;

const STEP_INDEX = { landing: 0, processing: 1, result: 2 } as const;

export function SimuladorApp() {
  const reduced = useReducedMotion();
  const [view, setView] = useState<View>({ name: "landing" });
  const [leaving, setLeaving] = useState(false);
  const [formStatus, setFormStatus] = useState<FormStatus>("idle");
  const [redirecting, setRedirecting] = useState(false);
  const [restarting, setRestarting] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const exitTimer = useRef<number | undefined>(undefined);
  const redirectTimer = useRef<number | undefined>(undefined);
  const firstRender = useRef(true);

  const go = useCallback(
    (next: View) => {
      window.clearTimeout(exitTimer.current);
      const commit = () => {
        setView(next);
        setLeaving(false);
        setRestarting(false);
      };
      if (reduced) {
        commit();
        return;
      }
      setLeaving(true);
      exitTimer.current = window.setTimeout(commit, EXIT_MS);
    },
    [reduced]
  );

  useEffect(
    () => () => {
      window.clearTimeout(exitTimer.current);
      window.clearTimeout(redirectTimer.current);
    },
    []
  );

  // Toda troca de etapa: volta ao topo e leva o foco pro título — quem usa
  // teclado ou leitor de tela sabe onde está. Não no primeiro render.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    headingRef.current?.focus({ preventScroll: true });
  }, [view.name, reduced]);

  const handleSubmit = useCallback((lead: Lead) => go({ name: "processing", lead }), [go]);

  const handleDone = useCallback(() => {
    if (view.name !== "processing") return;
    go({ name: "result", lead: view.lead, estimateCents: generateEstimateCents(ESTIMATE) });
  }, [view, go]);

  const handleRedirect = useCallback(() => {
    setRedirecting(true);
    window.clearTimeout(redirectTimer.current);
    redirectTimer.current = window.setTimeout(() => setRedirecting(false), REDIRECT_MS);
  }, []);

  const handleRestart = useCallback(() => {
    setRestarting(true);
    setRedirecting(false);
    go({ name: "landing" });
  }, [go]);

  const state: AppState = restarting
    ? "restart"
    : view.name === "landing"
      ? formStatus
      : view.name === "processing"
        ? "processing"
        : redirecting
          ? "redirecting"
          : "result";

  return (
    <div className="sim-app" data-state={state}>
      <a className="sim-skip" href="#sim-conteudo">
        {COPY.skipLink}
      </a>
      <BrandHeader />
      <main id="sim-conteudo" className="sim-main">
        <div id="inicio" className="sim-container sim-service">
          <Stepper current={STEP_INDEX[view.name]} />
          <div key={view.name} className="sim-screen" data-leaving={leaving || undefined}>
            {view.name === "landing" ? (
              <LandingScreen
                onSubmit={handleSubmit}
                onStatusChange={setFormStatus}
                headingRef={headingRef}
              />
            ) : view.name === "processing" ? (
              <ProcessingScreen onDone={handleDone} headingRef={headingRef} />
            ) : (
              <ResultScreen
                lead={view.lead}
                estimateCents={view.estimateCents}
                redirecting={redirecting}
                onRedirect={handleRedirect}
                onRestart={handleRestart}
                headingRef={headingRef}
              />
            )}
          </div>
        </div>
        <HowItWorks />
        <HelpSection />
      </main>
      <SiteFooter />
    </div>
  );
}
