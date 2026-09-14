import { NUMEROS, NUMEROS_NOTA } from "@/lib/numeros";

/**
 * Os números.
 *
 * Entram como prova de experiência dentro da narrativa, numa linha fina —
 * nunca como quatro quadradinhos logo na abertura. E só os que a VIVA
 * confirmou: os que apareceram nos mockups da agência não são fatos.
 */
export function Numeros() {
  return (
    <section className="v-section v-section--tight" aria-label="A VIVA em números">
      <div className="v-wrap">
        <div className="v-num">
          <p className="v-num__nota">{NUMEROS_NOTA}</p>
          <ul className="v-num__lista">
            {NUMEROS.map((n) => (
              <li key={n.rotulo}>
                <span className="v-num__valor">{n.valor}</span>
                <span className="v-num__rotulo">{n.rotulo}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
