import { requireClientPage } from "@/lib/tayssa/auth/guards";
import { TomDoSite } from "@/components/tayssa/vip/tom-do-site";
import { getAjustesDaCliente, getClientServiceHistory } from "@/lib/tayssa/queries/client";
import { getActiveServices } from "@/lib/tayssa/queries/catalog";
import { logoutAction } from "@/lib/tayssa/actions/auth";
import { toISODate } from "@/lib/tayssa/rules";
import { dateLong, nowInBusinessTz, plural } from "@/lib/tayssa/format";
import { SERVICE_STATUS_LABEL, VIP_STATUS_LABEL } from "@/lib/tayssa/types";
import { getSettings } from "@/lib/tayssa/settings";
import { formatBrPhone } from "@/lib/tayssa/phone";
import { ChangePasswordForm, ProfileForm, SubmitServiceForm } from "@/components/tayssa/vip/forms";

type LinhaDoHistorico = { id: string; dia: string; correcao: boolean; titulo: string; sub: string; valor: string; apagado: boolean };

export default async function ProfilePage() {
  const user = await requireClientPage();
  const [history, ajustes, services, settings] = await Promise.all([
    getClientServiceHistory(user.id),
    getAjustesDaCliente(user.id),
    getActiveServices(),
    getSettings(),
  ]);
  // VIP fechado: o perfil é só dados, senha e sair (sem pontos, visitas e registro)
  const vipAberto = settings.rules.vip_aberto || user.isVip;
  const p = user.profile;
  const approved = history.filter((s) => s.status === "approved");
  // atendimentos e as correções de pontos da Tayssa, do mais novo ao mais
  // antigo; no mesmo dia a correção vem antes (foi feita depois da visita)
  const linhas: LinhaDoHistorico[] = [
    ...ajustes.map((a) => {
      const dia = toISODate(nowInBusinessTz(new Date(a.created_at)));
      return {
        id: `aj-${a.id}`,
        dia,
        correcao: true,
        titulo: a.service_name,
        sub: `${dateLong(dia)} · correção da Tayssa`,
        valor: a.points > 0 ? `+${a.points}` : `−${Math.abs(a.points)}`,
        apagado: a.points < 0,
      };
    }),
    ...history.map((s) => ({
      id: s.id,
      dia: s.service_date,
      correcao: false,
      titulo: s.service_name,
      sub: `${dateLong(s.service_date)} · ${SERVICE_STATUS_LABEL[s.status]}`,
      valor: s.status === "approved" ? `+${s.points}` : "—",
      apagado: s.status !== "approved",
    })),
  ].sort((a, b) => b.dia.localeCompare(a.dia) || Number(b.correcao) - Number(a.correcao));

  return (
    <>
      {/* a agenda e a conta ficam na paleta do site (vip-site.css), sem o dourado do VIP */}
      <TomDoSite />
      <h1 className="tyv-hello">{user.displayName}</h1>
      <p className="tyv-sub">
        {vipAberto ? `${p ? VIP_STATUS_LABEL[p.vip_status] : "Cliente"} · ` : ""}
        {user.email ?? formatBrPhone(user.phone)}
      </p>

      {vipAberto ? (
        <section className="tyv-section">
          <div className="tyv-panel">
            <div className="tyv-row">
              <span className="tyv-label">Aniversário</span>
              <span style={{ fontSize: 15 }}>{p?.birthday ? dateLong(p.birthday) : "não cadastrado"}</span>
            </div>
            <div className="tyv-row">
              <span className="tyv-label">VIP desde</span>
              <span style={{ fontSize: 15 }}>{p?.vip_since ? dateLong(p.vip_since, true) : "ainda não"}</span>
            </div>
            <div className="tyv-row">
              <span className="tyv-label">Visitas confirmadas</span>
              <span className="tyv-num" style={{ fontSize: 20 }}>
                {approved.length}
              </span>
            </div>
          </div>
        </section>
      ) : null}

      <section className="tyv-section">
        <div className="tyv-section-head">
          <h2 className="tyv-h2">Meus dados</h2>
        </div>
        <div className="tyv-panel">
          <ProfileForm nickname={user.nickname} phone={user.phone} />
        </div>
      </section>

      {vipAberto ? (
        <>
          <section className="tyv-section">
            <div className="tyv-section-head">
              <h2 className="tyv-h2">Histórico</h2>
              <span className="tyv-label">
                {linhas.length} {plural(linhas.length, "registro", "registros")}
              </span>
            </div>
            <div className="tyv-panel">
              {linhas.length ? (
                linhas.slice(0, 12).map((l) => (
                  <div key={l.id} className="tyv-row">
                    <div>
                      <p style={{ fontSize: 15 }}>{l.titulo}</p>
                      <p className="tyv-sub" style={{ fontSize: 12.5 }}>
                        {l.sub}
                      </p>
                    </div>
                    <span
                      className="tyv-num"
                      style={{
                        fontSize: 18,
                        opacity: l.apagado ? 0.45 : 1,
                      }}
                    >
                      {l.valor}
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
              <SubmitServiceForm services={services} todayISO={toISODate(nowInBusinessTz())} />
            </div>
          </section>
        </>
      ) : null}

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
