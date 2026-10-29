"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { adminSalvarCapaServicoAction } from "@/lib/tayssa/actions/photos";
import { estiloFoco, type CapaServico } from "@/lib/tayssa/catalogo";
import { useTarefa } from "@/components/tayssa/ui/acao";
import { Enquadrar, type Quadro } from "@/components/tayssa/admin/enquadrar";

/** Uma foto que pode virar capa: a do próprio serviço ou qualquer outra da galeria. */
export type OpcaoCapa = { id: string; url: string; produto: string; foco: Quadro };

export type ServicoCapa = {
  id: string;
  nome: string;
  capa: CapaServico | null;
  /** quantas fotos passam no carrossel embaixo da capa */
  noCarrossel: number;
  /** as fotos deste serviço (as que passam no carrossel dele) */
  daqui: OpcaoCapa[];
};

/** A capa no site é quadrada: o painel mostra e enquadra no mesmo formato. */
const FORMATO = "1 / 1";

/**
 * Mídia → Capas: um cartão por serviço, com a capa como o site mostra. Ela
 * escolhe a foto (deste serviço primeiro, qualquer outra se quiser) e
 * enquadra arrastando e com o zoom, igual ao publicar.
 */
export function CapasServicos({
  servicos: doServidor,
  outras,
  pronto = true,
}: {
  servicos: ServicoCapa[];
  outras: OpcaoCapa[];
  /** o banco já guarda a capa escolhida (antes da atualização, só a automática) */
  pronto?: boolean;
}) {
  const [aberto, setAberto] = useState<string | null>(null);
  // a capa salva aparece na hora: a tela do servidor chega depois (às vezes demora)
  const [salvas, setSalvas] = useState<Record<string, CapaServico | null>>({});
  const servicos = doServidor.map((s) => (s.id in salvas ? { ...s, capa: salvas[s.id] } : s));
  const atual = servicos.find((s) => s.id === aberto) ?? null;
  return (
    <>
      {!pronto ? (
        <p className="tya-aviso" role="status" style={{ marginBottom: 14 }}>
          A escolha da capa liga assim que o banco for atualizado. Por enquanto, cada serviço usa a primeira foto dele.
        </p>
      ) : null}
      <ul className="tya-capas">
        {servicos.map((s) => (
          <li key={s.id} className="tya-capa">
            <div className="tya-capa__img" style={{ aspectRatio: FORMATO }}>
              {s.capa ? (
                <Image src={s.capa.url} alt="" fill sizes="(max-width: 760px) 45vw, 220px" style={estiloFoco(s.capa.foco)} />
              ) : (
                <span className="tya-capa__vazia">Sem foto</span>
              )}
            </div>
            <div className="tya-capa__txt">
              <strong>{s.nome}</strong>
              {s.capa?.escolhida ? (
                <span className="tya-pill tya-pill--gold">escolhida por você</span>
              ) : s.capa ? (
                <span className="tya-pill tya-pill--quiet">automática</span>
              ) : (
                <span className="tya-pill tya-pill--warn">sem foto</span>
              )}
              <span className="tya-small">
                {s.noCarrossel
                  ? `${s.noCarrossel} ${s.noCarrossel === 1 ? "foto passa" : "fotos passam"} embaixo da capa`
                  : s.daqui.length
                    ? "Com uma foto só, não há carrossel"
                    : "Publique fotos com o nome deste serviço para o carrossel"}
              </span>
            </div>
            {pronto ? (
              <button type="button" className="tya-btn tya-btn--sm tya-btn--primary" onClick={() => setAberto(s.id)}>
                {s.capa ? "Trocar capa" : "Escolher capa"}
              </button>
            ) : null}
          </li>
        ))}
      </ul>
      {atual ? (
        <EscolherCapa
          key={atual.id}
          servico={atual}
          outras={outras}
          onSalvo={(capa) => setSalvas((m) => ({ ...m, [atual.id]: capa }))}
          onFechar={() => setAberto(null)}
        />
      ) : null}
    </>
  );
}

