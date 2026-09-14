import type { Metadata } from "next";
import { CLIENTES_PAGINA } from "@/lib/institucional";
import { FOTOS } from "@/lib/photos";
import { MENSAGENS, whatsappUrl } from "@/lib/whatsapp";
import { MARCA } from "@/lib/config";
import { HeroPagina } from "@/components/secoes/hero-pagina";
import { ProvaGoogle } from "@/components/secoes/google";
import { FaixaCta } from "@/components/secoes/faixa-cta";
import { Fecho } from "@/components/secoes/fecho";

export const metadata: Metadata = {
  title: "Clientes",
  description:
    "Condomínios, comércios, indústrias e empresas atendidas pela VIVA Extintores, do diagnóstico à aprovação no Corpo de Bombeiros.",
};

export default function Page() {
  return (
    <>
      <HeroPagina
        sublinha={CLIENTES_PAGINA.hero.sublinha}
        titulo={CLIENTES_PAGINA.hero.titulo}
        texto={CLIENTES_PAGINA.hero.texto}
        aside={CLIENTES_PAGINA.hero.aside}
        foto={FOTOS.site.equipe}
      />

      <ProvaGoogle />

      <FaixaCta
        titulo={["Segurança, regularização", "e valorização para o seu imóvel."]}
        texto="Conte com a nossa equipe e garanta a aprovação com agilidade e segurança."
        href={whatsappUrl(MENSAGENS.geral)}
      />
      <Fecho frase={MARCA.frase} />
    </>
  );
}
