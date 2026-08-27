// Templates de aplicação: capa de carrossel, flyer feed, story promo
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const BRAND = path.resolve(__dirname, '..');
const T = path.join(BRAND, 'templates');
const SRC = path.join(T, 'src');
fs.mkdirSync(SRC, { recursive: true });

const FONTS = `file://${BRAND}/fonts/fonts-local.css`;
const SELO = `file://${BRAND}/logo/final/selo-principal-2048.png`;
const HERO_A = `file://${T}/img/hero_a.jpg`;
const HERO_B = `file://${T}/img/hero_b.jpg`;

const waIcon = `<svg width="44" height="44" viewBox="0 0 96 96" fill="none">
  <path d="M48 12 A 36 36 0 1 0 30 79 L 16 84 L 22 70 A 36 36 0 1 0 48 12 Z" stroke="#FFFFFF" stroke-width="7" stroke-linejoin="round"/>
  <path d="M36 32 c2.5 -2.5 6 -2.5 8 0 l3 4 c1.8 2.2 1.5 5 -0.5 7 l-2 2 c2.8 5 7 9.2 12 12 l2 -2 c2 -2 4.8 -2.3 7 -0.5 l4 3 c2.5 2 2.5 5.5 0 8 l-2.5 2.5 c-2 2 -5.5 3 -8.5 2 c-13 -4.5 -23 -14.5 -27.5 -27.5 c-1 -3 0 -6.5 2 -8.5 z" fill="#FFFFFF"/>
</svg>`;

const igIcon = `<svg width="34" height="34" viewBox="0 0 96 96" fill="none" stroke="#F6EFE3" stroke-width="7">
  <rect x="12" y="12" width="72" height="72" rx="20"/><circle cx="48" cy="48" r="17"/><circle cx="70" cy="26" r="4.5" fill="#F6EFE3" stroke="none"/>
</svg>`;

const head = `<meta charset="utf-8"><link rel="stylesheet" href="${FONTS}">
<style>
  html,body{margin:0;padding:0}
  *{box-sizing:border-box}
  .lilita{font-family:'Lilita One'}
  .pop{font-family:'Poppins'}
  .pacifico{font-family:'Pacifico'}
</style>`;

// ---------- 1. CAPA DE CARROSSEL 1080x1350 ----------
const carrossel = `<!doctype html><html><head>${head}<style>
#stage{width:1080px;height:1350px;position:relative;overflow:hidden;background:#0B2D48}
.bg{position:absolute;inset:0;background:url('${HERO_A}') center 28%/cover no-repeat}
.ov{position:absolute;inset:0;background:linear-gradient(180deg,rgba(11,45,72,0.12) 0%,rgba(11,45,72,0) 30%,rgba(11,45,72,0.55) 62%,rgba(7,32,58,0.97) 100%)}
.selo{position:absolute;top:44px;left:44px;width:136px}
.handle{position:absolute;top:74px;right:52px;color:#F6EFE3;font-size:28px;font-weight:600;letter-spacing:2px;display:flex;gap:12px;align-items:center;text-shadow:0 2px 14px rgba(0,0,0,.45)}
.content{position:absolute;left:64px;right:64px;bottom:70px}
.eyebrow{display:inline-block;background:#FF7A45;color:#fff;font-weight:700;font-size:30px;letter-spacing:5px;padding:12px 30px;border-radius:999px}
h1{margin:34px 0 0;color:#F6EFE3;font-size:104px;line-height:1.04;font-weight:400}
h1 .tq{color:#17C3B2}
.cta{margin-top:44px;display:flex;align-items:center;justify-content:space-between}
.arrasta{color:#FFB84D;font-size:34px;font-weight:600;letter-spacing:1px}
.dots{display:flex;gap:14px}
.dots span{width:18px;height:18px;border-radius:50%;background:rgba(246,239,227,.38)}
.dots span:first-child{background:#FF7A45}
</style></head><body><div id="stage">
  <div class="bg"></div><div class="ov"></div>
  <img class="selo" src="${SELO}">
  <div class="handle pop">${igIcon} @vempraparaty</div>
  <div class="content">
    <span class="eyebrow pop">ROTEIROS</span>
    <h1 class="lilita">5 praias que você<br><span class="tq">só chega de lancha</span></h1>
    <div class="cta"><span class="arrasta pop">Arrasta pro lado &nbsp;⟶</span>
      <div class="dots"><span></span><span></span><span></span><span></span><span></span></div>
    </div>
  </div>
</div></body></html>`;

