import { MapPin } from "lucide-react";
import { Chapter } from "./chapter";
import { RevealSection } from "./tilt-card";

const regions = [
  "Zona Sul", "Zona Norte", "Zona Leste", "Zona Oeste", "Centro", "ABC",
  "Guarulhos", "Osasco", "Alphaville", "Barueri", "Cotia", "Santo André",
  "São Bernardo", "Diadema", "Taboão da Serra", "Mogi das Cruzes",
];

export function Coverage() {
  return (
    <section
      id="cobertura"
      className="relative py-24 lg:py-36 bg-white/[0.02] border-y border-white/[0.06]"
    >
      <div className="max-w-6xl mx-auto px-5 lg:px-8">
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-10 lg:gap-14 items-start">
          <RevealSection>
            <Chapter n="08" label="Cobertura" />
            <h2 className="mt-4 text-4xl sm:text-5xl lg:text-[3.6rem] font-black leading-tight tracking-tight text-white">
              São Paulo e{" "}
              <span className="andre-gradient-text">Grande SP</span>.
            </h2>
            <p className="mt-4 text-slate-300 text-base leading-relaxed">
              Capital, ABC, Alphaville e cidades vizinhas. Fora dessa área?
              Chama no WhatsApp — se der pra ir, a gente vai.
            </p>

            <div className="mt-6 andre-card p-4 flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-400/10 border border-sky-400/25">
                <MapPin className="h-5 w-5 text-sky-400" />
              </span>
              <div className="leading-tight">
                <p className="text-sm font-bold text-white">
                  Deslocamento grátis na capital
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Fora da cidade, taxa combinada antes da visita.
                </p>
              </div>
            </div>
          </RevealSection>

          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {regions.map((r) => (
              <li
                key={r}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 flex items-center gap-2 text-sm hover:border-sky-400/50 hover:bg-sky-400/10 transition-colors"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-sky-500 shrink-0" />
                <span className="text-slate-300 font-semibold">{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
