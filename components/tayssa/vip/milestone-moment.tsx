"use client";

import { useCallback, useSyncExternalStore } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ROUTES } from "@/lib/tayssa/config";

export type Moment = {
  /** muda quando o status muda: o mesmo benefício pode ter dois momentos (alcançado, liberado) */
  id: string;
  kind: "reached" | "released";
  title: string;
};

/** Dispensado fica só neste aparelho (conveniência da leitora, não dado do sistema). */
function useDismissed(key: string): [boolean, () => void] {
  const subscribe = useCallback((cb: () => void) => {
    window.addEventListener("storage", cb);
    return () => window.removeEventListener("storage", cb);
  }, []);
  const read = useCallback(() => {
    try {
      return window.localStorage.getItem(key) === "1";
    } catch {
      return false;
    }
  }, [key]);
  const dismissed = useSyncExternalStore(subscribe, read, () => false);
  const dismiss = useCallback(() => {
    try {
      window.localStorage.setItem(key, "1");
    } catch {
      /* sem armazenamento: o aviso volta na próxima visita, sem drama */
    }
    window.dispatchEvent(new Event("storage"));
  }, [key]);
  return [dismissed, dismiss];
}

/**
 * O momento do marco. Aparece na casa da cliente quando algo novo
 * aconteceu com um benefício dela nas últimas horas — alcançado (a
 * Tayssa valida) ou liberado (já é dela). Nunca concede nada: só conta.
 */
export function MilestoneMoment({ moment }: { moment: Moment }) {
  const [dismissed, dismiss] = useDismissed(`tayssa:moment:${moment.id}`);
  const reduced = useReducedMotion();
  if (dismissed) return null;
  const reached = moment.kind === "reached";
  return (
    <motion.aside
      className="tyv-moment"
      data-kind={moment.kind}
      initial={reduced ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
    >
      <span className="tyv-moment__line" aria-hidden />
      <div className="tyv-moment__body">
        <span className="tyv-label">{reached ? "Marco alcançado" : "Benefício liberado"}</span>
        <p className="tyv-moment__title">{moment.title}</p>
        <p className="tyv-sub" style={{ fontSize: 13.5 }}>
          {reached ? "A Tayssa valida e ele aparece em Benefícios." : "Já está em Benefícios — combine com a Tayssa quando quiser."}
        </p>
        <Link href={ROUTES.vipBenefits} className="tyv-link">
          Ver benefícios
        </Link>
      </div>
      <button type="button" className="tyv-moment__close" onClick={dismiss} aria-label="Fechar aviso">
        ×
      </button>
    </motion.aside>
  );
}
