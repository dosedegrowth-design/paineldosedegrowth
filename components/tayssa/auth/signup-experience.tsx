"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { signupAction, type SignupResult } from "@/lib/tayssa/actions/signup";
import { ROUTES, MIN_PASSWORD_LENGTH } from "@/lib/tayssa/config";
import type { ActionResult } from "@/lib/tayssa/types";
import { TyInput, TyTextarea } from "@/components/tayssa/ui/field";
import { TySenha } from "@/components/tayssa/ui/senha";
import { TransitionLink } from "@/components/tayssa/ui/transition";
import { WhatsAppIcon } from "@/components/tayssa/ui/whatsapp";
import { MENSAGEM_CADASTRO_FEITO, renderTemplate, whatsappUrl } from "@/lib/tayssa/whatsapp";
import { mascaraTelefone } from "@/lib/tayssa/phone";
import { Entrada } from "@/components/tayssa/auth/entrada";
import { useFormPreservado } from "@/components/tayssa/ui/form-preservado";
import { useAcaoFormulario } from "@/components/tayssa/ui/acao";

type Result = ActionResult<SignupResult>;
type Campo = "name" | "apelido" | "phone" | "password" | "confirm" | "birthday" | "message";
type Errors = Partial<Record<Campo, string>>;

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const STEPS = ["Quem é você", "Sua senha", "Para a Tayssa"] as const;
const STEP_OF: Record<Campo, number> = { name: 0, apelido: 0, phone: 0, password: 1, confirm: 1, birthday: 2, message: 2 };

/**
 * Cadastro VIP (Lucas, 09/11/2026). Três passos curtos, um por tela,
 * validados no aparelho: quem é ela (nome, como quer ser chamada e o
 * WhatsApp, que é o login), a senha duas vezes e, se quiser, o aniversário
 * e um recado. A conta já nasce pronta para marcar horário (12/11/2026:
 * fora o VIP, não há o que aprovar); a tela final manda a cliente avisar a
 * Tayssa no WhatsApp para ela aprovar o VIP.
 */
