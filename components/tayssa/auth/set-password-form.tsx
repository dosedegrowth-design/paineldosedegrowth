"use client";

import { useActionState, useEffect } from "react";
import { motion } from "framer-motion";
import { setPasswordAction } from "@/lib/tayssa/actions/auth";
import { MIN_PASSWORD_LENGTH } from "@/lib/tayssa/config";
import type { ActionResult } from "@/lib/tayssa/types";
import { TyInput } from "@/components/tayssa/ui/field";
import { TyButton } from "@/components/tayssa/ui/button";
import { useTransitionNav } from "@/components/tayssa/ui/transition";

type Result = ActionResult<{ redirectTo: string }>;

export function SetPasswordForm({ token }: { token: string }) {
  const { navigate } = useTransitionNav();
  const [state, action, pending] = useActionState<Result | null, FormData>(setPasswordAction, null);
  const err = state && !state.ok ? state : null;

  useEffect(() => {
    if (state?.ok) navigate(state.data.redirectTo);
  }, [state, navigate]);

  return (
    <motion.form
      action={action}
      noValidate
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      style={{ display: "grid", gap: 26, marginTop: 36, maxWidth: 440 }}
    >
      <input type="hidden" name="token" value={token} />
      <TyInput
        label="Nova senha"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        minLength={MIN_PASSWORD_LENGTH}
        error={err?.field === "password" ? err.error : undefined}
        hint={`Pelo menos ${MIN_PASSWORD_LENGTH} caracteres. Só você conhece.`}
      />
      <TyInput
        label="Repetir senha"
        name="confirm"
        type="password"
        autoComplete="new-password"
        required
        error={err?.field === "confirm" ? err.error : undefined}
      />
      {err && !err.field ? (
        <div className="ty-form-error" role="alert">
          {err.error}
        </div>
      ) : null}
      <div>
        <TyButton type="submit" variant="solid" arrow disabled={pending || state?.ok === true}>
          {pending || state?.ok ? "Entrando…" : "Definir senha e entrar"}
        </TyButton>
      </div>
    </motion.form>
  );
}
