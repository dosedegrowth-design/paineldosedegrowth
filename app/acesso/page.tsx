import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { ROUTES } from "@/lib/config";
import { TyBrand } from "@/components/ui/brand";
import { whatsappUrl } from "@/lib/whatsapp";
import { MaskedLines, Reveal } from "@/components/ui/reveal";
import { TransitionLink } from "@/components/ui/transition";

export const metadata: Metadata = {
  title: "Área exclusiva",
  robots: { index: false, follow: false },
};

/** 403 desenhado: sem número, sem erro técnico. Um convite. */
export default async function RestrictedPage() {
  const settings = await getSettings();
  const url = whatsappUrl(settings.business.whatsapp, settings.whatsapp.public_vip_info);
  return (
    <div className="ty-scope" data-theme="night">
      <main
        className="ty-container"
        style={{ minHeight: "100svh", display: "flex", flexDirection: "column", justifyContent: "center", paddingBlock: 96 }}
      >
        <TransitionLink href={ROUTES.home} className="ty-nav__brand" style={{ position: "absolute", top: 24, left: "var(--t-gutter)" }}>
          <TyBrand />
        </TransitionLink>
        <Reveal>
          <span className="ty-eyebrow" style={{ display: "block", marginBottom: 20 }}>
            Tayssa VIP
          </span>
        </Reveal>
        <MaskedLines
          as="h1"
          inView={false}
          className="ty-display"
          lineClassName="ty-restricted-title"
          lines={["Essa área é exclusiva", "para clientes com", <em key="e">acesso VIP.</em>]}
        />
        <Reveal delay={0.5}>
          <p className="ty-body" style={{ marginTop: 24, maxWidth: 460, fontSize: 16 }}>
            O acesso é liberado pela Tayssa, de acordo com a relação de cada cliente com o estúdio.
          </p>
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginTop: 28 }}>
            <a href={url} target="_blank" rel="noopener noreferrer" className="ty-btn ty-btn--solid">
              <span>Quero saber mais</span>
              <span className="ty-btn__arrow" aria-hidden />
            </a>
            <TransitionLink href={ROUTES.login} className="ty-btn">
              <span>Entrar</span>
            </TransitionLink>
          </div>
        </Reveal>
        <style>{`.ty-restricted-title { font-size: clamp(30px, 4.1vw, 55px); }`}</style>
      </main>
    </div>
  );
}
