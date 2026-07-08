"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, Snowflake, Menu, X } from "lucide-react";
import { ANDRE_CONFIG, waLink, telLink } from "./config";
import { WhatsAppIcon } from "./whatsapp-icon";

/* Navegação institucional multi-páginas — cada item é uma rota real. */

const links = [
  { href: "/andre/empresa", label: "Empresa" },
  { href: "/andre/solucoes", label: "Soluções" },
  { href: "/andre/produtos", label: "Produtos" },
  { href: "/andre/segmentos", label: "Segmentos" },
  { href: "/andre/contato", label: "Contato" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    let last = 0;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 12);
      /* esconde descendo, reaparece subindo — presença só quando importa */
      if (y > 160 && y - last > 6) setHidden(true);
      else if (last - y > 4 || y < 160) setHidden(false);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* fecha o drawer ao navegar */
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <header
        className="andre-topbar sticky top-0 z-40 transition-[background,border-color,transform] duration-500"
        data-scrolled={scrolled}
        style={{
          transform: hidden && !open ? "translateY(-100%)" : "translateY(0)",
        }}
      >
        <div className="max-w-6xl mx-auto px-5 lg:px-8 h-16 flex items-center justify-between gap-6">
          <Link href="/andre" className="flex items-center gap-2.5">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 shadow-md shadow-sky-900/60">
              <Snowflake className="h-4.5 w-4.5 text-white" />
            </span>
            <div className="leading-tight flex items-center gap-2">
              <p className="andre-display text-[15px] uppercase tracking-tight text-white">
                Clima<span className="text-[var(--andre-primary)]">frio</span>
              </p>
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--andre-primary)] animate-pulse" />
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-7">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="font-tech text-[10.5px] uppercase tracking-[0.24em] transition-colors border-b pb-1"
                style={{
                  color: isActive(l.href)
                    ? "var(--andre-primary)"
                    : "var(--andre-muted)",
                  borderColor: isActive(l.href)
                    ? "var(--andre-primary)"
                    : "transparent",
                }}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={telLink()}
              className="hidden md:inline-flex items-center gap-2 text-[13px] font-bold text-slate-300 hover:text-white transition-colors px-3 py-2"
            >
              <Phone className="h-4 w-4 text-sky-400" />
              {ANDRE_CONFIG.phone}
            </a>
            <a
              href={waLink()}
              target="_blank"
              rel="noopener noreferrer"
              data-magnetic
              className="andre-btn-primary inline-flex items-center gap-2 h-10 px-5 rounded-sm text-sm"
            >
              <WhatsAppIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Falar no WhatsApp</span>
              <span className="sm:hidden">WhatsApp</span>
            </a>
            <button
              type="button"
              aria-label={open ? "Fechar menu" : "Abrir menu"}
              aria-expanded={open}
              onClick={() => setOpen(!open)}
              className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl andre-btn-ghost"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Drawer mobile */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0"
            style={{
              background: "rgba(6, 10, 20, 0.94)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
            }}
            onClick={() => setOpen(false)}
          />
          <div className="relative h-full flex flex-col px-6 pt-5 pb-8">
            <div className="flex items-center justify-between mb-8">
              <span className="andre-chip">Menu</span>
              <button
                type="button"
                aria-label="Fechar menu"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl andre-btn-ghost"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              <Link
                href="/andre"
                onClick={() => setOpen(false)}
                className="py-4 text-2xl font-black tracking-tight border-b border-white/[0.08] transition-colors"
                style={{ color: pathname === "/andre" ? "#7dd3fc" : "#f1f5f9" }}
              >
                Home
              </Link>
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="py-4 text-2xl font-black tracking-tight border-b border-white/[0.08] transition-colors"
                  style={{ color: isActive(l.href) ? "#7dd3fc" : "#f1f5f9" }}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto flex flex-col gap-3">
              <a
                href={waLink()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="andre-btn-primary inline-flex items-center justify-center gap-2 h-12 rounded-xl text-[15px]"
              >
                <WhatsAppIcon className="h-5 w-5" />
                Falar com um especialista
              </a>
              <a
                href={telLink()}
                className="andre-btn-ghost inline-flex items-center justify-center gap-2 h-12 rounded-xl text-[15px]"
              >
                <Phone className="h-5 w-5 text-sky-400" />
                {ANDRE_CONFIG.phone}
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
