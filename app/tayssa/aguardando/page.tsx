import type { Metadata } from "next";
import type { CSSProperties } from "react";
import "../entrar/entrar.css";
import { getSettings } from "@/lib/tayssa/settings";
import { ROUTES } from "@/lib/tayssa/config";
import { whatsappUrl } from "@/lib/tayssa/whatsapp";
import { Entrada } from "@/components/tayssa/auth/entrada";

export const metadata: Metadata = {
  title: "Pedido em análise",
  robots: { index: false, follow: false },
};

/** A porta ainda não abriu — mas a cliente sabe exatamente onde está. */
export default async function PendingPage() {
  const settings = await getSettings();
  const url = whatsappUrl(settings.business.whatsapp, settings.whatsapp.public_vip_info);
  return (
    <Entrada links={[{ href: ROUTES.login, label: "Entrar" }]}>
      <div className="tyl__body tyl-surge" style={{ "--d": "0.5s" } as CSSProperties}>
        <h1 className="tyl__title">
          Seu acesso está <em>com a Tayssa</em>
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
    </Entrada>
  );
}
