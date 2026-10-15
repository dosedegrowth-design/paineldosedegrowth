"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import type { ComponentProps, FormEvent, ReactNode } from "react";
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
import { PASSWORD_TOKEN_DAYS, ROUTES } from "@/lib/tayssa/config";
import type { ActionResult, BenefitRow, ClientProfileRow, ServiceRow, UserRow } from "@/lib/tayssa/types";
import { TransitionLink } from "@/components/tayssa/ui/transition";
import { CopyField } from "@/components/tayssa/admin/controls";
import { useFormPreservado } from "@/components/tayssa/ui/form-preservado";

export { useFormPreservado };

/* ------------------------------------------------------------------
   Peças de formulário no vocabulário do painel (.tya-*). De propósito
   sem os campos do site público: aqui a linha é densa, não editorial.
   ------------------------------------------------------------------ */

type Base = {
  label: string;
  name: string;
  error?: string | null;
  hint?: ReactNode;
};

function Aviso({ id, error, hint }: { id: string; error?: string | null; hint?: ReactNode }) {
  if (error) {
    return (
      <p id={`${id}-err`} className="tya-err">
        {error}
      </p>
    );
  }
  if (hint) {
    return <p className="tya-small" style={{ marginTop: 4, fontSize: 11.5 }}>{hint}</p>;
  }
  return null;
}

export function Campo({
  label,
  name,
  error,
  hint,
  id,
  ...rest
}: Base & Omit<ComponentProps<"input">, "name" | "className">) {
  const fid = id ?? `f-${name}`;
  return (
    <div>
      <label className="tya-label" htmlFor={fid}>
        {label}
      </label>
      <input
        id={fid}
        name={name}
        className="tya-field"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fid}-err` : undefined}
        {...rest}
      />
      <Aviso id={fid} error={error} hint={hint} />
    </div>
  );
}

export function Area({
  label,
  name,
  error,
  hint,
  id,
  ...rest
}: Base & Omit<ComponentProps<"textarea">, "name" | "className">) {
  const fid = id ?? `f-${name}`;
  return (
    <div>
      <label className="tya-label" htmlFor={fid}>
        {label}
      </label>
      <textarea
        id={fid}
        name={name}
        className="tya-field"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fid}-err` : undefined}
        {...rest}
      />
      <Aviso id={fid} error={error} hint={hint} />
    </div>
  );
}

