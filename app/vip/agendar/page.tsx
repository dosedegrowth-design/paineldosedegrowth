import { requireClientPage } from "@/lib/auth/guards";
import { getAppointments, getAvailability } from "@/lib/queries/vip";
import { getSettings } from "@/lib/settings";
import { plural } from "@/lib/format";
import { BookingFlow } from "@/components/vip/booking-flow";
import { AppointmentList } from "@/components/vip/appointment-list";

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
        Marcar <em>horário</em>.
      </h1>
      <p className="tyv-sub">Escolha o serviço, o dia e a hora. A Tayssa confirma em seguida.</p>

      <section className="tyv-section">
        <BookingFlow
          services={services.map((s) => ({
            id: s.id,
            name: s.name,
            description: s.description,
            point_value: s.point_value,
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
            <h2 className="tyv-h2">Já passaram</h2>
          </div>
          <div className="tyv-panel">
            {appointments.past.slice(0, 5).map((a) => (
              <div key={a.id} className="tyv-row">
                <div>
                  <p style={{ fontSize: 15 }}>{a.service_name}</p>
                  <p className="tyv-sub" style={{ fontSize: 12.5 }}>
                    {a.scheduled_date.split("-").reverse().join("/")} · {a.scheduled_time.slice(0, 5)}
                  </p>
                </div>
                <span className="tyv-badge tyv-badge--quiet">
                  {a.status === "done" ? "Realizado" : a.status === "cancelled" ? "Cancelado" : "Encerrado"}
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
