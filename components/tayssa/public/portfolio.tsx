"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion, useInView, useReducedMotion, useTransform, type MotionValue } from "framer-motion";
import { useProgressoRolagem } from "@/components/tayssa/ui/rolagem";
import { estiloFoco } from "@/lib/tayssa/catalogo";
import type { ItemPortfolio } from "@/lib/tayssa/portfolio";
import { useCamadaAberta } from "@/components/tayssa/ui/dialogo";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/**
 * Onde cada celular flutua, em % do palco (centro do aparelho). Nada de
 * fileira: alturas, tamanhos, giros e profundidades diferentes — o da
 * frente é o primeiro item (de preferência um vídeo). `d` = quanto corre
 * no scroll; `m` = lugar no celular (sem `m`, não aparece no celular).
 */
type Lugar = { x: number; y: number; w: string; r: number; d: number; z: number; m?: { x: number; y: number; w: string; r: number } };
const LUGARES: Lugar[] = [
  { x: 50, y: 52, w: "clamp(200px, 17vw, 260px)", r: -2, d: 0.25, z: 5, m: { x: 31, y: 21, w: "45vw", r: -5 } },
  { x: 29, y: 40, w: "clamp(168px, 14vw, 214px)", r: -7, d: 0.8, z: 4, m: { x: 72, y: 31, w: "41vw", r: 6 } },
  { x: 71, y: 60, w: "clamp(168px, 14vw, 214px)", r: 6, d: 0.6, z: 4, m: { x: 28, y: 72, w: "40vw", r: 4 } },
  { x: 10, y: 62, w: "clamp(148px, 12vw, 184px)", r: -10, d: 1.1, z: 3, m: { x: 71, y: 80, w: "42vw", r: -6 } },
  { x: 90, y: 36, w: "clamp(148px, 12vw, 184px)", r: 9, d: 1.25, z: 3 },
];

/**
 * O portfólio dela em celulares com a cara do Instagram, flutuando: o
 * vídeo é um Reel, a foto é uma publicação. Um vídeo toca de cada vez (o
 * mais perto do centro da tela, como no feed — `data-tocar`, posto por
 * PausaForaDaTela). Tocar no celular abre o trabalho aqui mesmo, grande;
 * de lá, "Ver no Instagram" vai para o post.
 */
