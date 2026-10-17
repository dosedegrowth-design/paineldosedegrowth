/**
 * Ícones das barras flutuantes (app da cliente e painel no celular), no
 * jeito dos símbolos do iPhone: grade de 24, traço 1,7 arredondado e um
 * par para cada um — contorno quando a aba está quieta, cheio quando é a
 * aba atual. Os dois desenhos estão sempre no SVG; o CSS troca um pelo
 * outro com um cruzamento curto (`.tyib[data-cheio]`).
 */

export type IconeBarraNome = "inicio" | "cartao" | "agenda" | "presente" | "perfil" | "grade" | "clientes" | "mais" | "jornada";

type Par = { linha: React.ReactNode; cheio: React.ReactNode };

const CASA =
  "M4.1 10.1 10.9 4.4a1.7 1.7 0 0 1 2.2 0l6.8 5.7c.4.33.6.8.6 1.3v7.1a2 2 0 0 1-2 2h-3.4v-4.9a1.2 1.2 0 0 0-1.2-1.2h-3.8a1.2 1.2 0 0 0-1.2 1.2v4.9H5.5a2 2 0 0 1-2-2v-7.1c0-.5.2-.97.6-1.3z";
const CARTAO = "M6 5.5h12a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-7a3 3 0 0 1 3-3z";
const FOLHA = "M6.7 4.8h10.6a3.2 3.2 0 0 1 3.2 3.2v9.3a3.2 3.2 0 0 1-3.2 3.2H6.7a3.2 3.2 0 0 1-3.2-3.2V8a3.2 3.2 0 0 1 3.2-3.2z";
const LACO =
  "M12 7.9c-1.1-2.5-3-3.8-4.4-3.2-1 .45-.95 1.9.35 2.7.95.5 2.4.5 4.05.5zM12 7.9c1.1-2.5 3-3.8 4.4-3.2 1 .45.95 1.9-.35 2.7-.95.5-2.4.5-4.05.5z";
const BRILHO = "M12 3.6c.5 3.8 1.9 5.9 5.9 6.6-4 .7-5.4 2.8-5.9 6.6-.5-3.8-1.9-5.9-5.9-6.6 4-.7 5.4-2.8 5.9-6.6z";
const quadrado = (x: number, y: number) =>
  `M${x + 2} ${y}h2.6a2 2 0 0 1 2 2v2.6a2 2 0 0 1-2 2H${x + 2}a2 2 0 0 1-2-2V${y + 2}a2 2 0 0 1 2-2z`;

