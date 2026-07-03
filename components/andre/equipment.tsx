import { Wind, Boxes, PanelTop, PanelBottom, Layers } from "lucide-react";
import { RevealSection } from "./tilt-card";

const equipment = [
  {
    icon: Wind,
    name: "Split Hi Wall",
    btus: "9.000 · 12.000 · 18.000 · 22.000 · 24.000 BTU",
  },
  {
    icon: Boxes,
    name: "Multi Split",
    btus: "Duas ou mais evaporadoras em uma condensadora",
  },
  {
    icon: PanelTop,
    name: "Piso Teto",
    btus: "24.000 até 60.000 BTU — comercial e industrial",
  },
  {
    icon: PanelBottom,
    name: "Cassete (K7)",
    btus: "Embutido no forro, insuflamento 4 vias",
  },
  {
    icon: Layers,
    name: "VRF / VRV",
    btus: "Prédios, hotéis e escritórios de grande porte",
  },
  {
    icon: Wind,
    name: "Janela e Portátil",
    btus: "Manutenção, higienização e reparo",
  },
];

const brands = [
  "LG",
  "Samsung",
  "Daikin",
  "Midea",
  "Carrier",
  "Elgin",
  "Springer",
  "Fujitsu",
  "Gree",
  "Philco",
  "Consul",
  "Electrolux",
];

export function Equipment() {
  return (
    <section id="equipamentos" className="relative py-20 lg:py-28 overflow-hidden">
      <div className="andre-bg andre-bg-bars">
        <svg className="sine" viewBox="0 0 1600 200" preserveAspectRatio="none">
          <path
            d="M0,100 C 100,20 200,180 300,100 C 400,20 500,180 600,100 C 700,20 800,180 900,100 C 1000,20 1100,180 1200,100 C 1300,20 1400,180 1500,100 L 1600,100"
            stroke="#7dd3fc"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M0,110 C 100,30 200,190 300,110 C 400,30 500,190 600,110 C 700,30 800,190 900,110 C 1000,30 1100,190 1200,110 C 1300,30 1400,190 1500,110 L 1600,110"
            stroke="#38bdf8"
            strokeWidth="1.5"
            strokeOpacity="0.6"
            fill="none"
          />
        </svg>
        <div className="bar-grid">
          {Array.from({ length: 32 }).map((_, i) => (
            <span
              key={i}
              className="bar"
              style={{
                height: `${30 + ((i * 37) % 65)}%`,
                animationDelay: `${(i % 10) * 0.18}s`,
                animationDuration: `${1.6 + ((i * 13) % 20) / 10}s`,
              }}
            />
          ))}
        </div>
      </div>
      <div className="relative z-10 max-w-6xl mx-auto px-5 lg:px-8">
        <RevealSection className="max-w-2xl mb-12">
          <span className="andre-chip">Equipamentos</span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight">
            Atendemos praticamente{" "}
            <span className="andre-gradient-text">qualquer modelo</span>.
          </h2>
          <p className="mt-4 text-slate-300 text-base leading-relaxed">
            De residencial a industrial. Se aparelha ar, o André conserta.
          </p>
        </RevealSection>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {equipment.map((e) => (
            <div
              key={e.name}
              className="andre-card p-5 flex items-start gap-4"
            >
              <span
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                style={{
                  background: "rgba(56,189,248,0.10)",
                  border: "1px solid rgba(56,189,248,0.25)",
                }}
              >
                <e.icon className="h-5 w-5" style={{ color: "#7dd3fc" }} />
              </span>
              <div className="leading-tight">
                <p className="text-base font-bold text-white">{e.name}</p>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {e.btus}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14">
          <p className="text-center text-xs uppercase tracking-[0.24em] text-slate-500 mb-6">
            Marcas atendidas
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {brands.map((b) => (
              <span
                key={b}
                className="text-sm font-semibold text-slate-400 hover:text-slate-200 transition-colors"
              >
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
