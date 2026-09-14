/**
 * Ícones. Traço único, 24×24, herdando a cor do texto.
 *
 * Existem para marcar função (área, selo, item de manutenção), não para
 * decorar — e nunca no lugar de uma fotografia de obra.
 */

type P = { className?: string };

const linha = {
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function Svg({ className, children }: P & { children: React.ReactNode }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden {...linha}>
      {children}
    </svg>
  );
}

/* ---------- navegação ---------- */

export function Seta({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 44 12" fill="none" aria-hidden>
      <path d="M0 6h40" stroke="currentColor" strokeWidth="2" />
      <path d="M35 1l6 5-6 5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function SetaBaixo({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 18 44" fill="none" aria-hidden>
      <path d="M9 0v38" stroke="currentColor" strokeWidth="2" />
      <path d="M2 33l7 8 7-8" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function Check({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm5 7.4-6.1 6.1a1 1 0 0 1-1.42 0L6.6 12.6a1 1 0 0 1 1.42-1.42l2.17 2.18 5.39-5.4A1 1 0 0 1 17 9.4Z" />
    </svg>
  );
}

export function Alerta({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2 1 21h22L12 2Zm0 6a1 1 0 0 1 1 1v5a1 1 0 0 1-2 0V9a1 1 0 0 1 1-1Zm0 9.2a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Z" />
    </svg>
  );
}

export function Whatsapp({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12.04 2C6.6 2 2.2 6.4 2.2 11.84c0 1.94.53 3.75 1.45 5.3L2 22l4.98-1.6a9.8 9.8 0 0 0 5.06 1.4c5.43 0 9.84-4.4 9.84-9.84C21.89 6.4 17.48 2 12.04 2Zm0 17.96a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.1 1 1.02-3.02-.2-.31a8.13 8.13 0 0 1-1.25-4.36c0-4.52 3.68-8.2 8.2-8.2 2.19 0 4.25.86 5.8 2.4a8.15 8.15 0 0 1 2.4 5.8c0 4.53-3.68 8.2-8.2 8.2Zm4.5-6.14c-.25-.13-1.46-.72-1.68-.8-.23-.08-.39-.13-.56.12-.16.25-.64.8-.78.97-.15.16-.29.18-.53.06-.25-.13-1.04-.39-1.98-1.23-.73-.65-1.23-1.46-1.37-1.7-.14-.25-.02-.38.11-.5.11-.11.25-.3.37-.44.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.44-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.41-.56-.42h-.48c-.16 0-.43.06-.65.31-.22.25-.85.84-.85 2.04s.87 2.37.99 2.53c.12.16 1.71 2.61 4.15 3.66.58.25 1.03.4 1.38.51.58.19 1.11.16 1.53.1.47-.07 1.46-.6 1.66-1.18.2-.57.2-1.07.14-1.17-.06-.1-.22-.16-.47-.29Z" />
    </svg>
  );
}

/* ---------- as cinco áreas ---------- */

export function IconeBomba({ className }: P) {
  return (
    <Svg className={className}>
      <rect x="3" y="9" width="10" height="8" rx="1" />
      <path d="M13 11h3a3 3 0 0 1 3 3v3M8 9V6h4M6 17v2M10 17v2M19 17h2M17 17h-2" />
    </Svg>
  );
}

export function IconeAlarme({ className }: P) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function IconeRaio({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M13.5 2 5 13.2h5.2L9.6 22 19 10.4h-5.4L13.5 2Z" />
    </svg>
  );
}

export function IconeDocumento({ className }: P) {
  return (
    <Svg className={className}>
      <path d="M6 2.8h8l4.2 4.2v14.2H6z" />
      <path d="M14 2.8V7h4.2M9 12h6M9 15.5h6M9 8.5h2" />
    </Svg>
  );
}

export function IconeExtintor({ className }: P) {
  return (
    <Svg className={className}>
      <path d="M9 7.5h5v13.7H9z" />
      <path d="M10 7.5V5.6h3v1.9M14 8.5h3.2V6M17.2 6 15 4" />
    </Svg>
  );
}

const AREA_ICONES = {
  bomba: IconeBomba,
  alarme: IconeAlarme,
  raio: IconeRaio,
  documento: IconeDocumento,
  extintor: IconeExtintor,
} as const;

export type AreaIconeNome = keyof typeof AREA_ICONES;

export function IconeArea({ nome, className }: { nome: AreaIconeNome } & P) {
  const C = AREA_ICONES[nome];
  return <C className={className} />;
}

/* ---------- selos e institucional ---------- */

export function Engrenagem({ className }: P) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2.6v2.6M12 18.8v2.6M21.4 12h-2.6M5.2 12H2.6M18.6 5.4l-1.8 1.8M7.2 16.8l-1.8 1.8M18.6 18.6l-1.8-1.8M7.2 7.2 5.4 5.4" />
    </Svg>
  );
}

