"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

const faqs = [
  {
    q: "Quanto custa uma instalação de ar condicionado?",
    a: "Uma instalação padrão de Split de 9.000 a 12.000 BTU começa em R$ 380 (sem tubulação nova). O valor final depende do modelo, da distância entre evaporadora e condensadora e da infraestrutura elétrica. Mandando uma foto do local no WhatsApp, o orçamento vai em minutos.",
  },
  {
    q: "De quanto em quanto tempo devo fazer manutenção?",
    a: "A recomendação técnica é 2 vezes ao ano em uso residencial e a cada 3 meses em uso comercial ou hospitalar. Manutenção preventiva evita queima do compressor, reduz até 30% da conta de luz e mantém a qualidade do ar respirável.",
  },
  {
    q: "Meu ar não está gelando. Precisa recarga de gás?",
    a: "Nem sempre. Ar que não gela pode ser vazamento, sujeira no filtro, capacitor queimado ou placa com defeito. Antes de recarregar, fazemos teste de estanqueidade — se tem vazamento, resolver a fuga primeiro é obrigatório, senão o gás novo vai embora igual.",
  },
  {
    q: "Vocês emitem nota fiscal e garantia?",
    a: "Sim. Toda instalação e reparo saem com nota fiscal e 90 dias de garantia de serviço. Peças originais têm garantia de fábrica também (12 meses em geral).",
  },
  {
    q: "Atendem no fim de semana e feriado?",
    a: "Sim, com agendamento. Para emergências (ar pingando em teto, vazamento de gás perceptível, falha total em local comercial), atendemos no mesmo dia sempre que possível.",
  },
  {
    q: "Como funciona o orçamento? Cobram pra ir olhar?",
    a: "Orçamento pelo WhatsApp com foto é gratuito. Visita técnica presencial é gratuita mediante execução do serviço. Se você só quer um laudo sem contratar, é cobrada uma taxa técnica, combinada antes.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="relative py-20 lg:py-28 border-y border-white/[0.06] overflow-hidden"
      style={{ background: "#070c18" }}
    >
      <div className="andre-bg andre-bg-breath" />
      <div className="relative z-10 max-w-4xl mx-auto px-5 lg:px-8">
        <div className="mb-12 text-center">
          <span className="andre-chip">Dúvidas frequentes</span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight">
            O que a gente já respondeu{" "}
            <span className="andre-gradient-text">mil vezes</span>.
          </h2>
        </div>

        <ul className="space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <li key={f.q} className="andre-card overflow-hidden">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-[15px] sm:text-base font-semibold text-white leading-snug">
                    {f.q}
                  </span>
                  <Plus
                    className="h-5 w-5 shrink-0 transition-transform duration-300"
                    style={{
                      color: "#7dd3fc",
                      transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                    }}
                  />
                </button>
                <div
                  className="grid transition-[grid-template-rows] duration-300 ease-out"
                  style={{
                    gridTemplateRows: isOpen ? "1fr" : "0fr",
                  }}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm text-slate-300 leading-relaxed">
                      {f.a}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
