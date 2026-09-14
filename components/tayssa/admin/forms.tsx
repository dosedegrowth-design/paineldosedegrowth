"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
// (useState/useTransition usados no AccessLinkPanel)
import {
  adminCreateClientAction,
  adminIssueAccessLinkAction,
  adminUpdateClientAction,
} from "@/lib/tayssa/actions/clients";
import { adminAddServiceAction } from "@/lib/tayssa/actions/services";
import { adminGrantCustomBenefitAction, adminReleaseBirthdayAction } from "@/lib/tayssa/actions/benefits";
import { formatBrPhone } from "@/lib/tayssa/phone";
import { whatsappUrl } from "@/lib/tayssa/whatsapp";
import { ROUTES } from "@/lib/tayssa/config";
import type { ActionResult, BenefitRow, ClientProfileRow, ServiceRow, UserRow } from "@/lib/tayssa/types";
import { TyCheckbox, TyInput, TySelect, TyTextarea } from "@/components/tayssa/ui/field";
import { TyButton, TyLinkButton } from "@/components/tayssa/ui/button";
import { CopyField } from "@/components/tayssa/admin/controls";

function useResetOnSuccess(ok: boolean | undefined) {
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (ok) ref.current?.reset();
  }, [ok]);
  return ref;
}

/** Mensagem pronta para enviar o link de acesso pelo WhatsApp. */
function inviteMessage(name: string, url: string) {
  return `Oi, ${name}! Seu acesso ao meu espaço VIP está pronto. Entre por aqui e escolha sua senha: ${url}`;
}

type CreatedClient = { id: string; accessUrl: string; phone: string | null; firstName: string };

