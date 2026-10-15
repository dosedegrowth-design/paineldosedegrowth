import type { ReactNode } from "react";
import { TransitionLink } from "@/components/tayssa/ui/transition";

/**
 * Peças do painel. Mesmo vocabulário do `admin.css`: cabeçalho de
 * página, bloco com título, número em destaque e vazio desenhado.
 */

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
    <div className="tya-pagehead tya-up">
      <div>
        <span className="tya-eyebrow">{eyebrow}</span>
        <h1 className="tya-h1" style={{ marginTop: 10 }}>
          {title}
        </h1>
        {lead ? <p className="tya-lead">{lead}</p> : null}
      </div>
      {actions ? <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>{actions}</div> : null}
    </div>
  );
}

export function AdminBlock({
  title,
  aside,
  children,
  id,
}: {
  title: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="tya-sec tya-up">
      <div className="tya-card">
        <div className="tya-head">
          <h2>{title}</h2>
          {aside ? <div className="tya-small">{aside}</div> : null}
        </div>
        {children}
      </div>
    </section>
  );
}

/** Número que importa. `alert` acende quando há gente esperando. */
export function Stat({
  n,
  label,
  href,
  alert,
  sub,
  tom,
}: {
  n: number | string;
  label: string;
  href?: string;
  alert?: boolean;
  sub?: string;
  tom?: "brand" | "dark" | "gold";
}) {
  const corpo = (
    <div className={`tya-card tya-kpi ${tom ? `tya-card--${tom}` : ""} ${href ? "tya-card--hover" : ""}`}>
      <div className="tya-kpi__top">
        <span className="tya-eyebrow">{label}</span>
      </div>
      <p className="tya-kpi__n" style={alert && !tom ? { color: "var(--tya-brand)" } : undefined}>
        {n}
      </p>
      {sub ? <p className="tya-kpi__sub">{sub}</p> : null}
    </div>
  );
  return href ? (
    <TransitionLink href={href} style={{ display: "block" }}>
      {corpo}
    </TransitionLink>
  ) : (
    corpo
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="tya-empty">{children}</p>;
}
