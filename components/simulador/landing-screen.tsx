"use client";

import type { CSSProperties, RefObject } from "react";
import { COPY } from "@/lib/simulador/config";
import { ScreenShell } from "./screen-shell";
import { LeadForm, type FormStatus, type Lead } from "./lead-form";
import { HowItWorks } from "./how-it-works";

const stagger = (i: number) => ({ "--i": i }) as CSSProperties;

export function LandingScreen({
  onSubmit,
  onStatusChange,
  headingRef,
}: {
  onSubmit: (lead: Lead) => void;
  onStatusChange: (status: FormStatus) => void;
  headingRef: RefObject<HTMLHeadingElement | null>;
}) {
  return (
    <ScreenShell
      band={
        <>
          <p className="sim-eyebrow sim-stagger" style={stagger(0)}>
            {COPY.hero.eyebrow}
          </p>
          <h1 ref={headingRef} tabIndex={-1} className="sim-h1 sim-stagger" style={stagger(1)}>
            {COPY.hero.title}
          </h1>
          <p className="sim-sub sim-stagger" style={stagger(2)}>
            {COPY.hero.subtitle}
          </p>
        </>
      }
    >
      <LeadForm onSubmit={onSubmit} onStatusChange={onStatusChange} />
      <hr className="sim-divider" />
      <HowItWorks />
    </ScreenShell>
  );
}
