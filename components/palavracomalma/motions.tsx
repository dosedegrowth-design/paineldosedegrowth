"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Hand, Plus, RotateCcw, ShoppingBag } from "lucide-react";
import { porId } from "@/app/palavracomalma/produtos";

function Demo({
  titulo,
  texto,
  onde,
  dica,
  replay,
  children,
}: {
  titulo: string;
  texto: string;
  onde: string;
  dica?: string;
  replay?: boolean;
  children: (rodada: number) => ReactNode;
}) {
  const [rodada, setRodada] = useState(0);
  return (
    <article className="pa-card pa-mot pa-rv">
      <div className="pa-mot-palco">
        {replay && (
          <button className="pa-replay" onClick={() => setRodada((r) => r + 1)}>
            <RotateCcw size={12} /> Ver de novo
          </button>
        )}
        {children(rodada)}
        {dica && (
          <span className="pa-toque">
            <Hand size={12} /> {dica}
          </span>
        )}
      </div>
      <div className="pa-mot-txt">
        <h3>{titulo}</h3>
        <p>{texto}</p>
        <p className="pa-mot-onde">
          <b>Onde usar:</b> {onde}
        </p>
      </div>
    </article>
  );
}

function TrocaFoto() {
  const [on, setOn] = useState(false);
  const p = porId(219);
  return (
    <button className={`pa-m-troca${on ? " is-on" : ""}`} onClick={() => setOn((v) => !v)} aria-label="Ver o miolo do caderno">
      <img src={p.img} alt="" />
      <img src={p.img2} alt="" />
      <span>{on ? "miolo" : "capa"}</span>
    </button>
  );
}

function Carta() {
  const [on, setOn] = useState(false);
  const p = porId(263);
  return (
    <button className={`pa-m-carta${on ? " is-on" : ""}`} onClick={() => setOn((v) => !v)} aria-label="Virar a carta">
      <div className="pa-m-carta-in">
        <div className="pa-m-carta-v">✦</div>
        <div className="pa-m-carta-f">
          <img src={p.img2} alt="" />
        </div>
      </div>
    </button>
  );
}

function Caldeirao() {
  const fumos = [
    { dl: 0, t: 4.2, dx: -14 },
    { dl: 0.8, t: 4.6, dx: 12 },
    { dl: 1.6, t: 4, dx: -4 },
    { dl: 2.4, t: 4.8, dx: 18 },
    { dl: 3.2, t: 4.4, dx: -18 },
  ];
  return (
    <div className="pa-m-caldeirao">
      {fumos.map((f, k) => (
        <span
          key={k}
          className="pa-fumo"
          style={{ ["--dl" as string]: `${f.dl}s`, ["--t" as string]: `${f.t}s`, ["--dx" as string]: `${f.dx}px` }}
        />
      ))}
      <svg viewBox="0 0 120 100" aria-hidden>
        <ellipse cx="60" cy="18" rx="50" ry="9" fill="#3a2f33" stroke="#C9A45C" strokeOpacity=".5" />
        <path d="M12 20 C8 70 30 92 60 92 C90 92 112 70 108 20 Z" fill="currentColor" stroke="#C9A45C" strokeOpacity=".35" />
        <path d="M8 34 C-4 34 -2 50 10 48" fill="none" stroke="#C9A45C" strokeOpacity=".5" strokeWidth="3" />
        <path d="M112 34 C124 34 122 50 110 48" fill="none" stroke="#C9A45C" strokeOpacity=".5" strokeWidth="3" />
        <path d="M34 90 L28 100 M86 90 L92 100" stroke="#C9A45C" strokeOpacity=".5" strokeWidth="4" />
      </svg>
      <span className="pa-brilho-lua" />
    </div>
  );
}

