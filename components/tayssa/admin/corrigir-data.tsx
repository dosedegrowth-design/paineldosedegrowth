"use client";

import { useState } from "react";
import { adminCorrigirDataHorarioAction, adminCorrigirDataVisitaAction } from "@/lib/tayssa/actions/appointments";
import { useAcao } from "@/components/tayssa/ui/acao";

/**
 * "Corrigir data" (Tayssa, 16/11/2026): abre ali mesmo o dia (e a hora, no
 * horário da agenda) e grava no registro que já existe. Nada é duplicado:
 * no horário realizado, a visita ligada muda junto; no atendimento da ficha,
 * o horário da agenda ligado muda junto.
 */
export function CorrigirData({
  id,
  data,
  hora,
  tipo,
}: {
  id: string;
  /** "AAAA-MM-DD" */
  data: string;
  /** "HH:MM" (só no horário da agenda) */
  hora?: string;
  tipo: "horario" | "visita";
}) {
  const [aberto, setAberto] = useState(false);
  const [dia, setDia] = useState(data);
  const [h, setH] = useState(hora?.slice(0, 5) ?? "");
  const [erro, setErro] = useState<string | null>(null);
  const [feito, setFeito] = useState(false);
  const [gravarHorario, pendenteHorario] = useAcao(adminCorrigirDataHorarioAction);
  const [gravarVisita, pendenteVisita] = useAcao(adminCorrigirDataVisitaAction);
  const pendente = pendenteHorario || pendenteVisita;

  if (!aberto) {
    return (
      <span className="tya-corrigir-data">
        <button
          type="button"
          className="tya-link tya-link--quiet"
          onClick={() => {
            setAberto(true);
            setFeito(false);
            setErro(null);
          }}
        >
          Corrigir data
        </button>
        {feito ? <span className="tya-ok"> Data corrigida.</span> : null}
      </span>
    );
  }

  const salvar = async () => {
    setErro(null);
    const r = tipo === "horario" ? await gravarHorario({ id, date: dia, time: h }) : await gravarVisita({ id, date: dia });
    if (!r.ok) {
      setErro(r.error);
      return;
    }
    setFeito(true);
    setAberto(false);
  };

  return (
    <div className="tya-corrigir-data tya-corrigir-data--aberto">
      <label className="tya-corrigir-data__campo">
        <span className="tya-label">Dia certo</span>
        <input className="tya-field" type="date" value={dia} onChange={(e) => setDia(e.target.value)} />
      </label>
      {tipo === "horario" ? (
        <label className="tya-corrigir-data__campo">
          <span className="tya-label">Hora</span>
          <input className="tya-field" type="time" step={1800} value={h} onChange={(e) => setH(e.target.value)} />
        </label>
      ) : null}
      <div className="tya-corrigir-data__acoes">
        <button type="button" className="tya-btn tya-btn--sm tya-btn--primary" disabled={pendente || !dia || (tipo === "horario" && !h)} onClick={salvar}>
          {pendente ? "Gravando…" : "Gravar a data"}
        </button>
        <button type="button" className="tya-btn tya-btn--sm tya-btn--ghost" onClick={() => setAberto(false)} disabled={pendente}>
          Cancelar
        </button>
      </div>
      {erro ? (
        <p className="tya-err" role="alert" style={{ margin: 0 }}>
          {erro}
        </p>
      ) : null}
    </div>
  );
}
