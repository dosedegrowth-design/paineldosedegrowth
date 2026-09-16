"use client";

import { useActionState, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { signupAction, type SignupResult } from "@/lib/actions/signup";
import { ROUTES, MIN_PASSWORD_LENGTH } from "@/lib/config";
import type { ActionResult } from "@/lib/types";
import { TyBrand } from "@/components/ui/brand";
import { TyInput, TyTextarea } from "@/components/ui/field";
import { TransitionLink } from "@/components/ui/transition";

type Result = ActionResult<SignupResult>;
type Errors = Partial<Record<"name" | "phone" | "birthday" | "email" | "password" | "confirm" | "message", string>>;

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const STEPS = ["Quem é você", "Sua chave", "Um recado"] as const;
const STEP_OF: Record<keyof Errors, number> = { name: 0, phone: 0, birthday: 0, email: 1, password: 1, confirm: 1, message: 2 };

/**
 * Pedir acesso não é preencher um formulário: é bater numa porta que só
 * a Tayssa abre. Três passos curtos, um por tela, validados no aparelho;
 * o pedido só existe no banco quando ela aperta "Enviar pedido".
 */
export function SignupExperience({ whatsappUrl, open }: { whatsappUrl: string; open: boolean }) {
  const reduced = useReducedMotion();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [local, setLocal] = useState<Errors>({});
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<Result | null, FormData>(
    signupAction as unknown as (prev: Result | null, fd: FormData) => Promise<Result>,
    null
  );
  const serverError = state && !state.ok ? state : null;
  const done = state?.ok ? state.data : null;

  // erro do servidor num campo: volta para o passo dele e mostra ali.
  // Ajuste de estado derivado de "prop" (o resultado da action), feito
  // durante o render — o padrão do React para isso, sem efeito.
  const [seen, setSeen] = useState<Result | null>(null);
  if (state !== seen) {
    setSeen(state);
    const f = serverError?.field as keyof Errors | undefined;
    if (f && f in STEP_OF) {
      setLocal({ [f]: serverError!.error });
      setDir(-1);
      setStep(STEP_OF[f]);
    }
  }

  const read = () => new FormData(formRef.current ?? undefined);

  const validate = (s: number): Errors => {
    const fd = read();
    const v = (k: string) => String(fd.get(k) ?? "").trim();
    const e: Errors = {};
    if (s === 0) {
      if (v("name").length < 2) e.name = "Conte seu nome.";
      if (v("phone").replace(/\D/g, "").length < 10) e.phone = "Seu WhatsApp com DDD.";
    }
    if (s === 1) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v("email"))) e.email = "Esse e-mail parece incompleto.";
      if (v("password").length < MIN_PASSWORD_LENGTH) e.password = `Use pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`;
      if (v("confirm") !== v("password")) e.confirm = "As senhas não conferem.";
    }
    return e;
  };

  const next = () => {
    const e = validate(step);
    setLocal(e);
    if (Object.keys(e).length) return;
    setDir(1);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const back = () => {
    setLocal({});
    setDir(-1);
    setStep((s) => Math.max(s - 1, 0));
  };

  const shell = (children: React.ReactNode) => (
    <div className="tyl ty-scope" data-theme="night" data-photo="off">
      <div className="tyl__photo" aria-hidden />
      <div className="tyl__top">
        <TransitionLink href={ROUTES.home} className="tyl__brand">
          <TyBrand />
        </TransitionLink>
        <TransitionLink href={ROUTES.login} className="tyl__back">
          Já tenho acesso
        </TransitionLink>
      </div>
      <motion.div
        className="tyl__body"
        initial={{ opacity: 0, y: reduced ? 0 : 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
      >
        {children}
      </motion.div>
    </div>
  );

  if (!open) {
    return shell(
      <>
        <span className="tyl__eyebrow">Acesso VIP</span>
        <h1 className="tyl__title">
          O cadastro está
          <br />
          <em>fechado agora.</em>
        </h1>
        <div className="tyl__foot">
          <p>A Tayssa abre novas vagas de tempos em tempos. Fale com ela pelo WhatsApp e conte que quer entrar.</p>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="tyl__link">
            Falar com a Tayssa
          </a>
        </div>
      </>
    );
  }

  if (done) {
    return shell(
      <div className="tyl__done">
        <span className="tyl__done-mark" aria-hidden>
          <svg viewBox="0 0 24 24">
            <path d="M5 12.5l4.2 4.2L19 7.5" />
          </svg>
        </span>
        <span className="tyl__eyebrow">Pedido recebido</span>
        <h1 className="tyl__title">
          Obrigada,
          <br />
          <em>{done.firstName}.</em>
        </h1>
        <div className="tyl__foot">
          <p>
            Seu pedido está com a Tayssa. Ela revisa pessoalmente cada acesso — quando aprovar, você entra com o e-mail{" "}
            <strong style={{ color: "var(--t-fg)", fontWeight: 600 }}>{done.email}</strong> e a senha que escolheu.
          </p>
          <p>Se quiser adiantar, mande um oi para ela.</p>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="tyl__link">
            Falar com a Tayssa
          </a>
          <TransitionLink href={ROUTES.home} className="tyl__ghost" style={{ justifyContent: "flex-start", padding: 0 }}>
            Voltar ao site
          </TransitionLink>
        </div>
      </div>
    );
  }

  return shell(
    <>
      <span className="tyl__eyebrow">Pedir acesso</span>
      <h1 className="tyl__title">
        Entrar para
        <br />
        <em>o Tayssa Lash.</em>
      </h1>
      <div className="tyl__progress" aria-hidden>
        {STEPS.map((s, i) => (
          <i key={s} data-on={i <= step} />
        ))}
      </div>

      <form
        ref={formRef}
        action={action}
        noValidate
        onSubmit={(e) => {
          // enter no último passo envia; nos outros, avança
          if (step < STEPS.length - 1) {
            e.preventDefault();
            next();
            return;
          }
          const errs = { ...validate(0), ...validate(1) };
          if (Object.keys(errs).length) {
            e.preventDefault();
            setLocal(errs);
            setDir(-1);
            setStep(STEP_OF[Object.keys(errs)[0] as keyof Errors]);
          }
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={{ opacity: 0, x: reduced ? 0 : 22 * dir }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: reduced ? 0 : -22 * dir }}
            transition={{ duration: 0.32, ease: EASE }}
          >
            <p className="tyl__step-label">
              {step + 1} / {STEPS.length} · {STEPS[step]}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* os três passos ficam montados: o pedido vai inteiro numa submissão só */}
        <div className="tyl__row" hidden={step !== 0}>
          <TyInput label="Seu nome" name="name" autoComplete="name" enterKeyHint="next" error={local.name} />
          <TyInput
            label="Seu WhatsApp"
            name="phone"
            inputMode="tel"
            autoComplete="tel"
            placeholder="(11) 9 9999-9999"
            enterKeyHint="next"
            error={local.phone}
          />
          <TyInput label="Aniversário (opcional)" name="birthday" type="date" error={local.birthday} hint="Para a sua semana especial, quando for VIP." />
        </div>
        <div className="tyl__row" hidden={step !== 1}>
          <TyInput
            label="E-mail"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            enterKeyHint="next"
            error={local.email}
          />
          <TyInput label="Senha" name="password" type="password" autoComplete="new-password" error={local.password} hint={`Pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`} />
          <TyInput label="Repetir a senha" name="confirm" type="password" autoComplete="new-password" enterKeyHint="next" error={local.confirm} />
        </div>
        <div className="tyl__row" hidden={step !== 2}>
          <TyTextarea
            label="Como conheceu a Tayssa? (opcional)"
            name="message"
            rows={3}
            maxLength={300}
            error={local.message}
            hint="Ajuda ela a te reconhecer na hora de aprovar."
          />
        </div>

        <AnimatePresence>
          {serverError && !serverError.field ? (
            <motion.div
              className="ty-form-error"
              role="alert"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ marginTop: 18 }}
            >
              {serverError.error}
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div style={{ display: "grid", gap: 10, marginTop: 24 }}>
          {/* keys diferentes: sem isso o React reaproveita o nó, o clique em
              "Continuar" termina num botão que virou submit e o pedido sai
              antes da hora */}
          {step < STEPS.length - 1 ? (
            <button key="next" type="button" className="tyl__submit" onClick={next}>
              Continuar
            </button>
          ) : (
            <button key="submit" type="submit" className="tyl__submit" disabled={pending}>
              {pending ? <span className="tyl__spin" aria-hidden /> : null}
              {pending ? "Enviando…" : "Enviar pedido"}
            </button>
          )}
          {step > 0 ? (
            <button type="button" className="tyl__ghost" onClick={back}>
              Voltar
            </button>
          ) : null}
        </div>
      </form>

      <div className="tyl__foot">
        <p>O acesso é liberado pela Tayssa, uma a uma. Nada abre sem a aprovação dela.</p>
      </div>
    </>
  );
}
