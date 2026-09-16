"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { ROUTES } from "@/lib/tayssa/config";
import { plural } from "@/lib/tayssa/format";
import type { PhotoSlot } from "@/lib/tayssa/photos";
import type { RevealResult } from "@/lib/tayssa/actions/card";
import type { CardStamp } from "@/lib/tayssa/types";
import { ScratchSheet } from "@/components/tayssa/vip/scratch-sheet";
import { useFinePointer } from "@/components/tayssa/ui/use-media";

const Lash = (
  <svg viewBox="0 0 24 24" aria-hidden>
    <path d="M3 15c3.4-4.2 6.6-6.3 9-6.3s5.6 2.1 9 6.3" />
    <path d="M6.4 11.6 5 8.6M12 8.9V5.6M17.6 11.6 19 8.6" />
  </svg>
);

const Turn = (
  <svg viewBox="0 0 24 24" aria-hidden>
    <path d="M4 12a8 8 0 0 1 13.7-5.7M20 12a8 8 0 0 1-13.7 5.7" />
    <path d="M17.7 2.5v3.8h-3.8M6.3 21.5v-3.8h3.8" />
  </svg>
);

type Side = "front" | "back";

export type LoyaltyCardProps = {
  cycle: number;
  size: number;
  stamps: CardStamp[];
  /** cartões já fechados antes deste */
  completedCards: number;
  rewardTitle: string;
  rewardStatus: string | null;
  /** mostra o link para a página do cartão (usado na home) */
  withLink?: boolean;
  /** fotos reais da biblioteca — a frente do cartão passa por elas devagar */
  photos: PhotoSlot[];
  holderName: string;
  memberSince?: string | null;
  isVip?: boolean;
  initialSide?: Side;
};

const DEG = Math.PI / 180;
/** giro com um leve excesso: mola, não curva de CSS */
const FLIP_SPRING = { stiffness: 64, damping: 13, mass: 1 };
const TILT_SPRING = { stiffness: 140, damping: 20, mass: 0.5 };
/** cada foto fica este tempo antes de ceder à próxima */
const SEQUENCE_MS = 4600;

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * A sequência da frente. Uma foto de cada vez, a câmera se movendo
 * devagar como se fosse o mesmo objeto visto de outro ângulo; a troca é
 * um fade lento. Foto que não carrega sai da sequência; sem nenhuma, a
 * frente é um campo escuro com o emblema — nunca imagem inventada.
 */
function CardPhotos({ photos, playing, reduced }: { photos: PhotoSlot[]; playing: boolean; reduced: boolean }) {
  const [broken, setBroken] = useState<ReadonlySet<string>>(() => new Set());
  const [tick, setTick] = useState(0);
  const list = photos.filter((p) => !broken.has(p.src));
  const count = list.length;

  useEffect(() => {
    if (!playing || reduced || count < 2) return;
    const id = window.setInterval(() => setTick((t) => t + 1), SEQUENCE_MS);
    return () => window.clearInterval(id);
  }, [playing, reduced, count]);

  if (!count) {
    return (
      <div className="tyc3__tonal" aria-hidden>
        {Lash}
      </div>
    );
  }
  const active = tick % count;
  const previous = tick > 0 && count > 1 ? (tick - 1) % count : -1;

  return (
    <div className="tyc3__photos" aria-hidden>
      {list.map((p, k) => (
        <div
          key={p.src}
          className="tyc3__photo"
          data-on={k === active ? "" : undefined}
          data-off={k === previous ? "" : undefined}
          data-dir={k % 4}
        >
          <Image
            src={p.src}
            alt=""
            fill
            sizes="(max-width: 560px) calc(100vw - 40px), 480px"
            priority={k === 0}
            onError={() => setBroken((prev) => new Set(prev).add(p.src))}
            style={{ objectFit: "cover", objectPosition: "50% 35%" }}
          />
        </div>
      ))}
    </div>
  );
}

/**
 * O cartão. Um objeto físico na proporção de cartão de crédito: a frente
 * com as fotos da Tayssa e o nome da cliente; o verso com as posições da
 * visita e, quando há carimbo novo, a folha dourada para raspar. Tocar
 * vira o cartão de verdade (rotação 3D, frente e verso no mesmo corpo);
 * no desktop ele acompanha o cursor.
 */
