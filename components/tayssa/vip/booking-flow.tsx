"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { createAppointmentAction } from "@/lib/tayssa/actions/booking";
import { dateLong, dayLabel, plural, weekdayShort } from "@/lib/tayssa/format";
import { TyTextarea } from "@/components/tayssa/ui/field";

export type BookingService = { id: string; name: string; description: string | null; point_value: number };
export type BookingDay = { iso: string; slots: { time: string; available: boolean }[] };

const STEPS = ["Serviço", "Dia e horário", "Confirmar"];

/**
 * Marcar horário sem sair daqui: serviço, dia, hora, confirmar.
 * Um passo por tela, sempre com volta. O pedido nasce "aguardando
 * confirmação" — quem fecha a agenda é a Tayssa.
 */
export function BookingFlow({
  services,
  days,
  atLimit = false,
  limitMessage,
  onDone,
}: {
  services: BookingService[];
  days: BookingDay[];
  /** já atingiu o limite de horários em aberto */
  atLimit?: boolean;
  limitMessage?: string;
  onDone?: () => void;
}) {
  const router = useRouter();
  const reduced = useReducedMotion();
  const [step, setStep] = useState(0);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ date: string; time: string; serviceName: string } | null>(null);
  const [pending, start] = useTransition();

  const service = services.find((s) => s.id === serviceId) ?? null;
  const day = days.find((d) => d.iso === date) ?? null;
  const openDays = useMemo(() => days.filter((d) => d.slots.some((s) => s.available)), [days]);

  const pick = (fn: () => void) => {
    setError(null);
    fn();
  };

  const confirm = () => {
    if (!serviceId || !date || !time) return;
    setError(null);
    start(async () => {
      const r = await createAppointmentAction({ service_id: serviceId, date, time, note: note.trim() || undefined });
      if (!r.ok) {
        setError(r.error);
        return;
      }
      setDone({ date: r.data.date, time: r.data.time, serviceName: r.data.serviceName });
      router.refresh();
      onDone?.();
    });
  };

  if (done) {
    return (
      <motion.div
        className="tyv-panel"
        initial={{ opacity: 0, y: reduced ? 0 : 12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: "center", padding: "30px 20px" }}
      >
        <span className="tyv-label">Pedido enviado</span>
        <h2 className="tyv-h2" style={{ margin: "12px 0 8px" }}>
          {dayLabel(done.date)}, às {done.time}.
        </h2>
        <p className="tyv-sub" style={{ fontSize: 14 }}>
          {done.serviceName} · {dateLong(done.date, true)}
        </p>
        <p className="tyv-sub" style={{ fontSize: 13.5, marginTop: 14 }}>
          A Tayssa confirma o horário e você vê aqui como confirmado.
        </p>
        <div className="tyv-stack" style={{ marginTop: 22 }}>
          {atLimit ? null : (
          <button
            type="button"
            className="tyv-btn tyv-btn--ghost"
            onClick={() => {
              setDone(null);
              setStep(0);
              setServiceId(null);
              setDate(null);
              setTime(null);
              setNote("");
            }}
          >
            Marcar outro
          </button>
          )}
        </div>
      </motion.div>
    );
  }

  if (atLimit) {
    return (
      <div className="tyv-panel">
        <p className="tyv-empty">{limitMessage ?? "Desmarque um horário para escolher outro."}</p>
      </div>
    );
  }

  if (!services.length || !openDays.length) {
    return (
      <div className="tyv-panel">
        <p className="tyv-empty">
          A agenda está fechada no momento. Fale com a Tayssa pelo WhatsApp que ela abre um horário para você.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="tyv-steps" aria-hidden>
        {STEPS.map((s, i) => (
          <i key={s} data-on={i <= step} />
        ))}
      </div>
      <div className="tyv-section-head" style={{ marginBottom: 16 }}>
        <h2 className="tyv-h2">{STEPS[step]}</h2>
        {step > 0 ? (
          <button type="button" className="tyv-link" style={{ opacity: 0.7 }} onClick={() => setStep((s) => s - 1)}>
            Voltar
          </button>
        ) : null}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: reduced ? 0 : 18 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: reduced ? 0 : -18 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        >
          {step === 0 ? (
            <div className="tyv-stack">
              {services.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className="tyv-choice"
                  aria-pressed={serviceId === s.id}
                  onClick={() =>
                    pick(() => {
                      setServiceId(s.id);
                      setStep(1);
                    })
                  }
                >
                  <span>
                    <span className="tyv-choice__t">{s.name}</span>
                    {s.description ? <span className="tyv-choice__s">{s.description}</span> : null}
                  </span>
                  <span className="tyv-check" aria-hidden />
                </button>
              ))}
            </div>
          ) : null}

          {step === 1 ? (
            <div>
              <div className="tyv-days" role="group" aria-label="Escolha o dia">
                {openDays.map((d) => (
                  <button
                    key={d.iso}
                    type="button"
                    className="tyv-day"
                    aria-pressed={date === d.iso}
                    onClick={() =>
                      pick(() => {
                        setDate(d.iso);
                        setTime(null);
                      })
                    }
                  >
                    <span className="tyv-day__w">{weekdayShort(d.iso)}</span>
                    <span className="tyv-day__d">{d.iso.slice(8, 10)}</span>
                  </button>
                ))}
              </div>

              {day ? (
                <>
                  <p className="tyv-label" style={{ margin: "16px 0 10px" }}>
                    {dayLabel(day.iso)} · {day.slots.filter((s) => s.available).length}{" "}
                    {plural(day.slots.filter((s) => s.available).length, "horário livre", "horários livres")}
                  </p>
                  <div className="tyv-slots" role="group" aria-label="Escolha o horário">
                    {day.slots.map((s) => (
                      <button
                        key={s.time}
                        type="button"
                        className="tyv-slot"
                        disabled={!s.available}
                        aria-pressed={time === s.time}
                        onClick={() =>
                          pick(() => {
                            setTime(s.time);
                            setStep(2);
                          })
                        }
                      >
                        {s.time}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <p className="tyv-sub" style={{ marginTop: 16 }}>
                  Escolha um dia para ver os horários.
                </p>
              )}
            </div>
          ) : null}

          {step === 2 && service && date && time ? (
            <div>
              <div className="tyv-panel">
                <div className="tyv-row">
                  <span className="tyv-label">Serviço</span>
                  <span style={{ fontSize: 16 }}>{service.name}</span>
                </div>
                <div className="tyv-row">
                  <span className="tyv-label">Dia</span>
                  <span style={{ fontSize: 16 }}>{dateLong(date)}</span>
                </div>
                <div className="tyv-row">
                  <span className="tyv-label">Horário</span>
                  <span style={{ fontSize: 16 }}>{time}</span>
                </div>
              </div>
              <div style={{ marginTop: 18 }}>
                <TyTextarea
                  label="Quer deixar um recado? (opcional)"
                  name="note"
                  rows={2}
                  maxLength={300}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
              {error ? (
                <div className="ty-form-error" role="alert" style={{ marginTop: 14 }}>
                  {error}
                </div>
              ) : null}
              <div className="tyv-stack" style={{ marginTop: 18 }}>
                <button type="button" className="tyv-btn tyv-btn--accent" onClick={confirm} disabled={pending}>
                  {pending ? "Enviando…" : "Confirmar horário"}
                </button>
              </div>
            </div>
          ) : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
