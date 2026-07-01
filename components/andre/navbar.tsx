"use client";

import { useEffect, useState } from "react";
import { Phone, MessageCircle, Snowflake } from "lucide-react";
import { ANDRE_CONFIG, waLink, telLink } from "./config";

const links = [
  { href: "#servicos", label: "Serviços" },
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#equipamentos", label: "Equipamentos" },
  { href: "#cobertura", label: "Cobertura" },
  { href: "#faq", label: "Dúvidas" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
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
              className="text-[13px] font-medium text-slate-300 hover:text-white transition-colors"
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
            <MessageCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Orçamento no WhatsApp</span>
            <span className="sm:hidden">Orçar</span>
          </a>
        </div>
      </div>
    </header>
  );
}
