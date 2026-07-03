"use client";

import { useEffect, useState, type FormEvent } from "react";
import { X, Sparkles } from "lucide-react";
import { waLink } from "./config";
import { WhatsAppIcon } from "./whatsapp-icon";

const STORAGE_KEY = "andre_popup_seen_v1";
const DELAY_MS = 15_000;

const services = [
  "Instalação",
  "Manutenção preventiva",
  "Higienização",
  "Recarga de gás",
  "Reparo / conserto",
  "Desinstalação / mudança",
  "Não sei ainda",
];

export function ConversionPopup() {
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [servico, setServico] = useState(services[0]);
  const [endereco, setEndereco] = useState("");

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    const t = setTimeout(() => {
      setOpen(true);
      sessionStorage.setItem(STORAGE_KEY, "1");
    }, DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const lines = ["Olá, André! Vim pelo site e quero um orçamento."];
    if (nome) lines.push(`Nome: ${nome}`);
    lines.push(`Serviço: ${servico}`);
    if (endereco) lines.push(`Bairro/Cidade: ${endereco}`);
    window.open(waLink(lines.join("\n")), "_blank", "noopener,noreferrer");
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="popup-title"
    >
      <div
        className="absolute inset-0 bg-slate-900/50"
        style={{ backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}
        onClick={() => setOpen(false)}
      />

      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden andre-anim-in">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-sky-500 via-cyan-400 to-sky-500" />
        <button
          type="button"
          aria-label="Fechar"
          onClick={() => setOpen(false)}
          className="absolute top-3 right-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6 sm:p-7">
          <span className="andre-chip">
            <Sparkles className="h-3.5 w-3.5" />
            Orçamento rápido
          </span>
          <h3
            id="popup-title"
            className="mt-4 text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-tight"
          >
            Responde 3 campos,{" "}
            <span className="andre-gradient-text">orçamento em 5 min</span>.
          </h3>
          <p className="mt-2 text-sm text-slate-500 leading-relaxed">
            O André te chama direto no WhatsApp com preço fechado.
          </p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
            <div>
              <label className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                Seu nome
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                placeholder="Como te chamamos?"
                className="mt-1 w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                Serviço
              </label>
              <select
                value={servico}
                onChange={(e) => setServico(e.target.value)}
                className="mt-1 w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none transition-colors"
              >
                {services.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                Bairro ou cidade
              </label>
              <input
                type="text"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                placeholder="Ex: Perdizes, Santo André"
                className="mt-1 w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none transition-colors"
              />
            </div>
            <button
              type="submit"
              className="andre-btn-primary w-full h-12 rounded-xl inline-flex items-center justify-center gap-2 text-[15px] mt-1"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Chamar André no WhatsApp
            </button>
            <p className="text-[11px] text-slate-400 text-center">
              Sem cadastro. Vai direto pra conversa.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
