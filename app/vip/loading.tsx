/**
 * Enquanto os dados da cliente chegam: a forma da tela — cumprimento,
 * cartão, números, lista — sem inventar nenhum valor.
 */
export default function VipLoading() {
  return (
    <div className="tyv-skel-page" aria-busy="true" aria-label="Carregando">
      <span className="tyv-skel" style={{ width: "58%", height: 34, marginTop: 14 }} />
      <span className="tyv-skel" style={{ width: "84%", height: 16, marginTop: 12 }} />
      <span className="tyv-skel tyv-skel--card" />
      <div className="tyv-kpis">
        <span className="tyv-skel" style={{ height: 196, borderRadius: "var(--tyv-radius)" }} />
        <div className="tyv-kpi-col">
          <span className="tyv-skel" style={{ height: 92, borderRadius: "var(--tyv-radius)" }} />
          <span className="tyv-skel" style={{ height: 92, borderRadius: "var(--tyv-radius)" }} />
        </div>
      </div>
      <span className="tyv-skel" style={{ height: 56, borderRadius: 14, marginTop: 28 }} />
      <span className="tyv-skel" style={{ height: 180, borderRadius: "var(--tyv-radius)", marginTop: 28 }} />
    </div>
  );
}
