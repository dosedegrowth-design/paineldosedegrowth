import type { ReactNode } from "react";
import type { Area } from "@/lib/areas";
import { whatsappUrl } from "@/lib/whatsapp";
import { Abas } from "@/components/servico/abas";
import { Competencia } from "@/components/servico/competencia";
import { HeroServico } from "@/components/servico/hero";
import { CasosReais } from "@/components/secoes/casos-reais";
import { FaixaCta } from "@/components/secoes/faixa-cta";
import { Numeros } from "@/components/secoes/numeros";
import { ProvaGoogle } from "@/components/secoes/google";

/**
 * Esqueleto comum das cinco páginas de área.
 *
 * §7 do briefing: as páginas já foram aprovadas e cada uma tem a sua
 * personalidade. O que é igual (abertura, barra de áreas, competência,
 * números, faixa e casos reais) mora aqui; o que é só daquela página
 * entra como `children`, entre a competência e o fechamento.
 */
export function PaginaServico({ area, children }: { area: Area; children?: ReactNode }) {
  return (
    <>
      <HeroServico area={area} />
      <Abas atual={area.slug} />
      <Competencia area={area} />

      {children}

      <div className="v-wrap">
        <Numeros />
      </div>

      <ProvaGoogle />

      <FaixaCta
        titulo={area.faixaTitulo}
        texto={area.faixaTexto}
        cta={area.faixaCta}
        href={whatsappUrl(area.ctaMensagem)}
      />

      <CasosReais area={area.slug} frase={area.fraseFecho} />
    </>
  );
}
