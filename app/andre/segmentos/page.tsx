import type { Metadata } from "next";
import { PageHeader } from "@/components/andre/page-header";
import { Segmentos } from "@/components/andre/segmentos";
import { Testimonials } from "@/components/andre/testimonials";
import { ContatoBand } from "@/components/andre/home-teasers";

export const metadata: Metadata = {
  title: "Segmentos — Climafrio | Hospitalar, Industrial, Sala Limpa e mais",
  description:
    "Climatização pra hospitais, indústrias, salas limpas, comércio, residências e galpões. Cada ambiente com a engenharia que a operação exige.",
};

export default function SegmentosPage() {
  return (
    <>
      <PageHeader
        n="04"
        kicker="Segmentos"
        crumb="Segmentos"
        title="Onde a climatização"
        highlight="é crítica."
        sub="Hospitais, indústrias, salas limpas, comércio, residências e galpões — seis operações, seis exigências diferentes."
      />
      <Segmentos />
      <Testimonials />
      <ContatoBand />
    </>
  );
}
