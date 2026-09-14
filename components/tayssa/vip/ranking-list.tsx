import type { RankingRow } from "@/lib/tayssa/queries/vip";

/** Ranking em vizinhança: quem está perto de você, sem expor ninguém. */
export function RankingList({ rows }: { rows: RankingRow[] }) {
  if (!rows.length) return <p className="tyv-empty">O ranking começa na sua primeira visita confirmada.</p>;
  return (
    <div className="tyv-rank">
      {rows.map((r) => (
        <div key={`${r.position}-${r.name}`} className="tyv-rank__row" data-me={r.me || undefined}>
          <span className="tyv-rank__pos">{String(r.position).padStart(2, "0")}</span>
          <span className="tyv-rank__name">{r.me ? "Você" : r.name}</span>
          <span className="tyv-rank__pts">{r.points}</span>
        </div>
      ))}
    </div>
  );
}
