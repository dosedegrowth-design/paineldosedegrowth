import { MapPin } from "lucide-react";

const regions = [
  "Zona Sul",
  "Zona Norte",
  "Zona Leste",
  "Zona Oeste",
  "Centro",
  "ABC",
  "Guarulhos",
  "Osasco",
  "Alphaville",
  "Barueri",
  "Cotia",
  "Santo André",
  "São Bernardo",
  "Diadema",
  "Taboão da Serra",
  "Mogi das Cruzes",
];

export function Coverage() {
  return (
    <section
      id="cobertura"
      className="relative py-20 lg:py-28"
      style={{ background: "#070c18" }}
    >
      <div className="max-w-6xl mx-auto px-5 lg:px-8">
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-10 lg:gap-14 items-start">
          <div>
            <span className="andre-chip">Cobertura</span>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight">
              São Paulo e{" "}
              <span className="andre-gradient-text">Grande SP</span>.
            </h2>
            <p className="mt-4 text-slate-300 text-base leading-relaxed">
              Atendemos capital, ABC, Alphaville e cidades vizinhas. Fora dessa
              área? Chama no WhatsApp — se der pra ir, a gente vai.
            </p>

            <div className="mt-6 andre-glass rounded-xl p-4 flex items-center gap-3">
              <span
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg"
                style={{
                  background: "rgba(56,189,248,0.10)",
                  border: "1px solid rgba(56,189,248,0.25)",
                }}
              >
                <MapPin className="h-5 w-5" style={{ color: "#7dd3fc" }} />
              </span>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-white">
                  Deslocamento grátis dentro da capital
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Fora da cidade, taxa acordada antes da visita.
                </p>
              </div>
            </div>
          </div>

          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {regions.map((r) => (
              <li
                key={r}
                className="andre-card px-4 py-3 flex items-center gap-2 text-sm"
              >
                <span
                  className="h-1.5 w-1.5 rounded-full shrink-0"
                  style={{ background: "#7dd3fc" }}
                />
                <span className="text-slate-200 font-medium">{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