export function ClientCreateForm() {
  const [state, action, pending] = useActionState<ActionResult<CreatedClient> | null, FormData>(
    adminCreateClientAction,
    null
  );
  const err = state && !state.ok ? state : null;

  if (state?.ok) {
    return (
      <div style={{ display: "grid", gap: 20, maxWidth: 640 }}>
        <div className="ty-form-ok">Cliente criada. Envie o link de primeiro acesso (vale 7 dias).</div>
        <CopyField value={state.data.accessUrl} label="Link de primeiro acesso" />
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {state.data.phone ? (
            <a
              href={whatsappUrl(state.data.phone, inviteMessage(state.data.firstName, state.data.accessUrl))}
              target="_blank"
              rel="noopener noreferrer"
              className="ty-btn ty-btn--sm ty-btn--solid"
            >
              <span>Enviar pelo WhatsApp</span>
              <span className="ty-btn__arrow" aria-hidden />
            </a>
          ) : null}
          <TyLinkButton href={ROUTES.adminClient(state.data.id)} size="sm">
            Abrir perfil
          </TyLinkButton>
          <TyLinkButton href={ROUTES.adminClientNew} size="sm">
            Nova cliente
          </TyLinkButton>
        </div>
      </div>
    );
  }

  return (
    <form action={action} noValidate style={{ display: "grid", gap: 22, maxWidth: 640 }}>
      <div style={{ display: "grid", gap: 22, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <TyInput label="Nome completo" name="name" required error={err?.field === "name" ? err.error : undefined} />
        <TyInput label="Como ela gosta de ser chamada" name="nickname" maxLength={60} />
        <TyInput label="E-mail (login)" name="email" type="email" required error={err?.field === "email" ? err.error : undefined} />
        <TyInput label="WhatsApp" name="phone" inputMode="tel" placeholder="(11) 9 9999-9999" error={err?.field === "phone" ? err.error : undefined} hint="Liga as indicações a ela." />
        <TyInput label="Aniversário" name="birthday" type="date" error={err?.field === "birthday" ? err.error : undefined} />
      </div>
      <TyTextarea label="Notas internas (só você vê)" name="notes" rows={2} maxLength={2000} />
      <TyCheckbox name="vip" label="Já liberar acesso VIP" />
      {err && !err.field ? <div className="ty-form-error" role="alert">{err.error}</div> : null}
      <div>
        <TyButton type="submit" variant="solid" arrow disabled={pending}>
          {pending ? "Criando…" : "Criar cliente e gerar link"}
        </TyButton>
      </div>
    </form>
  );
}

export function ClientEditForm({ user, profile }: { user: UserRow; profile: ClientProfileRow | null }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(adminUpdateClientAction, null);
  const err = state && !state.ok ? state : null;
  return (
    <form action={action} noValidate style={{ display: "grid", gap: 22, maxWidth: 640 }}>
      <input type="hidden" name="id" value={user.id} />
      <div style={{ display: "grid", gap: 22, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <TyInput label="Nome completo" name="name" defaultValue={user.name} required error={err?.field === "name" ? err.error : undefined} />
        <TyInput label="Apelido" name="nickname" defaultValue={user.nickname ?? ""} maxLength={60} />
        <TyInput label="E-mail (login)" name="email" type="email" defaultValue={user.email} required error={err?.field === "email" ? err.error : undefined} />
        <TyInput label="WhatsApp" name="phone" inputMode="tel" defaultValue={formatBrPhone(user.phone)} error={err?.field === "phone" ? err.error : undefined} />
        <TyInput label="Aniversário" name="birthday" type="date" defaultValue={profile?.birthday ?? ""} error={err?.field === "birthday" ? err.error : undefined} />
      </div>
      <TyTextarea label="Notas internas" name="notes" rows={3} defaultValue={profile?.notes ?? ""} maxLength={2000} />
      {err && !err.field ? <div className="ty-form-error" role="alert">{err.error}</div> : null}
      {state?.ok ? <div className="ty-form-ok">Salvo.</div> : null}
      <div>
        <TyButton type="submit" size="sm" variant="solid" disabled={pending}>
          {pending ? "Salvando…" : "Salvar"}
        </TyButton>
      </div>
    </form>
  );
}

export function AccessLinkPanel({ userId, name, phone, hasPassword }: { userId: string; name: string; phone: string | null; hasPassword: boolean }) {
  const [pending, start] = useTransition();
  const [link, setLink] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <p className="ty-small">
        {hasPassword ? "Ela já tem senha. Gere um link novo se precisar redefinir." : "Ela ainda não definiu a senha. Gere e envie o link de primeiro acesso."}
      </p>
      {link ? (
        <>
          <CopyField value={link} label={hasPassword ? "Link para redefinir senha" : "Link de primeiro acesso"} />
          {phone ? (
            <a href={whatsappUrl(phone, inviteMessage(name.split(" ")[0], link))} target="_blank" rel="noopener noreferrer" className="ty-btn ty-btn--xs ty-btn--solid" style={{ justifySelf: "start" }}>
              <span>Enviar pelo WhatsApp</span>
            </a>
          ) : null}
        </>
      ) : null}
      {err ? <span className="ty-field__error">{err}</span> : null}
      <div>
        <TyButton
          size="xs"
          variant={link ? "line" : "solid"}
          disabled={pending}
          onClick={() =>
            start(async () => {
              setErr(null);
              const r = await adminIssueAccessLinkAction({ id: userId });
              if (!r.ok) setErr(r.error);
              else setLink(r.data.url);
            })
          }
        >
          {pending ? "Gerando…" : link ? "Gerar outro" : hasPassword ? "Gerar link de redefinição" : "Gerar link de acesso"}
        </TyButton>
      </div>
    </div>
  );
}

export function AdminServiceEntryForm({ clientId, services, todayISO }: { clientId: string; services: ServiceRow[]; todayISO: string }) {
  const [state, action, pending] = useActionState<ActionResult<{ id: string }> | null, FormData>(adminAddServiceAction, null);
  const err = state && !state.ok ? state : null;
  const ref = useResetOnSuccess(state?.ok);
  return (
    <form ref={ref} action={action} noValidate style={{ display: "grid", gap: 18, maxWidth: 640 }}>
      <input type="hidden" name="client_id" value={clientId} />
      <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
        <TySelect label="Serviço" name="service_id" required defaultValue="" error={err?.field === "service_id" ? err.error : undefined}>
          <option value="" disabled>
            Escolha
          </option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} · {s.point_value} pts
            </option>
          ))}
        </TySelect>
        <TyInput label="Data" name="service_date" type="date" max={todayISO} defaultValue={todayISO} required error={err?.field === "service_date" ? err.error : undefined} />
        <TyInput label="Valor (R$)" name="amount" inputMode="decimal" placeholder="150,00" />
        <TyInput label="Pontos (opcional)" name="points_override" inputMode="numeric" placeholder="padrão do serviço" error={err?.field === "points_override" ? err.error : undefined} />
      </div>
      <TyInput label="Observação" name="notes" maxLength={500} />
      {err && !err.field ? <div className="ty-form-error" role="alert">{err.error}</div> : null}
      {state?.ok ? <div className="ty-form-ok">Atendimento registrado e confirmado.</div> : null}
      <div>
        <TyButton type="submit" size="sm" variant="solid" disabled={pending}>
          {pending ? "Registrando…" : "Registrar atendimento confirmado"}
        </TyButton>
      </div>
    </form>
  );
}

