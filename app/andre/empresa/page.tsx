import type { Metadata } from "next";
import { PageHeader } from "@/components/andre/page-header";
import { Empresa } from "@/components/andre/empresa";
import { Manifesto } from "@/components/andre/manifesto";
import { StatsBand } from "@/components/andre/stats-band";
import { FieldGallery } from "@/components/andre/field-gallery";
import { ContatoBand } from "@/components/andre/home-teasers";

export const metadata: Metadata = {
  title: "A Empresa — Climafrio | Soluções em Climatização desde 1985",
  description:
    "Desde 1985 desenvolvendo soluções de climatização pra indústrias, hotéis, hospitais, comércio e residências em São Paulo. Conheça a missão, visão e valores da Climafrio.",
};

export default function EmpresaPage() {
  return (
    <>
      <PageHeader
        n="01"
        kicker="A empresa"
        crumb="Empresa"
        title="Climafrio,"
        highlight="desde 1985."
        sub="A engenharia por trás do conforto: projetos, instalação e manutenção de sistemas de climatização em São Paulo há quatro décadas."
      />
      <Empresa />
      <Manifesto />
      <StatsBand />
      <FieldGallery />
      <ContatoBand />
    </>
  );
}
