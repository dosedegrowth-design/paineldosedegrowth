"use client";

import { useEffect, useState } from "react";
import { Phone, Snowflake, Menu, X } from "lucide-react";
import { ANDRE_CONFIG, waLink, telLink } from "./config";
import { WhatsAppIcon } from "./whatsapp-icon";

const links = [
  { href: "#servicos", id: "servicos", label: "Serviços" },
  { href: "#como-funciona", id: "como-funciona", label: "Como funciona" },
  { href: "#equipamentos", id: "equipamentos", label: "Equipamentos" },
  { href: "#cobertura", id: "cobertura", label: "Cobertura" },
  { href: "#faq", id: "faq", label: "Dúvidas" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* scrollspy: destaca a seção visível */
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

  /* trava o scroll com o menu aberto */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className="andre-topbar sticky top-0 z-40 transition-colors duration-300"
        data-scrolled={scrolled}
      >
        <div className="max-w-6xl mx-auto px-5 lg:px-8 h-16 flex items-center justify-between gap-6">
          <a href="#top" className="flex items-center gap-2.5 group">
            <span
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg"
              style={{
                background:
                  "linear-gradient(135deg, rgba(56,189,248,0.25), rgba(34,211,238,0.15))",
                border: "1px solid rgba(56,189,248,0.35)",
              }}
            >
              <Snowflake className="h-4.5 w-4.5" style={{ color: "#7dd3fc" }} />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-bold tracking-tight">
                {ANDRE_CONFIG.brand.split(" ")[0]}
                <span style={{ color: "#7dd3fc" }}> AC</span>
              </p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                Ar condicionado
              </p>
            </div>
          </a>

          <nav className="hidden lg:flex items-center gap-7">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-[13px] font-medium transition-colors border-b-2 pb-0.5"
                style={{
                  color: active === l.id ? "#7dd3fc" : "#cbd5e1",
                  borderColor: active === l.id ? "#38bdf8" : "transparent",
                }}
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={telLink()}
              className="hidden sm:inline-flex items-center gap-2 text-[13px] font-semibold text-slate-200 hover:text-white transition-colors px-3 py-2 rounded-md"
            >
              <Phone className="h-4 w-4" style={{ color: "#7dd3fc" }} />
              {ANDRE_CONFIG.phone}
            </a>
            <a
              href={waLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="andre-btn-primary inline-flex items-center gap-2 h-10 px-4 rounded-md text-sm"
            >
              <WhatsAppIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Chamar no WhatsApp</span>
              <span className="sm:hidden">WhatsApp</span>
            </a>
            <button
              type="button"
              aria-label={open ? "Fechar menu" : "Abrir menu"}
              aria-expanded={open}
              onClick={() => setOpen(!open)}
              className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-md andre-btn-ghost"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Drawer mobile */}
      {open && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0"
            style={{
              background: "rgba(5, 9, 20, 0.9)",
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
            }}
            onClick={() => setOpen(false)}
          />
          <div className="relative h-full flex flex-col px-6 pt-5 pb-8">
            <div className="flex items-center justify-between mb-10">
              <span className="tech-stamp">MENU</span>
              <button
                type="button"
                aria-label="Fechar menu"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md andre-btn-ghost"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {links.map((l, i) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="py-4 text-2xl font-black tracking-tight border-b border-white/[0.06] transition-colors"
                  style={{
                    color: active === l.id ? "#7dd3fc" : "#f1f5f9",
                    animationDelay: `${i * 60}ms`,
                  }}
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
                className="andre-btn-primary inline-flex items-center justify-center gap-2 h-12 rounded-lg text-[15px]"
              >
                <WhatsAppIcon className="h-5 w-5" />
                Chamar André no WhatsApp
              </a>
              <a
                href={telLink()}
                className="andre-btn-ghost inline-flex items-center justify-center gap-2 h-12 rounded-lg text-[15px] font-semibold"
              >
                <Phone className="h-5 w-5" style={{ color: "#7dd3fc" }} />
                {ANDRE_CONFIG.phone}
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
