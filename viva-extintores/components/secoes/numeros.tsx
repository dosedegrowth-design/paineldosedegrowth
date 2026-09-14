import { NUMEROS, NUMEROS_NOTA } from "@/lib/numeros";

/**
 * §15 — número como prova de experiência dentro da narrativa, numa faixa
 * fina. Nunca quatro quadradinhos de "+500 clientes".
 */
export function Numeros({ nota = true }: { nota?: boolean }) {
  return (
    <div className="v-num">
      {NUMEROS.map((n) => (
        <p className="v-num__item" key={n.rotulo}>
          <span className="v-num__valor">{n.valor}</span>
          <span className="v-num__rotulo">{n.rotulo}</span>
        </p>
      ))}
      {nota ? <p className="v-num__nota">{NUMEROS_NOTA}</p> : null}
    </div>
  );
}
