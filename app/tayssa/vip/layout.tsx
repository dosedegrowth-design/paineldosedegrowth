import type { Metadata } from "next";
import "./vip.css";
import { requireClientPage } from "@/lib/tayssa/auth/guards";
import { getSettings } from "@/lib/tayssa/settings";
import { renderTemplate, whatsappUrl } from "@/lib/tayssa/whatsapp";
import { BottomNav } from "@/components/tayssa/vip/bottom-nav";
import { PageEnter } from "@/components/tayssa/vip/page-enter";
import { TyBrand } from "@/components/tayssa/ui/brand";

export const metadata: Metadata = {
  title: "Meu VIP",
  robots: { index: false, follow: false },
};

/** Nada aqui pode ser prerenderizado: é sempre o espaço de UMA cliente. */
export const dynamic = "force-dynamic";

/**
 * O app da cliente. Mobile primeiro: uma coluna, topo enxuto, cinco
 * destinos no rodapé. A verificação de sessão acontece aqui E em cada
 * página/action (DAL) — o layout só garante o redirecionamento.
 */
export default async function VipLayout({ children }: { children: React.ReactNode }) {
  const [user, settings] = await Promise.all([requireClientPage(), getSettings()]);
  const supportUrl = whatsappUrl(
    settings.business.whatsapp,
    renderTemplate(settings.whatsapp.vip_support, { name: user.displayName })
  );
  return (
    <div className="ty-scope tyv" data-theme="night">
      <div className="ty-grain" aria-hidden />
      <header className="tyv-page tyv-top">
        <span className="tyv-brand">
          <TyBrand size="sm" />
          {user.isVip ? <span className="tyv-vip-tag">VIP</span> : null}
        </span>
        <a
          href={supportUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="tyv-icon-btn"
          aria-label="Falar com a Tayssa no WhatsApp"
        >
          <svg viewBox="0 0 24 24" aria-hidden>
            <path d="M20 11.5a7.5 7.5 0 0 1-11 6.6L4.5 19.5l1.4-4.3A7.5 7.5 0 1 1 20 11.5z" />
            <path d="M9 9.6c.3 1.6 2.2 3.7 3.9 4.2" />
          </svg>
        </a>
      </header>
      <main className="tyv-page">
        <PageEnter>{children}</PageEnter>
      </main>
      <BottomNav />
    </div>
  );
}
