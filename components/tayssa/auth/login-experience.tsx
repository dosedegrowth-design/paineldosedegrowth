"use client";

import { useActionState, useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { loginAction } from "@/lib/tayssa/actions/auth";
import { ROUTES } from "@/lib/tayssa/config";
import { PHOTOS } from "@/lib/tayssa/photos";
import type { ActionResult } from "@/lib/tayssa/types";
import { RealPhoto } from "@/components/tayssa/ui/real-photo";
import { MaskedLines, MaskedPhoto } from "@/components/tayssa/ui/reveal";
import { TyInput } from "@/components/tayssa/ui/field";
import { TyButton } from "@/components/tayssa/ui/button";
import { TransitionLink, useTransitionNav } from "@/components/tayssa/ui/transition";
import { useIsMobile } from "@/components/tayssa/ui/use-media";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

type LoginResult = ActionResult<{ redirectTo: string; name: string }>;

/**
 * Transição 9 — a entrada.
 * Dia: foto por máscara + formulário mínimo. Ao autenticar, a luz abaixa
 * (noir sobe do chão), o nome da cliente aparece letra a letra, e a
 * cortina leva para o espaço privado.
 */
export function LoginExperience({ vipInfoUrl, next }: { vipInfoUrl: string; next?: string }) {
  const isMobile = useIsMobile();
  const reduced = useReducedMotion();
  const { navigate } = useTransitionNav();
  const [state, action, pending] = useActionState<LoginResult | null, FormData>(
    loginAction as unknown as (prev: LoginResult | null, fd: FormData) => Promise<LoginResult>,
    null
  );
  const err = state && !state.ok ? state : null;
  // boas-vindas derivam do resultado da action (sem estado duplicado)
  const welcome = state?.ok ? { name: state.data.name, to: state.data.redirectTo } : null;
  const welcomeTo = welcome?.to ?? null;

  useEffect(() => {
    if (!welcomeTo) return;
    const t = setTimeout(() => navigate(welcomeTo), reduced ? 300 : 2600);
    return () => clearTimeout(t);
  }, [welcomeTo, navigate, reduced]);

  return (
    <div style={{ minHeight: "100svh", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "minmax(0, 6fr) minmax(0, 6fr)" }}>
      {/* foto */}
      <div style={{ position: "relative", minHeight: isMobile ? "38svh" : "100svh" }}>
        <MaskedPhoto inView={false} from={isMobile ? "top" : "left"} style={{ position: "absolute", inset: 0 }}>
          <RealPhoto photo={PHOTOS.entrance} ratio="fill" priority sizes="(max-width: 767px) 100vw, 50vw" style={{ height: "100%" }} />
        </MaskedPhoto>
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background: isMobile
              ? "linear-gradient(180deg, rgba(16,13,11,0.35) 0%, rgba(16,13,11,0) 30%, rgba(16,13,11,0) 55%, rgba(244,239,232,1) 100%)"
              : "linear-gradient(180deg, rgba(16,13,11,0.35) 0%, rgba(16,13,11,0) 28%), linear-gradient(90deg, rgba(16,13,11,0) 70%, rgba(244,239,232,0.35) 100%)",
            pointerEvents: "none",
          }}
        />
        <TransitionLink
          href={ROUTES.home}
          className="ty-nav__brand"
          style={{ position: "absolute", top: 24, left: "var(--t-gutter)", color: isMobile ? "#f1eae1" : "#f1eae1", zIndex: 2 }}
        >
          Tayssa
        </TransitionLink>
      </div>

      {/* formulário */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: isMobile ? "8px var(--t-gutter) 56px" : "0 clamp(32px, 7vw, 140px)",
        }}
      >
        <div style={{ width: "100%", maxWidth: 440 }}>
          <motion.span
            className="ty-eyebrow"
            style={{ display: "block", marginBottom: 20 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            Área privada
          </motion.span>
          <MaskedLines
            as="h1"
            inView={false}
            delay={0.35}
            className="ty-display"
            lineClassName="ty-login-title"
            lines={["Entrar no", <em key="e">meu VIP.</em>]}
          />
          <motion.form
            action={action}
            noValidate
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.8, ease: EASE }}
            style={{ display: "grid", gap: 26, marginTop: 40 }}
          >
            {next ? <input type="hidden" name="next" value={next} /> : null}
            <TyInput label="E-mail" name="email" type="email" autoComplete="email" required autoFocus={!isMobile} />
            <TyInput label="Senha" name="password" type="password" autoComplete="current-password" required />
            {err ? (
              <div className="ty-form-error" role="alert">
                {err.error}
              </div>
            ) : null}
            <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
              <TyButton type="submit" variant="solid" arrow disabled={pending} data-cursor="Entrar">
                {pending ? "Entrando…" : "Entrar"}
              </TyButton>
            </div>
          </motion.form>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            style={{ marginTop: 40, display: "grid", gap: 12 }}
          >
            <p className="ty-small">
              Seu acesso é criado pela Tayssa. Recebeu um link? Ele abre a tela de definir senha.
            </p>
            <a href={vipInfoUrl} target="_blank" rel="noopener noreferrer" className="ty-link ty-link--caps">
              Ainda não tenho acesso
            </a>
          </motion.div>
        </div>
      </div>

      {/* boas-vindas: a luz abaixa, o nome aparece */}
      <AnimatePresence>
        {welcome ? (
          <motion.div
            key="welcome"
            className="ty-night"
            initial={{ clipPath: "inset(100% 0 0 0)" }}
            animate={{ clipPath: "inset(0% 0 0 0)" }}
            transition={{ duration: 1.1, ease: [0.65, 0, 0.35, 1] }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 120,
              background: "var(--t-bg)",
              color: "var(--t-fg)",
              display: "flex",
              alignItems: "center",
              padding: "0 var(--t-gutter)",
              willChange: "clip-path",
            }}
          >
            <div>
              <MaskedLines
                as="p"
                inView={false}
                delay={0.9}
                stagger={0.12}
                className="ty-display"
                lineClassName="ty-welcome-title"
                lines={[`Olá, ${welcome.name}.`, <em key="e">Esse espaço é seu.</em>]}
              />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <style>{`
        .ty-login-title { font-size: clamp(40px, 5vw, 76px); }
        .ty-welcome-title { font-size: clamp(38px, 7vw, 120px); }
      `}</style>
    </div>
  );
}
