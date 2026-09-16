"use client";

import { useEffect, useRef, useState, useActionState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { loginAction } from "@/lib/actions/auth";
import { ROUTES } from "@/lib/config";
import { PHOTOS } from "@/lib/photos";
import type { ActionResult } from "@/lib/types";
import { RealPhoto } from "@/components/ui/real-photo";
import { TyBrand } from "@/components/ui/brand";
import { usePhotoAvailable } from "@/components/ui/photo-availability";
import { TyInput } from "@/components/ui/field";
import { TransitionLink, useTransitionNav } from "@/components/ui/transition";

type LoginResult = ActionResult<{ redirectTo: string; name: string }>;

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/**
 * A entrada. Uma tela: a foto atrás, o formulário ao alcance do polegar.
 * Ao autenticar, a luz abaixa e o nome da cliente aparece antes do espaço
 * privado — a passagem faz parte da experiência.
 */
export function LoginExperience({ vipInfoUrl, next }: { vipInfoUrl: string; next?: string }) {
  const reduced = useReducedMotion();
  // sem a foto real no lugar, a tela se reorganiza em vez de deixar um vazio
  const hasPhoto = usePhotoAvailable(PHOTOS.entrance.src);
  const { navigate } = useTransitionNav();
  const [state, action, pending] = useActionState<LoginResult | null, FormData>(
    loginAction as unknown as (prev: LoginResult | null, fd: FormData) => Promise<LoginResult>,
    null
  );
  const [local, setLocal] = useState<{ email?: string; password?: string }>({});
  const formRef = useRef<HTMLFormElement>(null);

  const serverError = state && !state.ok ? state : null;
  const welcome = state?.ok ? { name: state.data.name, to: state.data.redirectTo } : null;
  const welcomeTo = welcome?.to ?? null;

  useEffect(() => {
    if (!welcomeTo) return;
    const t = setTimeout(() => navigate(welcomeTo), reduced ? 250 : 1900);
    return () => clearTimeout(t);
  }, [welcomeTo, navigate, reduced]);

  /** validação no cliente: erro imediato, sem ida ao servidor à toa */
  const check = (fd: FormData) => {
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    const errors: { email?: string; password?: string } = {};
    if (!email) errors.email = "Digite seu e-mail.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = "Esse e-mail parece incompleto.";
    if (!password) errors.password = "Digite sua senha.";
    return errors;
  };

  return (
    <div className="tyl ty-scope" data-theme="night" data-photo={hasPhoto ? "on" : "off"}>
      <div className="tyl__photo" aria-hidden>
        {hasPhoto ? (
          <RealPhoto photo={PHOTOS.entrance} ratio="fill" priority sizes="100vw" style={{ height: "100%" }} />
        ) : null}
      </div>

      <div className="tyl__top">
        <TransitionLink href={ROUTES.home} className="tyl__brand">
          <TyBrand />
        </TransitionLink>
        <TransitionLink href={ROUTES.home} className="tyl__back">
          Voltar
        </TransitionLink>
      </div>

      <motion.div
        className="tyl__body"
        initial={{ opacity: 0, y: reduced ? 0 : 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
      >
        <span className="tyl__eyebrow">Área privada</span>
        <h1 className="tyl__title">
          Entrar no
          <br />
          <em>meu VIP.</em>
        </h1>

        <form
          ref={formRef}
          action={action}
          noValidate
          onSubmit={(e) => {
            const fd = new FormData(e.currentTarget);
            const errors = check(fd);
            setLocal(errors);
            if (Object.keys(errors).length) e.preventDefault();
          }}
        >
          {next ? <input type="hidden" name="next" value={next} /> : null}
          <TyInput
            label="E-mail"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            enterKeyHint="next"
            required
            error={local.email}
            onBlur={(e) => setLocal((p) => ({ ...p, email: e.target.value.trim() ? undefined : "Digite seu e-mail." }))}
          />
          <TyInput
            label="Senha"
            name="password"
            type="password"
            autoComplete="current-password"
            enterKeyHint="go"
            required
            error={local.password}
            onBlur={(e) => setLocal((p) => ({ ...p, password: e.target.value ? undefined : "Digite sua senha." }))}
          />

          <AnimatePresence>
            {serverError && (serverError.code === "pending" || serverError.code === "rejected") ? (
              <motion.div
                className="tyl__note"
                role="status"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
              >
                <span className="tyl__eyebrow">{serverError.code === "pending" ? "Pedido em análise" : "Acesso não liberado"}</span>
                <p style={{ fontSize: 14.5, lineHeight: 1.5 }}>{serverError.error}</p>
                <a href={vipInfoUrl} target="_blank" rel="noopener noreferrer" className="tyl__link">
                  Falar com a Tayssa
                </a>
              </motion.div>
            ) : serverError ? (
              <motion.div
                className="ty-form-error"
                role="alert"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0, x: reduced ? 0 : [0, -6, 5, -3, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                {serverError.error}
              </motion.div>
            ) : null}
          </AnimatePresence>

          <button type="submit" className="tyl__submit" disabled={pending || Boolean(welcome)}>
            {pending ? <span className="tyl__spin" aria-hidden /> : null}
            {pending ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <div className="tyl__foot">
          <p>Ainda não tem acesso? Peça o seu — a Tayssa revisa e libera pessoalmente.</p>
          <TransitionLink href={ROUTES.signup} className="tyl__link">
            Pedir acesso
          </TransitionLink>
        </div>
      </motion.div>

      <AnimatePresence>
        {welcome ? (
          <motion.div
            key="welcome"
            className="tyl__welcome"
            initial={{ clipPath: "inset(100% 0 0 0)" }}
            animate={{ clipPath: "inset(0% 0 0 0)" }}
            transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
          >
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.7, ease: EASE }}
            >
              Olá, {welcome.name}.
              <br />
              <em>Esse espaço é seu.</em>
            </motion.p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
