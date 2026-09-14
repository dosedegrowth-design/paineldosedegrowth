import type { Metadata } from "next";
import { area } from "@/lib/areas";
import { PaginaServico } from "@/components/servico/pagina";
import { BlocoRelatorio } from "@/components/servico/relatorio";

const A = area("relatorio-tecno-fotografico");

export const metadata: Metadata = {
  title: A.seo.titulo,
  description: A.seo.descricao,
};

/** PÁGINA 05 — Relatório Tecno-Fotográfico + manutenção (§12, §14). */
export default function Page() {
  return (
    <PaginaServico area={A}>
      <BlocoRelatorio />
    </PaginaServico>
  );
}
