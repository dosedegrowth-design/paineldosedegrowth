import { requireAdminPage } from "@/lib/tayssa/auth/guards";
import { listServices } from "@/lib/tayssa/queries/admin";
import { ROUTES } from "@/lib/tayssa/config";
import { currency, dateShort, dateTime } from "@/lib/tayssa/format";
import { adminReviewServiceAction } from "@/lib/tayssa/actions/services";
import { AdminBlock, AdminHeader, Empty } from "@/components/tayssa/admin/shell";
import { ActionButton, NoteAction } from "@/components/tayssa/admin/controls";
import { ServiceStatusText } from "@/components/tayssa/ui/status";
import { TransitionLink } from "@/components/tayssa/ui/transition";

export default async function ServicesAdminPage() {
  await requireAdminPage();
  const [pending, all] = await Promise.all([listServices("pending"), listServices("all")]);
  const recent = all.filter((s) => s.status !== "pending").slice(0, 40);

  return (
    <>
      <AdminHeader
        eyebrow="Atendimentos"
        title={pending.length ? <>{pending.length} a <em>confirmar</em></> : <>Nada a <em>confirmar</em></>}
        lead="Registros enviados pelas clientes. Só depois da sua confirmação os pontos entram na jornada."
      />

      <AdminBlock title="Aguardando você">
        {pending.length ? (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {pending.map((s) => (
              <li key={s.id} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 18, padding: "16px 0", borderTop: "1px solid var(--t-line)", alignItems: "start" }}>
                <div>
                  <TransitionLink href={ROUTES.adminClient(s.client_id)} className="ty-link" style={{ fontSize: 16 }}>
                    {s.client?.name ?? "Cliente"}
                  </TransitionLink>
                  <span style={{ display: "block", marginTop: 4 }}>
                    {s.service_name} · {dateShort(s.service_date)}
                    {s.amount != null ? ` · ${currency(s.amount)}` : ""} · {s.points} pts
                  </span>
                  {s.notes ? <span className="ty-small" style={{ display: "block", fontStyle: "italic" }}>“{s.notes}”</span> : null}
                  <span className="ty-small" style={{ display: "block" }}>enviado {dateTime(s.submitted_at)}</span>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  <ActionButton action={adminReviewServiceAction} args={{ id: s.id, decision: "approve" as const }} variant="accent">
                    Confirmar
                  </ActionButton>
                  <NoteAction action={adminReviewServiceAction} args={{ id: s.id, decision: "reject" as const }} label="Motivo (ela vê)">
                    Não confirmar
                  </NoteAction>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <Empty>Nenhum registro aguardando confirmação.</Empty>
        )}
      </AdminBlock>

      <AdminBlock title="Recentes">
        {recent.length ? (
          <div className="ty-table-wrap">
            <table className="ty-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Cliente</th>
                  <th>Serviço</th>
                  <th>Pontos</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((s) => (
                  <tr key={s.id}>
                    <td className="ty-num">{dateShort(s.service_date)}</td>
                    <td>
                      <TransitionLink href={ROUTES.adminClient(s.client_id)} className="ty-link">{s.client?.name ?? "—"}</TransitionLink>
                    </td>
                    <td>{s.service_name}</td>
                    <td className="ty-num">{s.points}</td>
                    <td><ServiceStatusText status={s.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty>Ainda não há atendimentos.</Empty>
        )}
      </AdminBlock>
    </>
  );
}
