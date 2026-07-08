import type { Metadata } from "next";
import { PageHeader } from "@/components/andre/page-header";
import { Services } from "@/components/andre/services";
import { HowItWorks } from "@/components/andre/how-it-works";
import { ContatoBand } from "@/components/andre/home-teasers";

export const metadata: Metadata = {
  title: "Soluções — Climafrio | Projetos, Instalação e Manutenção",
  description:
    "Projetos de climatização, instalação, manutenção preventiva e corretiva, higienização, recarga e reparo. O ciclo completo do sistema, da especificação ao pós-obra.",
};

export default function SolucoesPage() {
  return (
    <>
      <PageHeader
        n="02"
        kicker="Soluções"
        crumb="Soluções"
        title="Soluções que acompanham"
        highlight="toda a vida útil."
        sub="Projeto, instalação, manutenção, higienização, recarga e reparo — um único responsável técnico do início ao fim."
      />
      <Services />
      <HowItWorks />
      <ContatoBand />
    </>
  );
}
