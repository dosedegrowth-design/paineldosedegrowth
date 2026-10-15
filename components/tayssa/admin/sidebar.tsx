"use client";

import { useEffect, useState } from "react";
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
    itens: [{ href: ROUTES.adminPhotos, label: "Fotos", icone: "fotos" }],
  },
  {
    titulo: "Ajustes",
    itens: [{ href: ROUTES.adminSettings, label: "Configurações", icone: "config" }],
  },
];

export const ROTAS_PAINEL = SECOES.flatMap((s) => s.itens.map((i) => ({ ...i, secao: s.titulo })));

/**
 * A lateral: escura, fixa, com a marca em cima e o que espera por ela
 * marcado no próprio item. Recolhe para uma faixa de ícones — a escolha
 * fica no aparelho, não no banco.
 */
export function AdminSidebar({ atencao }: { atencao: Atencao }) {
  const path = usePathname();
  const [min, setMin] = useState(false);

  useEffect(() => {
    try {
      setMin(window.localStorage.getItem("tayssa_painel_lateral") === "1");
    } catch {
      /* sem armazenamento: começa aberta, e tudo bem */
    }
  }, []);

  const alternar = () => {
    setMin((v) => {
      try {
        window.localStorage.setItem("tayssa_painel_lateral", v ? "0" : "1");
      } catch {
        /* idem */
      }
      return !v;
    });
  };

  const ativo = (i: Item) => (i.exato ? path === i.href : path.startsWith(i.href));

  return (
    <aside className="tya-side" data-min={min}>
      <TransitionLink href={ROUTES.admin} className="tya-side__brand" aria-label="Tayssa Lash — painel">
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
        <button type="button" className="tya-side__toggle" onClick={alternar} title={min ? "Expandir" : "Recolher"}>
          <Icone nome={min ? "expandir" : "recolher"} />
          {!min ? <span>Recolher</span> : null}
        </button>
      </div>
    </aside>
  );
}
