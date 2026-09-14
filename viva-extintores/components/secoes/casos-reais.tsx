import Link from "next/link";
import { CASOS_REAIS_URL } from "@/lib/config";
import { SetaBaixo } from "@/components/ui/icones";
import { Reveal } from "@/components/ui/motion";

/**
 * A transição do fim de cada página de área.
 *
 * A chamada, a seta, e PARA. O módulo de casos reais é da agência e já
 * existe — não é para reconstruir aqui, nem para virar catálogo de trinta
 * fotos. A seta só faz a costura: "entendi o que vocês fazem" → "agora me
 * mostre que vocês realmente fazem".
 *
 * Enquanto a galeria não estiver ligada (`CASOS_REAIS_URL` vazia), a
 * seção não aparece. Chamada e seta apontando para o nada eram uma faixa
 * vazia no fim de cada uma das cinco páginas.
 */
export function CasosReais() {
  if (!CASOS_REAIS_URL) return null;

  return (
    <section className="v-casos" id="casos-reais" aria-labelledby="casos-titulo">
      <div className="v-wrap">
        <Reveal>
          <Link href={CASOS_REAIS_URL} className="v-casos__link">
            <h2 className="v-display v-casos__chamada" id="casos-titulo">
              Veja alguns dos nossos casos reais
            </h2>
            <SetaBaixo className="v-seta" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
