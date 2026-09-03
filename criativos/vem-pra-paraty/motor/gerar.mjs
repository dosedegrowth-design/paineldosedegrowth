#!/usr/bin/env node
/**
 * Gera os PNGs finais dos criativos, de qualquer lancha da frota.
 *
 *   node gerar.mjs --lancha=18-pes       # obrigatório: qual lancha
 *   node gerar.mjs --lancha=33-pes --so=feed
 *   node gerar.mjs --lancha=18-pes --modo=forte    # sobrio|forte|roteiro
 *   node gerar.mjs --lancha=18-pes --preco=p99999
 *   node gerar.mjs --lancha=18-pes --id=conta,fiorde
 *
 * Cada lancha tem sua pasta irmã desta, com criativos.json e fotos/. O mapa de
 * fotos vem do próprio JSON, no campo `fotos`, então trocar de lancha não exige
 * mexer em código.
 *
 * Sem as fotos o script ainda roda: entra um fundo de conferência no lugar,
 * pra você validar tipografia e diagramação antes de ter os arquivos.
 */

import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createRequire } from 'node:module';
import { montarHTML, FORMATOS, definirFontes, definirMarca } from './arte.mjs';

const require = createRequire(import.meta.url);
const MOTOR = path.dirname(fileURLToPath(import.meta.url));

/* playwright pode estar local ou global (npm i -g playwright) */
function carregarPlaywright() {
  const tentativas = [
    'playwright',
    '/opt/node22/lib/node_modules/playwright',
    '/usr/lib/node_modules/playwright',
    '/usr/local/lib/node_modules/playwright',
  ];
  for (const t of tentativas) {
    try {
      return require(t);
    } catch {}
  }
  throw new Error(
    'Playwright não encontrado. Instale com:  npm i -D playwright  (ou npm i -g playwright)'
  );
}

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? true];
  })
);

if (!args.lancha) {
  console.error(
    '\n✕ Falta dizer a lancha.\n' +
    '  node gerar.mjs --lancha=18-pes\n' +
    '  node gerar.mjs --lancha=33-pes\n'
  );
  process.exit(1);
}
const LANCHA = path.join(MOTOR, '..', String(args.lancha));
if (!existsSync(path.join(LANCHA, 'criativos.json'))) {
  console.error(`\n✕ Não achei ${path.join(String(args.lancha), 'criativos.json')}\n`);
  process.exit(1);
}

/** O mapa de fotos é declarado no criativos.json de cada lancha. */
let FOTOS = {};

