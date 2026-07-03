import { Wind, Boxes, PanelTop, PanelBottom, Layers } from "lucide-react";
import { Chapter } from "./chapter";
import { RevealSection } from "./tilt-card";

const equipment = [
  { icon: Wind, name: "Split Hi Wall", btus: "9.000 a 24.000 BTU" },
  { icon: Boxes, name: "Multi Split", btus: "2+ ambientes, 1 condensadora" },
  { icon: PanelTop, name: "Piso Teto", btus: "24.000 a 60.000 BTU" },
  { icon: PanelBottom, name: "Cassete (K7)", btus: "Embutido, 4 vias" },
  { icon: Layers, name: "VRF / VRV", btus: "Prédios e escritórios" },
  { icon: Wind, name: "Janela e Portátil", btus: "Manutenção e reparo" },
];

const brands = [
  "LG", "Samsung", "Daikin", "Midea", "Carrier", "Elgin",
  "Springer", "Mitsubishi", "Fujitsu", "Gree", "Philco", "Consul", "Electrolux",
];

export function Equipment() {
  return (
    <section id="equipamentos" className="relative py-16 lg:py-36">
      <div className="max-w-6xl mx-auto px-5 lg:px-8">
        <RevealSection className="max-w-2xl mb-9 lg:mb-12 mx-auto text-center lg:mx-0 lg:text-left">
          <Chapter n="07" label="Equipamentos" />
          <h2 className="mt-4 text-4xl sm:text-5xl lg:text-[3.6rem] andre-display leading-[1.02] text-white">
            Atendemos praticamente{" "}
            <span className="andre-gradient-text">qualquer modelo</span>.
          </h2>
        </RevealSection>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {equipment.map((e) => (
            <div key={e.name} className="andre-card p-5 flex items-center gap-4">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-400/10 border border-sky-400/25">
                <e.icon className="h-5 w-5 text-sky-400" />
              </span>
              <div className="leading-tight">
                <p className="text-[15px] font-extrabold text-white">{e.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{e.btus}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14">
          <p className="text-center text-[11px] uppercase tracking-[0.24em] text-slate-400 font-bold mb-6">
            Marcas atendidas
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {brands.map((b) => (
              <span
                key={b}
                className="text-base font-extrabold text-slate-600 hover:text-slate-400 transition-colors select-none"
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
