import { dateLong, hhmm } from "@/lib/tayssa/format";
import type { AppointmentRow } from "@/lib/tayssa/types";

/** O que aconteceu com quem não chegou a ser feito (cancelado, faltou, ninguém confirmou). */
function comoTerminou(a: AppointmentRow): string {
  if (a.status === "cancelled") return "Cancelado";
  if (a.status === "no_show") return "Não compareceu";
  if (a.status === "requested") return "Não confirmado";
  return "Encerrado";
}

/**
 * A aba "Realizados" de Meus agendamentos: cada atendimento feito é um
 * cartão riscado, como item cumprido de uma lista (pedido do Lucas,
 * 05/11/2026), com a moeda de ouro do "feito". Embaixo, mais apagado, o que
 * não aconteceu, para ela não perder o fio.
 */
export function ListaRealizados({ feitos, outros }: { feitos: AppointmentRow[]; outros: AppointmentRow[] }) {
  if (!feitos.length && !outros.length) {
    return (
      <div className="tyv-panel">
        <p className="tyv-empty">Os seus atendimentos realizados aparecem aqui, um embaixo do outro.</p>
      </div>
    );
  }
  return (
    <>
      {feitos.length ? (
        <ol className="tyv-realizados" aria-label="Atendimentos realizados">
          {feitos.map((a) => (
            <li key={a.id} className="tyv-realizado">
              <span className="tyv-realizado__marca" aria-hidden>
                <svg viewBox="0 0 24 24">
                  <path d="M5 12.5l4.2 4.2L19 7" />
                </svg>
              </span>
              <span className="tyv-realizado__txt">
                <span className="tyv-realizado__nome">{a.service_name}</span>
                <span className="tyv-realizado__quando">
                  {dateLong(a.scheduled_date)} · {hhmm(a.scheduled_time)}
                </span>
              </span>
              <span className="tyv-realizado__selo">Realizado</span>
            </li>
          ))}
        </ol>
      ) : (
        <div className="tyv-panel">
          <p className="tyv-empty">Ainda nenhum atendimento realizado. O primeiro aparece aqui assim que a Tayssa fechar.</p>
        </div>
      )}

      {outros.length ? (
        <section className="tyv-realizados__outros" aria-label="Cancelados e não confirmados">
          <h3 className="tyv-realizados__titulo">Cancelados e não confirmados</h3>
          <div className="tyv-panel">
            {outros.slice(0, 8).map((a) => (
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
