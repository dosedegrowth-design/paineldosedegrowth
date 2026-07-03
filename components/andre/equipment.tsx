import { Wind, Boxes, PanelTop, PanelBottom, Layers } from "lucide-react";
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
  "Springer", "Fujitsu", "Gree", "Philco", "Consul", "Electrolux",
];

export function Equipment() {
  return (
    <section id="equipamentos" className="relative py-20 lg:py-28">
      <div className="max-w-6xl mx-auto px-5 lg:px-8">
        <RevealSection className="max-w-2xl mb-12">
          <span className="andre-chip">Equipamentos</span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-[2.7rem] font-black leading-tight tracking-tight text-slate-900">
            Atendemos praticamente{" "}
            <span className="andre-gradient-text">qualquer modelo</span>.
          </h2>
        </RevealSection>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {equipment.map((e) => (
            <div key={e.name} className="andre-card p-5 flex items-center gap-4">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 border border-sky-100">
                <e.icon className="h-5 w-5 text-sky-600" />
              </span>
              <div className="leading-tight">
                <p className="text-[15px] font-extrabold text-slate-900">{e.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{e.btus}</p>
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
                className="text-base font-extrabold text-slate-300 hover:text-slate-500 transition-colors select-none"
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
