import { STEPS } from "@/lib/simulador/config";
import { CheckIcon } from "./icons";

/** Indicador das etapas do serviço; `current` é o índice (0-based) da etapa atual. */
export function Stepper({ current }: { current: number }) {
  return (
    <ol className="sim-stepper" aria-label={`Etapa ${current + 1} de ${STEPS.length}`}>
      {STEPS.map((label, i) => {
        const state = i < current ? "done" : i === current ? "current" : "upcoming";
        return (
          <li key={label} data-state={state} aria-current={state === "current" ? "step" : undefined}>
            <span className="sim-stepper__num" aria-hidden="true">
              {state === "done" ? <CheckIcon size={14} strokeWidth={3} /> : i + 1}
            </span>
            <span className="sim-stepper__label">{label}</span>
          </li>
        );
      })}
    </ol>
  );
}
