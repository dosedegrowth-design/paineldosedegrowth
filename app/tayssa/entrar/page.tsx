import type { Metadata } from "next";
import "./entrar.css";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/tayssa/auth/session";
import { getSettings } from "@/lib/tayssa/settings";
import { ROUTES } from "@/lib/tayssa/config";
import { MENSAGENS_DA_AGENDA, whatsappUrl } from "@/lib/tayssa/whatsapp";
import { getPhotoAvailability } from "@/lib/tayssa/photos-server";
import { LoginExperience } from "@/components/tayssa/auth/login-experience";
import { PhotoAvailabilityProvider } from "@/components/tayssa/ui/photo-availability";

/** Lê o banco a cada pedido: o que a Tayssa muda no painel aparece na hora. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Entrar",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; link?: string }>;
}) {
  const [user, settings, params, photos] = await Promise.all([
    getSessionUser(),
    getSettings(),
    searchParams,
    getPhotoAvailability(),
  ]);
  const vipAberto = settings.rules.vip_aberto;
  if (user) redirect(user.role === "admin" ? ROUTES.admin : vipAberto ? ROUTES.vip : ROUTES.vipBook);
  const next = params.next?.startsWith("/tayssa/") ? params.next : undefined;
  const linkExpirado = params.link === "expirado";
  // VIP fechado: o "Falar com a Tayssa" não pergunta do VIP
  const mensagem = vipAberto
    ? settings.whatsapp.public_vip_info
    : linkExpirado
      ? MENSAGENS_DA_AGENDA.linkVencido
      : MENSAGENS_DA_AGENDA.falar;
  return (
    <PhotoAvailabilityProvider value={photos}>
      <LoginExperience
        vipInfoUrl={whatsappUrl(settings.business.whatsapp, mensagem)}
        next={next}
        linkExpirado={linkExpirado}
        vipAberto={vipAberto}
      />
    </PhotoAvailabilityProvider>
  );
}