export function Escolha({
  label,
  name,
  error,
  hint,
  id,
  children,
  ...rest
}: Base & Omit<ComponentProps<"select">, "name" | "className">) {
  const fid = id ?? `f-${name}`;
  return (
    <div>
      <label className="tya-label" htmlFor={fid}>
        {label}
      </label>
      <select
        id={fid}
        name={name}
        className="tya-field"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fid}-err` : undefined}
        {...rest}
      >
        {children}
      </select>
      <Aviso id={fid} error={error} hint={hint} />
    </div>
  );
}

export function Marcar({
  label,
  name,
  ...rest
}: { label: ReactNode; name: string } & Omit<ComponentProps<"input">, "name" | "type">) {
  return (
    <label className="tya-check">
      <input type="checkbox" name={name} {...rest} />
      <span>{label}</span>
    </label>
  );
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
  const { onReset } = useFormPreservado();

  if (state?.ok) {
    return (
      <div style={{ display: "grid", gap: 18 }}>
        <div>
          <span className="tya-pill tya-pill--ok">Cliente criada</span>
          <p className="tya-lead" style={{ marginTop: 10 }}>
            Envie o link de primeiro acesso — ele vale {PASSWORD_TOKEN_DAYS} dias e é de uso único.
          </p>
        </div>
        <CopyField value={state.data.accessUrl} label="Link de primeiro acesso" />
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {state.data.phone ? (
            <a
              href={whatsappUrl(state.data.phone, inviteMessage(state.data.firstName, state.data.accessUrl))}
              target="_blank"
              rel="noopener noreferrer"
              className="tya-btn tya-btn--sm tya-btn--primary"
            >
              Enviar pelo WhatsApp
            </a>
          ) : null}
          <TransitionLink href={ROUTES.adminClient(state.data.id)} className="tya-btn tya-btn--sm tya-btn--ghost">
            Abrir a ficha
          </TransitionLink>
          <TransitionLink href={ROUTES.adminClientNew} className="tya-btn tya-btn--sm tya-btn--ghost">
            Nova cliente
          </TransitionLink>
        </div>
      </div>
    );
  }

  return (
    <form action={action} noValidate onReset={onReset} style={{ display: "grid", gap: 16 }}>
      <div className="tya-grid">
        <Campo label="Nome completo" name="name" required error={err?.field === "name" ? err.error : undefined} />
        <Campo label="Apelido" name="nickname" maxLength={60} hint="Como ela gosta de ser chamada." />
        <Campo label="E-mail (login)" name="email" type="email" required error={err?.field === "email" ? err.error : undefined} />
        <Campo label="WhatsApp" name="phone" inputMode="tel" placeholder="(11) 9 9999-9999" error={err?.field === "phone" ? err.error : undefined} hint="Liga as indicações a ela." />
        <Campo label="Aniversário" name="birthday" type="date" error={err?.field === "birthday" ? err.error : undefined} />
      </div>
      <Area label="Notas internas (só você vê)" name="notes" rows={2} maxLength={2000} />
      <Marcar name="vip" label="Já liberar acesso VIP" />
      {err && !err.field ? (
        <p className="tya-err" role="alert">
          {err.error}
        </p>
      ) : null}
      <div>
        <button type="submit" className="tya-btn tya-btn--primary" disabled={pending}>
          {pending ? "Criando…" : "Criar cliente e gerar link"}
        </button>
      </div>
    </form>
  );
}

export function ClientEditForm({ user, profile }: { user: UserRow; profile: ClientProfileRow | null }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(adminUpdateClientAction, null);
  const err = state && !state.ok ? state : null;
  const { onReset } = useFormPreservado();
  return (
    <form action={action} noValidate onReset={onReset} style={{ display: "grid", gap: 16 }}>
      <input type="hidden" name="id" value={user.id} />
      <div className="tya-grid">
        <Campo label="Nome completo" name="name" defaultValue={user.name} required error={err?.field === "name" ? err.error : undefined} />
        <Campo label="Apelido" name="nickname" defaultValue={user.nickname ?? ""} maxLength={60} />
        <Campo label="E-mail (login)" name="email" type="email" defaultValue={user.email} required error={err?.field === "email" ? err.error : undefined} />
        <Campo label="WhatsApp" name="phone" inputMode="tel" defaultValue={formatBrPhone(user.phone)} error={err?.field === "phone" ? err.error : undefined} />
        <Campo label="Aniversário" name="birthday" type="date" defaultValue={profile?.birthday ?? ""} error={err?.field === "birthday" ? err.error : undefined} />
      </div>
      <Area label="Notas internas" name="notes" rows={3} defaultValue={profile?.notes ?? ""} maxLength={2000} />
      {err && !err.field ? (
        <p className="tya-err" role="alert">
          {err.error}
        </p>
      ) : null}
      {state?.ok ? <p className="tya-ok">Salvo.</p> : null}
      <div>
        <button type="submit" className="tya-btn tya-btn--sm tya-btn--primary" disabled={pending}>
          {pending ? "Salvando…" : "Salvar"}
        </button>
      </div>
    </form>
  );
}

export function AccessLinkPanel({ userId, name, phone, hasPassword }: { userId: string; name: string; phone: string | null; hasPassword: boolean }) {
  const [pending, start] = useTransition();
  const [link, setLink] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <p className="tya-small">
        {hasPassword ? "Ela já tem senha. Gere um link novo se precisar redefinir." : "Ela ainda não definiu a senha. Gere e envie o link de primeiro acesso."}
      </p>
      {link ? (
        <>
          <CopyField value={link} label={hasPassword ? "Link para redefinir senha" : "Link de primeiro acesso"} />
          {phone ? (
            <a
              href={whatsappUrl(phone, inviteMessage(name.split(" ")[0], link))}
              target="_blank"
              rel="noopener noreferrer"
              className="tya-btn tya-btn--sm tya-btn--primary"
              style={{ justifySelf: "start" }}
            >
              Enviar pelo WhatsApp
            </a>
          ) : null}
        </>
      ) : null}
      {err ? <p className="tya-err">{err}</p> : null}
      <div>
        <button
          type="button"
          className={`tya-btn tya-btn--sm ${link ? "tya-btn--ghost" : "tya-btn--dark"}`}
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
        </button>
      </div>
    </div>
  );
}

export function AdminServiceEntryForm({ clientId, services, todayISO }: { clientId: string; services: ServiceRow[]; todayISO: string }) {
  const [state, action, pending] = useActionState<ActionResult<{ id: string }> | null, FormData>(adminAddServiceAction, null);
  const err = state && !state.ok ? state : null;
  const { ref, onReset } = useFormPreservado(state);
  return (
    <form ref={ref} action={action} noValidate onReset={onReset} style={{ display: "grid", gap: 14 }}>
      <input type="hidden" name="client_id" value={clientId} />
      <div className="tya-grid">
        <Escolha label="Serviço" name="service_id" required defaultValue="" error={err?.field === "service_id" ? err.error : undefined}>
          <option value="" disabled>
            Escolha
          </option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} · {s.point_value} pts
            </option>
          ))}
        </Escolha>
        <Campo label="Data" name="service_date" type="date" max={todayISO} defaultValue={todayISO} required error={err?.field === "service_date" ? err.error : undefined} />
        <Campo label="Valor (R$)" name="amount" inputMode="decimal" placeholder="150,00" />
        <Campo label="Pontos (opcional)" name="points_override" inputMode="numeric" placeholder="padrão do serviço" error={err?.field === "points_override" ? err.error : undefined} />
      </div>
      <Campo label="Observação" name="notes" maxLength={500} />
      {err && !err.field ? (
        <p className="tya-err" role="alert">
          {err.error}
        </p>
      ) : null}
      {state?.ok ? <p className="tya-ok">Atendimento registrado e confirmado.</p> : null}
      <div>
        <button type="submit" className="tya-btn tya-btn--sm tya-btn--primary" disabled={pending}>
          {pending ? "Registrando…" : "Registrar atendimento confirmado"}
        </button>
      </div>
    </form>
  );
}

export function ReleaseBirthdayForm({ clientId, defaultDays }: { clientId: string; defaultDays: number }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(adminReleaseBirthdayAction, null);
  const err = state && !state.ok ? state : null;
  const { onReset } = useFormPreservado();
  if (state?.ok) return <p className="tya-ok">Benefício de aniversário liberado. Ela já vê no espaço dela.</p>;
  return (
    <form action={action} noValidate onReset={onReset} style={{ display: "grid", gap: 14, maxWidth: 560 }}>
      <input type="hidden" name="client_id" value={clientId} />
      <Campo label="O presente (ela vê este título)" name="title" required placeholder="Ex.: Lip spa de aniversário" error={err?.field === "title" ? err.error : undefined} />
      <Area label="Descrição (opcional)" name="description" rows={2} maxLength={500} />
      <Campo label="Validade (dias)" name="validity_days" inputMode="numeric" defaultValue={String(defaultDays)} error={err?.field === "validity_days" ? err.error : undefined} />
      {err && !err.field ? (
        <p className="tya-err" role="alert">
          {err.error}
        </p>
      ) : null}
      <div>
        <button type="submit" className="tya-btn tya-btn--sm tya-btn--gold" disabled={pending}>
          {pending ? "Liberando…" : "Liberar benefício de aniversário"}
        </button>
      </div>
    </form>
  );
}

export function GrantCustomBenefitForm({ clientId, benefits, defaultDays }: { clientId: string; benefits: BenefitRow[]; defaultDays: number }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(adminGrantCustomBenefitAction, null);
  const err = state && !state.ok ? state : null;
  const { ref, onReset } = useFormPreservado(state);
  const options = benefits.filter((b) => b.active && b.type !== "birthday");
  return (
    <form ref={ref} action={action} noValidate onReset={onReset} style={{ display: "grid", gap: 14, maxWidth: 560 }}>
      <input type="hidden" name="client_id" value={clientId} />
      <Escolha
        label="Tipo"
        name="benefit_id"
        required
        defaultValue=""
        error={err?.field === "benefit_id" ? err.error : undefined}
      >
        <option value="" disabled>
          Escolha
        </option>
        {options.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </Escolha>
      <Campo label="Título (ela vê)" name="title" required error={err?.field === "title" ? err.error : undefined} />
      <Area label="Descrição (opcional)" name="description" rows={2} maxLength={500} />
      <Campo
        label="Validade (dias)"
        name="validity_days"
        inputMode="numeric"
        defaultValue={String(defaultDays)}
        error={err?.field === "validity_days" ? err.error : undefined}
      />
      {err && !err.field ? (
        <p className="tya-err" role="alert">
          {err.error}
        </p>
      ) : null}
      {state?.ok ? <p className="tya-ok">Benefício concedido.</p> : null}
      <div>
        <button type="submit" className="tya-btn tya-btn--sm tya-btn--ghost" disabled={pending}>
          {pending ? "Concedendo…" : "Conceder benefício especial"}
        </button>
      </div>
    </form>
  );
}
