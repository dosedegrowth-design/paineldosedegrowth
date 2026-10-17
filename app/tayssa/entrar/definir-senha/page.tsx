import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { vipDb, isDbConfigured, logServerError } from "@/lib/tayssa/db";
import { hashToken } from "@/lib/tayssa/auth/session";
import { getSettings } from "@/lib/tayssa/settings";
import { ROUTES } from "@/lib/tayssa/config";
import { whatsappUrl } from "@/lib/tayssa/whatsapp";
import { SetPasswordForm } from "@/components/tayssa/auth/set-password-form";
import { Entrada } from "@/components/tayssa/auth/entrada";
import { TransitionLink } from "@/components/tayssa/ui/transition";

/** Lê o banco a cada pedido: o que a Tayssa muda no painel aparece na hora. */
export const dynamic = "force-dynamic";

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
    <Entrada links={[{ href: ROUTES.login, label: "Entrar" }]}>
      <div className="tyl__body tyl-surge" style={{ "--d": "0.5s" } as CSSProperties}>
        {state.ok ? (
          <>
            <h1 className="tyl__title">
              Olá, {state.name}. <em>Escolha sua senha</em>
            </h1>
            <p className="tyl__sub">{state.purpose === "setup" ? "É o seu primeiro acesso ao VIP." : "Uma senha nova para o seu acesso."}</p>
            <SetPasswordForm token={token!} />
          </>
        ) : (
          <>
            <h1 className="tyl__title">
              Esse link <em>não vale mais</em>
            </h1>
            <p className="tyl__sub">Links de acesso vencem ou só podem ser usados uma vez. Peça um novo para a Tayssa.</p>
            <a href={supportUrl} target="_blank" rel="noopener noreferrer" className="tyl__submit">
              Falar com a Tayssa
            </a>
            <div className="tyl__foot">
              <TransitionLink href={ROUTES.login} className="tyl__link">
                Já tenho senha
              </TransitionLink>
            </div>
          </>
        )}
      </div>
    </Entrada>
  );
}
