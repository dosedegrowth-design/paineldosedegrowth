/** Barra de progresso linear (0–1) com porcentagem e a etapa atual. */
export function ProgressBar({
  value,
  label,
  status,
}: {
  value: number;
  label: string;
  status: string;
}) {
  const percent = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div
      className="sim-progress"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      aria-valuetext={`${percent}% — ${status}`}
    >
      <div className="sim-progress__track">
        <div className="sim-progress__fill" style={{ width: `${percent}%` }} />
      </div>
      <div className="sim-progress__meta" aria-hidden="true">
        <strong>{percent}%</strong>
        <span>{status}</span>
      </div>
    </div>
  );
}
