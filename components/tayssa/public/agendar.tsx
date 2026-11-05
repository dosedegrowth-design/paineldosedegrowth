"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type FormEvent,
  type InputHTMLAttributes,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { ROUTES } from "@/lib/tayssa/config";
import { agendaPublicaAction } from "@/lib/tayssa/actions/agenda";
import { createAppointmentAction } from "@/lib/tayssa/actions/booking";
import {
  contaDaAgendaAction,
  criarContaAgendaAction,
  entrarNaAgendaAction,
  sairDaContaAction,
  type ContaNaAgenda,
} from "@/lib/tayssa/actions/conta";
import { useTarefa } from "@/components/tayssa/ui/acao";
import { OlhoDaSenha } from "@/components/tayssa/ui/senha";
import { PagarSinal } from "@/components/tayssa/ui/pagar-sinal";
import type { PixDaAgenda } from "@/lib/tayssa/pix";
import {
  cabeNoHorario,
  diasAbertos,
  duracaoLegivel,
  horaLegivel,
  mesesDaAgenda,
  partesDoDia,
  reais,
  diaLegivel,
  valorLegivel,
  type DiaAgenda,
} from "@/lib/tayssa/agendar";

export type ServicoAgenda = {
  id: string;
  slug: string;
  nome: string;
  /** manutenção pergunta de qual volume é (e o valor vem dele) */
  manutencao: boolean;
  /** valor cadastrado pela Tayssa (vazio = não mostra) */
  preco?: number | null;
  /** minutos que ocupa na agenda: só aparece o horário em que ele cabe inteiro */
  duracao?: number | null;
};

export type AgendaSite = {
  telefone: string;
  servicos: ServicoAgenda[];
  /** os volumes de cílios com o valor da manutenção de cada um */
  volumes: { nome: string; manutencao: number | null }[];
  dias: DiaAgenda[];
  sinal: number;
  /** horas que o pedido segura o horário esperando o sinal */
  sinalHoras: number;
  /** minutos de tolerância para atraso: passando disso, ela perde o sinal */
  tolerancia: number;
  /** o Pix do sinal (copia e cola com o valor); sem chave no painel, ela pede no WhatsApp */
  pix: PixDaAgenda | null;
};

type Ctx = { abrir: (servico?: string) => void };
const AgendarCtx = createContext<Ctx | null>(null);

const NAO_SEI = "Ainda não sei, quero ajuda para escolher";
/** a lista de serviços começa curta: três e "Mais serviços" */
const VISIVEIS = 3;

/**
 * O "Agendar" do site inteiro. Todo botão de agendar abre esta folha, um
 * passo de cada vez para não virar formulário: escolher (serviço, dia e o
 * horário num cartãozinho), entrar ou criar a conta e pronto. O horário fica
 * reservado na agenda da Tayssa esperando o sinal (05/11/2026).
 */
export function AgendarProvider({ agenda, children }: { agenda: AgendaSite; children: ReactNode }) {
  const [aberta, setAberta] = useState(false);
  // cada abertura é um pedido novo (o serviço do botão que abriu vem marcado)
  const [pedido, setPedido] = useState<{ n: number; servico?: string }>({
    n: 0,
  });
  const abrir = useCallback((servico?: string) => {
    setPedido((p) => ({ n: p.n + 1, servico }));
    setAberta(true);
  }, []);
  const ctx = useMemo(() => ({ abrir }), [abrir]);
  return (
    <AgendarCtx.Provider value={ctx}>
      {children}
      <FolhaAgendar agenda={agenda} aberta={aberta} pedido={pedido} onFechar={() => setAberta(false)} />
    </AgendarCtx.Provider>
  );
}

/**
 * Link de agendar: sem JavaScript (ou fora do site) vai direto ao WhatsApp;
 * com a folha por perto, abre a folha.
 */
export function LinkAgendar({
  href,
  servico,
  aoAbrir,
  onClick,
  children,
  ...resto
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  /** slug do serviço que já vem marcado na folha */
  servico?: string;
  /** depois de abrir a folha (ex.: fechar o menu do celular) */
  aoAbrir?: () => void;
}) {
  const ctx = useContext(AgendarCtx);
  const clicar = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (!ctx || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    ctx.abrir(servico);
    aoAbrir?.();
  };
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={clicar}
      aria-haspopup={ctx ? "dialog" : undefined}
      {...resto}
    >
      {children}
    </a>
  );
}

