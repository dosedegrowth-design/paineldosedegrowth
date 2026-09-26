"use client";

import type { InputHTMLAttributes, Ref } from "react";
import { AlertIcon, CheckIcon } from "./icons";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  ref?: Ref<HTMLInputElement>;
  label: string;
  /** Mensagem de erro; quando presente o campo entra no estado inválido. */
  error?: string | null;
  /** Mostra o check verde quando o valor já é válido. */
  valid?: boolean;
  /** Dispara a animação de "tremida" (só quando um envio falha). */
  shake?: boolean;
  onShakeEnd?: () => void;
};

export function TextField({
  id,
  ref,
  label,
  error,
  valid,
  shake,
  onShakeEnd,
  className,
  ...input
}: TextFieldProps) {
  const errorId = `${id}-erro`;
  const invalid = Boolean(error);
  return (
    <div
      className={`sim-field${className ? ` ${className}` : ""}`}
      data-invalid={invalid || undefined}
      data-valid={(valid && !invalid) || undefined}
    >
      <label htmlFor={id} className="sim-field__label">
        {label}
      </label>
      <div
        className="sim-field__control"
        data-shake={shake || undefined}
        onAnimationEnd={onShakeEnd}
      >
        <input
          ref={ref}
          id={id}
          className="sim-field__input"
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? errorId : undefined}
          {...input}
        />
        {valid && !invalid ? (
          <span className="sim-field__ok">
            <CheckIcon size={16} />
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
