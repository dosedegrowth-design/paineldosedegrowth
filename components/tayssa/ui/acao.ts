"use client";

import { useState, type FormEvent } from "react";
import { unstable_isUnrecognizedActionError } from "next/navigation";

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
const ATUALIZADO = "O site acabou de ser atualizado. Recarregue a página e tente de novo.";
const RECARREGOU = "ty-recarregou-versao";

/**
 * A tela aberta é de antes de uma atualização do site (o painel instalado no
 * celular fica dias aberto): a ação dela não existe mais no servidor, que
 * responde 404, e nada foi feito. Recarregar traz a versão nova; depois disso
 * o mesmo toque funciona. Uma vez por minuto no máximo, para nunca virar laço.
 */
export function recarregarSeVersaoVelha(e: unknown): boolean {
  if (!unstable_isUnrecognizedActionError(e)) return false;
  try {
    const antes = Number(sessionStorage.getItem(RECARREGOU) ?? 0);
    if (Date.now() - antes > 60_000) {
      sessionStorage.setItem(RECARREGOU, String(Date.now()));
      window.location.reload();
    }
  } catch {
    // sem sessionStorage (aba anônima antiga): fica só o recado
  }
  return true;
}

const erroDaAcao = (e: unknown): string => (recarregarSeVersaoVelha(e) ? ATUALIZADO : SEM_CONEXAO);

/** Para botões: `rodar(...)` chama a ação; `pendente` enquanto ela não responde. */
export function useAcao<A extends unknown[], R>(acao: (...args: A) => Promise<R>) {
  const [pendente, setPendente] = useState(false);
  const rodar = async (...args: A): Promise<R | { ok: false; error: string }> => {
    setPendente(true);
    try {
      return await acao(...args);
    } catch (e) {
      return { ok: false, error: erroDaAcao(e) };
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
    } catch (e) {
      setEstado({ ok: false, error: erroDaAcao(e) } as unknown as S);
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
      .catch((e: unknown) => {
        // aqui ninguém mostra o erro: só a versão velha da tela importa (recarrega)
        recarregarSeVersaoVelha(e);
      })
      .finally(() => setPendente(false));
  };
  return [pendente, iniciar] as const;
}
