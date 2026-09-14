import type { Metadata } from "next";
import { area } from "@/lib/areas";
import { PaginaServico } from "@/components/servico/pagina";

const A = area("spda-para-raios");

export const metadata: Metadata = {
  title: A.seo.titulo,
  description: A.seo.descricao,
};

/** PÁGINA 03 — SPDA / para-raios (§10). */
export default function Page() {
  return <PaginaServico area={A} />;
}
