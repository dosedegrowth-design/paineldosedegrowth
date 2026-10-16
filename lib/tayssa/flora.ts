/**
 * Flora — geometria das flores da direção de arte.
 *
 * As flores do site são ilustração vetorial gerada aqui, não fotografia:
 * nunca se passam por trabalho da Tayssa. São peças da identidade (vinho,
 * bordô, ameixa e rosa fechado, com folha verde só como pontuação) que se
 * cruzam com a tipografia, as fotos e os vídeos.
 *
 * Tudo é determinístico: a mesma semente gera a mesma flor no servidor e no
 * navegador (sem divergência de hidratação). Números saem com 2 casas.
 */

export type FlowerKind = "peonia" | "rosa" | "botao";

/** Tons da casa. Cada flor anda entre o tom de fora e o de dentro. */
export const FLORA_TONS = {
  vinho: { fora: "#9b3a55", dentro: "#4b0c20", base: "#3a0818", luz: "#c46a83" },
  bordo: { fora: "#7a1f38", dentro: "#33061a", base: "#26040f", luz: "#a8455f" },
  rosa: { fora: "#e0a4b3", dentro: "#9c4560", base: "#7a2a44", luz: "#f3cdd6" },
  ameixa: { fora: "#8a4a72", dentro: "#3d1230", base: "#2c0b22", luz: "#b0739a" },
  /** quase branco: flor que mora atrás da tipografia vinho sem brigar com ela */
  pétala: { fora: "#f4dfe4", dentro: "#d9a5b3", base: "#c17d91", luz: "#fbf1f3" },
} as const;

export type FloraTom = keyof typeof FLORA_TONS;

export type Petal = {
  /** caminho da pétala, apontando para cima, base no centro (0,0) */
  d: string;
  /** rotação em graus em torno do centro */
  a: number;
  /** 0 = pétala de fora … 1 = miolo */
  k: number;
  /** cor da pétala (já interpolada) */
  cor: string;
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

function hex(c: string): [number, number, number] {
  const n = parseInt(c.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
export function misturar(a: string, b: string, t: number): string {
  const x = hex(a);
  const y = hex(b);
  const m = x.map((v, i) => Math.round(v + (y[i] - v) * t));
  return `#${m.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

/**
 * Pétala: nasce em `r0` do centro, comprimento `l`, largura `w`. A ponta
 * tem um leve recorte (a pétala de rosa/peônia não é uma gota).
 * `torce` entorta a pétala de leve para um lado.
 */
function petala(r0: number, l: number, w: number, torce: number): string {
  const y0 = -r0;
  const y1 = -(r0 + l);
  const t = torce * w;
  return [
    `M0 ${f(y0)}`,
    `C${f(w * 0.62 + t)} ${f(y0 - l * 0.12)} ${f(w * 0.7 + t)} ${f(y0 - l * 0.74)} ${f(w * 0.22 + t)} ${f(y1)}`,
    `Q${f(w * 0.07 + t)} ${f(y1 + l * 0.05)} ${f(t)} ${f(y1 + l * 0.015)}`,
    `Q${f(-w * 0.07 + t)} ${f(y1 + l * 0.05)} ${f(-w * 0.22 + t)} ${f(y1)}`,
    `C${f(-w * 0.7 + t)} ${f(y0 - l * 0.74)} ${f(-w * 0.62 + t)} ${f(y0 - l * 0.12)} 0 ${f(y0)}`,
    "Z",
  ].join(" ");
}

/**
 * Gera as pétalas de uma flor num quadro de -100..100. A ordem é a de
 * pintura: de fora para dentro, então o miolo fica por cima — o ângulo
 * dourado (137,5°) espalha as pétalas como numa rosa/ranúnculo de verdade.
 */
export function flor(kind: FlowerKind, seed: number, tom: FloraTom): Petal[] {
  const rnd = seeded(seed);
  const t = FLORA_TONS[tom];
  const out: Petal[] = [];

  if (kind === "botao") {
    // botão: poucas pétalas fechadas, todas apontando para cima
    const n = 9;
    for (let i = 0; i < n; i++) {
      const k = i / (n - 1);
      const lado = i % 2 ? 1 : -1;
      const a = lado * (38 - k * 34) + (rnd() - 0.5) * 6;
      const l = 64 - k * 18;
      const w = 30 - k * 10;
      out.push({ d: petala(8 - k * 6, l, w, lado * 0.08), a, k, cor: misturar(t.fora, t.dentro, k) });
    }
    return out;
  }

  const n = kind === "peonia" ? 58 : 36;
  const ouro = 137.508;
  for (let i = n - 1; i >= 0; i--) {
    const k = 1 - i / (n - 1); // 0 fora … 1 dentro
    const a = (i * ouro + (rnd() - 0.5) * 9) % 360;
    // peônia: pétalas largas e babadas; rosa: mais justas, em xícara
    const lMax = kind === "peonia" ? 82 : 86;
    const l = lMax * (0.3 + 0.7 * (1 - k)) * (0.9 + rnd() * 0.2);
    const w = (kind === "peonia" ? 46 : 40) * (0.42 + 0.58 * (1 - k)) * (0.9 + rnd() * 0.2);
    const r0 = (1 - k) * (kind === "peonia" ? 6 : 3);
    out.push({
      d: petala(r0, l, w, (rnd() - 0.5) * 0.3),
      a,
      k,
      cor: misturar(t.fora, t.dentro, Math.pow(k, 0.85)),
    });
  }
  return out;
}

/** Folha lanceolada com nervura, apontando para cima, base em (0,0). */
export function folha(l = 90, w = 26): { corpo: string; nervura: string } {
  return {
    corpo: `M0 0 C${f(w)} ${f(-l * 0.2)} ${f(w * 0.9)} ${f(-l * 0.72)} 0 ${f(-l)} C${f(-w * 0.9)} ${f(-l * 0.72)} ${f(-w)} ${f(-l * 0.2)} 0 0Z`,
    nervura: `M0 ${f(-l * 0.04)} Q${f(w * 0.12)} ${f(-l * 0.5)} 0 ${f(-l * 0.94)}`,
  };
}
