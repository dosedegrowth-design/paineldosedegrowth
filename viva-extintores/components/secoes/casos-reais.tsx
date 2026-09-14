import { SetaBaixo } from "@/components/ui/icones";
import { Reveal } from "@/components/ui/reveal";

/**
 * A transição do fim de cada página de área.
 *
 * A chamada, a seta, e PARA. O módulo de casos reais é da agência e já
 * existe — não é para reconstruir aqui, nem para virar catálogo de trinta
 * fotos. A seta só faz a costura: "entendi o que vocês fazem" → "agora me
 * mostre que vocês realmente fazem".
 */
export function CasosReais() {
  return (
    <section className="v-casos" id="casos-reais" aria-labelledby="casos-titulo">
      <div className="v-wrap">
        <Reveal>
          <h2 className="v-display v-casos__chamada" id="casos-titulo">
            Veja alguns dos nossos casos reais
          </h2>
          <SetaBaixo className="v-seta" />
        </Reveal>
      </div>
    </section>
  );
}