export function ReleaseBirthdayForm({ clientId, defaultDays }: { clientId: string; defaultDays: number }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(adminReleaseBirthdayAction, null);
  const err = state && !state.ok ? state : null;
  if (state?.ok) return <div className="ty-form-ok">Benefício de aniversário liberado. Ela já vê no espaço dela.</div>;
  return (
    <form action={action} noValidate style={{ display: "grid", gap: 18, maxWidth: 560 }}>
      <input type="hidden" name="client_id" value={clientId} />
      <TyInput label="O presente (ela vê este título)" name="title" required placeholder="Ex.: Lip spa de aniversário" error={err?.field === "title" ? err.error : undefined} />
      <TyTextarea label="Descrição (opcional)" name="description" rows={2} maxLength={500} />
      <TyInput label="Validade (dias)" name="validity_days" inputMode="numeric" defaultValue={String(defaultDays)} error={err?.field === "validity_days" ? err.error : undefined} />
      {err && !err.field ? <div className="ty-form-error" role="alert">{err.error}</div> : null}
      <div>
        <TyButton type="submit" size="sm" variant="accent" disabled={pending}>
          {pending ? "Liberando…" : "Liberar benefício de aniversário"}
        </TyButton>
      </div>
    </form>
  );
}

export function GrantCustomBenefitForm({ clientId, benefits, defaultDays }: { clientId: string; benefits: BenefitRow[]; defaultDays: number }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(adminGrantCustomBenefitAction, null);
  const err = state && !state.ok ? state : null;
  const ref = useResetOnSuccess(state?.ok);
  const options = benefits.filter((b) => b.active && b.type !== "birthday");
  return (
    <form ref={ref} action={action} noValidate style={{ display: "grid", gap: 18, maxWidth: 560 }}>
      <input type="hidden" name="client_id" value={clientId} />
      <TySelect label="Tipo" name="benefit_id" required defaultValue="">
        <option value="" disabled>
          Escolha
        </option>
        {options.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </TySelect>
      <TyInput label="Título (ela vê)" name="title" required error={err?.field === "title" ? err.error : undefined} />
      <TyTextarea label="Descrição (opcional)" name="description" rows={2} maxLength={500} />
      <TyInput label="Validade (dias)" name="validity_days" inputMode="numeric" defaultValue={String(defaultDays)} />
      {err && !err.field ? <div className="ty-form-error" role="alert">{err.error}</div> : null}
      {state?.ok ? <div className="ty-form-ok">Benefício concedido.</div> : null}
      <div>
        <TyButton type="submit" size="sm" disabled={pending}>
          {pending ? "Concedendo…" : "Conceder benefício especial"}
        </TyButton>
      </div>
    </form>
  );
}
