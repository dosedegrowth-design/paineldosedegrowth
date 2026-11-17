"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTarefa } from "@/components/tayssa/ui/acao";
import { WhatsAppIcon } from "@/components/tayssa/ui/whatsapp";
import { CorrigirData } from "@/components/tayssa/admin/corrigir-data";
import { ROUTES } from "@/lib/tayssa/config";
import { ESTADOS_VISUAIS, NOME_DO_ESTADO, dataVizinha, faixas, gradeDoMes, hhmmDe, minutos, seCruzam } from "@/lib/tayssa/agenda-visual";
import { FORMAS, LISTA_FORMAS, SITUACAO_PAGAMENTO, brl, lerNumero, type FormaPagamento } from "@/lib/tayssa/financeiro";
import { duracaoLegivel } from "@/lib/tayssa/agendar";
import { whatsappUrl } from "@/lib/tayssa/whatsapp";
import { bateBusca } from "@/lib/tayssa/busca";
import { formatBrPhone } from "@/lib/tayssa/phone";
import { adminCriarAgendamentoAction, adminEditarAgendamentoAction, adminQuitarAtendimentoAction } from "@/lib/tayssa/actions/gestao";
import {
  adminCancelAppointmentAction,
  adminCompleteAppointmentAction,
  adminConfirmAppointmentAction,
  adminNoShowAppointmentAction,
} from "@/lib/tayssa/actions/appointments";
import { adminAlternarHorarioAction } from "@/lib/tayssa/actions/agenda";
import type { AgendaVisao, ConsultaAgenda, DiaDaAgendaPainel } from "@/lib/tayssa/queries/gestao";

/**
 * A agenda do painel (17/11/2026), no jeito simples do app Tua Agenda: o dia
 * em linha do tempo, a semana e o mês; tocar num horário livre marca, tocar
 * num agendamento mostra tudo e as ações (confirmar, remarcar, cancelar,
 * realizado com o pagamento). As cores são as da casa.
 */

export type ServicoParaAgenda = { id: string; nome: string; preco: number | null; duracao: number | null };
export type ClienteParaAgenda = { id: string; nome: string; apelido: string | null; telefone: string | null };
type Vista = "dia" | "semana" | "mes";

const SEM = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const SEM_LONGO = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
const MES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const ALTURA_HORA = 64;

function partes(iso: string) {
  const [a, m, d] = iso.split("-").map(Number);
  return { a, m, d, sem: new Date(Date.UTC(a, m - 1, d)).getUTCDay() };
}
function rotuloDia(iso: string) {
  const p = partes(iso);
  return `${SEM_LONGO[p.sem]}, ${p.d} de ${MES[p.m - 1]}`;
}
function hora12(hhmm: string) {
  const [h, m] = hhmm.split(":");
  return m === "00" ? `${Number(h)}h` : `${Number(h)}h${m}`;
}
function tituloDaVista(v: Vista, data: string, de: string, ate: string, hoje: string) {
  if (v === "dia") {
    // curto, para caber numa linha no celular (a fita da semana embaixo já diz o dia)
    const p = partes(data);
    const dia = `${String(p.d).padStart(2, "0")}/${String(p.m).padStart(2, "0")}`;
    return data === hoje ? `Hoje, ${dia}` : `${SEM_LONGO[p.sem].charAt(0).toUpperCase()}${SEM_LONGO[p.sem].slice(1)}, ${dia}`;
  }
  if (v === "mes") {
    const p = partes(data);
    return `${MES[p.m - 1].charAt(0).toUpperCase()}${MES[p.m - 1].slice(1)} de ${p.a}`;
  }
  const a = partes(de);
  const b = partes(ate);
  return a.m === b.m ? `${a.d} a ${b.d} de ${MES[b.m - 1]}` : `${a.d} de ${MES[a.m - 1]} a ${b.d} de ${MES[b.m - 1]}`;
}

/** A visão que ela usou por último fica lembrada neste aparelho (o servidor lê o cookie). */
function lembrarVista(v: Vista) {
  try {
    document.cookie = `tya_agenda_vista=${v}; path=/; max-age=31536000; samesite=lax`;
  } catch {
    /* sem cookie, só não lembra */
  }
}

/** Os horários da grade daquele dia em que dá para começar agora (nada em cima, não fechado, não passou). */
function livresDoDia(dia: DiaDaAgendaPainel, consultas: ConsultaAgenda[], hoje: string, agoraMin: number): string[] {
  if (dia.iso < hoje) return [];
  const ocupam = consultas.filter((c) => c.data === dia.iso && c.status !== "cancelled" && c.status !== "no_show");
  return dia.horarios.filter((h) => {
    const m = minutos(h);
    if (dia.iso === hoje && m <= agoraMin) return false;
    if (dia.fechados.includes(h)) return false;
    return !ocupam.some((c) => seCruzam({ ini: m, dur: 30 }, { ini: minutos(c.hora), dur: c.duracao }));
  });
}

type Folha =
  | { tipo: "novo"; data: string; hora: string }
  | { tipo: "ver"; id: string }
  | { tipo: "editar"; id: string }
  | { tipo: "livre"; data: string; hora: string; fechado: boolean };

