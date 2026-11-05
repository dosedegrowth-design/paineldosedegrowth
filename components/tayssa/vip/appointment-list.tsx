"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cancelAppointmentAction } from "@/lib/tayssa/actions/booking";
import { dayLabel, dateLong, hhmm } from "@/lib/tayssa/format";
import { APPOINTMENT_STATUS_LABEL, type AppointmentRow } from "@/lib/tayssa/types";
import { mensagemAgendamento, prazoDoSinal, reais } from "@/lib/tayssa/agendar";
import { whatsappUrl } from "@/lib/tayssa/whatsapp";
import { ROUTES, publicUrl } from "@/lib/tayssa/config";
import { useTarefa } from "@/components/tayssa/ui/acao";
import { WhatsAppIcon } from "@/components/tayssa/ui/whatsapp";

/** O sinal: o pedido segura o horário `horas` esperando o Pix (a Tayssa confirma). */
export type SinalDaAgenda = { telefone: string; valor: number; horas: number; nome: string; tolerancia: number };

/** Horários em aberto: ver, e desmarcar sem precisar ligar para ninguém. */
export function AppointmentList({ items, sinal }: { items: AppointmentRow[]; sinal?: SinalDaAgenda }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feito, setFeito] = useState<string | null>(null);
  const [pending, start] = useTarefa();

  const cancel = (a: AppointmentRow) =>
    start(async () => {
      const r = await cancelAppointmentAction({ id: a.id });
      setConfirming(null);
      if (!r.ok) {
        setFeito(null);
        setError(r.error);
      } else {
        setError(null);
        setFeito(`Horário de ${dayLabel(a.scheduled_date)}, às ${hhmm(a.scheduled_time)}, desmarcado.`);
        router.refresh();
      }
    });

  return (
    <div>
      {/* o aviso fica mesmo quando a lista esvazia: a linha some e ela sabe por quê */}
      <p className="tyv-feito" role="status" hidden={!feito}>
        {feito}
      </p>
      {error ? (
        <div className="ty-form-error" role="alert" style={{ marginBottom: 12 }}>
          {error}
        </div>
      ) : null}
      {!items.length ? <p className="tyv-empty">Você não tem horário marcado. Que tal escolher um?</p> : null}
      {items.map((a) => {
        const dia = dayLabel(a.scheduled_date);
        // "hoje"/"amanhã" não dizem a data; o resto já diz e não se repete
        const relativo = dia === "hoje" || dia === "amanhã";
        return (
          <div key={a.id} className="tyv-row tyv-horario" style={{ alignItems: "flex-start" }}>
            <div>
              <p style={{ fontSize: 16 }}>
                {dia} · {hhmm(a.scheduled_time)}
              </p>
              <p className="tyv-sub" style={{ fontSize: 13 }}>
                {a.service_name}
                {relativo ? ` · ${dateLong(a.scheduled_date)}` : ""}
              </p>
              <span className={`tyv-badge ${a.status === "confirmed" ? "" : "tyv-badge--quiet"}`} style={{ marginTop: 8 }}>
                {APPOINTMENT_STATUS_LABEL[a.status]}
              </span>
              {/* pedido: guardado até o prazo do sinal; o botão leva ao WhatsApp dela pedindo a chave */}
              {a.status === "requested" && sinal ? (
                <div className="tyv-sinal">
                  <p className="tyv-sub" style={{ fontSize: 13 }}>
                    Guardado até {prazoDoSinal(a.created_at, sinal.horas).legivel}. Vale depois do sinal de{" "}
                    {reais(sinal.valor)} no Pix.
                  </p>
                  <a
                    className="tyv-sinal__btn"
                    href={whatsappUrl(
                      sinal.telefone,
                      mensagemAgendamento({
                        servico: a.service_name,
                        dia: a.scheduled_date,
                        hora: a.scheduled_time.slice(0, 5),
                        nome: sinal.nome,
                        sinal: sinal.valor,
                        link: publicUrl(ROUTES.horario(a.id)),
                      }),
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="tyv-sinal__logo" aria-hidden>
                      <WhatsAppIcon size={17} />
                    </span>
                    Pagar o sinal no WhatsApp
                  </a>
                </div>
              ) : null}
              {a.admin_note ? (
                <p className="tyv-sub" style={{ fontSize: 13, marginTop: 8 }}>
                  Tayssa: “{a.admin_note}”
                </p>
              ) : null}
            </div>
            {confirming === a.id ? null : (
              <button
                type="button"
                className="tyv-link"
                style={{ opacity: 0.7 }}
                onClick={() => {
                  setFeito(null);
                  setConfirming(a.id);
                }}
              >
                Desmarcar
              </button>
            )}
            {/* a confirmação abre numa linha própria, longe do primeiro toque:
                um toque duplo não desmarca sem querer */}
            {confirming === a.id ? (
              <div className="tyv-confirma" role="group" aria-label="Confirmar desmarcação">
                <p>Desmarcar este horário?</p>
                <div>
                  {/* o "Desmarcar" que tinha o foco saiu da tela: o foco cai no lado seguro */}
                  <button
                    type="button"
                    className="tyv-btn tyv-btn--ghost"
                    onClick={() => setConfirming(null)}
                    disabled={pending}
                    autoFocus
                  >
                    Manter
                  </button>
                  <button type="button" className="tyv-btn tyv-btn--accent" onClick={() => cancel(a)} disabled={pending}>
                    {pending ? "Desmarcando…" : "Sim, desmarcar"}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
