"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { bateBusca } from "@/lib/tayssa/busca";
import { LADOS, type LadoDoManual } from "@/lib/tayssa/manual-lados";

/**
 * Peças do Manual do painel. O texto mora em `lib/tayssa/manual.ts`;
 * `*assim*` vira negrito (nome de botão, de menu, de campo).
 */
export function TextoDoManual({ texto }: { texto: string }): ReactNode {
  const partes = texto.split(/(\*[^*]+\*)/g).filter(Boolean);
  return partes.map((p, i) => (p.startsWith("*") && p.endsWith("*") ? <b key={i}>{p.slice(1, -1)}</b> : p));
}

/** O desenho de cada lado: o painel (uma tela com o menu), o celular da cliente, ou os dois. */
function IconeDoLado({ lado }: { lado: LadoDoManual }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {lado === "painel" ? (
        <>
          <rect x="3" y="4.5" width="18" height="13" rx="2.2" />
          <path d="M8.5 4.5v13M9 21h6" />
        </>
      ) : lado === "cliente" ? (
        <>
          <rect x="7" y="2.8" width="10" height="18.4" rx="2.4" />
          <path d="M11 18h2" />
        </>
      ) : (
        <>
          <rect x="2.5" y="5" width="12.5" height="9.5" rx="1.8" />
          <rect x="15.5" y="8" width="6" height="11" rx="1.6" />
          <path d="M6.5 18.5h5" />
        </>
      )}
    </svg>
  );
}

/** A etiqueta "No seu painel" / "No site da cliente" / "No site e no painel" de cada explicação. */
export function EtiquetaDoLado({ lado }: { lado: LadoDoManual }) {
  return (
    <span className="tya-manual__lado" data-lado={lado}>
      <IconeDoLado lado={lado} />
      {LADOS[lado].nome}
    </span>
  );
}

type Filtro = "tudo" | "painel" | "cliente";

const FILTROS: { id: Filtro; nome: string }[] = [
  { id: "tudo", nome: "Tudo" },
  { id: "painel", nome: "Seu painel" },
  { id: "cliente", nome: "Site da cliente" },
];

/**
 * "O que você quer fazer?" e o filtro do lado: esconde os tópicos que não
 * batem com o que ela digitou (sem acento, sem caixa) ou que são do outro
 * lado, e as seções que ficam vazias. Tópico das duas pontas aparece nos
 * dois filtros.
 */
export function BuscaNoManual() {
  const [q, setQ] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("tudo");
  const [nada, setNada] = useState(false);
  const campo = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const raiz = campo.current?.closest(".tya-manual");
    if (!raiz) return;
    let algum = false;
    const doLado = (lado: string | undefined) => filtro === "tudo" || lado === filtro || lado === "ambos";
    raiz.querySelectorAll<HTMLElement>("[data-manual-secao]").forEach((secao) => {
      let naSecao = false;
      secao.querySelectorAll<HTMLElement>("[data-manual-topico]").forEach((t) => {
        const bate = doLado(t.dataset.lado) && bateBusca(q, [t.dataset.busca, secao.dataset.busca]);
        t.hidden = !bate;
        if (bate) naSecao = true;
      });
      secao.hidden = !naSecao;
      if (naSecao) algum = true;
    });
    raiz.querySelectorAll<HTMLElement>("[data-manual-grupo]").forEach((g) => {
      g.hidden = filtro !== "tudo" && g.dataset.manualGrupo !== filtro;
    });
    setNada(!algum);
  }, [q, filtro]);

  return (
    <div className="tya-manual__busca">
      <label className="tya-manual__campo">
        <span className="tya-sr">Buscar no manual</span>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4 4" />
        </svg>
        <input
          ref={campo}
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="O que você quer fazer? Ex.: confirmar, sinal, senha"
          enterKeyHint="search"
          autoComplete="off"
        />
      </label>
      <div className="tya-manual__filtro" role="radiogroup" aria-label="Mostrar">
        {FILTROS.map((f) => (
          <button key={f.id} type="button" role="radio" aria-checked={filtro === f.id} data-lado={f.id} onClick={() => setFiltro(f.id)}>
            {f.id === "tudo" ? null : <IconeDoLado lado={f.id} />}
            {f.nome}
          </button>
        ))}
      </div>
      {nada ? <p className="tya-small">Nada com “{q}” aqui. Tente outra palavra, como agenda, cliente ou sinal{filtro !== "tudo" ? ", ou toque em Tudo" : ""}.</p> : null}
    </div>
  );
}
