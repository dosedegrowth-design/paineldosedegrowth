import type { Metadata } from "next";
import "../entrar/entrar.css";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/tayssa/auth/session";
import { getSettings } from "@/lib/tayssa/settings";
import { ROUTES, criteriosVip } from "@/lib/tayssa/config";
import { regraVipLegivel } from "@/lib/tayssa/rules";
import { SignupExperience } from "@/components/tayssa/auth/signup-experience";

/** Lê o banco a cada pedido: o que a Tayssa muda no painel aparece na hora. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cadastro VIP",
  robots: { index: false, follow: false },
};

/**
 * Cadastro VIP (Lucas, 09/11/2026): toda cliente pode se cadastrar. A conta
 * espera a Tayssa liberar no painel; liberada, ela marca os horários e, com
 * a sequência de atendimentos da regra, a Tayssa confirma o VIP.
 */
export default async function SignupPage() {
  const [user, settings] = await Promise.all([getSessionUser(), getSettings()]);
  if (user) redirect(user.role === "admin" ? ROUTES.admin : user.isVip ? ROUTES.vip : ROUTES.vipBook);
  return (
    <SignupExperience
      open={settings.signup.open}
      whatsappTayssa={settings.business.whatsapp}
      regraVip={regraVipLegivel(criteriosVip(settings.rules))}
    />
  );
}
