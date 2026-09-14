import { requireClientPage } from "@/lib/tayssa/auth/guards";
import { getClientServiceHistory } from "@/lib/tayssa/queries/client";
import { getActiveServices } from "@/lib/tayssa/queries/catalog";
import { logoutAction } from "@/lib/tayssa/actions/auth";
import { toISODate } from "@/lib/tayssa/rules";
import { dateLong } from "@/lib/tayssa/format";
import { SERVICE_STATUS_LABEL, VIP_STATUS_LABEL } from "@/lib/tayssa/types";
import { ChangePasswordForm, ProfileForm, SubmitServiceForm } from "@/components/tayssa/vip/forms";

export default async function ProfilePage() {
  const user = await requireClientPage();
  const [history, services] = await Promise.all([getClientServiceHistory(user.id), getActiveServices()]);
  const p = user.profile;
  const approved = history.filter((s) => s.status === "approved");

  return (
    <>
      <h1 className="tyv-hello">{user.displayName}</h1>
      <p className="tyv-sub">{p ? VIP_STATUS_LABEL[p.vip_status] : "Cliente"} · {user.email}</p>

      <section className="tyv-section">
        <div className="tyv-panel">
          <div className="tyv-row">
            <span className="tyv-label">Aniversário</span>
            <span style={{ fontSize: 15 }}>{p?.birthday ? dateLong(p.birthday) : "não cadastrado"}</span>
          </div>
          <div className="tyv-row">
            <span className="tyv-label">VIP desde</span>
            <span style={{ fontSize: 15 }}>{p?.vip_since ? dateLong(p.vip_since, true) : "—"}</span>
          </div>
          <div className="tyv-row">
            <span className="tyv-label">Visitas confirmadas</span>
            <span className="tyv-num" style={{ fontSize: 20 }}>
              {approved.length}
            </span>
          </div>
        </div>
      </section>

      <section className="tyv-section">
        <div className="tyv-section-head">
          <h2 className="tyv-h2">Meus dados</h2>
        </div>
        <div className="tyv-panel">
          <ProfileForm nickname={user.nickname} phone={user.phone} />
        </div>
      </section>

      <section className="tyv-section">
        <div className="tyv-section-head">
          <h2 className="tyv-h2">Histórico</h2>
          <span className="tyv-label">{history.length} registros</span>
        </div>
        <div className="tyv-panel">
          {history.length ? (
            history.slice(0, 12).map((s) => (
              <div key={s.id} className="tyv-row">
                <div>
                  <p style={{ fontSize: 15 }}>{s.service_name}</p>
                  <p className="tyv-sub" style={{ fontSize: 12.5 }}>
                    {dateLong(s.service_date)} · {SERVICE_STATUS_LABEL[s.status]}
                  </p>
                </div>
                <span className="tyv-num" style={{ fontSize: 18, opacity: s.status === "approved" ? 1 : 0.45 }}>
                  {s.status === "approved" ? `+${s.points}` : "—"}
                </span>
              </div>
            ))
          ) : (
            <p className="tyv-empty">Seu histórico começa na primeira visita confirmada.</p>
          )}
        </div>
      </section>

      <section className="tyv-section">
        <div className="tyv-section-head">
          <h2 className="tyv-h2">Registrar visita</h2>
        </div>
        <div className="tyv-panel">
          <p className="tyv-sub" style={{ fontSize: 13.5, marginBottom: 18 }}>
            Esteve aqui e o atendimento não apareceu? Registre que a Tayssa confirma. Nada conta antes disso.
          </p>
          <SubmitServiceForm services={services} todayISO={toISODate(new Date())} />
        </div>
      </section>

      <section className="tyv-section">
        <div className="tyv-section-head">
          <h2 className="tyv-h2">Senha</h2>
        </div>
        <div className="tyv-panel">
          <ChangePasswordForm />
        </div>
      </section>

      <section className="tyv-section">
        <form action={logoutAction}>
          <button type="submit" className="tyv-btn tyv-btn--ghost">
            Sair da minha conta
          </button>
        </form>
      </section>
    </>
  );
}
