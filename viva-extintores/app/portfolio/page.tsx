import type { Metadata } from "next";
import { MARCA } from "@/lib/config";
import { FOTOS } from "@/lib/photos";
import { MENSAGENS, whatsappUrl } from "@/lib/whatsapp";
import { HeroPagina } from "@/components/secoes/hero-pagina";
import { Abas } from "@/components/servico/abas";
import { AreasGrid } from "@/components/home/areas";
import { Numeros } from "@/components/secoes/numeros";
import { FaixaCta } from "@/components/secoes/faixa-cta";
import { Fecho } from "@/components/secoes/fecho";

export const metadata: Metadata = {
  title: "Portfólio",
  description:
    "As cinco áreas de atuação da VIVA Extintores em obras reais: combate a incêndio, alarme e detecção, SPDA, laudos/CLCB/AVCB e Relatório Tecno-Fotográfico.",
};

/**
 * A página-mãe do portfólio: o índice das cinco áreas.
 *
 * Não resume o conteúdo delas — apresenta e manda para a página completa.
 */
export default function Page() {
  return (
    <>
      <HeroPagina
        sublinha="Portfólio"
        titulo={["Obras reais.", "Resultados"]}
        destaque="concretos."
        texto="Conheça alguns dos nossos projetos e instalações em prevenção e combate a incêndio, em edificações residenciais, comerciais e industriais."
        aside={["Segurança é", "infraestrutura", "que funciona."]}
        foto={FOTOS.site.portfolio}
      />
      <Abas />

      <AreasGrid
        titulo="Cinco frentes | um responsável só"
        texto="Escolha o serviço e conheça nossos projetos, resultados e casos reais."
      />

      <Numeros />

      <FaixaCta
        titulo={["Seu projeto com", "a equipe certa."]}
        texto="Fale com nossos especialistas e receba um orçamento sob medida para a sua necessidade."
        href={whatsappUrl(MENSAGENS.geral)}
      />

      <Fecho frase={MARCA.frase} />
    </>
  );
}
