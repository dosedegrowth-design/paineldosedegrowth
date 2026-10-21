"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { enviarBriefingAction, salvarParteBriefingAction } from "@/lib/tayssa/actions/briefing";
import {
  DIAS,
  GRUPOS_MIDIA,
  PAGAMENTOS,
  SECAO_DO_TIPO,
  SECOES,
  parteFeita,
  progresso,
  type ArquivoBriefing,
  type Respostas,
  type SecaoId,
} from "@/lib/tayssa/briefing";
import type { BeneficioAtual, BriefingCompleto } from "@/lib/tayssa/queries/briefing";
import { Arquivos, Campo, Chips, Escolha, Interruptor, Texto } from "@/components/briefing/campos";

type Estado = "" | "salvando" | "salvo" | "erro";
type Prontos = Partial<Record<SecaoId, boolean>>;

/** O que já foi salvo por cima do que o site tem hoje (serviços, agenda, regras). */
function juntar(padroes: Respostas, partes: BriefingCompleto["partes"]): Respostas {
  const r = structuredClone(padroes) as Respostas;
  for (const s of SECOES) {
    const salvo = partes[s.id];
    if (!salvo) continue;
    const { pronto: _pronto, ...dados } = salvo;
    void _pronto;
    (r as Record<SecaoId, unknown>)[s.id] = { ...padroes[s.id], ...dados };
  }
  // regra nova do VIP que apareceu depois de ela responder também entra
  r.vip = { beneficios: { ...padroes.vip.beneficios, ...(r.vip?.beneficios ?? {}) } };
  return r;
}

const quando = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

