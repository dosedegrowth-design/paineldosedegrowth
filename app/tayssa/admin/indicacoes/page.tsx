import { requireAdminPage } from "@/lib/tayssa/auth/guards";
import { listReferrals } from "@/lib/tayssa/queries/admin";
import { ROUTES } from "@/lib/tayssa/config";
import { dateShort } from "@/lib/tayssa/format";
import { formatBrPhone } from "@/lib/tayssa/phone";
import { whatsappUrl } from "@/lib/tayssa/whatsapp";
import { adminSetReferralStatusAction } from "@/lib/tayssa/actions/referrals";
import { AdminBlock, AdminHeader, Empty } from "@/components/tayssa/admin/shell";
import { ReferralStatusControl } from "@/components/tayssa/admin/controls";
import { ReferralStatusText } from "@/components/tayssa/ui/status";
import { TransitionLink } from "@/components/tayssa/ui/transition";

const STEPS = "Em análise → Contato feito → Agendado → Realizado → Confirmada. Só 'Confirmada' conta para quem indicou.";

export default async function ReferralsAdminPage() {
  await requireAdminPage();
  const all = await listReferrals();
  const open = all.filter((r) => !["approved", "rejected"].includes(r.status));
  const closed = all.filter((r) => ["approved", "rejected"].includes(r.status)).slice(0, 60);

  return (
    <>
      <AdminHeader
        eyebrow="Indicações"
        title={open.length ? <>{open.length} em <em>andamento</em></> : <>Nenhuma em <em>andamento</em></>}
        lead={STEPS}
      />

      <AdminBlock title="Pipeline">
        {open.length ? (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {open.map((r) => (
              <li key={r.id} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 18, padding: "16px 0", borderTop: "1px solid var(--t-line)", alignItems: "start" }}>
                <div>
                  <div style={{ display: "flex", gap: 12, alignItems: "baseline", flexWrap: "wrap" }}>
                    <strong style={{ fontWeight: 500, fontSize: 16 }}>{r.referred_name}</strong>
                    <a href={whatsappUrl(r.referred_phone, `Oi, ${r.referred_name.split(" ")[0]}! `)} target="_blank" rel="noopener noreferrer" className="ty-link ty-small">
                      {formatBrPhone(r.referred_phone)}
                    </a>
                    <ReferralStatusText status={r.status} />
                  </div>
                  <span className="ty-small" style={{ display: "block", marginTop: 4 }}>
                    indicada por{" "}
                    {r.referrer ? (
                      <TransitionLink href={ROUTES.adminClient(r.referrer.id)} className="ty-link">{r.referrer.name}</TransitionLink>
                    ) : (
                      <>{r.referrer_name ?? "—"} ({r.referrer_phone ? formatBrPhone(r.referrer_phone) : "sem telefone"}, sem conta)</>
                    )}{" "}
                    · {r.source === "vip" ? "pelo VIP" : "pelo site"} · {dateShort(r.created_at)}
                  </span>
                  {r.note ? <span className="ty-small" style={{ display: "block", fontWeight: 300 }}>“{r.note}”</span> : null}
                  {!r.referrer ? (
                    <span className="ty-small" style={{ display: "block", color: "var(--t-wait)" }}>
                      Quem indicou não tem conta: a indicação não soma em ninguém até você criar a conta dela com este telefone.
                    </span>
                  ) : null}
                </div>
                <ReferralStatusControl id={r.id} current={r.status} action={adminSetReferralStatusAction} />
              </li>
            ))}
          </ul>
        ) : (
          <Empty>Nenhuma indicação em andamento.</Empty>
        )}
      </AdminBlock>

      <AdminBlock title="Encerradas">
        {closed.length ? (
          <div className="ty-table-wrap">
            <table className="ty-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Indicada</th>
                  <th>Por</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {closed.map((r) => (
                  <tr key={r.id}>
                    <td className="ty-num">{dateShort(r.approved_at ?? r.updated_at)}</td>
                    <td>{r.referred_name}</td>
                    <td>{r.referrer ? <TransitionLink href={ROUTES.adminClient(r.referrer.id)} className="ty-link">{r.referrer.name}</TransitionLink> : r.referrer_name ?? "—"}</td>
                    <td>
                      <ReferralStatusText status={r.status} />
                      {r.status_note ? <span className="ty-small" style={{ display: "block" }}>{r.status_note}</span> : null}
                    </td>
                    <td><ReferralStatusControl id={r.id} current={r.status} action={adminSetReferralStatusAction} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty>Nenhuma indicação encerrada.</Empty>
        )}
      </AdminBlock>
    </>
  );
}
