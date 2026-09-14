import {
  ESTADOS,
  ITENS_AVALIADOS,
  ITENS_NOTA,
  MANUTENCAO,
  PRODUTOS,
  PROVOCACAO,
} from "@/lib/relatorio";
import { FOTOS } from "@/lib/photos";
import { FotoReal } from "@/components/ui/foto-real";
import { Reveal } from "@/components/ui/reveal";

/**
 * Exclusivo da página 05 (§12, §13, §14).
 *
 * A área diferenciadora da VIVA. A foto do profissional em inspeção é o
 * coração da página — não trocar por ícone ou ilustração. O diagnóstico
 * leva naturalmente à capacidade de executar a correção.
 */
export function BlocoRelatorio() {
  return (
    <section className="v-section v-section--tight" aria-labelledby="rel-titulo">
      <div className="v-wrap">
        {/* a provocação comercial */}
        <Reveal className="v-comp">
          <div className="v-provoca">
            <h2 className="v-provoca__titulo" id="rel-titulo">
              {PROVOCACAO.titulo}
            </h2>
            <p className="v-provoca__texto">{PROVOCACAO.texto}</p>
          </div>

          <ul className="v-estados">
            {ESTADOS.map((e) => (
              <li
                className={`v-estado ${e.chave === "conforme" ? "v-estado--ok" : "v-estado--falha"}`}
                key={e.chave}
              >
                <FotoReal
                  foto={e.chave === "conforme" ? FOTOS.relatorio.conforme : FOTOS.relatorio.falha}
                  sizes="(max-width: 900px) 100vw, 23vw"
                />
                <div className="v-estado__cap">
                  <p className="v-estado__rot">{e.rotulo}</p>
                  <p className="v-estado__txt">{e.texto}</p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>

        {/* os mais de 20 itens */}
        <Reveal>
          <h3 className="v-display v-h3" style={{ marginTop: "clamp(34px, 4vw, 54px)" }}>
            Mais de 20 itens avaliados
          </h3>
          <ul className="v-itens" style={{ marginTop: 18 }}>
            {ITENS_AVALIADOS.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
          <p className="v-body" style={{ marginTop: 12 }}>
            {ITENS_NOTA}
          </p>
        </Reveal>

        {/* manutenção: identificamos e também executamos */}
        <Reveal>
          <h3 className="v-display v-h3" style={{ marginTop: "clamp(34px, 4vw, 54px)" }}>
            Manutenção preventiva completa
          </h3>
          <ul className="v-chips" style={{ marginTop: 18 }}>
            {MANUTENCAO.map((m) => (
              <li className="v-chip" key={m}>
                {m}
              </li>
            ))}
          </ul>
        </Reveal>

        {/* extintores, recarga e produtos */}
        <Reveal className="v-comp" >
          <div style={{ marginTop: "clamp(34px, 4vw, 54px)" }}>
            <h3 className="v-display v-h3">{PRODUTOS.titulo}</h3>
            <p className="v-lead" style={{ marginTop: 14 }}>
              {PRODUTOS.texto}
            </p>
            <ul className="v-list">
              {PRODUTOS.itens.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
          <div style={{ marginTop: "clamp(34px, 4vw, 54px)" }}>
            <FotoReal
              foto={FOTOS.relatorio.m2}
              legenda
              sizes="(max-width: 1080px) 100vw, 46vw"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
