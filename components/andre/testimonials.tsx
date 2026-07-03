import { Star, Quote } from "lucide-react";
import { RevealSection } from "./tilt-card";

const items = [
  {
    name: "Renata M.",
    where: "Perdizes · SP",
    text: "Chegou no horário, explicou tudo, instalou e ainda organizou os fios. Muito acima da média.",
    service: "Instalação Split 12.000",
  },
  {
    name: "Carlos A.",
    where: "Santo André · SP",
    text: "Depois da higienização, o ar voltou a gelar como novo. Recomendo pra quem tem criança em casa.",
    service: "Higienização + manutenção",
  },
  {
    name: "Juliana P.",
    where: "Alphaville · SP",
    text: "Pediu foto no WhatsApp, mandou orçamento na hora e resolveu no mesmo dia. Nunca tinha visto isso.",
    service: "Reparo de placa",
  },
];

export function Testimonials() {
  return (
    <section className="relative py-20 lg:py-28 overflow-hidden">
      <div className="andre-bg andre-bg-rise">
        <span className="aurora-band a1" />
        <span className="aurora-band a2" />
        <span className="aurora-band a3" />
        {Array.from({ length: 26 }).map((_, i) => (
          <span
            key={i}
            className="rise-flake"
            style={{
              left: `${(i * 53) % 100}%`,
              animationDelay: `${(i % 9) * 1.1}s`,
              animationDuration: `${9 + (i % 6) * 1.5}s`,
              opacity: 0.5 + ((i * 17) % 40) / 100,
            }}
          />
        ))}
      </div>
      <div className="relative z-10 max-w-6xl mx-auto px-5 lg:px-8">
        <RevealSection className="max-w-2xl mb-12">
          <span className="andre-chip">Depoimentos</span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight">
            Quem já contratou{" "}
            <span className="andre-gradient-text">volta a chamar</span>.
          </h2>
        </RevealSection>

        <div className="grid md:grid-cols-3 gap-4 lg:gap-5">
          {items.map((t) => (
            <figure key={t.name} className="andre-card p-6 flex flex-col">
              <Quote
                className="h-6 w-6 mb-4"
                style={{ color: "rgba(125,211,252,0.6)" }}
              />
              <blockquote className="text-[15px] text-slate-200 leading-relaxed flex-1">
                “{t.text}”
              </blockquote>
              <div className="flex items-center gap-1 mt-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5" fill="#fbbf24" color="#fbbf24" />
                ))}
              </div>
              <figcaption className="mt-3 leading-tight">
                <p className="text-sm font-bold text-white">{t.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {t.where} · {t.service}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
