"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { PROCESSING } from "@/lib/simulador/config";
import { ScreenShell } from "./screen-shell";
import { ProgressBar } from "./progress-bar";
import { CheckIcon } from "./icons";

/** Começa rápido e desacelera de leve no fim — como um carregamento de verdade. */
function easeProgress(t: number): number {
  return 0.5 * t + 0.5 * (1 - (1 - t) * (1 - t));
}

type StepState = "pending" | "active" | "done";

export function ProcessingScreen({
  onDone,
  headingRef,
}: {
  onDone: () => void;
  headingRef: RefObject<HTMLHeadingElement | null>;
}) {
  const [progress, setProgress] = useState(0);
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  });

  useEffect(() => {
    let frame = 0;
    let settle: ReturnType<typeof setTimeout> | undefined;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / PROCESSING.durationMs);
      setProgress(easeProgress(t));
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        settle = setTimeout(() => onDoneRef.current(), PROCESSING.settleMs);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      if (settle) clearTimeout(settle);
    };
  }, []);

  const steps = PROCESSING.steps.map((step, i) => {
    const next = PROCESSING.steps[i + 1]?.at ?? 1;
    const state: StepState =
      progress >= next ? "done" : progress >= step.at ? "active" : "pending";
    return { ...step, state };
  });
  const current = steps.find((s) => s.state === "active") ?? steps[steps.length - 1];

  return (
    <ScreenShell>
      <section className="sim-panel" aria-labelledby="sim-processing-title">
        <div className="sim-panel__head">
          <h1 id="sim-processing-title" ref={headingRef} tabIndex={-1} className="sim-panel__title">
            {PROCESSING.title}
          </h1>
        </div>
        <div className="sim-panel__body">
          <p className="sim-processing__hint">{PROCESSING.hint}</p>
          <ProgressBar value={progress} label={PROCESSING.title} status={current.label} />
          <ol className="sim-steps" aria-label="Etapas do processamento">
            {steps.map((step) => (
              <li key={step.label} className="sim-step" data-state={step.state}>
                <span className="sim-step__icon" aria-hidden="true">
                  {step.state === "done" ? <CheckIcon size={14} strokeWidth={3} /> : null}
                </span>
                <span>{step.label}</span>
                {step.state === "done" ? <span className="sim-sr"> (concluído)</span> : null}
              </li>
            ))}
          </ol>
          <p className="sim-sr" aria-live="polite">
            {current.label}
          </p>
        </div>
      </section>
    </ScreenShell>
  );
}
