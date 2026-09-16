import type { Metadata } from "next";
import "../entrar/entrar.css";
import { getSettings } from "@/lib/settings";
import { ROUTES } from "@/lib/config";
import { whatsappUrl } from "@/lib/whatsapp";
import { TyBrand } from "@/components/ui/brand";
import { TransitionLink } from "@/components/ui/transition";

export const metadata: Metadata = {
  title: "Pedido em análise",
  robots: { index: false, follow: false },
};

/** A porta ainda não abriu — mas a cliente sabe exatamente onde está. */
export default async function PendingPage() {
  const settings = await getSettings();
  const url = whatsappUrl(settings.business.whatsapp, settings.whatsapp.public_vip_info);
  return (
    <div className="tyl ty-scope" data-theme="night" data-photo="off">
      <div className="tyl__photo" aria-hidden />
      <div className="tyl__top">
        <TransitionLink href={ROUTES.home} className="tyl__brand">
          <TyBrand />
        </TransitionLink>
        <TransitionLink href={ROUTES.login} className="tyl__back">
          Entrar
        </TransitionLink>
      </div>
      <div className="tyl__body">
        <span className="tyl__eyebrow">Pedido em análise</span>
        <h1 className="tyl__title">
          Seu acesso está
          <br />
          <em>com a Tayssa.</em>
        </h1>
        <div className="tyl__foot">
          <p>
            Ela revisa cada pedido pessoalmente. Assim que aprovar, é só entrar com o e-mail e a senha que você escolheu — a
            gente não manda nada automático.
          </p>
          <a href={url} target="_blank" rel="noopener noreferrer" className="tyl__link">
            Falar com a Tayssa
          </a>
        </div>
      </div>
    </div>
  );
}
