import { COPY } from "@/lib/simulador/config";
import { CalcIcon, ChatIcon, IdIcon } from "./icons";

const ICONS = [IdIcon, CalcIcon, ChatIcon];

/** Seção informativa, presente em todas as etapas (âncora do menu). */
export function HowItWorks() {
  return (
    <section id="como-funciona" className="sim-section sim-section--soft" aria-labelledby="sim-how-title">
      <div className="sim-container">
        <h2 id="sim-how-title" className="sim-section__title">
          {COPY.howItWorks.title}
        </h2>
        <p className="sim-section__intro">{COPY.howItWorks.intro}</p>
        <ol className="sim-cards">
          {COPY.howItWorks.steps.map((step, i) => {
            const Icon = ICONS[i] ?? IdIcon;
            return (
              <li key={step.title} className="sim-card">
                <span className="sim-card__icon">
                  <Icon size={22} />
                </span>
                <span className="sim-card__step">Passo {i + 1}</span>
                <h3 className="sim-card__title">{step.title}</h3>
                <p className="sim-card__text">{step.text}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
