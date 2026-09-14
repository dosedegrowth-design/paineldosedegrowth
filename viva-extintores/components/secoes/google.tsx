import { GOOGLE, RELATOS } from "@/lib/prova-social";
import { Estrela, Google as GoogleIcon } from "@/components/ui/icones";
import { Reveal } from "@/components/ui/reveal";

/**
 * Selo do Google + relatos reais do Google Meu Negócio.
 *
 * Cada relato é copiado de uma avaliação real do perfil da VIVA. Enquanto
 * a lista estiver vazia, o bloco mostra o espaço a preencher — depoimento
 * não se escreve, se copia.
 */
export function ProvaGoogle() {
  const temSelo = GOOGLE.nota !== null && GOOGLE.total !== null;

  return (
    <section className="v-section" aria-labelledby="google-titulo">
      <div className="v-wrap">
        <h2 className="v-eyebrow" id="google-titulo">
          Quem já foi atendido
        </h2>

        <Reveal>
          <div className="v-card" style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <GoogleIcon className="v-google-logo" />
            {temSelo ? (
              <div>
                <p style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="v-selo__n">{GOOGLE.nota?.toFixed(1).replace(".", ",")}</span>
                  <Estrelas nota={GOOGLE.nota ?? 0} />
                </p>
                <p className="v-card__x">{GOOGLE.total} avaliações no Google</p>
              </div>
            ) : (
              <div>
                <span className="v-vazio__tag">Selo do Google · a preencher</span>
                <span className="v-vazio__txt">Nota, total de avaliações e link do perfil.</span>
              </div>
            )}
            {GOOGLE.perfilUrl ? (
              <a
                href={GOOGLE.perfilUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="v-card__link"
                style={{ marginInlineStart: "auto" }}
              >
                Ver todas no Google
              </a>
            ) : null}
          </div>

          <ul className="v-cards">
            {RELATOS.length > 0
              ? RELATOS.map((r) => (
                  <li className="v-card" key={`${r.autor}-${r.texto.slice(0, 12)}`}>
                    <Estrelas nota={r.nota} />
                    <p className="v-card__x">“{r.texto}”</p>
                    <p className="v-card__t" style={{ fontSize: 15, marginTop: 12 }}>
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
        <Estrela key={i} className={i < cheias ? "v-estrela--on" : "v-estrela--off"} />
      ))}
    </span>
  );
}
