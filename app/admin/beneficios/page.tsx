import { requireAdminPage } from "@/lib/auth/guards";
import { listClientBenefits, type ClientBenefitWithClient } from "@/lib/queries/admin";
import { getSettings } from "@/lib/settings";
import { ROUTES } from "@/lib/config";
import { dateShort } from "@/lib/format";
import {
  adminApproveBenefitRequestAction,
  adminRedeemBenefitAction,
  adminRejectBenefitAction,
  adminValidateBenefitAction,
} from "@/lib/actions/benefits";
import { AdminBlock, AdminHeader, Empty } from "@/components/admin/shell";
import { ActionButton, NoteAction } from "@/components/admin/controls";
import { BenefitStatusText } from "@/components/ui/status";
import { TransitionLink } from "@/components/ui/transition";

export default async function BenefitsAdminPage() {
  await requireAdminPage();
  const [all, settings] = await Promise.all([listClientBenefits(), getSettings()]);
  const toValidate = all.filter((b) => b.status === "pending_validation");
  const requested = all.filter((b) => b.status === "requested");
  const live = all.filter((b) => ["available", "approved"].includes(b.status));
  const history = all.filter((b) => ["redeemed", "expired", "rejected"].includes(b.status)).slice(0, 60);
  const days = settings.rules.benefit_validity_days;

  const Row = ({ b, actions }: { b: ClientBenefitWithClient; actions: React.ReactNode }) => (
    <li style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 18, padding: "14px 0", borderTop: "1px solid var(--t-line)", alignItems: "start" }}>
      <div>
        <div style={{ display: "flex", gap: 12, alignItems: "baseline", flexWrap: "wrap" }}>
          <TransitionLink href={ROUTES.adminClient(b.client_id)} className="ty-link" style={{ fontSize: 16 }}>
            {b.client?.name ?? "Cliente"}
          </TransitionLink>
          <span>{b.title}</span>
          <BenefitStatusText status={b.status} />
        </div>
        <span className="ty-small" style={{ display: "block", marginTop: 4 }}>
          {b.benefit?.name ?? "—"} · {b.cycle_key} · {dateShort(b.created_at)}
          {b.expires_at ? ` · válido até ${dateShort(b.expires_at)}` : ""}
        </span>
        {b.client_note ? <span className="ty-small" style={{ display: "block", fontWeight: 300 }}>Ela: “{b.client_note}”</span> : null}
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>{actions}</div>
    </li>
  );

  return (
    <>
      <AdminHeader
        eyebrow="Benefícios"
        title={toValidate.length + requested.length ? <>{toValidate.length + requested.length} esperando <em>sua palavra</em></> : <>Tudo <em>em dia</em></>}
        lead="O sistema identifica elegibilidade; você valida. Nada é prometido à cliente antes disso."
      />

      <AdminBlock title="Elegíveis — validar" aside="alcançaram um marco; ao validar, aparecem como desbloqueados para ela">
        {toValidate.length ? (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {toValidate.map((b) => (
              <Row
                key={b.id}
                b={b}
                actions={
                  <>
                    <NoteAction
                      action={adminValidateBenefitAction}
                      args={{ id: b.id }}
                      variant="accent"
                      label="Recado para ela (opcional)"
                      extra={<input className="ty-field__input" name="validity_days" defaultValue={String(days)} inputMode="numeric" aria-label="Validade em dias" style={{ fontSize: 13.5 }} />}
                    >
                      Validar e desbloquear
                    </NoteAction>
                    <NoteAction action={adminRejectBenefitAction} args={{ id: b.id }} label="Motivo (ela vê)">
                      Não liberar
                    </NoteAction>
                  </>
                }
              />
            ))}
          </ul>
        ) : (
          <Empty>Nenhum benefício aguardando validação.</Empty>
        )}
      </AdminBlock>

      <AdminBlock title="Solicitados — confirmar" aside="ela quer usar; confirme e ela agenda">
        {requested.length ? (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {requested.map((b) => (
              <Row
                key={b.id}
                b={b}
                actions={
                  <>
                    <ActionButton action={adminApproveBenefitRequestAction} args={{ id: b.id }} variant="solid">
                      Confirmar
                    </ActionButton>
                    <ActionButton action={adminRedeemBenefitAction} args={{ id: b.id }}>
                      Marcar utilizado
                    </ActionButton>
                    <NoteAction action={adminRejectBenefitAction} args={{ id: b.id }} label="Motivo (ela vê)">
                      Não liberar
                    </NoteAction>
                  </>
                }
              />
            ))}
          </ul>
        ) : (
          <Empty>Nenhuma solicitação aberta.</Empty>
        )}
      </AdminBlock>

      <AdminBlock title="Desbloqueados e confirmados" aside="marque como utilizado depois do atendimento">
        {live.length ? (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {live.map((b) => (
              <Row
                key={b.id}
                b={b}
                actions={
                  <>
                    <ActionButton action={adminRedeemBenefitAction} args={{ id: b.id }} variant="solid">
                      Marcar utilizado
                    </ActionButton>
                    <NoteAction action={adminRejectBenefitAction} args={{ id: b.id }} label="Motivo (ela vê)">
                      Cancelar
                    </NoteAction>
                  </>
                }
              />
            ))}
          </ul>
        ) : (
          <Empty>Nenhum benefício ativo no momento.</Empty>
        )}
      </AdminBlock>

      <AdminBlock title="Histórico">
        {history.length ? (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {history.map((b) => (
              <Row key={b.id} b={b} actions={null} />
            ))}
          </ul>
        ) : (
          <Empty>Nada no histórico ainda.</Empty>
        )}
      </AdminBlock>
    </>
  );
}