export function Escudo({ className }: P) {
  return (
    <Svg className={className}>
      <path d="M12 2.6 4.4 5.8v6c0 4.6 3.1 8.5 7.6 9.6 4.5-1.1 7.6-5 7.6-9.6v-6L12 2.6Z" />
      <path d="m8.8 12 2.2 2.2 4.2-4.4" />
    </Svg>
  );
}

export function Pessoas({ className }: P) {
  return (
    <Svg className={className}>
      <circle cx="9" cy="8.4" r="3" />
      <path d="M3.4 19.4c0-3.1 2.5-5.6 5.6-5.6s5.6 2.5 5.6 5.6" />
      <path d="M16.2 6.2a3 3 0 0 1 0 5.6M17.6 14.4c2 .7 3.4 2.6 3.4 5" />
    </Svg>
  );
}

export function Predio({ className }: P) {
  return (
    <Svg className={className}>
      <path d="M3.4 21h17.2M5.4 21V4.2h8.2V21M13.6 21V9.4h5V21" />
      <path d="M8 7.6h3M8 11h3M8 14.4h3M15.8 12.4h1M15.8 16h1" />
    </Svg>
  );
}

export function Prancheta({ className }: P) {
  return (
    <Svg className={className}>
      <rect x="4.6" y="4" width="14.8" height="17" rx="1.4" />
      <path d="M9 4V2.6h6V4M8.6 10h6.8M8.6 13.6h6.8M8.6 17.2h4" />
    </Svg>
  );
}

export function Camera({ className }: P) {
  return (
    <Svg className={className}>
      <path d="M3 8.4h3.4L8 6h8l1.6 2.4H21V19H3z" />
      <circle cx="12" cy="13.4" r="3.4" />
    </Svg>
  );
}

export function Lupa({ className }: P) {
  return (
    <Svg className={className}>
      <circle cx="11" cy="11" r="6.4" />
      <path d="m15.8 15.8 4.6 4.6" />
    </Svg>
  );
}

export function Grafico({ className }: P) {
  return (
    <Svg className={className}>
      <path d="M4 20h16M7 20v-6M12 20V7M17 20v-9" />
    </Svg>
  );
}

export function Chave({ className }: P) {
  return (
    <Svg className={className}>
      <path d="M14.2 6.8a3.6 3.6 0 0 1 4.8 4.6l-9 9-3.4-3.4 9-9Z" />
      <path d="m4.6 19.4 1.4-1.4" />
    </Svg>
  );
}

/* ---------- itens de manutenção ---------- */

export function Mangueira({ className }: P) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3.6" />
    </Svg>
  );
}

export function Luz({ className }: P) {
  return (
    <Svg className={className}>
      <rect x="3" y="8.6" width="18" height="6.8" rx="1.2" />
      <path d="M7.4 8.6v6.8M16.6 8.6v6.8" />
    </Svg>
  );
}

export function Saida({ className }: P) {
  return (
    <Svg className={className}>
      <path d="M13.6 3.4H4.6v17.2h9" />
      <path d="M11 12h9M16.6 8.4 20.2 12l-3.6 3.6" />
    </Svg>
  );
}

export function Hidrante({ className }: P) {
  return (
    <Svg className={className}>
      <path d="M8.4 21h7.2M9.4 21V9.4h5.2V21" />
      <path d="M9.4 9.4a2.6 2.6 0 0 1 5.2 0M11 6.8V4.4h2v2.4M7 13h2.4M14.6 13H17" />
    </Svg>
  );
}

export function Porta({ className }: P) {
  return (
    <Svg className={className}>
      <rect x="5.6" y="3" width="12.8" height="18" rx="1" />
      <path d="M14.6 12h.01" />
    </Svg>
  );
}

/* ---------- prova social ---------- */

export function Estrela({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="m12 2 2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.3 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8L12 2Z" />
    </svg>
  );
}

export function Google({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M21.6 12.23c0-.68-.06-1.34-.17-1.96H12v3.71h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.74 2.98-4.3 2.98-7.27Z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.43l-3.24-2.5c-.9.6-2.04.96-3.38.96-2.6 0-4.8-1.76-5.6-4.12H3.07v2.58A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.4 13.91a6 6 0 0 1 0-3.82V7.5H3.07a10 10 0 0 0 0 9l3.33-2.59Z" />
      <path fill="#EA4335" d="M12 5.98c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.93 5.5L6.4 10.1c.8-2.37 3-4.12 5.6-4.12Z" />
    </svg>
  );
}
