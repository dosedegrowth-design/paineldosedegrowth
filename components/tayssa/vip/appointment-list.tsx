"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelAppointmentAction } from "@/lib/tayssa/actions/booking";
import { dayLabel, dateLong, hhmm } from "@/lib/tayssa/format";
import { APPOINTMENT_STATUS_LABEL, type AppointmentRow } from "@/lib/tayssa/types";

/** Horários em aberto: ver, e desmarcar sem precisar ligar para ninguém. */
export function AppointmentList({ items }: { items: AppointmentRow[] }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (!items.length) {
    return <p className="tyv-empty">Você não tem horário marcado. Que tal escolher um?</p>;
  }

  const cancel = (id: string) =>
    start(async () => {
      const r = await cancelAppointmentAction({ id });
      setConfirming(null);
      if (!r.ok) setError(r.error);
      else {
        setError(null);
        router.refresh();
      }
    });

  return (
    <div>
      {error ? (
        <div className="ty-form-error" role="alert" style={{ marginBottom: 12 }}>
          {error}
        </div>
      ) : null}
      {items.map((a) => (
        <div key={a.id} className="tyv-row" style={{ alignItems: "flex-start" }}>
          <div>
            <p style={{ fontSize: 16 }}>
              {dayLabel(a.scheduled_date)} · {hhmm(a.scheduled_time)}
            </p>
            <p className="tyv-sub" style={{ fontSize: 12.5 }}>
              {a.service_name} · {dateLong(a.scheduled_date)}
            </p>
            <span className={`tyv-badge ${a.status === "confirmed" ? "" : "tyv-badge--quiet"}`} style={{ marginTop: 8 }}>
              {APPOINTMENT_STATUS_LABEL[a.status]}
            </span>
          </div>
          {confirming === a.id ? (
            <div style={{ display: "grid", gap: 6, justifyItems: "end" }}>
              <button type="button" className="tyv-link" onClick={() => cancel(a.id)} disabled={pending}>
                {pending ? "…" : "Desmarcar"}
              </button>
              <button type="button" className="tyv-link" style={{ opacity: 0.6 }} onClick={() => setConfirming(null)}>
                Manter
              </button>
            </div>
          ) : (
            <button type="button" className="tyv-link" style={{ opacity: 0.65 }} onClick={() => setConfirming(a.id)}>
              Desmarcar
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
