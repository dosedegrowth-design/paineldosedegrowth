"use client";

import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/lib/tayssa/config";
import { TransitionLink } from "@/components/tayssa/ui/transition";
import { Icone, type IconeNome } from "@/components/tayssa/admin/icons";

export type Atencao = {
  signups: number;
  appointments: number;
  services: number;
  referrals: number;
  benefits: number;
};

type Item = { href: string; label: string; icone: IconeNome; chave?: keyof Atencao; exato?: boolean };

/** O dia da Tayssa, agrupado: o que atende, quem volta, a marca, os ajustes. */
const SECOES: { titulo: string; itens: Item[] }[] = [
  {
    titulo: "Atendimento",
    itens: [
      { href: ROUTES.admin, label: "Visão geral", icone: "visao", exato: true },
      { href: ROUTES.adminAgenda, label: "Agenda", icone: "agenda", chave: "appointments" },
      { href: ROUTES.adminServices, label: "Atendimentos", icone: "atendimentos", chave: "services" },
      { href: ROUTES.adminClients, label: "Clientes", icone: "clientes", chave: "signups" },
    ],
  },
  {
    titulo: "Relacionamento",
    itens: [
      { href: ROUTES.adminReferrals, label: "Indicações", icone: "indicacoes", chave: "referrals" },
      { href: ROUTES.adminBenefits, label: "Benefícios", icone: "beneficios", chave: "benefits" },
      { href: ROUTES.adminBirthdays, label: "Aniversários", icone: "aniversarios" },
    ],
  },
  {
    titulo: "Marca",
    itens: [{ href: ROUTES.adminPhotos, label: "Mídia", icone: "fotos" }],
  },
  {
    titulo: "Ajustes",
    itens: [{ href: ROUTES.adminSettings, label: "Configurações", icone: "config" }],
  },
];

const CHAVE_LATERAL = "tayssa_painel_lateral";
const EVENTO_LATERAL = "tayssa:lateral";

function lerLateral(): boolean {
  try {
    return window.localStorage.getItem(CHAVE_LATERAL) === "1";
  } catch {
    return false;
  }
}

function assinarLateral(aviso: () => void) {
  window.addEventListener(EVENTO_LATERAL, aviso);
  window.addEventListener("storage", aviso);
  return () => {
    window.removeEventListener(EVENTO_LATERAL, aviso);
    window.removeEventListener("storage", aviso);
  };
}

export type ItemPainel = Item;

export const ROTAS_PAINEL = SECOES.flatMap((s) => s.itens.map((i) => ({ ...i, secao: s.titulo })));

/**
 * A lateral: escura, fixa, com a marca em cima e o que espera por ela
 * marcado no próprio item. Recolhe para uma faixa de ícones — a escolha
 * fica no aparelho, não no banco.
 */
export function AdminSidebar({
  atencao,
  aberta = false,
  onFechar,
}: {
  atencao: Atencao;
  /** no celular a lateral é uma gaveta: aberta por cima da tela */
  aberta?: boolean;
  onFechar?: () => void;
}) {
  const path = usePathname();
  // a escolha mora no aparelho: lida do localStorage como loja externa
  // (no servidor, sempre aberta — sem divergência de hidratação)
  const min = useSyncExternalStore(assinarLateral, lerLateral, () => false);

  const alternar = () => {
    try {
      window.localStorage.setItem(CHAVE_LATERAL, min ? "0" : "1");
    } catch {
      /* sem armazenamento: a lateral só não lembra da escolha */
    }
    window.dispatchEvent(new Event(EVENTO_LATERAL));
  };

  const ativo = (i: Item) => (i.exato ? path === i.href : path.startsWith(i.href));

  return (
    <aside className="tya-side" data-min={min} data-aberta={aberta}>
      {/* fundo vivo (linha do painel iWin): o escuro nunca é chapado —
          duas luzes lentas e uma grade que some nas bordas */}
      <div className="tya-vivo" aria-hidden>
        <span className="tya-vivo__luz tya-vivo__luz--1" />
        <span className="tya-vivo__luz tya-vivo__luz--2" />
        <span className="tya-vivo__grade" />
      </div>
      <TransitionLink href={ROUTES.admin} className="tya-side__brand" aria-label="Tayssa Lash — painel" onClick={onFechar}>
        <span className="tya-side__mark" aria-hidden>
          T
        </span>
        {!min ? (
          <span className="tya-side__name">
            <b>
              Tayssa <em>Lash</em>
            </b>
            <span>Painel</span>
          </span>
        ) : null}
      </TransitionLink>

      <nav className="tya-side__nav" aria-label="Painel">
        {SECOES.map((s) => (
          <div key={s.titulo} className="tya-side__sec">
            <div className="tya-side__sec-t">{s.titulo}</div>
            {s.itens.map((i) => {
              const n = i.chave ? atencao[i.chave] : 0;
              return (
                <TransitionLink
                  key={i.href}
                  href={i.href}
                  className="tya-side__item"
                  data-on={ativo(i)}
                  title={min ? i.label : undefined}
                  aria-current={ativo(i) ? "page" : undefined}
                  onClick={onFechar}
                >
                  <Icone nome={i.icone} />
                  <span>{i.label}</span>
                  {n > 0 ? (
                    <em className="tya-side__badge" aria-label={`${n} esperando`}>
                      {n}
                    </em>
                  ) : null}
                </TransitionLink>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="tya-side__foot">
        {!min ? (
          <div className="tya-side__note">
            <b>Nada entra sozinho</b>
            <span>Ponto, benefício e horário só valem depois que você confirma.</span>
          </div>
        ) : null}
        <button
          type="button"
          className="tya-side__toggle"
          onClick={alternar}
          title={min ? "Expandir" : "Recolher"}
          aria-label={min ? "Expandir o menu" : "Recolher o menu"}
          aria-expanded={!min}
        >
          <Icone nome={min ? "expandir" : "recolher"} />
          {!min ? <span>Recolher</span> : null}
        </button>
      </div>
    </aside>
  );
}
