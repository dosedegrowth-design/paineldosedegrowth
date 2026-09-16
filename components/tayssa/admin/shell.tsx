import type { ReactNode } from "react";

export function AdminHeader({
  eyebrow,
  title,
  lead,
  actions,
}: {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div style={{ paddingBlock: "clamp(28px, 4vw, 56px) clamp(22px, 3vw, 40px)", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 20 }}>
      <div>
        <span className="ty-eyebrow" style={{ display: "block", marginBottom: 12 }}>
          {eyebrow}
        </span>
        <h1 className="ty-display" style={{ fontSize: "clamp(26px, 3.34vw, 40px)" }}>
          {title}
        </h1>
        {lead ? (
          <p className="ty-body" style={{ marginTop: 12, maxWidth: 560 }}>
            {lead}
          </p>
        ) : null}
      </div>
      {actions ? <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>{actions}</div> : null}
    </div>
  );
}

export function AdminBlock({ title, aside, children, id }: { title: ReactNode; aside?: ReactNode; children: ReactNode; id?: string }) {
  return (
    <section id={id} style={{ paddingBlock: "clamp(22px, 3vw, 40px)", borderTop: "1px solid var(--t-line)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16, flexWrap: "wrap", marginBottom: 18 }}>
        <h2 className="ty-h-sm" style={{ fontSize: 24 }}>
          {title}
        </h2>
        {aside ? <div className="ty-small">{aside}</div> : null}
      </div>
      {children}
    </section>
  );
}

export function Stat({ n, label, href, alert }: { n: number | string; label: string; href?: string; alert?: boolean }) {
  const body = (
    <div className="ty-stat">
      <span className={`ty-stat__n ${alert ? "ty-stat__n--alert" : ""}`}>{n}</span>
      <span className="ty-eyebrow" style={{ fontSize: 10 }}>
        {label}
      </span>
    </div>
  );
  return href ? (
    <a href={href} style={{ display: "block" }}>
      {body}
    </a>
  ) : (
    body
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <p className="ty-body" style={{ fontFamily: "var(--t-font-display)", fontWeight: 300, fontSize: 17 }}>
      {children}
    </p>
  );
}
