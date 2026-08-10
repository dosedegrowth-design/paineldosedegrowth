"use client";

import {
  Bookmark,
  Camera,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Music,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { IG_HANDLE, type REELS } from "./site-data";

interface IgReelPhoneProps {
  reel: (typeof REELS)[number];
  className?: string;
}

/* Mockup de iPhone com a UI de Reels do Instagram — print animado do
   conteúdo real da Carol. Sem contadores inventados: os ícones ficam
   limpos e os números reais moram na seção de Insights. Clique abre o
   Reel de verdade no Instagram. */
export function IgReelPhone({ reel, className }: IgReelPhoneProps) {
  return (
    <a
      href={reel.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Assistir Reel de ${reel.categoria} no Instagram`}
      className={cn(
        "carol-phone block w-[228px] shrink-0 transition-transform duration-500 hover:!rotate-0 hover:scale-[1.04] md:w-[248px]",
        className
      )}
    >
      <div className="carol-phone-screen aspect-[9/19] w-full">
        {/* Mídia: vídeo real quando a Carol mandar o arquivo; capa com
            zoom lento enquanto isso */}
        {reel.video ? (
          <video
            src={reel.video}
            poster={reel.img}
            autoPlay
            loop
            muted
            playsInline
            ref={(el) => {
              if (el) el.muted = true;
            }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <img
            src={reel.img}
            alt=""
            loading="lazy"
            decoding="async"
            className="carol-kenburns absolute inset-0 h-full w-full object-cover"
          />
        )}

        {/* Gradientes de legibilidade da UI */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/55 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />

        {/* Chrome superior — Reels */}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-11">
          <span className="text-[15px] font-bold tracking-tight text-white">
            Reels
          </span>
          <Camera className="h-5 w-5 text-white" strokeWidth={2.2} />
        </div>

        {/* Rail de ações à direita */}
        <div className="absolute bottom-20 right-3 flex flex-col items-center gap-4 text-white">
          <Heart className="h-6 w-6" strokeWidth={2.1} />
          <MessageCircle className="h-6 w-6 -scale-x-100" strokeWidth={2.1} />
          <Send className="h-6 w-6" strokeWidth={2.1} />
          <Bookmark className="h-6 w-6" strokeWidth={2.1} />
          <MoreHorizontal className="h-5 w-5" strokeWidth={2.2} />
        </div>

        {/* Autora + legenda + áudio */}
        <div className="absolute inset-x-0 bottom-0 px-4 pb-5 pr-14 text-white">
          <div className="flex items-center gap-2">
            <img
              src="/carol/sobre.webp"
              alt=""
              loading="lazy"
              className="h-7 w-7 rounded-full border border-white/70 object-cover"
            />
            <span className="text-[12px] font-bold">{IG_HANDLE}</span>
            <span className="rounded-md border border-white/60 px-2 py-0.5 text-[10px] font-semibold">
              Seguir
            </span>
          </div>
          <p className="mt-2 truncate text-[11.5px] text-white/90">
            <span className="font-semibold">{reel.categoria}</span> ·{" "}
            {reel.descricao}
          </p>
          <p className="mt-1.5 flex items-center gap-1.5 text-[10.5px] text-white/80">
            <Music className="h-3 w-3" />
            áudio original — {IG_HANDLE}
          </p>
        </div>

        {/* Barra de progresso do "vídeo" */}
        <div className="absolute inset-x-0 bottom-0 h-[3px] bg-white/20">
          <div className="carol-reel-progress h-full w-full bg-white/85" />
        </div>
      </div>
    </a>
  );
}
