"use client";

/* Mockup do "painel de atendimentos" do André — espelho do estilo
   SmartRoute: janela de app com pipeline de pedidos em colunas. */

import { motion, useReducedMotion } from "framer-motion";
import { Snowflake, Clock, CheckCircle2, MapPin } from "lucide-react";
import { WhatsAppIcon } from "./whatsapp-icon";

const columns = [
  {
    title: "Novo pedido",
    dot: "#0ea5e9",
    cards: [
      { txt: "Split 12k não gela", tag: "Perdizes", time: "há 2 min", hot: true },
      { txt: "Higienização anual", tag: "Moema", time: "há 9 min" },
    ],
  },
  {
    title: "Agendado",
    dot: "#f59e0b",
    cards: [
      { txt: "Instalação 18k BTU", tag: "Osasco", time: "hoje 14h" },
      { txt: "Recarga R-410A", tag: "Santo André", time: "amanhã 9h" },
    ],
  },
  {
    title: "Concluído",
    dot: "#22c55e",
    cards: [{ txt: "Troca de placa", tag: "Alphaville", time: "✓ garantia 90d" }],
  },
];

export function HeroMockup() {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 28, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full rounded-2xl bg-white ring-1 ring-slate-200 shadow-[0_24px_60px_-20px_rgba(2,132,199,0.25)] overflow-hidden"
    >
      {/* barra da janela */}
      <div className="flex items-center gap-2 px-4 h-10 border-b border-slate-100 bg-slate-50/80">
        <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-300" />
        <div className="ml-3 flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
          <Snowflake className="h-3.5 w-3.5 text-sky-500" />
          Painel do André · Atendimentos ao vivo
        </div>
        <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold text-green-600">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
          ONLINE
        </span>
      </div>

      {/* pipeline */}
      <div className="grid grid-cols-3 gap-2.5 p-3 sm:p-4 bg-gradient-to-b from-white to-sky-50/40">
        {columns.map((col, ci) => (
          <div key={col.title} className="min-w-0">
            <div className="flex items-center gap-1.5 px-1 mb-2">
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ background: col.dot }}
              />
              <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wide truncate">
                {col.title}
              </p>
            </div>
            <div className="space-y-2">
              {col.cards.map((c, i) => (
                <motion.div
                  key={c.txt}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 + ci * 0.18 + i * 0.12, duration: 0.5 }}
                  className={`rounded-xl border bg-white p-2.5 shadow-sm ${
                    c.hot ? "border-sky-300 ring-2 ring-sky-100" : "border-slate-200"
                  }`}
                >
                  <p className="text-[11px] sm:text-[12px] font-bold text-slate-800 leading-snug">
                    {c.txt}
                  </p>
                  <div className="mt-1.5 flex items-center justify-between gap-1">
                    <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-semibold text-sky-700 bg-sky-50 border border-sky-100 rounded-full px-1.5 py-0.5 truncate">
                      <MapPin className="h-2.5 w-2.5 shrink-0" />
                      {c.tag}
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium whitespace-nowrap">
                      {c.time}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* notificação WhatsApp entrando */}
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="absolute bottom-3 right-3 flex items-center gap-2 rounded-xl bg-white border border-green-200 shadow-lg px-3 py-2"
      >
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-green-500">
          <WhatsAppIcon className="h-4 w-4 text-white" />
        </span>
        <div className="leading-tight">
          <p className="text-[10px] font-bold text-slate-800">Novo orçamento</p>
          <p className="text-[9px] text-slate-500">respondido em 4 min</p>
        </div>
        <CheckCircle2 className="h-4 w-4 text-green-500" />
      </motion.div>

      {/* selo de resposta */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 bg-white">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
          <Clock className="h-3 w-3 text-sky-500" />
          Tempo médio de resposta: 5 min
        </span>
        <span className="text-[10px] font-bold text-sky-600">
          hoje: 7 atendimentos
        </span>
      </div>
    </motion.div>
  );
}
