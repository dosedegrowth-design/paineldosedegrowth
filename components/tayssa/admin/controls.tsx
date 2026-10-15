"use client";

import { useId, useState, useTransition, type ReactNode } from "react";
import type { ActionResult, ReferralStatus } from "@/lib/tayssa/types";
import { REFERRAL_STATUS_LABEL, REFERRAL_STATUS_ORDER } from "@/lib/tayssa/types";

/* ------------------------------------------------------------------
   Controles do painel: cada um chama uma server action e mostra o erro
   no lugar, sem tirar a Tayssa da tela.

   Vocabulário do painel (.tya-*). As assinaturas são as de sempre —
   agenda, atendimentos, benefícios, indicações, aniversários, a ficha
   da cliente e as configurações dependem destas quatro peças.
   ------------------------------------------------------------------ */

type Variant = "line" | "solid" | "accent";

/** `line` é o botão neutro; `solid` é a tinta escura; `accent` é a decisão da casa. */
const BOTAO: Record<Variant, string> = {
  line: "tya-btn--ghost",
  solid: "tya-btn--dark",
  accent: "tya-btn--primary",
};

function botao(variant: Variant): string {
  return `tya-btn tya-btn--sm ${BOTAO[variant]}`;
}

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
    <span className="tya-act">
      <button type="button" className={botao(variant)} onClick={run} disabled={pending} aria-busy={pending || undefined}>
        {pending ? "…" : children}
      </button>
      {err ? (
        <span className="tya-err" role="alert">
          {err}
        </span>
      ) : null}
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
  const fid = useId();
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
      <button type="button" className={botao(variant)} onClick={() => setOpen(true)}>
        {children}
      </button>
    );
  }
  return (
    <form
      className="tya-note"
      onSubmit={(e) => {
        e.preventDefault();
        run(e.currentTarget);
      }}
    >
      {extra}
      <div>
        <label className="tya-label" htmlFor={`${fid}-note`}>
          {label}
        </label>
        <textarea
          id={`${fid}-note`}
          className="tya-field"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={500}
        />
      </div>
      {err ? (
        <p className="tya-err" role="alert">
          {err}
        </p>
      ) : null}
      <div className="tya-note__row">
        <button
          type="submit"
          className={botao(variant === "line" ? "solid" : variant)}
          disabled={pending}
          aria-busy={pending || undefined}
        >
          {pending ? "…" : "Confirmar"}
        </button>
        <button type="button" className="tya-btn tya-btn--sm tya-btn--ghost" onClick={() => setOpen(false)}>
          Cancelar
        </button>
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
  const fid = useId();
  const [status, setStatus] = useState<ReferralStatus>(current);
  const [note, setNote] = useState("");
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const changed = status !== current;
  return (
    <div className="tya-pick">
      <select
        id={`${fid}-status`}
        className="tya-field"
        value={status}
        onChange={(e) => {
          setStatus(e.target.value as ReferralStatus);
          setOk(false);
        }}
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
              className="tya-field"
              placeholder={status === "rejected" ? "Motivo (a cliente vê)" : "Observação (opcional)"}
              aria-label={status === "rejected" ? "Motivo da recusa" : "Observação da confirmação"}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={500}
            />
          ) : null}
          <div className="tya-note__row">
            <button
              type="button"
              className={botao(status === "approved" ? "accent" : "solid")}
              disabled={pending}
              aria-busy={pending || undefined}
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
            </button>
            <button type="button" className="tya-btn tya-btn--sm tya-btn--ghost" onClick={() => setStatus(current)}>
              Cancelar
            </button>
          </div>
        </>
      ) : ok ? (
        <p className="tya-ok">Atualizado.</p>
      ) : null}
      {err ? (
        <p className="tya-err" role="alert">
          {err}
        </p>
      ) : null}
    </div>
  );
}

/** Campo somente leitura com botão copiar (link de acesso). */
export function CopyField({ value, label = "Link" }: { value: string; label?: string }) {
  const fid = useId();
  const [copied, setCopied] = useState(false);
  return (
    <div>
      <label className="tya-label" htmlFor={`${fid}-copy`}>
        {label}
      </label>
      <div className="tya-copy">
        <input
          id={`${fid}-copy`}
          className="tya-field"
          readOnly
          value={value}
          onFocus={(e) => e.currentTarget.select()}
        />
        <button
          type="button"
          className="tya-btn tya-btn--sm tya-btn--dark"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(value);
              setCopied(true);
              setTimeout(() => setCopied(false), 1800);
            } catch {}
          }}
        >
          {copied ? "Copiado" : "Copiar"}
        </button>
      </div>
    </div>
  );
}
