import Link from "next/link";
import type { SessionUser } from "@/lib/tayssa/auth/session";
import { ROUTES, PRIORIDADE_VIP } from "@/lib/tayssa/config";
import { getClientOverview } from "@/lib/tayssa/queries/client";
import { andamentoVipLegivel, regraVipLegivel } from "@/lib/tayssa/rules";
import { TomDoSite } from "@/components/tayssa/vip/tom-do-site";

export type TelaTrancada = "inicio" | "cartao" | "beneficios" | "jornada";

const TITULO: Record<TelaTrancada, [string, string]> = {
  inicio: ["A área VIP", "abre com o seu VIP"],
  cartao: ["O cartão de visitas", "abre com o seu VIP"],
  beneficios: ["Os benefícios", "abrem com o seu VIP"],
  jornada: ["A sua jornada", "abre com o seu VIP"],
};

/**
 * Quem ainda não é VIP vê as telas do VIP trancadas (Lucas, 09/11/2026:
 * "campos bloqueados"): a regra, quantos atendimentos da sequência ela já
 * tem ("2 de 4") e o caminho para marcar o próximo. Na paleta do site,
 * como "Meus agendamentos". O VIP nunca liga sozinho: a Tayssa confirma.
 */
export async function VipTrancado({ user, tela }: { user: SessionUser; tela: TelaTrancada }) {
  const { vip } = await getClientOverview(user);
  const total = vip.criterios.visitas;
  const [titulo, resto] = TITULO[tela];
  return (
    <>
      <TomDoSite />
      <section className="tyv-tranca" aria-labelledby="tyv-tranca-titulo">
        <span className="tyv-tranca__cadeado" aria-hidden>
          <svg viewBox="0 0 24 24">
            <rect x="5" y="10.5" width="14" height="10" rx="2.6" />
            <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
            <path d="M12 14.6v2.2" />
          </svg>
        </span>
        <p className="tyv-tranca__rotulo">Área VIP</p>
        <h1 id="tyv-tranca-titulo" className="tyv-hello">
          {titulo} <em>{resto}</em>.
        </h1>
        <p className="tyv-sub">
          {user.displayName}, para virar VIP são {regraVipLegivel(vip.criterios)}. A Tayssa acompanha e confirma o seu VIP.
        </p>

        <div className="tyv-panel tyv-tranca__andamento">
          <p className="tyv-tranca__conta">
            <b>{vip.contam}</b> de {total}
            <span>atendimentos na sequência</span>
          </p>
          <ol className="tyv-tranca__pontos" aria-hidden>
            {Array.from({ length: total }, (_, i) => (
              <li key={i} data-feito={i < vip.contam || undefined} />
            ))}
          </ol>
          <p className="tyv-tranca__nota">{andamentoVipLegivel(vip)}</p>
        </div>

        <div className="tyv-panel tyv-tranca__lista">
          <p className="tyv-tranca__lista-titulo">Sendo VIP, você tem</p>
          <ul>
            <li>{PRIORIDADE_VIP.charAt(0).toUpperCase() + PRIORIDADE_VIP.slice(1)}</li>
            <li>Cartão de visitas, pontos e presentes</li>
            <li>Presente no mês do seu aniversário</li>
          </ul>
        </div>

        <div className="tyv-tranca__acoes">
          <Link href={`${ROUTES.vipBook}?aba=marcar`} className="tyv-btn tyv-btn--accent">
            Marcar um horário
          </Link>
          <Link href={ROUTES.vipBook} className="tyv-btn tyv-btn--ghost">
            Meus agendamentos
          </Link>
        </div>
      </section>
    </>
  );
}
