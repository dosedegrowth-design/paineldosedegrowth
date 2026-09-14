import { NUMEROS, NUMEROS_NOTA } from "@/lib/numeros";
import { Contador, Reveal } from "@/components/ui/motion";

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
        <Reveal className="v-num">
          <ul className="v-num__lista v-cascata-in">
            {NUMEROS.map((n) => (
              <li key={n.rotulo}>
                <Contador valor={n.valor} className="v-num__valor v-display" />
                <span className="v-num__rotulo">{n.rotulo}</span>
              </li>
            ))}
          </ul>
          <p className="v-num__nota">{NUMEROS_NOTA}</p>
        </Reveal>
      </div>
    </section>
  );
}
