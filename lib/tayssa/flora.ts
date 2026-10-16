/**
 * Flora — a flor da casa.
 *
 * O desenho parte da flor pintada na parede do estúdio da Tayssa: flor
 * grande vista de lado, pétalas longas e chapadas em magenta-ameixa, com
 * faixas de tom (uma borda clara, uma sombra perto da base) em vez de
 * degradê — pintura de parede, não foto. Aqui ela vira vetor: é peça da
 * identidade, nunca se passa por trabalho da Tayssa.
 *
 * Tudo é determinístico: a mesma semente gera a mesma flor no servidor e
 * no navegador (sem divergência de hidratação). Números saem com 2 casas.
 */

export type FlowerKind = "flor" | "botao";

/** Quatro tons por cor, como na pintura: luz, claro, base e sombra. */
export type Tom = { luz: string; claro: string; base: string; sombra: string };

export const FLORA_TONS = {
  /** a cor da flor da parede do estúdio */
  magenta: { luz: "#d98bb0", claro: "#b8578a", base: "#933b6c", sombra: "#5c1d42" },
  /** a cor da marca */
  vinho: { luz: "#c46a83", claro: "#94304d", base: "#6d1530", sombra: "#3d0819" },
  bordo: { luz: "#a8455f", claro: "#7a1f38", base: "#56102a", sombra: "#2c0512" },
  rosa: { luz: "#f1c4d2", claro: "#dd94ab", base: "#c06c88", sombra: "#8f3f5c" },
  /** quase branca: mora atrás da tipografia vinho sem brigar com ela */
  pétala: { luz: "#fbf0f3", claro: "#f3dde4", base: "#e8c6d1", sombra: "#d3a2b3" },
} satisfies Record<string, Tom>;

export type FloraTom = keyof typeof FLORA_TONS;

/** Uma pétala pronta para pintar: as camadas, na ordem. */
export type Petal = {
  /** rotação em graus em torno da base da flor (0,0) */
  a: number;
  /** 0 = fileira de trás … 1 = frente */
  k: number;
  camadas: { d: string; fill: string; opacity?: number }[];
};

