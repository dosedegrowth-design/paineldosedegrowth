import type { Metadata } from "next";
import { vipDb, isDbConfigured, logServerError } from "@/lib/db";
import { hashToken } from "@/lib/auth/session";
import { getSettings } from "@/lib/settings";
import { ROUTES } from "@/lib/config";
import { TyBrand } from "@/components/ui/brand";
import { whatsappUrl } from "@/lib/whatsapp";
import { SetPasswordForm } from "@/components/auth/set-password-form";
import { MaskedLines, Reveal } from "@/components/ui/reveal";
import { TransitionLink } from "@/components/ui/transition";

export const metadata: Metadata = {
  title: "Definir senha",
  robots: { index: false, follow: false },
};

type TokenState = { ok: true; name: string; purpose: "setup" | "reset" } | { ok: false };

/**
 * A cliente só vê "válido" ou "não vale mais" — mas uma falha de banco não
 * pode se disfarçar de link expirado em silêncio: o erro técnico vai pro log.
 */
async function checkToken(token: string | undefined): Promise<TokenState> {
  if (!token) return { ok: false };
  if (!isDbConfigured()) {
    logServerError("setPassword.check", "Supabase não configurado neste ambiente");
    return { ok: false };
  }
  try {
    const { data, error } = await vipDb()
      .from("password_tokens")
      // `password_tokens` tem duas FKs para `users` (user_id e created_by):
      // sem nomear a constraint, o PostgREST recusa o embed por ambiguidade.
      .select(
        "expires_at, used_at, purpose, user:users!password_tokens_user_id_fkey(name, nickname, status)"
      )
      .eq("token_hash", hashToken(token))
      .maybeSingle();
    if (error) throw new Error(error.message);
    const row = data as unknown as {
      expires_at: string;
      used_at: string | null;
      purpose: "setup" | "reset";
      user: { name: string; nickname: string | null; status: string } | null;
    } | null;
    if (!row || row.used_at || new Date(row.expires_at).getTime() < Date.now()) return { ok: false };
    if (!row.user || row.user.status !== "active") return { ok: false };
    return { ok: true, name: row.user.nickname?.trim() || row.user.name.split(" ")[0], purpose: row.purpose };
  } catch (e) {
    logServerError("setPassword.check", e);
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
        <TyBrand />
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
      <style>{`.ty-setpw-title { font-size: clamp(33px, 4.26vw, 55px); }`}</style>
    </main>
  );
}
