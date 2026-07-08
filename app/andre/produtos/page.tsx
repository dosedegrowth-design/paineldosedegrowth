import type { Metadata } from "next";
import { PageHeader } from "@/components/andre/page-header";
import { Produtos } from "@/components/andre/produtos";
import { Marcas } from "@/components/andre/marcas";
import { ContatoBand } from "@/components/andre/home-teasers";

export const metadata: Metadata = {
  title: "Produtos — Climafrio | Split, VRF, VRV, Self Contained e Chiller",
  description:
    "Oito linhas de equipamentos de climatização: Split, Hi Wall, Multi Split, Multi V, VRF, VRV, Self Contained e Chiller — com as marcas Springer Midea, Elgin, LG, Samsung, Daikin e Carrier.",
};

export default function ProdutosPage() {
  return (
    <>
      <PageHeader
        n="03"
        kicker="Linhas de produto"
        crumb="Produtos"
        title="Equipamentos pra cada"
        highlight="porte de projeto."
        sub="Oito linhas de produto e seis marcas homologadas — a Climafrio especifica o equipamento certo pra cada ambiente."
      />
      <Produtos />
      <Marcas />
      <ContatoBand />
    </>
  );
}