function VoaCarrinho() {
  const [qtd, setQtd] = useState(0);
  const [voos, setVoos] = useState<{ id: number; vx: string; vy: string; x: number; y: number }[]>([]);
  const [bump, setBump] = useState(0);
  const palco = useRef<HTMLDivElement>(null);
  const foto = useRef<HTMLImageElement>(null);
  const sacola = useRef<HTMLDivElement>(null);
  const p = porId(297);

  function adicionar() {
    const pr = palco.current?.getBoundingClientRect();
    const fr = foto.current?.getBoundingClientRect();
    const sr = sacola.current?.getBoundingClientRect();
    if (!pr || !fr || !sr) return;
    const x = fr.left - pr.left + fr.width / 2 - 28;
    const y = fr.top - pr.top + fr.height / 2 - 37;
    const vx = `${sr.left - pr.left + sr.width / 2 - 28 - x}px`;
    const vy = `${sr.top - pr.top + sr.height / 2 - 37 - y}px`;
    const id = Date.now();
    setVoos((v) => [...v, { id, vx, vy, x, y }]);
    setTimeout(() => {
      setVoos((v) => v.filter((z) => z.id !== id));
      setQtd((q) => q + 1);
      setBump((b) => b + 1);
    }, 780);
  }

  return (
    <div className="pa-m-voa" ref={palco}>
      <div className="pa-m-voa-p">
        <img ref={foto} src={p.img} alt="" />
        <button className="pa-m-voa-mais" onClick={adicionar} aria-label="Adicionar ao carrinho">
          <Plus size={18} />
        </button>
      </div>
      <div key={`sac-${bump}`} ref={sacola} className={`pa-m-voa-sac${bump ? " is-bump" : ""}`}>
        <ShoppingBag size={20} />
        {qtd > 0 && <i>{qtd}</i>}
      </div>
      {voos.map((v) => (
        <img
          key={v.id}
          src={p.img}
          alt=""
          className="pa-voando"
          style={{ left: v.x, top: v.y, ["--vx" as string]: v.vx, ["--vy" as string]: v.vy }}
        />
      ))}
    </div>
  );
}

function Zoom() {
  const [on, setOn] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const p = porId(203);
  function mover(e: React.PointerEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    setPos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  }
  return (
    <div
      className={`pa-m-zoom${on ? " is-on" : ""}`}
      style={{ ["--zx" as string]: `${pos.x}%`, ["--zy" as string]: `${pos.y}%` }}
      onPointerEnter={(e) => e.pointerType === "mouse" && setOn(true)}
      onPointerLeave={() => setOn(false)}
      onPointerDown={(e) => {
        mover(e);
        setOn(true);
      }}
      onPointerUp={(e) => e.pointerType !== "mouse" && setOn(false)}
      onPointerMove={mover}
    >
      <img src={p.img} alt="" draggable={false} />
    </div>
  );
}

function Profundidade() {
  const [d, setD] = useState({ x: 0, y: 0 });
  const caixa = useRef<HTMLDivElement>(null);
  const comMouse = useRef(false);
  const p = porId(189);

  // no celular (sem mouse) as camadas acompanham a rolagem da página
  useEffect(() => {
    function rolar() {
      if (comMouse.current || !caixa.current) return;
      const r = caixa.current.getBoundingClientRect();
      const meio = (r.top + r.height / 2) / window.innerHeight - 0.5;
      setD({ x: 0, y: Math.max(-0.8, Math.min(0.8, meio * 1.6)) });
    }
    rolar();
    window.addEventListener("scroll", rolar, { passive: true });
    return () => window.removeEventListener("scroll", rolar);
  }, []);

  function mover(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse") return;
    comMouse.current = true;
    const r = e.currentTarget.getBoundingClientRect();
    setD({ x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 });
  }
  const t = (f: number) => ({ transform: `translate(${d.x * f}px, ${d.y * f}px)` });
  return (
    <div
      ref={caixa}
      className="pa-m-prof"
      onPointerMove={mover}
      onPointerLeave={() => {
        comMouse.current = false;
        setD({ x: 0, y: 0 });
      }}
    >
      <div className="pa-l-est" style={t(6)} />
      <div className="pa-l-lua" style={t(14)} />
      <svg className="pa-l-monte" style={t(26)} viewBox="0 0 400 110" preserveAspectRatio="none" aria-hidden>
        <path d="M0 110 L0 70 L60 40 L120 66 L190 22 L260 64 L320 38 L400 70 L400 110 Z" fill="#2A0E17" />
        <path d="M0 110 L0 86 L80 62 L150 84 L230 56 L300 82 L400 66 L400 110 Z" fill="#170a0e" />
      </svg>
      <img className="pa-l-prod" src={p.img} alt="" style={t(44)} />
    </div>
  );
}

