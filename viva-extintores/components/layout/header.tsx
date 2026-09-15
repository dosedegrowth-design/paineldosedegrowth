"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CTA_PRINCIPAL, MENU, ROUTES } from "@/lib/config";
import { MENSAGENS, whatsappUrl } from "@/lib/whatsapp";
import { Botao } from "@/components/ui/botao";
import { Logo } from "@/components/ui/logo";

/** Cabeçalho do site: o menu de seis itens e o CTA, como no layout aprovado. */
export function Header() {
  const pathname = usePathname();
  const [aberto, setAberto] = useState(false);
  const [rota, setRota] = useState(pathname);

  // trocar de página fecha a gaveta — ajuste na renderização, sem effect
  if (rota !== pathname) {
    setRota(pathname);
    setAberto(false);
  }

  const cta = whatsappUrl(MENSAGENS.geral);

  /** Portfólio fica marcado também dentro das cinco páginas de área. */
  const ativo = (href: string) =>
    href === ROUTES.home
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="v-header">
      <div className="v-wrap">
        <div className="v-header__bar">
          <Logo assinatura />

          <nav className="v-header__nav" aria-label="Navegação principal">
            {MENU.map((m) => (
              <Link
                key={m.href}
                href={m.href}
                className="v-navlink"
                aria-current={ativo(m.href) ? "page" : undefined}
              >
                {m.rotulo}
              </Link>
            ))}
          </nav>

          <div className="v-header__cta">
            <Botao href={cta} tamanho="sm">
              {CTA_PRINCIPAL}
            </Botao>
          </div>

          <button
            type="button"
            className="v-burger"
            aria-expanded={aberto}
            aria-controls="v-drawer"
            aria-label={aberto ? "Fechar menu" : "Abrir menu"}
            onClick={() => setAberto((v) => !v)}
          >
            <span />
          </button>
        </div>
      </div>

      <div className="v-drawer" id="v-drawer" data-open={aberto}>
        <div className="v-wrap">
          <nav aria-label="Navegação principal">
            {MENU.map((m) => (
              <Link key={m.href} href={m.href}>
                {m.rotulo}
              </Link>
            ))}
          </nav>
          <div style={{ marginTop: 20 }}>
            <Botao href={cta}>{CTA_PRINCIPAL}</Botao>
          </div>
        </div>
      </div>
    </header>
  );
}
