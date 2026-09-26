"use client";

import type { RefObject } from "react";
import { COPY } from "@/lib/simulador/config";
import { ScreenShell } from "./screen-shell";
import { LeadForm, type FormStatus, type Lead } from "./lead-form";
import { FormIcon } from "./icons";

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
    <ScreenShell>
      <section className="sim-hero">
        <p className="sim-eyebrow">{COPY.hero.eyebrow}</p>
        <h1 ref={headingRef} tabIndex={-1} className="sim-h1">
          {COPY.hero.title}
        </h1>
        <p className="sim-lead">{COPY.hero.subtitle}</p>
      </section>
      <section className="sim-panel" aria-labelledby="sim-form-title">
        <div className="sim-panel__head">
          <FormIcon size={22} className="sim-panel__icon" />
          <h2 id="sim-form-title" className="sim-panel__title">
            {COPY.form.heading}
          </h2>
        </div>
        <div className="sim-panel__body">
          <LeadForm onSubmit={onSubmit} onStatusChange={onStatusChange} />
        </div>
      </section>
    </ScreenShell>
  );
}
