/**
 * Ícones do painel — SVG inline, traço de 1.7, canto redondo.
 *
 * De propósito sem lucide-react: o projeto separado (tayssa-lash) não
 * tem essa dependência, e o painel precisa viajar para lá sem reescrita.
 */

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export type IconeNome =
  | "visao"
  | "agenda"
  | "atendimentos"
  | "clientes"
  | "indicacoes"
  | "beneficios"
  | "aniversarios"
  | "fotos"
  | "config"
  | "busca"
  | "recolher"
  | "expandir"
  | "sair"
  | "site"
  | "cilio"
  | "menu"
  | "mais";

const CAMINHOS: Record<IconeNome, React.ReactNode> = {
  menu: <path d="M4 8h16M4 16h11" />,
  mais: (
    <>
      <circle cx="5.5" cy="12" r="1.2" />
      <circle cx="12" cy="12" r="1.2" />
      <circle cx="18.5" cy="12" r="1.2" />
    </>
  ),
  visao: (
    <>
      <rect x="3" y="3" width="7.5" height="8.5" rx="1.5" />
      <rect x="13.5" y="3" width="7.5" height="5.5" rx="1.5" />
      <rect x="13.5" y="11.5" width="7.5" height="9.5" rx="1.5" />
      <rect x="3" y="14.5" width="7.5" height="6.5" rx="1.5" />
    </>
  ),
  agenda: (
    <>
      <rect x="3" y="4.5" width="18" height="16.5" rx="2.5" />
      <path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
      <path d="M8 14h3" />
    </>
  ),
  atendimentos: (
    <>
      <path d="M20.5 7.5 10 18l-5.5-5.5" />
      <path d="M20.5 14.5 10 25" opacity="0" />
    </>
  ),
  clientes: (
    <>
      <circle cx="9" cy="8" r="3.6" />
      <path d="M2.8 20.2c.6-3.4 3.1-5.4 6.2-5.4s5.6 2 6.2 5.4" />
      <path d="M16.5 5.2a3.4 3.4 0 0 1 0 6.6M18 14.9c2.2.6 3.6 2.4 3.9 5.3" />
    </>
  ),
  indicacoes: (
    <>
      <circle cx="6" cy="12" r="2.6" />
      <circle cx="18" cy="6" r="2.6" />
      <circle cx="18" cy="18" r="2.6" />
      <path d="M8.3 10.8 15.7 7.2M8.3 13.2l7.4 3.6" />
    </>
  ),
  beneficios: (
    <>
      <rect x="2.8" y="8.5" width="18.4" height="12.2" rx="2" />
      <path d="M2.8 12.6h18.4M12 8.5v12.2" />
      <path d="M12 8.5C10.6 5.2 9.2 3.6 7.6 3.6a2.2 2.2 0 0 0 0 4.4h4.4zM12 8.5c1.4-3.3 2.8-4.9 4.4-4.9a2.2 2.2 0 0 1 0 4.4H12z" />
    </>
  ),
  aniversarios: (
    <>
      <path d="M3.5 21v-7.2a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2V21" />
      <path d="M2.5 21h19" />
      <path d="M12 11.8V8.4M8 11.8V9.2M16 11.8V9.2" />
      <path d="M12 5.6c0-1 1.2-1.6 1.2-2.6 0-.7-.5-1.2-1.2-1.2s-1.2.5-1.2 1.2c0 1 1.2 1.6 1.2 2.6z" />
    </>
  ),
  fotos: (
    <>
      <rect x="2.8" y="5.5" width="18.4" height="14" rx="2.2" />
      <circle cx="8.6" cy="10.4" r="1.8" />
      <path d="M3.2 17.2 8.4 12.6l4 3.4 3.4-2.8 4.6 4" />
    </>
  ),
  config: (
    <>
      <circle cx="12" cy="12" r="3.1" />
      <path d="M12 2.6v2.6M12 18.8v2.6M21.4 12h-2.6M5.2 12H2.6M18.6 5.4l-1.8 1.8M7.2 16.8l-1.8 1.8M18.6 18.6l-1.8-1.8M7.2 7.2 5.4 5.4" />
    </>
  ),
  busca: (
    <>
      <circle cx="11" cy="11" r="6.6" />
      <path d="m16.2 16.2 4.3 4.3" />
    </>
  ),
  recolher: <path d="M14.5 6 8.5 12l6 6M19 6l-6 6 6 6" />,
  expandir: <path d="m9.5 6 6 6-6 6M5 6l6 6-6 6" />,
  sair: (
    <>
      <path d="M9.5 20.5H5.8a2 2 0 0 1-2-2V5.5a2 2 0 0 1 2-2h3.7" />
      <path d="M16 16.5 20.5 12 16 7.5M20 12H9.2" />
    </>
  ),
  site: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3.3 9.4h17.4M3.3 14.6h17.4" />
      <path d="M12 3c-2.4 2.4-3.6 5.4-3.6 9s1.2 6.6 3.6 9c2.4-2.4 3.6-5.4 3.6-9S14.4 5.4 12 3z" />
    </>
  ),
  cilio: (
    <>
      <path d="M3 15c3.4-4.2 6.6-6.3 9-6.3s5.6 2.1 9 6.3" />
      <path d="M6.4 11.6 5 8.6M12 8.9V5.6M17.6 11.6 19 8.6" />
    </>
  ),
};

export function Icone({ nome, className }: { nome: IconeNome; className?: string }) {
  return (
    <svg {...base} className={className} aria-hidden>
      {CAMINHOS[nome]}
    </svg>
  );
}