export function BriefingForm({
  chave,
  partes,
  padroes,
  arquivos: arquivosIniciais,
  beneficios,
  enviadoEm,
}: BriefingCompleto & { chave: string }) {
  const [resp, setResp] = useState<Respostas>(() => juntar(padroes, partes));
  const [prontos, setProntos] = useState<Prontos>(() =>
    Object.fromEntries(SECOES.map((s) => [s.id, Boolean(partes[s.id]?.pronto)])),
  );
  const [arquivos, setArquivos] = useState<ArquivoBriefing[]>(arquivosIniciais);
  const [estado, setEstado] = useState<Estado>("");
  const [enviado, setEnviado] = useState<string | null>(enviadoEm);
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);

  // parte que ela ainda não tocou não conta, mesmo vindo preenchida com o
  // que o site tem hoje (serviços, agenda): quem confere é ela
  const [tocadas, setTocadas] = useState<ReadonlySet<SecaoId>>(() => new Set(Object.keys(partes) as SecaoId[]));
  const mexeu = (id: SecaoId) => tocadas.has(id) || arquivos.some((a) => SECAO_DO_TIPO[a.tipo] === id);
  const feita = (id: SecaoId) => Boolean(prontos[id]) || (mexeu(id) && parteFeita(id, resp[id] as never, arquivos));
  const [aberta, setAberta] = useState<SecaoId | null>(() => SECOES.find((s) => !feita(s.id))?.id ?? null);

  // ---- salvar sozinho: cada parte mexida vai ao banco numa pausa da digitação,
  // uma de cada vez (a fila nunca deixa um envio velho passar por cima do novo)
  const respRef = useRef(resp);
  const prontosRef = useRef(prontos);
  useEffect(() => {
    respRef.current = resp;
    prontosRef.current = prontos;
  }, [resp, prontos]);
  const sujas = useRef(new Set<SecaoId>());
  const fila = useRef<Promise<void>>(Promise.resolve());
  const relogio = useRef<number | undefined>(undefined);

  const descarregar = useCallback(() => {
    window.clearTimeout(relogio.current);
    if (!sujas.current.size) return fila.current;
    const vez = [...sujas.current];
    sujas.current.clear();
    setEstado("salvando");
    fila.current = fila.current.then(async () => {
      let falhou = false;
      for (const secao of vez) {
        const r = await salvarParteBriefingAction({
          k: chave,
          secao,
          dados: respRef.current[secao],
          pronto: prontosRef.current[secao],
        }).catch(() => null);
        if (!r?.ok) {
          falhou = true;
          sujas.current.add(secao); // tenta de novo na próxima pausa
        }
      }
      setEstado(falhou ? "erro" : sujas.current.size ? "salvando" : "salvo");
    });
    return fila.current;
  }, [chave]);

  const sujar = useCallback(
    (secao: SecaoId) => {
      sujas.current.add(secao);
      setEstado("salvando");
      window.clearTimeout(relogio.current);
      relogio.current = window.setTimeout(descarregar, 900);
    },
    [descarregar],
  );

  // saiu do app (trocou de aba, bloqueou a tela): salva na hora
  useEffect(() => {
    const sair = () => {
      if (document.visibilityState === "hidden") void descarregar();
    };
    document.addEventListener("visibilitychange", sair);
    window.addEventListener("pagehide", sair);
    return () => {
      document.removeEventListener("visibilitychange", sair);
      window.removeEventListener("pagehide", sair);
    };
  }, [descarregar]);

  function mudar<K extends SecaoId>(secao: K, patch: Partial<Respostas[K]>) {
    setTocadas((t) => (t.has(secao) ? t : new Set(t).add(secao)));
    setResp((r) => {
      const novo = { ...r, [secao]: { ...r[secao], ...patch } };
      respRef.current = novo;
      return novo;
    });
    sujar(secao);
  }

  function pronto(secao: SecaoId) {
    const novos = { ...prontosRef.current, [secao]: true };
    prontosRef.current = novos;
    setProntos(novos);
    sujar(secao);
    void descarregar();
    const i = SECOES.findIndex((s) => s.id === secao);
    const proxima = SECOES.slice(i + 1).find((s) => !feita(s.id)) ?? SECOES[SECOES.length - 1];
    setAberta(proxima.id);
    requestAnimationFrame(() =>
      document.getElementById(`parte-${proxima.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  }

  async function enviar() {
    setEnviando(true);
    setErroEnvio(null);
    sujar("final");
    await descarregar();
    // alguma parte não chegou ao banco (sem internet)? não marca como enviado
    if (sujas.current.size) {
      await descarregar();
      if (sujas.current.size) {
        setEnviando(false);
        setErroEnvio("Algumas respostas ainda não foram salvas. Confira a internet e toque em enviar de novo.");
        return;
      }
    }
    const r = await enviarBriefingAction({ k: chave });
    setEnviando(false);
    if (r.ok) setEnviado(r.data.enviadoEm);
    else setErroEnvio(r.error);
  }

  const { feitas, total } = progresso(
    Object.fromEntries(
      SECOES.filter((s) => mexeu(s.id) || prontos[s.id]).map((s) => [s.id, { ...(resp[s.id] as object), pronto: prontos[s.id] }]),
    ),
    arquivos,
  );

  const corpo: Record<SecaoId, React.ReactNode> = {
    voce: (
      <>
        <Campo rotulo="Como você quer ser chamada no site" valor={resp.voce.nome} onChange={(v) => mudar("voce", { nome: v })} placeholder="Tayssa" />
        <Texto
          rotulo="Sua história, em poucas linhas"
          dica="2 a 4 parágrafos curtos, do seu jeito: como começou, o que te move, como é ser atendida por você."
          valor={resp.voce.bio}
          onChange={(v) => mudar("voce", { bio: v })}
          linhas={8}
        />
        <Campo rotulo="Há quanto tempo você atende?" valor={resp.voce.tempo} onChange={(v) => mudar("voce", { tempo: v })} placeholder="Ex.: 6 anos" />
        <Texto
          rotulo="Cursos e formação"
          dica="Nome do curso ou da escola e o ano. Um por linha."
          valor={resp.voce.formacao}
          onChange={(v) => mudar("voce", { formacao: v })}
        />
        <Arquivos
          chave={chave}
          tipo="retrato"
          titulo="Uma foto sua"
          dica="Em pé, com boa luz. Vai do lado da sua história."
          varios={false}
          aceita="foto"
          arquivos={arquivos}
          onMudou={setArquivos}
        />
      </>
    ),
    servicos: (
      <>
        <p className="ddgb-nota">Já estão aqui os serviços que o site mostra hoje. Corrija, complete ou tire o que não faz mais.</p>
        {resp.servicos.itens.map((s, i) => {
          const muda = (patch: Partial<typeof s>) =>
            mudar("servicos", { itens: resp.servicos.itens.map((x, j) => (j === i ? { ...x, ...patch } : x)) });
          return (
            <div key={i} className="ddgb-item">
              <div className="ddgb-item__cabeca">
                <span className="ddgb-item__n">{i + 1}</span>
                <button
                  type="button"
                  className="ddgb-link ddgb-link--quieto"
                  onClick={() => mudar("servicos", { itens: resp.servicos.itens.filter((_, j) => j !== i) })}
                >
                  Tirar
                </button>
              </div>
              <Campo rotulo="Nome do serviço" valor={s.nome} onChange={(v) => muda({ nome: v })} />
              <Texto rotulo="Em uma frase, o que é" valor={s.frase} onChange={(v) => muda({ frase: v })} linhas={2} />
              <Texto rotulo="O que o seu tem de diferente" valor={s.diferencial} onChange={(v) => muda({ diferencial: v })} linhas={2} />
              <div className="ddgb-dupla">
                <Campo rotulo="Quanto tempo leva" valor={s.duracao} onChange={(v) => muda({ duracao: v })} placeholder="Ex.: 2h" />
                <Campo rotulo="Valor (R$)" valor={s.valor} onChange={(v) => muda({ valor: v })} inputMode="decimal" placeholder="Ex.: 260" />
              </div>
              <Interruptor rotulo="Mostrar o valor no site" ligado={s.mostrarValor} onChange={(v) => muda({ mostrarValor: v })} />
            </div>
          );
        })}
        <button
          type="button"
          className="ddgb-mais"
          onClick={() =>
            mudar("servicos", {
              itens: [...resp.servicos.itens, { nome: "", frase: "", diferencial: "", duracao: "", valor: "", mostrarValor: true }],
            })
          }
        >
          + Adicionar serviço
        </button>
      </>
    ),
    atendimento: (
      <>
        <Chips
          rotulo="Dias em que você atende"
          opcoes={DIAS.map((nome, valor) => ({ valor, nome })).slice(1).concat([{ valor: 0, nome: "Dom" }])}
          marcados={resp.atendimento.dias}
          onChange={(v) => mudar("atendimento", { dias: v })}
        />
        <Campo
          rotulo="Horários que a cliente pode marcar"
          dica="Os horários de início, separados por vírgula."
          valor={resp.atendimento.horarios}
          onChange={(v) => mudar("atendimento", { horarios: v })}
          placeholder="09:00, 10:30, 12:00"
        />
        <Campo
          rotulo="Com quanta antecedência ela pode marcar?"
          valor={resp.atendimento.antecedencia}
          onChange={(v) => mudar("atendimento", { antecedencia: v })}
          placeholder="Ex.: 12 horas"
        />
        <div className="ddgb-dupla">
          <Campo
            rotulo="Sinal para garantir (R$)"
            dica="Vazio = sem sinal."
            valor={resp.atendimento.sinal}
            onChange={(v) => mudar("atendimento", { sinal: v })}
            inputMode="decimal"
          />
          <Campo rotulo="Chave Pix do sinal" dica="Se quiser que vá na mensagem." valor={resp.atendimento.pix} onChange={(v) => mudar("atendimento", { pix: v })} />
        </div>
        <Chips
          rotulo="Formas de pagamento"
          opcoes={PAGAMENTOS.map((p) => ({ valor: p, nome: p }))}
          marcados={resp.atendimento.pagamentos}
          onChange={(v) => mudar("atendimento", { pagamentos: v })}
        />
        <Texto
          rotulo="Atraso e remarcação"
          dica="Quanto tempo de tolerância? Até quando pode remarcar? O sinal volta?"
          valor={resp.atendimento.atraso}
          onChange={(v) => mudar("atendimento", { atraso: v })}
          linhas={3}
        />
        <Campo rotulo="Endereço do estúdio" valor={resp.atendimento.endereco} onChange={(v) => mudar("atendimento", { endereco: v })} />
        <Escolha
          rotulo="No site, mostrar"
          opcoes={[
            { valor: "completo", nome: "Endereço completo" },
            { valor: "bairro", nome: "Só bairro e cidade" },
            { valor: "nao", nome: "Não mostrar" },
          ]}
          valor={resp.atendimento.mostrarEndereco}
          onChange={(v) => mudar("atendimento", { mostrarEndereco: v })}
        />
      </>
    ),
    midia: (
      <>
        {GRUPOS_MIDIA.map((g) => (
          <Arquivos key={g.tipo} chave={chave} {...g} arquivos={arquivos} onMudou={setArquivos} />
        ))}
        <Campo
          rotulo="Arquivo grande demais? Mande pelo Google Drive"
          dica="Cole o link de uma pasta compartilhada com os originais."
          valor={resp.midia.drive}
          onChange={(v) => mudar("midia", { drive: v })}
          tipo="url"
          inputMode="url"
          placeholder="https://drive.google.com/…"
        />
      </>
    ),
    depoimentos: (
      <>
        {resp.depoimentos.itens.map((d, i) => {
          const muda = (patch: Partial<typeof d>) =>
            mudar("depoimentos", { itens: resp.depoimentos.itens.map((x, j) => (j === i ? { ...x, ...patch } : x)) });
          return (
            <div key={i} className="ddgb-item">
              <div className="ddgb-item__cabeca">
                <span className="ddgb-item__n">{i + 1}</span>
                <button
                  type="button"
                  className="ddgb-link ddgb-link--quieto"
                  onClick={() => mudar("depoimentos", { itens: resp.depoimentos.itens.filter((_, j) => j !== i) })}
                >
                  Tirar
                </button>
              </div>
              <Campo rotulo="Primeiro nome da cliente" valor={d.nome} onChange={(v) => muda({ nome: v })} />
              <Texto rotulo="O que ela disse" valor={d.texto} onChange={(v) => muda({ texto: v })} linhas={3} />
              <Interruptor rotulo="Ela autorizou aparecer no site" ligado={d.autorizou} onChange={(v) => muda({ autorizou: v })} />
            </div>
          );
        })}
        <button
          type="button"
          className="ddgb-mais"
          onClick={() => mudar("depoimentos", { itens: [...resp.depoimentos.itens, { nome: "", texto: "", autorizou: false }] })}
        >
          + Adicionar depoimento
        </button>
        <Arquivos
          chave={chave}
          tipo="depoimento"
          titulo="Ou mande os prints"
          dica="Do WhatsApp ou do Instagram. A gente escreve a partir deles."
          varios
          aceita="foto"
          arquivos={arquivos}
          onMudou={setArquivos}
        />
      </>
    ),
    vip: (
      <>
        {beneficios.map((b: BeneficioAtual) => {
          const c = resp.vip.beneficios[b.key] ?? { ok: "", texto: "" };
          const muda = (patch: Partial<typeof c>) =>
            mudar("vip", { beneficios: { ...resp.vip.beneficios, [b.key]: { ...c, ...patch } } });
          return (
            <div key={b.key} className="ddgb-item ddgb-regra">
              <p className="ddgb-regra__nome">{b.nome}</p>
              {b.regra ? <p className="ddgb-regra__quando">{b.regra}</p> : null}
              {b.descricao ? <p className="ddgb-regra__ganha">“{b.descricao}”</p> : null}
              <Escolha
                rotulo="Está certo?"
                opcoes={[
                  { valor: "sim", nome: "Está certo" },
                  { valor: "mudar", nome: "Quero mudar" },
                ]}
                valor={c.ok}
                onChange={(v) => muda({ ok: v })}
              />
              {c.ok === "mudar" ? (
                <Texto rotulo="Como fica?" valor={c.texto} onChange={(v) => muda({ texto: v })} linhas={2} />
              ) : (
                <Campo
                  rotulo="Quer detalhar? (opcional)"
                  dica="Ex.: o que é o presente na prática — “uma manutenção grátis”."
                  valor={c.texto}
                  onChange={(v) => muda({ texto: v })}
                />
              )}
            </div>
          );
        })}
      </>
    ),
    numeros: (
      <>
        <p className="ddgb-nota">
          No Instagram: Painel profissional → Insights da conta. Só número de verdade — se preferir, mande o print e a gente copia.
        </p>
        <Campo rotulo="Período" valor={resp.numeros.periodo} onChange={(v) => mudar("numeros", { periodo: v })} placeholder="Últimos 30 dias" />
        {resp.numeros.itens.map((n, i) => {
          const muda = (patch: Partial<typeof n>) =>
            mudar("numeros", { itens: resp.numeros.itens.map((x, j) => (j === i ? { ...x, ...patch } : x)) });
          return (
            <div key={i} className="ddgb-dupla ddgb-dupla--numero">
              <Campo rotulo="Número" valor={n.valor} onChange={(v) => muda({ valor: v })} placeholder="2,16 mi" />
              <Campo rotulo="O que é" valor={n.rotulo} onChange={(v) => muda({ rotulo: v })} placeholder="Visualizações" />
            </div>
          );
        })}
        {resp.numeros.itens.length < 6 ? (
          <button type="button" className="ddgb-mais" onClick={() => mudar("numeros", { itens: [...resp.numeros.itens, { valor: "", rotulo: "" }] })}>
            + Adicionar número
          </button>
        ) : null}
        <Arquivos chave={chave} tipo="insights" titulo="Print do Insights" varios aceita="foto" arquivos={arquivos} onMudou={setArquivos} />
      </>
    ),
    marca: (
      <>
        <Campo rotulo="Seu @ do Instagram" valor={resp.marca.instagram} onChange={(v) => mudar("marca", { instagram: v })} placeholder="@1.tayssa" />
        <Campo
          rotulo="WhatsApp de atendimento"
          dica="Com DDD. É para onde vai o botão “Agendar”."
          valor={resp.marca.whatsapp}
          onChange={(v) => mudar("marca", { whatsapp: v })}
          tipo="tel"
          inputMode="tel"
        />
        <Escolha
          rotulo="Você tem um logotipo oficial?"
          opcoes={[
            { valor: "sim", nome: "Tenho" },
            { valor: "nao", nome: "Não tenho" },
          ]}
          valor={resp.marca.logo}
          onChange={(v) => mudar("marca", { logo: v })}
        />
        {resp.marca.logo === "sim" ? (
          <Arquivos
            chave={chave}
            tipo="logo"
            titulo="O logotipo"
            dica="PNG ou JPG. Se for PDF ou arquivo de designer, mande pelo Drive na parte de fotos."
            varios
            aceita="foto"
            arquivos={arquivos}
            onMudou={setArquivos}
          />
        ) : null}
      </>
    ),
    final: (
      <>
        <Texto
          rotulo="Algo mais que você queira contar?"
          dica="Uma ideia, um site que você gosta, algo que não pode faltar."
          valor={resp.final.recado}
          onChange={(v) => mudar("final", { recado: v })}
          linhas={5}
        />
        {enviado ? (
          <div className="ddgb-enviado" role="status">
            <strong>Recebido em {quando(enviado)}.</strong> Obrigado, Tayssa! Se lembrar de mais alguma coisa, é só mudar aqui
            — continua salvando sozinho.
          </div>
        ) : (
          <>
            <p className="ddgb-nota">
              {feitas < total
                ? `Faltam ${total - feitas} ${total - feitas === 1 ? "parte" : "partes"}, mas pode mandar assim mesmo — dá para completar depois.`
                : "Tudo respondido. É só mandar."}
            </p>
            <button type="button" className="ddgb-enviar" onClick={enviar} disabled={enviando}>
              {enviando ? "Enviando…" : "Enviar para a DDG"}
            </button>
            {erroEnvio ? (
              <p className="ddgb-erro" role="alert">
                {erroEnvio}
              </p>
            ) : null}
          </>
        )}
      </>
    ),
  };

  return (
    <div className="ddgb">
      <header className="ddgb-topo">
        <div className="ddgb-topo__linha">
          <span className="ddgb-marca">
            <svg viewBox="0 0 48 48" aria-hidden>
              <path d="M24 2 43.6 13v22L24 46 4.4 35V13z" fill="#F15839" />
              <path d="M18 14v18l6 4V14z" fill="#fff" fillOpacity=".95" />
              <path d="m24 14 6 4v10l-6 4z" fill="#171717" fillOpacity=".85" />
            </svg>
            Dose de Growth
          </span>
          <span className="ddgb-salvo" data-estado={estado} role="status" aria-live="polite">
            {estado === "salvando" ? "Salvando…" : estado === "salvo" ? "Salvo" : estado === "erro" ? "Sem conexão — tentando de novo" : ""}
          </span>
        </div>
        <div className="ddgb-progresso" aria-label={`${feitas} de ${total} partes respondidas`}>
          <span style={{ transform: `scaleX(${feitas / total})` }} />
        </div>
      </header>

      <main className="ddgb-pagina">
        <section className="ddgb-abre">
          <p className="ddgb-abre__cliente">Briefing do site · Tayssa Lash</p>
          <h1>Oi, Tayssa!</h1>
          <p>
            Aqui está tudo o que falta para o seu site ficar com a sua cara. Responda no seu tempo: <strong>salva sozinho</strong> enquanto
            você escreve, e dá para fechar e voltar por este mesmo link.
          </p>
          <ul className="ddgb-abre__dicas">
            <li>{feitas} de {total} partes prontas</li>
            <li>Uns 20 minutos no total</li>
            <li>Fotos e vídeos sobem no original</li>
          </ul>
        </section>

        <ol className="ddgb-partes">
          {SECOES.map((s, i) => {
            const ok = s.id !== "final" && feita(s.id);
            const aberto = aberta === s.id;
            return (
              <li key={s.id} id={`parte-${s.id}`} className="ddgb-parte" data-aberta={aberto || undefined} data-feita={ok || undefined}>
                <button
                  type="button"
                  className="ddgb-parte__cabeca"
                  aria-expanded={aberto}
                  aria-controls={`corpo-${s.id}`}
                  onClick={() => setAberta(aberto ? null : s.id)}
                >
                  <span className="ddgb-parte__n" aria-hidden>
                    {ok ? (
                      <svg viewBox="0 0 24 24">
                        <path d="m5 12.5 4.5 4.5L19 7.5" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </span>
                  <span className="ddgb-parte__texto">
                    <span className="ddgb-parte__titulo">
                      {s.titulo}
                      {s.opcional ? <em> · opcional</em> : null}
                    </span>
                    <span className="ddgb-parte__para">{s.para}</span>
                  </span>
                  <svg className="ddgb-parte__seta" viewBox="0 0 24 24" aria-hidden>
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
                {aberto ? (
                  <div id={`corpo-${s.id}`} className="ddgb-parte__corpo">
                    {corpo[s.id]}
                    {s.id !== "final" ? (
                      <button type="button" className="ddgb-pronto" onClick={() => pronto(s.id)}>
                        Pronto, próxima parte
                        <svg viewBox="0 0 24 24" aria-hidden>
                          <path d="M5 12h14m-5-5 5 5-5 5" />
                        </svg>
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>

        <p className="ddgb-rodape">Dúvida em alguma pergunta? Chame a DDG no WhatsApp — e pode pular, voltamos nela depois.</p>
      </main>
    </div>
  );
}
