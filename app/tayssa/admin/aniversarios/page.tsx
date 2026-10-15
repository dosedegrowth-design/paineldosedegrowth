import type { ReactNode } from "react";
import { requireAdminPage } from "@/lib/tayssa/auth/guards";
import { listBirthdays } from "@/lib/tayssa/queries/admin";
import type { BirthdayEntry } from "@/lib/tayssa/queries/admin";
import { getSettings } from "@/lib/tayssa/settings";
import { getPublicBenefits } from "@/lib/tayssa/queries/catalog";
import { ROUTES } from "@/lib/tayssa/config";
import { dateShort, dayMonth, monthName, nowInBusinessTz, plural } from "@/lib/tayssa/format";
import { daysBetween } from "@/lib/tayssa/rules";
import { whatsappUrl } from "@/lib/tayssa/whatsapp";
import { BENEFIT_STATUS_LABEL, type ClientBenefitStatus } from "@/lib/tayssa/types";
import { AdminBlock, AdminHeader, Empty } from "@/components/tayssa/admin/shell";
import { ReleaseBirthdayForm } from "@/components/tayssa/admin/forms";
import { Icone, type IconeNome } from "@/components/tayssa/admin/icons";
import { TransitionLink } from "@/components/tayssa/ui/transition";

/** O mesmo mapa de cores dos benefícios: dourado é o liberado. */
const TOM_BENEFICIO: Record<ClientBenefitStatus, "warn" | "gold" | "ok" | "quiet" | "bad"> = {
  pending_validation: "warn",
  available: "gold",
  requested: "warn",
  approved: "ok",
  redeemed: "quiet",
  expired: "quiet",
  rejected: "bad",
};

/** Vazio desenhado: ícone, uma frase curta e o porquê. */
function Vazio({ icone, titulo, children }: { icone: IconeNome; titulo: string; children?: ReactNode }) {
  return (
    <Empty>
      <span className="tya-nada">
        <Icone nome={icone} />
        <b>{titulo}</b>
        {children ? <span>{children}</span> : null}
      </span>
    </Empty>
  );
}

/** Atalho do topo: número que vem do banco. */
function Atalho({ n, label, alerta }: { n: number; label: string; alerta?: boolean }) {
  return (
    <div className={`tya-card tya-kpi${alerta ? " tya-kpi--alert" : ""}`}>
      <span className="tya-eyebrow">{label}</span>
      <p className="tya-kpi__n">{n}</p>
    </div>
  );
}

/** "07" e "out" a partir de "1996-10-07" — sem passar por fuso. */
function diaMes(iso: string): { dia: string; mes: string } {
  return { dia: iso.slice(8, 10), mes: monthName(Number(iso.slice(5, 7)) - 1).slice(0, 3) };
}

/** O mês abrindo frase: "março" vira "Março". */
function mesTitulo(month: number): string {
  const m = monthName(month);
  return m.charAt(0).toUpperCase() + m.slice(1);
}

/**
 * Quando é, em palavras dela. O selo ao lado mostra dia e mês, sem ano, e a
 * frase fala da ocorrência mais perto de hoje — a que acabou de passar ou a
 * que vem. `info.daysUntil` não serve aqui: ele conta até a próxima
 * ocorrência, que vira o ano seguinte assim que a janela deste ano fecha, e
 * debaixo de "OUT 03", em outubro, diria "em 353 dias".
 */
function quando(c: BirthdayEntry, hoje: Date): string {
  const iso = c.profile!.birthday!;
  const mes = Number(iso.slice(5, 7)) - 1;
  const dia = Number(iso.slice(8, 10));
  const dias = [hoje.getFullYear() - 1, hoje.getFullYear(), hoje.getFullYear() + 1]
    .map((ano) => daysBetween(hoje, new Date(ano, mes, dia)))
    .reduce((perto, d) => {
      const empate = Math.abs(d) === Math.abs(perto);
      return Math.abs(d) < Math.abs(perto) || (empate && d > perto) ? d : perto;
    });
  if (dias === 0) return "é hoje";
  if (dias > 0) return `em ${dias} ${plural(dias, "dia", "dias")}`;
  return `foi há ${-dias} ${plural(-dias, "dia", "dias")}`;
}

