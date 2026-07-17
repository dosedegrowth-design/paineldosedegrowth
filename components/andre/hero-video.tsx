"use client";

import Link from "next/link";
import { Phone } from "lucide-react";
import { VideoHero, VideoHeroReveal } from "@/components/ui/video-hero";
import { ANDRE_CONFIG, waLink } from "./config";
import { WhatsAppIcon } from "./whatsapp-icon";
import { useMotionFX } from "./use-desktop-fx";

/* Hero cinematográfico da home: vídeo real de equipe HVAC em campo
   (mesma série visual das fotos dos cards), conteúdo institucional
   ancorado na base sobre fade pro fundo escuro da marca. */

const tags = [
  { label: "Hospitalar", href: "/andre/segmentos/hospitalar" },
  { label: "Industrial", href: "/andre/segmentos/industrial" },
  { label: "Residencial", href: "/andre/segmentos/residencial" },
];

export function HeroVideo() {
  const { ok, lite } = useMotionFX();
  /* mobile recebe o recorte VERTICAL do mesmo vídeo (enquadrado no
     técnico com o manifold); desktop usa o horizontal com a ação
     puxada pra baixo do quadro */
  const base = lite ? "/andre/hero-video-mobile" : "/andre/hero-video";

  return (
    <div id="top">
      <VideoHero
        videoSrc={`${base}.mp4`}
        videoSrcWebm={`${base}.webm`}
        poster={`${base}-poster.jpg`}
        playVideo={ok}
        objectPosition={lite ? "50% 85%" : "66% 92%"}
        overlay={
          <>
            {/* tinta fria da marca + legibilidade */}
            <div className="absolute inset-0 bg-[#071018]/45" />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, var(--andre-bg) 0%, rgba(6,10,20,0.72) 32%, rgba(6,10,20,0.12) 62%, rgba(6,10,20,0.35) 100%)",
              }}
            />
          </>
        }
        footerClassName="px-5 lg:px-8 pb-20 lg:pb-16 pt-10"
      >
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
          <div className="text-center lg:text-left">
            <VideoHeroReveal delay={0.6}>
              <p className="flex items-center justify-center lg:justify-start gap-2.5 text-[13px] text-slate-300">
                <span className="inline-block h-2 w-2 rounded-full bg-[var(--andre-primary)]" />
                Soluções em climatização · desde 1985 · São Paulo
              </p>
            </VideoHeroReveal>

            <VideoHeroReveal delay={0.8}>
              <h1
                className="mt-4 font-light text-white tracking-[-0.03em] leading-[1]"
                style={{ fontSize: "clamp(2.2rem, 7vw, 4.5rem)" }}
              >
                Melhore o ar
                <br />
                <span className="andre-gradient-text font-normal">
                  que você respira.
                </span>
              </h1>
            </VideoHeroReveal>

            <VideoHeroReveal delay={1.0}>
              <div className="mt-7 flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3">
                <a
                  href={waLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-magnetic
                  className="andre-btn-primary inline-flex items-center gap-2 h-12 px-7 rounded-full text-[14px]"
                >
                  <WhatsAppIcon className="h-4.5 w-4.5" />
                  Orçamento no WhatsApp
                </a>
                <Link
                  href="/andre/empresa"
                  className="inline-flex items-center gap-2 h-12 px-7 rounded-full border border-white/30 text-[14px] font-semibold text-white hover:bg-white/10 hover:border-white/50 transition-colors"
                >
                  Conheça a Climafrio
                </Link>
              </div>
            </VideoHeroReveal>

            <VideoHeroReveal delay={1.15}>
              <p className="mt-5 inline-flex items-center gap-2 font-tech text-[10px] uppercase tracking-[0.24em] text-slate-400">
                <Phone className="h-3.5 w-3.5 text-[var(--andre-primary)]" />
                {ANDRE_CONFIG.phone} · {ANDRE_CONFIG.phone0800} nacional
              </p>
            </VideoHeroReveal>
          </div>

          <VideoHeroReveal
            delay={1.1}
            className="flex flex-wrap justify-center lg:justify-end gap-2"
          >
            {tags.map((t) => (
              <Link
                key={t.label}
                href={t.href}
                className="rounded-full border border-white/[0.18] bg-white/[0.06] backdrop-blur-sm px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-200 hover:border-cyan-400/50 hover:text-white transition-colors"
              >
                {t.label}
              </Link>
            ))}
          </VideoHeroReveal>
        </div>
      </VideoHero>
    </div>
  );
}
