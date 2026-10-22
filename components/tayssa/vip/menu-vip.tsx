"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ROUTES } from "@/lib/tayssa/config";
import { IconeBarra, type IconeBarraNome } from "@/components/tayssa/ui/icones-barra";

/**
 * A navegação do app mora no topo, num botão de três pontinhos: nada fica
 * preso no rodapé tampando a tela (no iPhone, a barra do Safari já ocupa o
 * pé da página). Tocar abre um cartão de vidro com os destinos; tocar fora,
 * Esc ou escolher um destino fecha.
 */

type Item = { href: string; label: string; icone: IconeBarraNome };

const ITEMS: Item[] = [
  { href: ROUTES.vip, label: "Início", icone: "inicio" },
  { href: ROUTES.vipCard, label: "Meu cartão", icone: "cartao" },
  { href: ROUTES.vipBook, label: "Agendar", icone: "agenda" },
  { href: ROUTES.vipBenefits, label: "Benefícios", icone: "presente" },
  { href: ROUTES.vipJourney, label: "Minha jornada", icone: "jornada" },
  { href: ROUTES.vipProfile, label: "Meu perfil", icone: "perfil" },
];

const EASE: [number, number, number, number] = [0.23, 1, 0.32, 1];

export function MenuVip() {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const [aberto, setAberto] = useState(false);
  const botao = useRef<HTMLButtonElement>(null);
  // o topo tem vidro (backdrop-filter) e máscara: lá dentro o menu ficaria
  // preso e cortado. Ele vai para a raiz do app, que guarda as variáveis.
  const [raiz, setRaiz] = useState<HTMLElement | null>(null);
  // trocou de tela: o menu fecha (ajuste no render, sem efeito)
  const [rota, setRota] = useState(pathname);
  if (rota !== pathname) {
    setRota(pathname);
    setAberto(false);
  }

  useEffect(() => {
    if (!aberto) return;
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAberto(false);
    };
    document.addEventListener("keydown", tecla);
    // quem navega por teclado ou leitor de tela cai dentro do menu ao abrir
    const id = requestAnimationFrame(() => document.querySelector<HTMLElement>("#tyv-menu a")?.focus());
    const gatilho = botao.current;
    return () => {
      document.removeEventListener("keydown", tecla);
      cancelAnimationFrame(id);
      // fechou (Esc, véu ou destino): o foco volta para os três pontinhos
      if (document.activeElement === document.body || document.activeElement?.closest("#tyv-menu")) gatilho?.focus();
    };
  }, [aberto]);

  return (
    <>
      <button
        ref={botao}
        type="button"
        className="tyv-icon-btn tyv-menu__botao"
        aria-label={aberto ? "Fechar o menu" : "Abrir o menu"}
        aria-expanded={aberto}
        aria-controls="tyv-menu"
        data-aberto={aberto || undefined}
        onClick={() => {
          if (!raiz) setRaiz(botao.current?.closest<HTMLElement>(".tyv") ?? document.body);
          setAberto((v) => !v);
        }}
      >
        <svg viewBox="0 0 24 24" aria-hidden>
          <circle cx="5.5" cy="12" r="1.6" />
          <circle cx="12" cy="12" r="1.6" />
          <circle cx="18.5" cy="12" r="1.6" />
        </svg>
      </button>
      {raiz
        ? createPortal(
            <AnimatePresence>
              {aberto ? (
                <>
                  <motion.div
                    key="veu"
                    className="tyv-menu__veu"
                    aria-hidden
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: reduced ? 0 : 0.2 }}
                    onClick={() => setAberto(false)}
                  />
                  <motion.nav
                    key="menu"
                    id="tyv-menu"
                    className="tyv-menu"
                    aria-label="Seu espaço"
                    initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: -4, transition: { duration: 0.14 } }}
                    transition={{ duration: reduced ? 0 : 0.22, ease: EASE }}
                    // aberto, o Tab gira dentro do menu (ele fica no fim da página
                    // no DOM; sem isso o Tab passeava pela tela atrás do véu)
                    onKeyDown={(e) => {
                      if (e.key !== "Tab") return;
                      const itens = Array.from(e.currentTarget.querySelectorAll<HTMLElement>("a"));
                      const i = itens.indexOf(document.activeElement as HTMLElement);
                      if (e.shiftKey && i <= 0) {
                        e.preventDefault();
                        itens[itens.length - 1]?.focus();
                      } else if (!e.shiftKey && i === itens.length - 1) {
                        e.preventDefault();
                        itens[0]?.focus();
                      }
                    }}
                  >
                    {ITEMS.map((item) => {
                      const atual = item.href === ROUTES.vip ? pathname === item.href : pathname.startsWith(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="tyv-menu__item"
                          aria-current={atual ? "page" : undefined}
                          onClick={() => setAberto(false)}
                        >
                          <span className="tyv-menu__ico">
                            <IconeBarra nome={item.icone} cheio={atual} />
                          </span>
                          {item.label}
                        </Link>
                      );
                    })}
                  </motion.nav>
                </>
              ) : null}
            </AnimatePresence>,
            raiz,
          )
        : null}
    </>
  );
}
