"use client";

import { useState, type ComponentProps, type ReactNode } from "react";

/**
 * Campo de senha com o olhinho (pedido do Lucas, 05/11/2026): tocar mostra o
 * que ela digitou, tocar de novo esconde. Mesmo desenho do `TyInput`.
 */
export function TySenha({
  label,
  name,
  error,
  hint,
  className,
  id,
  ...rest
}: {
  label: string;
  name: string;
  error?: string | null;
  hint?: ReactNode;
  className?: string;
} & Omit<ComponentProps<"input">, "name" | "className" | "type">) {
  const [ver, setVer] = useState(false);
  const inputId = id ?? `f-${name}`;
  return (
    <div className={["ty-field", error ? "ty-field--error" : "", className ?? ""].join(" ").trim()}>
      <label className="ty-field__label" htmlFor={inputId}>
        {label}
      </label>
      <div className="ty-senha">
        <input
          id={inputId}
          name={name}
          type={ver ? "text" : "password"}
          className="ty-field__input"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${inputId}-err` : hint ? `${inputId}-dica` : undefined}
          {...rest}
        />
        <OlhoDaSenha ver={ver} alternar={() => setVer((v) => !v)} />
      </div>
      {error ? (
        <span id={`${inputId}-err`} className="ty-field__error" role="alert">
          {error}
        </span>
      ) : hint ? (
        <span id={`${inputId}-dica`} className="ty-field__hint">
          {hint}
        </span>
      ) : null}
    </div>
  );
}

/** O botão do olhinho, também usado na folha de agendar. */
export function OlhoDaSenha({ ver, alternar, className }: { ver: boolean; alternar: () => void; className?: string }) {
  return (
    <button
      type="button"
      className={["ty-senha__olho", className].filter(Boolean).join(" ")}
      onClick={alternar}
      aria-label={ver ? "Esconder a senha" : "Mostrar a senha"}
      aria-pressed={ver}
    >
      <svg viewBox="0 0 24 24" aria-hidden>
        <path d="M2.5 12s3.4-6.5 9.5-6.5S21.5 12 21.5 12s-3.4 6.5-9.5 6.5S2.5 12 2.5 12z" />
        <circle cx="12" cy="12" r="2.9" />
        {ver ? null : <path d="M4 20 20 4" />}
      </svg>
    </button>
  );
}
