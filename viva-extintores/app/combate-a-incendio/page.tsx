import type { Metadata } from "next";
import { area } from "@/lib/areas";
import { PaginaServico } from "@/components/servico/pagina";

const A = area("combate-a-incendio");

export const metadata: Metadata = {
  title: A.seo.titulo,
  description: A.seo.descricao,
};

/** PÁGINA 01 — Sistemas de combate a incêndio (§8). */
export default function Page() {
  return <PaginaServico area={A} />;
}
