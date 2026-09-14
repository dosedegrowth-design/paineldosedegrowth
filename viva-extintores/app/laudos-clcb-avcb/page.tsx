import type { Metadata } from "next";
import { area } from "@/lib/areas";
import { PaginaServico } from "@/components/servico/pagina";
import { BlocoDocumentos } from "@/components/servico/documentos";

const A = area("laudos-clcb-avcb");

export const metadata: Metadata = {
  title: A.seo.titulo,
  description: A.seo.descricao,
};

/** PÁGINA 04 — Laudos, CLCB e AVCB (§11). */
export default function Page() {
  return (
    <PaginaServico area={A}>
      <BlocoDocumentos />
    </PaginaServico>
  );
}
