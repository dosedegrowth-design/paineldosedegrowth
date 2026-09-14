"use client";

import { usePathname } from "next/navigation";
import { ROUTES } from "@/lib/tayssa/config";
import { logoutAction } from "@/lib/tayssa/actions/auth";
import { TransitionLink } from "@/components/tayssa/ui/transition";

const LINKS = [
  { href: ROUTES.vip, label: "Início" },
  { href: ROUTES.vipJourney, label: "Jornada" },
  { href: ROUTES.vipReferrals, label: "Indicações" },
  { href: ROUTES.vipBenefits, label: "Benefícios" },
  { href: ROUTES.vipBirthday, label: "Aniversário" },
  { href: ROUTES.vipHistory, label: "Histórico" },
  { href: ROUTES.vipProfile, label: "Perfil" },
];

/**
 * Navegação do espaço privado: calma, uma linha. No mobile os links
 * viram uma fita horizontal rolável logo abaixo da marca.
 */
export function VipNav({ name, isVip, supportUrl }: { name: string; isVip: boolean; supportUrl: string }) {
  const pathname = usePathname();
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 60, background: "color-mix(in srgb, var(--t-bg) 86%, transparent)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderBottom: "1px solid var(--t-line)" }}>
      <div className="ty-container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "var(--t-nav-h)" }}>
        <TransitionLink href={ROUTES.vip} className="ty-nav__brand" style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
          Tayssa
          {isVip ? (
            <span className="ty-eyebrow" style={{ fontSize: 9.5, color: "var(--t-accent)", letterSpacing: "0.3em" }}>
              VIP
            </span>
          ) : null}
        </TransitionLink>
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <span className="ty-small ty-hide-mobile">{name}</span>
          <a href={supportUrl} target="_blank" rel="noopener noreferrer" className="ty-link ty-link--caps ty-hide-mobile">
            Falar com Tayssa
          </a>
          <form action={logoutAction}>
            <button type="submit" className="ty-link ty-link--caps" style={{ opacity: 0.7 }}>
              Sair
            </button>
          </form>
        </div>
      </div>
      <nav aria-label="Seu espaço" style={{ borderTop: "1px solid var(--t-line)" }}>
        <div
          className="ty-container"
          style={{ display: "flex", gap: "clamp(18px, 2.4vw, 34px)", overflowX: "auto", height: 44, alignItems: "center", scrollbarWidth: "none" }}
        >
          {LINKS.map((l) => {
            const active = pathname === l.href;
            return (
              <TransitionLink
                key={l.href}
                href={l.href}
                className={`ty-link ty-link--caps ${active ? "ty-link--on" : ""}`}
                style={{ whiteSpace: "nowrap", opacity: active ? 1 : 0.68, fontSize: 10.5 }}
                aria-current={active ? "page" : undefined}
              >
                {l.label}
              </TransitionLink>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
