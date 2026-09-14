import type { Metadata } from "next";
import { vipDb, isDbConfigured } from "@/lib/tayssa/db";
import { hashToken } from "@/lib/tayssa/auth/session";
import { getSettings } from "@/lib/tayssa/settings";
import { ROUTES } from "@/lib/tayssa/config";
import { whatsappUrl } from "@/lib/tayssa/whatsapp";
import { SetPasswordForm } from "@/components/tayssa/auth/set-password-form";
import { MaskedLines, Reveal } from "@/components/tayssa/ui/reveal";
import { TransitionLink } from "@/components/tayssa/ui/transition";

export const metadata: Metadata = {
  title: "Definir senha",
  robots: { index: false, follow: false },
};

type TokenState = { ok: true; name: string; purpose: "setup" | "reset" } | { ok: false };

async function checkToken(token: string | undefined): Promise<TokenState> {
  if (!token || !isDbConfigured()) return { ok: false };
  try {
    const { data } = await vipDb()
      .from("password_tokens")
      .select("expires_at, used_at, purpose, user:users(name, nickname, status)")
      .eq("token_hash", hashToken(token))
      .maybeSingle();
    const row = data as unknown as {
      expires_at: string;
      used_at: string | null;
      purpose: "setup" | "reset";
      user: { name: string; nickname: string | null; status: string } | null;
    } | null;
    if (!row || row.used_at || new Date(row.expires_at).getTime() < Date.now()) return { ok: false };
    if (!row.user || row.user.status !== "active") return { ok: false };
    return { ok: true, name: row.user.nickname?.trim() || row.user.name.split(" ")[0], purpose: row.purpose };
  } catch {
    return { ok: false };
  }
}

export default async function SetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const [{ token }, settings] = await Promise.all([searchParams, getSettings()]);
  const state = await checkToken(token);
  const supportUrl = whatsappUrl(settings.business.whatsapp, settings.whatsapp.public_vip_info);

  return (
    <main
      className="ty-container"
      style={{ minHeight: "100svh", display: "flex", flexDirection: "column", justifyContent: "center", paddingBlock: 96 }}
    >
      <TransitionLink href={ROUTES.home} className="ty-nav__brand" style={{ position: "absolute", top: 24, left: "var(--t-gutter)" }}>
        Tayssa
      </TransitionLink>
      {state.ok ? (
        <>
          <Reveal>
            <span className="ty-eyebrow" style={{ display: "block", marginBottom: 20 }}>
              {state.purpose === "setup" ? "Seu primeiro acesso" : "Nova senha"}
            </span>
          </Reveal>
          <MaskedLines
            as="h1"
            inView={false}
            className="ty-display"
            lineClassName="ty-setpw-title"
            lines={[`Olá, ${state.name}.`, <em key="e">Escolha sua senha.</em>]}
          />
          <SetPasswordForm token={token!} />
        </>
      ) : (
        <>
          <MaskedLines
            as="h1"
            inView={false}
            className="ty-display"
            lineClassName="ty-setpw-title"
            lines={["Esse link", <em key="e">não é mais válido.</em>]}
          />
          <Reveal delay={0.4}>
            <p className="ty-body" style={{ marginTop: 22, maxWidth: 440, fontSize: 16 }}>
              Links de acesso expiram ou só podem ser usados uma vez. Peça um novo para a Tayssa.
            </p>
            <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginTop: 26 }}>
              <a href={supportUrl} target="_blank" rel="noopener noreferrer" className="ty-btn ty-btn--sm ty-btn--solid">
                <span>Falar com Tayssa</span>
                <span className="ty-btn__arrow" aria-hidden />
              </a>
              <TransitionLink href={ROUTES.login} className="ty-btn ty-btn--sm">
                <span>Já tenho senha</span>
              </TransitionLink>
            </div>
          </Reveal>
        </>
      )}
      <style>{`.ty-setpw-title { font-size: clamp(40px, 5.6vw, 88px); }`}</style>
    </main>
  );
}
