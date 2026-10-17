import type { Metadata } from "next";
import "./vip.css";
import "./vip-vivo.css";
import { requireClientPage } from "@/lib/tayssa/auth/guards";
import { getSettings } from "@/lib/tayssa/settings";
import { renderTemplate, whatsappUrl } from "@/lib/tayssa/whatsapp";
import Link from "next/link";
import { MenuVip } from "@/components/tayssa/vip/menu-vip";
import { ROUTES } from "@/lib/tayssa/config";
import { PageEnter } from "@/components/tayssa/vip/page-enter";
import { TyBrand } from "@/components/tayssa/ui/brand";
import { FundoVivo } from "@/components/tayssa/ui/fundo-vivo";

export const metadata: Metadata = {
  title: "Meu VIP",
  robots: { index: false, follow: false },
};

/** Nada aqui pode ser prerenderizado: é sempre o espaço de UMA cliente. */
export const dynamic = "force-dynamic";

/**
 * O app da cliente. Mobile primeiro: uma coluna e um topo enxuto — a marca
 * leva ao início e os três pontinhos abrem os destinos. Nada fixo no rodapé. A verificação de sessão acontece aqui E em cada
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
      {/* o mesmo fundo vivo do site, na versão do VIP: vinho com mais ouro */}
      <FundoVivo tom="vip" className="tyv-fundo" />
      <header className="tyv-page tyv-top">
        <Link href={ROUTES.vip} className="tyv-brand" aria-label="Início do seu espaço">
          <TyBrand size="sm" />
          {user.isVip ? <span className="tyv-vip-tag">VIP</span> : null}
        </Link>
        <span className="tyv-top__acoes">
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
          <MenuVip />
        </span>
      </header>
      <main className="tyv-page">
        <PageEnter>{children}</PageEnter>
      </main>
    </div>
  );
}
