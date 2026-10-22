"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent } from "framer-motion";
import { useRolagemY } from "@/components/tayssa/ui/rolagem";
import { LinkAgendar } from "@/components/tayssa/public/agendar";
import { ROUTES } from "@/lib/tayssa/config";
import { TransitionLink } from "@/components/tayssa/ui/transition";
import { scrollToTarget } from "@/components/tayssa/ui/smooth-scroll";
import { Bloom } from "@/components/tayssa/flora/bloom";
import { useCamadaAberta } from "@/components/tayssa/ui/dialogo";
import { Icone, type IconeNome } from "@/components/tayssa/ui/icones";

type Secao = { id: string; label: string };
/** Um destino do menu do celular: rola até uma seção ou abre outra página. */
type Destino = { label: string; icone: IconeNome } & ({ href: string } | { onClick: () => void });

const SECTIONS: Secao[] = [
  { id: "trabalho", label: "Trabalho" },
  { id: "servicos", label: "Serviços" },
  { id: "vip", label: "VIP" },
];

/** O ícone de cada destino no menu do celular; seção nova cai na flor. */
const ICONE_SECAO: Record<string, IconeNome> = {
  trabalho: "olho",
  servicos: "brilho",
  sobre: "pessoa",
  vip: "cartaoVip",
  atendimento: "calendario",
};

const EASE_MENU: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** A flor do menu nasce fechada e abre logo depois que a tela desce. */
function FlorDoMenu() {
  const [aberta, setAberta] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setAberta(true), 180);
    return () => window.clearTimeout(t);
  }, []);
  return (
    <span className="ty-menu__flor" aria-hidden>
      <Bloom kind="flor" seed={5} tom="magenta" open={aberta} />
    </span>
  );
}

/**
 * Nav que some ao descer e volta compacta ao subir. Transparente sobre o
 * hero, translúcida depois. No mobile vira um menu de tela cheia.
 */
export function PublicNav({ scheduleUrl, sections = SECTIONS }: { scheduleUrl: string; sections?: Secao[] }) {
  const scrollY = useRolagemY();
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const [over, setOver] = useState(true);
  const [open, setOpen] = useState(false);
  const menu = useRef<HTMLDivElement>(null);
  const botao = useRef<HTMLButtonElement>(null);
  // aberto: Esc fecha e o Tab fica entre o "Fechar menu" e os itens
  useCamadaAberta(open, menu, { aoEsc: () => setOpen(false), extras: [botao] });

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
        <TransitionLink href={ROUTES.home} aria-label="Tayssa Lash — início" className="ty-nav__marca">
          <span className="ty-nav__flor" aria-hidden>
            <Bloom seed={5} tom="magenta" />
          </span>
          <span className="ty-nav__nome">
            Tayssa <em>Lash</em>
          </span>
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
          <LinkAgendar href={scheduleUrl} className="ty-btn ty-btn--xs ty-btn--solid">
            Agendar
          </LinkAgendar>
        </div>

        {/* menu: dois fios que viram um X */}
        <button
          ref={botao}
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

      {/* menu do celular: cada destino é uma caixa com o seu ícone, o acesso
          ao VIP em duas pílulas e o agendar como o botão principal da casa */}
      <AnimatePresence>
        {open ? (
          <motion.div
            key="menu"
            ref={menu}
            className="ty-night ty-menu"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.62, ease: [0.65, 0, 0.35, 1] }}
          >
            <div className="ty-menu__miolo">
              <FlorDoMenu />
              <ul className="ty-menu__grade">
                {[
                  ...sections.map(
                    (s): Destino => ({ label: s.label, icone: ICONE_SECAO[s.id] ?? "flor", onClick: () => go(s.id) })
                  ),
                  { label: "Indicar", icone: "coracao", href: ROUTES.refer } satisfies Destino,
                ].map((item, i) => {
                  const corpo = (
                    <>
                      <span className="ty-menu__icone">
                        <Icone nome={item.icone} />
                      </span>
                      <span className="ty-menu__rotulo">{item.label}</span>
                    </>
                  );
                  return (
                    <motion.li
                      key={item.label}
                      initial={{ y: 22, opacity: 0, scale: 0.96 }}
                      animate={{ y: 0, opacity: 1, scale: 1 }}
                      transition={{ delay: 0.24 + i * 0.05, duration: 0.6, ease: EASE_MENU }}
                    >
                      {"href" in item ? (
                        <TransitionLink
                          href={item.href}
                          className="ty-menu__caixa ty-ico-gatilho"
                          onClick={() => setOpen(false)}
                        >
                          {corpo}
                        </TransitionLink>
                      ) : (
                        <button type="button" className="ty-menu__caixa ty-ico-gatilho" onClick={item.onClick}>
                          {corpo}
                        </button>
                      )}
                    </motion.li>
                  );
                })}
              </ul>
              <motion.div
                className="ty-menu__conta"
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6, ease: EASE_MENU }}
              >
                <TransitionLink href={ROUTES.signup} className="ty-menu__pilula" onClick={() => setOpen(false)}>
                  Pedir acesso
                </TransitionLink>
                <TransitionLink href={ROUTES.login} className="ty-menu__pilula" onClick={() => setOpen(false)}>
                  Entrar no VIP
                </TransitionLink>
              </motion.div>
              <motion.div
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.58, duration: 0.6, ease: EASE_MENU }}
              >
                <LinkAgendar
                  href={scheduleUrl}
                  className="tyh__btn tyh__btn--claro ty-menu__agendar"
                  aoAbrir={() => setOpen(false)}
                >
                  Agendar horário
                  <span className="tyh__seta" aria-hidden />
                </LinkAgendar>
              </motion.div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
