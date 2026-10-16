"use client";

import { Arranjo, type Peca } from "@/components/tayssa/flora/arranjo";

/* A porta do clube: a flor da parede abre no canto de baixo, cortada pela
   borda, e um botão cruza o alto do outro lado. Fica atrás do formulário. */
const FLORES: Peca[] = [
  { kind: "flor", seed: 5, tom: "magenta", x: 10, y: 92, size: "clamp(260px, 34vw, 520px)", rotate: 18, depth: -0.2, hideBelow: 768 },
  // celular: a flor desce para o pé da tela, longe do texto
  { kind: "flor", seed: 5, tom: "magenta", x: 6, y: 104, size: "54vw", rotate: 22, depth: -0.1, showBelow: 768 },
  { kind: "flor", seed: 9, tom: "vinho", x: 94, y: 30, size: "clamp(150px, 16vw, 260px)", rotate: -26, depth: -0.1, hideBelow: 768 },
  { kind: "botao", seed: 4, tom: "rosa", x: 90, y: 12, size: "clamp(40px, 4vw, 64px)", rotate: -18, depth: 0.2 },
];

export function EntryFlowers() {
  return <Arranjo pecas={FLORES} className="tyl__flores" open label="entrada" />;
}