export default async function BirthdaysAdminPage({ searchParams }: { searchParams: Promise<{ mes?: string }> }) {
  await requireAdminPage();
  const { mes } = await searchParams;
  const now = nowInBusinessTz();
  const month = mes && /^\d{1,2}$/.test(mes) ? Math.min(11, Math.max(0, Number(mes) - 1)) : now.getMonth();
  const [list, settings, benefits] = await Promise.all([listBirthdays(month), getSettings(), getPublicBenefits()]);
  const defaultDays = benefits.find((b) => b.type === "birthday")?.validity_days ?? settings.rules.benefit_validity_days;

  const vips = list.filter((c) => c.profile?.vip_status === "active");
  const naJanela = list.filter((c) => c.info.inWindow);
  const liberados = list.filter((c) => c.releasedThisYear);
  const aLiberar = vips.filter((c) => !c.releasedThisYear);
  /** Espera de verdade: a semana dela está aberta hoje e o presente não saiu. */
  const esperandoAgora = aLiberar.filter((c) => c.info.inWindow);

  return (
    <>
      <AdminHeader
        eyebrow="Aniversários"
        title={
          <>
            {mesTitulo(month)}: {list.length} <em>{plural(list.length, "aniversariante", "aniversariantes")}</em>
          </>
        }
        lead="Só VIP ativo recebe o benefício, e nenhum sai sozinho: você escolhe o presente e libera. Ela agenda na semana dela."
      />

      <div className="tya-toolbar">
        <div className="tya-chips">
          {Array.from({ length: 12 }, (_, i) => (
            <a
              key={i}
              href={`${ROUTES.adminBirthdays}?mes=${i + 1}`}
              className="tya-chip"
              data-on={i === month}
              aria-current={i === month ? "page" : undefined}
            >
              {monthName(i).slice(0, 3)}
            </a>
          ))}
        </div>
        {esperandoAgora.length ? (
          <span className="tya-pill tya-pill--gold">
            {esperandoAgora.length} {plural(esperandoAgora.length, "VIP", "VIPs")} na semana dela, sem presente
            liberado
          </span>
        ) : aLiberar.length ? (
          <span className="tya-pill tya-pill--quiet">
            {aLiberar.length} {plural(aLiberar.length, "VIP", "VIPs")} sem presente liberado
          </span>
        ) : null}
      </div>

      <div className="tya-kpis tya-kpis--2sm tya-stagger">
        <Atalho n={list.length} label="No mês" />
        <Atalho n={naJanela.length} label="Na semana dela" alerta={naJanela.length > 0} />
        <Atalho n={vips.length} label="VIP ativo" />
        <Atalho n={liberados.length} label="Já liberados" />
      </div>

      <AdminBlock
        title={`Do mês — ${mesTitulo(month)}`}
        aside={
          esperandoAgora.length ? (
            <span className="tya-pill tya-pill--warn">{esperandoAgora.length} esperando você</span>
          ) : aLiberar.length ? (
            <span className="tya-pill tya-pill--quiet">{aLiberar.length} sem presente liberado</span>
          ) : list.length ? (
            <span className="tya-pill tya-pill--ok">nada pendente</span>
          ) : null
        }
      >
        {list.length ? (
          <ul className="tya-list">
            {list.map((c) => {
              const vip = c.profile?.vip_status === "active";
              const first = c.user.nickname ?? c.user.name.split(" ")[0];
              const { dia, mes: mesAbrev } = diaMes(c.profile!.birthday!);
              const espera = vip && !c.releasedThisYear;
              const tom = c.releasedThisYear ? "ok" : c.info.inWindow ? "brand" : espera ? "warn" : undefined;
              return (
                <li key={c.user.id} className="tya-slot" data-tom={tom}>
                  <div className="tya-slot__when">
                    <span className="tya-slot__dow">{mesAbrev}</span>
                    <span className="tya-num tya-slot__h">{dia}</span>
                    <span className="tya-slot__d">{quando(c, now)}</span>
                  </div>

                  <div className="tya-slot__body">
                    <div className="tya-slot__top">
                      <TransitionLink href={ROUTES.adminClient(c.user.id)} className="tya-link tya-slot__name">
                        {c.user.name}
                      </TransitionLink>
                      <span className={`tya-pill ${vip ? "tya-pill--gold" : "tya-pill--quiet"}`}>
                        {vip ? "VIP ativo" : "não VIP"}
                      </span>
                      {c.info.inWindow ? <span className="tya-pill tya-pill--brand">é a semana dela</span> : null}
                      <span className="tya-pill tya-pill--quiet tya-num">{c.points} pts</span>
                    </div>
                    <p className="tya-slot__meta">
                      {dayMonth(c.profile!.birthday!)} ·{" "}
                      {c.lastServiceDate
                        ? `último atendimento ${dateShort(c.lastServiceDate)}`
                        : "sem atendimento confirmado"}
                    </p>
                    <p className="tya-slot__mine">
                      <span className="tya-slot__tag">sugestão</span>
                      {vip
                        ? c.releasedThisYear
                          ? "benefício já liberado — combine o agendamento"
                          : "escolha o presente e libere aqui"
                        : "sem VIP, sem benefício; se fizer sentido, ative o VIP no perfil dela"}
                    </p>
                    {c.user.phone ? (
                      <a
                        href={whatsappUrl(c.user.phone, `Oi, ${first}! `)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="tya-link tya-link--quiet tya-slot__wa"
                      >
                        WhatsApp
                      </a>
                    ) : null}
                  </div>

                  <div className="tya-slot__acts">
                    {c.releasedThisYear ? (
                      <div className="tya-give">
                        <span className="tya-label">Presente liberado</span>
                        <p className="tya-slot__name" style={{ fontSize: 14 }}>
                          {c.releasedThisYear.title}
                        </p>
                        <p style={{ marginTop: 8 }}>
                          <span className={`tya-pill tya-pill--${TOM_BENEFICIO[c.releasedThisYear.status]}`}>
                            {BENEFIT_STATUS_LABEL[c.releasedThisYear.status]}
                          </span>
                        </p>
                        {c.releasedThisYear.expires_at ? (
                          <p className="tya-small" style={{ marginTop: 8 }}>
                            válido até {dateShort(c.releasedThisYear.expires_at)}
                          </p>
                        ) : null}
                      </div>
                    ) : vip ? (
                      <div className="tya-give">
                        <ReleaseBirthdayForm clientId={c.user.id} defaultDays={defaultDays} />
                      </div>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <Vazio icone="aniversarios" titulo={`Nenhuma cliente faz aniversário em ${monthName(month)}`}>
            Troque o mês acima. A data vem do perfil da cliente — quem não preencheu não aparece em mês nenhum.
          </Vazio>
        )}
      </AdminBlock>
    </>
  );
}
