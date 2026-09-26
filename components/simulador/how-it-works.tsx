import { COPY } from "@/lib/simulador/config";

export function HowItWorks() {
  return (
    <section className="sim-how" aria-labelledby="sim-how-title">
      <h2 id="sim-how-title" className="sim-how__title">
        {COPY.howItWorks.title}
      </h2>
      <ol className="sim-how__list">
        {COPY.howItWorks.steps.map((step, i) => (
          <li key={step.title} className="sim-how__item">
            <span className="sim-how__num" aria-hidden="true">
              {i + 1}
            </span>
            <div>
              <h3 className="sim-how__item-title">{step.title}</h3>
              <p className="sim-how__item-text">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
