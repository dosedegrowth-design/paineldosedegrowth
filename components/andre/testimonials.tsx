import { Star } from "lucide-react";
import { RevealSection } from "./tilt-card";

const items = [
  {
    name: "Renata M.",
    where: "Perdizes · SP",
    text: "Chegou no horário, explicou tudo, instalou e ainda organizou os fios. Muito acima da média.",
    service: "Instalação Split 12.000",
    initials: "RM",
    color: "#0ea5e9",
  },
  {
    name: "Carlos A.",
    where: "Santo André · SP",
    text: "Depois da higienização, o ar voltou a gelar como novo. Recomendo pra quem tem criança em casa.",
    service: "Higienização + manutenção",
    initials: "CA",
    color: "#06b6d4",
  },
  {
    name: "Juliana P.",
    where: "Alphaville · SP",
    text: "Pediu foto no WhatsApp, mandou orçamento na hora e resolveu no mesmo dia. Nunca tinha visto isso.",
    service: "Reparo de placa",
    initials: "JP",
    color: "#0284c7",
  },
];

export function Testimonials() {
  return (
    <section className="relative py-20 lg:py-28">
      <div className="max-w-6xl mx-auto px-5 lg:px-8">
        <RevealSection className="max-w-2xl mb-12">
          <span className="andre-chip">Depoimentos</span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-[2.7rem] font-black leading-tight tracking-tight text-white">
            Quem já contratou{" "}
            <span className="andre-gradient-text">volta a chamar</span>.
          </h2>
        </RevealSection>

        <div className="grid md:grid-cols-3 gap-5">
          {items.map((t) => (
            <figure key={t.name} className="andre-card p-6 flex flex-col">
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4" fill="#fbbf24" color="#fbbf24" />
                ))}
              </div>
              <blockquote className="text-[15px] text-slate-300 leading-relaxed flex-1">
                “{t.text}”
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <span
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white text-xs font-black"
                  style={{ background: t.color }}
                >
                  {t.initials}
                </span>
                <div className="leading-tight">
                  <p className="text-sm font-bold text-white">{t.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {t.where} · {t.service}
                  </p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
