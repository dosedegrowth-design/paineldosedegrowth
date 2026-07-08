import {
  HeartPulse,
  Factory,
  FlaskConical,
  Store,
  Home,
  Warehouse,
} from "lucide-react";
import { RevealSection, TiltCard } from "./tilt-card";

/* Aplicações/segmentos do site climafrio.com.br, com uma linha
   institucional sobre a exigência técnica de cada um. */

const segmentos = [
  {
    icon: HeartPulse,
    name: "Hospitalar",
    desc: "Controle de temperatura, umidade e pressurização pra centros cirúrgicos, UTIs e áreas críticas.",
  },
  {
    icon: Factory,
    name: "Industrial",
    desc: "Climatização de processo e conforto térmico pra linhas de produção que não podem parar.",
  },
  {
    icon: FlaskConical,
    name: "Sala limpa",
    desc: "Ambientes controlados com filtragem e classificação pra farmacêutica, laboratórios e eletrônica.",
  },
  {
    icon: Store,
    name: "Comercial",
    desc: "Lojas, escritórios, restaurantes e hotéis — conforto do cliente com eficiência de energia.",
  },
  {
    icon: Home,
    name: "Residencial",
    desc: "Projetos discretos e silenciosos, do apartamento compacto à residência de alto padrão.",
  },
  {
    icon: Warehouse,
    name: "Galpões",
    desc: "Grandes vãos com distribuição de ar uniforme pra logística, eventos e varejo atacadista.",
  },
];

export function Segmentos() {
  return (
    <section
      id="segmentos"
      className="relative py-16 lg:py-36 bg-white/[0.02] border-y border-white/[0.06]"
    >
      <div className="max-w-6xl mx-auto px-5 lg:px-8">
        <RevealSection className="max-w-2xl mx-auto text-center">
          <h2 className=" text-4xl sm:text-5xl lg:text-[3.6rem] andre-display leading-[1.02] text-white">
            Cada ambiente exige{" "}
            <span className="andre-gradient-text">uma engenharia</span>.
          </h2>
          <p className="mt-4 text-slate-300 text-base leading-relaxed">
            De um centro cirúrgico a um galpão logístico, projetamos a
            climatização em torno da exigência de cada operação.
          </p>
        </RevealSection>

        <div className="mt-10 lg:mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {segmentos.map((s, i) => (
            <TiltCard
              key={s.name}
              delay={i * 0.06}
              className="andre-card p-6 flex flex-col"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 shadow-md shadow-sky-900/60 mb-4">
                <s.icon className="h-5 w-5 text-white" />
              </span>
              <h3 className="andre-display text-xl text-white leading-tight">
                {s.name}
              </h3>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                {s.desc}
              </p>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
}
