import type { Metadata } from "next";
import "../entrar/entrar.css";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/tayssa/auth/session";
import { getSettings } from "@/lib/tayssa/settings";
import { ROUTES } from "@/lib/tayssa/config";
import { whatsappUrl } from "@/lib/tayssa/whatsapp";
import { SignupExperience } from "@/components/tayssa/auth/signup-experience";

export const metadata: Metadata = {
  title: "Pedir acesso",
  robots: { index: false, follow: false },
};

export default async function SignupPage() {
  const [user, settings] = await Promise.all([getSessionUser(), getSettings()]);
  if (user) redirect(user.role === "admin" ? ROUTES.admin : ROUTES.vip);
  return (
    <SignupExperience
      open={settings.signup.open}
      whatsappUrl={whatsappUrl(settings.business.whatsapp, settings.whatsapp.public_vip_info)}
    />
  );
}