export function LoyaltyCard({
  cycle,
  size,
  stamps,
  completedCards,
  rewardTitle,
  rewardStatus,
  withLink = false,
  photos,
  holderName,
  memberSince = null,
  isVip = false,
  initialSide = "front",
}: LoyaltyCardProps) {
  const router = useRouter();
  const reduced = useReducedMotion() ?? false;
  const fine = useFinePointer();
  const [list, setList] = useState<CardStamp[]>(stamps);
  // depois de fechar um cartão o servidor manda o próximo: a lista local
  // segue os carimbos novos em vez de ficar presa aos antigos
  const [seenStamps, setSeenStamps] = useState(stamps);
  if (seenStamps !== stamps) {
    setSeenStamps(stamps);
    setList(stamps);
  }
  // o carimbo aberto na raspadinha é guardado inteiro: se o servidor
  // trocar o cartão no meio (fechou o 1, veio o 2), a folha não some
  const [open, setOpen] = useState<CardStamp | null>(null);
  const [side, setSide] = useState<Side>(initialSide);
  const touched = useRef(false);

  // o giro é um valor só; sombra e recuo derivam dele
  const rotTarget = useMotionValue(initialSide === "back" ? 180 : 0);
  const rotSpring = useSpring(rotTarget, FLIP_SPRING);
  // a mola passa um fio de 180° no excesso — e nesse fio o navegador
  // esconde a face de trás (backface). O cartão "bate" em 0 e em 180.
  const rotLanded = useTransform(rotSpring, (v: number) => Math.min(180, Math.max(0, v)));
  const rot = reduced ? rotTarget : rotLanded;
  const turning = useTransform(rot, (r: number) => Math.abs(Math.sin(r * DEG)));
  const shade = useTransform(turning, (t: number) => t * 0.45);
  const recede = useTransform(turning, (t: number) => 1 - t * 0.05);

  // no desktop o cartão inclina com o cursor e o brilho corre pela frente
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, TILT_SPRING);
  const sy = useSpring(my, TILT_SPRING);
  const tiltX = useTransform(sy, (v: number) => v * -10);
  const tiltY = useTransform(sx, (v: number) => v * 12);
  const glossX = useTransform(sx, (v: number) => 50 + v * 70);
  const glossY = useTransform(sy, (v: number) => 50 + v * 70);
  const gloss = useMotionTemplate`radial-gradient(55% 45% at ${glossX}% ${glossY}%, rgba(255,255,255,0.2), rgba(255,255,255,0.05) 45%, transparent 70%)`;
  const tilting = fine && !reduced;

  const filled = list.length;
  const unrevealed = list.filter((s) => !s.revealed);
  const missing = Math.max(0, size - filled);
  const sinceYear = memberSince ? new Date(memberSince).getFullYear() : NaN;

  const flip = useCallback(() => {
    const nextSide: Side = side === "front" ? "back" : "front";
    setSide(nextSide);
    rotTarget.set(nextSide === "back" ? 180 : 0);
  }, [side, rotTarget]);

  const onBodyClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("[data-noflip]")) return;
    flip();
  };

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    if (!r.width || !r.height) return;
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  const onRevealed = useCallback((id: string, result: RevealResult | null) => {
    if (!result) return;
    setList((prev) => prev.map((s) => (s.id === id ? { ...s, revealed: true } : s)));
    touched.current = true;
  }, []);

  const close = useCallback(() => {
    setOpen(null);
    // pontos, ranking e benefícios mudam junto: recarrega os dados do servidor
    if (touched.current) {
      touched.current = false;
      router.refresh();
    }
  }, [router]);

  const next = useCallback(() => {
    setOpen(list.find((s) => !s.revealed && s.id !== open?.id) ?? null);
  }, [list, open]);

  const caption = unrevealed.length
    ? `${unrevealed.length} ${plural(unrevealed.length, "carimbo novo", "carimbos novos")} no verso — toque para virar`
    : missing > 0
      ? `${missing === 1 ? "falta" : "faltam"} ${missing} ${plural(missing, "visita", "visitas")} para o presente`
      : rewardStatus === "available" || rewardStatus === "approved"
        ? `${rewardTitle} liberado`
        : `${rewardTitle} em validação`;

  const slots = Array.from({ length: size }, (_, i) => {
    const position = i + 1;
    const stamp = list.find((s) => s.position === position);
    if (stamp && !stamp.revealed) {
      return (
        <button
          key={position}
          type="button"
          className="tyc3__slot"
          data-state="new"
          data-noflip
          onClick={() => setOpen(stamp)}
          aria-label={`Raspar o carimbo ${position}`}
        >
          <span className="tyc3__n">{position}</span>
        </button>
      );
    }
    return (
      <div
        key={position}
        className="tyc3__slot"
        data-state={stamp ? "done" : "empty"}
        title={stamp ? `${stamp.serviceName} · +${stamp.points}` : undefined}
      >
        {stamp ? Lash : <span className="tyc3__n">{position}</span>}
      </div>
    );
  });

  const front = side === "front";

  return (
    <>
      <div
        className="tyc3"
        data-side={side}
        onPointerMove={tilting ? onMove : undefined}
        onPointerLeave={tilting ? onLeave : undefined}
      >
        <motion.div className="tyc3__tilt" style={tilting ? { rotateX: tiltX, rotateY: tiltY } : undefined}>
          <motion.div
            className="tyc3__body"
            style={{ rotateY: rot, scale: recede }}
            onClick={onBodyClick}
            role="group"
            aria-label={
              front
                ? "Cartão de fidelidade, frente. Toque para ver o verso."
                : "Cartão de fidelidade, verso. Toque para ver a frente."
            }
          >
            <div className="tyc3__face tyc3__face--front" inert={front ? undefined : true} aria-hidden={!front}>
              <CardPhotos photos={photos} playing={front && !open} reduced={reduced} />
              <div className="tyc3__scrim" />
              <div className="tyc3__grain" />
              <motion.div className="tyc3__gloss" style={tilting ? { background: gloss } : undefined} />
              <div className="tyc3__front">
                <div className="tyc3__row">
                  <span className="tyc3__brand">
                    <i aria-hidden>T</i>Tayssa <em>Lash</em>
                  </span>
                  {unrevealed.length ? (
                    <span className="tyc3__badge">
                      {unrevealed.length} {plural(unrevealed.length, "novo", "novos")}
                    </span>
                  ) : isVip ? (
                    <span className="tyc3__tag tyc3__tag--gold">VIP</span>
                  ) : (
                    <span className="tyc3__tag">Clube</span>
                  )}
                </div>
                <div className="tyc3__row">
                  <span className="tyc3__chip" aria-hidden />
                  <span className="tyc3__emblem" aria-hidden>
                    {Lash}
                  </span>
                </div>
                <div className="tyc3__row tyc3__row--end">
                  <div className="tyc3__id">
                    <span className="tyc3__holder">{holderName}</span>
                    <span className="tyc3__meta">
                      Cartão {pad(cycle)} · {filled}/{size}
                      {Number.isFinite(sinceYear) ? ` · desde ${sinceYear}` : ""}
                    </span>
                  </div>
                  <button type="button" className="tyc3__flip" data-noflip onClick={flip} aria-label="Virar o cartão">
                    {Turn}
                  </button>
                </div>
              </div>
              <motion.div className="tyc3__shade" style={{ opacity: shade }} aria-hidden />
            </div>

            <div className="tyc3__face tyc3__face--back" inert={front ? true : undefined} aria-hidden={front}>
              <div className="tyc3__band">
                <span>
                  {size} visitas, <em>um presente.</em>
                </span>
                <span>Cartão {pad(cycle)}</span>
              </div>
              <div className="tyc3__grid">{slots}</div>
              <div className="tyc3__back-foot">
                <span>
                  <strong>{filled}</strong> de {size}
                  {completedCards > 0 ? ` · ${completedCards} ${plural(completedCards, "fechado", "fechados")}` : ""}
                  {missing > 0 ? ` · ${missing === 1 ? "falta" : "faltam"} ${missing}` : ""}
                </span>
                <button
                  type="button"
                  className="tyc3__flip tyc3__flip--back"
                  data-noflip
                  onClick={flip}
                  aria-label="Ver a frente do cartão"
                >
                  {Turn}
                  <span>frente</span>
                </button>
              </div>
              <motion.div className="tyc3__shade" style={{ opacity: shade }} aria-hidden />
            </div>
          </motion.div>
        </motion.div>
      </div>

      <div className="tyc3__below">
        <span>{caption}</span>
        {withLink ? (
          <Link href={ROUTES.vipCard} className="tyc3__link">
            Ver o cartão
          </Link>
        ) : null}
      </div>

      <AnimatePresence>
        {open ? (
          <ScratchSheet
            key={open.id}
            stamp={open}
            cardSize={size}
            remaining={list.filter((s) => !s.revealed && s.id !== open.id).length}
            onRevealed={onRevealed}
            onNext={next}
            onClose={close}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}
