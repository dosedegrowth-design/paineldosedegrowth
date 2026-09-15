import { HOME } from "@/lib/institucional";
import { FOTOS } from "@/lib/photos";
import { MENSAGENS, whatsappUrl } from "@/lib/whatsapp";
import { Botao } from "@/components/ui/botao";
import { HeroPagina } from "@/components/secoes/hero-pagina";
import { Frentes } from "@/components/home/frentes";
import { Processo } from "@/components/secoes/processo";
import { Numeros } from "@/components/secoes/numeros";
import { FaixaCta } from "@/components/secoes/faixa-cta";
import { Fecho } from "@/components/secoes/fecho";
import { InstagramFaixa } from "@/components/secoes/instagram";

export default function Page() {
  return (
    <>
      <HeroPagina
        sublinha={HOME.hero.eyebrow}
        titulo={HOME.hero.titulo}
        texto={HOME.hero.texto}
        aside={HOME.hero.aside}
        foto={FOTOS.site.hero}
        grande
      >
        <div className="v-hero__cta">
          <Botao href={whatsappUrl(MENSAGENS.geral)}>{HOME.hero.cta}</Botao>
        </div>
      </HeroPagina>

      <Frentes titulo={HOME.areas.titulo} texto={HOME.areas.texto} />

      <Numeros />

      <Processo />

      <FaixaCta
        titulo={HOME.faixa.titulo}
        texto={HOME.faixa.texto}
        itens={HOME.faixa.itens}
        cta={HOME.faixa.cta}
        href={whatsappUrl(MENSAGENS.geral)}
      />

      <InstagramFaixa />
      <Fecho frase={HOME.fecho} />
    </>
  );
}
