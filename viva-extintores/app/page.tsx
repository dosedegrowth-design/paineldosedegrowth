import { FAIXA } from "@/lib/home";
import { MENSAGENS, whatsappUrl } from "@/lib/whatsapp";
import { HeroHome } from "@/components/home/hero";
import { AreasGrid } from "@/components/home/areas";
import { Sobre } from "@/components/home/sobre";
import { FaixaCta } from "@/components/secoes/faixa-cta";
import { ProvaGoogle } from "@/components/secoes/google";
import { InstagramFaixa } from "@/components/secoes/instagram";

/**
 * PÁGINA 0 — Portfólio. A porta de entrada (§4, §25).
 *
 * Fluxo do §22: entende o que é a VIVA, vê as cinco especialidades,
 * clica numa delas. Aqui não se resume nem se repete o conteúdo das
 * cinco páginas — esta é o índice.
 */
export default function Page() {
  return (
    <>
      <HeroHome />
      <AreasGrid />

      <FaixaCta
        titulo={FAIXA.titulo}
        texto={FAIXA.texto}
        cta={FAIXA.cta}
        href={whatsappUrl(MENSAGENS.geral)}
      />

      <Sobre />
      <ProvaGoogle />
      <InstagramFaixa />
    </>
  );
}
