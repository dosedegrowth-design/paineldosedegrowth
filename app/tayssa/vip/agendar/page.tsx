import { requireClientPage } from "@/lib/tayssa/auth/guards";
import { getAppointments, getAvailability } from "@/lib/tayssa/queries/vip";
import { getSettings } from "@/lib/tayssa/settings";
import { dateLong, hhmm, plural } from "@/lib/tayssa/format";
import { ehManutencao, valorLegivel } from "@/lib/tayssa/agendar";
import type { AppointmentRow } from "@/lib/tayssa/types";
import { BookingFlow } from "@/components/tayssa/vip/booking-flow";
import { AppointmentList } from "@/components/tayssa/vip/appointment-list";

/** No histórico, cada horário diz como terminou (pedido que ninguém confirmou não é "encerrado"). */
function comoTerminou(a: AppointmentRow): string {
  if (a.status === "done") return "Realizado";
  if (a.status === "cancelled") return "Cancelado";
  if (a.status === "no_show") return "Não compareceu";
  if (a.status === "requested") return "Não confirmado";
  return "Confirmado";
}

export default async function BookPage() {
  const user = await requireClientPage();
  const [{ days, services }, appointments, settings] = await Promise.all([
    getAvailability(),
    getAppointments(user.id),
    getSettings(),
  ]);
  const max = settings.booking.max_open_per_client;
  const full = appointments.upcoming.length >= max;

  return (
    <>
      <h1 className="tyv-hello">
        {user.displayName}, <em>seu horário</em>.
      </h1>
      <p className="tyv-sub">Escolha o serviço, o dia e a hora. A Tayssa confirma em seguida.</p>

      <section className="tyv-section">
        <BookingFlow
          services={services.map((s) => ({
            id: s.id,
            name: s.name,
            description: s.description,
            point_value: s.point_value,
            // a manutenção do Fox eyes custa mais: a manutenção é "a partir de"
            precoLabel: valorLegivel(
              s.preco != null ? Number(s.preco) : null,
              ehManutencao(s.slug, s.name) ? services.map((v) => (v.preco_manutencao != null ? Number(v.preco_manutencao) : null)) : [],
            ),
            duracao: s.duration_min ?? settings.booking.default_duration_min,
          }))}
          days={days.map((d) => ({ iso: d.iso, slots: d.slots }))}
          atLimit={full}
          limitMessage={`Você já tem ${appointments.upcoming.length} ${plural(appointments.upcoming.length, "horário marcado", "horários marcados")}. Desmarque um abaixo para escolher outro.`}
        />
      </section>

      <section className="tyv-section">
        <div className="tyv-section-head">
          <h2 className="tyv-h2">Meus horários</h2>
          <span className="tyv-label">até {max} em aberto</span>
        </div>
        <div className="tyv-panel">
          <AppointmentList items={appointments.upcoming} />
        </div>
      </section>

      {appointments.past.length ? (
        <section className="tyv-section">
          <div className="tyv-section-head">
            <h2 className="tyv-h2">Histórico</h2>
          </div>
          <div className="tyv-panel">
            {appointments.past.slice(0, 5).map((a) => (
              <div key={a.id} className="tyv-row">
                <div>
                  <p style={{ fontSize: 15 }}>{a.service_name}</p>
                  <p className="tyv-sub" style={{ fontSize: 12.5 }}>
                    {dateLong(a.scheduled_date)} · {hhmm(a.scheduled_time)}
                    {a.status === "cancelled" && a.admin_note ? ` · ${a.admin_note}` : ""}
                  </p>
                </div>
                <span className="tyv-badge tyv-badge--quiet">{comoTerminou(a)}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
