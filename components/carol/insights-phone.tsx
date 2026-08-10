"use client";

import { ChevronDown, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { CountUp } from "./count-up";
import { METRICAS } from "./site-data";

/* Print do Instagram Insights da Carol dentro de um iPhone — mesma UI do
   app, com os números REAIS (10/ago/2026) subindo em animação, do jeito
   que ela pediu no áudio. */
export function InsightsPhone({ className }: { className?: string }) {
  const destaque = METRICAS[0]; // visualizações
  const linhas = [
    METRICAS[1], // contas alcançadas
    METRICAS[2], // interações
    METRICAS[5], // visitas ao perfil
    METRICAS[3], // novos seguidores
  ];

  return (
    <div className={cn("carol-phone w-[264px] md:w-[286px]", className)}>
      {/* bg inline: .carol-phone-screen tem background fora de @layer,
          que venceria a utility bg-[...] do Tailwind */}
      <div
        className="carol-phone-screen aspect-[9/19] w-full text-[#1c1c1c]"
        style={{ background: "#fafafa" }}
      >
        {/* Header do app */}
        <div className="flex items-center justify-between px-4 pb-3 pt-12">
          <ChevronLeft className="h-5 w-5" />
          <span className="text-[14px] font-bold">Insights</span>
          <span className="w-5" />
        </div>
        <div className="mx-4 flex items-center justify-between rounded-lg bg-black/[0.05] px-3 py-2">
          <span className="text-[12px] font-semibold">Últimos 30 dias</span>
          <ChevronDown className="h-4 w-4 opacity-60" />
        </div>

        {/* Destaque — visualizações */}
        <div className="px-4 pt-5">
          <p className="text-[12px] font-semibold text-black/55">
            Visualizações
          </p>
          <p className="mt-1 text-[34px] font-bold leading-none tracking-tight">
            <CountUp value={destaque.valor} />
          </p>
          <p className="mt-1.5 text-[11px] text-black/55">{destaque.detalhe}</p>

          {/* barra seguidores × não seguidores */}
          <div className="mt-3 flex h-1.5 overflow-hidden rounded-full">
            <span className="w-[96.2%] bg-[var(--carol-accent)]" />
            <span className="w-[3.8%] bg-[var(--carol-accent-light)]" />
          </div>
          <div className="mt-1.5 flex justify-between text-[10px] text-black/50">
            <span>96,2% não seguidores</span>
            <span>3,8% seguidores</span>
          </div>
        </div>

        {/* Linhas de métricas */}
        <div className="mt-4 border-t border-black/10 px-4">
          {linhas.map((m) => (
            <div
              key={m.rotulo}
              className="flex items-baseline justify-between border-b border-black/[0.06] py-3"
            >
              <span className="block text-[12px] text-black/70 first-letter:uppercase">
                {m.rotulo}
              </span>
              <span className="text-[15px] font-bold tracking-tight">
                <CountUp value={m.valor} />
              </span>
            </div>
          ))}
          <div className="flex items-baseline justify-between py-3">
            <span className="text-[12px] text-black/70">Cliques no link</span>
            <span className="text-[15px] font-bold tracking-tight">
              <CountUp value="476" />
            </span>
          </div>
        </div>

        <p className="px-4 pt-1 text-[9.5px] text-black/40">
          Dados reais do Instagram Insights · 10/ago/2026
        </p>
      </div>
    </div>
  );
}
