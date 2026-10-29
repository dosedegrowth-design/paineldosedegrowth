"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type RefObject } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import Image from "next/image";
import { estiloFoco, type MidiaCatalogo } from "@/lib/tayssa/catalogo";
import { useCamadaAberta } from "@/components/tayssa/ui/dialogo";

/** Quantas mídias diferentes passam no rolo; o visor abre todas. */
const AMOSTRA = { grande: 12, mini: 10 } as const;

/** Parada (sem tocar) por esse tempo, a fila volta a andar sozinha. */
const VOLTA_MS = 2500;

/**
 * A cliente manda no rolo (pedido do Lucas, 29/10/2026: "se ela põe o dedo
 * para rolar, a animação para e ela que manda"). Arrastar de lado com o dedo
 * ou o mouse, ou rolar de lado no trackpad, para a animação e a fila passa a
 * seguir a mão, com o embalo do gesto; parada uns segundos, a fila volta a
 * andar sozinha de onde ela deixou. A fila é dobrada, então arrastar dá a
 * volta sem fim, para os dois lados. Tocar sem arrastar continua abrindo a
 * foto; o arrasto de cima para baixo continua rolando a página.
 *
 * A animação sozinha é a do CSS (`ty-rolo`, na placa de vídeo). Ao pegar, o
 * trilho ganha `data-manual` (animação desligada, `--x` na mão); ao soltar
 * de vez, a animação volta com um atraso negativo que a faz começar onde a
 * mão deixou.
 */