export function SignupExperience({
  open,
  whatsappTayssa,
  regraVip,
}: {
  open: boolean;
  /** o WhatsApp da Tayssa (settings.business.whatsapp) */
  whatsappTayssa: string;
  /** "4 atendimentos em até 70 dias, com 15 a 20 dias entre um e outro" */
  regraVip: string;
}) {
  const reduced = useReducedMotion();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [local, setLocal] = useState<Errors>({});
  const formRef = useRef<HTMLFormElement>(null);
  const [state, enviar, pending] = useAcaoFormulario<Result | null>(
    signupAction as unknown as (prev: Result | null, fd: FormData) => Promise<Result>,
    null
  );
  const serverError = state && !state.ok ? state : null;
  // recusou? os campos continuam como ela deixou (o React 19 limpava tudo)
  const { onReset } = useFormPreservado();
  const done = state?.ok ? state.data : null;

  // erro do servidor num campo: volta para o passo dele e mostra ali.
  // Ajuste de estado derivado de "prop" (o resultado da action), feito
  // durante o render — o padrão do React para isso, sem efeito.
  const [seen, setSeen] = useState<Result | null>(null);
  if (state !== seen) {
    setSeen(state);
    const f = serverError?.field as Campo | undefined;
    if (f && f in STEP_OF) {
      setLocal({ [f]: serverError!.error });
      setDir(-1);
      setStep(STEP_OF[f]);
    }
  }

  // passo novo: o foco vai para o primeiro campo dele
  const primeiroRender = useRef(true);
  useEffect(() => {
    if (primeiroRender.current) {
      primeiroRender.current = false;
      return;
    }
    formRef.current
      ?.querySelector<HTMLElement>(".tyl__row:not([hidden]) :is(input, textarea, select)")
      ?.focus({ preventScroll: true });
  }, [step]);

  const read = () => new FormData(formRef.current ?? undefined);

  const validate = (s: number): Errors => {
    const fd = read();
    const v = (k: string) => String(fd.get(k) ?? "").trim();
    const e: Errors = {};
    if (s === 0) {
      if (v("name").length < 2) e.name = "Escreva seu nome.";
      if (v("phone").replace(/\D/g, "").length < 10) e.phone = "Seu WhatsApp com DDD.";
    }
    if (s === 1) {
      if (v("password").length < MIN_PASSWORD_LENGTH) e.password = `Use pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`;
      if (v("confirm") !== v("password")) e.confirm = "As senhas não são iguais.";
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
    <Entrada links={[{ href: ROUTES.login, label: "Já tenho conta" }]}>
      <motion.div
        className="tyl__body"
        initial={{ opacity: 0, y: reduced ? 0 : 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
      >
        {children}
      </motion.div>
    </Entrada>
  );

  if (!open) {
    return shell(
      <>
        <h1 className="tyl__title">
          O cadastro está <em>fechado agora</em>
        </h1>
        <div className="tyl__foot">
          <p>A Tayssa abre novas vagas de tempos em tempos. Fale com ela pelo WhatsApp e conte que quer entrar.</p>
          <a href={whatsappUrl(whatsappTayssa, "Oi, Tayssa, tudo bem? Quero fazer o meu cadastro VIP.")} target="_blank" rel="noopener noreferrer" className="tyl__link">
            Falar com a Tayssa
          </a>
        </div>
      </>
    );
  }

  if (done) {
    const avisar = whatsappUrl(whatsappTayssa, renderTemplate(MENSAGEM_CADASTRO_FEITO, { name: done.firstName }));
    return shell(
      <div className="tyl__done">
        <span className="tyl__done-mark" aria-hidden>
          <svg viewBox="0 0 24 24">
            <path d="M5 12.5l4.2 4.2L19 7.5" />
          </svg>
        </span>
        <h1 className="tyl__title">
          Pronto, <em>{done.firstName}.</em>
        </h1>
        <p className="tyl__sub">Sua conta está pronta: entre com o seu WhatsApp e a senha para marcar seus horários. E avise a Tayssa para ela aprovar o seu VIP.</p>
        <a href={avisar} target="_blank" rel="noopener noreferrer" className="tyl__submit">
          <WhatsAppIcon size={20} />
          Avisar a Tayssa no WhatsApp
        </a>
        <div className="tyl__note" style={{ marginTop: 18 }}>
          <strong>Como você vira VIP</strong>
          <span>
            Com {regraVip}. A Tayssa acompanha e confirma o seu VIP.
          </span>
        </div>
        <div className="tyl__foot">
          <TransitionLink href={ROUTES.login} className="tyl__link">
            Entrar na minha conta
          </TransitionLink>
          <TransitionLink href={ROUTES.home} className="tyl__ghost">
            Voltar ao site
          </TransitionLink>
        </div>
      </div>
    );
  }

  return shell(
    <>
      <h1 className="tyl__title">
        Cadastro <em>VIP</em>
      </h1>
      <p className="tyl__sub">
        Crie a sua conta para marcar seus horários. Com {regraVip}, a Tayssa libera o seu VIP.
      </p>
      <div className="tyl__progress" aria-hidden>
        {STEPS.map((s, i) => (
          <i key={s} data-on={i <= step} />
        ))}
      </div>

      <form
        ref={formRef}
        noValidate
        onReset={onReset}
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
            setStep(STEP_OF[Object.keys(errs)[0] as Campo]);
            return;
          }
          enviar(e);
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

        {/* os três passos ficam montados: o cadastro vai inteiro numa submissão só */}
        <div className="tyl__row" hidden={step !== 0}>
          <TyInput label="Seu nome" name="name" autoComplete="name" enterKeyHint="next" error={local.name} />
          <TyInput
            label="Como quer ser chamada? (opcional)"
            name="apelido"
            autoComplete="nickname"
            enterKeyHint="next"
            maxLength={40}
            error={local.apelido}
          />
          <TyInput
            label="Seu WhatsApp"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="(11) 99999-9999"
            enterKeyHint="next"
            error={local.phone}
            hint="É com ele que você entra na sua conta."
            // a máscara vai se formando enquanto ela digita: (11) 98765-4321
            onChange={(e) => {
              e.currentTarget.value = mascaraTelefone(e.currentTarget.value);
            }}
          />
        </div>
        <div className="tyl__row" hidden={step !== 1}>
          <TySenha label="Crie uma senha" name="password" autoComplete="new-password" error={local.password} hint={`Pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`} />
          <TySenha label="Repita a senha" name="confirm" autoComplete="new-password" enterKeyHint="next" error={local.confirm} />
        </div>
        <div className="tyl__row" hidden={step !== 2}>
          <TyInput label="Aniversário (opcional)" name="birthday" type="date" error={local.birthday} hint="Para o seu presente de aniversário, quando for VIP." />
          <TyTextarea
            label="Como conheceu a Tayssa? (opcional)"
            name="message"
            rows={3}
            maxLength={300}
            error={local.message}
            hint="Ajuda ela a te reconhecer na hora de liberar."
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
              "Continuar" termina num botão que virou submit e o cadastro sai
              antes da hora */}
          {step < STEPS.length - 1 ? (
            <button key="next" type="button" className="tyl__submit" onClick={next}>
              Continuar
            </button>
          ) : (
            <button key="submit" type="submit" className="tyl__submit" disabled={pending}>
              {pending ? <span className="tyl__spin" aria-hidden /> : null}
              {pending ? "Criando…" : "Criar minha conta"}
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
        <p>A Tayssa libera cada conta pessoalmente. Depois de criar, é só avisar ela no WhatsApp.</p>
      </div>
    </>
  );
}
