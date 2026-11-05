// As florzinhas da faixa dos nomes (public/tayssa/flor-faixa-*.svg): o mesmo
// desenho da flor da casa (lib/tayssa/flora.ts), aberta, como imagem pronta.
// Na faixa ela tem 16px e se repete a cada nome; desenhada em SVG no HTML
// eram ~80 peças por flor e 5.800 elementos só na faixa (o celular travava
// para montar e para rolar). Mudou o desenho da flor? Rode de novo:
//   node --experimental-strip-types docs/tayssa/flor-da-faixa.mjs
import { writeFileSync } from "node:fs";

const { flor } = await import("../../lib/tayssa/flora.ts");
const curto = (v) => String(+(+v).toFixed(1));

for (const tom of ["rosa", "magenta"]) {
  const petalas = flor("flor", 4, tom)
    .map((p) => {
      const camadas = p.camadas
        .map((c) => {
          const d = c.d.replace(/-?\d+\.\d+/g, curto);
          const opacidade = c.opacity != null ? ` fill-opacity="${+c.opacity.toFixed(2)}"` : "";
          return `<path d="${d}" fill="${c.fill}"${opacidade}/>`;
        })
        .join("");
      return `<g transform="rotate(${curto(p.a)})">${camadas}</g>`;
    })
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-125 -125 250 170">${petalas}</svg>\n`;
  writeFileSync(new URL(`../../public/tayssa/flor-faixa-${tom}.svg`, import.meta.url), svg);
  console.log(`flor-faixa-${tom}.svg`, svg.length, "bytes");
}