function useArrastoDoRolo(ref: RefObject<HTMLDivElement | null>, ativo: boolean, segundos: number, sentido: 1 | -1) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !ativo) return;
    let metade = 0;
    let x = 0;
    let manual = false;
    let inicio: { x: number; y: number; base: number; id: number } | null = null;
    let arrastando = false;
    let arrastou = false;
    let vel = 0;
    let ultimo = { x: 0, t: 0 };
    let embalo = 0;
    let volta = 0;

    // uma volta é metade do trilho (a fila é dobrada): a posição fica em (-metade, 0]
    const dar = (v: number) => {
      const r = v % metade;
      return r > 0 ? r - metade : r;
    };
    const mover = (v: number) => {
      x = dar(v);
      el.style.setProperty("--x", `${x}px`);
    };
    const pegar = () => {
      clearTimeout(volta);
      cancelAnimationFrame(embalo);
      if (manual) return;
      metade = el.offsetWidth / 2 || 1;
      // onde a animação está agora (ou parada, com o mouse em cima)
      const agora = new DOMMatrixReadOnly(getComputedStyle(el).transform).m41;
      manual = true;
      mover(agora);
      el.setAttribute("data-manual", "");
    };
    const soltarDeVez = () => {
      clearTimeout(volta);
      volta = window.setTimeout(() => {
        if (!manual) return;
        // a animação recomeça do ponto onde a mão deixou (atraso negativo)
        const andado = -x / metade;
        const progresso = sentido === 1 ? andado : 1 - andado;
        el.style.animationDelay = `${-progresso * segundos}s`;
        el.removeAttribute("data-manual");
        manual = false;
      }, VOLTA_MS);
    };

    const baixo = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      arrastou = false;
      inicio = { x: e.clientX, y: e.clientY, base: 0, id: e.pointerId };
      arrastando = false;
      // um toque durante o embalo segura a fila onde está
      if (manual) {
        cancelAnimationFrame(embalo);
        clearTimeout(volta);
      }
    };
    const mexer = (e: PointerEvent) => {
      if (!inicio || e.pointerId !== inicio.id) return;
      const dx = e.clientX - inicio.x;
      const dy = e.clientY - inicio.y;
      if (!arrastando) {
        // de cima para baixo é a página rolando: o rolo não se mete
        if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) {
          inicio = null;
          return;
        }
        if (Math.abs(dx) < 6) return;
        arrastando = true;
        arrastou = true;
        pegar();
        inicio.base = x - dx;
        try {
          el.setPointerCapture(e.pointerId);
        } catch {}
        vel = 0;
        ultimo = { x: e.clientX, t: e.timeStamp };
      }
      mover(inicio.base + dx);
      const dt = e.timeStamp - ultimo.t;
      if (dt > 0) vel = 0.8 * ((e.clientX - ultimo.x) / dt) + 0.2 * vel;
      ultimo = { x: e.clientX, t: e.timeStamp };
    };
    const cima = (e: PointerEvent) => {
      if (!inicio || e.pointerId !== inicio.id) return;
      const foi = arrastando;
      inicio = null;
      arrastando = false;
      if (!foi) {
        if (manual) soltarDeVez();
        return;
      }
      // o embalo do gesto: segue na velocidade do dedo, freando
      let antes = performance.now();
      const passo = (agora: number) => {
        const dt = Math.min(48, agora - antes);
        antes = agora;
        vel *= Math.pow(0.94, dt / 16);
        if (Math.abs(vel) < 0.02) {
          soltarDeVez();
          return;
        }
        mover(x + vel * dt);
        embalo = requestAnimationFrame(passo);
      };
      embalo = requestAnimationFrame(passo);
    };
    const cancela = (e: PointerEvent) => {
      if (!inicio || e.pointerId !== inicio.id) return;
      inicio = null;
      arrastando = false;
      if (manual) soltarDeVez();
    };
    // depois de arrastar, o clique que o navegador manda não abre a foto
    const clique = (e: MouseEvent) => {
      if (!arrastou) return;
      e.preventDefault();
      e.stopPropagation();
      arrastou = false;
    };
    // trackpad de lado (ou roda com shift): a fila anda com ele
    const roda = (e: WheelEvent) => {
      const dx = e.deltaX || (e.shiftKey ? e.deltaY : 0);
      if (!dx || (!e.shiftKey && Math.abs(e.deltaY) > Math.abs(dx))) return;
      e.preventDefault();
      pegar();
      mover(x - dx);
      soltarDeVez();
    };

    el.addEventListener("pointerdown", baixo);
    el.addEventListener("pointermove", mexer);
    el.addEventListener("pointerup", cima);
    el.addEventListener("pointercancel", cancela);
    el.addEventListener("click", clique, true);
    el.addEventListener("wheel", roda, { passive: false });
    return () => {
      el.removeEventListener("pointerdown", baixo);
      el.removeEventListener("pointermove", mexer);
      el.removeEventListener("pointerup", cima);
      el.removeEventListener("pointercancel", cancela);
      el.removeEventListener("click", clique, true);
      el.removeEventListener("wheel", roda);
      clearTimeout(volta);
      cancelAnimationFrame(embalo);
      el.removeAttribute("data-manual");
      el.style.removeProperty("animation-delay");
    };
  }, [ref, ativo, segundos, sentido]);
}

/**
 * O rolo: fotos e vídeos de um produto passando sozinhos, sem fim, cada
 * cartão flutuando no seu tempo. Mouse em cima (ou dedo parado) pausa;
 * arrastar de lado leva a fila na mão (`useArrastoDoRolo`); tocar abre a
 * mídia grande, com as setas para ir e voltar. Vídeo só toca quando está
 * na tela — e sempre sem som.
 */