export function PortfolioCelulares({ itens, handle, perfilUrl }: { itens: ItemPortfolio[]; handle: string; perfilUrl: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const naTela = useInView(ref, { once: true, amount: 0.15 });
  const entra = naTela || Boolean(reduced);
  const progresso = useProgressoRolagem(ref, ["start end", "end start"]);
  const [aberto, setAberto] = useState<number | null>(null);
  const vistos = itens.slice(0, LUGARES.length);

  return (
    <div ref={ref} className="typf">
      <div className="typf__palco" data-janela data-quantos={vistos.length}>
        {vistos.map((item, i) => (
          <Celular
            key={item.id}
            item={item}
            lugar={LUGARES[i]}
            i={i}
            entra={entra}
            parado={Boolean(reduced)}
            progresso={progresso}
            handle={handle}
            onAbrir={() => setAberto(i)}
          />
        ))}
      </div>
      <div className="typf__rodape">
        <span>Toque num celular para ver aqui</span>
      </div>
      <FeedInstagram itens={itens} handle={handle} perfilUrl={perfilUrl} onAbrir={setAberto} />
      <VisorPortfolio itens={itens} aberto={aberto} onMudar={setAberto} handle={handle} perfilUrl={perfilUrl} />
    </div>
  );
}

/**
 * Todas as publicações numa fileira pequena embaixo dos celulares, no
 * formato do Instagram: miniatura 3:4 como a grade do perfil, ícone de
 * Reel nos vídeos, o perfil em cima. Rola só com o dedo (nada anda
 * sozinho); tocar abre o trabalho no visor. Feita para crescer: quando as
 * publicações do perfil vierem para o site, entram aqui.
 */
function FeedInstagram({
  itens,
  handle,
  perfilUrl,
  onAbrir,
}: {
  itens: ItemPortfolio[];
  handle: string;
  perfilUrl: string;
  onAbrir: (i: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // vídeo sem capa mostra o primeiro quadro: só carrega quando a fileira chega perto
  const perto = useInView(ref, { once: true, margin: "300px 0px" });
  const nome = handle.replace(/^@/, "");
  if (!itens.length) return null;
  return (
    <div ref={ref} className="typf-feed">
      <div className="typf-feed__topo">
        <Avatar handle={handle} />
        <span className="typf-feed__quem">
          <b>{nome}</b>
          <small>
            {itens.length} {itens.length === 1 ? "publicação" : "publicações"}
          </small>
        </span>
        <a className="typf-feed__perfil" href={perfilUrl} target="_blank" rel="noopener noreferrer">
          Ver perfil
        </a>
      </div>
      {/* gesto lateral do trackpad fica com a fileira (o Lenis só cuida do vertical) */}
      <ul className="typf-feed__trilha" aria-label={`Publicações de ${handle}`} data-lenis-prevent-horizontal="">
        {itens.map((item, i) => {
          const video = item.tipo === "video";
          const capa = video ? item.poster : item.src;
          return (
            <li key={item.id}>
              <button
                type="button"
                className="typf-feed__item"
                onClick={() => onAbrir(i)}
                aria-label={`Abrir ${video ? "vídeo" : "foto"}${item.legenda ? `: ${item.legenda}` : ""}`}
              >
                {capa ? (
                  <Image src={capa} alt="" fill sizes="(max-width: 899px) 30vw, 150px" style={estiloFoco(item.foco)} draggable={false} />
                ) : perto ? (
                  <video
                    className="typf-feed__video"
                    src={`${item.src}#t=0.1`}
                    muted
                    playsInline
                    preload="metadata"
                    style={estiloFoco(item.foco)}
                    aria-hidden
                  />
                ) : null}
                {video ? (
                  <span className="typf-feed__selo" aria-hidden>
                    <Ico nome="reels" />
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Celular({
  item,
  lugar,
  i,
  entra,
  parado,
  progresso,
  handle,
  onAbrir,
}: {
  item: ItemPortfolio;
  lugar: Lugar;
  i: number;
  entra: boolean;
  parado: boolean;
  progresso: MotionValue<number>;
  handle: string;
  onAbrir: () => void;
}) {
  // no celular os aparelhos ficam mais perto uns dos outros: corrida menor
  const amplitude = useRef(90);
  useEffect(() => {
    amplitude.current = window.innerWidth < 900 ? 36 : 90;
  }, []);
  const y = useTransform(progresso, (v) => (parado ? 0 : lugar.d * amplitude.current * (1 - 2 * v)));
  const video = item.tipo === "video";
  return (
    <motion.div
      className="typf__lugar"
      data-celular={lugar.m ? "sim" : "nao"}
      style={{
        ["--x" as string]: `${lugar.x}%`,
        ["--y" as string]: `${lugar.y}%`,
        ["--w" as string]: lugar.w,
        ["--r" as string]: `${lugar.r}deg`,
        ["--mx" as string]: `${lugar.m?.x ?? lugar.x}%`,
        ["--my" as string]: `${lugar.m?.y ?? lugar.y}%`,
        ["--mw" as string]: lugar.m?.w ?? lugar.w,
        ["--mr" as string]: `${lugar.m?.r ?? lugar.r}deg`,
        ["--t" as string]: `${6 + (i % 3) * 1.3}s`,
        zIndex: lugar.z,
        y,
      }}
    >
      <motion.button
        type="button"
        className="typf__giro"
        data-janela-item
        data-video={video || undefined}
        aria-label={`Abrir ${video ? "vídeo" : "foto"}: ${item.legenda || item.alt}`}
        onClick={onAbrir}
        initial={parado ? false : { opacity: 0, y: 80, scale: 0.86 }}
        animate={entra ? { opacity: 1, y: 0, scale: 1 } : undefined}
        transition={{ duration: 1.1, delay: 0.1 + i * 0.09, ease: EASE }}
        whileHover={parado ? undefined : { scale: 1.04, y: -8, transition: { duration: 0.45, ease: EASE } }}
      >
        <span className="typf__flutua">
          <span className="typf__aparelho">
            <span className="typf__tela">{video ? <Reel item={item} handle={handle} /> : <Publicacao item={item} handle={handle} />}</span>
          </span>
        </span>
      </motion.button>
    </motion.div>
  );
}

/** O avatar da casa: a inicial no vinho, com o anel de story. */
function Avatar({ handle }: { handle: string }) {
  return (
    <span className="typf__avatar" aria-hidden>
      <span>
        {handle
          .replace(/^@\d*\.?/, "")
          .charAt(0)
          .toUpperCase() || "T"}
      </span>
    </span>
  );
}

/** Vídeo na interface de Reels. Toca só quando é o escolhido da tela. */
function Reel({ item, handle }: { item: ItemPortfolio; handle: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    const alvo = v?.closest<HTMLElement>("[data-janela-item]");
    if (!v || !alvo) return;
    const seguir = () => {
      if (alvo.hasAttribute("data-tocar")) void v.play().catch(() => {});
      else v.pause();
    };
    seguir();
    const mo = new MutationObserver(seguir);
    mo.observe(alvo, { attributes: true, attributeFilter: ["data-tocar"] });
    return () => mo.disconnect();
  }, []);
  return (
    <span className="typf__reel">
      <video
        ref={ref}
        className="typf__midia"
        style={estiloFoco(item.foco)}
        // #t=0.1: o Safari do iPhone mostra o primeiro quadro parado
        src={`${item.src}#t=0.1`}
        poster={item.poster ?? undefined}
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden
        tabIndex={-1}
      />
      <span className="typf__veu" aria-hidden />
      <span className="typf__reel-topo" aria-hidden>
        <b>Reels</b>
        <Ico nome="camera" />
      </span>
      <span className="typf__reel-acoes" aria-hidden>
        <Ico nome="coracao" />
        <Ico nome="balao" />
        <Ico nome="enviar" />
        <Ico nome="mais" />
      </span>
      <span className="typf__reel-base" aria-hidden>
        <span className="typf__autor">
          <Avatar handle={handle} />
          <b>{handle.replace(/^@/, "")}</b>
          <i>Seguir</i>
        </span>
        {item.legenda ? <span className="typf__legenda">{item.legenda}</span> : null}
        <span className="typf__audio">
          <Ico nome="nota" />
          áudio original
        </span>
      </span>
      <span className="typf__barra" aria-hidden>
        <i />
      </span>
      <span className="typf__play" aria-hidden />
    </span>
  );
}

/** Foto na interface de publicação do feed. */
function Publicacao({ item, handle }: { item: ItemPortfolio; handle: string }) {
  return (
    <span className="typf__post" aria-hidden>
      <span className="typf__post-barra">
        <Ico nome="voltar" />
        <b>Publicações</b>
        <span />
      </span>
      <span className="typf__post-cabeca">
        <Avatar handle={handle} />
        <b>{handle.replace(/^@/, "")}</b>
        <Ico nome="mais" />
      </span>
      <span className="typf__post-foto">
        <Image src={item.src} alt="" fill sizes="(max-width: 899px) 46vw, 260px" style={estiloFoco(item.foco)} draggable={false} />
      </span>
      <span className="typf__post-acoes">
        <Ico nome="coracao" />
        <Ico nome="balao" />
        <Ico nome="enviar" />
        <span />
        <Ico nome="salvar" />
      </span>
      {item.legenda ? (
        <span className="typf__post-texto">
          <b>{handle.replace(/^@/, "")}</b> {item.legenda}
        </span>
      ) : null}
    </span>
  );
}

const ICONES: Record<string, ReactNode> = {
  camera: (
    <>
      <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.6l1.4-2h5l1.4 2h1.6A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5z" />
      <circle cx="12" cy="12.5" r="3.4" />
    </>
  ),
  coracao: <path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z" />,
  balao: <path d="M20 11.5a8 8 0 1 1-3.3-6.5A8 8 0 0 1 20 11.5zM20 19.5l-1.2-3.9" />,
  enviar: <path d="M21 4 10 13.5M21 4l-6.5 16-4.5-6.5L3.5 9z" />,
  mais: (
    <>
      <circle cx="5.5" cy="12" r="1.1" fill="currentColor" />
      <circle cx="12" cy="12" r="1.1" fill="currentColor" />
      <circle cx="18.5" cy="12" r="1.1" fill="currentColor" />
    </>
  ),
  nota: <path d="M9 17.5V6l10-2v11.5M9 17.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0zM19 15.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" />,
  voltar: <path d="M14.5 5.5 8 12l6.5 6.5" />,
  reels: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <path d="M3.5 8.5h17M9 3.5l2.6 5M14.6 3.5l2.6 5" />
      <path d="M10.3 11.6v5.2l4.4-2.6z" fill="currentColor" />
    </>
  ),
  salvar: <path d="M6.5 4h11v16l-5.5-4.6L6.5 20z" />,
  som: <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4zM15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />,
  mudo: <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4zM16 9.5l5 5M21 9.5l-5 5" />,
  instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r="0.9" fill="currentColor" />
    </>
  ),
};

function Ico({ nome }: { nome: keyof typeof ICONES }) {
  return (
    <svg
      className="typf__ico"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
    >
      {ICONES[nome]}
    </svg>
  );
}

/**
 * O trabalho grande, dentro do site: o vídeo toca com som (dá para
 * calar), setas e arrastar passam para o próximo, e "Ver no Instagram"
 * abre a publicação — ou o perfil, enquanto o link do post não existe.
 */
function VisorPortfolio({
  itens,
  aberto,
  onMudar,
  handle,
  perfilUrl,
}: {
  itens: ItemPortfolio[];
  aberto: number | null;
  onMudar: (i: number | null) => void;
  handle: string;
  perfilUrl: string;
}) {
  const reduced = useReducedMotion();
  const [dir, setDir] = useState(1);
  const [som, setSom] = useState(true);
  // a caixa do visor segue a proporção de cada mídia (sem faixa preta)
  const [proporcoes, setProporcoes] = useState<Record<string, number>>({});
  const medir = (id: string, w: number, h: number) => {
    if (w > 0 && h > 0) setProporcoes((p) => (p[id] ? p : { ...p, [id]: w / h }));
  };
  const fecharRef = useRef<HTMLButtonElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const camada = useRef<HTMLDivElement>(null);
  // antes do efeito que foca o "Fechar": lê quem abriu, para o foco voltar lá
  useCamadaAberta(aberto !== null, camada);
  const montado = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const ir = (passo: number) => {
    if (aberto === null) return;
    setDir(passo);
    onMudar((aberto + passo + itens.length) % itens.length);
  };
  useEffect(() => {
    if (aberto === null) return;
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

  const m = aberto === null ? null : itens[aberto];
  // o vídeo começa com som (ela tocou para abrir); se o navegador barrar, toca mudo
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !m || m.tipo !== "video") return;
    v.muted = !som;
    v.play().catch(() => {
      v.muted = true;
      setSom(false);
      void v.play().catch(() => {});
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [m?.id]);

  if (!montado) return null;
  const link = m?.url ?? perfilUrl;
  return createPortal(
    <AnimatePresence>
      {m ? (
        <motion.div
          ref={camada}
          className="ty-visor typf-visor ty-scope"
          data-theme="night"
          role="dialog"
          aria-modal="true"
          aria-label={m.legenda || `Trabalho de ${handle}`}
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
              transition={{ duration: 0.5, ease: EASE }}
              drag={reduced ? false : "x"}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.4}
              onDragEnd={(_, info) => {
                if (info.offset.x < -70) ir(1);
                else if (info.offset.x > 70) ir(-1);
              }}
            >
              <div
                className="ty-visor__midia typf-visor__midia"
                data-tipo={m.tipo}
                style={proporcoes[m.id] ? ({ "--proporcao": String(proporcoes[m.id]) } as CSSProperties) : undefined}
              >
                {m.tipo === "video" ? (
                  <video
                    ref={videoRef}
                    src={m.src}
                    poster={m.poster ?? undefined}
                    loop
                    playsInline
                    muted={!som}
                    aria-label={m.alt}
                    onLoadedMetadata={(e) => medir(m.id, e.currentTarget.videoWidth, e.currentTarget.videoHeight)}
                  />
                ) : (
                  <Image
                    src={m.src}
                    alt={m.alt}
                    fill
                    sizes="(max-width: 767px) 92vw, 60vw"
                    style={{ objectFit: "contain" }}
                    draggable={false}
                    onLoad={(e) => medir(m.id, e.currentTarget.naturalWidth, e.currentTarget.naturalHeight)}
                  />
                )}
              </div>
              <figcaption className="typf-visor__rodape">
                <span className="typf-visor__quem">
                  <Avatar handle={handle} />
                  <span>
                    <b>{handle}</b>
                    {m.legenda ? <span>{m.legenda}</span> : null}
                  </span>
                </span>
                <span className="typf-visor__acoes">
                  {m.tipo === "video" ? (
                    <button
                      type="button"
                      className="typf-visor__som"
                      aria-pressed={som}
                      aria-label={som ? "Tirar o som" : "Ligar o som"}
                      onClick={() => {
                        const v = videoRef.current;
                        setSom((s) => !s);
                        if (v) {
                          v.muted = som;
                          void v.play().catch(() => {});
                        }
                      }}
                    >
                      <Ico nome={som ? "som" : "mudo"} />
                    </button>
                  ) : null}
                  <a href={link} target="_blank" rel="noopener noreferrer" className="typf-visor__ig">
                    <Ico nome="instagram" />
                    {m.url ? "Ver no Instagram" : "Ver o perfil no Instagram"}
                  </a>
                </span>
              </figcaption>
            </motion.figure>
          </AnimatePresence>
          {itens.length > 1 ? (
            <>
              <button type="button" className="ty-visor__seta ty-visor__seta--ant" aria-label="Anterior" onClick={() => ir(-1)} />
              <button type="button" className="ty-visor__seta ty-visor__seta--prox" aria-label="Próximo" onClick={() => ir(1)} />
              <span className="ty-visor__conta" aria-live="polite">
                {(aberto ?? 0) + 1} / {itens.length}
              </span>
            </>
          ) : null}
          <button ref={fecharRef} type="button" className="ty-visor__fechar" aria-label="Fechar" onClick={() => onMudar(null)} />
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
