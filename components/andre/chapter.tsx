/* Overline editorial de capítulo — substitui chips genéricos */
export function Chapter({ n, label }: { n: string; label: string }) {
  return (
    <div className="inline-flex items-center gap-3">
      <span className="font-mono text-xs text-sky-400/90 tabular-nums">{n}</span>
      <span className="h-px w-10 bg-sky-400/30" />
      <span className="text-[11px] tracking-[0.32em] uppercase text-slate-400 font-bold">
        {label}
      </span>
    </div>
  );
}
