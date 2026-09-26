"use client";

import type { InputHTMLAttributes, Ref } from "react";
import { AlertIcon, CheckIcon } from "./icons";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  ref?: Ref<HTMLInputElement>;
  label: string;
  /** Orientação curta abaixo do rótulo. */
  hint?: string;
  /** Mensagem de erro; quando presente o campo entra no estado inválido. */
  error?: string | null;
  /** Mostra a confirmação verde quando o valor já é válido. */
  valid?: boolean;
};

export function TextField({
  id,
  ref,
  label,
  hint,
  error,
  valid,
  className,
  ...input
}: TextFieldProps) {
  const hintId = `${id}-dica`;
  const errorId = `${id}-erro`;
  const invalid = Boolean(error);
  const describedBy = [hint ? hintId : null, invalid ? errorId : null].filter(Boolean).join(" ") || undefined;
  return (
    <div
      className={`sim-field${className ? ` ${className}` : ""}`}
      data-invalid={invalid || undefined}
      data-valid={(valid && !invalid) || undefined}
    >
      <label htmlFor={id} className="sim-field__label">
        {label}
      </label>
      {hint ? (
        <p id={hintId} className="sim-field__hint">
          {hint}
        </p>
      ) : null}
      <div className="sim-field__control">
        <input
          ref={ref}
          id={id}
          className="sim-field__input"
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          {...input}
        />
        {valid && !invalid ? (
          <span className="sim-field__ok">
            <CheckIcon size={15} strokeWidth={2.5} />
          </span>
        ) : null}
      </div>
      {invalid ? (
        <p id={errorId} className="sim-field__error">
          <AlertIcon size={16} />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}
