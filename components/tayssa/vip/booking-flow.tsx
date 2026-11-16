"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { createAppointmentAction } from "@/lib/tayssa/actions/booking";
import { dateLong, dayLabel, monthName, plural, weekdayShort } from "@/lib/tayssa/format";
import { TyTextarea } from "@/components/tayssa/ui/field";
import { cabeNoHorario, duracaoLegivel, reais, somaDoPedido, valorLegivel } from "@/lib/tayssa/agendar";
import { PagarSinal } from "@/components/tayssa/ui/pagar-sinal";
import type { SinalDaAgenda } from "@/components/tayssa/vip/appointment-list";
import { useTarefa } from "@/components/tayssa/ui/acao";

export type BookingService = {
  id: string;
  name: string;
  description: string | null;
  point_value: number;
  /** "R$ 170" ou "a partir de R$ 120" (vazio = não mostra) */
  precoLabel?: string | null;
  /** minutos que o serviço ocupa na agenda */
  duracao?: number | null;
  /** valor em número, para o total de vários serviços (vazio = sem valor cadastrado) */
  preco?: number | null;
  /** o valor é de partida (manutenção) */
  aPartir?: boolean;
};
/** `ate`: minutos livres depois do início (null = o resto do dia) */
export type BookingDay = {
  iso: string;
  /** `taxa`: taxa de horário especial (dezembro), em reais */
  slots: { time: string; available: boolean; ate?: number | null; taxa?: number }[];
};

const STEPS = ["Serviço", "Dia e horário", "Confirmar"];
/** a lista de serviços começa curta, como na folha do site */
const VISIVEIS = 3;
/** serviços num horário só (o servidor aceita o mesmo tanto) */
const MAX_SERVICOS = 5;

/**
 * Marcar horário sem sair daqui: serviço, dia, hora, confirmar.
 * Um passo por tela, sempre com volta. O pedido nasce "aguardando
 * confirmação" — quem fecha a agenda é a Tayssa.
 *
 * Vários serviços num horário só (Lucas, 16/11/2026): no "Confirmar",
 * "+ Adicionar outro serviço" volta à lista; o tempo soma, o horário
 * precisa caber tudo e o sinal é um só.
 */
