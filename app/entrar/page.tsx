import type { Metadata } from "next";
import "./entrar.css";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { getSettings } from "@/lib/settings";
import { ROUTES } from "@/lib/config";
import { whatsappUrl } from "@/lib/whatsapp";
import { getPhotoAvailability } from "@/lib/photos-server";
import { LoginExperience } from "@/components/auth/login-experience";
import { PhotoAvailabilityProvider } from "@/components/ui/photo-availability";

export const metadata: Metadata = {
  title: "Entrar",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const [user, settings, params, photos] = await Promise.all([
    getSessionUser(),
    getSettings(),
    searchParams,
    getPhotoAvailability(),
  ]);
  if (user) redirect(user.role === "admin" ? ROUTES.admin : ROUTES.vip);
  const next = params.next?.startsWith("/") ? params.next : undefined;
  return (
    <PhotoAvailabilityProvider value={photos}>
      <LoginExperience
        vipInfoUrl={whatsappUrl(settings.business.whatsapp, settings.whatsapp.public_vip_info)}
        next={next}
      />
    </PhotoAvailabilityProvider>
  );
}
