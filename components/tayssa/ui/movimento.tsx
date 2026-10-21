"use client";

import { MotionConfig } from "framer-motion";

/**
 * "Reduzir movimento" do aparelho vale para todo o framer-motion do Tayssa
 * (o padrão dele é ignorar a preferência): menu do celular, peças
 * magnéticas, entradas. As animações que já tratam o caso continuam iguais.
 */
export function MovimentoDoAparelho({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