export function Rolo({
  itens,
  tamanho = "grande",
  rotulo,
  sentido = 1,
}: {
  itens: MidiaCatalogo[];
  tamanho?: "grande" | "mini";
  /** nome do rolo para leitor de tela */
  rotulo: string;
  /** 1 corre para a esquerda, -1 para a direita */
  sentido?: 1 | -1;
}) {
  const reduced = useReducedMotion();
  const [aberto, setAberto] = useState<number | null>(null);
  const trilho = useRef<HTMLDivElement>(null);
  const vazio = !itens.length;
  // passa só o começo da fila (quem chama já intercala os produtos): com as
  // 46 fotos de cílios eram 92 cartões animados e o celular perdia quadros.
  // Tocar abre o visor com a fila inteira.
  const mostrados = itens.slice(0, AMOSTRA[tamanho]);
  // uma mídia só fica parada: repetida, a mesma foto passaria oito vezes
  const unica = mostrados.length === 1;
  // o laço precisa de largura: repete até ter cartões suficientes, e dobra
  // a fila inteira para a emenda nunca aparecer
  const minimo = vazio ? 0 : unica ? 1 : tamanho === "mini" ? 8 : 7;
  const base: MidiaCatalogo[] = [];
  while (base.length < minimo) base.push(...mostrados);
  const fila = unica ? base : [...base, ...base];
  const segundos = base.length * (tamanho === "mini" ? 3.2 : 4.6);
  useArrastoDoRolo(trilho, !vazio && !unica && !reduced, segundos, sentido);
  if (vazio) return null;

  return (
    // gesto de lado do trackpad fica com o rolo (o Lenis só cuida do vertical)
    <div className={`ty-rolo ty-rolo--${tamanho}`} role="region" aria-label={rotulo} data-lenis-prevent-horizontal="">
      <div
        ref={trilho}
        className="ty-rolo__trilho"
        data-janela
        data-unica={unica || undefined}
        data-parado={reduced || unica ? "true" : "false"}
        style={{ "--dur": `${segundos}s`, "--dir": sentido === 1 ? "normal" : "reverse" } as CSSProperties}
      >
        {fila.map((m, i) => {
          // a amostra é o começo da fila: o índice vale para o visor também
          const original = i % mostrados.length;
          const copia = i >= mostrados.length;
          return (
            <button
              key={`${m.id}-${i}`}
              type="button"
              className="ty-rolo__cartao"
              data-janela-item
              data-video={m.tipo === "video" || undefined}
              style={{ "--i": i % 5 } as CSSProperties}
              onClick={() => setAberto(original)}
              aria-label={`Abrir ${m.tipo === "video" ? "vídeo" : "foto"}: ${m.produto}`}
              // só a primeira volta é navegável por teclado/leitor
              tabIndex={copia ? -1 : undefined}
              aria-hidden={copia || undefined}
            >
              <span className="ty-rolo__flutua">
                <Midia m={m} />
                <span className="ty-rolo__brilho" aria-hidden />
                <span className="ty-rolo__rotulo">
                  {m.tipo === "video" ? <i className="ty-rolo__play" aria-hidden /> : null}
                  {m.produto}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      <Visor itens={itens} aberto={aberto} onMudar={setAberto} />
    </div>
  );
}

/** Foto leve ou vídeo que toca só enquanto aparece. */
function Midia({ m, grande = false }: { m: MidiaCatalogo; grande?: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  // no rolo, toca só quando o cartão é o escolhido (`data-tocar`, posto por
  // PausaForaDaTela: um vídeo por vez, o mais perto do centro da tela)
  useEffect(() => {
    const v = ref.current;
    const cartao = v?.closest<HTMLElement>("[data-janela-item]");
    if (!v || !cartao || grande) return;
    const seguir = () => {
      if (cartao.hasAttribute("data-tocar")) void v.play().catch(() => {});
      else v.pause();
    };
    seguir();
    const mo = new MutationObserver(seguir);
    mo.observe(cartao, { attributes: true, attributeFilter: ["data-tocar"] });
    return () => mo.disconnect();
  }, [grande]);
  // no rolo vale o enquadramento que a Tayssa escolheu; no visor, a mídia inteira
  const quadro = grande ? undefined : estiloFoco(m.foco);
  if (m.tipo === "video") {
    return (
      <video
        ref={ref}
        className="ty-rolo__midia"
        style={quadro}
        // #t=0.1: o Safari do iPhone mostra o primeiro quadro do vídeo parado
        src={grande ? m.url : `${m.url}#t=0.1`}
        muted
        loop
        playsInline
        autoPlay={grande}
        preload="metadata"
        aria-label={m.alt}
      />
    );
  }
  return (
    <Image
      className="ty-rolo__midia"
      src={m.url}
      alt={m.alt}
      fill
      sizes={grande ? "(max-width: 767px) 92vw, 70vw" : "(max-width: 767px) 60vw, 300px"}
      style={quadro ?? { objectFit: "contain" }}
      draggable={false}
    />
  );
}

/**
 * A mídia grande, por cima de tudo: setas, Esc e arrastar para os lados. No
 * celular a foto vai de ponta a ponta e arrastar para baixo fecha, como no
 * Instagram e na galeria do iPhone (a foto encolhe um pouco enquanto desce).
 */
export function Visor({
  itens,
  aberto,
  onMudar,
}: {
  itens: MidiaCatalogo[];
  aberto: number | null;
  onMudar: (i: number | null) => void;
}) {
  const reduced = useReducedMotion();
  const [dir, setDir] = useState(1);
  // a foto descendo com o dedo: encolhe um pouco, para dizer que vai fechar
  const descida = useMotionValue(0);
  const encolhe = useTransform(descida, [0, 320], [1, 0.84]);
  const fecharRef = useRef<HTMLButtonElement>(null);
  const camada = useRef<HTMLDivElement>(null);
  // antes do efeito que foca o "Fechar": lê quem abriu, para o foco voltar lá
  useCamadaAberta(aberto !== null, camada);
  // o portal só existe no navegador: no servidor (e na hidratação) não há visor
  const montado = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const ir = (passo: number) => {
    if (aberto === null) return;
    setDir(passo);
    onMudar((aberto + passo + itens.length) % itens.length);
  };
  useEffect(() => {
    if (aberto === null) return;
    // quem fechou arrastando deixou a foto lá embaixo: a próxima abre no lugar
    descida.set(0);
    fecharRef.current?.focus();
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") onMudar(null);
      if (e.key === "ArrowRight") ir(1);
      if (e.key === "ArrowLeft") ir(-1);
    };
    document.addEventListener("keydown", tecla);
    const antes = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", tecla);
      document.documentElement.style.overflow = antes;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto]);

  if (!montado) return null;
  const m = aberto === null ? null : itens[aberto];
  return createPortal(
    <AnimatePresence>
      {m ? (
        <motion.div
          ref={camada}
          className="ty-visor ty-scope"
          data-theme="night"
          role="dialog"
          aria-modal="true"
          aria-label={m.produto}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.3 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onMudar(null);
          }}
        >
          <AnimatePresence mode="popLayout" custom={dir}>
            <motion.figure
              key={m.id}
              className="ty-visor__fig"
              custom={dir}
              initial={reduced ? false : { opacity: 0, x: dir * 80, scale: 0.94, rotateY: dir * -12 }}
              animate={{ opacity: 1, x: 0, scale: 1, rotateY: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, x: dir * -80, scale: 0.94 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{ y: descida }}
              drag={!reduced}
              dragDirectionLock
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={{ left: 0.4, right: 0.4, top: 0.08, bottom: 0.7 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 110 || info.velocity.y > 650) onMudar(null);
                else if (info.offset.x < -70) ir(1);
                else if (info.offset.x > 70) ir(-1);
              }}
            >
              <motion.div className="ty-visor__encolhe" style={{ scale: encolhe }}>
                <div className="ty-visor__midia" style={{ aspectRatio: String(m.ratio), "--r": m.ratio } as CSSProperties}>
                  <Midia m={m} grande />
                </div>
              </motion.div>
              <figcaption>
                <b>{m.produto}</b>
                {m.legenda ? <span>{m.legenda}</span> : null}
              </figcaption>
            </motion.figure>
          </AnimatePresence>
          {itens.length > 1 ? (
            <>
              <button type="button" className="ty-visor__seta ty-visor__seta--ant" aria-label="Anterior" onClick={() => ir(-1)} />
              <button type="button" className="ty-visor__seta ty-visor__seta--prox" aria-label="Próxima" onClick={() => ir(1)} />
              <span className="ty-visor__conta" aria-live="polite">
                {(aberto ?? 0) + 1} / {itens.length}
              </span>
            </>
          ) : null}
          <button ref={fecharRef} type="button" className="ty-visor__fechar" aria-label="Fechar" onClick={() => onMudar(null)} />
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
