import { Wind, Boxes, PanelTop, PanelBottom, Layers } from "lucide-react";

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
        <div className="bar-grid">
          {Array.from({ length: 24 }).map((_, i) => (
            <span
              key={i}
              className="bar"
              style={{
                height: `${20 + ((i * 37) % 60)}%`,
                animationDelay: `${(i % 8) * 0.2}s`,
                animationDuration: `${2.2 + ((i * 13) % 20) / 10}s`,
              }}
            />
          ))}
        </div>
      </div>
      <div className="relative z-10 max-w-6xl mx-auto px-5 lg:px-8">
        <div className="max-w-2xl mb-12">
          <span className="andre-chip">Equipamentos</span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight">
            Atendemos praticamente{" "}
            <span className="andre-gradient-text">qualquer modelo</span>.
          </h2>
          <p className="mt-4 text-slate-300 text-base leading-relaxed">
            De residencial a industrial. Se aparelha ar, o André conserta.
          </p>
        </div>

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
