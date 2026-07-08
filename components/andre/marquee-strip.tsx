const items = [
  "Desde 1985",
  "Projetos de climatização",
  "Instalação",
  "Manutenção",
  "Hospitalar",
  "Industrial",
  "Sala limpa",
  "Comercial",
  "Residencial",
  "VRF · VRV · Chiller",
];

export function MarqueeStrip() {
  const row = [...items, ...items];
  return (
    <div className="andre-marquee relative z-10 py-3" aria-hidden>
      <div className="andre-marquee-track">
        {row.map((it, i) => (
          <span
            key={i}
            className="font-tech text-[10.5px] uppercase tracking-[0.3em] text-[var(--andre-muted)] px-7 whitespace-nowrap inline-flex items-center gap-7"
          >
            {it}
            <span className="text-[var(--andre-primary)]">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
