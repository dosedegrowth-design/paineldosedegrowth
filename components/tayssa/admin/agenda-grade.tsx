"use client";

import { useOptimistic, useState, useTransition } from "react";
import { TransitionLink } from "@/components/tayssa/ui/transition";
import { ROUTES } from "@/lib/tayssa/config";
import { adminAlternarDiaAction, adminAlternarHorarioAction } from "@/lib/tayssa/actions/agenda";
import type { CelulaAgenda, EstadoCelula, GradeAgenda } from "@/lib/tayssa/queries/admin";

const SEMANA = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

function civil(iso: string) {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(a, m - 1, d);
}

/** "12 – 18 de outubro" ou "28 de setembro – 4 de outubro" */
function rotuloSemana(de: string, ate: string) {
  const a = civil(de);
  const b = civil(ate);
  return a.getMonth() === b.getMonth()
    ? `${a.getDate()} – ${b.getDate()} de ${MESES[b.getMonth()]}`
    : `${a.getDate()} de ${MESES[a.getMonth()]} – ${b.getDate()} de ${MESES[b.getMonth()]}`;
}

/**
 * A agenda da semana, no desenho do Google Agenda: uma coluna por dia, uma
 * linha por horário. O horário livre a Tayssa fecha com um toque (e reabre
 * com outro); o que tem cliente mostra quem e o quê. Nada some — para a
 * cliente, fechado e ocupado aparecem riscados no agendamento.
 */
export function AgendaGrade({ grade }: { grade: GradeAgenda }) {
  const semanas: (typeof grade.dias)[] = [];
  for (let i = 0; i < grade.dias.length; i += 7) semanas.push(grade.dias.slice(i, i + 7));
  const [n, setN] = useState(0);
  const [erro, setErro] = useState<string | null>(null);
  const [, start] = useTransition();
  // o toque responde na hora; quando o servidor confirma, a grade nova chega e o otimista some
  const [mudancas, aplicar] = useOptimistic(
    new Map<string, EstadoCelula>(),
    (atual, lote: [string, EstadoCelula][]) => {
      const m = new Map(atual);
      for (const [k, v] of lote) m.set(k, v);
      return m;
    },
  );

  const semana = semanas[Math.min(n, semanas.length - 1)] ?? [];
  if (!semana.length) return null;
  const horas = [...new Set(semana.flatMap((d) => d.celulas.map((c) => c.hora)))].sort();
  const estadoDe = (dia: string, c: CelulaAgenda) => mudancas.get(`${dia}T${c.hora}`) ?? c.estado;

  const alternar = (dia: string, hora: string, fechar: boolean) => {
    setErro(null);
    start(async () => {
      aplicar([[`${dia}T${hora}`, fechar ? "fechado" : "livre"]]);
      const r = await adminAlternarHorarioAction({ dia, hora, fechar });
      if (!r.ok) setErro(r.error);
    });
  };
  const alternarDia = (dia: string, celulas: CelulaAgenda[], fechar: boolean) => {
    setErro(null);
    start(async () => {
      aplicar(
        celulas
          .filter((c) => (fechar ? estadoDe(dia, c) === "livre" : estadoDe(dia, c) === "fechado"))
          .map((c) => [`${dia}T${c.hora}`, fechar ? "fechado" : "livre"] as [string, EstadoCelula]),
      );
      const r = await adminAlternarDiaAction({ dia, fechar });
      if (!r.ok) setErro(r.error);
    });
  };

  return (
    <div className="tyag-grade">
      <div className="tyag-grade__barra">
        <div className="tyag-grade__nav">
          <button type="button" className="tyag-grade__seta" onClick={() => setN((v) => Math.max(0, v - 1))} disabled={n === 0} aria-label="Semana anterior">
            <svg viewBox="0 0 24 24" aria-hidden>
              <path d="M14.5 6 8.5 12l6 6" />
            </svg>
          </button>
          <button type="button" className="tyag-grade__hoje" onClick={() => setN(0)} disabled={n === 0}>
            Hoje
          </button>
          <button
            type="button"
            className="tyag-grade__seta"
            onClick={() => setN((v) => Math.min(semanas.length - 1, v + 1))}
            disabled={n >= semanas.length - 1}
            aria-label="Próxima semana"
          >
            <svg viewBox="0 0 24 24" aria-hidden>
              <path d="m9.5 6 6 6-6 6" />
            </svg>
          </button>
        </div>
        <h3 className="tyag-grade__titulo">{rotuloSemana(semana[0].iso, semana[semana.length - 1].iso)}</h3>
        <ul className="tyag-grade__legenda" aria-label="Legenda">
          <li data-tom="livre">Livre</li>
          <li data-tom="fechado">Fechado</li>
          <li data-tom="pedido">Pedido</li>
          <li data-tom="confirmado">Confirmado</li>
        </ul>
      </div>
      {erro ? (
        <p className="tya-err" role="alert">
          {erro}
        </p>
      ) : null}

      <div className="tyag-grade__rolo">
        <div className="tyag-grade__tabela" style={{ gridTemplateColumns: `52px repeat(${semana.length}, minmax(104px, 1fr))` }} role="grid">
          <div className="tyag-grade__canto" />
          {semana.map((d) => {
            const dt = civil(d.iso);
            const futuro = d.aberto && d.iso >= grade.hoje;
            const livres = d.celulas.filter((c) => estadoDe(d.iso, c) === "livre").length;
            const fechadas = d.celulas.filter((c) => estadoDe(d.iso, c) === "fechado").length;
            return (
              <div key={d.iso} className="tyag-grade__dia" data-hoje={d.iso === grade.hoje || undefined} data-folga={!d.aberto || undefined} role="columnheader">
                <span className="tyag-grade__sem">{SEMANA[dt.getDay()]}</span>
                <span className="tyag-grade__num">{dt.getDate()}</span>
                {futuro && (livres || fechadas) ? (
                  <button type="button" className="tyag-grade__diaacao" onClick={() => alternarDia(d.iso, d.celulas, livres > 0)}>
                    {livres > 0 ? "Fechar dia" : "Abrir dia"}
                  </button>
                ) : (
                  <span className="tyag-grade__diaacao tyag-grade__diaacao--quieto">{d.aberto ? " " : "Folga"}</span>
                )}
              </div>
            );
          })}

          {horas.map((hora) => (
            <Linha key={hora} hora={hora} semana={semana} estadoDe={estadoDe} alternar={alternar} />
          ))}
        </div>
      </div>
      <p className="tya-small tyag-grade__dica">
        Toque num horário livre para fechar; toque de novo para reabrir. A cliente continua vendo o horário, riscado.
        A grade de horários de cada dia vem de Configurações → Agenda.
      </p>
    </div>
  );
}

