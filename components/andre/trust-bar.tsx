import { Award, ShieldCheck, Timer, Wallet } from "lucide-react";

const items = [
  { icon: Timer, title: "Atendimento em 24h", desc: "Emergência? Retornamos em minutos." },
  { icon: ShieldCheck, title: "90 dias de garantia", desc: "Todo serviço com nota fiscal." },
  { icon: Award, title: "Técnicos certificados", desc: "NR-35, NR-10 e refrigeração." },
  { icon: Wallet, title: "Sem taxa de visita", desc: "Fechou o serviço, a visita é grátis." },
];

export function TrustBar() {
  return (
    <section className="relative border-y border-white/[0.06] bg-white/[0.02]">
      <div className="max-w-6xl mx-auto px-5 lg:px-8 py-7 lg:py-9">
        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
          {items.map((it) => (
            <li key={it.title} className="flex items-start gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-400/10 border border-sky-400/25">
                <it.icon className="h-5 w-5 text-sky-400" />
              </span>
              <div className="leading-tight">
                <p className="text-sm font-bold text-white">{it.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">{it.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
