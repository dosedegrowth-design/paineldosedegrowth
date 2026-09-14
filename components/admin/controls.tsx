"use client";

import { useState, useTransition, type ReactNode } from "react";
import type { ActionResult, ReferralStatus } from "@/lib/types";
import { REFERRAL_STATUS_LABEL, REFERRAL_STATUS_ORDER } from "@/lib/types";
import { TyButton } from "@/components/ui/button";

type Variant = "line" | "solid" | "accent";

/** Botão que executa uma server action com argumentos fixos. */
export function ActionButton<T>({
  action,
  args,
  children,
  variant = "line",
  confirm,
  onDone,
}: {
  action: (input: T) => Promise<ActionResult>;
  args: T;
  children: ReactNode;
  variant?: Variant;
  confirm?: string;
  onDone?: () => void;
}) {
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const run = () => {
    if (confirm && !window.confirm(confirm)) return;
    setErr(null);
    start(async () => {
      const r = await action(args);
      if (!r.ok) setErr(r.error);
      else onDone?.();
    });
  };
  return (
    <span style={{ display: "inline-grid", gap: 6 }}>
      <TyButton size="xs" variant={variant} onClick={run} disabled={pending}>
        {pending ? "…" : children}
      </TyButton>
      {err ? <span className="ty-field__error">{err}</span> : null}
    </span>
  );
}

/** Botão que abre um campo de observação antes de executar (ex.: recusar). */
export function NoteAction<T extends object>({
  action,
  args,
  children,
  label = "Observação para a cliente (opcional)",
  variant = "line",
  extra,
}: {
  action: (input: T & { note?: string }) => Promise<ActionResult>;
  args: T;
  children: ReactNode;
  label?: string;
  variant?: Variant;
  /** campos extras (name/value) renderizados junto */
  extra?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const run = (form: HTMLFormElement) => {
    setErr(null);
    const fd = new FormData(form);
    const extraValues: Record<string, string> = {};
    fd.forEach((v, k) => {
      if (typeof v === "string" && k !== "note") extraValues[k] = v;
    });
    start(async () => {
      const r = await action({ ...args, ...(extraValues as object), note: note || undefined } as T & { note?: string });
      if (!r.ok) setErr(r.error);
      else {
        setOpen(false);
        setNote("");
      }
    });
  };
  if (!open) {
    return (
      <TyButton size="xs" variant={variant} onClick={() => setOpen(true)}>
        {children}
      </TyButton>
    );
  }
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        run(e.currentTarget);
      }}
      style={{ display: "grid", gap: 10, minWidth: 260, padding: 14, border: "1px solid var(--t-line-strong)", borderRadius: 2 }}
    >
      {extra}
      <label className="ty-field" style={{ gap: 6 }}>
        <span className="ty-field__label">{label}</span>
        <textarea className="ty-field__input" rows={2} value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} style={{ fontSize: 14 }} />
      </label>
      {err ? <span className="ty-field__error">{err}</span> : null}
      <div style={{ display: "flex", gap: 8 }}>
        <TyButton size="xs" variant={variant === "line" ? "solid" : variant} type="submit" disabled={pending}>
          {pending ? "…" : "Confirmar"}
        </TyButton>
        <TyButton size="xs" type="button" onClick={() => setOpen(false)}>
          Cancelar
        </TyButton>
      </div>
    </form>
  );
}

/** Seletor de status de indicação com observação. */
export function ReferralStatusControl({
  id,
  current,
  action,
}: {
  id: string;
  current: ReferralStatus;
  action: (input: { id: string; status: ReferralStatus; note?: string }) => Promise<ActionResult>;
}) {
  const [status, setStatus] = useState<ReferralStatus>(current);
  const [note, setNote] = useState("");
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const changed = status !== current;
  return (
    <div style={{ display: "grid", gap: 8, minWidth: 220 }}>
      <select
        className="ty-field__input"
        value={status}
        onChange={(e) => {
          setStatus(e.target.value as ReferralStatus);
          setOk(false);
        }}
        style={{ fontSize: 13.5, padding: "8px 0" }}
        aria-label="Status da indicação"
      >
        {REFERRAL_STATUS_ORDER.map((s) => (
          <option key={s} value={s}>
            {REFERRAL_STATUS_LABEL[s]}
          </option>
        ))}
      </select>
      {changed ? (
        <>
          {status === "rejected" || status === "approved" ? (
            <input
              className="ty-field__input"
              placeholder={status === "rejected" ? "Motivo (a cliente vê)" : "Observação (opcional)"}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={500}
              style={{ fontSize: 13.5, padding: "8px 0" }}
            />
          ) : null}
          <div style={{ display: "flex", gap: 8 }}>
            <TyButton
              size="xs"
              variant={status === "approved" ? "accent" : "solid"}
              disabled={pending}
              onClick={() =>
                start(async () => {
                  setErr(null);
                  const r = await action({ id, status, note: note || undefined });
                  if (!r.ok) setErr(r.error);
                  else {
                    setOk(true);
                    setNote("");
                  }
                })
              }
            >
              {pending ? "…" : status === "approved" ? "Confirmar indicação" : "Aplicar"}
            </TyButton>
            <TyButton size="xs" onClick={() => setStatus(current)}>
              Cancelar
            </TyButton>
          </div>
        </>
      ) : ok ? (
        <span className="ty-small" style={{ color: "var(--t-ok)" }}>
          Atualizado.
        </span>
      ) : null}
      {err ? <span className="ty-field__error">{err}</span> : null}
    </div>
  );
}

/** Campo somente leitura com botão copiar (link de acesso). */
export function CopyField({ value, label = "Link" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="ty-field">
      <span className="ty-field__label">{label}</span>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <input className="ty-field__input" readOnly value={value} style={{ fontSize: 13 }} onFocus={(e) => e.currentTarget.select()} />
        <TyButton
          size="xs"
          variant="solid"
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(value);
              setCopied(true);
              setTimeout(() => setCopied(false), 1800);
            } catch {}
          }}
        >
          {copied ? "Copiado" : "Copiar"}
        </TyButton>
      </div>
    </div>
  );
}
