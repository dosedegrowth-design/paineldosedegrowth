export function HeroScene() {
  return (
    <div className="hero-scene" aria-hidden="true">
      {/* Sky gradient base */}
      <div className="hero-sky" />

      {/* Distant stars twinkling */}
      <div className="hero-stars">
        {Array.from({ length: 28 }).map((_, i) => (
          <span
            key={i}
            className="hero-star"
            style={{
              left: `${(i * 137) % 100}%`,
              top: `${(i * 53) % 45}%`,
              animationDelay: `${(i % 7) * 0.4}s`,
              opacity: 0.35 + ((i * 13) % 40) / 100,
            }}
          />
        ))}
      </div>

      {/* Moon */}
      <div className="hero-moon">
        <div className="hero-moon-glow" />
        <div className="hero-moon-body" />
      </div>

      {/* Parallax clouds (3 layers) */}
      <svg className="hero-clouds hero-clouds-far" viewBox="0 0 1600 200" preserveAspectRatio="none">
        <defs>
          <linearGradient id="andreCloudA" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#7dd3fc" stopOpacity="0.18" />
            <stop offset="1" stopColor="#38bdf8" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <g fill="url(#andreCloudA)">
          <ellipse cx="150" cy="120" rx="180" ry="30" />
          <ellipse cx="520" cy="100" rx="220" ry="34" />
          <ellipse cx="920" cy="130" rx="200" ry="28" />
          <ellipse cx="1350" cy="105" rx="240" ry="32" />
        </g>
      </svg>

      <svg className="hero-clouds hero-clouds-mid" viewBox="0 0 1600 240" preserveAspectRatio="none">
        <defs>
          <linearGradient id="andreCloudB" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#bae6fd" stopOpacity="0.22" />
            <stop offset="1" stopColor="#38bdf8" stopOpacity="0.03" />
          </linearGradient>
        </defs>
        <g fill="url(#andreCloudB)">
          <ellipse cx="80" cy="150" rx="140" ry="28" />
          <ellipse cx="220" cy="140" rx="160" ry="32" />
          <ellipse cx="620" cy="160" rx="200" ry="36" />
          <ellipse cx="1050" cy="150" rx="180" ry="30" />
          <ellipse cx="1420" cy="170" rx="220" ry="34" />
        </g>
      </svg>

      <svg className="hero-clouds hero-clouds-near" viewBox="0 0 1600 260" preserveAspectRatio="none">
        <defs>
          <linearGradient id="andreCloudC" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#e0f2fe" stopOpacity="0.28" />
            <stop offset="1" stopColor="#38bdf8" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <g fill="url(#andreCloudC)">
          <ellipse cx="180" cy="200" rx="220" ry="40" />
          <ellipse cx="740" cy="210" rx="260" ry="42" />
          <ellipse cx="1280" cy="195" rx="240" ry="40" />
        </g>
      </svg>

      {/* Snowflakes falling */}
      <div className="hero-snow">
        {Array.from({ length: 24 }).map((_, i) => (
          <span
            key={i}
            className="hero-flake"
            style={{
              left: `${(i * 41) % 100}%`,
              animationDelay: `${(i % 10) * 1.2}s`,
              animationDuration: `${9 + (i % 6) * 1.6}s`,
              opacity: 0.35 + ((i * 17) % 40) / 100,
              transform: `scale(${0.7 + ((i * 7) % 8) / 10})`,
            }}
          />
        ))}
      </div>

      {/* Aurora cold beams */}
      <div className="hero-aurora-sweep" />

      {/* City skyline silhouette */}
      <svg
        className="hero-skyline"
        viewBox="0 0 1600 200"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="andreSkyline" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#050914" stopOpacity="0.85" />
            <stop offset="1" stopColor="#050914" stopOpacity="1" />
          </linearGradient>
        </defs>
        <path
          fill="url(#andreSkyline)"
          d="M0,200 L0,120 L50,120 L50,80 L90,80 L90,110 L130,110 L130,60 L160,60 L160,40 L200,40 L200,90 L250,90 L250,70 L290,70 L290,100 L340,100 L340,50 L380,50 L380,30 L420,30 L420,75 L470,75 L470,95 L520,95 L520,55 L560,55 L560,85 L610,85 L610,45 L650,45 L650,25 L690,25 L690,70 L740,70 L740,100 L790,100 L790,60 L830,60 L830,90 L880,90 L880,50 L920,50 L920,80 L970,80 L970,110 L1020,110 L1020,65 L1060,65 L1060,35 L1100,35 L1100,75 L1150,75 L1150,95 L1200,95 L1200,55 L1240,55 L1240,85 L1290,85 L1290,45 L1330,45 L1330,20 L1370,20 L1370,70 L1420,70 L1420,100 L1470,100 L1470,60 L1510,60 L1510,90 L1560,90 L1560,110 L1600,110 L1600,200 Z"
        />
        {/* Windows glowing */}
        <g fill="#7dd3fc" opacity="0.5">
          <rect x="140" y="65" width="4" height="4" className="hero-window-blink" style={{ animationDelay: "0.3s" }} />
          <rect x="170" y="45" width="4" height="4" className="hero-window-blink" style={{ animationDelay: "1.1s" }} />
          <rect x="390" y="40" width="4" height="4" className="hero-window-blink" style={{ animationDelay: "2.2s" }} />
          <rect x="660" y="30" width="4" height="4" className="hero-window-blink" style={{ animationDelay: "0.7s" }} />
          <rect x="1070" y="45" width="4" height="4" className="hero-window-blink" style={{ animationDelay: "1.8s" }} />
          <rect x="1340" y="30" width="4" height="4" className="hero-window-blink" style={{ animationDelay: "2.5s" }} />
        </g>
      </svg>

      {/* Overlay wash for legibility */}
      <div className="hero-overlay" />
    </div>
  );
}
