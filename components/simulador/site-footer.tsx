import { BRAND, COPY, MENU } from "@/lib/simulador/config";
import { BrandMark } from "./icons";

export function SiteFooter() {
  return (
    <footer className="sim-footer">
      <div className="sim-container">
        <div className="sim-footer__grid">
          <div>
            <div className="sim-footer__brand">
              <BrandMark size={28} />
              <span>{BRAND.name}</span>
            </div>
            <p>{COPY.footer.statement.replace("{marca}", BRAND.name)}</p>
          </div>
          <nav aria-label={COPY.footer.navLabel}>
            <ul>
              {MENU.map((item) => (
                <li key={item.href}>
                  <a href={item.href}>{item.label}</a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <p className="sim-footer__bar">
          {BRAND.name} · {BRAND.descriptor}
        </p>
      </div>
    </footer>
  );
}
