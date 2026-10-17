"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ROUTES } from "@/lib/tayssa/config";
import { logoutAction } from "@/lib/tayssa/actions/auth";
import { Icone } from "@/components/tayssa/admin/icons";
import { ROTAS_PAINEL } from "@/components/tayssa/admin/sidebar";

/** Atalhos que não são página: ações que ela faz direto. */
const ACOES = [
  { href: ROUTES.adminClientNew, label: "Nova cliente", secao: "Ação" },
  { href: ROUTES.adminPhotos, label: "Adicionar foto", secao: "Ação" },
];

/**
 * O topo: vidro sobre a tela, com a busca de páginas (⌘K) e quem está
 * logada. Nada de métrica aqui — número é assunto da página.
 */
export function AdminTopbar({ nome, onAbrirMenu }: { nome: string; onAbrirMenu?: () => void }) {
  const router = useRouter();
  const reduced = useReducedMotion();
  const [aberto, setAberto] = useState(false);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setAberto((a) => !a);
        setQ("");
        setSel(0);
      }
      if (e.key === "Escape") setAberto(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const itens = useMemo(() => {
    const todos = [...ACOES, ...ROTAS_PAINEL.map((r) => ({ href: r.href, label: r.label, secao: r.secao }))];
    const n = q.trim().toLowerCase();
    if (!n) return todos;
    return todos.filter((i) => `${i.label} ${i.secao}`.toLowerCase().includes(n));
  }, [q]);

  const ir = (href: string) => {
    setAberto(false);
    router.push(href);
  };

  const inicial = nome.trim().charAt(0).toUpperCase() || "T";

  return (
    <>
      <header className="tya-top">
        <button type="button" className="tya-top__menu" aria-label="Abrir menu" onClick={onAbrirMenu}>
          <Icone nome="menu" />
        </button>
        <button
          type="button"
          className="tya-search"
          onClick={() => {
            setAberto(true);
            setQ("");
            setSel(0);
          }}
        >
          <Icone nome="busca" />
          <span>Buscar página ou ação…</span>
          <kbd>⌘K</kbd>
        </button>

        <div className="tya-top__right">
          <a
            href={ROUTES.home}
            className="tya-btn tya-btn--ghost tya-btn--sm"
            title="Ver o site"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icone nome="site" />
            <span className="tya-hide-sm">Ver o site</span>
          </a>
          <form action={logoutAction}>
            <button type="submit" className="tya-btn tya-btn--ghost tya-btn--sm tya-btn--icon" title="Sair">
              <Icone nome="sair" />
            </button>
          </form>
          <div className="tya-who">
            <span className="tya-who__av" aria-hidden>
              {inicial}
            </span>
            <span className="tya-who__t">
              <b>{nome}</b>
              <span>Tayssa Lash</span>
            </span>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {aberto ? (
          <>
            <motion.div
              className="tya-cmd-bg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              onClick={() => setAberto(false)}
            />
            <motion.div
              className="tya-cmd"
              role="dialog"
              aria-modal="true"
              aria-label="Buscar no painel"
              initial={reduced ? false : { opacity: 0, y: -8, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.985 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="tya-cmd__in">
                <Icone nome="busca" />
                <input
                  autoFocus
                  value={q}
                  placeholder="Para onde vamos?"
                  onChange={(e) => {
                    setQ(e.target.value);
                    setSel(0);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setSel((s) => Math.min(itens.length - 1, s + 1));
                    }
                    if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setSel((s) => Math.max(0, s - 1));
                    }
                    if (e.key === "Enter" && itens[sel]) ir(itens[sel].href);
                  }}
                />
              </div>
              <div className="tya-cmd__list">
                {itens.length ? (
                  itens.map((i, k) => (
                    <button
                      key={`${i.href}-${i.label}`}
                      type="button"
                      className="tya-cmd__item"
                      data-on={k === sel}
                      onMouseEnter={() => setSel(k)}
                      onClick={() => ir(i.href)}
                    >
                      <Icone nome="busca" />
                      {i.label}
                      <em>{i.secao}</em>
                    </button>
                  ))
                ) : (
                  <p className="tya-empty" style={{ padding: "18px 12px" }}>
                    Nada com esse nome por aqui.
                  </p>
                )}
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
