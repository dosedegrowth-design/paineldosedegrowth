import type { ReactNode } from "react";
import type { Area } from "@/lib/areas";
import { CTA_PRINCIPAL } from "@/lib/config";
import { whatsappUrl } from "@/lib/whatsapp";
import { Abas } from "@/components/servico/abas";
import { Competencia } from "@/components/servico/competencia";
import { HeroServico } from "@/components/servico/hero";
import { CasosReais } from "@/components/secoes/casos-reais";
import { FaixaCta } from "@/components/secoes/faixa-cta";
import { Fecho } from "@/components/secoes/fecho";

/**
 * Esqueleto comum das cinco páginas de área.
 *
 * Cada página tem a sua personalidade: o que é só dela entra como
 * `children`, entre a competência e o fechamento. O que é igual — hero,
 * barra de áreas, competência, faixa, frase de fecho e a transição para
 * os casos reais — mora aqui.
 */
export function PaginaServico({ area, children }: { area: Area; children?: ReactNode }) {
  return (
    <>
      <HeroServico area={area} />
      <Abas atual={area.slug} />
      <Competencia area={area} />

      {children}

      <FaixaCta
        titulo={area.faixaTitulo}
        texto={area.faixaTexto}
        cta={CTA_PRINCIPAL}
        href={whatsappUrl(area.ctaMensagem)}
      />

      <Fecho frase={area.fraseFecho} />
      <CasosReais />
    </>
  );
}