const PARES: Record<IconeBarraNome, Par> = {
  inicio: {
    linha: <path d={CASA} />,
    cheio: <path d={CASA} />,
  },
  cartao: {
    linha: (
      <>
        <path d={CARTAO} />
        <path d="M3 9.9h18M6.8 14.9h3.6" />
      </>
    ),
    cheio: <path fillRule="evenodd" d={`${CARTAO}M3 8.9h18v2.1H3zM6.4 14h4.4v1.8H6.4z`} />,
  },
  agenda: {
    linha: (
      <>
        <path d={FOLHA} />
        <path d="M3.5 9.7h17M8 3.2v3.1M16 3.2v3.1" />
        <path className="tyib__ponto" d="M8 13.5h.01M12 13.5h.01M16 13.5h.01M8 17h.01M12 17h.01" />
      </>
    ),
    cheio: (
      <>
        <path
          fillRule="evenodd"
          d={`${FOLHA}M6.9 12.5h2.2v2.1H6.9zM10.9 12.5h2.2v2.1h-2.2zM14.9 12.5h2.2v2.1h-2.2zM6.9 16h2.2v2.1H6.9zM10.9 16h2.2v2.1h-2.2z`}
        />
        <path className="tyib__traco" d="M8 3.2v3.1M16 3.2v3.1" />
      </>
    ),
  },
  presente: {
    linha: (
      <>
        <path d="M5 7.9h14a1.5 1.5 0 0 1 1.5 1.5v1a1.5 1.5 0 0 1-1.5 1.5H5a1.5 1.5 0 0 1-1.5-1.5v-1A1.5 1.5 0 0 1 5 7.9z" />
        <path d="M5 11.9v6.6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6.6M12 7.9v12.6" />
        <path d={LACO} />
      </>
    ),
    cheio: (
      <>
        <path d="M5 7.9h6.2v4H5a1.5 1.5 0 0 1-1.5-1.5v-1A1.5 1.5 0 0 1 5 7.9zM12.8 7.9H19a1.5 1.5 0 0 1 1.5 1.5v1a1.5 1.5 0 0 1-1.5 1.5h-6.2z" />
        <path d="M5 12.7h6.2v7.8H7a2 2 0 0 1-2-2zM12.8 12.7H19v5.8a2 2 0 0 1-2 2h-4.2z" />
        <path className="tyib__traco" d={LACO} />
      </>
    ),
  },
  perfil: {
    linha: (
      <>
        <circle cx="12" cy="8.2" r="3.7" />
        <path d="M4.9 20.1c.6-3.6 3.5-5.6 7.1-5.6s6.5 2 7.1 5.6" />
      </>
    ),
    cheio: (
      <>
        <circle cx="12" cy="8.2" r="4.1" />
        <path d="M4.5 20.2c.5-3.9 3.6-6.2 7.5-6.2s7 2.3 7.5 6.2a.9.9 0 0 1-.9 1H5.4a.9.9 0 0 1-.9-1z" />
      </>
    ),
  },
  grade: {
    linha: <path d={[quadrado(3.8, 3.8), quadrado(13.6, 3.8), quadrado(3.8, 13.6), quadrado(13.6, 13.6)].join("")} />,
    cheio: <path d={[quadrado(3.8, 3.8), quadrado(13.6, 3.8), quadrado(3.8, 13.6), quadrado(13.6, 13.6)].join("")} />,
  },
  clientes: {
    linha: (
      <>
        <circle cx="9" cy="8.6" r="3.3" />
        <path d="M2.9 19.7c.5-3.3 3-5.2 6.1-5.2s5.6 1.9 6.1 5.2" />
        <path d="M15.3 5.5a3.1 3.1 0 1 1 1 6M17.5 14.6c2.1.5 3.4 2.1 3.7 4.6" />
      </>
    ),
    cheio: (
      <>
        <circle cx="9" cy="8.6" r="3.7" />
        <path d="M2.5 19.8c.5-3.6 3.1-5.8 6.5-5.8s6 2.2 6.5 5.8a.9.9 0 0 1-.9 1H3.4a.9.9 0 0 1-.9-1z" />
        <path className="tyib__traco" d="M15.3 5.5a3.1 3.1 0 1 1 1 6M17.5 14.6c2.1.5 3.4 2.1 3.7 4.6" />
      </>
    ),
  },
  jornada: {
    linha: (
      <>
        <path d={BRILHO} />
        <path d="M18.4 15.6c.2 1.4.7 2.2 2.1 2.4-1.4.3-1.9 1-2.1 2.4-.2-1.4-.7-2.1-2.1-2.4 1.4-.2 1.9-1 2.1-2.4z" />
      </>
    ),
    cheio: (
      <>
        <path d={BRILHO} />
        <path d="M18.4 15.6c.2 1.4.7 2.2 2.1 2.4-1.4.3-1.9 1-2.1 2.4-.2-1.4-.7-2.1-2.1-2.4 1.4-.2 1.9-1 2.1-2.4z" />
      </>
    ),
  },
  mais: {
    linha: (
      <>
        <circle cx="12" cy="12" r="8.7" />
        <path className="tyib__ponto" d="M8 12h.01M12 12h.01M16 12h.01" />
      </>
    ),
    cheio: (
      <path
        fillRule="evenodd"
        d="M12 3.1a8.9 8.9 0 1 1 0 17.8 8.9 8.9 0 0 1 0-17.8zM8 10.8a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4zm4 0a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4zm4 0a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4z"
      />
    ),
  },
};

export function IconeBarra({ nome, cheio = false }: { nome: IconeBarraNome; cheio?: boolean }) {
  const par = PARES[nome];
  return (
    <svg className="tyib" viewBox="0 0 24 24" aria-hidden data-cheio={cheio || undefined}>
      <g className="tyib__linha">{par.linha}</g>
      <g className="tyib__cheio">{par.cheio}</g>
    </svg>
  );
}
