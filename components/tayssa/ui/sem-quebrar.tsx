"use client";

import { Component, type ReactNode } from "react";

/**
 * Manda o erro para o log da Vercel. O site quebrou no iPhone de quem
 * tocou no catálogo e aqui não reproduz: o navegador da cliente é o único
 * lugar onde o erro acontece. Só a mensagem e o começo da pilha; nada de
 * dado de ninguém.
 */
export function avisarErro(onde: string, erro: unknown) {
  try {
    const e = erro instanceof Error ? erro : new Error(String(erro));
    const corpo = JSON.stringify({
      onde,
      mensagem: e.message.slice(0, 300),
      pilha: e.stack?.slice(0, 1500),
      pagina: window.location.pathname,
    });
    const url = "/tayssa/api/erro";
    if (!navigator.sendBeacon?.(url, corpo)) void fetch(url, { method: "POST", body: corpo, keepalive: true }).catch(() => {});
  } catch {
    // avisar nunca pode quebrar de novo
  }
}

/**
 * Uma seção que quebra some sozinha, em vez de levar a página inteira
 * junto (a tela de "Application error" no celular). O erro vai para o log.
 */
export class SemQuebrar extends Component<{ onde: string; children: ReactNode }, { quebrou: boolean }> {
  state = { quebrou: false };

  static getDerivedStateFromError() {
    return { quebrou: true };
  }

  componentDidCatch(erro: unknown) {
    avisarErro(this.props.onde, erro);
  }

  render() {
    return this.state.quebrou ? null : this.props.children;
  }
}
