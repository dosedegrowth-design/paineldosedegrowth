"use client";

import { useActionState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { submitPublicReferralAction } from "@/lib/actions/referrals";
import { whatsappUrl } from "@/lib/whatsapp";
import { ROUTES } from "@/lib/config";
import { TyInput, TyTextarea } from "@/components/ui/field";
import { TyButton, TyLinkButton } from "@/components/ui/button";
import { MaskedLines } from "@/components/ui/reveal";
import type { ActionResult } from "@/lib/types";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function PublicReferralForm({ whatsapp, referTemplate }: { whatsapp: string; referTemplate: string }) {
  const [state, action, pending] = useActionState<ActionResult<{ id: string }> | null, FormData>(
    submitPublicReferralAction,
    null
  );
  const err = state && !state.ok ? state : null;
  const fieldErr = (f: string) => (err?.field === f ? err.error : undefined);
  const done = state?.ok === true;

  return (
    <div style={{ position: "relative", minHeight: 420 }}>
      <AnimatePresence mode="wait">
        {!done ? (
          <motion.form
            key="form"
            action={action}
            exit={{ opacity: 0, y: -16, transition: { duration: 0.4 } }}
            style={{ display: "grid", gap: 26 }}
            noValidate
          >
            <div style={{ display: "grid", gap: 26, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
              <TyInput label="Seu nome" name="referrer_name" autoComplete="name" required error={fieldErr("referrer_name")} />
              <TyInput
                label="Seu WhatsApp"
                name="referrer_phone"
                inputMode="tel"
                autoComplete="tel"
                placeholder="(11) 9 9999-9999"
                required
                error={fieldErr("referrer_phone")}
                hint="Se você já é cliente, a indicação entra na sua conta automaticamente."
              />
            </div>
            <div className="ty-rule" />
            <div style={{ display: "grid", gap: 26, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
              <TyInput label="Nome de quem você indica" name="referred_name" required error={fieldErr("referred_name")} />
              <TyInput
                label="WhatsApp de quem você indica"
                name="referred_phone"
                inputMode="tel"
                placeholder="(11) 9 9999-9999"
                required
                error={fieldErr("referred_phone")}
              />
            </div>
            <TyTextarea label="Um recado (opcional)" name="note" rows={2} maxLength={500} placeholder="Ex.: ela quer fazer cílios pela primeira vez" />
            {err && !err.field ? <div className="ty-form-error" role="alert">{err.error}</div> : null}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 18, alignItems: "center" }}>
              <TyButton type="submit" variant="solid" arrow disabled={pending}>
                {pending ? "Registrando…" : "Registrar indicação"}
              </TyButton>
              <span className="ty-small" style={{ maxWidth: 320 }}>
                A indicação só vale depois do primeiro atendimento da pessoa indicada e da confirmação da Tayssa.
              </span>
            </div>
          </motion.form>
        ) : (
          <motion.div
            key="done"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <MaskedLines
              as="h2"
              inView={false}
              className="ty-display"
              lineClassName="ty-ref-done"
              lines={["Sua indicação", <em key="e">foi registrada.</em>]}
            />
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7, ease: EASE }}
              style={{ marginTop: 26, display: "grid", gap: 18, maxWidth: 520 }}
            >
              <span className="ty-status ty-status--wait">Aguardando confirmação do atendimento</span>
              <p className="ty-body">
                Quando a pessoa indicada fizer o primeiro atendimento, a Tayssa confirma e o
                benefício é liberado. Se quiser, avise ela agora:
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
                <a
                  href={whatsappUrl(whatsapp, referTemplate)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ty-btn ty-btn--sm ty-btn--solid"
                >
                  <span>Avisar a Tayssa</span>
                  <span className="ty-btn__arrow" aria-hidden />
                </a>
                <TyLinkButton href={ROUTES.home} size="sm">
                  Voltar ao início
                </TyLinkButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`.ty-ref-done { font-size: clamp(30px, 3.5vw, 45px); }`}</style>
    </div>
  );
}
