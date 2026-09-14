import { GOOGLE, RELATOS } from "@/lib/prova-social";
import { Estrela, Google as GoogleIcon } from "@/components/ui/icones";
import { Reveal } from "@/components/ui/reveal";

/**
 * Selo do Google + relatos reais do Google Meu Negócio.
 *
 * Enquanto a VIVA não passar o perfil e os relatos, o bloco mostra o slot
 * a preencher — do mesmo jeito honesto das fotos. Depoimento não se
 * inventa.
 */
export function ProvaGoogle() {
  const temSelo = GOOGLE.nota !== null && GOOGLE.total !== null;

  return (
    <section className="v-section v-section--tight" aria-labelledby="google-titulo">
      <div className="v-wrap">
        <Reveal className="v-google">
          <div>
            <p className="v-eyebrow" id="google-titulo">
              Quem já foi atendido
            </p>
            <div className="v-selo-google" style={{ marginTop: 14 }}>
              <GoogleIcon className="" />
              {temSelo ? (
                <div>
                  <p style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className="v-selo-google__nota">
                      {GOOGLE.nota?.toFixed(1).replace(".", ",")}
                    </span>
                    <Estrelas nota={GOOGLE.nota ?? 0} />
                  </p>
                  <p style={{ fontSize: 13.5, color: "var(--v-on-dark-faint)" }}>
                    {GOOGLE.total} avaliações no Google
                  </p>
                </div>
              ) : (
                <div>
                  <p className="v-vazio__tag">Selo do Google · a preencher</p>
                  <p className="v-vazio__txt" style={{ marginTop: 4 }}>
                    Nota, total de avaliações e link do perfil.
                  </p>
                </div>
              )}
            </div>
            {GOOGLE.perfilUrl ? (
              <p style={{ marginTop: 12 }}>
                <a
                  href={GOOGLE.perfilUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="v-body"
                  style={{ textDecoration: "underline" }}
                >
                  Ver todas no Google
                </a>
              </p>
            ) : null}
          </div>

          <ul className="v-relatos">
            {RELATOS.length > 0
              ? RELATOS.map((r) => (
                  <li className="v-relato" key={`${r.autor}-${r.texto.slice(0, 12)}`}>
                    <Estrelas nota={r.nota} />
                    <p className="v-relato__texto">“{r.texto}”</p>
                    <p className="v-relato__autor">
                      {r.autor}
                      {r.quando ? ` · ${r.quando}` : ""}
                    </p>
                  </li>
                ))
              : Array.from({ length: 3 }).map((_, i) => (
                  <li className="v-vazio" key={i}>
                    <span className="v-vazio__tag">Relato {i + 1} · a preencher</span>
                    <span className="v-vazio__txt">
                      Copiar uma avaliação real do perfil da VIVA no Google. Sem
                      reescrever, sem inventar.
                    </span>
                  </li>
                ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

function Estrelas({ nota }: { nota: number }) {
  const cheias = Math.round(nota);
  return (
    <span className="v-estrelas" aria-label={`${nota} de 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Estrela key={i} className={i < cheias ? "" : "v-estrela--off"} />
      ))}
    </span>
  );
}
