// Gera thumbnails otimizados pro manual/artifact
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const BRAND = path.resolve(__dirname, '..');
const OUT = path.join(BRAND, 'manual', 'thumbs');
fs.mkdirSync(OUT, { recursive: true });

// [src, out, width, format]
const jobs = [
  ['logo/final/logo-horizontal-fundo-navy.png', 'lockup.png', 980, 'png'],
  ['logo/final/selo-principal-2048.png', 'selo.png', 460, 'png'],
  ['logo/final/selo-fundo-claro-2048.png', 'selo-claro.png', 460, 'png'],
  ['logo/final/selo-mono-branco-2048.png', 'selo-mono.png', 460, 'png'],
  ['capas/capa-roteiros.png', 'capa-roteiros.png', 250, 'png'],
  ['capas/capa-frota.png', 'capa-frota.png', 250, 'png'],
  ['capas/capa-precos.png', 'capa-precos.png', 250, 'png'],
  ['capas/capa-depoimentos.png', 'capa-depoimentos.png', 250, 'png'],
  ['capas/capa-reservas.png', 'capa-reservas.png', 250, 'png'],
  ['capas/capa-paraty.png', 'capa-paraty.png', 250, 'png'],
  ['capas/capa-promocoes.png', 'capa-promocoes.png', 250, 'png'],
  ['capas/capa-bastidores.png', 'capa-bastidores.png', 250, 'png'],
  ['templates/template-carrossel-capa.png', 'tpl-carrossel.jpg', 520, 'jpeg'],
  ['templates/template-flyer-promo.png', 'tpl-flyer.jpg', 520, 'jpeg'],
  ['templates/template-story-promo.png', 'tpl-story.jpg', 460, 'jpeg'],
];

(async () => {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    headless: true,
    args: ['--no-sandbox', '--force-color-profile=srgb'],
  });
  const page = await browser.newPage({ viewport: { width: 1200, height: 1200 } });
  const tmpHtml = path.join(OUT, '_tmp.html');
  for (const [src, out, w, fmt] of jobs) {
    const abs = path.join(BRAND, src);
    fs.writeFileSync(tmpHtml, `<body style="margin:0;background:transparent"><img id="i" src="file://${abs}" style="width:${w}px;display:block"></body>`);
    await page.goto('file://' + tmpHtml, { waitUntil: 'load' });
    await page.waitForFunction(() => { const i = document.getElementById('i'); return i.complete && i.naturalWidth > 0; });
    const el = await page.$('#i');
    const opts = { path: path.join(OUT, out), omitBackground: fmt === 'png' };
    if (fmt === 'jpeg') { opts.type = 'jpeg'; opts.quality = 82; delete opts.omitBackground; }
    await el.screenshot(opts);
    console.log('ok', out);
  }
  await browser.close();
  let total = 0;
  for (const f of fs.readdirSync(OUT)) total += fs.statSync(path.join(OUT, f)).size;
  console.log('total thumbs KB:', Math.round(total / 1024));
})().catch(e => { console.error('ERR:', e.message); process.exit(1); });
