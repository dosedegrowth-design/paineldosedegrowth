/* Camada decorativa de fundo pra seções — compõe os utilitários CSS que
   já existem (aurora, grid neon, estrelas piscantes, flocos subindo) em
   doses variáveis por página. Tudo animação CSS: zero JavaScript.
   Posições determinísticas (série de Weyl) pra não quebrar hidratação. */

export function SectionFX({
  aurora = false,
  grid = false,
  stars = 0,
  flakes = 0,
  flip = false,
}: {
  aurora?: boolean;
  grid?: boolean;
  stars?: number;
  flakes?: number;
  /** inverte a aurora (glow embaixo em vez de em cima) */
  flip?: boolean;
}) {
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      aria-hidden
    >
      {aurora && (
        <div
          className="absolute inset-0 andre-aurora"
          style={flip ? { transform: "rotate(180deg)" } : undefined}
        />
      )}
      {grid && <div className="absolute inset-0 andre-grid-bg" />}
      {Array.from({ length: stars }, (_, i) => (
        <span
          key={`s${i}`}
          className="andre-star"
          style={{
            left: `${(i * 137.5 + 19) % 100}%`,
            top: `${(i * 61.8 + 11) % 92}%`,
            animationDelay: `${((i * 137.5) % 38) / 10}s`,
          }}
        />
      ))}
      {Array.from({ length: flakes }, (_, i) => (
        <span
          key={`f${i}`}
          className="andre-rise-flake"
          style={{
            left: `${(i * 137.5 + 7) % 100}%`,
            animationDuration: `${9 + ((i * 73.3) % 70) / 10}s`,
            animationDelay: `${((i * 41.7) % 90) / 10}s`,
          }}
        />
      ))}
    </div>
  );
}
