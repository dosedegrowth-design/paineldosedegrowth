"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { ROUTES } from "@/lib/tayssa/config";
import { plural } from "@/lib/tayssa/format";
import type { RevealResult } from "@/lib/tayssa/actions/card";
import type { CardStamp } from "@/lib/tayssa/types";
import { ScratchSheet } from "@/components/tayssa/vip/scratch-sheet";

const Lash = (
  <svg viewBox="0 0 24 24" aria-hidden>
    <path d="M3 15c3.4-4.2 6.6-6.3 9-6.3s5.6 2.1 9 6.3" />
    <path d="M6.4 11.6 5 8.6M12 8.9V5.6M17.6 11.6 19 8.6" />
  </svg>
);

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
};

/**
 * O cartão. Uma peça só, do tamanho da mão: as posições da visita,
 * o que falta e — quando há carimbo novo — a folha dourada para raspar.
 */
export function LoyaltyCard({
  cycle,
  size,
  stamps,
  completedCards,
  rewardTitle,
  rewardStatus,
  withLink = false,
}: LoyaltyCardProps) {
  const router = useRouter();
  const [list, setList] = useState<CardStamp[]>(stamps);
  const [openId, setOpenId] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const filled = list.length;
  const unrevealed = list.filter((s) => !s.revealed);
  const missing = Math.max(0, size - filled);
  const open = list.find((s) => s.id === openId) ?? null;

  const onRevealed = (id: string, result: RevealResult | null) => {
    if (!result) return;
    setList((prev) => prev.map((s) => (s.id === id ? { ...s, revealed: true } : s)));
    setTouched(true);
  };

  const close = () => {
    setOpenId(null);
    // pontos, ranking e benefícios mudam junto: recarrega os dados do servidor
    if (touched) {
      setTouched(false);
      router.refresh();
    }
  };

  const next = () => {
    const rest = list.filter((s) => !s.revealed && s.id !== openId);
    setOpenId(rest[0]?.id ?? null);
  };

  return (
    <>
      <div className="tyc">
        <div className="tyc__head">
          <span className="tyc__brand">Tayssa</span>
          <span className="tyc__cycle">Cartão {String(cycle).padStart(2, "0")}</span>
        </div>
        <h2 className="tyc__title">
          {size} visitas, <em>um presente.</em>
        </h2>
        <p className="tyc__sub">
          Cada atendimento confirmado pela Tayssa carimba uma posição.
        </p>

        <div className="tyc__grid">
          {Array.from({ length: size }, (_, i) => {
            const position = i + 1;
            const stamp = list.find((s) => s.position === position);
            if (stamp && !stamp.revealed) {
              return (
                <button
                  key={position}
                  type="button"
                  className="tyc__slot"
                  data-state="new"
                  onClick={() => setOpenId(stamp.id)}
                  aria-label={`Raspar o carimbo ${position}`}
                >
                  <span className="tyc__n">{position}</span>
                </button>
              );
            }
            return (
              <div
                key={position}
                className="tyc__slot"
                data-state={stamp ? "done" : "empty"}
                title={stamp ? `${stamp.serviceName} · +${stamp.points}` : undefined}
              >
                {stamp ? Lash : <span className="tyc__n">{position}</span>}
              </div>
            );
          })}
        </div>

        <div className="tyc__foot">
          <span>
            <strong>{filled}</strong> de {size}
            {completedCards > 0 ? ` · ${completedCards} ${plural(completedCards, "cartão fechado", "cartões fechados")}` : ""}
          </span>
          {withLink ? (
            <Link href={ROUTES.vipCard} className="tyc__link">
              Ver o cartão
            </Link>
          ) : (
            <span>{missing === 0 ? rewardTitle : `faltam ${missing}`}</span>
          )}
        </div>

        {unrevealed.length > 0 ? (
          <span className="tyc__ribbon">
            {unrevealed.length} {plural(unrevealed.length, "carimbo novo", "carimbos novos")} para raspar
          </span>
        ) : missing === 0 ? (
          <span className="tyc__ribbon">
            {rewardStatus === "available" || rewardStatus === "approved"
              ? `${rewardTitle} liberado`
              : `${rewardTitle} em validação`}
          </span>
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