function EscolherCapa({
  servico,
  outras,
  onSalvo,
  onFechar,
}: {
  servico: ServicoCapa;
  outras: OpcaoCapa[];
  /** a capa como fica no site depois de salvar (null = sem foto) */
  onSalvo: (capa: CapaServico | null) => void;
  onFechar: () => void;
}) {
  const router = useRouter();
  const dialogo = useRef<HTMLDialogElement>(null);
  const todas = [...servico.daqui, ...outras.filter((o) => !servico.daqui.some((d) => d.id === o.id))];
  const inicial = servico.capa ? todas.find((o) => o.id === servico.capa!.id) ?? null : servico.daqui[0] ?? null;
  const [foto, setFoto] = useState<OpcaoCapa | null>(inicial);
  const [quadro, setQuadro] = useState<Quadro>(servico.capa ? servico.capa.foco : inicial?.foco ?? { x: 50, y: 50, zoom: 1 });
  // as outras fotos só aparecem quando ela quer (ou quando o serviço não tem nenhuma)
  const [verOutras, setVerOutras] = useState(servico.daqui.length === 0 || Boolean(servico.capa && !servico.daqui.some((d) => d.id === servico.capa!.id)));
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTarefa();

  useEffect(() => {
    const d = dialogo.current;
    if (d && !d.open) d.showModal();
  }, []);

  const escolher = (o: OpcaoCapa) => {
    setFoto(o);
    setQuadro(o.foco);
  };

  const salvar = (photoId: string | null) =>
    iniciar(async () => {
      setErro(null);
      const r = await adminSalvarCapaServicoAction({
        service_id: servico.id,
        photo_id: photoId,
        x: quadro.x,
        y: quadro.y,
        zoom: quadro.zoom,
      });
      if (!r.ok) return setErro(r.error);
      // escolhida: a foto com o enquadramento; automática: a primeira foto do serviço
      const automatica = servico.daqui[0];
      onSalvo(
        photoId && foto
          ? { id: foto.id, url: foto.url, alt: foto.produto, foco: quadro, escolhida: true }
          : automatica
            ? { id: automatica.id, url: automatica.url, alt: automatica.produto, foco: automatica.foco, escolhida: false }
            : null
      );
      dialogo.current?.close();
      router.refresh();
    });

  const grade = (lista: OpcaoCapa[]) => (
    <div className="tya-capa-escolha" role="radiogroup" aria-label="Fotos">
      {lista.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={foto?.id === o.id}
          aria-label={o.produto}
          className="tya-capa-escolha__item"
          data-on={foto?.id === o.id ? "true" : "false"}
          onClick={() => escolher(o)}
        >
          <Image src={o.url} alt="" fill sizes="96px" style={{ objectFit: "cover" }} />
        </button>
      ))}
    </div>
  );

  return (
    <dialog
      ref={dialogo}
      className="tya-publicar"
      aria-labelledby={`capa-${servico.id}`}
      onClose={onFechar}
      onClick={(e) => {
        if (e.target === e.currentTarget) dialogo.current?.close();
      }}
    >
      <div className="tya-publicar__corpo">
        <div className="tya-publicar__midia">
          {foto ? (
            <Enquadrar url={foto.url} tipo="image" valor={quadro} onMudar={setQuadro} formato={FORMATO} />
          ) : (
            <div className="tya-capa__img tya-capa__img--grande" style={{ aspectRatio: FORMATO }}>
              <span className="tya-capa__vazia">Escolha uma foto ao lado</span>
            </div>
          )}
        </div>

        <div className="tya-publicar__campos">
          <header className="tya-publicar__topo">
            <h2 id={`capa-${servico.id}`}>Capa de {servico.nome}</h2>
            <button type="button" className="tya-btn tya-btn--sm tya-btn--ghost" onClick={() => dialogo.current?.close()}>
              Fechar
            </button>
          </header>
          <p className="tya-small">
            A capa abre o serviço no site. Arraste a foto para escolher o centro e use o zoom: o que aparece aqui é o
            que a cliente vê.
          </p>

          <div>
            <span className="tya-label">Fotos de {servico.nome}</span>
            {servico.daqui.length ? (
              grade(servico.daqui)
            ) : (
              <p className="tya-small">Ainda não há fotos publicadas com o nome deste serviço.</p>
            )}
          </div>

          {outras.length ? (
            <div>
              {verOutras ? (
                <>
                  <span className="tya-label">Outras fotos da galeria</span>
                  {grade(outras.filter((o) => !servico.daqui.some((d) => d.id === o.id)))}
                </>
              ) : (
                <button type="button" className="tya-btn tya-btn--sm tya-btn--ghost" onClick={() => setVerOutras(true)}>
                  Ver outras fotos da galeria
                </button>
              )}
            </div>
          ) : null}

          {erro ? (
            <p className="tya-err" role="alert">
              {erro}
            </p>
          ) : null}

          <div className="tya-capa__acoes">
            <button
              type="button"
              className="tya-btn tya-btn--primary"
              disabled={!foto || pendente}
              onClick={() => foto && salvar(foto.id)}
            >
              {pendente ? "Salvando…" : "Salvar capa"}
            </button>
            {servico.capa?.escolhida ? (
              <button type="button" className="tya-btn tya-btn--ghost" disabled={pendente} onClick={() => salvar(null)}>
                Voltar para a automática
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </dialog>
  );
}
