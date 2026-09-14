import {
  ESTADOS,
  ITENS_AVALIADOS,
  ITENS_NOTA,
  MANUTENCAO,
  MANUTENCAO_TEXTO,
  MANUTENCAO_TITULO,
  PROVOCACAO,
} from "@/lib/relatorio";
import { FOTOS } from "@/lib/photos";
import { FotoReal } from "@/components/ui/foto-real";
import { Reveal } from "@/components/ui/reveal";
import {
  Alerta,
  Check,
  Chave,
  Hidrante,
  IconeAlarme,
  IconeDocumento,
  IconeExtintor,
  Luz,
  Mangueira,
  Porta,
  Prancheta,
  Saida,
} from "@/components/ui/icones";

const FOTO_ESTADO = {
  conforme: FOTOS.relatorio.conforme,
  falha: FOTOS.relatorio.falha,
  solucao: FOTOS.relatorio.solucao,
};

const SELO_ESTADO = { conforme: Check, falha: Alerta, solucao: Chave };

const ICONE_MANUT = {
  extintor: IconeExtintor,
  mangueira: Mangueira,
  luz: Luz,
  saida: Saida,
  hidrante: Hidrante,
  alarme: IconeAlarme,
  porta: Porta,
  prancheta: Prancheta,
};

/**
 * Blocos próprios da página 05.
 *
 * A fotografia do profissional em inspeção é o coração desta página — não
 * trocar por ícone nem ilustração. Os ícones aqui só rotulam itens de
 * manutenção.
 */
export function BlocoRelatorio() {
  return (
    <section className="v-section v-white" aria-labelledby="rel-titulo">
      <div className="v-wrap">
        <Reveal className="v-comp" >
          <div>
            <h2 className="v-display v-h2" id="rel-titulo">
              Mais de 20 itens
              <br />
              <span className="v-dot">avaliados</span>
            </h2>
            <ul className="v-itens" style={{ marginTop: 20 }}>
              {ITENS_AVALIADOS.map((i) => (
                <li key={i}>
                  <Check />
                  <span>{i}</span>
                </li>
              ))}
              <li>
                <Check />
                <span>{ITENS_NOTA}</span>
              </li>
            </ul>
          </div>

          <div className="v-provoca">
            <div>
              <h3 className="v-provoca__titulo">{PROVOCACAO.titulo}</h3>
              <p className="v-provoca__texto">{PROVOCACAO.texto}</p>
            </div>
            <IconeDocumento />
          </div>
        </Reveal>

        <Reveal>
          <ul className="v-estados" style={{ marginTop: "clamp(26px, 3.2vw, 42px)" }}>
            {ESTADOS.map((e) => {
              const Selo = SELO_ESTADO[e.chave];
              return (
                <li className={`v-estado v-estado--${e.chave}`} key={e.chave}>
                  <div className="v-estado__foto">
                    <FotoReal
                      foto={FOTO_ESTADO[e.chave]}
                      sizes="(max-width: 900px) 100vw, 30vw"
                    />
                    <span className="v-estado__selo">
                      <Selo />
                    </span>
                  </div>
                  <div className="v-estado__cap">
                    <p className="v-estado__rot">{e.rotulo}</p>
                    <p className="v-estado__txt">{e.texto}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </Reveal>

        <Reveal>
          <h3 className="v-display v-h3" style={{ marginTop: "clamp(32px, 4vw, 52px)" }}>
            {MANUTENCAO_TITULO}
          </h3>
          <p className="v-body" style={{ marginTop: 8, maxWidth: "62ch" }}>
            {MANUTENCAO_TEXTO}
          </p>
          <ul className="v-manut">
            {MANUTENCAO.map((m) => {
              const Icone = ICONE_MANUT[m.icone];
              return (
                <li key={m.titulo}>
                  <Icone />
                  <p className="v-manut__t">{m.titulo}</p>
                  {m.nota ? <p className="v-manut__x">{m.nota}</p> : null}
                </li>
              );
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
