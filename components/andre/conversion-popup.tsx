"use client";

import { useEffect, useState, type FormEvent } from "react";
import { X, Sparkles } from "lucide-react";
import { waLink } from "./config";
import { WhatsAppIcon } from "./whatsapp-icon";

const STORAGE_KEY = "andre_popup_seen_v1";
const DELAY_MS = 15_000;

export function ConversionPopup() {
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [servico, setServico] = useState("Instalação");
  const [endereco, setEndereco] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    const t = window.setTimeout(() => {
      setOpen(true);
      sessionStorage.setItem(STORAGE_KEY, "1");
    }, DELAY_MS);

    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const msg = [
      `Olá, André! Vim pelo site e quero um orçamento.`,
      nome && `Nome: ${nome}`,
      `Serviço: ${servico}`,
      endereco && `Bairro/Cidade: ${endereco}`,
    ]
      .filter(Boolean)
      .join("\n");
    window.open(waLink(msg), "_blank", "noopener,noreferrer");
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="andre-popup-title"
    >
      <button
        aria-label="Fechar"
        onClick={() => setOpen(false)}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />
      <div
        className="relative w-full max-w-md rounded-2xl overflow-hidden andre-anim-in"
        style={{
          background:
            "linear-gradient(180deg, rgba(14,23,42,0.98), rgba(10,17,32,0.98))",
          border: "1px solid rgba(56,189,248,0.25)",
          boxShadow: "0 30px 80px -20px rgba(0,0,0,0.6)",
        }}
      >
        <div
          className="absolute inset-x-0 top-0 h-32 pointer-events-none"
          style={{
            background:
              "radial-gradient(30rem 12rem at 50% 0%, rgba(56,189,248,0.25), transparent 70%)",
          }}
        />

        <button
          onClick={() => setOpen(false)}
          aria-label="Fechar popup"
          className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full inline-flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative p-6 sm:p-7">
          <div className="flex items-center gap-2 mb-4">
            <span
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg"
              style={{
                background: "rgba(56,189,248,0.12)",
                border: "1px solid rgba(56,189,248,0.3)",
              }}
            >
              <Sparkles className="h-4 w-4" style={{ color: "#7dd3fc" }} />
            </span>
            <span className="andre-chip">Oferta rápida</span>
          </div>

          <h3
            id="andre-popup-title"
            className="text-xl sm:text-2xl font-black text-white leading-tight tracking-tight"
          >
            Manda seus dados,{" "}
            <span className="andre-gradient-text">
              orçamento em 5 minutos.
            </span>
          </h3>
          <p className="mt-2 text-sm text-slate-400 leading-relaxed">
            Preencha 3 campos e o André te chama direto no WhatsApp com preço
            fechado.
          </p>

          <form className="mt-5 space-y-3" onSubmit={onSubmit}>
            <div>
              <label className="text-[11px] uppercase tracking-widest text-slate-500 font-semibold">
                Seu nome
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                placeholder="Como te chamamos?"
                className="mt-1 w-full h-11 rounded-lg px-3 text-sm text-white placeholder:text-slate-500 focus:outline-none transition-colors"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              />
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-widest text-slate-500 font-semibold">
                Serviço
              </label>
              <select
                value={servico}
                onChange={(e) => setServico(e.target.value)}
                className="mt-1 w-full h-11 rounded-lg px-3 text-sm text-white focus:outline-none"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <option>Instalação</option>
                <option>Manutenção preventiva</option>
                <option>Higienização</option>
                <option>Recarga de gás</option>
                <option>Reparo / conserto</option>
                <option>Desinstalação / mudança</option>
                <option>Não sei ainda</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-widest text-slate-500 font-semibold">
                Bairro ou cidade
              </label>
              <input
                type="text"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                placeholder="Ex: Perdizes, Santo André"
                className="mt-1 w-full h-11 rounded-lg px-3 text-sm text-white placeholder:text-slate-500 focus:outline-none transition-colors"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              />
            </div>

            <button
              type="submit"
              className="andre-btn-primary w-full h-12 rounded-lg inline-flex items-center justify-center gap-2 text-[15px] mt-2"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Chamar André no WhatsApp
            </button>

            <p className="text-[11px] text-slate-500 text-center pt-1">
              Sem cadastro. Vai direto pra conversa.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
