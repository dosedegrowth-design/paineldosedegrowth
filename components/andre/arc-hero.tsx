import { ShieldCheck, Zap, Clock } from "lucide-react";
import { ArcGalleryHero } from "@/components/ui/arc-gallery-hero";
import { ANDRE_CONFIG, waLink } from "./config";
import { WhatsAppIcon } from "./whatsapp-icon";
import { SplitText } from "./split-text";
import { Magnetic } from "./magnetic";
import { MistBackground } from "./mist-background";

/* Hero em arco: as fotos de campo e de ambientes climatizados formam um
   semicírculo sobre a headline. As 4 fotos reais da Climafrio ocupam o
   topo do arco (posições centrais); o restante é stock de ambientes. */

const arcImages = [
  {
    src: "/andre/arc/casa-moderna.jpg",
    alt: "Casa moderna climatizada",
  },
  {
    src: "/andre/arc/sala-estar.jpg",
    alt: "Sala de estar com clima agradável",
  },
  {
    src: "/andre/arc/profissional-servico.jpg",
    alt: "Profissional em serviço de manutenção",
  },
  {
    src: "/andre/arc/thumb-ambiente-quarto.jpg",
    alt: "Quarto climatizado com split instalado pela Climafrio",
  },
  {
    src: "/andre/arc/interior-moderno.jpg",
    alt: "Interior moderno e confortável",
  },
  {
    src: "/andre/arc/thumb-tecnico-manutencao.jpg",
    alt: "Técnico Climafrio verificando pressão do sistema",
  },
  {
    src: "/andre/arc/thumb-tecnico-gas.jpg",
    alt: "Recarga de gás com manômetro de precisão",
  },
  {
    src: "/andre/arc/ambiente-residencial.jpg",
    alt: "Ambiente residencial climatizado",
  },
  {
    src: "/andre/arc/thumb-hero-ac.jpg",
    alt: "Ar-condicionado split em ambiente residencial",
  },
  {
    src: "/andre/arc/tecnico-instalacao.jpg",
    alt: "Técnico trabalhando em instalação",
  },
  {
    src: "/andre/arc/escritorio.jpg",
    alt: "Escritório corporativo climatizado",
  },
  {
    src: "/andre/arc/sala-aconchegante.jpg",
    alt: "Sala aconchegante com temperatura ideal",
  },
];

export function ArcHero() {
  return (
    <div id="top" className="relative">
      <MistBackground />

      <ArcGalleryHero
        images={arcImages.map((p) => p.src)}
        alts={arcImages.map((p) => p.alt)}
        radiusLg={430}
        cardSizeLg={110}
        className="min-h-[100svh] pt-24 sm:pt-28 text-white"
        cardClassName="rounded-2xl shadow-[0_18px_40px_-18px_rgba(0,0,0,0.8)] ring-1 ring-white/10 bg-white/[0.04] backdrop-blur-sm"
      >
        <div className="andre-anim-in">
          <span className="inline-flex items-center gap-2.5 rounded-full border border-[var(--andre-border)] bg-white/[0.04] backdrop-blur-md px-4 py-2 font-tech text-[10.5px] uppercase tracking-[0.28em] text-[var(--andre-muted)]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--andre-primary)] opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--andre-primary)]" />
            </span>
            São Paulo · Atendimento 24h
          </span>
        </div>

        <h1 className="andre-display mt-6 text-[2.5rem] sm:text-6xl lg:text-7xl uppercase leading-[0.92] tracking-tighter text-white">
          <SplitText text="O frio certo," delay={0.9} />
          <br />
          <SplitText text="no silêncio certo." delay={1.2} gradient />
        </h1>

        <p className="mt-6 text-base sm:text-lg text-[var(--andre-muted)] max-w-lg mx-auto leading-relaxed">
          Instalação, manutenção e higienização com precisão de engenharia.
          Orçamento em minutos, atendimento em até 24h.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Magnetic>
            <a
              href={waLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="andre-btn-primary inline-flex items-center justify-center gap-2 h-13 px-7 rounded-sm text-[15px]"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Solicitar visita no WhatsApp
            </a>
          </Magnetic>
          <a
            href="#como-funciona"
            className="andre-btn-ghost inline-flex items-center justify-center h-13 px-7 rounded-sm text-[15px]"
          >
            Como funciona
          </a>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5 text-[13px] text-[var(--andre-muted)]">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-[var(--andre-primary)]" />
            90 dias de garantia
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-[var(--andre-primary)]" />
            Resposta em ~5 min
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-[var(--andre-primary)]" />
            {ANDRE_CONFIG.rating} · {ANDRE_CONFIG.clientsServed} clientes
          </span>
        </div>
      </ArcGalleryHero>
    </div>
  );
}
