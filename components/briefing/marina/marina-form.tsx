"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  criarAnuncioAction,
  enviarBriefingMarinaAction,
  removerAnuncioAction,
  salvarAnuncioAction,
} from "@/lib/marina/actions/briefing";
import {
  CAMPOS_VAZIOS,
  LIMITES,
  MESES,
  MES_TITULO,
  anuncioPronto,
  contarMes,
  type Anuncio,
  type ArquivoAnuncio,
  type CamposAnuncio,
  type Mes,
} from "@/lib/marina/briefing";
import type { BriefingMarina } from "@/lib/marina/queries/briefing";
import { ArquivosAnuncio } from "@/components/briefing/marina/arquivos-anuncio";

type Estado = "" | "salvando" | "salvo" | "erro";

const quando = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

export function MarinaBriefingForm({
  chave,
  anuncios: anunciosIniciais,
  arquivos: arquivosIniciais,
  enviadoEm,
}: BriefingMarina & { chave: string }) {
  const [anuncios, setAnuncios] = useState<Anuncio[]>(anunciosIniciais);
  const [arquivos, setArquivos] = useState<ArquivoAnuncio[]>(arquivosIniciais);
  const [mes, setMes] = useState<Mes>(MESES[0]);
  const [aberto, setAberto] = useState<string | null>(null);
  const [estado, setEstado] = useState<Estado>("");
  const [enviado, setEnviado] = useState<string | null>(enviadoEm);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // ---- salvar sozinho: cada anúncio mexido vai ao banco numa pausa da
  // digitação, um de cada vez (a fila nunca deixa um envio velho passar
  // por cima do novo)
  const anunciosRef = useRef(anuncios);
  useEffect(() => {
    anunciosRef.current = anuncios;
  }, [anuncios]);
  const sujos = useRef(new Set<string>());
  const fila = useRef<Promise<void>>(Promise.resolve());
  const relogio = useRef<number | undefined>(undefined);

  const descarregar = useCallback(() => {
    window.clearTimeout(relogio.current);
    if (!sujos.current.size) return fila.current;
    const vez = [...sujos.current];
    sujos.current.clear();
    setEstado("salvando");
    fila.current = fila.current.then(async () => {
      for (const id of vez) {
        const a = anunciosRef.current.find((x) => x.id === id);
        if (!a) continue;
        const r = await salvarAnuncioAction({
          k: chave,
          id,
          dados: { peca: a.peca, estampa: a.estampa, legenda: a.legenda, link: a.link },
        });
        if (!r.ok) {
          setEstado("erro");
          setErro(r.error);
          return;
        }
      }
      setErro(null);
      setEstado("salvo");
    });
    return fila.current;
  }, [chave]);

  // salva ao sair da página, para não perder o que ela acabou de digitar
  useEffect(() => {
    const sair = () => {
      if (sujos.current.size) void descarregar();
    };
    window.addEventListener("pagehide", sair);
    return () => {
      window.removeEventListener("pagehide", sair);
      sair();
    };
  }, [descarregar]);

  function mexer(id: string, patch: Partial<CamposAnuncio>) {
    setAnuncios((l) => l.map((a) => (a.id === id ? { ...a, ...patch } : a)));
    sujos.current.add(id);
    setEstado("salvando");
    window.clearTimeout(relogio.current);
    relogio.current = window.setTimeout(descarregar, 700);
  }

  async function novoAnuncio() {
    setErro(null);
    const r = await criarAnuncioAction({ k: chave, mes });
    if (!r.ok) return setErro(r.error);
    setAnuncios((l) => [...l, r.data]);
    setAberto(r.data.id);
  }

  async function apagar(id: string) {
    const a = anuncios.find((x) => x.id === id);
    const rotulo = a?.peca.trim() || "esse anúncio";
    if (!window.confirm(`Apagar ${rotulo}? As fotos e os vídeos dele saem junto.`)) return;
    sujos.current.delete(id);
    setAnuncios((l) => l.filter((x) => x.id !== id));
    setArquivos((l) => l.filter((f) => f.anuncioId !== id));
    const r = await removerAnuncioAction({ k: chave, id });
    if (!r.ok) setErro(r.error);
  }

  async function enviarTudo() {
    setEnviando(true);
    setErro(null);
    await descarregar();
    const r = await enviarBriefingMarinaAction({ k: chave });
    setEnviando(false);
    if (!r.ok) return setErro(r.error);
    setEnviado(r.data.enviadoEm);
  }

  const doMes = anuncios.filter((a) => a.mes === mes);
  const total = anuncios.length;

  return (
    <div className="ddgb ddgb--marina">
      <header className="ddgb-topo">
        <div className="ddgb-topo__linha">
          <span className="ddgb-marca">Marina Saleme</span>
          <span className="ddgb-salvo" aria-live="polite">
            {estado === "salvando" ? "salvando…" : estado === "salvo" ? "salvo" : estado === "erro" ? "não salvou" : ""}
          </span>
        </div>
      </header>

      <main className="ddgb-pagina">
        <section className="ddgb-abre">
          <p className="ddgb-abre__cliente">Dose de Growth</p>
          <h1>Oi, Bia. O que a gente anuncia no mês que vem?</h1>
          <p>
            Cadastre aqui cada peça que a Marina quer anunciar. Para cada uma, mande a foto ou o vídeo,
            diga a estampa e escreva a legenda. É daqui que a gente monta os anúncios.
          </p>
          <ul className="ddgb-abre__dicas">
            <li>Salva sozinho a cada pausa. Pode fechar e voltar depois.</li>
            <li>Dá para mexer em tudo mesmo depois de enviar.</li>
          </ul>
        </section>

        <div className="ddgb-meses" role="tablist" aria-label="Mês dos anúncios">
          {MESES.map((m) => {
            const { total: t, prontos } = contarMes(m, anuncios, arquivos);
            return (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={m === mes}
                className={`ddgb-mes${m === mes ? " ddgb-mes--agora" : ""}`}
                onClick={() => {
                  setMes(m);
                  setAberto(null);
                }}
              >
                <span className="ddgb-mes__titulo">{MES_TITULO[m]}</span>
                <span className="ddgb-mes__conta">
                  {t === 0 ? "nenhum ainda" : t === 1 ? "1 anúncio" : `${t} anúncios`}
                  {t > 0 && prontos < t ? ` · ${t - prontos} sem foto ou legenda` : ""}
                </span>
              </button>
            );
          })}
        </div>

        <div className="ddgb-partes">
          {doMes.map((a, i) => {
            const abertoAgora = aberto === a.id;
            const pronto = anuncioPronto(a, arquivos);
            return (
              <section
                key={a.id}
                className="ddgb-parte"
                {...(abertoAgora ? { "data-aberta": "" } : {})}
                {...(pronto ? { "data-feita": "" } : {})}
              >
                <button
                  type="button"
                  className="ddgb-parte__cabeca"
                  aria-expanded={abertoAgora}
                  onClick={() => setAberto(abertoAgora ? null : a.id)}
                >
                  <span className="ddgb-parte__n">{String(i + 1).padStart(2, "0")}</span>
                  <span className="ddgb-parte__texto">
                    <span className="ddgb-parte__titulo">{a.peca.trim() || "Anúncio sem nome"}</span>
                    <span className="ddgb-parte__para">
                      {[a.estampa.trim(), arquivos.some((f) => f.anuncioId === a.id) ? "com arquivo" : "sem arquivo"]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </span>
                  <span className="ddgb-parte__seta" aria-hidden="true">
                    {abertoAgora ? "–" : "+"}
                  </span>
                </button>

                {abertoAgora ? (
                  <div className="ddgb-parte__corpo">
                    <div className="ddgb-campo">
                      <label htmlFor={`peca-${a.id}`}>Peça</label>
                      <p className="ddgb-dica">O nome da peça, como vocês chamam. Ex.: Camisa Ana, Saia Degrau.</p>
                      <input
                        id={`peca-${a.id}`}
                        type="text"
                        autoComplete="off"
                        maxLength={LIMITES.peca}
                        value={a.peca}
                        onChange={(e) => mexer(a.id, { peca: e.target.value })}
                      />
                    </div>

                    <div className="ddgb-campo">
                      <label htmlFor={`estampa-${a.id}`}>Estampa</label>
                      <p className="ddgb-dica">Qual estampa é. Escreva do seu jeito.</p>
                      <input
                        id={`estampa-${a.id}`}
                        type="text"
                        autoComplete="off"
                        maxLength={LIMITES.estampa}
                        value={a.estampa}
                        onChange={(e) => mexer(a.id, { estampa: e.target.value })}
                      />
                    </div>

                    <div className="ddgb-campo">
                      <label htmlFor={`legenda-${a.id}`}>Legenda</label>
                      <p className="ddgb-dica">O texto do anúncio. Pode escrever à vontade.</p>
                      <textarea
                        id={`legenda-${a.id}`}
                        rows={5}
                        maxLength={LIMITES.legenda}
                        value={a.legenda}
                        onChange={(e) => mexer(a.id, { legenda: e.target.value })}
                      />
                      <span className="ddgb-contador">
                        {a.legenda.length} / {LIMITES.legenda}
                      </span>
                    </div>

                    <div className="ddgb-campo">
                      <label htmlFor={`link-${a.id}`}>Link do produto na loja</label>
                      <p className="ddgb-dica">
                        Opcional, mas ajuda: é para onde o anúncio leva. Cole o endereço da página da peça.
                      </p>
                      <input
                        id={`link-${a.id}`}
                        type="url"
                        inputMode="url"
                        autoComplete="off"
                        placeholder="https://marinasaleme-estamparia.com/products/…"
                        maxLength={LIMITES.link}
                        value={a.link}
                        onChange={(e) => mexer(a.id, { link: e.target.value })}
                      />
                    </div>

                    <ArquivosAnuncio
                      chave={chave}
                      anuncioId={a.id}
                      arquivos={arquivos}
                      onMudou={(fn) => setArquivos(fn)}
                    />

                    <button type="button" className="ddgb-link ddgb-link--quieto" onClick={() => apagar(a.id)}>
                      Apagar este anúncio
                    </button>
                  </div>
                ) : null}
              </section>
            );
          })}
        </div>

        <button type="button" className="ddgb-mais" onClick={novoAnuncio}>
          + Cadastrar anúncio de {mes}
        </button>

        {erro ? <p className="ddgb-erro">{erro}</p> : null}

        <footer className="ddgb-rodape">
          {enviado ? (
            <p className="ddgb-enviado">
              Enviado para a DDG em {quando(enviado)}. Pode continuar mexendo: a gente vê as mudanças.
            </p>
          ) : null}
          <button type="button" className="ddgb-enviar" onClick={enviarTudo} disabled={enviando || total === 0}>
            {enviando ? "Enviando…" : enviado ? "Avisar a DDG de novo" : "Enviar para a DDG"}
          </button>
          <p className="ddgb-nota">
            {total === 0
              ? "Cadastre pelo menos um anúncio para enviar."
              : `${total} ${total === 1 ? "anúncio cadastrado" : "anúncios cadastrados"} no total.`}
          </p>
        </footer>
      </main>
    </div>
  );
}