type Passo = "escolha" | "conta" | "pronto";
type Feito = {
  /** id do pedido: o link do folder (/tayssa/horario/<id>) vai na mensagem */
  id: string;
  servico: string;
  tecnica: string | null;
  dia: string;
  hora: string;
  valor: number | null;
  nome: string;
};

function FolhaAgendar({
  agenda,
  aberta,
  pedido,
  onFechar,
}: {
  agenda: AgendaSite;
  aberta: boolean;
  pedido: { n: number; servico?: string };
  onFechar: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const corpoRef = useRef<HTMLDivElement>(null);
  const id = useId();
  // a agenda vem da página e é buscada de novo a cada abertura: o que
  // alguém marcou (ou a Tayssa fechou) depois do carregamento já aparece riscado
  const [fresca, setFresca] = useState<DiaAgenda[] | null>(null);
  const dias = fresca ?? agenda.dias;
  const semServicos = agenda.servicos.length === 0;

  const [passo, setPasso] = useState<Passo>("escolha");
  const [servico, setServico] = useState<string | null>(null);
  const [verTodos, setVerTodos] = useState(false);
  const [tecnica, setTecnica] = useState<string | null>(null);
  const [dia, setDia] = useState<string | null>(null);
  const [hora, setHora] = useState<string | null>(null);
  const [horasAbertas, setHorasAbertas] = useState(false);

  // a conta: quem já entrou neste aparelho só confirma; quem não, cria ou entra
  const [conta, setConta] = useState<ContaNaAgenda | null>(null);
  const [modo, setModo] = useState<"criar" | "entrar">("criar");
  const [nome, setNome] = useState("");
  const [whats, setWhats] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  // "Manter conectada neste celular" (Lucas, 05/11/2026): já vem marcado
  const [lembrar, setLembrar] = useState(true);
  const [login, setLogin] = useState("");
  const [erro, setErro] = useState<{ texto: string; campo?: string } | null>(null);
  const [feito, setFeito] = useState<Feito | null>(null);
  const [enviando, iniciar] = useTarefa();

  /** troca de serviço: o dia e a hora que não comportam o tempo dele saem */
  const escolherServico = (slug: string) => {
    setServico(slug);
    setVerTodos(false);
    setTecnica(null);
    setErro(null);
    const novo = agenda.servicos.find((s) => s.slug === slug)?.duracao ?? null;
    const d = dias.find((x) => x.iso === dia);
    if (!d || !d.slots.some((s) => cabeNoHorario(s, novo))) {
      setDia(null);
      setHora(null);
    } else if (!d.slots.some((s) => s.time === hora && cabeNoHorario(s, novo))) {
      setHora(null);
    }
  };

  // pedido novo: começa do zero no primeiro passo (o horário de antes pode já
  // ter sido tomado), com o serviço do botão que abriu. A conta continua.
  // (ajuste de estado no render, sem efeito — padrão do React)
  const [atendido, setAtendido] = useState(0);
  if (pedido.n !== atendido) {
    setAtendido(pedido.n);
    setPasso("escolha");
    setFeito(null);
    setErro(null);
    setHorasAbertas(false);
    setVerTodos(false);
    setServico(null);
    setTecnica(null);
    setDia(null);
    setHora(null);
    if (pedido.servico && agenda.servicos.some((s) => s.slug === pedido.servico)) {
      setServico(pedido.servico);
    }
  }

  const escolhido = agenda.servicos.find((s) => s.slug === servico) ?? null;
  const perguntaTecnica = Boolean(escolhido?.manutencao && agenda.volumes.length);
  const servicoPronto = Boolean((escolhido || semServicos) && (!perguntaTecnica || tecnica));
  // o serviço precisa caber inteiro: o volume de 3h não aparece às 10h se às 11h já tem alguém
  const duracao = escolhido?.duracao ?? null;
  const temLivre = new Set(diasAbertos(dias, duracao).map((d) => d.iso));
  const diaEscolhido = dias.find((d) => d.iso === dia) ?? null;
  const livresNoDia = diaEscolhido ? diaEscolhido.slots.filter((s) => cabeNoHorario(s, duracao)).length : 0;
  // o horário escolhido pode ter sido tomado entre um carregamento e outro
  const horaLivre = Boolean(diaEscolhido?.slots.some((s) => s.time === hora && cabeNoHorario(s, duracao)));
  const completo = Boolean(servicoPronto && escolhido && dia && horaLivre);
  // manutenção: o valor é o da manutenção do volume escolhido (o Fox eyes custa mais)
  const valor =
    (escolhido?.manutencao ? agenda.volumes.find((v) => v.nome === tecnica)?.manutencao : null) ??
    escolhido?.preco ??
    null;

  // a fita de dias vai até o fim do ano (50 e tantos dias): o botão do mês
  // leva direto a ele, e o mês que está à vista na fita fica aceso
  const meses = mesesDaAgenda(dias);
  const fitaRef = useRef<HTMLDivElement>(null);
  const [mesVisto, setMesVisto] = useState<string | null>(null);
  const quadroFita = useRef(0);
  const irAoMes = (iso: string) => {
    const fita = fitaRef.current;
    const alvo = fita?.querySelector<HTMLElement>(`[data-iso="${iso}"]`);
    if (!fita || !alvo) return;
    const folga = parseFloat(getComputedStyle(fita).paddingLeft) || 0;
    const dx = alvo.getBoundingClientRect().left - fita.getBoundingClientRect().left - folga;
    fita.scrollTo({ left: fita.scrollLeft + dx, behavior: "smooth" });
  };
  const aoRolarFita = () => {
    if (quadroFita.current) return;
    quadroFita.current = requestAnimationFrame(() => {
      quadroFita.current = 0;
      const fita = fitaRef.current;
      if (!fita) return;
      const borda = fita.getBoundingClientRect().left + (parseFloat(getComputedStyle(fita).paddingLeft) || 0);
      const primeiro = Array.from(fita.querySelectorAll<HTMLElement>("[data-iso]")).find(
        (el) => el.getBoundingClientRect().right > borda + 8,
      );
      const chave = primeiro?.dataset.iso?.slice(0, 7) ?? null;
      setMesVisto((m) => (m === chave ? m : chave));
    });
  };

  const buscarAgenda = () =>
    void agendaPublicaAction().then((r) => {
      if (r.ok) setFresca(r.data);
    });

  // abre/fecha o <dialog> nativo (foco preso, Esc, fundo inerte de graça)
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (aberta && !d.open) {
      buscarAgenda();
      void contaDaAgendaAction().then((r) => {
        if (r.ok) setConta(r.data);
      });
      d.showModal();
      corpoRef.current?.scrollTo(0, 0);
      document.documentElement.classList.add("ty-sem-rolagem");
      window.__tyLenis?.stop();
    } else if (!aberta && d.open) {
      d.close();
    }
  }, [aberta]);

  // cada passo começa do alto da folha
  useEffect(() => {
    corpoRef.current?.scrollTo(0, 0);
  }, [passo]);

  const aoFechar = () => {
    document.documentElement.classList.remove("ty-sem-rolagem");
    window.__tyLenis?.start();
    onFechar();
  };

  // arrastar a alça para baixo fecha a folha (como no iPhone)
  const arrasto = useRef<{ y0: number; t0: number; dy: number } | null>(null);
  const pegar = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse") return;
    if ((e.target as HTMLElement).closest("button")) return;
    arrasto.current = { y0: e.clientY, t0: performance.now(), dy: 0 };
    e.currentTarget.setPointerCapture(e.pointerId);
    ref.current?.setAttribute("data-arrastando", "");
  };
  const mover = (e: PointerEvent<HTMLDivElement>) => {
    const a = arrasto.current;
    if (!a || !ref.current) return;
    a.dy = Math.max(0, e.clientY - a.y0);
    ref.current.style.translate = `0 ${a.dy}px`;
  };
  const soltar = () => {
    const a = arrasto.current;
    const d = ref.current;
    arrasto.current = null;
    if (!a || !d) return;
    d.removeAttribute("data-arrastando");
    const velocidade = a.dy / Math.max(1, performance.now() - a.t0);
    d.style.translate = "";
    if (a.dy > 120 || velocidade > 0.6) onFechar();
  };

  const falta =
    !escolhido && !semServicos
      ? "Escolha o serviço"
      : perguntaTecnica && !tecnica
        ? "Escolha o volume"
        : !dia
          ? "Escolha o dia"
          : !horaLivre
            ? "Escolha o horário"
            : "";

  const nomeDoServico = escolhido
    ? tecnica && tecnica !== NAO_SEI
      ? `${escolhido.nome} · ${tecnica}`
      : escolhido.nome
    : "";

  /** marca o horário: entra (ou cria a conta) se precisar e grava o pedido */
  const agendar = (e?: FormEvent) => {
    e?.preventDefault();
    if (!escolhido || !dia || !hora || enviando) return;
    setErro(null);
    iniciar(async () => {
      let quem = conta;
      if (!quem) {
        const r =
          modo === "criar"
            ? await criarContaAgendaAction({ nome, whatsapp: whats, senha, confirmar, lembrar })
            : await entrarNaAgendaAction({ login, senha, lembrar });
        if (!r.ok) {
          setErro({ texto: r.error, campo: r.field });
          return;
        }
        quem = r.data;
        setConta(quem);
        setSenha("");
      }
      const nota =
        escolhido.manutencao && tecnica
          ? tecnica === NAO_SEI
            ? "Manutenção: ainda não sei o volume, quero ajuda para escolher."
            : `Manutenção do ${tecnica}.`
          : undefined;
      const b = await createAppointmentAction({ service_id: escolhido.id, date: dia, time: hora, note: nota });
      if (!b.ok) {
        buscarAgenda();
        // o horário foi tomado (ou fechado) enquanto ela escolhia: volta para escolher outro
        if (b.field === "time" || b.field === "date") {
          setHora(null);
          setPasso("escolha");
          setHorasAbertas(true);
        }
        setErro({ texto: b.error, campo: b.field });
        return;
      }
      setFeito({ id: b.data.id, servico: escolhido.nome, tecnica, dia, hora, valor, nome: quem.nome });
      setPasso("pronto");
      buscarAgenda();
    });
  };

  const sair = () =>
    iniciar(async () => {
      await sairDaContaAction();
      setConta(null);
      setModo("entrar");
    });

  const titulo =
    passo === "pronto" ? (
      <>
        Horário <em>reservado</em>
      </>
    ) : passo === "conta" ? (
      <>
        Quase <em>lá</em>
      </>
    ) : (
      <>
        Seu horário <em>com a Tayssa</em>
      </>
    );

  const sinalTexto = (
    <p>
      <b>Sinal de {reais(agenda.sinal)} no Pix</b> para confirmar.{" "}
      {agenda.pix
        ? `Depois de agendar, você copia o código Pix, paga e anexa o comprovante aqui. O horário fica guardado por ${agenda.sinalHoras}h esperando o comprovante.`
        : `O horário fica guardado por ${agenda.sinalHoras}h: a Tayssa te chama no WhatsApp para o sinal.`}
      {agenda.tolerancia > 0
        ? ` Tolerância de ${agenda.tolerancia} minutos de atraso: passando disso, você perde o sinal.`
        : ""}
    </p>
  );

  return (
    <dialog
      ref={ref}
      className="tyag"
      aria-labelledby={`${id}-t`}
      onClose={aoFechar}
      onClick={(e) => {
        // toque no fundo escuro (fora da folha) fecha
        if (e.target === e.currentTarget) onFechar();
      }}
    >
      <div
        className="tyag__topo"
        onPointerDown={pegar}
        onPointerMove={mover}
        onPointerUp={soltar}
        onPointerCancel={soltar}
      >
        <span className="tyag__alca" aria-hidden />
        <div className="tyag__cabeca">
          {passo === "conta" ? (
            <button
              type="button"
              className="tyag__fechar tyag__voltar"
              onClick={() => {
                setErro(null);
                setPasso("escolha");
              }}
              aria-label="Voltar para a escolha"
            >
              <svg viewBox="0 0 24 24" aria-hidden>
                <path d="M15 5l-7 7 7 7" />
              </svg>
            </button>
          ) : null}
          <h2 id={`${id}-t`} className="tyag__titulo">
            {titulo}
          </h2>
          <button type="button" className="tyag__fechar" onClick={onFechar} aria-label="Fechar">
            <svg viewBox="0 0 24 24" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      </div>

      <div className="tyag__corpo" ref={corpoRef}>
        {passo === "escolha" ? (
          <div className="tyag__passo" key="escolha">
            {semServicos ? null : (
              <fieldset className="tyag__grupo">
                <legend className="tyag__rotulo">O que você vai fazer?</legend>
                {escolhido && !verTodos && (!perguntaTecnica || tecnica) ? (
                  <div className="tyag__escolhido">
                    <span>
                      <b>{nomeDoServico}</b>
                      <small>{[valorLegivel(valor), duracaoLegivel(duracao)].filter(Boolean).join(" · ")}</small>
                    </span>
                    <button
                      type="button"
                      className="tyag__trocar"
                      onClick={() => {
                        setVerTodos(true);
                        setTecnica(null);
                      }}
                    >
                      Trocar
                    </button>
                  </div>
                ) : escolhido && perguntaTecnica && !tecnica && !verTodos ? (
                  <div className="tyag__escolhido">
                    <span>
                      <b>{escolhido.nome}</b>
                      <small>
                        {valorLegivel(
                          escolhido.preco,
                          agenda.volumes.map((v) => v.manutencao),
                        )}
                      </small>
                    </span>
                    <button type="button" className="tyag__trocar" onClick={() => setVerTodos(true)}>
                      Trocar
                    </button>
                  </div>
                ) : (
                  <div className="tyag__chips">
                    {(verTodos ? agenda.servicos : agenda.servicos.slice(0, VISIVEIS)).map((s) => {
                      const v = valorLegivel(s.preco, s.manutencao ? agenda.volumes.map((x) => x.manutencao) : []);
                      const ficha = [v, duracaoLegivel(s.duracao)].filter(Boolean).join(" · ");
                      return (
                        <label key={s.slug} className="tyag__chip tyag__chip--servico">
                          <input
                            type="radio"
                            name={`${id}-servico`}
                            value={s.slug}
                            checked={servico === s.slug}
                            onChange={() => escolherServico(s.slug)}
                            // tocar de novo no que já estava marcado (depois de "Trocar") fecha a lista
                            onClick={() => {
                              if (servico === s.slug) setVerTodos(false);
                            }}
                          />
                          <span>
                            {s.nome}
                            {ficha ? <small className="tyag__preco">{ficha}</small> : null}
                          </span>
                        </label>
                      );
                    })}
                    {!verTodos && agenda.servicos.length > VISIVEIS ? (
                      <button type="button" className="tyag__mais" onClick={() => setVerTodos(true)}>
                        Mais serviços
                        <small>{agenda.servicos.length - VISIVEIS}</small>
                        <svg viewBox="0 0 24 24" aria-hidden>
                          <path d="M9 6l6 6-6 6" />
                        </svg>
                      </button>
                    ) : null}
                  </div>
                )}
              </fieldset>
            )}

            {perguntaTecnica && !tecnica && !verTodos ? (
              <fieldset className="tyag__grupo tyag__grupo--entra">
                <legend className="tyag__rotulo">De qual volume é a manutenção?</legend>
                <div className="tyag__chips">
                  {[...agenda.volumes, { nome: NAO_SEI, manutencao: null }].map((v) => (
                    <label
                      key={v.nome}
                      className={["tyag__chip", v.nome === NAO_SEI ? "tyag__chip--leve" : ""].join(" ")}
                    >
                      <input
                        type="radio"
                        name={`${id}-tecnica`}
                        value={v.nome}
                        checked={tecnica === v.nome}
                        onChange={() => setTecnica(v.nome)}
                      />
                      <span>
                        {v.nome === NAO_SEI ? "Ainda não sei" : v.nome}
                        {v.manutencao != null ? <small className="tyag__preco">{reais(v.manutencao)}</small> : null}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ) : null}

            {servicoPronto && !verTodos ? (
              <fieldset className="tyag__grupo tyag__grupo--entra">
                <legend className="tyag__rotulo">Qual dia?</legend>
                {meses.length > 1 ? (
                  <div className="tyag__meses" role="group" aria-label="Ir para o mês">
                    {meses.map((m) => (
                      <button
                        key={m.chave}
                        type="button"
                        className="tyag__mes"
                        data-on={(mesVisto ?? meses[0].chave) === m.chave}
                        onClick={() => irAoMes(m.primeiro)}
                      >
                        {m.nome}
                      </button>
                    ))}
                  </div>
                ) : null}
                {dias.length ? (
                  <div className="tyag__dias" role="presentation" ref={fitaRef} onScroll={aoRolarFita}>
                    {dias.map((d) => {
                      const p = partesDoDia(d.iso);
                      // dia sem horário livre não some: fica riscado, como "lotado"
                      const lotado = !temLivre.has(d.iso);
                      return (
                        <label key={d.iso} className="tyag__dia" data-iso={d.iso} data-lotado={lotado || undefined}>
                          <input
                            type="radio"
                            name={`${id}-dia`}
                            value={d.iso}
                            checked={dia === d.iso}
                            disabled={lotado}
                            onChange={() => {
                              setDia(d.iso);
                              setErro(null);
                              setHora((h) =>
                                h && d.slots.some((s) => s.time === h && cabeNoHorario(s, duracao)) ? h : null,
                              );
                            }}
                            aria-label={`${diaLegivel(d.iso)}${lotado ? ", sem horário livre" : ""}`}
                          />
                          <span aria-hidden>
                            <small>{p.semana}</small>
                            <b>{p.numero}</b>
                            <small>{lotado ? "lotado" : p.mes}</small>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <p className="tyag__aviso">
                    A agenda do site está sem horário agora. Chame a Tayssa no WhatsApp que ela encaixa você.
                  </p>
                )}
              </fieldset>
            ) : null}

            {servicoPronto && !verTodos && diaEscolhido ? (
              <div className="tyag__grupo tyag__grupo--entra">
                <span className="tyag__rotulo" id={`${id}-h`}>
                  Qual horário?
                  <span className="tyag__rotulo-dica">{diaLegivel(diaEscolhido.iso)}</span>
                </span>
                <button
                  type="button"
                  className="tyag__hora-btn"
                  aria-expanded={horasAbertas}
                  aria-controls={`${id}-horas`}
                  data-escolhida={hora && horaLivre ? "" : undefined}
                  onClick={() => setHorasAbertas((v) => !v)}
                >
                  <span>{hora && horaLivre ? horaLegivel(hora) : "Escolher horário"}</span>
                  <small>
                    {hora && horaLivre
                      ? duracaoLegivel(duracao)
                        ? `${duracaoLegivel(duracao)} de atendimento`
                        : "trocar"
                      : `${livresNoDia} ${livresNoDia === 1 ? "livre" : "livres"}`}
                  </small>
                  <svg viewBox="0 0 24 24" aria-hidden>
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {horasAbertas ? (
                  <div className="tyag__cartao-horas" id={`${id}-horas`} role="group" aria-labelledby={`${id}-h`}>
                    <div className="tyag__horas">
                      {diaEscolhido.slots.map((s) => {
                        const cabe = cabeNoHorario(s, duracao);
                        return (
                          <label key={s.time} className="tyag__chip tyag__chip--hora" data-ocupado={!cabe || undefined}>
                            <input
                              type="radio"
                              name={`${id}-hora`}
                              value={s.time}
                              disabled={!cabe}
                              checked={hora === s.time}
                              onChange={() => {
                                setHora(s.time);
                                setErro(null);
                                setHorasAbertas(false);
                              }}
                              aria-label={`${horaLegivel(s.time)}${cabe ? "" : s.available ? ", sem tempo para esse serviço" : ", ocupado"}`}
                            />
                            <span aria-hidden>{horaLegivel(s.time)}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {erro && passo === "escolha" ? (
              <p className="tyag__erro" role="alert">
                {erro.texto}
              </p>
            ) : null}
          </div>
        ) : null}

        {passo === "conta" && escolhido && dia && hora ? (
          <form className="tyag__passo" key="conta" id={`${id}-form`} onSubmit={agendar} noValidate>
            <div className="tyag__resumo">
              <b>{nomeDoServico}</b>
              <span>
                {diaLegivel(dia)} às {horaLegivel(hora)}
                {valor != null ? ` · ${reais(valor)}` : ""}
              </span>
            </div>

            {conta ? (
              <p className="tyag__quem">
                Agendando como <b>{conta.nome}</b>.{" "}
                <button type="button" className="tyag__link" onClick={sair} disabled={enviando}>
                  Não é você? Sair
                </button>
              </p>
            ) : (
              <div className="tyag__grupo">
                <div className="tyag__segmento" role="tablist" aria-label="Sua conta">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={modo === "criar"}
                    onClick={() => {
                      setModo("criar");
                      setErro(null);
                    }}
                  >
                    Criar conta
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={modo === "entrar"}
                    onClick={() => {
                      setModo("entrar");
                      setErro(null);
                    }}
                  >
                    Já tenho conta
                  </button>
                </div>
                {modo === "criar" ? (
                  <div className="tyag__campos">
                    <Campo
                      id={`${id}-nome`}
                      rotulo="Seu nome"
                      valor={nome}
                      mudar={setNome}
                      erro={erro?.campo === "nome" ? erro.texto : undefined}
                      autoComplete="name"
                      autoCapitalize="words"
                      placeholder="Como a Tayssa te chama"
                    />
                    <Campo
                      id={`${id}-whats`}
                      rotulo="Seu WhatsApp"
                      valor={whats}
                      mudar={setWhats}
                      erro={erro?.campo === "whatsapp" ? erro.texto : undefined}
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel-national"
                      placeholder="(11) 99999-9999"
                    />
                    <Campo
                      id={`${id}-senha`}
                      rotulo="Crie uma senha"
                      valor={senha}
                      mudar={setSenha}
                      erro={erro?.campo === "senha" ? erro.texto : undefined}
                      senha
                      autoComplete="new-password"
                      placeholder="Pelo menos 8 letras ou números"
                    />
                    <Campo
                      id={`${id}-confirmar`}
                      rotulo="Repita a senha"
                      valor={confirmar}
                      mudar={setConfirmar}
                      erro={
                        erro?.campo === "confirmar"
                          ? erro.texto
                          : confirmar && senha && confirmar.length >= senha.length && confirmar !== senha
                            ? "As senhas não são iguais"
                            : undefined
                      }
                      senha
                      autoComplete="new-password"
                    />
                    <Lembrar ligado={lembrar} mudar={setLembrar} />
                  </div>
                ) : (
                  <div className="tyag__campos">
                    <Campo
                      id={`${id}-login`}
                      rotulo="WhatsApp ou e-mail"
                      valor={login}
                      mudar={setLogin}
                      erro={erro?.campo === "login" ? erro.texto : undefined}
                      autoComplete="username"
                      autoCapitalize="none"
                      placeholder="(11) 99999-9999"
                    />
                    <Campo
                      id={`${id}-senha2`}
                      rotulo="Sua senha"
                      valor={senha}
                      mudar={setSenha}
                      erro={erro?.campo === "password" ? erro.texto : undefined}
                      senha
                      autoComplete="current-password"
                    />
                    <Lembrar ligado={lembrar} mudar={setLembrar} />
                  </div>
                )}
              </div>
            )}

            {erro && !["nome", "whatsapp", "senha", "confirmar", "login", "password"].includes(erro.campo ?? "") ? (
              <p className="tyag__erro" role="alert">
                {erro.texto}
                {/^Você já tem/.test(erro.texto) ? (
                  <>
                    {" "}
                    <a className="tyag__link" href={ROUTES.vipBook}>
                      Ver meus horários
                    </a>
                  </>
                ) : null}
              </p>
            ) : null}

            <div className="tyag__sinal">
              <span className="tyag__sinal-icone" aria-hidden>
                <svg viewBox="0 0 24 24">
                  <path d="M12 3.5l7 3v5.2c0 4.3-2.9 7.6-7 8.8-4.1-1.2-7-4.5-7-8.8V6.5l7-3z" />
                  <path d="M8.8 12.2l2.2 2.2 4.3-4.6" />
                </svg>
              </span>
              {sinalTexto}
            </div>
          </form>
        ) : null}

        {passo === "pronto" && feito ? (
          <div className="tyag__passo tyag__pronto" key="pronto" role="status">
            <span className="tyag__check" aria-hidden>
              <svg viewBox="0 0 24 24">
                <path d="M5 12.5l4.2 4.2L19 7" />
              </svg>
            </span>
            <p className="tyag__pronto-titulo">{feito.nome}, seu horário está guardado.</p>
            <div className="tyag__resumo">
              <b>
                {feito.tecnica && feito.tecnica !== NAO_SEI ? `${feito.servico} · ${feito.tecnica}` : feito.servico}
              </b>
              <span>
                {diaLegivel(feito.dia)} às {horaLegivel(feito.hora)}
                {feito.valor != null ? ` · ${reais(feito.valor)}` : ""}
              </span>
            </div>
            <p className="tyag__pronto-texto">
              Ele vale depois do sinal de {reais(agenda.sinal)} no Pix. Pague e anexe o comprovante: sem ele em{" "}
              {agenda.sinalHoras}h, o horário volta para a agenda.
              {agenda.tolerancia > 0
                ? ` No dia, a tolerância é de ${agenda.tolerancia} minutos: passando disso, você perde o sinal.`
                : ""}
            </p>
            {/* o sinal em três passos: copiar o Pix, anexar o comprovante, avisar a Tayssa (modelo Reflexo do Santo) */}
            <PagarSinal
              tema="perola"
              pedido={{
                id: feito.id,
                servico: feito.servico,
                tecnica: feito.tecnica === NAO_SEI ? "ainda não sei qual, quero ajuda para escolher" : feito.tecnica,
                dia: feito.dia,
                hora: feito.hora,
                valor: feito.valor,
              }}
              nome={feito.nome}
              sinal={agenda.sinal}
              telefone={agenda.telefone}
              pix={agenda.pix}
            />
            <a className="tyag__link tyag__link--centro" href={ROUTES.vipBook}>
              Ver meus horários
            </a>
          </div>
        ) : null}
      </div>

      {/* no "Horário reservado" os passos do sinal moram no corpo: sem rodapé */}
      {passo !== "pronto" ? (
        <div className="tyag__pe">
          {passo === "escolha" ? (
            <button
              // chave própria: o botão de agendar do passo seguinte nasce outro elemento. Com o
              // mesmo, ele virava "submit" no meio do toque e enviava o formulário vazio
              key="continuar"
              type="button"
              className="tyag__enviar"
              disabled={!completo}
              onClick={(e) => {
                e.preventDefault();
                setErro(null);
                setPasso("conta");
              }}
            >
              {completo ? "Continuar" : falta}
            </button>
          ) : passo === "conta" ? (
            <button key="agendar" type="submit" form={`${id}-form`} className="tyag__enviar" disabled={enviando}>
              {enviando
                ? "Agendando…"
                : conta
                  ? "Agendar"
                  : modo === "criar"
                    ? "Criar conta e agendar"
                    : "Entrar e agendar"}
            </button>
          ) : null}
        </div>
      ) : null}
    </dialog>
  );
}

function Campo({
  id,
  rotulo,
  valor,
  mudar,
  erro,
  senha = false,
  ...resto
}: {
  id: string;
  rotulo: string;
  valor: string;
  mudar: (v: string) => void;
  erro?: string;
  /** campo de senha: com o olhinho para ver o que digitou */
  senha?: boolean;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "value" | "onChange">) {
  const [ver, setVer] = useState(false);
  const campo = (
    <input
      id={id}
      className="tyag__campo"
      value={valor}
      onChange={(e) => mudar(e.target.value)}
      aria-invalid={erro ? true : undefined}
      aria-describedby={erro ? `${id}-erro` : undefined}
      {...(senha
        ? { type: ver ? "text" : "password", autoCapitalize: "none", autoCorrect: "off", spellCheck: false }
        : {})}
      {...resto}
    />
  );
  return (
    <div className="tyag__campo-grupo">
      <label className="tyag__rotulo" htmlFor={id}>
        {rotulo}
      </label>
      {senha ? (
        <div className="ty-senha">
          {campo}
          <OlhoDaSenha ver={ver} alternar={() => setVer((v) => !v)} className="tyag__olho" />
        </div>
      ) : (
        campo
      )}
      {erro ? (
        <p className="tyag__erro tyag__erro--campo" id={`${id}-erro`} role="alert">
          {erro}
        </p>
      ) : null}
    </div>
  );
}

/** "Manter conectada neste celular": desmarcado, a conta sai quando o navegador fecha */
function Lembrar({ ligado, mudar }: { ligado: boolean; mudar: (v: boolean) => void }) {
  return (
    <label className="ty-lembrar tyag__lembrar">
      <input type="checkbox" checked={ligado} onChange={(e) => mudar(e.target.checked)} />
      <span>Manter conectada neste celular</span>
    </label>
  );
}
