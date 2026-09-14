import { requireAdminPage } from "@/lib/tayssa/auth/guards";
import { listBirthdays } from "@/lib/tayssa/queries/admin";
import { getSettings } from "@/lib/tayssa/settings";
import { getPublicBenefits } from "@/lib/tayssa/queries/catalog";
import { ROUTES } from "@/lib/tayssa/config";
import { dateShort, dayMonth, monthName } from "@/lib/tayssa/format";
import { whatsappUrl } from "@/lib/tayssa/whatsapp";
import { AdminBlock, AdminHeader, Empty } from "@/components/tayssa/admin/shell";
import { ReleaseBirthdayForm } from "@/components/tayssa/admin/forms";
import { BenefitStatusText, StatusText } from "@/components/tayssa/ui/status";
import { TransitionLink } from "@/components/tayssa/ui/transition";

export default async function BirthdaysAdminPage({ searchParams }: { searchParams: Promise<{ mes?: string }> }) {
  await requireAdminPage();
  const { mes } = await searchParams;
  const now = new Date();
  const month = mes && /^\d{1,2}$/.test(mes) ? Math.min(11, Math.max(0, Number(mes) - 1)) : now.getMonth();
  const [list, settings, benefits] = await Promise.all([listBirthdays(month), getSettings(), getPublicBenefits()]);
  const defaultDays = benefits.find((b) => b.type === "birthday")?.validity_days ?? settings.rules.benefit_validity_days;

  return (
    <>
      <AdminHeader
        eyebrow="Aniversários"
        title={<>{monthName(month)}: {list.length} <em>{list.length === 1 ? "aniversariante" : "aniversariantes"}</em></>}
        lead="Só VIP ativo recebe o benefício. Você escolhe o presente e libera; ela agenda na semana."
        actions={
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            {Array.from({ length: 12 }, (_, i) => (
              <a key={i} href={`${ROUTES.adminBirthdays}?mes=${i + 1}`} className={`ty-link ty-link--caps ${i === month ? "ty-link--on" : ""}`} style={{ opacity: i === month ? 1 : 0.55 }}>
                {monthName(i).slice(0, 3)}
              </a>
            ))}
          </div>
        }
      />

      <AdminBlock title="Do mês">
        {list.length ? (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {list.map((c) => {
              const vip = c.profile?.vip_status === "active";
              const first = c.user.nickname ?? c.user.name.split(" ")[0];
              return (
                <li key={c.user.id} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(280px, 1fr)", gap: 24, padding: "18px 0", borderTop: "1px solid var(--t-line)", alignItems: "start" }}>
                  <div>
                    <div style={{ display: "flex", gap: 12, alignItems: "baseline", flexWrap: "wrap" }}>
                      <span className="ty-display ty-num" style={{ fontSize: 28 }}>{dayMonth(c.profile!.birthday!)}</span>
                      <TransitionLink href={ROUTES.adminClient(c.user.id)} className="ty-link" style={{ fontSize: 16 }}>
                        {c.user.name}
                      </TransitionLink>
                      <StatusText tone={vip ? "ok" : "off"}>{vip ? "VIP" : "não VIP"}</StatusText>
                      {c.info.inWindow ? <StatusText tone="accent">é a semana dela</StatusText> : null}
                    </div>
                    <span className="ty-small" style={{ display: "block", marginTop: 6 }}>
                      {c.lastServiceDate ? `último atendimento ${dateShort(c.lastServiceDate)}` : "sem atendimento confirmado"} · {c.points} pts ·{" "}
                      {c.info.daysUntil === 0 ? "hoje" : c.info.daysUntil > 0 ? `em ${c.info.daysUntil} dias` : "já passou este ano"}
                    </span>
                    <span className="ty-small" style={{ display: "block", marginTop: 4 }}>
                      Sugestão: {vip ? (c.releasedThisYear ? "benefício já liberado — combine o agendamento" : "escolha o presente e libere abaixo") : "sem VIP, sem benefício; se fizer sentido, ative o VIP no perfil"}
                    </span>
                    {c.user.phone ? (
                      <a href={whatsappUrl(c.user.phone, `Oi, ${first}! `)} target="_blank" rel="noopener noreferrer" className="ty-link ty-link--caps" style={{ marginTop: 10, display: "inline-block" }}>
                        WhatsApp
                      </a>
                    ) : null}
                  </div>
                  <div>
                    {c.releasedThisYear ? (
                      <p className="ty-body">
                        Liberado: <strong style={{ fontWeight: 500, color: "var(--t-fg)" }}>{c.releasedThisYear.title}</strong> · <BenefitStatusText status={c.releasedThisYear.status} />
                      </p>
                    ) : vip ? (
                      <ReleaseBirthdayForm clientId={c.user.id} defaultDays={defaultDays} />
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <Empty>Nenhuma cliente faz aniversário em {monthName(month)}.</Empty>
        )}
      </AdminBlock>
    </>
  );
}
