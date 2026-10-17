"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ROUTES } from "@/lib/tayssa/config";
import { IconeBarra, type IconeBarraNome } from "@/components/tayssa/ui/icones-barra";

/**
 * Navegação do app: cinco destinos, polegar no comando, sempre no lugar.
 * Cápsula de vidro flutuando, no jeito da barra do iPhone: a aba atual
 * ganha o ícone cheio e uma lente de vidro atrás, que desliza de uma aba
 * para a outra. Sem cortina de transição aqui — trocar de aba precisa ser
 * instantâneo.
 */

type Item = { href: string; label: string; icone: IconeBarraNome };

const ITEMS: Item[] = [
  { href: ROUTES.vip, label: "Início", icone: "inicio" },
  { href: ROUTES.vipCard, label: "Cartão", icone: "cartao" },
  { href: ROUTES.vipBook, label: "Agendar", icone: "agenda" },
  { href: ROUTES.vipBenefits, label: "Benefícios", icone: "presente" },
  { href: ROUTES.vipProfile, label: "Perfil", icone: "perfil" },
];

export function BottomNav() {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  return (
    <nav className="tyv-nav" aria-label="Seu espaço">
      <div className="tyv-nav__in">
        {ITEMS.map((item) => {
          const active = item.href === ROUTES.vip ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="tyv-nav__item"
              aria-current={active ? "page" : undefined}
            >
              {active ? (
                <motion.span
                  layoutId="tyv-nav-lente"
                  className="tyv-nav__lente"
                  transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 40, mass: 0.8 }}
                  aria-hidden
                />
              ) : null}
              <IconeBarra nome={item.icone} cheio={active} />
              <span className="tyv-nav__rotulo">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
