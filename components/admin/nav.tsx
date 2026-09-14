"use client";

import { usePathname } from "next/navigation";
import { ROUTES } from "@/lib/config";
import { TyBrand } from "@/components/ui/brand";
import { logoutAction } from "@/lib/actions/auth";
import { TransitionLink } from "@/components/ui/transition";

const LINKS = [
  { href: ROUTES.admin, label: "Visão geral", key: "" },
  { href: ROUTES.adminClients, label: "Clientes", key: "clients" },
  { href: ROUTES.adminServices, label: "Atendimentos", key: "services" },
  { href: ROUTES.adminReferrals, label: "Indicações", key: "referrals" },
  { href: ROUTES.adminBenefits, label: "Benefícios", key: "benefits" },
  { href: ROUTES.adminBirthdays, label: "Aniversários", key: "birthdays" },
  { href: ROUTES.adminSettings, label: "Configurações", key: "settings" },
];

export function AdminNav({
  name,
  attention,
}: {
  name: string;
  attention: { services: number; referrals: number; benefits: number; birthdays: number };
}) {
  const pathname = usePathname();
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 60,
        background: "color-mix(in srgb, var(--t-bg) 88%, transparent)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--t-line)",
      }}
    >
      <div className="ty-container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
        <TransitionLink href={ROUTES.admin} style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
          <TyBrand size="sm" />
          <span className="ty-eyebrow" style={{ fontSize: 9.5, letterSpacing: "0.3em" }}>
            Admin
          </span>
        </TransitionLink>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <span className="ty-small ty-hide-mobile">{name}</span>
          <TransitionLink href={ROUTES.home} className="ty-link ty-link--caps ty-hide-mobile" style={{ opacity: 0.7 }}>
            Ver site
          </TransitionLink>
          <form action={logoutAction}>
            <button type="submit" className="ty-link ty-link--caps" style={{ opacity: 0.7 }}>
              Sair
            </button>
          </form>
        </div>
      </div>
      <nav aria-label="Admin" style={{ borderTop: "1px solid var(--t-line)" }}>
        <div className="ty-container" style={{ display: "flex", gap: "clamp(16px, 2.2vw, 30px)", overflowX: "auto", height: 42, alignItems: "center", scrollbarWidth: "none" }}>
          {LINKS.map((l) => {
            const active = l.href === ROUTES.admin ? pathname === l.href : pathname.startsWith(l.href);
            const n = l.key ? attention[l.key as keyof typeof attention] ?? 0 : 0;
            return (
              <TransitionLink
                key={l.href}
                href={l.href}
                className={`ty-link ty-link--caps ${active ? "ty-link--on" : ""}`}
                style={{ whiteSpace: "nowrap", opacity: active ? 1 : 0.68, fontSize: 10.5, display: "inline-flex", gap: 8, alignItems: "center" }}
                aria-current={active ? "page" : undefined}
              >
                {l.label}
                {n > 0 ? (
                  <span className="ty-num" style={{ color: "var(--t-accent)", fontSize: 10 }}>
                    {n}
                  </span>
                ) : null}
              </TransitionLink>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