function Linha({
  hora,
  semana,
  estadoDe,
  alternar,
}: {
  hora: string;
  semana: GradeAgenda["dias"];
  estadoDe: (dia: string, c: CelulaAgenda) => EstadoCelula;
  alternar: (dia: string, hora: string, fechar: boolean) => void;
}) {
  return (
    <>
      <div className="tyag-grade__hora" role="rowheader">
        {hora}
      </div>
      {semana.map((d) => {
        const c = d.celulas.find((x) => x.hora === hora);
        if (!c) return <div key={d.iso} className="tyag-grade__cel" data-estado="folga" />;
        const estado = estadoDe(d.iso, c);
        if (c.consultas.length) {
          return (
            <div key={d.iso} className="tyag-grade__cel" data-estado={estado}>
              {c.consultas.map((q) => {
                const conteudo = (
                  <>
                    <b>{q.nome}</b>
                    <span>{q.servico}</span>
                    <i>{q.status === "requested" ? "pedido" : q.status === "done" ? "realizado" : "confirmado"}</i>
                  </>
                );
                return q.clienteId ? (
                  <TransitionLink key={q.id} href={ROUTES.adminClient(q.clienteId)} className="tyag-grade__consulta" data-status={q.status}>
                    {conteudo}
                  </TransitionLink>
                ) : (
                  <span key={q.id} className="tyag-grade__consulta" data-status={q.status}>
                    {conteudo}
                  </span>
                );
              })}
            </div>
          );
        }
        if (estado === "livre" || estado === "fechado") {
          const fechado = estado === "fechado";
          return (
            <div key={d.iso} className="tyag-grade__cel" data-estado={estado}>
              <button
                type="button"
                className="tyag-grade__vaga"
                aria-pressed={!fechado}
                aria-label={`${hora}, ${fechado ? "fechado — tocar para abrir" : "livre — tocar para fechar"}`}
                onClick={() => alternar(d.iso, hora, !fechado)}
              >
                <span className="tyag-grade__marca" aria-hidden>
                  {fechado ? (
                    <svg viewBox="0 0 24 24">
                      <path d="M6 6l12 12M18 6 6 18" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24">
                      <path d="m5 12.5 4.5 4.5L19 7.5" />
                    </svg>
                  )}
                </span>
                {fechado ? "Fechado" : "Livre"}
              </button>
            </div>
          );
        }
        return <div key={d.iso} className="tyag-grade__cel" data-estado={estado} />;
      })}
    </>
  );
}
