/**
 * Tratamento das fotos.
 *
 * O acervo da VIVA veio de origens diferentes — celular em obra, foto de
 * entrega na porta do cliente, imagem de apresentação. Lado a lado, cada
 * uma puxa para um lado: uma estoura o branco, outra tem céu azul saturado,
 * outra é uma fachada amarela. É isso que fazia o site parecer colagem.
 *
 * Aqui todas passam pela mesma receita — mesmo contraste, mesma saturação
 * baixa, mesma base fria — e saem em três recortes fixos. O vermelho da
 * marca continua sendo a única cor que grita na página.
 *
 * Não é retoque: nada é acrescentado nem removido da foto. É correção de
 * cor e enquadramento, o que qualquer estúdio faria antes de publicar.
 */

import { existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const raiz = dirname(dirname(fileURLToPath(import.meta.url)));
const origem = join(raiz, "public", "photos");
const destino = join(raiz, "public", "img");

/** Os três recortes que o site usa. */
export const RECORTES = {
  w: { w: 1800, h: 1200, vinheta: 0.3 }, //  3:2 — faixas e heróis
  ws: { w: 1100, h: 733, vinheta: 0.3 },
  p: { w: 1120, h: 1400, vinheta: 0.22 }, // 4:5 — painéis verticais, celular
  ps: { w: 700, h: 875, vinheta: 0.22 },
  q: { w: 900, h: 900, vinheta: 0 }, //      1:1 — grade de obra
  qs: { w: 560, h: 560, vinheta: 0 },
};

/**
 * Onde o recorte automático erra, manda o enquadramento na mão.
 * O acervo de laudos é foto de entrega, com duas pessoas: o recorte por
 * "atenção" fecha no rosto de uma e corta a outra fora. Ali se corta pelo
 * centro, que mantém as duas e o documento.
 */
const ENQUADRAMENTO = [
  // foto de entrega, duas pessoas: "atenção" fecha no rosto de uma e corta a outra
  { quando: /^04-laudos\//, posicao: "centre" },
  // cobertura com céu aberto: "atenção" escolhe o céu e some com o captor
  { quando: /^03-spda\//, posicao: "centre" },
];

function posicaoDe(rel) {
  const regra = ENQUADRAMENTO.find((r) => r.quando.test(rel));
  return regra ? regra.posicao : sharp.strategy.attention;
}

function vinheta(w, h, forca) {
  return Buffer.from(
    `<svg width="${w}" height="${h}"><defs>` +
      `<radialGradient id="g" cx="50%" cy="42%" r="80%">` +
      `<stop offset="48%" stop-color="#ffffff" stop-opacity="1"/>` +
      `<stop offset="100%" stop-color="#000000" stop-opacity="${forca}"/>` +
      `</radialGradient></defs>` +
      `<rect width="${w}" height="${h}" fill="url(#g)"/></svg>`,
  );
}

const base = (w, h) =>
  Buffer.from(`<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="#1d2733"/></svg>`);

async function tratar(entrada, saida, recorte, posicao) {
  const { w, h } = recorte;
  const camadas = [{ input: base(w, h), blend: "soft-light" }];
  if (recorte.vinheta > 0) camadas.push({ input: vinheta(w, h, recorte.vinheta), blend: "multiply" });

  await sharp(entrada)
    .resize(w, h, { fit: "cover", position: posicao })
    .modulate({ saturation: 0.3, brightness: 0.93 })
    .linear(1.2, -24)
    .composite(camadas)
    .blur(0.32) // foto de celular tem granulado; granulado é peso em webp
    .sharpen({ sigma: 0.7 })
    .webp({ quality: 70, effort: 6, smartSubsample: true })
    .toFile(saida);
}

function fontes(dir) {
  const saida = [];
  for (const nome of readdirSync(dir)) {
    const caminho = join(dir, nome);
    if (statSync(caminho).isDirectory()) saida.push(...fontes(caminho));
    else if (/\.(jpe?g|png|webp)$/i.test(nome)) saida.push(caminho);
  }
  return saida;
}

if (!existsSync(origem)) {
  console.log("[grade] public/photos ainda não existe — nada a tratar");
  process.exit(0);
}

const arquivos = fontes(origem);
const tarefas = [];

for (const arquivo of arquivos) {
  const rel = relative(origem, arquivo).replace(/\.[^.]+$/, "");
  for (const [sufixo, recorte] of Object.entries(RECORTES)) {
    const saida = join(destino, `${rel}-${sufixo}.webp`);
    mkdirSync(dirname(saida), { recursive: true });
    if (existsSync(saida) && statSync(saida).mtimeMs > statSync(arquivo).mtimeMs) continue;
    tarefas.push(tratar(arquivo, saida, recorte, posicaoDe(rel)));
  }
}

if (tarefas.length === 0) {
  console.log(`[grade] ${arquivos.length} fotos já tratadas`);
} else {
  const inicio = Date.now();
  await Promise.all(tarefas);
  console.log(`[grade] ${tarefas.length} arquivos em ${((Date.now() - inicio) / 1000).toFixed(1)}s`);
}
