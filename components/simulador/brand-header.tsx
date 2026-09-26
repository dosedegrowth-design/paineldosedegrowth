"use client";

import { useState } from "react";
import { BRAND, COPY, MENU } from "@/lib/simulador/config";
import { BrandMark, CloseIcon, MenuIcon } from "./icons";

/**
 * Cabeçalho institucional: branco, logo + identificação da plataforma à
 * esquerda, menu curto à direita (no celular, um botão abre a lista).
 * A faixa fina verde/amarelo/azul fecha o cabeçalho.
 */
export function BrandHeader() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <header className="sim-header">
      <div className="sim-container sim-header__row">
        <a className="sim-brand" href="#inicio" onClick={close}>
          <BrandMark />
          <span className="sim-brand__text">
            <span className="sim-brand__name">{BRAND.name}</span>
            <span className="sim-brand__desc">{BRAND.descriptor}</span>
          </span>
        </a>
        <button
          type="button"
          className="sim-menu-btn"
          aria-expanded={open}
          aria-controls="sim-menu"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <CloseIcon size={18} /> : <MenuIcon size={18} />}
          <span>{open ? COPY.header.closeMenu : COPY.header.menu}</span>
        </button>
        <nav
          id="sim-menu"
          className="sim-nav"
          aria-label={COPY.header.navLabel}
          data-open={open || undefined}
        >
          <ul>
            {MENU.map((item) => (
              <li key={item.href}>
                <a href={item.href} onClick={close}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="sim-stripe" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
    </header>
  );
}
