import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./vip.css";
import "./vip-vivo.css";
import "./vip-perola.css";
import "./vip-site.css";
import { requireClientPage } from "@/lib/tayssa/auth/guards";
import { getSessionUser } from "@/lib/tayssa/auth/session";
import { getSettings } from "@/lib/tayssa/settings";
import { MENSAGENS_DA_AGENDA, renderTemplate, whatsappUrl } from "@/lib/tayssa/whatsapp";
import Link from "next/link";
import { MenuVip } from "@/components/tayssa/vip/menu-vip";
import { ROUTES } from "@/lib/tayssa/config";
import { PageEnter } from "@/components/tayssa/vip/page-enter";
import { TyBrand } from "@/components/tayssa/ui/brand";
import { FundoVivo } from "@/components/tayssa/ui/fundo-vivo";
import { WhatsAppIcon } from "@/components/tayssa/ui/whatsapp";

/** a serifa do VIP (saudação, títulos do painel, marca do topo): só aqui, o site não carrega */
const serifa = localFont({
  src: "../../../node_modules/@fontsource-variable/bodoni-moda/files/bodoni-moda-latin-wght-normal.woff2",
  weight: "400 900",
  display: "swap",
  variable: "--tyv-serifa",
  adjustFontFallback: "Times New Roman",
});

/** Com o VIP fechado a aba diz "Meus agendamentos": nada da conta fala em VIP (menos para quem a Tayssa ativou como VIP). */
export async function generateMetadata(): Promise<Metadata> {
  const [settings, user] = await Promise.all([getSettings(), getSessionUser()]);
  return {
    title: settings.rules.vip_aberto || user?.isVip ? "Meu VIP" : "Meus agendamentos",
    robots: { index: false, follow: false },
  };
}

/**
 * A barra do navegador na cor do topo do VIP (bege, não o rosado do site),
 * e a página até a borda do iPhone: com `cover` o pé vinho desce por trás
 * da barra de gestos (`env(safe-area-inset-bottom)` deixa de ser 0).
 */
export const viewport: Viewport = {
  themeColor: "#f3eadd",
  viewportFit: "cover",
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
  // VIP fechado (Configurações → Programa VIP): a área é só a agenda dela, e
  // a mensagem do WhatsApp não diz "do VIP" (Lucas, 05/11/2026)
  // quem a Tayssa ativou como VIP vê a área VIP mesmo com o programa fechado
  const soAgenda = !settings.rules.vip_aberto && !user.isVip;
  const supportUrl = whatsappUrl(
    settings.business.whatsapp,
    renderTemplate(soAgenda ? MENSAGENS_DA_AGENDA.falarComNome : settings.whatsapp.vip_support, {
      name: user.displayName,
    })
  );
  return (
    <div className={`ty-scope tyv ${serifa.variable}`}>
      {/* o VIP tem pele própria: bege dourado e ícones vinho (o site é vinho e noite) */}
      <FundoVivo tom="perola" className="tyv-fundo" />
      <header className="tyv-page tyv-top">
        <Link href={soAgenda ? ROUTES.vipBook : ROUTES.vip} className="tyv-brand" aria-label={soAgenda ? "Meus agendamentos" : "Início do seu espaço"}>
          <TyBrand size="sm" />
          {user.isVip && !soAgenda ? <span className="tyv-vip-tag">VIP</span> : null}
        </Link>
        <span className="tyv-top__acoes">
          <a
            href={supportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="tyv-icon-btn"
            aria-label="Falar com a Tayssa no WhatsApp"
          >
            <WhatsAppIcon size={20} />
          </a>
          <MenuVip soAgenda={soAgenda} />
        </span>
      </header>
      <main className="tyv-page">
        <PageEnter>{children}</PageEnter>
      </main>
      {/* o pé: o fio com o brilho e a onda vinho fechando a página */}
      <footer className="tyv-pe" aria-hidden>
        <span className="tyv-pe__fio">
          <svg viewBox="0 0 24 24">
            <path d="M12 2.5c.5 5.2 4.3 9 9.5 9.5-5.2.5-9 4.3-9.5 9.5-.5-5.2-4.3-9-9.5-9.5 5.2-.5 9-4.3 9.5-9.5z" />
          </svg>
        </span>
        <svg className="tyv-pe__onda" viewBox="0 0 390 100" preserveAspectRatio="none">
          <path className="tyv-pe__vinho" d="M0 34C92 92 214 6 390 40V100H0Z" />
          <path className="tyv-pe__ouro" d="M0 34C92 92 214 6 390 40" />
        </svg>
      </footer>
    </div>
  );
}
