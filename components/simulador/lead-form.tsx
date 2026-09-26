"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { COPY } from "@/lib/simulador/config";
import { CPF_MASK_LENGTH, isValidCpf, nextCpfValue } from "@/lib/simulador/cpf";
import { isValidFullName, normalizeName } from "@/lib/simulador/name";
import { TextField } from "./text-field";
import { ArrowRightIcon } from "./icons";

export type Lead = { nome: string; cpf: string };

/** Estados 1–3 do fluxo: inicial, preenchido (válido) e erro. */
export type FormStatus = "idle" | "filled" | "error";

type Field = keyof Lead;
type Errors = Partial<Record<Field, string>>;
type Flags = Record<Field, boolean>;

const NONE: Flags = { nome: false, cpf: false };

function validate(values: Lead): Errors {
  const errors: Errors = {};
  if (!isValidFullName(values.nome)) errors.nome = COPY.form.name.error;
  if (!isValidCpf(values.cpf)) errors.cpf = COPY.form.cpf.error;
  return errors;
}

export function LeadForm({
  onSubmit,
  onStatusChange,
}: {
  onSubmit: (lead: Lead) => void;
  onStatusChange?: (status: FormStatus) => void;
}) {
  const [values, setValues] = useState<Lead>({ nome: "", cpf: "" });
  const [touched, setTouched] = useState<Flags>(NONE);
  const [submitted, setSubmitted] = useState(false);
  const [liveMessage, setLiveMessage] = useState("");
  const nomeRef = useRef<HTMLInputElement>(null);
  const cpfRef = useRef<HTMLInputElement>(null);

  const errors = validate(values);
  const showError = (field: Field) =>
    (touched[field] || submitted) && Boolean(errors[field]);
  const isValid = (field: Field) => !errors[field];

  const status: FormStatus =
    showError("nome") || showError("cpf")
      ? "error"
      : isValid("nome") && isValid("cpf")
        ? "filled"
        : "idle";

  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  function handleNome(e: ChangeEvent<HTMLInputElement>) {
    const nome = e.target.value;
    setValues((v) => ({ ...v, nome }));
  }

  function handleCpf(e: ChangeEvent<HTMLInputElement>) {
    const inputType = (e.nativeEvent as InputEvent).inputType;
    const cpf = nextCpfValue(values.cpf, e.target.value, inputType);
    setValues((v) => ({ ...v, cpf }));
  }

  const blur = (field: Field) => () =>
    setTouched((t) => (t[field] ? t : { ...t, [field]: true }));

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
    const errs = validate(values);
    if (errs.nome || errs.cpf) {
      setTouched({ nome: true, cpf: true });
      // limpa e reanuncia, mesmo que a mensagem seja igual à anterior
      setLiveMessage("");
      requestAnimationFrame(() => setLiveMessage(COPY.form.invalidSummary));
      (errs.nome ? nomeRef : cpfRef).current?.focus();
      return;
    }
    onSubmit({ nome: normalizeName(values.nome), cpf: values.cpf });
  }

  return (
    <form className="sim-form" noValidate onSubmit={handleSubmit}>
      <p className="sim-form__intro">{COPY.form.intro}</p>

      <TextField
        ref={nomeRef}
        id="sim-nome"
        name="nome"
        label={COPY.form.name.label}
        hint={COPY.form.name.hint}
        placeholder={COPY.form.name.placeholder}
        value={values.nome}
        onChange={handleNome}
        onBlur={blur("nome")}
        error={showError("nome") ? errors.nome : null}
        valid={values.nome.length > 0 && isValid("nome")}
        type="text"
        autoComplete="name"
        autoCapitalize="words"
        spellCheck={false}
        maxLength={80}
        enterKeyHint="next"
      />

      <TextField
        ref={cpfRef}
        id="sim-cpf"
        name="cpf"
        label={COPY.form.cpf.label}
        hint={COPY.form.cpf.hint}
        placeholder={COPY.form.cpf.placeholder}
        value={values.cpf}
        onChange={handleCpf}
        onBlur={blur("cpf")}
        error={showError("cpf") ? errors.cpf : null}
        valid={isValid("cpf")}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        maxLength={CPF_MASK_LENGTH}
        enterKeyHint="done"
      />

      <p className="sim-sr" aria-live="assertive">
        {liveMessage}
      </p>

      <div className="sim-form__submit">
        <button type="submit" className="sim-btn sim-btn--primary sim-btn--xl">
          <span>{COPY.form.submit}</span>
          <ArrowRightIcon size={20} />
        </button>
      </div>
    </form>
  );
}
