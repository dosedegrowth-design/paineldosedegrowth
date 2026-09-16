/** A forma do painel enquanto os dados chegam. Nenhum número inventado. */
export default function AdminLoading() {
  return (
    <div aria-busy="true" aria-label="Carregando" style={{ paddingBlock: "clamp(28px, 4vw, 56px)" }}>
      <span className="ty-skel" style={{ width: 120, height: 10 }} />
      <span className="ty-skel" style={{ width: "42%", height: 38, marginTop: 18 }} />
      <span className="ty-skel" style={{ width: "60%", height: 16, marginTop: 14 }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 28, marginTop: 44 }}>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="ty-skel" style={{ height: 64 }} />
        ))}
      </div>
      <span className="ty-skel" style={{ height: 220, marginTop: 44 }} />
    </div>
  );
}
