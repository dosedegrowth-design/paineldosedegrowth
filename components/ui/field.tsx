import type { ComponentProps, ReactNode } from "react";

type Base = {
  label: string;
  name: string;
  error?: string | null;
  hint?: ReactNode;
  className?: string;
};

export function TyInput({
  label,
  name,
  error,
  hint,
  className,
  id,
  ...rest
}: Base & Omit<ComponentProps<"input">, "name" | "className">) {
  const inputId = id ?? `f-${name}`;
  return (
    <div className={["ty-field", error ? "ty-field--error" : "", className ?? ""].join(" ").trim()}>
      <label className="ty-field__label" htmlFor={inputId}>
        {label}
      </label>
      <input
        id={inputId}
        name={name}
        className="ty-field__input"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${inputId}-err` : undefined}
        {...rest}
      />
      {error ? (
        <span id={`${inputId}-err`} className="ty-field__error">
          {error}
        </span>
      ) : hint ? (
        <span className="ty-field__hint">{hint}</span>
      ) : null}
    </div>
  );
}

export function TyTextarea({
  label,
  name,
  error,
  hint,
  className,
  id,
  ...rest
}: Base & Omit<ComponentProps<"textarea">, "name" | "className">) {
  const inputId = id ?? `f-${name}`;
  return (
    <div className={["ty-field", error ? "ty-field--error" : "", className ?? ""].join(" ").trim()}>
      <label className="ty-field__label" htmlFor={inputId}>
        {label}
      </label>
      <textarea
        id={inputId}
        name={name}
        className="ty-field__input"
        aria-invalid={error ? true : undefined}
        {...rest}
      />
      {error ? (
        <span className="ty-field__error">{error}</span>
      ) : hint ? (
        <span className="ty-field__hint">{hint}</span>
      ) : null}
    </div>
  );
}

export function TySelect({
  label,
  name,
  error,
  hint,
  className,
  id,
  children,
  ...rest
}: Base & Omit<ComponentProps<"select">, "name" | "className">) {
  const inputId = id ?? `f-${name}`;
  return (
    <div className={["ty-field", error ? "ty-field--error" : "", className ?? ""].join(" ").trim()}>
      <label className="ty-field__label" htmlFor={inputId}>
        {label}
      </label>
      <select id={inputId} name={name} className="ty-field__input" {...rest}>
        {children}
      </select>
      {error ? (
        <span className="ty-field__error">{error}</span>
      ) : hint ? (
        <span className="ty-field__hint">{hint}</span>
      ) : null}
    </div>
  );
}

export function TyCheckbox({
  label,
  name,
  ...rest
}: { label: ReactNode; name: string } & Omit<ComponentProps<"input">, "name" | "type">) {
  return (
    <label className="ty-check">
      <input type="checkbox" name={name} {...rest} />
      <span>{label}</span>
    </label>
  );
}