// ---------- 2. FLYER PROMO FEED 1080x1350 ----------
const flyer = `<!doctype html><html><head>${head}<style>
#stage{width:1080px;height:1350px;position:relative;overflow:hidden;background:#0B2D48}
.bg{position:absolute;inset:0;background:url('${HERO_B}') 62% center/cover no-repeat}
.ov{position:absolute;inset:0;background:linear-gradient(180deg,rgba(7,32,58,0.62) 0%,rgba(11,45,72,0.10) 34%,rgba(11,45,72,0.42) 60%,rgba(7,32,58,0.97) 100%)}
.selo{position:absolute;top:40px;left:50%;transform:translateX(-50%);width:150px}
.content{position:absolute;left:60px;right:60px;bottom:60px;text-align:center}
.eyebrow{display:inline-block;border:3px solid #17C3B2;color:#17C3B2;font-weight:700;font-size:28px;letter-spacing:6px;padding:10px 28px;border-radius:999px;background:rgba(7,32,58,.5)}
h1{margin:26px 0 0;color:#F6EFE3;font-size:98px;line-height:1.02}
h1 .gold{color:#FFB84D}
.script{font-family:'Pacifico';color:#17C3B2;font-size:56px;margin-top:2px}
.feats{margin:34px auto 0;display:flex;justify-content:center;gap:34px;color:#F6EFE3;font-size:29px;font-weight:500}
.feats b{color:#FFB84D;font-weight:700}
.priceRow{margin-top:44px;display:flex;align-items:stretch;justify-content:center;gap:30px}
.price{background:#FF7A45;color:#fff;border-radius:28px;padding:22px 38px;transform:rotate(-3deg);box-shadow:0 14px 40px rgba(0,0,0,.35);white-space:nowrap;display:flex;flex-direction:column;justify-content:center}
.price .apartir{font-size:24px;font-weight:600;letter-spacing:3px}
.price .valor{font-size:66px;font-weight:800;line-height:1.1;white-space:nowrap}
.price .pax{font-size:24px;font-weight:500;opacity:.92}
.cta{display:flex;align-items:center;gap:18px;background:#17C3B2;color:#fff;font-weight:700;font-size:33px;border-radius:36px;padding:26px 38px;box-shadow:0 14px 40px rgba(0,0,0,.35)}
.foot{margin-top:46px;color:rgba(246,239,227,.85);font-size:27px;font-weight:500;letter-spacing:2px}
</style></head><body><div id="stage">
  <div class="bg"></div><div class="ov"></div>
  <img class="selo" src="${SELO}">
  <div class="content">
    <span class="eyebrow pop">SAÍDAS TODOS OS DIAS</span>
    <h1 class="lilita">Passeio de lancha<br><span class="gold">em Paraty</span></h1>
    <div class="feats pop"><span><b>4 lanchas</b> na água</span><span>até <b>12 pessoas</b></span><span>roteiro <b>do seu jeito</b></span></div>
    <div class="priceRow">
      <div class="price pop"><div class="apartir">A PARTIR DE</div><div class="valor">R$ 700</div><div class="pax">lancha privativa</div></div>
      <div class="cta pop">${waIcon} RESERVE PELO WHATSAPP</div>
    </div>
    <div class="foot pop">@vempraparaty &nbsp;•&nbsp; Paraty-RJ</div>
  </div>
</div></body></html>`;

// ---------- 3. STORY PROMO 1080x1920 ----------
const story = `<!doctype html><html><head>${head}<style>
#stage{width:1080px;height:1920px;position:relative;overflow:hidden;background:#0B2D48}
.bg{position:absolute;inset:0;background:url('${HERO_A}') center 30%/cover no-repeat}
.ov{position:absolute;inset:0;background:linear-gradient(180deg,rgba(7,32,58,0.55) 0%,rgba(11,45,72,0.08) 30%,rgba(11,45,72,0.30) 55%,rgba(7,32,58,0.98) 100%)}
.selo{position:absolute;top:70px;left:50%;transform:translateX(-50%);width:170px}
.content{position:absolute;left:70px;right:70px;bottom:120px;text-align:center}
.script{font-family:'Pacifico';color:#FFB84D;font-size:74px;transform:rotate(-3deg);display:block}
h1{margin:6px 0 0;color:#F6EFE3;font-size:118px;line-height:1.02}
h1 .tq{color:#17C3B2}
.feats{margin:40px auto 0;display:inline-block;text-align:left;color:#F6EFE3;font-size:36px;font-weight:500;line-height:1.9}
.feats b{color:#FFB84D}
.check{color:#17C3B2;font-weight:800;margin-right:14px}
.cta{margin:56px auto 0;display:flex;align-items:center;justify-content:center;gap:20px;background:#FF7A45;color:#fff;font-weight:700;font-size:40px;border-radius:999px;padding:32px 44px;box-shadow:0 16px 44px rgba(0,0,0,.4)}
.foot{margin-top:44px;color:rgba(246,239,227,.85);font-size:30px;font-weight:500;letter-spacing:2px}
</style></head><body><div id="stage">
  <div class="bg"></div><div class="ov"></div>
  <img class="selo" src="${SELO}">
  <div class="content">
    <span class="script">Bora pro mar?</span>
    <h1 class="lilita">Seu dia de lancha<br><span class="tq">em Paraty</span></h1>
    <div class="feats pop">
      <div><span class="check">✓</span><b>4 lanchas</b> disponíveis</div>
      <div><span class="check">✓</span>Praias e ilhas da baía de Paraty</div>
      <div><span class="check">✓</span>Saída do cais &nbsp;•&nbsp; <b>disponibilidade hoje</b></div>
    </div>
    <div class="cta pop">${waIcon} CHAMA NO WHATSAPP</div>
    <div class="foot pop">@vempraparaty &nbsp;•&nbsp; Paraty-RJ</div>
  </div>
</div></body></html>`;

const jobs = [
  ['template-carrossel-capa', carrossel, 1080, 1350],
  ['template-flyer-promo', flyer, 1080, 1350],
  ['template-story-promo', story, 1080, 1920],
];

(async () => {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    headless: true,
    args: ['--no-sandbox', '--force-color-profile=srgb'],
  });
  for (const [slug, html, w, h] of jobs) {
    const file = path.join(SRC, slug + '.html');
    fs.writeFileSync(file, html);
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    await page.goto('file://' + file, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(T, slug + '.png') });
    await page.close();
    console.log('ok', slug);
  }
  await browser.close();
})().catch(e => { console.error('ERR:', e.message); process.exit(1); });