export function Motions() {
  const fotos = [227, 241, 235].map(porId);
  return (
    <div className="pa-mot-grid">
      <Demo
        titulo="Surgir ao rolar"
        texto="Os produtos aparecem com suavidade quando a pessoa chega naquele trecho da página, em vez de estarem ali parados."
        onde="vitrines da home, coleções, depoimentos."
        replay
      >
        {(r) => (
          <div className="pa-m-surgir" key={r}>
            {fotos.map((p) => (
              <div key={p.id}>
                <img src={p.img} alt="" />
              </div>
            ))}
          </div>
        )}
      </Demo>

      <Demo
        titulo="Foto que troca"
        texto="Ao passar o mouse (ou tocar), a foto da capa vira a do miolo. A cliente vê o produto por dentro sem abrir a página."
        onde="cards de cadernos, planners e baralhos."
        dica="toque na foto"
      >
        {() => <TrocaFoto />}
      </Demo>

      <Demo
        titulo="Carta que vira"
        texto="O produto aparece de costas, como uma carta de tarot, e vira ao toque. Surpresa e clima de leitura."
        onde="lançamentos, “carta do dia”, coleção Tarot."
        dica="toque na carta"
      >
        {() => <Carta />}
      </Demo>

      <Demo
        titulo="Brilho dourado"
        texto="Um reflexo de luz passa pelo botão de tempos em tempos e a borda dourada gira devagar. Chama o olho para o que importa."
        onde="botão de comprar, cupom, “personalize o seu”."
      >
        {() => (
          <div className="pa-m-brilho-borda">
            <button className="pa-m-brilho">Personalize o seu</button>
          </div>
        )}
      </Demo>

      <Demo
        titulo="Fumaça do caldeirão"
        texto="Um efeito de fundo que fica vivo o tempo todo: fumaça subindo do caldeirão do logo, brasas, estrelas piscando."
        onde="topo da home, tela de carregamento, página “Sobre”."
      >
        {() => <Caldeirao />}
      </Demo>

      <Demo
        titulo="Faixa que corre"
        texto="Frases passando sozinhas de um lado para o outro, como um letreiro. Dá movimento sem precisar de vídeo."
        onde="entre seções da home, barra de cupom."
      >
        {() => (
          <div className="pa-m-faixas">
            <div className="pa-m-faixa">
              <div>
                {Array.from({ length: 2 }).map((_, k) => (
                  <span key={k} style={{ display: "flex", gap: 28 }}>
                    <span>Feito à mão</span>✦<span>Produção própria</span>✦<span>Personalizado</span>✦<span>Enviamos para todo o Brasil</span>✦
                  </span>
                ))}
              </div>
            </div>
            <div className="pa-m-faixa">
              <div>
                {Array.from({ length: 2 }).map((_, k) => (
                  <span key={k} style={{ display: "flex", gap: 28 }}>
                    <span>Cadernos</span>·<span>Baralhos</span>·<span>Magias</span>·<span>Coleção Orixás</span>·<span>Coleção Tarot</span>·
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </Demo>

      <Demo
        titulo="Voa para o carrinho"
        texto="Ao tocar no “+”, a foto do produto voa até a sacola e o número sobe. A cliente tem certeza de que deu certo."
        onde="catálogo, página de produto, vitrines."
        dica="toque no +"
      >
        {() => <VoaCarrinho />}
      </Demo>

      <Demo
        titulo="Escrita à mão"
        texto="O texto vai sendo desenhado como se alguém escrevesse com caneta tinteiro, e depois ganha cor."
        onde="abertura da home, assinatura na página “Sobre”."
        replay
      >
        {(r) => (
          <div className="pa-m-escrita" key={r}>
            <svg viewBox="0 0 300 100" aria-label="com alma">
              <text x="50%" y="70" textAnchor="middle">
                com alma
              </text>
            </svg>
            <small>PALAVRA COM ALMA</small>
          </div>
        )}
      </Demo>

      <Demo
        titulo="Lupa na foto"
        texto="Passando o mouse ou segurando o dedo, a foto amplia exatamente onde a pessoa aponta. Dá para ver o detalhe da arte."
        onde="página de produto, galeria."
        dica="segure e arraste na foto"
      >
        {() => <Zoom />}
      </Demo>

      <Demo
        titulo="Profundidade"
        texto="Camadas que se mexem em velocidades diferentes conforme o mouse ou a rolagem. Dá sensação de 3D, de cenário."
        onde="topo da home, banners de coleção."
        dica="passe o mouse ou o dedo"
      >
        {() => <Profundidade />}
      </Demo>
    </div>
  );
}