export function BookingFlow({
  services,
  days,
  atLimit = false,
  limitMessage,
  onDone,
  sinal,
}: {
  services: BookingService[];
  days: BookingDay[];
  /** já atingiu o limite de horários em aberto */
  atLimit?: boolean;
  limitMessage?: string;
  onDone?: () => void;
  /** o sinal no Pix: o pedido fica guardado esperando por ele */
  sinal?: SinalDaAgenda;
}) {
  const router = useRouter();
  const reduced = useReducedMotion();
  const [step, setStep] = useState(0);
  // os serviços escolhidos, na ordem; "adicionando" = voltou à lista pelo "+ Adicionar outro serviço"
  const [serviceIds, setServiceIds] = useState<string[]>([]);
  const [adicionando, setAdicionando] = useState(false);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{
    id: string;
    date: string;
    time: string;
    serviceName: string;
    taxa: number;
    valor: number | null;
  } | null>(null);
  const [pending, start] = useTarefa();
  // "Mais serviços": abre a lista inteira (o escolhido fora dos três primeiros também a abre)
  const [todos, setTodos] = useState(false);

  const escolhidos = serviceIds.flatMap((sid) => services.filter((s) => s.id === sid));
  const day = days.find((d) => d.iso === date) ?? null;
  // dezembro: R$ 30 no primeiro e no último horário de cada dia; no dia 24, em todos
  const taxa = (time && day?.slots.find((s) => s.time === time)?.taxa) || 0;
  // na lista, só o que ainda não foi escolhido
  const disponiveis = services.filter((s) => !serviceIds.includes(s.id));
  const listaToda = todos;
  // os serviços precisam caber inteiros, um depois do outro: o volume de 3h não
  // aparece às 10h se às 11h já tem alguém
  const soma = somaDoPedido(escolhidos);
  const duracao = escolhidos.length ? soma.duracao || null : null;
  const valorTotal = valorLegivel(soma.valor, [], escolhidos.some((s) => s.aPartir));
  const cabe = (s: BookingDay["slots"][number]) => cabeNoHorario(s, duracao);
  // nada some: dia sem horário livre continua na fita, riscado e sem toque
  const openDays = new Set(days.filter((d) => d.slots.some(cabe)).map((d) => d.iso));
  const livres = day ? day.slots.filter(cabe).length : 0;

  // a cada passo (e no "Pedido enviado") a tela volta ao topo do fluxo e o
  // foco vai para o título: no celular pequeno a confirmação ficava acima
  // da tela, e o foco caía no <body>
  const topo = useRef<HTMLDivElement>(null);
  const titulo = useRef<HTMLHeadingElement>(null);
  const primeira = useRef(true);
  useEffect(() => {
    if (primeira.current) {
      primeira.current = false;
      return;
    }
    const el = topo.current;
    if (el && el.getBoundingClientRect().top < 72)
      el.scrollIntoView({ block: "start", behavior: reduced ? "auto" : "smooth" });
    titulo.current?.focus({ preventScroll: true });
  }, [step, done, reduced]);

  const pick = (fn: () => void) => {
    setError(null);
    fn();
  };

  /** escolheu um serviço na lista: o primeiro leva ao dia; no "+ Adicionar", volta ao Confirmar se ainda couber */
  const escolher = (id: string) => {
    const lista = [...serviceIds, id];
    setServiceIds(lista);
    setTodos(false);
    if (!adicionando) {
      setStep(1);
      return;
    }
    setAdicionando(false);
    const novo = somaDoPedido(services.filter((s) => lista.includes(s.id))).duracao || null;
    const slot = day?.slots.find((s) => s.time === time);
    if (slot && cabeNoHorario(slot, novo)) setStep(2);
    else {
      // com o tempo somado o horário não comporta tudo: escolhe outro
      setTime(null);
      setStep(1);
      setError("Com os serviços juntos, escolha um horário em que caiba tudo.");
    }
  };
  const tirar = (id: string) => {
    const lista = serviceIds.filter((x) => x !== id);
    setServiceIds(lista);
    if (!lista.length) {
      setTime(null);
      setStep(0);
    }
  };

  const confirm = () => {
    if (!serviceIds.length || !date || !time) return;
    setError(null);
    start(async () => {
      const r = await createAppointmentAction({ service_ids: serviceIds, date, time, note: note.trim() || undefined });
      if (!r.ok) {
        setError(r.error);
        return;
      }
      setDone({ id: r.data.id, date: r.data.date, time: r.data.time, serviceName: r.data.serviceName, taxa, valor: soma.valor });
      // A action já revalida a rota, mas em parte das vezes (medido: ~1 em 3)
      // a tela aplicava a árvore antiga e "Meus horários" ficava sem o pedido
      // novo até recarregar. O refresh vai DEPOIS que a transição da action
      // assenta — dentro dela, ele disputava com a própria resposta.
      setTimeout(() => router.refresh(), 300);
      onDone?.();
    });
  };

  if (done) {
    const dia = dayLabel(done.date);
    return (
      <motion.div
        ref={topo}
        className="tyv-panel tyv-fluxo"
        role="status"
        initial={{ opacity: 0, y: reduced ? 0 : 12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: "center", padding: "30px 20px" }}
      >
        <span className="tyv-label">Pedido enviado</span>
        <h2 ref={titulo} tabIndex={-1} className="tyv-h2" style={{ margin: "12px 0 8px" }}>
          {dia}, às {done.time}.
        </h2>
        <p className="tyv-sub" style={{ fontSize: 14 }}>
          {done.serviceName}
          {dia === "hoje" || dia === "amanhã" ? ` · ${dateLong(done.date)}` : ""}
        </p>
        {sinal ? (
          <>
            <p className="tyv-sub" style={{ fontSize: 13.5, marginTop: 14 }}>
              O horário fica guardado por {sinal.horas}h esperando o sinal de {reais(sinal.valor)} no Pix com o
              comprovante.
              {sinal.tolerancia > 0
                ? ` No dia, a tolerância é de ${sinal.tolerancia} minutos: passando disso, você perde o sinal.`
                : ""}
            </p>
            {/* o sinal em três passos: copiar o Pix, anexar o comprovante, avisar a Tayssa */}
            <div style={{ marginTop: 16 }}>
              <PagarSinal
                tema="noite"
                pedido={{ id: done.id, servico: done.serviceName, dia: done.date, hora: done.time, taxa: done.taxa, valor: done.valor }}
                nome={sinal.nome}
                sinal={sinal.valor}
                telefone={sinal.telefone}
                pix={sinal.pix}
                onAnexado={() => router.refresh()}
              />
            </div>
          </>
        ) : (
          <p className="tyv-sub" style={{ fontSize: 13.5, marginTop: 14 }}>
            A Tayssa confirma o horário e você vê aqui como confirmado.
          </p>
        )}
        <div className="tyv-stack" style={{ marginTop: 22 }}>
          {atLimit ? null : (
            <button
              type="button"
              className="tyv-btn tyv-btn--ghost"
              onClick={() => {
                setDone(null);
                setStep(0);
                setServiceIds([]);
                setAdicionando(false);
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

  // sem serviço escolhido ainda, a agenda está aberta se algum horário estiver livre
  if (!services.length || !days.some((d) => d.slots.some((s) => s.available))) {
    return (
      <div className="tyv-panel">
        <p className="tyv-empty">
          A agenda está fechada no momento. Fale com a Tayssa pelo WhatsApp que ela abre um horário para você.
        </p>
      </div>
    );
  }

  return (
    <div ref={topo} className="tyv-fluxo">
      <div className="tyv-steps" aria-hidden>
        {STEPS.map((s, i) => (
          <i key={s} data-on={i <= step} />
        ))}
      </div>
      <div className="tyv-section-head" style={{ marginBottom: 16 }}>
        <h2 ref={titulo} tabIndex={-1} className="tyv-h2">
          {STEPS[step]}
        </h2>
        {step > 0 || adicionando ? (
          <button
            type="button"
            className="tyv-link"
            style={{ opacity: 0.7 }}
            onClick={() => {
              setError(null);
              if (adicionando) {
                setAdicionando(false);
                setStep(2);
              } else setStep((s) => s - 1);
            }}
          >
            {adicionando ? "Não quero outro" : "Voltar"}
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
            // como a folha do site: três serviços e "Mais serviços"; cada linha só com nome, valor e
            // tempo (a descrição longa fazia a lista virar formulário, 12 cartões de rolagem)
            <div className="tyv-servicos">
              {adicionando ? (
                <p className="tyv-sub" style={{ fontSize: 14, margin: "0 0 4px" }}>
                  Escolha o serviço que vem junto: é no mesmo horário, com um sinal só.
                </p>
              ) : null}
              {(listaToda ? disponiveis : disponiveis.slice(0, VISIVEIS)).map((s) => (
                <button key={s.id} type="button" className="tyv-servico" onClick={() => pick(() => escolher(s.id))}>
                  <span className="tyv-servico__nome">{s.name}</span>
                  <span className="tyv-servico__info">
                    {[s.precoLabel, duracaoLegivel(s.duracao)].filter(Boolean).join(" · ")}
                  </span>
                  <span className="tyv-servico__seta" aria-hidden />
                </button>
              ))}
              {!listaToda && disponiveis.length > VISIVEIS ? (
                <button type="button" className="tyv-servicos__mais" onClick={() => setTodos(true)}>
                  Mais serviços
                  <span className="tyv-servicos__n">{disponiveis.length - VISIVEIS}</span>
                </button>
              ) : null}
            </div>
          ) : null}

          {step === 1 ? (
            <div>
              {error ? (
                <p className="ty-form-error" role="alert" style={{ marginBottom: 14 }}>
                  {error}
                </p>
              ) : null}
              <div className="tyv-days" role="group" aria-label="Escolha o dia">
                {days.map((d, i) => (
                  <button
                    key={d.iso}
                    type="button"
                    className="tyv-day"
                    // no computador os dias viram um calendário: cada um na coluna do seu dia da
                    // semana (o domingo fechado vira buraco, e as colunas continuam batendo)
                    style={{ "--tyv-col": new Date(`${d.iso}T12:00:00`).getDay() + 1 } as CSSProperties}
                    disabled={!openDays.has(d.iso)}
                    data-lotado={!openDays.has(d.iso) || undefined}
                    aria-label={`${dayLabel(d.iso)}${openDays.has(d.iso) ? "" : ", sem horário livre"}`}
                    aria-pressed={date === d.iso}
                    onClick={() =>
                      pick(() => {
                        setDate(d.iso);
                        setTime(null);
                      })
                    }
                  >
                    {/* o mês aparece no primeiro dia da fita e quando vira (sáb 31 → seg 02 não se lia) */}
                    {i === 0 || d.iso.slice(5, 7) !== days[i - 1].iso.slice(5, 7) ? (
                      <span className="tyv-day__m">{monthName(Number(d.iso.slice(5, 7)) - 1).slice(0, 3)}</span>
                    ) : null}
                    <span className="tyv-day__w">{weekdayShort(d.iso)}</span>
                    <span className="tyv-day__d">{d.iso.slice(8, 10)}</span>
                  </button>
                ))}
              </div>

              {day ? (
                <>
                  <p className="tyv-label" style={{ margin: "16px 0 10px" }}>
                    {dayLabel(day.iso)} · {livres} {plural(livres, "horário livre", "horários livres")}
                    {escolhidos.length && duracaoLegivel(duracao) ? ` para ${duracaoLegivel(duracao)}` : ""}
                  </p>
                  <div className="tyv-slots" role="group" aria-label="Escolha o horário">
                    {day.slots.map((s) => (
                      <button
                        key={s.time}
                        type="button"
                        className="tyv-slot"
                        disabled={!cabe(s)}
                        aria-label={`${s.time}${(s.taxa ?? 0) > 0 ? `, mais ${reais(s.taxa ?? 0)} de taxa de horário especial` : ""}${cabe(s) ? "" : ", indisponível"}`}
                        aria-pressed={time === s.time}
                        onClick={() =>
                          pick(() => {
                            setTime(s.time);
                            setStep(2);
                          })
                        }
                      >
                        {s.time}
                        {(s.taxa ?? 0) > 0 ? (
                          <small className="tyv-slot__taxa" aria-hidden>
                            +{reais(s.taxa ?? 0)}
                          </small>
                        ) : null}
                      </button>
                    ))}
                  </div>
                  {day.slots.some((s) => (s.taxa ?? 0) > 0) ? (
                    <p className="tyv-sub tyv-nota-taxa">
                      Horário especial de dezembro: os horários com +R$&nbsp;30 têm a taxa de horário especial.
                    </p>
                  ) : null}
                </>
              ) : (
                <p className="tyv-sub" style={{ marginTop: 16 }}>
                  Escolha um dia para ver os horários.
                </p>
              )}
            </div>
          ) : null}

          {step === 2 && escolhidos.length && date && time ? (
            <div>
              <div className="tyv-panel">
                {escolhidos.map((s, i) => (
                  <div key={s.id} className="tyv-row">
                    <span className="tyv-label">{i === 0 ? (escolhidos.length > 1 ? "Serviços" : "Serviço") : ""}</span>
                    <span className="tyv-servico-escolhido">
                      <span style={{ fontSize: 16 }}>{s.name}</span>
                      {escolhidos.length > 1 ? (
                        <button type="button" className="tyv-link tyv-servico-escolhido__tirar" onClick={() => tirar(s.id)}>
                          Tirar
                        </button>
                      ) : null}
                    </span>
                  </div>
                ))}
                <div className="tyv-row">
                  <span className="tyv-label">Dia</span>
                  <span style={{ fontSize: 16 }}>{dateLong(date)}</span>
                </div>
                <div className="tyv-row">
                  <span className="tyv-label">Horário</span>
                  <span style={{ fontSize: 16 }}>{time}</span>
                </div>
                {taxa > 0 ? (
                  <div className="tyv-row">
                    <span className="tyv-label">Taxa de horário especial</span>
                    <span style={{ fontSize: 16 }}>+ {reais(taxa)}</span>
                  </div>
                ) : null}
                {duracaoLegivel(duracao) ? (
                  <div className="tyv-row">
                    <span className="tyv-label">Duração</span>
                    <span style={{ fontSize: 16 }}>{duracaoLegivel(duracao)}</span>
                  </div>
                ) : null}
                {escolhidos.length > 1 && valorTotal ? (
                  <div className="tyv-row">
                    <span className="tyv-label">Total</span>
                    <span style={{ fontSize: 16 }}>{valorTotal}</span>
                  </div>
                ) : null}
              </div>
              {/* vários serviços no mesmo horário, um depois do outro, com um sinal só */}
              {escolhidos.length < MAX_SERVICOS ? (
                <button
                  type="button"
                  className="tyv-adicionar"
                  onClick={() => {
                    setError(null);
                    setAdicionando(true);
                    setStep(0);
                  }}
                >
                  <span className="tyv-adicionar__mais" aria-hidden>
                    <svg viewBox="0 0 24 24">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                  <span>
                    Adicionar outro serviço
                    <small>no mesmo horário, com um sinal só</small>
                  </span>
                </button>
              ) : null}
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
