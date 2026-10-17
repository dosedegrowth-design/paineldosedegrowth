import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { getSettings } from "@/lib/tayssa/settings";
import { ROUTES } from "@/lib/tayssa/config";
import { whatsappUrl } from "@/lib/tayssa/whatsapp";
import { Entrada } from "@/components/tayssa/auth/entrada";
import { TransitionLink } from "@/components/tayssa/ui/transition";

/** Lê o banco a cada pedido: o que a Tayssa muda no painel aparece na hora. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Área exclusiva",
  robots: { index: false, follow: false },
};

/** 403 desenhado: sem número, sem erro técnico. Um convite. */
export default async function RestrictedPage() {
  const settings = await getSettings();
  const url = whatsappUrl(settings.business.whatsapp, settings.whatsapp.public_vip_info);
  return (
    <Entrada links={[{ href: url, label: "Falar com a Tayssa", externo: true }]}>
      <div className="tyl__body tyl-surge" style={{ "--d": "0.5s" } as CSSProperties}>
        <h1 className="tyl__title">
          Essa área não faz parte <em>do seu acesso</em>
        </h1>
        <p className="tyl__sub">
          Aqui é o painel de trabalho da Tayssa. O seu espaço no VIP fica no app — e se algo parecer fora do lugar, é só
          falar com ela.
        </p>
        <TransitionLink href={ROUTES.vip} className="tyl__submit">
          Ir para o meu espaço
        </TransitionLink>
      </div>
    </Entrada>
  );
}