export function AgendaCalendario({
  visao,
  servicos,
  clientes,
  sinal,
  abrirNovo,
  abrirId,
}: {
  visao: AgendaVisao;
  servicos: ServicoParaAgenda[];
  clientes: ClienteParaAgenda[];
  sinal: number;
  abrirNovo: { data: string; hora: string } | null;
  abrirId: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname() ?? ROUTES.adminAgenda;
  const params = useSearchParams();
  const [folha, setFolha] = useState<Folha | null>(abrirNovo ? { tipo: "novo", ...abrirNovo } : abrirId ? { tipo: "ver", id: abrirId } : null);
  const [erro, setErro] = useState<string | null>(null);
  const [, iniciar] = useTarefa();
  const href = (v: Vista, data: string) => `${pathname}?vista=${v}&data=${data}`;
  const consulta = (id: string) => visao.consultas.find((c) => c.id === id) ?? null;
  const fechar = () => {
    setFolha(null);
    // a folha aberta pelo endereço (?ver=, ?novo=) não volta ao recarregar
    if (params?.get("ver") || params?.get("novo")) {
      const p = new URLSearchParams(params.toString());
      p.delete("ver");
      p.delete("novo");
      router.replace(`${pathname}?${p.toString()}`, { scroll: false });
    }
  };

  const alternarHorario = (dia: string, hora: string, fecharHorario: boolean) => {
    setErro(null);
    iniciar(async () => {
      const r = await adminAlternarHorarioAction({ dia, hora, fechar: fecharHorario });
      if (!r.ok) setErro(r.error);
      else setFolha(null);
    });
  };

  const titulo = tituloDaVista(visao.vista, visao.data, visao.de, visao.ate, visao.hoje);
  const anterior = dataVizinha(visao.vista, visao.data, -1);
  const seguinte = dataVizinha(visao.vista, visao.data, 1);

  return (
    <div className="tyac">
      <div className="tyac__barra">
        <div className="tyac__vistas" role="tablist" aria-label="Ver a agenda por">
          {(["dia", "semana", "mes"] as Vista[]).map((v) => (
            <Link
              key={v}
              href={href(v, visao.data)}
              scroll={false}
              prefetch={false}
              role="tab"
              aria-selected={visao.vista === v}
              className="tyac__vista"
              data-on={visao.vista === v || undefined}
              onClick={() => lembrarVista(v)}
            >
              {v === "dia" ? "Dia" : v === "semana" ? "Semana" : "Mês"}
            </Link>
          ))}
        </div>
        <button type="button" className="tya-btn tya-btn--primary tyac__novo" onClick={() => setFolha({ tipo: "novo", data: visao.data < visao.hoje ? visao.hoje : visao.data, hora: "" })}>
          <svg viewBox="0 0 24 24" aria-hidden>
            <path d="M12 5v14M5 12h14" />
          </svg>
          Novo agendamento
        </button>
      </div>

      <div className="tyac__nav">
        <Link href={href(visao.vista, anterior)} scroll={false} prefetch={false} className="tyac__seta" aria-label="Anterior">
          <svg viewBox="0 0 24 24" aria-hidden>
            <path d="M14.5 6 8.5 12l6 6" />
          </svg>
        </Link>
        <h3 className="tyac__titulo">
          <span className="tyac__flor" aria-hidden />
          {titulo}
        </h3>
        <Link href={href(visao.vista, seguinte)} scroll={false} prefetch={false} className="tyac__seta" aria-label="Próximo">
          <svg viewBox="0 0 24 24" aria-hidden>
            <path d="m9.5 6 6 6-6 6" />
          </svg>
        </Link>
        <Link href={href(visao.vista, visao.hoje)} scroll={false} prefetch={false} className="tyac__hoje" aria-disabled={visao.data === visao.hoje || undefined}>
          Hoje
        </Link>
        <label className="tyac__ir">
          <span className="tya-sr">Ir para a data</span>
          <input
            type="date"
            value={visao.data}
            onChange={(e) => {
              if (/^\d{4}-\d{2}-\d{2}$/.test(e.target.value)) router.push(href(visao.vista, e.target.value), { scroll: false });
            }}
          />
        </label>
      </div>

      {visao.vista === "dia" ? <FitaDaSemana visao={visao} href={href} /> : null}

      {erro ? (
        <p className="tya-err" role="alert">
          {erro}
        </p>
      ) : null}

      {visao.vista === "dia" ? (
        <VistaDia visao={visao} aoLivre={(data, hora, fechado) => setFolha({ tipo: "livre", data, hora, fechado })} aoVer={(id) => setFolha({ tipo: "ver", id })} />
      ) : visao.vista === "semana" ? (
        <VistaSemana visao={visao} href={href} aoVer={(id) => setFolha({ tipo: "ver", id })} aoNovo={(data, hora) => setFolha({ tipo: "novo", data, hora })} />
      ) : (
        <VistaMes visao={visao} href={href} />
      )}

      <ul className="tyac__legenda" aria-label="Legenda">
        {ESTADOS_VISUAIS.map((e) => (
          <li key={e.id} data-estado={e.id}>
            {e.nome}
          </li>
        ))}
      </ul>

      {folha?.tipo === "livre" ? (
        <Folha titulo={`${hora12(folha.hora)} · ${rotuloDia(folha.data)}`} aoFechar={fechar}>
          <div className="tyac-acoes tyac-acoes--coluna">
            {!folha.fechado ? (
              <button type="button" className="tya-btn tya-btn--primary" onClick={() => setFolha({ tipo: "novo", data: folha.data, hora: folha.hora })}>
                Marcar um horário aqui
              </button>
            ) : null}
            <button type="button" className="tya-btn tya-btn--ghost" onClick={() => alternarHorario(folha.data, folha.hora, !folha.fechado)}>
              {folha.fechado ? "Abrir este horário" : "Fechar este horário (a cliente não marca)"}
            </button>
          </div>
        </Folha>
      ) : null}

      {folha?.tipo === "novo" ? (
        <Folha titulo="Novo agendamento" aoFechar={fechar}>
          <FormAgendamento
            modo="novo"
            visao={visao}
            servicos={servicos}
            clientes={clientes}
            inicial={{ data: folha.data, hora: folha.hora, servicoIds: [], duracao: "", valor: "", forma: "", observacoes: "" }}
            aoConcluir={(data) => {
              setFolha(null);
              if (data < visao.de || data > visao.ate) router.push(href("dia", data), { scroll: false });
            }}
          />
        </Folha>
      ) : null}

      {folha?.tipo === "ver" && consulta(folha.id) ? (
        <Folha titulo={consulta(folha.id)!.nome} aoFechar={fechar}>
          <Detalhes c={consulta(folha.id)!} hoje={visao.hoje} agoraMin={visao.agoraMin} sinal={sinal} aoEditar={() => setFolha({ tipo: "editar", id: folha.id })} aoTerminar={() => setFolha(null)} />
        </Folha>
      ) : null}

      {folha?.tipo === "editar" && consulta(folha.id) ? (
        <Folha titulo={`Editar · ${consulta(folha.id)!.nome}`} aoFechar={fechar}>
          <FormAgendamento
            modo="editar"
            id={folha.id}
            visao={visao}
            servicos={servicos}
            clientes={clientes}
            inicial={{
              data: consulta(folha.id)!.data,
              hora: consulta(folha.id)!.hora,
              servicoIds: consulta(folha.id)!.servicoIds,
              duracao: duracaoLegivel(consulta(folha.id)!.duracao) ?? "",
              valor: consulta(folha.id)!.valor != null ? String(consulta(folha.id)!.valor).replace(".", ",") : "",
              forma: consulta(folha.id)!.formaPrevista ?? "",
              observacoes: consulta(folha.id)!.notaTayssa ?? "",
            }}
            aoConcluir={(data) => {
              setFolha(null);
              if (data < visao.de || data > visao.ate) router.push(href(visao.vista, data), { scroll: false });
            }}
          />
        </Folha>
      ) : null}
    </div>
  );
}

// ------------------------------------------------------------
// Visões
// ------------------------------------------------------------

function FitaDaSemana({ visao, href }: { visao: AgendaVisao; href: (v: Vista, d: string) => string }) {
  // a semana da data, com quantos horários tem em cada dia (como a fita do app)
  const [a, m, d] = visao.data.split("-").map(Number);
  const dom = new Date(Date.UTC(a, m - 1, d - new Date(Date.UTC(a, m - 1, d)).getUTCDay()));
  const dias = Array.from({ length: 7 }, (_, i) => new Date(dom.getTime() + i * 86400000).toISOString().slice(0, 10));
  return (
    <div className="tyac-fita" role="list">
      {dias.map((iso) => {
        const p = partes(iso);
        return (
          <Link
            key={iso}
            role="listitem"
            href={href("dia", iso)}
            scroll={false}
            prefetch={false}
            className="tyac-fita__dia"
            data-on={iso === visao.data || undefined}
            data-hoje={iso === visao.hoje || undefined}
            aria-current={iso === visao.data ? "date" : undefined}
          >
            <span>{SEM[p.sem]}</span>
            <b>{p.d}</b>
          </Link>
        );
      })}
    </div>
  );
}

function Bloco({ c, onClick, compacto }: { c: ConsultaAgenda; onClick: () => void; compacto?: boolean }) {
  return (
    <button type="button" className="tyac-bloco" data-estado={c.estado} onClick={onClick} data-compacto={compacto || undefined}>
      <span className="tyac-bloco__hora">
        {hora12(c.hora)} às {hora12(hhmmDe(minutos(c.hora) + c.duracao))}
      </span>
      <b className="tyac-bloco__nome">
        {c.nome}
        {c.vip ? <i className="tyac-bloco__vip">VIP</i> : null}
      </b>
      <span className="tyac-bloco__servico">{c.servico}</span>
      <span className="tyac-bloco__estado">{NOME_DO_ESTADO[c.estado]}</span>
    </button>
  );
}

function VistaDia({ visao, aoLivre, aoVer }: { visao: AgendaVisao; aoLivre: (data: string, hora: string, fechado: boolean) => void; aoVer: (id: string) => void }) {
  const dia = visao.dias[0];
  const doDia = visao.consultas.filter((c) => c.data === dia.iso);
  const ativos = doDia.filter((c) => c.status !== "cancelled" && c.status !== "no_show");
  const encerrados = doDia.filter((c) => c.status === "cancelled" || c.status === "no_show");
  const livres = livresDoDia(dia, visao.consultas, visao.hoje, visao.agoraMin);
  const inicios = [...dia.horarios.map(minutos), ...ativos.map((c) => minutos(c.hora))];
  const fins = [...dia.horarios.map((h) => minutos(h) + 60), ...ativos.map((c) => minutos(c.hora) + c.duracao)];
  const ini = Math.floor(Math.min(8 * 60, ...inicios) / 60) * 60;
  const fim = Math.ceil(Math.max(19 * 60, ...fins) / 60) * 60;
  const y = (min: number) => ((min - ini) / 60) * ALTURA_HORA;
  const horas = Array.from({ length: (fim - ini) / 60 + 1 }, (_, i) => ini + i * 60);
  const blocos = faixas(ativos.map((c) => ({ ...c, ini: minutos(c.hora), dur: c.duracao })));
  const passou = dia.iso < visao.hoje;

  return (
    <div className="tyac-dia">
      {!dia.aberto && !ativos.length ? <p className="tyac-dia__aviso">Dia sem atendimento (folga). Dá para marcar mesmo assim pelo “Novo agendamento”.</p> : null}
      {!ativos.length && dia.aberto && !livres.length && !passou ? <p className="tyac-dia__aviso">Nenhum horário livre neste dia.</p> : null}
      <div className="tyac-linha" style={{ height: y(fim) + 8 }}>
        {horas.map((h) => (
          <div key={h} className="tyac-linha__hora" style={{ top: y(h) }}>
            <span>{hhmmDe(h)}</span>
          </div>
        ))}
        {/* horários livres e fechados da grade: tocar marca (ou abre/fecha) */}
        {dia.horarios.map((h) => {
          const m = minutos(h);
          const fechado = dia.fechados.includes(h);
          const livre = livres.includes(h);
          if (!livre && !(fechado && !passou)) return null;
          return (
            <button key={h} type="button" className="tyac-vaga" data-fechado={fechado || undefined} style={{ top: y(m) + 3 }} onClick={() => aoLivre(dia.iso, h, fechado)}>
              <span>{hora12(h)}</span>
              {fechado ? "Fechado" : "Livre · tocar para marcar"}
            </button>
          );
        })}
        {blocos.map((b) => (
          <div
            key={b.id}
            className="tyac-linha__bloco"
            style={{
              top: y(b.ini) + 2,
              height: Math.max(36, (b.dur / 60) * ALTURA_HORA - 4),
              left: `calc(58px + (100% - 64px) * ${b.faixa} / ${b.faixas})`,
              width: `calc((100% - 64px) / ${b.faixas} - 4px)`,
            }}
          >
            <Bloco c={b} onClick={() => aoVer(b.id)} compacto={b.dur <= 60} />
          </div>
        ))}
        {dia.iso === visao.hoje && visao.agoraMin >= ini && visao.agoraMin <= fim ? <div className="tyac-linha__agora" style={{ top: y(visao.agoraMin) }} aria-label="Agora" /> : null}
      </div>
      {encerrados.length ? (
        <div className="tyac-encerrados">
          <p className="tya-eyebrow">Cancelados e faltas do dia</p>
          {encerrados.map((c) => (
            <Bloco key={c.id} c={c} onClick={() => aoVer(c.id)} compacto />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function VistaSemana({
  visao,
  href,
  aoVer,
  aoNovo,
}: {
  visao: AgendaVisao;
  href: (v: Vista, d: string) => string;
  aoVer: (id: string) => void;
  aoNovo: (data: string, hora: string) => void;
}) {
  return (
    <div className="tyac-semana">
      {visao.dias.map((dia) => {
        const p = partes(dia.iso);
        const doDia = visao.consultas.filter((c) => c.data === dia.iso).sort((a, b) => a.hora.localeCompare(b.hora));
        const livres = livresDoDia(dia, visao.consultas, visao.hoje, visao.agoraMin);
        return (
          <section key={dia.iso} className="tyac-semana__dia" data-hoje={dia.iso === visao.hoje || undefined} data-folga={!dia.aberto || undefined}>
            <Link href={href("dia", dia.iso)} scroll={false} prefetch={false} className="tyac-semana__topo">
              <span>{SEM[p.sem]}</span>
              <b>{p.d}</b>
              <small>{dia.aberto ? (livres.length ? `${livres.length} ${livres.length === 1 ? "livre" : "livres"}` : "cheio") : "folga"}</small>
            </Link>
            <div className="tyac-semana__lista">
              {doDia.map((c) => (
                <Bloco key={c.id} c={c} onClick={() => aoVer(c.id)} compacto />
              ))}
              {livres.length ? (
                <button type="button" className="tyac-semana__mais" onClick={() => aoNovo(dia.iso, livres[0])}>
                  + Marcar às {hora12(livres[0])}
                </button>
              ) : null}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function VistaMes({ visao, href }: { visao: AgendaVisao; href: (v: Vista, d: string) => string }) {
  const semanas = gradeDoMes(visao.data);
  const mes = visao.data.slice(0, 7);
  return (
    <div className="tyac-mes">
      <div className="tyac-mes__cabeca" aria-hidden>
        {SEM.map((s) => (
          <span key={s}>{s}</span>
        ))}
      </div>
      {semanas.map((sem) => (
        <div key={sem[0]} className="tyac-mes__semana">
          {sem.map((iso) => {
            const doDia = visao.consultas.filter((c) => c.data === iso && c.status !== "cancelled" && c.status !== "no_show").sort((a, b) => a.hora.localeCompare(b.hora));
            const dia = visao.dias.find((d) => d.iso === iso);
            return (
              <Link
                key={iso}
                href={href("dia", iso)}
                scroll={false}
                prefetch={false}
                className="tyac-mes__dia"
                data-fora={iso.slice(0, 7) !== mes || undefined}
                data-hoje={iso === visao.hoje || undefined}
                data-folga={dia && !dia.aberto ? true : undefined}
              >
                <b>{partes(iso).d}</b>
                {doDia.length ? (
                  <>
                    <span className="tyac-mes__pontos" aria-hidden>
                      {doDia.slice(0, 4).map((c) => (
                        <i key={c.id} data-estado={c.estado} />
                      ))}
                    </span>
                    <span className="tyac-mes__itens">
                      {doDia.slice(0, 3).map((c) => (
                        <em key={c.id} data-estado={c.estado}>
                          {hora12(c.hora)} {c.nome}
                        </em>
                      ))}
                      {doDia.length > 3 ? <em>+{doDia.length - 3}</em> : null}
                    </span>
                    <span className="tya-sr">{doDia.length} horários</span>
                  </>
                ) : null}
              </Link>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ------------------------------------------------------------
// Folha (bottom sheet no celular, janela no computador)
// ------------------------------------------------------------

function Folha({ titulo, aoFechar, children }: { titulo: string; aoFechar: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      className="tyac-folha"
      onClose={aoFechar}
      onClick={(e) => {
        if (e.target === e.currentTarget) ref.current?.close();
      }}
    >
      <div className="tyac-folha__caixa">
        <header className="tyac-folha__topo">
          <h2>{titulo}</h2>
          <button type="button" className="tyac-folha__x" aria-label="Fechar" onClick={() => ref.current?.close()}>
            <svg viewBox="0 0 24 24" aria-hidden>
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </header>
        <div className="tyac-folha__corpo">{children}</div>
      </div>
    </dialog>
  );
}

// ------------------------------------------------------------
// Detalhes de um agendamento (e as ações de cada estado)
// ------------------------------------------------------------

function Linha({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div className="tyac-info__linha">
      <span>{rotulo}</span>
      <div>{children}</div>
    </div>
  );
}

function Detalhes({
  c,
  hoje,
  agoraMin,
  sinal,
  aoEditar,
  aoTerminar,
}: {
  c: ConsultaAgenda;
  hoje: string;
  agoraMin: number;
  sinal: number;
  aoEditar: () => void;
  aoTerminar: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname() ?? ROUTES.adminAgenda;
  const params = useSearchParams();
  const [modo, setModo] = useState<null | "confirmar" | "cancelar" | "realizado">(null);
  const [nota, setNota] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTarefa();
  const comecou = c.data < hoje || (c.data === hoje && agoraMin >= minutos(c.hora));
  const aberto = c.status === "requested" || c.status === "confirmed";
  const fim = hhmmDe(minutos(c.hora) + c.duracao);

  const rodar = (fn: () => Promise<{ ok: boolean; error?: string }>, depois?: () => void) => {
    setErro(null);
    iniciar(async () => {
      const r = await fn();
      if (!r.ok) setErro(r.error ?? "Não deu certo. Tente de novo.");
      else (depois ?? aoTerminar)();
    });
  };
  const comAviso = () => {
    // confirmado: abre a mensagem pronta para a cliente (a janela da Agenda)
    const p = new URLSearchParams(params?.toString() ?? "");
    p.set("avisar", c.id);
    p.delete("ver");
    aoTerminar();
    router.replace(`${pathname}?${p.toString()}`, { scroll: false });
  };

  return (
    <div className="tyac-info">
      <p className="tyac-info__estado" data-estado={c.estado}>
        {NOME_DO_ESTADO[c.estado]}
        {c.vip ? " · VIP" : ""}
        {c.origem === "painel" ? " · marcado por você" : " · marcado pelo site"}
      </p>
      <Linha rotulo="Quando">
        {rotuloDia(c.data)}
        <br />
        {hora12(c.hora)} às {hora12(fim)} ({duracaoLegivel(c.duracao)})
      </Linha>
      <Linha rotulo={c.servicoIds.length > 1 ? "Serviços" : "Serviço"}>{c.servico}</Linha>
      <Linha rotulo="Valor">
        {c.valor != null ? brl(c.valor) : "a combinar"}
        {c.taxa > 0 ? <small> (com {brl(c.taxa)} de taxa de horário especial)</small> : null}
        {c.formaPrevista ? <small> · {FORMAS[c.formaPrevista]}</small> : null}
      </Linha>
      {c.status === "requested" || c.comprovante ? (
        <Linha rotulo="Sinal">
          {c.comprovante ? (
            <>
              {brl(sinal)} no Pix, comprovante enviado ·{" "}
              <a href={ROUTES.adminComprovante(c.id)} target="_blank" rel="noopener noreferrer" className="tya-link">
                Ver comprovante
              </a>
            </>
          ) : (
            "aguardando o Pix (sem comprovante)"
          )}
        </Linha>
      ) : null}
      {c.atendimento ? (
        <Linha rotulo="Pagamento">
          {SITUACAO_PAGAMENTO[c.atendimento.situacao]} · recebido {brl(c.atendimento.recebido)}
          {c.atendimento.valor != null && c.atendimento.recebido < c.atendimento.valor ? ` · falta ${brl(c.atendimento.valor - c.atendimento.recebido)}` : ""}
        </Linha>
      ) : null}
      {c.notaTayssa ? <Linha rotulo="Sua observação">{c.notaTayssa}</Linha> : null}
      {c.notaCliente ? <Linha rotulo="Recado dela">“{c.notaCliente}”</Linha> : null}

      <div className="tyac-contato">
        {c.telefone ? (
          <a href={whatsappUrl(c.telefone, `Oi, ${c.nome.split(" ")[0]}! `)} target="_blank" rel="noopener noreferrer" className="tya-btn tya-btn--ghost">
            <WhatsAppIcon size={16} />
            {formatBrPhone(c.telefone)}
          </a>
        ) : null}
        {c.clienteId ? (
          <a href={ROUTES.adminClient(c.clienteId)} className="tya-btn tya-btn--ghost">
            Ver ficha
          </a>
        ) : null}
      </div>

      {erro ? (
        <p className="tya-err" role="alert">
          {erro}
        </p>
      ) : null}

      {/* ---------------- as ações de cada estado ---------------- */}
      {modo === "confirmar" ? (
        <div className="tyac-form">
          <label className="tya-label" htmlFor="tyac-recado">
            Recado para a cliente (opcional)
          </label>
          <textarea id="tyac-recado" className="tya-field" rows={2} value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Ex.: pode chegar 5 minutos antes" />
          <div className="tyac-acoes">
            <button type="button" className="tya-btn tya-btn--primary" disabled={pendente} onClick={() => rodar(() => adminConfirmAppointmentAction({ id: c.id, note: nota || undefined }), comAviso)}>
              {pendente ? "Confirmando…" : "Confirmar horário"}
            </button>
            <button type="button" className="tya-btn tya-btn--ghost" onClick={() => setModo(null)}>
              Voltar
            </button>
          </div>
        </div>
      ) : modo === "cancelar" ? (
        <div className="tyac-form">
          <label className="tya-label" htmlFor="tyac-motivo">
            Motivo (ela vê)
          </label>
          <textarea id="tyac-motivo" className="tya-field" rows={2} value={nota} onChange={(e) => setNota(e.target.value)} />
          <div className="tyac-acoes">
            <button type="button" className="tya-btn tya-btn--danger" disabled={pendente} onClick={() => rodar(() => adminCancelAppointmentAction({ id: c.id, note: nota || undefined }))}>
              {pendente ? "Cancelando…" : c.status === "requested" ? "Recusar o pedido" : "Cancelar o horário"}
            </button>
            <button type="button" className="tya-btn tya-btn--ghost" onClick={() => setModo(null)}>
              Voltar
            </button>
          </div>
        </div>
      ) : modo === "realizado" ? (
        <FormRealizado c={c} sinal={sinal} aoVoltar={() => setModo(null)} aoTerminar={aoTerminar} />
      ) : (
        <div className="tyac-acoes tyac-acoes--coluna">
          {aberto && comecou ? (
            <button type="button" className="tya-btn tya-btn--primary" onClick={() => setModo("realizado")}>
              Realizado (registrar o atendimento e o pagamento)
            </button>
          ) : null}
          {c.status === "requested" ? (
            <button type="button" className="tya-btn tya-btn--primary" onClick={() => setModo("confirmar")}>
              Confirmar
            </button>
          ) : null}
          {c.status === "confirmed" && !comecou ? (
            <button type="button" className="tya-btn tya-btn--ghost" onClick={comAviso}>
              Mensagem de confirmação
            </button>
          ) : null}
          {aberto ? (
            <button type="button" className="tya-btn tya-btn--ghost" onClick={aoEditar}>
              Editar ou reagendar
            </button>
          ) : null}
          {aberto && comecou ? (
            <button type="button" className="tya-btn tya-btn--ghost" disabled={pendente} onClick={() => rodar(() => adminNoShowAppointmentAction({ id: c.id }))}>
              Não compareceu
            </button>
          ) : null}
          {aberto ? (
            <button type="button" className="tya-btn tya-btn--ghost tyac-perigo" onClick={() => setModo("cancelar")}>
              {c.status === "requested" ? "Recusar" : "Cancelar"}
            </button>
          ) : null}
          {c.status === "done" && c.atendimento && c.atendimento.situacao !== "pago" && c.atendimento.situacao !== "sem_valor" ? (
            <Quitar atendimentoId={c.atendimento.id} formaInicial={c.formaPrevista} aoTerminar={aoTerminar} />
          ) : null}
          {c.status === "done" ? (
            <div className="tyac-corrigir">
              <CorrigirData id={c.id} data={c.data} hora={c.hora} tipo="horario" />
              <a href={ROUTES.adminServices} className="tya-link">
                Ver em Atendimentos realizados
              </a>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

function SelecionarForma({ id, valor, aoMudar, comVazio }: { id: string; valor: string; aoMudar: (v: string) => void; comVazio?: string }) {
  return (
    <select id={id} className="tya-field" value={valor} onChange={(e) => aoMudar(e.target.value)}>
      {comVazio ? <option value="">{comVazio}</option> : null}
      {LISTA_FORMAS.map((f) => (
        <option key={f} value={f}>
          {FORMAS[f]}
        </option>
      ))}
    </select>
  );
}

function Quitar({ atendimentoId, formaInicial, aoTerminar }: { atendimentoId: string; formaInicial: FormaPagamento | null; aoTerminar: () => void }) {
  const [forma, setForma] = useState<string>(formaInicial ?? "pix");
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTarefa();
  return (
    <div className="tyac-form tyac-form--linha">
      <label className="tya-label" htmlFor={`tyac-quitar-${atendimentoId}`}>
        Recebeu o que faltava?
      </label>
      <div className="tyac-acoes">
        <SelecionarForma id={`tyac-quitar-${atendimentoId}`} valor={forma} aoMudar={setForma} />
        <button
          type="button"
          className="tya-btn tya-btn--primary"
          disabled={pendente}
          onClick={() => {
            setErro(null);
            iniciar(async () => {
              const r = await adminQuitarAtendimentoAction({ atendimentoId, forma });
              if (!r.ok) setErro(r.error);
              else aoTerminar();
            });
          }}
        >
          {pendente ? "Registrando…" : "Marcar como pago"}
        </button>
      </div>
      {erro ? <p className="tya-err">{erro}</p> : null}
    </div>
  );
}

function FormRealizado({ c, sinal, aoVoltar, aoTerminar }: { c: ConsultaAgenda; sinal: number; aoVoltar: () => void; aoTerminar: () => void }) {
  const [valor, setValor] = useState(c.valor != null ? String(c.valor).replace(".", ",") : "");
  const [recebido, setRecebido] = useState<"sim" | "nao">("sim");
  const [forma, setForma] = useState<string>(c.formaPrevista ?? "pix");
  const [nota, setNota] = useState("");
  const [pontos, setPontos] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTarefa();
  const v = lerNumero(valor);
  const jaPago = c.comprovante ? sinal : 0;
  const resto = v != null ? Math.max(0, v - jaPago) : null;
  return (
    <form
      className="tyac-form"
      onSubmit={(e) => {
        e.preventDefault();
        setErro(null);
        iniciar(async () => {
          const r = await adminCompleteAppointmentAction({ id: c.id, valor, forma, recebido, note: nota || undefined, points: pontos || undefined });
          if (!r.ok) setErro(r.error);
          else aoTerminar();
        });
      }}
    >
      <div className="tyac-campos">
        <div>
          <label className="tya-label" htmlFor="tyac-valor">
            Valor cobrado (R$)
          </label>
          <input id="tyac-valor" className="tya-field" inputMode="decimal" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="ex.: 170" />
        </div>
        <div>
          <label className="tya-label" htmlFor="tyac-forma">
            Forma de pagamento
          </label>
          <SelecionarForma id="tyac-forma" valor={forma} aoMudar={setForma} />
        </div>
      </div>
      {jaPago ? <p className="tya-small">O sinal de {brl(jaPago)} já entrou no Pix (comprovante enviado).</p> : null}
      <fieldset className="tyac-escolha">
        <legend className="tya-label">{resto != null ? `O restante (${brl(resto)})` : "O pagamento"}</legend>
        <label>
          <input type="radio" name="tyac-recebido" checked={recebido === "sim"} onChange={() => setRecebido("sim")} /> Recebi agora
        </label>
        <label>
          <input type="radio" name="tyac-recebido" checked={recebido === "nao"} onChange={() => setRecebido("nao")} /> Fica pendente
        </label>
      </fieldset>
      <label className="tya-label" htmlFor="tyac-obs">
        Observação (opcional)
      </label>
      <input id="tyac-obs" className="tya-field" value={nota} onChange={(e) => setNota(e.target.value)} />
      <details className="tyac-mais">
        <summary>Pontos diferentes do catálogo</summary>
        <input className="tya-field" inputMode="numeric" value={pontos} onChange={(e) => setPontos(e.target.value)} placeholder="vazio = os pontos do serviço" aria-label="Pontos desta visita" />
      </details>
      {erro ? (
        <p className="tya-err" role="alert">
          {erro}
        </p>
      ) : null}
      <div className="tyac-acoes">
        <button type="submit" className="tya-btn tya-btn--primary" disabled={pendente}>
          {pendente ? "Registrando…" : "Confirmar realizado"}
        </button>
        <button type="button" className="tya-btn tya-btn--ghost" onClick={aoVoltar}>
          Voltar
        </button>
      </div>
    </form>
  );
}

// ------------------------------------------------------------
// Novo agendamento e editar (o mesmo formulário)
// ------------------------------------------------------------

type ValoresForm = { data: string; hora: string; servicoIds: string[]; duracao: string; valor: string; forma: string; observacoes: string };

function FormAgendamento({
  modo,
  id,
  visao,
  servicos,
  clientes,
  inicial,
  aoConcluir,
}: {
  modo: "novo" | "editar";
  id?: string;
  visao: AgendaVisao;
  servicos: ServicoParaAgenda[];
  clientes: ClienteParaAgenda[];
  inicial: ValoresForm;
  aoConcluir: (data: string) => void;
}) {
  const [v, setV] = useState<ValoresForm>(inicial);
  const [busca, setBusca] = useState("");
  const [cliente, setCliente] = useState<ClienteParaAgenda | null>(null);
  const [nova, setNova] = useState(false);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTarefa();
  const set = (k: keyof ValoresForm, val: string | string[]) => setV((o) => ({ ...o, [k]: val }));

  const achadas = useMemo(
    () => (busca.trim().length >= 2 ? clientes.filter((c) => bateBusca(busca, [c.nome, c.apelido, c.telefone])).slice(0, 6) : []),
    [busca, clientes],
  );
  // o WhatsApp digitado já é de uma cliente: usa o cadastro dela (nada de duplicado)
  const digitos = telefone.replace(/\D/g, "");
  const jaTem = nova && digitos.length >= 10 ? clientes.find((c) => (c.telefone ?? "").replace(/\D/g, "").endsWith(digitos.slice(-10))) : undefined;

  const escolhidos = v.servicoIds.map((sid) => servicos.find((s) => s.id === sid)).filter((s): s is ServicoParaAgenda => Boolean(s));
  const somaMin = escolhidos.reduce((s, x) => s + (x.duracao ?? 0), 0);
  const somaValor = escolhidos.every((s) => s.preco != null) && escolhidos.length ? escolhidos.reduce((s, x) => s + (x.preco ?? 0), 0) : null;
  const diaNaVista = visao.dias.find((d) => d.iso === v.data);
  const livres = diaNaVista ? livresDoDia(diaNaVista, visao.consultas.filter((c) => c.id !== id), visao.hoje, visao.agoraMin) : [];

  const enviar = () => {
    setErro(null);
    iniciar(async () => {
      const comum = { servicoIds: v.servicoIds, data: v.data, hora: v.hora, duracao: v.duracao, valor: v.valor, forma: v.forma, observacoes: v.observacoes };
      const r =
        modo === "editar" && id
          ? await adminEditarAgendamentoAction({ id, ...comum })
          : await adminCriarAgendamentoAction({
              ...comum,
              clienteId: cliente?.id ?? jaTem?.id,
              nome: cliente || jaTem ? undefined : nome,
              telefone: cliente || jaTem ? undefined : telefone,
            });
      if (!r.ok) setErro(r.error);
      else aoConcluir(v.data);
    });
  };

  return (
    <form
      className="tyac-form"
      onSubmit={(e) => {
        e.preventDefault();
        enviar();
      }}
    >
      {modo === "novo" ? (
        <div className="tyac-cliente">
          <span className="tya-label">Cliente</span>
          {cliente ? (
            <div className="tyac-escolhida">
              <b>{cliente.nome}</b>
              <span>{cliente.telefone ? formatBrPhone(cliente.telefone) : "sem WhatsApp"}</span>
              <button type="button" className="tya-link" onClick={() => setCliente(null)}>
                Trocar
              </button>
            </div>
          ) : nova ? (
            <div className="tyac-campos">
              <div>
                <label className="tya-label" htmlFor="tyac-nome">
                  Nome da cliente
                </label>
                <input id="tyac-nome" className="tya-field" value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="off" />
              </div>
              <div>
                <label className="tya-label" htmlFor="tyac-tel">
                  WhatsApp
                </label>
                <input id="tyac-tel" className="tya-field" inputMode="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(11) 99999-9999" autoComplete="off" />
              </div>
              {jaTem ? (
                <p className="tya-small tyac-aviso">
                  Esse WhatsApp já é da {jaTem.nome}: o horário entra no cadastro dela.{" "}
                  <button type="button" className="tya-link" onClick={() => setCliente(jaTem)}>
                    Usar o cadastro
                  </button>
                </p>
              ) : null}
              <button type="button" className="tya-link" onClick={() => setNova(false)}>
                Procurar uma cliente cadastrada
              </button>
            </div>
          ) : (
            <>
              <input
                className="tya-field"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Nome ou WhatsApp"
                aria-label="Procurar cliente por nome ou WhatsApp"
                autoComplete="off"
              />
              {achadas.length ? (
                <ul className="tyac-sugestoes">
                  {achadas.map((c) => (
                    <li key={c.id}>
                      <button type="button" onClick={() => setCliente(c)}>
                        <b>{c.nome}</b>
                        <span>{c.telefone ? formatBrPhone(c.telefone) : c.apelido ?? ""}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
              <button
                type="button"
                className="tya-link"
                onClick={() => {
                  setNova(true);
                  if (/\d/.test(busca)) setTelefone(busca);
                  else setNome(busca);
                }}
              >
                + Cliente nova (nome e WhatsApp)
              </button>
            </>
          )}
        </div>
      ) : null}

      <div>
        <span className="tya-label">Serviço{escolhidos.length > 1 ? "s" : ""}</span>
        <div className="tyac-servicos">
          {servicos.map((s) => {
            const on = v.servicoIds.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                className="tyac-servico"
                aria-pressed={on}
                onClick={() => set("servicoIds", on ? v.servicoIds.filter((x) => x !== s.id) : [...v.servicoIds, s.id])}
              >
                <b>{s.nome}</b>
                <small>{[s.preco != null ? brl(s.preco).replace(",00", "") : null, duracaoLegivel(s.duracao)].filter(Boolean).join(" · ")}</small>
              </button>
            );
          })}
        </div>
      </div>

      <div className="tyac-campos">
        <div>
          <label className="tya-label" htmlFor="tyac-data">
            Data
          </label>
          <input id="tyac-data" type="date" className="tya-field" value={v.data} onChange={(e) => set("data", e.target.value)} required />
        </div>
        <div>
          <label className="tya-label" htmlFor="tyac-hora">
            Horário
          </label>
          <input id="tyac-hora" type="time" className="tya-field" value={v.hora} onChange={(e) => set("hora", e.target.value)} step={900} required />
        </div>
      </div>
      {livres.length ? (
        <div className="tyac-livres" aria-label="Horários livres neste dia">
          {livres.map((h) => (
            <button key={h} type="button" className="tyac-livre" aria-pressed={v.hora === h} onClick={() => set("hora", h)}>
              {hora12(h)}
            </button>
          ))}
        </div>
      ) : null}

      <div className="tyac-campos">
        <div>
          <label className="tya-label" htmlFor="tyac-duracao">
            Duração
          </label>
          <input id="tyac-duracao" className="tya-field" value={v.duracao} onChange={(e) => set("duracao", e.target.value)} placeholder={somaMin ? duracaoLegivel(somaMin) ?? "1h30" : "1h30"} />
          <small className="tya-small">{somaMin ? `Vazio: a soma dos serviços (${duracaoLegivel(somaMin)}).` : "Ex.: 3h, 1h30, 40 min."}</small>
        </div>
        <div>
          <label className="tya-label" htmlFor="tyac-valor-ag">
            Valor (R$)
          </label>
          <input id="tyac-valor-ag" className="tya-field" inputMode="decimal" value={v.valor} onChange={(e) => set("valor", e.target.value)} placeholder={somaValor != null ? String(somaValor) : "ex.: 170"} />
          <small className="tya-small">{somaValor != null ? `Vazio: ${brl(somaValor)}, o valor dos serviços.` : "O valor combinado."}</small>
        </div>
      </div>

      <div>
        <label className="tya-label" htmlFor="tyac-forma-ag">
          Forma de pagamento
        </label>
        <SelecionarForma id="tyac-forma-ag" valor={v.forma} aoMudar={(x) => set("forma", x)} comVazio="A combinar" />
      </div>

      <div>
        <label className="tya-label" htmlFor="tyac-obs-ag">
          Observações (só você vê)
        </label>
        <textarea id="tyac-obs-ag" className="tya-field" rows={2} value={v.observacoes} onChange={(e) => set("observacoes", e.target.value)} />
      </div>

      {erro ? (
        <p className="tya-err" role="alert">
          {erro}
        </p>
      ) : null}
      <div className="tyac-acoes">
        <button type="submit" className="tya-btn tya-btn--primary" disabled={pendente}>
          {pendente ? "Salvando…" : modo === "novo" ? "Marcar horário" : "Salvar alterações"}
        </button>
      </div>
      {modo === "novo" ? <p className="tya-small">Marcado por você, o horário já entra confirmado. Se cruzar com outro, o painel avisa.</p> : null}
    </form>
  );
}
