"use client";

import { useEffect, useState } from "react";
import { Phone, Snowflake, Menu, X } from "lucide-react";
import { ANDRE_CONFIG, waLink, telLink } from "./config";
import { WhatsAppIcon } from "./whatsapp-icon";

const links = [
  { href: "#servicos", id: "servicos", label: "Serviços" },
  { href: "#como-funciona", id: "como-funciona", label: "Como funciona" },
  { href: "#precos", id: "precos", label: "Preços" },
  { href: "#cobertura", id: "cobertura", label: "Cobertura" },
  { href: "#faq", id: "faq", label: "Dúvidas" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");

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

  useEffect(() => {
    const sections = links
      .map((l) => document.getElementById(l.id))
      .filter(Boolean) as HTMLElement[];
    if (!sections.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.2, 0.5] }
    );
    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

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
          <a href="#top" className="flex items-center gap-2.5">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 shadow-md shadow-sky-900/60">
              <Snowflake className="h-4.5 w-4.5 text-white" />
            </span>
            <div className="leading-tight flex items-center gap-2">
              <p className="andre-display text-[15px] uppercase tracking-tight text-white">
                Clima<span className="text-[var(--andre-primary)]">frio</span>
              </p>
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--andre-primary)] animate-pulse" />
            </div>
          </a>

          <nav className="hidden lg:flex items-center gap-7">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="font-tech text-[10.5px] uppercase tracking-[0.24em] transition-colors border-b pb-1"
                style={{
                  color: active === l.id ? "var(--andre-primary)" : "var(--andre-muted)",
                  borderColor: active === l.id ? "var(--andre-primary)" : "transparent",
                }}
              >
                {l.label}
              </a>
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
              className="inline-flex items-center gap-2 h-10 px-5 rounded-sm text-sm font-bold bg-[var(--andre-fg)] text-[#04121a] hover:bg-[var(--andre-primary)] transition-colors duration-300"
            >
              <WhatsAppIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Falar agora</span>
              <span className="sm:hidden">Falar</span>
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
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="py-4 text-2xl font-black tracking-tight border-b border-white/[0.08] transition-colors"
                  style={{ color: active === l.id ? "#7dd3fc" : "#f1f5f9" }}
                >
                  {l.label}
                </a>
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
                Pedir orçamento grátis
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
