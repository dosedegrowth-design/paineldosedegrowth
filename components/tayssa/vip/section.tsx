import type { ReactNode } from "react";
import { Reveal } from "@/components/tayssa/ui/reveal";

/** Bloco editorial do espaço privado: eyebrow, título em Bodoni, conteúdo. */
export function VipSection({
  eyebrow,
  title,
  aside,
  children,
  id,
}: {
  eyebrow: string;
  title: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section id={id} style={{ paddingBlock: "clamp(44px, 6vw, 88px)", borderTop: "1px solid var(--t-line)" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "clamp(28px, 5vw, 96px)",
          alignItems: "start",
        }}
      >
        <div>
          <Reveal>
            <span className="ty-eyebrow" style={{ display: "block", marginBottom: 16 }}>
              {eyebrow}
            </span>
            <h2 className="ty-h" style={{ fontSize: "clamp(30px, 3.4vw, 52px)" }}>
              {title}
            </h2>
            {aside ? <div style={{ marginTop: 18 }}>{aside}</div> : null}
          </Reveal>
        </div>
        <Reveal delay={0.12} style={{ gridColumn: "span 1" }}>
          {children}
        </Reveal>
      </div>
    </section>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="ty-lead" style={{ maxWidth: 480, color: "var(--t-fg-2)", fontStyle: "italic", fontFamily: "var(--t-font-display)", fontSize: 24, lineHeight: 1.3 }}>
      {children}
    </p>
  );
}
