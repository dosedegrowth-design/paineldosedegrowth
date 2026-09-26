const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Indicador circular de progresso (0–1) com a porcentagem no centro. */
export function ProgressRing({
  value,
  label,
  size = 132,
}: {
  value: number;
  label: string;
  size?: number;
}) {
  const clamped = Math.min(1, Math.max(0, value));
  const percent = Math.round(clamped * 100);
  return (
    <div
      className="sim-ring"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 120 120" className="sim-ring__svg" aria-hidden="true" focusable="false">
        <circle className="sim-ring__track" cx="60" cy="60" r={RADIUS} />
        <circle
          className="sim-ring__arc"
          cx="60"
          cy="60"
          r={RADIUS}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - clamped)}
        />
      </svg>
      <span className="sim-ring__orbit" aria-hidden="true" />
      <span className="sim-ring__value" aria-hidden="true">
        {percent}
        <small>%</small>
      </span>
    </div>
  );
}
