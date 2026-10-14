"use client";
/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { Check } from "lucide-react";
import { brl } from "@/app/palavracomalma/produtos";

// Cabaça Simples (produto 199): as 5 variações reais cadastradas na loja.
const CORES = [
  { id: "vermelha", nome: "Vermelha", fundo: "#B3192B", foto: "/palavracomalma/p/199-2.jpg" },
  { id: "preta", nome: "Preta", fundo: "#141414", foto: "/palavracomalma/p/199-3.jpg" },
  { id: "pv", nome: "Preta e vermelha", fundo: "linear-gradient(90deg,#141414 50%,#B3192B 50%)", foto: "/palavracomalma/p/199.jpg" },
];
const EXISTE: Record<string, string[]> = { vermelha: ["com", "sem"], preta: ["com", "sem"], pv: ["com"] };
const FOTOS = CORES.map((c) => c.foto);

export function ProdutoVariacoes() {
  const [cor, setCor] = useState("vermelha");
  const [fio, setFio] = useState("com");
  const [foto, setFoto] = useState(CORES[0].foto);
  const [ok, setOk] = useState(false);
  const c = CORES.find((x) => x.id === cor)!;

  function escolherCor(id: string) {
    const nova = CORES.find((x) => x.id === id)!;
    setCor(id);
    setFoto(nova.foto);
    if (!EXISTE[id].includes(fio)) setFio(EXISTE[id][0]);
    setOk(false);
  }

  return (
    <div className="pa-prod">
      <div className="pa-prod-gal">
        <div className="pa-prod-foto">
          <img key={foto} src={foto} alt={`Cabaça ${c.nome}`} />
        </div>
        <div className="pa-prod-mini" role="group" aria-label="Fotos">
          {FOTOS.map((f) => (
            <button key={f} aria-pressed={f === foto} onClick={() => setFoto(f)}>
              <img src={f} alt="" />
            </button>
          ))}
        </div>
      </div>

      <div className="pa-prod-info">
        <span className="pa-tag is-nosso">Magias</span>
        <h3 style={{ marginTop: 12 }}>Cabaça Simples</h3>
        <div className="pa-prod-preco">
          <s>{brl(59.99)}</s>
          <strong>{brl(53.99)}</strong>
          <span>-10%</span>
        </div>
        <p className="pa-prod-parc">Cartão, boleto ou Pix</p>

        <div className="pa-op">
          <p className="pa-op-t">
            Cor: <b>{c.nome}</b>
          </p>
          <div className="pa-cores" role="group" aria-label="Cor">
            {CORES.map((x) => (
              <button key={x.id} className="pa-cor" aria-pressed={x.id === cor} onClick={() => escolherCor(x.id)} aria-label={x.nome}>
                <i style={{ background: x.fundo }} />
              </button>
            ))}
          </div>
        </div>

        <div className="pa-op">
          <p className="pa-op-t">
            Fio de contas: <b>{fio === "com" ? "Com fio" : "Sem fio"}</b>
          </p>
          <div className="pa-fios" role="group" aria-label="Fio">
            {["com", "sem"].map((f) => (
              <button
                key={f}
                aria-pressed={f === fio}
                disabled={!EXISTE[cor].includes(f)}
                onClick={() => {
                  setFio(f);
                  setOk(false);
                }}
              >
                {f === "com" ? "Com fio" : "Sem fio"}
              </button>
            ))}
          </div>
          {!EXISTE[cor].includes("sem") && (
            <p className="pa-prod-parc" style={{ marginTop: 8 }}>
              “Preta e vermelha” só existe com fio, então o “Sem fio” fica riscado.
            </p>
          )}
        </div>

        <button className={`pa-prod-btn${ok ? " is-ok" : ""}`} onClick={() => setOk(true)}>
          {ok ? (
            <>
              <Check size={16} style={{ display: "inline", verticalAlign: "-2px" }} /> Na sacola: {c.nome}, {fio} fio
            </>
          ) : (
            "Adicionar ao carrinho"
          )}
        </button>

        <div className="pa-hoje">
          <small>Como aparece hoje</small>
          <select defaultValue="" aria-label="Seletor de variação do site atual">
            <option value="" disabled>
              Tamanho: selecione
            </option>
            <option>Cabaça Vermelha com fio</option>
            <option>Cabaça Vermelha sem Fio</option>
            <option>Cabaça preta com fio</option>
            <option>Cabaça preta sem fio</option>
            <option>Cabaça preta e vermelha com fio</option>
          </select>
          <p>As mesmas 5 opções, numa lista de texto. No site novo a cliente escolhe vendo a cor e a foto muda junto.</p>
        </div>
      </div>
    </div>
  );
}

const PASSOS = [
  { t: "Você escolhe e compra", d: "O pedido entra na Tray como qualquer outro, com nota fiscal." },
  { t: "Envia a sua ideia", d: "Nomes, fotos, frases. Pelo WhatsApp ou num campo do próprio pedido." },
  { t: "Aprova a arte", d: "Você vê como vai ficar antes de produzir." },
  { t: "Produção própria", d: "Feito à mão, no prazo combinado." },
  { t: "Envio com rastreio", d: "Sai pelo Tray Envios, como hoje." },
];

/** Deck Realista (produto 11): variação real Padrão x Personalizado. */
export function Personalizacao() {
  const [modelo, setModelo] = useState<"padrao" | "pers">("pers");
  return (
    <div className="pa-card pa-pers">
      <div className="pa-pers-img">
        <img src="/palavracomalma/p/11.jpg" alt="Deck Realista" />
        {modelo === "pers" && <span className="pa-pers-selo">✦ com a sua arte</span>}
      </div>
      <div>
        <span className="pa-tag is-nosso">Baralhos</span>
        <h3 style={{ fontFamily: "var(--f-disp)", fontWeight: 500, fontSize: 30, marginTop: 12 }}>Deck Realista</h3>
        <div className="pa-op">
          <div className="pa-fios" role="group" aria-label="Modelo">
            <button aria-pressed={modelo === "padrao"} onClick={() => setModelo("padrao")}>
              Modelo Padrão · {brl(62.77)}
            </button>
            <button aria-pressed={modelo === "pers"} onClick={() => setModelo("pers")}>
              Personalizado · {brl(146.49)}
            </button>
          </div>
        </div>
        {modelo === "pers" ? (
          <>
            <p className="pa-explica" style={{ marginTop: 18 }}>
              Escolheu <b>Personalizado</b>? A própria página explica o que acontece depois da compra:
            </p>
            <ol className="pa-passos" key="pers">
              {PASSOS.map((p) => (
                <li key={p.t}>
                  <b>{p.t}</b>
                  {p.d}
                </li>
              ))}
            </ol>
          </>
        ) : (
          <p className="pa-padrao-nota">
            <b>Modelo Padrão:</b> sai do jeito da foto, sem etapa de arte. A página mostra só o que interessa para essa escolha.
          </p>
        )}
      </div>
    </div>
  );
}