/** Fundo de conferência, usado só quando a foto real ainda não está na pasta. */
function fundoConferencia(letra) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1440">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0E9AA7"/><stop offset=".55" stop-color="#0B2D48"/>
      <stop offset="1" stop-color="#07203A"/></linearGradient></defs>
    <rect width="1080" height="1440" fill="url(#g)"/>
    <text x="540" y="700" text-anchor="middle" fill="#F6EFE3" fill-opacity=".34"
      font-family="sans-serif" font-size="120" font-weight="700">FOTO ${letra}</text>
    <text x="540" y="770" text-anchor="middle" fill="#F6EFE3" fill-opacity=".26"
      font-family="sans-serif" font-size="34" letter-spacing="4">COLOQUE O ARQUIVO EM fotos/</text>
  </svg>`;
  return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
}

/**
 * A foto entra como data URI, não como file://: a página é montada com
 * setContent, e o Chromium recusa subrecurso file:// nesse contexto.
 */
async function resolverFoto(letra) {
  const abs = path.join(LANCHA, FOTOS[letra]);
  if (!existsSync(abs)) return fundoConferencia(letra);
  const ext = path.extname(abs).toLowerCase();
  const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
  return `data:${mime};base64,` + (await readFile(abs)).toString('base64');
}

/** Fontes e marcas entram embutidas: render igual em qualquer máquina, com ou sem internet. */
async function carregarAtivos() {
  const fontes = await readFile(path.join(MOTOR, 'fontes/fontes-inline.css'), 'utf8');
  definirFontes(fontes);
  const b64 = async (rel) =>
    'data:image/png;base64,' + (await readFile(path.join(MOTOR, rel))).toString('base64');
  definirMarca({ logo: await b64('../marca/logo-horizontal.png') });
}

async function main() {
  const { chromium } = carregarPlaywright();
  await carregarAtivos();
  const dados = JSON.parse(await readFile(path.join(LANCHA, 'criativos.json'), 'utf8'));
  FOTOS = dados.fotos || {};
  const prefixo = dados.prefixo || String(args.lancha);
  // Campos que valem para todas as peças da lancha: lotação no chip, CTA, etc.
  const padroes = dados.padroes_arte || {};

  const filtroId = args.id ? String(args.id).split(',') : null;
  const filtroFmt = args.so ? [String(args.so)] : ['feed', 'story'];
  const filtroModo = args.modo ? String(args.modo).split(',') : null;
  // Os preços em teste vêm do próprio JSON. O modo sóbrio não mostra preço na
  // arte, então para ele uma variante basta.
  const precos = dados.precos_em_teste || {};
  const filtroPreco = args.preco ? String(args.preco).split(',') : Object.keys(precos);

  const itens = dados.criativos.filter((c) => !filtroId || filtroId.includes(c.key));
  const faltando = [];

  /* As pastas de saída espelham a organização do Drive: uma por formato. */
  const PASTA = { feed: 'feed-1080x1350', story: 'story-1080x1920' };
  for (const sub of Object.values(PASTA)) {
    await mkdir(path.join(LANCHA, 'out', sub), { recursive: true });
  }
  await mkdir(path.join(LANCHA, 'previa'), { recursive: true });

  const browser = await chromium.launch({
    args: ['--force-color-profile=srgb', '--font-render-hinting=none'],
  });

  let n = 0;
  for (const c of itens) {
    const temFoto = FOTOS[c.foto] && existsSync(path.join(LANCHA, FOTOS[c.foto]));
    const foto_src = await resolverFoto(c.foto);
    if (!temFoto) faltando.push(`${c.key} → FOTO ${c.foto}`);

    const modosDaPeca = (c.modos || ['forte']).filter(
      (m) => !filtroModo || filtroModo.includes(m)
    );

    for (const fmtKey of filtroFmt) {
     const f = FORMATOS[fmtKey];
     if (!f) throw new Error(`Formato desconhecido: ${fmtKey}`);

     for (const modo of modosDaPeca) {
      // sóbrio não estampa preço, então não faz sentido variar preço nele
      const precosDoModo = modo === 'sobrio' ? [null] : filtroPreco;

      for (const chavePreco of precosDoModo) {
      const item = { ...padroes, ...c, foto_src };
      if (chavePreco) item.preco_arte = precos[chavePreco];
      const html = montarHTML(item, fmtKey, modo);
      const nome = `${prefixo}-${String(c.n).padStart(2, '0')}-${c.key}-${modo}` +
                   `${chavePreco ? '-' + chavePreco : ''}-${fmtKey}`;

      // prévia navegável: mesmo HTML, com a foto por caminho relativo
      const fotoPrevia = temFoto ? `../${FOTOS[c.foto]}` : foto_src;
      // a prévia usa caminho relativo; o PNG usa o data URI acima
      await writeFile(
        path.join(LANCHA, 'previa', `${nome}.html`),
        montarHTML({ ...c, foto_src: fotoPrevia }, fmtKey, modo),
        'utf8'
      );

      const page = await browser.newPage({
        viewport: { width: f.w, height: f.h },
        deviceScaleFactor: 1,
      });
      await page.setContent(html, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({
        path: path.join(LANCHA, 'out', PASTA[fmtKey], `${nome}.png`),
        clip: { x: 0, y: 0, width: f.w, height: f.h },
      });
      await page.close();
      n++;
      process.stdout.write(`  ✓ ${PASTA[fmtKey]}/${nome}.png\n`);
      }
     }
    }
  }

  await browser.close();
  console.log(`\n${n} arquivos em ${args.lancha}/out/  ·  prévias em ${args.lancha}/previa/`);
  console.log(`   out/feed-1080x1350/  ·  out/story-1080x1920/`);
  if (faltando.length) {
    console.log(
      `\n⚠  Estas peças saíram com fundo de conferência porque a foto não está em fotos/:\n   ` +
        [...new Set(faltando)].join('\n   ') +
        `\n   Coloque os arquivos e rode de novo pra gerar as artes finais.`
    );
  }
}

main().catch((e) => {
  console.error('\n✕ ' + e.message);
  process.exit(1);
});
