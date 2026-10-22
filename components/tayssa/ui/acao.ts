"use client";

import { useState, type FormEvent } from "react";

/**
 * Server actions chamadas FORA de transição do React.
 *
 * Com `useActionState` / `useTransition`, o "pendente" só termina quando a
 * tela inteira termina de se atualizar com a revalidação que a ação pediu
 * (o React amarra a atualização do roteador à ação). No Next 16 essa
 * atualização às vezes não termina: o salvamento já tinha acontecido, mas o
 * botão ficava preso em "Salvando…" — medido em 3 de 20 salvamentos no
 * painel e 6 de 15 no "Meus dados" do VIP. Aqui o pendente acaba quando a
 * ação responde, e a tela se atualiza por trás, sem segurar ninguém.
 */

const SEM_CONEXAO = "Não deu para concluir agora. Confira a internet e tente de novo.";

/** Para botões: `rodar(...)` chama a ação; `pendente` enquanto ela não responde. */
export function useAcao<A extends unknown[], R>(acao: (...args: A) => Promise<R>) {
  const [pendente, setPendente] = useState(false);
  const rodar = async (...args: A): Promise<R | { ok: false; error: string }> => {
    setPendente(true);
    try {
      return await acao(...args);
    } catch {
      return { ok: false, error: SEM_CONEXAO };
    } finally {
      setPendente(false);
    }
  };
  return [rodar, pendente] as const;
}

/**
 * Para formulários, no lugar de `useActionState`: mesma ação `(anterior,
 * FormData)`, mas pelo `onSubmit` (o `<form action>` do React roda dentro
 * de transição e voltaria ao problema).
 */
export function useAcaoFormulario<S extends { ok: boolean } | null>(
  acao: (anterior: S, fd: FormData) => Promise<S>,
  inicial: S
) {
  const [estado, setEstado] = useState<S>(inicial);
  const [pendente, setPendente] = useState(false);
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pendente) return;
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLElement | null;
    const fd = new FormData(e.currentTarget, submitter);
    setPendente(true);
    try {
      setEstado(await acao(estado, fd));
    } catch {
      setEstado({ ok: false, error: SEM_CONEXAO } as unknown as S);
    } finally {
      setPendente(false);
    }
  };
  return [estado, onSubmit, pendente] as const;
}

/**
 * No formato do `useTransition` (`[pendente, iniciar]`), para os botões que
 * já eram escritos assim — mas sem transição: `iniciar(async () => …)` roda
 * a ação e o pendente acaba quando ela termina.
 */
export function useTarefa() {
  const [pendente, setPendente] = useState(false);
  const iniciar = (fn: () => unknown) => {
    setPendente(true);
    Promise.resolve()
      .then(fn)
      .catch(() => undefined)
      .finally(() => setPendente(false));
  };
  return [pendente, iniciar] as const;
}
