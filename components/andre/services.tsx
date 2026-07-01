import {
  Wrench,
  Wind,
  Sparkles,
  Cable,
  Droplets,
  MoveRight,
} from "lucide-react";
import { waLink } from "./config";

const services = [
  {
    icon: Wind,
    title: "Instalação completa",
    desc: "Split, Multi Split, Piso Teto, Cassete e VRF. Materiais originais e nivelamento perfeito.",
    highlights: ["Ponto elétrico", "Tubulação frigorígena", "Suporte e vácuo"],
    cta: "Quero instalar",
    message: "Olá, André! Quero um orçamento de instalação de ar condicionado.",
  },
  {
    icon: Wrench,
    title: "Manutenção preventiva",
    desc: "Check-up completo que evita quebra do compressor e reduz até 30% da conta de luz.",
    highlights: ["Diagnóstico técnico", "Verificação de gás", "Relatório assinado"],
    cta: "Agendar manutenção",
    message: "Olá, André! Quero agendar uma manutenção preventiva.",
  },
  {
    icon: Sparkles,
    title: "Higienização profunda",
    desc: "Limpeza de serpentina, hélice e dreno. Elimina bactérias, mofo e mau cheiro.",
    highlights: ["Produto bactericida", "Antifúngico", "Coleta de resíduos"],
    cta: "Higienizar meu ar",
    message: "Olá, André! Preciso de higienização do ar condicionado.",
  },
  {
    icon: Droplets,
    title: "Recarga de gás",
    desc: "R-410A, R-32 e R-22. Detecção de vazamento e teste de estanqueidade antes da carga.",
    highlights: ["Teste de pressão", "Vácuo profundo", "Gás com selo"],
    cta: "Verificar gás",
    message: "Olá, André! Meu ar não gela, preciso verificar o gás.",
  },
  {
    icon: Cable,
    title: "Reparo e troca de peças",
    desc: "Placa eletrônica, capacitor, sensor, ventilador. Diagnóstico com laudo antes da troca.",
    highlights: ["Peças originais", "Laudo técnico", "Nota fiscal"],
    cta: "Meu ar quebrou",
    message: "Olá, André! Meu ar condicionado quebrou, preciso de reparo.",
  },
  {
    icon: MoveRight,
    title: "Desinstalação e mudança",
    desc: "Retiramos, transportamos e reinstalamos no endereço novo, sem danificar o equipamento.",
    highlights: ["Retirada segura", "Guarda do gás", "Reinstalação"],
    cta: "Vou mudar de casa",
    message: "Olá, André! Preciso desinstalar/mudar meu ar condicionado.",
  },
];

export function Services() {
  return (
    <section id="servicos" className="relative py-20 lg:py-28">
      <div className="max-w-6xl mx-auto px-5 lg:px-8">
        <div className="max-w-2xl mb-12">
          <span className="andre-chip">Serviços</span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight">
            Tudo o que seu ar condicionado precisa,{" "}
            <span className="andre-gradient-text">com um técnico só</span>.
          </h2>
          <p className="mt-4 text-slate-300 text-base leading-relaxed">
            Do primeiro furo na parede até a manutenção anual. Você fala com o
            André direto — sem call center, sem enrolação.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {services.map((s) => (
            <article key={s.title} className="andre-card p-6 flex flex-col">
              <span
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl mb-4"
                style={{
                  background: "rgba(56,189,248,0.10)",
                  border: "1px solid rgba(56,189,248,0.25)",
                }}
              >
                <s.icon className="h-5 w-5" style={{ color: "#7dd3fc" }} />
              </span>
              <h3 className="text-lg font-bold text-white leading-tight">
                {s.title}
              </h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                {s.desc}
              </p>

              <ul className="mt-4 space-y-1.5">
                {s.highlights.map((h) => (
                  <li
                    key={h}
                    className="text-[13px] text-slate-300 flex items-center gap-2"
                  >
                    <span
                      className="h-1 w-1 rounded-full"
                      style={{ background: "#7dd3fc" }}
                    />
                    {h}
                  </li>
                ))}
              </ul>

              <a
                href={waLink(s.message)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-sky-300 hover:text-sky-200 transition-colors group"
              >
                {s.cta}
                <MoveRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
