"use client";

import { useEffect, useRef, type FormEvent } from "react";

/**
 * Formulário que não perde o que foi digitado quando a ação recusa.
 *
 * O React 19 reseta o `<form action>` ao fim da mutação, qualquer que
 * tenha sido o resultado: campos não controlados voltam ao vazio e o
 * estado de erro do `useActionState` não repõe nada. Quem preencheu sete
 * campos e recebeu "já existe uma conta com esse e-mail" perdia os sete.
 *
 * O reset da fase de mutação chega como um evento `reset` cancelável, e é
 * esse que o `onReset` barra. A limpeza de verdade — a que acontece
 * quando deu certo — passa por `pedidoNosso`, então ela continua valendo.
 *
 * Use nos dois lados: `ref` só é necessário quando o formulário deve
 * limpar no sucesso; `onReset` vai em todo `<form action>`.
 */
export function useFormPreservado(limparAo?: { ok: boolean } | null) {
  const ref = useRef<HTMLFormElement>(null);
  const pedidoNosso = useRef(false);

  function onReset(e: FormEvent<HTMLFormElement>) {
    if (!pedidoNosso.current) e.preventDefault();
  }

  useEffect(() => {
    const form = ref.current;
    if (!limparAo?.ok || !form) return;
    pedidoNosso.current = true;
    try {
      form.reset();
    } finally {
      pedidoNosso.current = false;
    }
  }, [limparAo]);

  return { ref, onReset };
}
