// Gera as 8 capas de destaque 1080x1920 do Vem pra Paraty
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const BRAND = path.resolve(__dirname, '..');
const OUT = path.join(BRAND, 'capas');
const SRC = path.join(OUT, 'src');
fs.mkdirSync(SRC, { recursive: true });

const AREIA = '#F6EFE3', LARANJA = '#FF7A45', DOURADO = '#FFB84D', TURQ = '#17C3B2';

// ícones: viewBox 0 0 96 96, stroke areia 5.5, detalhes accent
const icons = {
  roteiros: `
    <path d="M48 14 C33 14 22 25 22 40 C22 58 48 82 48 82 C48 82 74 58 74 40 C74 25 63 14 48 14 Z"/>
    <path d="M35 42 Q41.5 34 48 42 T61 42" stroke="${LARANJA}"/>`,
  frota: `
    <path d="M16 56 L78 47 L69 63 Q67 66 62 66 L28 66 Q21 66 19 61 Z"/>
    <path d="M50 51 L57 40 L66 39"/>
    <path d="M22 78 Q29 71 36 78 T50 78 T64 78" stroke="${LARANJA}"/>`,
  precos: `
    <path d="M14 20 Q14 14 20 14 L46 14 L82 50 Q86 54 82 58 L58 82 Q54 86 50 82 L14 46 Z"/>
    <circle cx="30" cy="30" r="5.5" stroke="${LARANJA}"/>
    <path d="M56 44 L44 56 M60 60 L64 56" stroke="${DOURADO}"/>`,
  depoimentos: `
    <path d="M20 14 L76 14 Q84 14 84 22 L84 54 Q84 62 76 62 L46 62 L30 78 L30 62 L20 62 Q12 62 12 54 L12 22 Q12 14 20 14 Z"/>
    <path d="M48 52 C44 46 35 43.5 35 36.5 C35 31.5 39.5 28.5 43.5 29.5 C45.5 30 47.2 31.6 48 33 C48.8 31.6 50.5 30 52.5 29.5 C56.5 28.5 61 31.5 61 36.5 C61 43.5 52 46 48 52 Z" fill="${LARANJA}" stroke="none"/>`,
  reservas: `
    <rect x="14" y="20" width="68" height="62" rx="9"/>
    <path d="M14 38 L82 38"/>
    <path d="M32 12 L32 26 M64 12 L64 26"/>
    <path d="M35 58 L45 68 L62 48" stroke="${DOURADO}" stroke-width="6.5"/>`,
  paraty: `
    <path d="M26 80 L26 42 Q26 36 32 34 L64 34 Q70 36 70 42 L70 80"/>
    <path d="M25 40 Q48 16 71 40"/>
    <path d="M48 6 L48 17 M43 11.5 L53 11.5" stroke="${LARANJA}"/>
    <path d="M42 80 L42 60 Q42 52 48 52 Q54 52 54 60 L54 80"/>
    <rect x="31" y="58" width="8" height="10" rx="2"/>
    <rect x="57" y="58" width="8" height="10" rx="2"/>
    <path d="M18 80 L78 80"/>`,
  promocoes: `
    <path d="M28 72 L68 24"/>
    <circle cx="30" cy="31" r="10"/>
    <circle cx="66" cy="65" r="10" stroke="${LARANJA}"/>`,
  bastidores: `
    <rect x="10" y="30" width="50" height="40" rx="9"/>
    <path d="M60 44 L84 32 L84 68 L60 56"/>
    <circle cx="35" cy="50" r="7" stroke="${LARANJA}"/>`,
  ilhas: `
    <path d="M 46 64 Q 45 52 41 40"/>
    <path d="M 41 40 Q 29 34 21 38"/>
    <path d="M 41 40 Q 33 26 23 26"/>
    <path d="M 41 40 Q 47 25 57 24"/>
    <path d="M 41 40 Q 53 32 61 40"/>
    <path d="M 22 66 Q 48 52 74 66"/>
    <path d="M 26 78 Q 34 71 42 78 T 58 78 T 74 78" stroke="${LARANJA}"/>`,
};

const tpl = (iconSvg) => `<!doctype html>
<html><head><meta charset="utf-8">
<link rel="stylesheet" href="file://${BRAND}/fonts/fonts-local.css">
<style>
html,body{margin:0;padding:0}
#stage{width:1080px;height:1920px;position:relative;overflow:hidden;
  background:linear-gradient(180deg,#0B2D48 0%,#0C3A55 52%,#0E5A6E 100%)}
.center{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%)}
</style></head>
<body>
<div id="stage">
  <svg style="position:absolute;inset:0" width="1080" height="1920" viewBox="0 0 1080 1920">
    <g fill="none" stroke="${AREIA}" stroke-width="3" opacity="0.07" stroke-linecap="round">
      <path d="M-40 320 Q 120 260 280 320 T 600 320 T 920 320 T 1240 320"/>
      <path d="M-40 520 Q 120 460 280 520 T 600 520 T 920 520 T 1240 520"/>
      <path d="M-40 1420 Q 120 1360 280 1420 T 600 1420 T 920 1420 T 1240 1420"/>
      <path d="M-40 1620 Q 120 1560 280 1620 T 600 1620 T 920 1620 T 1240 1620"/>
    </g>
  </svg>
  <svg class="center" width="640" height="640" viewBox="0 0 640 640">
    <circle cx="320" cy="320" r="292" fill="none" stroke="${AREIA}" stroke-width="9"/>
    <circle cx="320" cy="320" r="266" fill="none" stroke="${AREIA}" stroke-width="2.5" opacity="0.45"/>
    <g transform="translate(172,172) scale(3.083)">
      <g fill="none" stroke="${AREIA}" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round">
        ${iconSvg}
      </g>
    </g>
  </svg>
  <svg class="center" style="top:76%" width="330" height="30" viewBox="0 0 330 30">
    <g fill="none" stroke-width="7" stroke-linecap="round">
      <path d="M 8 15 Q 35 2 62 15 T 116 15" stroke="${TURQ}"/>
      <path d="M 132 15 Q 159 2 186 15 T 240 15" stroke="${LARANJA}"/>
      <path d="M 256 15 Q 283 2 310 15 T 364 15" stroke="${TURQ}"/>
    </g>
  </svg>
</div>
</body></html>`;

(async () => {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    headless: true,
    args: ['--no-sandbox', '--force-color-profile=srgb'],
  });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  for (const [slug, icon] of Object.entries(icons)) {
    const file = path.join(SRC, `capa-${slug}.html`);
    fs.writeFileSync(file, tpl(icon));
    await page.goto('file://' + file, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(150);
    await page.screenshot({ path: path.join(OUT, `capa-${slug}.png`) });
    console.log('ok', slug);
  }
  await browser.close();
})().catch(e => { console.error('ERR:', e.message); process.exit(1); });
