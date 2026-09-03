#!/usr/bin/env node
/**
 * Gera os PNGs finais dos criativos da lancha 18 pés.
 *
 *   node gerar.mjs            # renderiza tudo (feed + story)
 *   node gerar.mjs --so=feed  # só 1080x1350
 *   node gerar.mjs --so=story # só 1080x1920
 *   node gerar.mjs --id=matematica,casal
 *
 * Antes de rodar, coloque as três fotos reais em fotos/ com estes nomes:
 *   fotos/lancha18-a.jpg   (três-quartos traseiro, serra ao fundo, muito céu)
 *   fotos/lancha18-b.jpg   (lateral, coqueiros, pessoas a bordo)
 *   fotos/lancha18-c.jpg   (lateral próxima, bancos do interior visíveis)
 *
 * Sem as fotos o script ainda roda: entra um fundo de conferência no lugar,
 * pra você validar tipografia e diagramação antes de ter os arquivos.
 */

import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { createRequire } from 'node:module';
import { montarHTML, FORMATOS, definirFontes, definirMarca } from './arte.mjs';

const require = createRequire(import.meta.url);
const AQUI = path.dirname(fileURLToPath(import.meta.url));

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

const FOTOS = {
  A: 'fotos/lancha18-a.jpg',
  B: 'fotos/lancha18-b.jpg',
  C: 'fotos/lancha18-c.jpg',
};

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

async function resolverFoto(letra) {
  const rel = FOTOS[letra];
  const abs = path.join(AQUI, rel);
  if (existsSync(abs)) return pathToFileURL(abs).href;
  return fundoConferencia(letra);
}

/** Fontes e marcas entram embutidas: render igual em qualquer máquina, com ou sem internet. */
async function carregarAtivos() {
  const fontes = await readFile(path.join(AQUI, 'fontes/fontes-inline.css'), 'utf8');
  definirFontes(fontes);
  const b64 = async (rel) =>
    'data:image/png;base64,' + (await readFile(path.join(AQUI, rel))).toString('base64');
  definirMarca({ logo: await b64('../marca/logo-horizontal.png') });
}

async function main() {
  const { chromium } = carregarPlaywright();
  await carregarAtivos();
  const dados = JSON.parse(await readFile(path.join(AQUI, 'criativos.json'), 'utf8'));

  const filtroId = args.id ? String(args.id).split(',') : null;
  const filtroFmt = args.so ? [String(args.so)] : ['feed', 'story'];

  const itens = dados.criativos.filter((c) => !filtroId || filtroId.includes(c.key));
  const faltando = [];

  await mkdir(path.join(AQUI, 'out'), { recursive: true });
  await mkdir(path.join(AQUI, 'previa'), { recursive: true });

  const browser = await chromium.launch({
    args: ['--force-color-profile=srgb', '--font-render-hinting=none'],
  });

  let n = 0;
  for (const c of itens) {
    const foto_src = await resolverFoto(c.foto);
    if (foto_src.startsWith('data:')) faltando.push(`${c.key} → FOTO ${c.foto}`);

    for (const fmtKey of filtroFmt) {
      const f = FORMATOS[fmtKey];
      if (!f) throw new Error(`Formato desconhecido: ${fmtKey}`);

      const html = montarHTML({ ...c, foto_src }, fmtKey);
      const nome = `vpp18-${String(c.n).padStart(2, '0')}-${c.key}-${fmtKey}`;

      // prévia navegável: mesmo HTML, com a foto por caminho relativo
      const fotoPrevia = existsSync(path.join(AQUI, FOTOS[c.foto]))
        ? `../${FOTOS[c.foto]}`
        : foto_src;
      await writeFile(
        path.join(AQUI, 'previa', `${nome}.html`),
        montarHTML({ ...c, foto_src: fotoPrevia }, fmtKey),
        'utf8'
      );

      const page = await browser.newPage({
        viewport: { width: f.w, height: f.h },
        deviceScaleFactor: 1,
      });
      await page.setContent(html, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({
        path: path.join(AQUI, 'out', `${nome}.png`),
        clip: { x: 0, y: 0, width: f.w, height: f.h },
      });
      await page.close();
      n++;
      process.stdout.write(`  ✓ ${nome}.png\n`);
    }
  }

  await browser.close();
  console.log(`\n${n} arquivos em out/  ·  prévias navegáveis em previa/`);
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
