import type { Metadata } from "next";
import { Finalizar } from "@/components/palavracomalma/site/finalizar";

export const metadata: Metadata = { title: { absolute: "Finalizar compra · Palavra com Alma" } };

export default function FinalizarPage() {
  return <Finalizar />;
}
