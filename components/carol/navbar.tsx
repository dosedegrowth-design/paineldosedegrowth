"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ORCAMENTO_URL } from "./site-data";

const LINKS = [
  { href: "#sobre", label: "Sobre" },
  { href: "#numeros", label: "Números" },
  { href: "#portfolio", label: "Portfólio" },
  { href: "#servicos", label: "Serviços" },
  { href: "#processo", label: "Processo" },
  { href: "#comunidade", label: "Comunidade" },
  { href: "#investimento", label: "Investimento" },
] as const;

export function CarolNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled || open
          ? "bg-[var(--carol-bg)]/90 backdrop-blur-md border-b border-[var(--carol-line)] shadow-[0_8px_30px_-18px_rgba(36,26,32,0.35)]"
          : "bg-transparent"
      )}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8">
        <a
          href="#topo"
          className="carol-display-italic text-xl tracking-tight text-[var(--carol-ink)]"
          onClick={() => setOpen(false)}
        >
          Carolina Kühn
        </a>

        <div className="hidden items-center gap-7 lg:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[13px] font-semibold text-[var(--carol-muted)] transition-colors hover:text-[var(--carol-accent-deep)]"
            >
              {l.label}
            </a>
          ))}
          <a
            href={ORCAMENTO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="carol-btn carol-btn-primary !px-6 !py-2.5 !text-[13px]"
          >
            Solicitar orçamento
          </a>
        </div>

        <button
          type="button"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          className="rounded-lg p-2 text-[var(--carol-ink)] lg:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Menu mobile */}
      <div
        className={cn(
          "overflow-hidden transition-[max-height,opacity] duration-300 lg:hidden",
          open ? "max-h-[420px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="flex flex-col gap-1 border-t border-[var(--carol-line)] bg-[var(--carol-bg)]/95 px-5 py-4 backdrop-blur-md">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2.5 text-[15px] font-semibold text-[var(--carol-ink)] transition-colors hover:bg-[var(--carol-accent-soft)]"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <a
            href={ORCAMENTO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="carol-btn carol-btn-primary mt-2"
            onClick={() => setOpen(false)}
          >
            Solicitar orçamento
          </a>
        </div>
      </div>
    </header>
  );
}
