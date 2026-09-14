"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AREAS } from "@/lib/areas";
import { CTA_PRINCIPAL, ROUTES } from "@/lib/config";
import { MENSAGENS, whatsappUrl } from "@/lib/whatsapp";
import { Botao } from "@/components/ui/botao";
import { Logo } from "@/components/ui/logo";

/**
 * Cabeçalho (§4): acesso fácil a navegação, contato e WhatsApp, no desktop
 * e no celular. No mobile a navegação vira gaveta — nenhuma área some.
 */
export function Header() {
  const pathname = usePathname();
  const [aberto, setAberto] = useState(false);
  const [rota, setRota] = useState(pathname);

  // trocar de página fecha a gaveta — ajuste durante a renderização, sem
  // effect (é o padrão que o React recomenda para estado derivado)
  if (rota !== pathname) {
    setRota(pathname);
    setAberto(false);
  }

  const cta = whatsappUrl(MENSAGENS.geral);

  return (
    <header className="v-header">
      <div className="v-wrap">
        <div className="v-header__bar">
          <Logo />

          <nav className="v-header__nav" aria-label="Áreas de atuação">
            <Link
              href={ROUTES.home}
              className="v-navlink"
              aria-current={pathname === ROUTES.home ? "page" : undefined}
            >
              Portfólio
            </Link>
            {AREAS.map((a) => (
              <Link
                key={a.slug}
                href={a.href}
                className="v-navlink"
                aria-current={pathname === a.href ? "page" : undefined}
              >
                {a.aba[0]} {a.aba[1]}
              </Link>
            ))}
            <Link href={ROUTES.contato} className="v-navlink">
              Contato
            </Link>
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
          <nav aria-label="Áreas de atuação">
            {AREAS.map((a) => (
              <Link key={a.slug} href={a.href}>
                <small>{a.numero}</small>
                {a.aba[0]} {a.aba[1]}
              </Link>
            ))}
            <Link href={ROUTES.contato}>
              <small>—</small>
              Contato
            </Link>
          </nav>
          <div style={{ marginTop: 20 }}>
            <Botao href={cta}>{CTA_PRINCIPAL}</Botao>
          </div>
        </div>
      </div>
    </header>
  );
}
