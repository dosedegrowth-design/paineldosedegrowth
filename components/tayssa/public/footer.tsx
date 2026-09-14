import type { BusinessSettings } from "@/lib/tayssa/config";
import { ROUTES } from "@/lib/tayssa/config";
import { TyBrand } from "@/components/tayssa/ui/brand";
import { whatsappUrl } from "@/lib/tayssa/whatsapp";
import { TransitionLink } from "@/components/tayssa/ui/transition";

export function PublicFooter({ business }: { business: BusinessSettings }) {
  return (
    <footer className="ty-container" style={{ paddingBottom: 36 }}>
      <div className="ty-rule" />
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 18,
          paddingTop: 22,
        }}
      >
        <TyBrand />
        <nav style={{ display: "flex", flexWrap: "wrap", gap: 22 }} aria-label="Links">
          <a href={business.instagram_url} target="_blank" rel="noopener noreferrer" className="ty-link ty-link--caps">
            Instagram
          </a>
          <a href={whatsappUrl(business.whatsapp)} target="_blank" rel="noopener noreferrer" className="ty-link ty-link--caps">
            WhatsApp
          </a>
          <TransitionLink href={ROUTES.refer} className="ty-link ty-link--caps">
            Indicar
          </TransitionLink>
          <TransitionLink href={ROUTES.login} className="ty-link ty-link--caps">
            Área VIP
          </TransitionLink>
        </nav>
        <span className="ty-small">
          © {new Date().getFullYear()} {business.name}. {business.instagram_handle}
        </span>
      </div>
    </footer>
  );
}
