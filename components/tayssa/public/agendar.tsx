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
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { whatsappUrl } from "@/lib/tayssa/whatsapp";
import { agendaPublicaAction } from "@/lib/tayssa/actions/agenda";
import {
  cabeNoHorario,
  diasAbertos,
  duracaoLegivel,
  horaLegivel,
  mensagemAgendamento,
  partesDoDia,
  reais,
  diaLegivel,
  valorLegivel,
  type DiaAgenda,
} from "@/lib/tayssa/agendar";

export type ServicoAgenda = {
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
};

type Ctx = { abrir: (servico?: string) => void };
const AgendarCtx = createContext<Ctx | null>(null);

const NOME_SALVO = "ty_agendar_nome";
const NAO_SEI = "Ainda não sei — quero ajuda para escolher";

/**
 * O "Agendar" do site inteiro. Todo botão de agendar abre esta folha:
 * serviço (e o volume, quando é cílios), um dia e um horário livres e o
 * nome; o pedido sai pronto no WhatsApp da Tayssa, pedindo a chave Pix do
 * sinal. Nada é gravado — ela confirma na conversa.
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

  const [servico, setServico] = useState<string | null>(null);
  const [tecnica, setTecnica] = useState<string | null>(null);
  const [dia, setDia] = useState<string | null>(null);
  const [hora, setHora] = useState<string | null>(null);
  const [nome, setNome] = useState("");

  /** troca de serviço: o dia e a hora que não comportam o tempo dele saem */
  const escolherServico = (slug: string) => {
    setServico(slug);
    setTecnica(null);
    const novo = agenda.servicos.find((s) => s.slug === slug)?.duracao ?? null;
    const d = dias.find((x) => x.iso === dia);
    if (!d || !d.slots.some((s) => cabeNoHorario(s, novo))) {
      setDia(null);
      setHora(null);
    } else if (!d.slots.some((s) => s.time === hora && cabeNoHorario(s, novo))) {
      setHora(null);
    }
  };

  // pedido novo: marca o serviço do botão que abriu e lembra o nome de antes
  // (ajuste de estado no render, sem efeito — padrão do React)
  const [atendido, setAtendido] = useState(0);
  if (pedido.n !== atendido) {
    setAtendido(pedido.n);
    if (pedido.servico && agenda.servicos.some((s) => s.slug === pedido.servico)) {
      escolherServico(pedido.servico);
    }
    if (!nome) {
      try {
        const salvo = localStorage.getItem(NOME_SALVO);
        if (salvo) setNome(salvo);
      } catch {}
    }
  }

  const escolhido = agenda.servicos.find((s) => s.slug === servico) ?? null;
  const perguntaTecnica = Boolean(escolhido?.manutencao && agenda.volumes.length);
  // o serviço precisa caber inteiro: o volume de 3h não aparece às 10h se às 11h já tem alguém
  const duracao = escolhido?.duracao ?? null;
  const temLivre = new Set(diasAbertos(dias, duracao).map((d) => d.iso));
  const diaEscolhido = dias.find((d) => d.iso === dia) ?? null;

  // abre/fecha o <dialog> nativo (foco preso, Esc, fundo inerte de graça)
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (aberta && !d.open) {
      void agendaPublicaAction().then((r) => {
        if (r.ok) setFresca(r.data);
      });
      d.showModal();
      corpoRef.current?.scrollTo(0, 0);
      document.documentElement.classList.add("ty-sem-rolagem");
      window.__tyLenis?.stop();
    } else if (!aberta && d.open) {
      d.close();
    }
  }, [aberta]);

  const aoFechar = () => {
    document.documentElement.classList.remove("ty-sem-rolagem");
    window.__tyLenis?.start();
    onFechar();
  };

  // arrastar a alça para baixo fecha a folha (como no iPhone)
  const arrasto = useRef<{ y0: number; t0: number; dy: number } | null>(null);
  const pegar = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse") return;
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

  // o horário escolhido pode ter sido tomado entre um carregamento e outro
  // (ou não ter tempo para o serviço que ela trocou depois)
  const horaLivre = Boolean(diaEscolhido?.slots.some((s) => s.time === hora && cabeNoHorario(s, duracao)));
  const completo = Boolean(
    (escolhido || semServicos) && dia && horaLivre && nome.trim() && (!perguntaTecnica || tecnica),
  );
  const mensagem = completo
    ? mensagemAgendamento({
        servico: escolhido?.nome ?? "a combinar com você",
        tecnica: tecnica === NAO_SEI ? "ainda não sei qual, quero ajuda para escolher" : tecnica,
        dia: dia!,
        hora: hora!,
        nome,
        // manutenção: o valor é o da manutenção do volume escolhido (o Fox eyes custa mais)
        valor:
          (escolhido?.manutencao ? agenda.volumes.find((v) => v.nome === tecnica)?.manutencao : null) ??
          escolhido?.preco ??
          null,
        sinal: agenda.sinal,
      })
    : "";
  const falta =
    !escolhido && !semServicos
      ? "Escolha o serviço"
      : perguntaTecnica && !tecnica
        ? "Escolha o volume"
        : !dia
          ? "Escolha o dia"
          : !horaLivre
            ? "Escolha o horário"
            : "Escreva seu nome";

  const enviar = () => {
    try {
      localStorage.setItem(NOME_SALVO, nome.trim());
    } catch {}
    // o link abre o WhatsApp; a folha sai logo depois
    window.setTimeout(onFechar, 250);
  };

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
          <h2 id={`${id}-t`} className="tyag__titulo">
            Seu horário <em>com a Tayssa</em>
          </h2>
          <button type="button" className="tyag__fechar" onClick={onFechar} aria-label="Fechar">
            <svg viewBox="0 0 24 24" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      </div>

      <div className="tyag__corpo" ref={corpoRef}>
        {semServicos ? null : (
          <fieldset className="tyag__grupo">
            <legend className="tyag__rotulo">O que você vai fazer?</legend>
            <div className="tyag__chips">
              {agenda.servicos.map((s) => {
                const valor = valorLegivel(s.preco, s.manutencao ? agenda.volumes.map((v) => v.manutencao) : []);
                const ficha = [valor, duracaoLegivel(s.duracao)].filter(Boolean).join(" · ");
                return (
                  <label key={s.slug} className="tyag__chip">
                    <input
                      type="radio"
                      name={`${id}-servico`}
                      value={s.slug}
                      checked={servico === s.slug}
                      onChange={() => escolherServico(s.slug)}
                    />
                    <span>
                      {s.nome}
                      {ficha ? <small className="tyag__preco">{ficha}</small> : null}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        )}

        {perguntaTecnica ? (
          <fieldset className="tyag__grupo tyag__grupo--entra">
            <legend className="tyag__rotulo">De qual volume é a manutenção?</legend>
            <div className="tyag__chips">
              {[...agenda.volumes, { nome: NAO_SEI, manutencao: null }].map((v) => (
                <label key={v.nome} className={["tyag__chip", v.nome === NAO_SEI ? "tyag__chip--leve" : ""].join(" ")}>
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

        <fieldset className="tyag__grupo">
          <legend className="tyag__rotulo">Qual dia?</legend>
          {dias.length ? (
            <div className="tyag__dias" role="presentation">
              {dias.map((d) => {
                const p = partesDoDia(d.iso);
                // dia sem horário livre não some: fica riscado, como "lotado"
                const lotado = !temLivre.has(d.iso);
                return (
                  <label key={d.iso} className="tyag__dia" data-lotado={lotado || undefined}>
                    <input
                      type="radio"
                      name={`${id}-dia`}
                      value={d.iso}
                      checked={dia === d.iso}
                      disabled={lotado}
                      onChange={() => {
                        setDia(d.iso);
                        setHora((h) => (h && d.slots.some((s) => s.time === h && cabeNoHorario(s, duracao)) ? h : null));
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

        <fieldset className="tyag__grupo" disabled={!diaEscolhido}>
          <legend className="tyag__rotulo">
            Qual horário?
            {diaEscolhido ? (
              <span className="tyag__rotulo-dica">
                {diaLegivel(diaEscolhido.iso)}
                {escolhido && duracaoLegivel(duracao) ? ` · ${duracaoLegivel(duracao)} de atendimento` : ""}
              </span>
            ) : null}
          </legend>
          {diaEscolhido ? (
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
                      onChange={() => setHora(s.time)}
                      aria-label={`${horaLegivel(s.time)}${cabe ? "" : s.available ? ", sem tempo para esse serviço" : ", ocupado"}`}
                    />
                    <span aria-hidden>{horaLegivel(s.time)}</span>
                  </label>
                );
              })}
            </div>
          ) : (
            <p className="tyag__vazio">Escolha o dia para ver os horários livres.</p>
          )}
        </fieldset>

        <div className="tyag__grupo">
          <label className="tyag__rotulo" htmlFor={`${id}-nome`}>
            Seu nome
          </label>
          <input
            id={`${id}-nome`}
            className="tyag__campo"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            autoComplete="given-name"
            autoCapitalize="words"
            enterKeyHint="done"
            maxLength={60}
            placeholder="Como a Tayssa te chama"
          />
        </div>

        <div className="tyag__sinal">
          <span className="tyag__sinal-icone" aria-hidden>
            <svg viewBox="0 0 24 24">
              <path d="M12 3.5l7 3v5.2c0 4.3-2.9 7.6-7 8.8-4.1-1.2-7-4.5-7-8.8V6.5l7-3z" />
              <path d="M8.8 12.2l2.2 2.2 4.3-4.6" />
            </svg>
          </span>
          <p>
            <b>Sinal de {reais(agenda.sinal)} no Pix</b> para garantir o horário. A Tayssa te manda a chave na conversa.
          </p>
        </div>
      </div>

      <div className="tyag__pe">
        {completo ? (
          <a
            className="tyag__enviar"
            href={whatsappUrl(agenda.telefone, mensagem)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={enviar}
          >
            <IconeWhats />
            Enviar no WhatsApp
          </a>
        ) : (
          <button type="button" className="tyag__enviar" disabled aria-disabled>
            {falta}
          </button>
        )}
      </div>
    </dialog>
  );
}

function IconeWhats() {
  return (
    <svg className="tyag__whats" viewBox="0 0 24 24" aria-hidden>
      <path d="M12 3.2a8.8 8.8 0 0 0-7.6 13.2L3.2 20.8l4.5-1.2A8.8 8.8 0 1 0 12 3.2z" />
      <path d="M9.1 8.2c.2-.4.5-.4.7-.4h.5c.2 0 .4 0 .5.4l.7 1.7c.1.2 0 .4-.1.6l-.5.6c-.1.1-.2.3 0 .5.5.9 1.4 1.8 2.4 2.3.2.1.4.1.5 0l.6-.7c.2-.2.4-.2.6-.1l1.6.8c.3.1.3.3.3.5 0 .5-.2 1.2-.8 1.5-.6.4-1.5.5-2.8-.1a9.4 9.4 0 0 1-4.3-4.1c-.6-1.2-.4-2.3-.3-2.6z" />
    </svg>
  );
}
