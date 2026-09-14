"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitServiceAction } from "@/lib/tayssa/actions/services";
import { submitVipReferralAction } from "@/lib/tayssa/actions/referrals";
import { updateProfileAction } from "@/lib/tayssa/actions/profile";
import { changePasswordAction } from "@/lib/tayssa/actions/auth";
import { MIN_PASSWORD_LENGTH } from "@/lib/tayssa/config";
import { formatBrPhone } from "@/lib/tayssa/phone";
import type { ActionResult, ServiceRow } from "@/lib/tayssa/types";
import { TyInput, TySelect, TyTextarea } from "@/components/tayssa/ui/field";
import { TyButton } from "@/components/tayssa/ui/button";

function useResetOnSuccess(ok: boolean | undefined) {
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (ok) ref.current?.reset();
  }, [ok]);
  return ref;
}

/** Cliente registra um atendimento para validação. Nada conta antes da Tayssa confirmar. */
export function SubmitServiceForm({ services, todayISO }: { services: ServiceRow[]; todayISO: string }) {
  const [state, action, pending] = useActionState<ActionResult<{ id: string }> | null, FormData>(
    submitServiceAction,
    null
  );
  const err = state && !state.ok ? state : null;
  const ref = useResetOnSuccess(state?.ok);
  return (
    <form ref={ref} action={action} noValidate style={{ display: "grid", gap: 22 }}>
      <TySelect label="Atendimento" name="service_id" required defaultValue="" error={err?.field === "service_id" ? err.error : undefined}>
        <option value="" disabled>
          Escolha
        </option>
        {services.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </TySelect>
      <div style={{ display: "grid", gap: 22, gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
        <TyInput label="Data" name="service_date" type="date" max={todayISO} required error={err?.field === "service_date" ? err.error : undefined} />
        <TyInput label="Valor (opcional)" name="amount" inputMode="decimal" placeholder="150,00" error={err?.field === "amount" ? err.error : undefined} />
      </div>
      <TyTextarea label="Observação (opcional)" name="notes" rows={2} maxLength={500} />
      {err && !err.field ? <div className="ty-form-error" role="alert">{err.error}</div> : null}
      {state?.ok ? (
        <div className="ty-form-ok" role="status">
          Registrado. Aguardando confirmação da Tayssa.
        </div>
      ) : null}
      <div>
        <TyButton type="submit" size="sm" variant="solid" arrow disabled={pending}>
          {pending ? "Enviando…" : "Enviar para confirmação"}
        </TyButton>
      </div>
    </form>
  );
}

/** Indicação feita de dentro do VIP. */
export function VipReferralForm() {
  const [state, action, pending] = useActionState<ActionResult<{ id: string }> | null, FormData>(
    submitVipReferralAction,
    null
  );
  const err = state && !state.ok ? state : null;
  const ref = useResetOnSuccess(state?.ok);
  return (
    <form ref={ref} action={action} noValidate style={{ display: "grid", gap: 22 }}>
      <TyInput label="Nome de quem você indica" name="referred_name" required error={err?.field === "referred_name" ? err.error : undefined} />
      <TyInput
        label="WhatsApp dela"
        name="referred_phone"
        inputMode="tel"
        placeholder="(11) 9 9999-9999"
        required
        error={err?.field === "referred_phone" ? err.error : undefined}
      />
      <TyTextarea label="Um recado (opcional)" name="note" rows={2} maxLength={500} />
      {err && !err.field ? <div className="ty-form-error" role="alert">{err.error}</div> : null}
      {state?.ok ? (
        <div className="ty-form-ok" role="status">
          Sua indicação foi registrada. Aguardando confirmação do atendimento.
        </div>
      ) : null}
      <div>
        <TyButton type="submit" size="sm" variant="solid" arrow disabled={pending}>
          {pending ? "Registrando…" : "Registrar indicação"}
        </TyButton>
      </div>
    </form>
  );
}

export function ProfileForm({ nickname, phone }: { nickname: string | null; phone: string | null }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(updateProfileAction, null);
  const err = state && !state.ok ? state : null;
  return (
    <form action={action} noValidate style={{ display: "grid", gap: 22 }}>
      <TyInput label="Como você gosta de ser chamada" name="nickname" defaultValue={nickname ?? ""} maxLength={60} hint="Aparece nas boas-vindas." />
      <TyInput
        label="WhatsApp"
        name="phone"
        inputMode="tel"
        defaultValue={formatBrPhone(phone)}
        error={err?.field === "phone" ? err.error : undefined}
        hint="Usado para reconhecer suas indicações."
      />
      {err && !err.field ? <div className="ty-form-error" role="alert">{err.error}</div> : null}
      {state?.ok ? <div className="ty-form-ok" role="status">Pronto. Seus dados foram atualizados.</div> : null}
      <div>
        <TyButton type="submit" size="sm" variant="solid" disabled={pending}>
          {pending ? "Salvando…" : "Salvar"}
        </TyButton>
      </div>
    </form>
  );
}

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(changePasswordAction, null);
  const err = state && !state.ok ? state : null;
  const ref = useResetOnSuccess(state?.ok);
  return (
    <form ref={ref} action={action} noValidate style={{ display: "grid", gap: 22 }}>
      <TyInput label="Senha atual" name="current" type="password" autoComplete="current-password" required error={err?.field === "current" ? err.error : undefined} />
      <TyInput label="Nova senha" name="password" type="password" autoComplete="new-password" required minLength={MIN_PASSWORD_LENGTH} error={err?.field === "password" ? err.error : undefined} />
      <TyInput label="Repetir nova senha" name="confirm" type="password" autoComplete="new-password" required error={err?.field === "confirm" ? err.error : undefined} />
      {err && !err.field ? <div className="ty-form-error" role="alert">{err.error}</div> : null}
      {state?.ok ? <div className="ty-form-ok" role="status">Senha alterada.</div> : null}
      <div>
        <TyButton type="submit" size="sm" disabled={pending}>
          {pending ? "Alterando…" : "Alterar senha"}
        </TyButton>
      </div>
    </form>
  );
}
