"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { loginAction } from "@/lib/tayssa/actions/auth";
import { ROUTES } from "@/lib/tayssa/config";
import type { ActionResult } from "@/lib/tayssa/types";
import { TyInput } from "@/components/tayssa/ui/field";
import { TySenha } from "@/components/tayssa/ui/senha";
import { TransitionLink } from "@/components/tayssa/ui/transition";
import { Entrada } from "@/components/tayssa/auth/entrada";
import { useFormPreservado } from "@/components/tayssa/ui/form-preservado";
import { useAcaoFormulario } from "@/components/tayssa/ui/acao";

type LoginResult = ActionResult<{ redirectTo: string; name: string }>;

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/**
 * A entrada. Uma tela: o fundo vivo atrás, a marca flutuando, o cartão de
 * vidro ao alcance do polegar. Ao autenticar, a luz abaixa e o nome da cliente aparece antes do espaço
 * privado — a passagem faz parte da experiência.
 */
export function LoginExperience({
  vipInfoUrl,
  next,
  linkExpirado = false,
}: {
  vipInfoUrl: string;
  next?: string;
  /** chegou por um link de acesso vencido, já usado ou inválido */
  linkExpirado?: boolean;
}) {
  const reduced = useReducedMotion();
  const [state, enviar, pending] = useAcaoFormulario<LoginResult | null>(
    loginAction as unknown as (prev: LoginResult | null, fd: FormData) => Promise<LoginResult>,
    null
  );
  const [local, setLocal] = useState<{ login?: string; password?: string }>({});
  const formRef = useRef<HTMLFormElement>(null);
  // senha errada não apaga o e-mail digitado
  const { onReset } = useFormPreservado();

  const serverError = state && !state.ok ? state : null;
  const welcome = state?.ok ? { name: state.data.name, to: state.data.redirectTo } : null;
  const welcomeTo = welcome?.to ?? null;

  // Carga completa, não troca de rota no cliente: o roteador pode guardar a
  // ida ao VIP de antes do login (que o middleware mandou de volta para cá) e
  // a cliente ficaria parada na entrada com a sessão já aberta.
  useEffect(() => {
    if (!welcomeTo) return;
    const t = setTimeout(() => window.location.assign(welcomeTo), reduced ? 250 : 1900);
    return () => clearTimeout(t);
  }, [welcomeTo, reduced]);

  /** validação no cliente: erro imediato, sem ida ao servidor à toa */
  const check = (fd: FormData) => {
    const login = String(fd.get("login") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    const errors: { login?: string; password?: string } = {};
    // WhatsApp ou e-mail: com "@" é e-mail; sem, o número com DDD
    if (!login) errors.login = "Digite seu WhatsApp ou e-mail.";
    else if (login.includes("@") && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(login)) errors.login = "Esse e-mail parece incompleto.";
    else if (!login.includes("@") && login.replace(/\D/g, "").length < 10) errors.login = "Digite o WhatsApp com DDD.";
    if (!password) errors.password = "Digite sua senha.";
    return errors;
  };

  return (
    <Entrada links={[]}>
      <motion.div
        className="tyl__body"
        initial={{ opacity: 0, y: reduced ? 0 : 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
      >
        {/* uma entrada para todas (09/11/2026): quem é VIP cai na Área VIP, as demais nos horários */}
        <h1 className="tyl__title">
          Entrar na <em>sua conta</em>
        </h1>
        <p className="tyl__sub">
          Use o WhatsApp (ou o e-mail) e a senha da sua conta. Quem é VIP entra direto na Área VIP.
        </p>

        {linkExpirado ? (
          <div className="tyl__note" role="status">
            <span className="tyl__eyebrow">Link de acesso</span>
            <p style={{ fontSize: 14.5, lineHeight: 1.5 }}>
              Esse link não vale mais: ele vence ou já foi usado. Entre com o WhatsApp e a senha, ou peça um novo link para a
              Tayssa.
            </p>
            <a href={vipInfoUrl} target="_blank" rel="noopener noreferrer" className="tyl__link">
              Falar com a Tayssa
            </a>
          </div>
        ) : null}

        <form
          ref={formRef}
          noValidate
          onReset={onReset}
          onSubmit={(e) => {
            const fd = new FormData(e.currentTarget);
            const errors = check(fd);
            setLocal(errors);
            if (Object.keys(errors).length) {
              e.preventDefault();
              return;
            }
            enviar(e);
          }}
        >
          {next ? <input type="hidden" name="next" value={next} /> : null}
          <TyInput
            label="WhatsApp ou e-mail"
            name="login"
            type="text"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            enterKeyHint="next"
            required
            error={local.login}
            onBlur={(e) => setLocal((p) => ({ ...p, login: e.target.value.trim() ? undefined : "Digite seu WhatsApp ou e-mail." }))}
          />
          <TySenha
            label="Senha"
            name="password"
            autoComplete="current-password"
            enterKeyHint="go"
            required
            error={local.password}
            onBlur={(e) => setLocal((p) => ({ ...p, password: e.target.value ? undefined : "Digite sua senha." }))}
          />
          {/* "deixar salvo" (Lucas, 05/11/2026): marcado, ela fica conectada neste celular */}
          <input type="hidden" name="lembrar_campo" value="1" />
          <label className="ty-lembrar">
            <input type="checkbox" name="lembrar" value="on" defaultChecked />
            <span>Manter conectada neste celular</span>
          </label>

          <AnimatePresence>
            {serverError && (serverError.code === "pending" || serverError.code === "rejected") ? (
              <motion.div
                className="tyl__note"
                role="status"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
              >
                <span className="tyl__eyebrow">{serverError.code === "pending" ? "Cadastro em análise" : "Acesso não liberado"}</span>
                <p style={{ fontSize: 14.5, lineHeight: 1.5 }}>{serverError.error}</p>
                <a href={vipInfoUrl} target="_blank" rel="noopener noreferrer" className="tyl__link">
                  Falar com a Tayssa
                </a>
              </motion.div>
            ) : serverError ? (
              <motion.div
                className="ty-form-error"
                role="alert"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0, x: reduced ? 0 : [0, -6, 5, -3, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                {serverError.error}
              </motion.div>
            ) : null}
          </AnimatePresence>

          <button type="submit" className="tyl__submit" disabled={pending || Boolean(welcome)}>
            {pending ? <span className="tyl__spin" aria-hidden /> : null}
            {pending ? "Entrando…" : "Entrar"}
          </button>
        </form>

        {/* sem conta: o cadastro VIP (09/11/2026) ou o primeiro agendamento pelo site */}
        <div className="tyl__foot">
          <p>Ainda não tem conta? Faça o seu cadastro VIP, ou crie a conta ao marcar o primeiro horário pelo site.</p>
          <TransitionLink href={ROUTES.signup} className="tyl__link">
            Fazer meu cadastro VIP
          </TransitionLink>
          <TransitionLink href={ROUTES.home} className="tyl__ghost">
            Agendar pelo site
          </TransitionLink>
        </div>
      </motion.div>

      <AnimatePresence>
        {welcome ? (
          <motion.div
            key="welcome"
            className="tyl__welcome"
            initial={{ clipPath: "inset(100% 0 0 0)" }}
            animate={{ clipPath: "inset(0% 0 0 0)" }}
            transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
          >
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.7, ease: EASE }}
            >
              Olá, {welcome.name}.
              <br />
              <em>Esse espaço é seu.</em>
            </motion.p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Entrada>
  );
}
