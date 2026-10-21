import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isDbConfigured, logServerError } from "@/lib/tayssa/db";
import { lerLinkDeEntrada, type LinkDeEntrada } from "@/lib/tayssa/auth/link";
import { entrarPorLinkAction } from "@/lib/tayssa/actions/auth";
import { ROUTES } from "@/lib/tayssa/config";
import { Entrada } from "@/components/tayssa/auth/entrada";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Entrar",
  robots: { index: false, follow: false },
};

/**
 * Abrir o link só mostra o convite; quem entra é o toque em "Entrar". A
 * prévia do WhatsApp (e de outros apps) abre o link sozinha — antes, isso
 * gastava o convite e a cliente chegava num "link expirado".
 */
export default async function EntrarPorLink({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  const { t } = await searchParams;
  let link: LinkDeEntrada | null = null;
  if (t && isDbConfigured()) {
    try {
      link = await lerLinkDeEntrada(t);
    } catch (e) {
      logServerError("auth.magicLink.check", e);
    }
  }
  if (!link) redirect(`${ROUTES.login}?link=expirado`);

  return (
    <Entrada>
      <div className="tyl__body tyl-surge" style={{ "--d": "0.4s" } as CSSProperties}>
        <h1 className="tyl__title">
          Olá, {link.nome}. <em>{link.role === "admin" ? "Seu painel" : "Seu VIP"} está pronto.</em>
        </h1>
        <p className="tyl__sub">Toque para entrar. Este link é só seu.</p>
        <form action={entrarPorLinkAction}>
          <input type="hidden" name="t" value={t} />
          <button type="submit" className="tyl__submit">
            Entrar
          </button>
        </form>
      </div>
    </Entrada>
  );
}