/** mulberry32 — gerador pequeno e determinístico */
export function seeded(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const f = (n: number) => (Math.round(n * 100) / 100).toString();

/**
 * Pétala longa, apontando para cima, base em (0, -o). `w` é meia largura,
 * `l` o comprimento, `inc` inclina a ponta para um lado (a pétala da
 * parede nunca é simétrica). Devolve o corpo, a faixa clara da borda e a
 * sombra perto da base.
 */
function petala(l: number, w: number, inc: number, o: number) {
  const y0 = -o;
  const P = (x: number, y: number) => `${f(x)} ${f(y0 + y)}`;
  const tx = inc * w;
  const corpo = [
    `M${P(0, 0)}`,
    `C${P(w * 0.95, -l * 0.12)} ${P(w * 1.2 + tx * 0.4, -l * 0.62)} ${P(w * 0.42 + tx, -l * 0.95)}`,
    `Q${P(w * 0.12 + tx, -l * 1.03)} ${P(tx * 1.1, -l)}`,
    `C${P(-w * 0.55 + tx * 0.6, -l * 0.9)} ${P(-w * 1.1, -l * 0.5)} ${P(-w * 0.78, -l * 0.14)}`,
    `Q${P(-w * 0.45, -l * 0.02)} ${P(0, 0)}Z`,
  ].join(" ");
  // faixa clara: lua fina colada na borda direita
  const borda = [
    `M${P(w * 0.25, -l * 0.07)}`,
    `C${P(w * 0.95, -l * 0.17)} ${P(w * 1.12 + tx * 0.4, -l * 0.6)} ${P(w * 0.42 + tx, -l * 0.94)}`,
    `C${P(w * 0.7 + tx * 0.3, -l * 0.62)} ${P(w * 0.62, -l * 0.28)} ${P(w * 0.25, -l * 0.07)}Z`,
  ].join(" ");
  // pincelada clara ao longo da pétala (a listra da pintura)
  const listra = [
    `M${P(-w * 0.12, -l * 0.2)}`,
    `C${P(-w * 0.02, -l * 0.45)} ${P(-w * 0.05 + tx * 0.5, -l * 0.7)} ${P(tx * 0.6, -l * 0.9)}`,
    `C${P(-w * 0.28 + tx * 0.4, -l * 0.7)} ${P(-w * 0.34, -l * 0.42)} ${P(-w * 0.12, -l * 0.2)}Z`,
  ].join(" ");
  // sombra: onde a pétala nasce
  const sombra = [
    `M${P(0, 0)}`,
    `C${P(w * 0.55, -l * 0.08)} ${P(w * 0.5, -l * 0.3)} ${P(w * 0.05, -l * 0.42)}`,
    `C${P(-w * 0.5, -l * 0.3)} ${P(-w * 0.7, -l * 0.1)} ${P(0, 0)}Z`,
  ].join(" ");
  return { corpo, borda, listra, sombra };
}

/**
 * Gera a flor num quadro de -100..100 com a base em (0,0): a flor abre
 * para cima, vista de lado, como a da parede. A ordem é a de pintura —
 * trás, meio, frente — e a cor vai da sombra (trás) à luz (frente).
 */
export function flor(kind: FlowerKind, seed: number, tomKey: FloraTom): Petal[] {
  const rnd = seeded(seed);
  const t: Tom = FLORA_TONS[tomKey];
  const j = (n: number) => (rnd() - 0.5) * n;
  const out: Petal[] = [];

  // vista de lado e um pouco de cima: o lado esquerdo abre mais que o direito
  const add = (a: number, l: number, w: number, k: number, o = 0) => {
    const p = petala(l, w, j(0.9) + (a > 0 ? 0.45 : -0.45), o);
    const corpo = k < 0.34 ? t.sombra : k < 0.67 ? t.base : t.claro;
    const camadas: Petal["camadas"] = [
      { d: p.corpo, fill: corpo },
      { d: p.listra, fill: t.luz, opacity: 0.22 + k * 0.22 },
      { d: p.borda, fill: k < 0.34 ? t.base : t.luz, opacity: k < 0.34 ? 0.9 : 0.6 + k * 0.25 },
    ];
    // a sombra da base só nas pétalas de trás e do meio: na frente ela
    // viraria um "botão" no centro da flor
    if (k < 0.7) camadas.push({ d: p.sombra, fill: t.sombra, opacity: 0.45 });
    out.push({ a, k, camadas });
  };

  if (kind === "botao") {
    // botão: três pétalas fechadas, apontando para o alto
    add(-12 + j(4), 74 + j(6), 13, 0.2);
    add(11 + j(4), 72 + j(6), 13, 0.5);
    add(-1 + j(3), 80 + j(6), 15, 0.9);
    return out;
  }

  // trás: leque aberto, escuro, pétalas longas e finas
  [-70, -44, -19, 6, 31, 57].forEach((a, i) => add(a + j(10), 96 + j(18) - Math.abs(a) * 0.12, 15 + j(4), 0.1 + i * 0.01, 2));
  // as de baixo: escorrem para os lados, quase deitadas
  add(-112 + j(8), 98 + j(12), 13 + j(3), 0.22);
  add(108 + j(8), 90 + j(12), 13 + j(3), 0.26);
  // meio
  [-55, -30, -6, 18, 44].forEach((a) => add(a + j(9), 74 + j(12), 16 + j(4), 0.5, 1));
  // frente: a xícara da flor, mais clara e mais curta
  [-30, -9, 13, 34].forEach((a) => add(a + j(7), 54 + j(10), 17 + j(4), 0.86, 0));
  return out;
}

/** Folha lanceolada com nervura, apontando para cima, base em (0,0). */
export function folha(l = 90, w = 26): { corpo: string; nervura: string } {
  return {
    corpo: `M0 0 C${f(w)} ${f(-l * 0.2)} ${f(w * 0.9)} ${f(-l * 0.72)} 0 ${f(-l)} C${f(-w * 0.9)} ${f(-l * 0.72)} ${f(-w)} ${f(-l * 0.2)} 0 0Z`,
    nervura: `M0 ${f(-l * 0.04)} Q${f(w * 0.12)} ${f(-l * 0.5)} 0 ${f(-l * 0.94)}`,
  };
}
