"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/lib/tayssa/config";
import { TransitionLink } from "@/components/tayssa/ui/transition";
import { motion, useReducedMotion } from "framer-motion";
import { IconeBarra, type IconeBarraNome } from "@/components/tayssa/ui/icones-barra";
import { AdminSidebar, type Atencao } from "@/components/tayssa/admin/sidebar";
import { AdminTopbar } from "@/components/tayssa/admin/topbar";

/** Os quatro destinos do dia a dia no celular; o resto mora no "Mais". */
const BAIXO: { href: string; label: string; icone: IconeBarraNome; chave?: keyof Atencao; exato?: boolean }[] = [
  { href: ROUTES.admin, label: "Início", icone: "grade", exato: true },
  { href: ROUTES.adminAgenda, label: "Agenda", icone: "agenda", chave: "appointments" },
  { href: ROUTES.adminClients, label: "Clientes", icone: "clientes", chave: "signups" },
  { href: ROUTES.adminBenefits, label: "Benefícios", icone: "presente", chave: "benefits" },
];

/**
 * A moldura do painel, no desenho do painel operacional da iWin: lateral
 * escura com fundo vivo no computador; no celular ela vira gaveta (abre
 * pelo botão do topo ou pelo "Mais") e quem manda é a pílula de atalhos,
 * que flutua no alto da tela enquanto a página corre.
 */
export function AdminFrame({ atencao, nome, children }: { atencao: Atencao; nome: string; children: ReactNode }) {
  const path = usePathname();
  const reduced = useReducedMotion();
  const [aberta, setAberta] = useState(false);

  // trocou de tela: a gaveta fecha
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAberta(false);
  }, [path]);
  // Esc fecha a gaveta
  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAberta(false);
    };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, []);

  const ativo = (href: string, exato?: boolean) => (exato ? path === href : path.startsWith(href));

  return (
    <>
      <AdminSidebar atencao={atencao} aberta={aberta} onFechar={() => setAberta(false)} />
      {aberta ? <button type="button" className="tya-veu" aria-label="Fechar menu" onClick={() => setAberta(false)} /> : null}
      <div className="tya-body">
        <AdminTopbar nome={nome} onAbrirMenu={() => setAberta(true)} />
        <nav className="tya-baixo" aria-label="Atalhos do painel">
          {BAIXO.map((i) => {
            const n = i.chave ? atencao[i.chave] : 0;
            const on = ativo(i.href, i.exato);
            return (
              <TransitionLink key={i.href} href={i.href} className="tya-baixo__item" data-on={on} aria-current={on ? "page" : undefined}>
                {on ? (
                  <motion.span
                    layoutId="tya-baixo-lente"
                    className="tya-baixo__lente"
                    transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 40, mass: 0.8 }}
                    aria-hidden
                  />
                ) : null}
                <span className="tya-baixo__ico">
                  <IconeBarra nome={i.icone} cheio={on} />
                  {n > 0 ? <em aria-label={`${n} esperando`}>{n > 9 ? "9+" : n}</em> : null}
                </span>
                <span className="tya-baixo__rotulo">{i.label}</span>
              </TransitionLink>
            );
          })}
          <button type="button" className="tya-baixo__item" onClick={() => setAberta(true)} aria-expanded={aberta}>
            <span className="tya-baixo__ico">
              <IconeBarra nome="mais" cheio={aberta} />
            </span>
            <span className="tya-baixo__rotulo">Mais</span>
          </button>
        </nav>
        <main className="tya-main">
          <div className="tya-wrap">{children}</div>
        </main>
      </div>
    </>
  );
}
