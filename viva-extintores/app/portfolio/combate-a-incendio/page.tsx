import type { Metadata } from "next";
import { area } from "@/lib/areas";
import { PaginaServico } from "@/components/servico/pagina";

const A = area("combate-a-incendio");

export const metadata: Metadata = {
  title: A.seo.titulo,
  description: A.seo.descricao,
};

export default function Page() {
  return <PaginaServico area={A}></PaginaServico>;
}
