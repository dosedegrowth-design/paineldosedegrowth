import type { Metadata } from "next";
import { requireClientPage } from "@/lib/tayssa/auth/guards";
import { getSettings } from "@/lib/tayssa/settings";
import { renderTemplate, whatsappUrl } from "@/lib/tayssa/whatsapp";
import { VipNav } from "@/components/tayssa/vip/nav";

export const metadata: Metadata = {
  title: "Meu VIP",
  robots: { index: false, follow: false },
};

/** Nada aqui pode ser prerenderizado: é sempre o espaço de UMA cliente. */
export const dynamic = "force-dynamic";

/**
 * Espaço privado. Noite. A verificação de sessão acontece aqui E em cada
 * página/action (DAL) — o layout só garante o redirecionamento.
 */
export default async function VipLayout({ children }: { children: React.ReactNode }) {
  const [user, settings] = await Promise.all([requireClientPage(), getSettings()]);
  const supportUrl = whatsappUrl(
    settings.business.whatsapp,
    renderTemplate(settings.whatsapp.vip_support, { name: user.displayName })
  );
  return (
    <div className="ty-scope" data-theme="night">
      <div className="ty-grain" aria-hidden />
      <VipNav name={user.displayName} isVip={user.isVip} supportUrl={supportUrl} />
      <main className="ty-container" style={{ paddingTop: "clamp(40px, 6vw, 88px)", paddingBottom: "clamp(80px, 10vw, 140px)" }}>
        {children}
      </main>
    </div>
  );
}
