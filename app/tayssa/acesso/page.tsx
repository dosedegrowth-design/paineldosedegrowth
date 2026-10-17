import type { Metadata } from "next";
import { getSettings } from "@/lib/tayssa/settings";
import { ROUTES } from "@/lib/tayssa/config";
import { TyBrand } from "@/components/tayssa/ui/brand";
import { whatsappUrl } from "@/lib/tayssa/whatsapp";
import { MaskedLines, Reveal } from "@/components/tayssa/ui/reveal";
import { TransitionLink } from "@/components/tayssa/ui/transition";

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
          lines={["Essa área", "não faz parte", <em key="e">do seu acesso.</em>]}
        />
        <Reveal delay={0.5}>
          <p className="ty-body" style={{ marginTop: 24, maxWidth: 460, fontSize: 16 }}>
            Aqui é o painel de trabalho da Tayssa. O seu espaço no clube fica no app — e se algo parecer fora do lugar,
            é só falar com ela.
          </p>
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginTop: 28 }}>
            <TransitionLink href={ROUTES.vip} className="ty-btn ty-btn--solid">
              <span>Ir para o meu espaço</span>
              <span className="ty-btn__arrow" aria-hidden />
            </TransitionLink>
            <a href={url} target="_blank" rel="noopener noreferrer" className="ty-btn">
              <span>Falar com a Tayssa</span>
            </a>
          </div>
        </Reveal>
        <style>{`.ty-restricted-title { font-size: clamp(30px, 4.1vw, 55px); }`}</style>
      </main>
    </div>
  );
}
