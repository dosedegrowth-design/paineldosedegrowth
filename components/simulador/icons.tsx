/**
 * Ícones inline (SVG) do simulador — simples, objetivos, sem biblioteca.
 * Traço 2px, pontas arredondadas, 24×24. Todos decorativos: `aria-hidden`.
 */
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Stroke({ size = 20, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </Stroke>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </Stroke>
  );
}

export function AlertIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M12 3.5l9.5 16.5h-19L12 3.5Z" />
      <path d="M12 10v4.5" />
      <path d="M12 17.5h.01" />
    </Stroke>
  );
}

export function InfoIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <path d="M12 7.5h.01" />
    </Stroke>
  );
}

export function RefreshIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M20 12a8 8 0 1 1-2.34-5.66" />
      <path d="M20 4v5h-5" />
    </Stroke>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M6 9l6 6 6-6" />
    </Stroke>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </Stroke>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </Stroke>
  );
}

/** Formulário / ficha de dados. */
export function FormIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <rect x="4.5" y="3.5" width="15" height="17" rx="2" />
      <path d="M8.5 8.5h7" />
      <path d="M8.5 12h7" />
      <path d="M8.5 15.5h4" />
    </Stroke>
  );
}

/** Documento de identificação. */
export function IdIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="8.5" cy="11" r="2" />
      <path d="M5.5 16c.6-1.5 1.7-2.2 3-2.2s2.4.7 3 2.2" />
      <path d="M14 9.5h4" />
      <path d="M14 13h4" />
    </Stroke>
  );
}

/** Cálculo / estimativa. */
export function CalcIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M8.5 7h7" />
      <path d="M8.5 11.5h.01" />
      <path d="M12 11.5h.01" />
      <path d="M15.5 11.5h.01" />
      <path d="M8.5 15h.01" />
      <path d="M12 15h.01" />
      <path d="M15.5 15v3" />
    </Stroke>
  );
}

/** Atendimento / conversa. */
export function ChatIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M4 5.5h16v10H9l-4 3.5v-3.5H4z" />
      <path d="M8 9.5h8" />
      <path d="M8 12.5h5" />
    </Stroke>
  );
}

/** Logo do WhatsApp (traçado oficial simplificado), preenchido com a cor do texto. */
export function WhatsappIcon({ size = 22, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

/**
 * Emblema próprio da plataforma: quadrado branco com borda verde e três
 * barras nas cores nacionais (verde, amarelo, azul). Sem brasão, sem
 * qualquer elemento de identidade de órgão público.
 */
export function BrandMark({ size = 36, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <rect x="1" y="1" width="34" height="34" rx="6" fill="#ffffff" stroke="#1b7a3f" strokeWidth="2" />
      <rect x="9" y="10" width="18" height="4" rx="2" fill="#1b7a3f" />
      <rect x="9" y="16" width="13" height="4" rx="2" fill="#e5b800" />
      <rect x="9" y="22" width="9" height="4" rx="2" fill="#0f4c8f" />
    </svg>
  );
}

/** Spinner discreto pros estados de carregamento em botões. */
export function SpinnerIcon({ size = 20, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className="sim-spin"
      {...rest}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.5" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
