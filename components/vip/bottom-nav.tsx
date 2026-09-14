"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/lib/config";

/**
 * Navegação do app: cinco destinos, polegar no comando, sempre no lugar.
 * Sem cortina de transição aqui — trocar de aba precisa ser instantâneo.
 */

type Item = { href: string; label: string; icon: React.ReactNode };

const HomeIcon = (
  <svg viewBox="0 0 24 24" aria-hidden>
    <path d="M4 10.5 12 4l8 6.5" />
    <path d="M6 10v9h12v-9" />
  </svg>
);

const CardIcon = (
  <svg viewBox="0 0 24 24" aria-hidden>
    <rect x="3" y="6" width="18" height="12" rx="2.5" />
    <circle cx="8" cy="12" r="1.6" />
    <circle cx="12.5" cy="12" r="1.6" />
    <circle cx="17" cy="12" r="1.6" />
  </svg>
);

const BookIcon = (
  <svg viewBox="0 0 24 24" aria-hidden>
    <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
    <path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" />
    <path d="M9.5 14.5l1.8 1.8 3.4-3.6" />
  </svg>
);

const GiftIcon = (
  <svg viewBox="0 0 24 24" aria-hidden>
    <rect x="3.5" y="9.5" width="17" height="10.5" rx="2" />
    <path d="M3.5 13.5h17M12 9.5V20" />
    <path d="M12 9.5S10.8 5 8.6 5a2 2 0 1 0 0 4.5zM12 9.5S13.2 5 15.4 5a2 2 0 1 1 0 4.5z" />
  </svg>
);

const MeIcon = (
  <svg viewBox="0 0 24 24" aria-hidden>
    <circle cx="12" cy="8.5" r="3.6" />
    <path d="M5 20c0-3.6 3.1-5.6 7-5.6s7 2 7 5.6" />
  </svg>
);

const ITEMS: Item[] = [
  { href: ROUTES.vip, label: "Início", icon: HomeIcon },
  { href: ROUTES.vipCard, label: "Cartão", icon: CardIcon },
  { href: ROUTES.vipBook, label: "Agendar", icon: BookIcon },
  { href: ROUTES.vipBenefits, label: "Benefícios", icon: GiftIcon },
  { href: ROUTES.vipProfile, label: "Perfil", icon: MeIcon },
];

export function BottomNav() {
  const pathname = usePathname();
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
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
