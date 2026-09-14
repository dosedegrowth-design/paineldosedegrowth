import { NUMEROS } from "@/lib/numeros";

/**
 * A faixa de números. Só entram os que a VIVA confirmou — os números que
 * apareceram nos mockups da agência não são fatos.
 */
export function Numeros() {
  return (
    <section className="v-dark" aria-label="A VIVA em números">
      <div className="v-wrap" style={{ paddingInline: 0 }}>
        <ul className="v-num">
          {NUMEROS.map((n) => (
            <li className="v-num__item" key={n.rotulo}>
              <span className="v-num__valor">{n.valor}</span>
              <span className="v-num__rotulo">{n.rotulo}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
