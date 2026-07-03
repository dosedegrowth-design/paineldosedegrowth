const items = [
  "INSTALAÇÃO_SPLIT",
  "HIGIENIZAÇÃO_PROFUNDA",
  "RECARGA_R-410A",
  "MANUTENÇÃO_PREVENTIVA",
  "REPARO_DE_PLACA",
  "ATENDIMENTO_24H",
  "GARANTIA_90_DIAS",
  "VRF_/_MULTI_SPLIT",
];

export function TickerTape({ reverse = false }: { reverse?: boolean }) {
  const row = [...items, ...items];
  return (
    <div className="andre-ticker" data-reverse={reverse}>
      <div className="andre-ticker-track">
        {row.map((it, i) => (
          <span key={i} className="andre-ticker-item">
            {it} <span className="andre-ticker-sep">❄</span>
          </span>
        ))}
      </div>
    </div>
  );
}
