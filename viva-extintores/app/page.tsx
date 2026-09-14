import { HOME } from "@/lib/institucional";
import { FOTOS } from "@/lib/photos";
import { MENSAGENS, whatsappUrl } from "@/lib/whatsapp";
import { Botao } from "@/components/ui/botao";
import { CTA_PRINCIPAL } from "@/lib/config";
import { HeroPagina } from "@/components/secoes/hero-pagina";
import { AreasGrid } from "@/components/home/areas";
import { Numeros } from "@/components/secoes/numeros";
import { FaixaCta } from "@/components/secoes/faixa-cta";
import { Fecho } from "@/components/secoes/fecho";
import { InstagramFaixa } from "@/components/secoes/instagram";

export default function Page() {
  return (
    <>
      <HeroPagina
        sublinha={HOME.hero.sublinha}
        titulo={HOME.hero.titulo}
        destaque={HOME.hero.destaque}
        texto={HOME.hero.texto}
        aside={HOME.hero.aside}
        foto={FOTOS.site.hero}
      >
        <div className="v-hero__cta">
          <Botao href={whatsappUrl(MENSAGENS.geral)}>{CTA_PRINCIPAL}</Botao>
        </div>
      </HeroPagina>

      <Numeros />

      <AreasGrid titulo={HOME.areas.titulo} texto={HOME.areas.texto} />

      <FaixaCta
        titulo={HOME.faixa.titulo}
        texto={HOME.faixa.texto}
        href={whatsappUrl(MENSAGENS.geral)}
      />

      <InstagramFaixa />
      <Fecho frase={HOME.fecho} />
    </>
  );
}
