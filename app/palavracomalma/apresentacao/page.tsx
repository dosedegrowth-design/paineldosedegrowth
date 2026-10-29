import type { Metadata } from "next";
import { Apresentacao } from "@/components/palavracomalma/apresentacao";
import "./apresentacao.css";

export const metadata: Metadata = {
  title: { absolute: "Palavra com Alma · Proposta de evolução da loja virtual" },
  description: "Apresentação do projeto da nova loja virtual da Palavra com Alma.",
  robots: { index: false, follow: false },
};

export default function ApresentacaoPage() {
  return <Apresentacao />;
}
