import { Award, ShieldCheck, Timer, Wallet } from "lucide-react";

const items = [
  {
    icon: Timer,
    title: "Atendimento em 24h",
    desc: "Emergência? Retornamos em minutos.",
  },
  {
    icon: ShieldCheck,
    title: "90 dias de garantia",
    desc: "Todo serviço acompanhado de nota fiscal.",
  },
  {
    icon: Award,
    title: "Técnicos certificados",
    desc: "Formação NR-35, NR-10 e refrigeração.",
  },
  {
    icon: Wallet,
    title: "Sem taxa de visita",
    desc: "Se o serviço fechar, a visita é grátis.",
  },
];

export function TrustBar() {
  return (
    <section className="relative border-y border-white/[0.06] bg-[#070c18]/70">
      <div className="max-w-6xl mx-auto px-5 lg:px-8 py-6 lg:py-8">
        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
          {items.map((it) => (
            <li key={it.title} className="flex items-start gap-3">
              <span
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                style={{
                  background: "rgba(56,189,248,0.10)",
                  border: "1px solid rgba(56,189,248,0.25)",
                }}
              >
                <it.icon className="h-5 w-5" style={{ color: "#7dd3fc" }} />
              </span>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-white">{it.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">{it.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
