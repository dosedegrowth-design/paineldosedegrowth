import { Chapter } from "./chapter";
import { RevealSection } from "./tilt-card";
import { Watermark } from "./site-frame";
import { AnimatedTestimonials } from "./animated-testimonials";
import { WhatsAppIcon } from "./whatsapp-icon";
import { waLink } from "./config";

const depoimentos = [
  {
    quote:
      "Chegou no horário, explicou tudo, instalou e ainda organizou os fios. Muito acima da média.",
    name: "Renata M.",
    designation: "Perdizes · São Paulo",
    service: "Instalação Split 12.000",
    src: "/andre/ambiente-quarto.jpg",
  },
  {
    quote:
      "Depois da higienização, o ar voltou a gelar como novo. Recomendo pra quem tem criança em casa.",
    name: "Carlos A.",
    designation: "Santo André · SP",
    service: "Higienização + manutenção",
    src: "/andre/tecnico-manutencao.jpg",
  },
  {
    quote:
      "Pediu foto no WhatsApp, mandou orçamento na hora e resolveu no mesmo dia. Nunca tinha visto isso.",
    name: "Juliana P.",
    designation: "Alphaville · SP",
    service: "Reparo e carga de gás",
    src: "/andre/tecnico-gas.jpg",
  },
];

export function Testimonials() {
  return (
    <section className="relative py-16 lg:py-36 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <Watermark text="CONFIANÇA" top="8%" />
      </div>
      <div className="relative max-w-6xl mx-auto px-5 lg:px-8">
        <RevealSection className="max-w-2xl mb-10 lg:mb-14 mx-auto text-center lg:mx-0 lg:text-left">
          <Chapter n="09" label="Clientes" />
          <h2 className="mt-4 text-4xl sm:text-5xl lg:text-[3.6rem] andre-display leading-[1.02] text-white">
            Quem já contratou{" "}
            <span className="andre-gradient-text">volta a chamar</span>.
          </h2>
        </RevealSection>

        <RevealSection>
          <AnimatedTestimonials testimonials={depoimentos} />
        </RevealSection>

        <div className="mt-12 lg:mt-16 flex justify-center">
          <a
            href={waLink()}
            target="_blank"
            rel="noopener noreferrer"
            data-magnetic
            className="andre-btn-primary inline-flex items-center gap-2 h-12 px-7 rounded-xl text-[15px]"
          >
            <WhatsAppIcon className="h-5 w-5" />
            Quero esse atendimento no WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
