"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { ROUTES } from "@/lib/tayssa/config";
import { TyBrand } from "@/components/tayssa/ui/brand";
import { TransitionLink } from "@/components/tayssa/ui/transition";
import { scrollToTarget } from "@/components/tayssa/ui/smooth-scroll";
import { Bloom } from "@/components/tayssa/flora/bloom";

type Secao = { id: string; label: string };

const SECTIONS: Secao[] = [
  { id: "trabalho", label: "Trabalho" },
  { id: "servicos", label: "Serviços" },
  { id: "vip", label: "VIP" },
];

/**
 * Nav que some ao descer e volta compacta ao subir. Transparente sobre o
 * hero, translúcida depois. No mobile vira um menu de tela cheia.
 */
export function PublicNav({ scheduleUrl, sections = SECTIONS }: { scheduleUrl: string; sections?: Secao[] }) {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const [over, setOver] = useState(true);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    const goingDown = y > prev;
    setHidden(goingDown && y > 140 && !open);
    setSolid(y > 80);
    setOver(y < window.innerHeight * 0.75);
  });

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  const go = (id: string) => {
    setOpen(false);
    setTimeout(() => scrollToTarget(`#${id}`), open ? 420 : 0);
  };

  return (
    <>
      <header
        className={`ty-nav ${over && !solid && !open ? "ty-nav--over" : ""}`}
        data-hidden={hidden}
        data-solid={solid && !open}
        data-menu={open}
      >
        <TransitionLink href={ROUTES.home} aria-label="Tayssa Lash — início">
          <TyBrand />
        </TransitionLink>

        {/* a pílula flutuante: só as seções e o indicar */}
        <nav className="ty-nav__pilula" aria-label="Seções">
          {sections.map((s) => (
            <button key={s.id} className="ty-nav__item" onClick={() => go(s.id)}>
              {s.label}
            </button>
          ))}
          <TransitionLink href={ROUTES.refer} className="ty-nav__item">
            Indicar
          </TransitionLink>
        </nav>

        <div className="ty-nav__acoes">
          <TransitionLink href={ROUTES.login} className="ty-btn ty-btn--xs">
            Entrar
          </TransitionLink>
          <a href={scheduleUrl} target="_blank" rel="noopener noreferrer" className="ty-btn ty-btn--xs ty-btn--solid">
            Agendar
          </a>
        </div>

        {/* menu: dois fios que viram um X */}
        <button
          className="ty-nav__menu"
          data-open={open}
          aria-expanded={open}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <i aria-hidden />
          <i aria-hidden />
        </button>
      </header>

      <AnimatePresence>
        {open ? (
          <motion.div
            key="menu"
            className="ty-night"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.62, ease: [0.65, 0, 0.35, 1] }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 55,
              background: "var(--t-bg)",
              color: "var(--t-fg)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              padding: "0 var(--t-gutter) 48px",
              willChange: "clip-path",
            }}
          >
            <span className="ty-menu__flor" aria-hidden>
              <Bloom kind="flor" seed={5} tom="magenta" />
            </span>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 6 }}>
              {[
                ...sections.map((s) => ({ label: s.label, onClick: () => go(s.id) })),
                { label: "Indicar", href: ROUTES.refer },
                { label: "Pedir acesso", href: ROUTES.signup },
                { label: "Entrar no VIP", href: ROUTES.login },
              ].map((item, i) => (
                <motion.li
                  key={item.label}
                  initial={{ y: 28, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.25 + i * 0.06, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                >
                  {"href" in item && item.href ? (
                    <TransitionLink
                      href={item.href}
                      className="ty-display ty-menu__item"
                      onClick={() => setOpen(false)}
                    >
                      {item.label}
                    </TransitionLink>
                  ) : (
                    <button
                      className="ty-display ty-menu__item"
                      onClick={item.onClick}
                    >
                      {item.label}
                    </button>
                  )}
                </motion.li>
              ))}
            </ul>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              style={{ marginTop: 36, display: "flex", gap: 20, alignItems: "center" }}
            >
              <a href={scheduleUrl} target="_blank" rel="noopener noreferrer" className="ty-btn ty-btn--sm ty-btn--solid">
                <span>Agendar</span>
                <span className="ty-btn__arrow" aria-hidden />
              </a>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
