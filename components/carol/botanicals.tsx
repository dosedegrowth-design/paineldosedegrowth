/* Elementos botânicos decorativos em line-art — alecrim, eucalipto e
   florzinhas delicadas ("nada muito colorido", pedido da Carol).
   Herdam a cor via currentColor; controlar tom/opacidade no parent. */

interface BotanicalProps {
  className?: string;
}

/* Raminho de alecrim — caule com agulhas alternadas */
export function SprigRosemary({ className }: BotanicalProps) {
  const agulhas: string[] = [];
  for (let i = 0; i < 9; i++) {
    const y = 178 - i * 19;
    const len = 22 - i * 1.4;
    const sobe = 12 + i * 0.6;
    agulhas.push(
      `M60 ${y} L${60 - len} ${y - sobe}`,
      `M60 ${y - 9} L${60 + len - 3} ${y - 9 - sobe}`
    );
  }
  return (
    <svg
      viewBox="0 0 120 200"
      fill="none"
      aria-hidden
      className={className}
    >
      <path
        d="M60 196 C 57 150, 63 90, 59 6"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {agulhas.map((d) => (
        <path
          key={d}
          d={d}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}

/* Ramo de eucalipto — caule curvo com folhas redondas alternadas */
export function BranchEucalyptus({ className }: BotanicalProps) {
  const folhas = [
    { cx: 40, cy: 170, r: 11 },
    { cx: 76, cy: 148, r: 12 },
    { cx: 38, cy: 124, r: 12 },
    { cx: 78, cy: 100, r: 13 },
    { cx: 40, cy: 76, r: 12 },
    { cx: 76, cy: 52, r: 11 },
    { cx: 46, cy: 30, r: 10 },
    { cx: 64, cy: 12, r: 8 },
  ];
  return (
    <svg viewBox="0 0 120 200" fill="none" aria-hidden className={className}>
      <path
        d="M58 198 C 54 160, 66 110, 56 60 C 52 38, 60 18, 62 4"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {folhas.map((f) => (
        <circle
          key={`${f.cx}-${f.cy}`}
          cx={f.cx}
          cy={f.cy}
          r={f.r}
          stroke="currentColor"
          strokeWidth="2"
        />
      ))}
    </svg>
  );
}

/* Florzinha de cinco pétalas em line-art */
export function FlowerSimple({ className }: BotanicalProps) {
  return (
    <svg viewBox="0 0 80 80" fill="none" aria-hidden className={className}>
      {[0, 72, 144, 216, 288].map((ang) => (
        <ellipse
          key={ang}
          cx="40"
          cy="22"
          rx="9"
          ry="15"
          stroke="currentColor"
          strokeWidth="2"
          transform={`rotate(${ang} 40 40)`}
        />
      ))}
      <circle cx="40" cy="40" r="6" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

/* Composição de canto — flor + raminhos, pra vestir seções */
export function BotanicalCorner({ className }: BotanicalProps) {
  return (
    <div className={className} aria-hidden>
      <div className="relative h-full w-full">
        <SprigRosemary className="absolute bottom-0 left-0 h-[72%] rotate-[-14deg]" />
        <BranchEucalyptus className="absolute bottom-2 left-12 h-[88%] rotate-[10deg]" />
        <FlowerSimple className="absolute bottom-1 left-2 h-12 w-12" />
      </div>
    </div>
  );
}
