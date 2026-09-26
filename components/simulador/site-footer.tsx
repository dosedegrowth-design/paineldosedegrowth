import { BRAND, COPY } from "@/lib/simulador/config";
import { BrandMark } from "./icons";

export function SiteFooter() {
  return (
    <footer className="sim-footer">
      <div className="sim-footer__brand">
        <BrandMark size={20} />
        <span>{BRAND.name}</span>
      </div>
      <p>{COPY.footer.line1.replace("{marca}", BRAND.name)}</p>
      <p>{COPY.footer.line2}</p>
    </footer>
  );
}
