// Gera o PDF do Manual do painel (a versão para mandar no grupo) a partir do painel rodando LOCAL,
// com o banco de teste (dados falsos). Uso: node docs/tayssa/manual-pdf.mjs <pasta-de-saída> pdf
// ("ver" no lugar de "pdf" tira prints do manual no celular e no computador para conferir).
// Precisa do site em http://localhost:3014 (next build && next start -p 3014) e do link de teste
// do admin local (local-demo-admin-link). Nunca rodar contra o site no ar.

import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("/opt/node22/lib/node_modules/playwright");
const BASE = "http://localhost:3014";
const OUT = process.argv[2];
const MODO = process.argv[3] ?? "ver";
const log = (...a) => console.log("•", ...a);
const browser = await chromium.launch({ args: ["--lang=pt-BR"] });
async function abrirManual(opts) {
  const { jpeg, ...contexto } = opts;
  const ctx = await browser.newContext({ ...contexto, locale: "pt-BR", timezoneId: "America/Sao_Paulo" });
  await ctx.route(/google-analytics|googletagmanager/, (r) => r.abort());
  if (opts.jpeg) {
    // no PDF a foto vai em JPEG (o Chromium guarda o WebP sem compressão: o arquivo passava de 20 MB)
    const sharp = createRequire("/home/user/paineldosedegrowth/package.json")("sharp");
    await ctx.route(/\/tayssa\/manual\/.*\.webp$/, async (route) => {
      const r = await route.fetch();
      const jpg = await sharp(await r.body()).flatten({ background: "#ffffff" }).jpeg({ quality: 72, mozjpeg: true }).toBuffer();
      await route.fulfill({ status: 200, contentType: "image/jpeg", body: jpg });
    });
  }
  const page = await ctx.newPage();
  page.on("pageerror", (e) => log("PAGEERROR", e.message));
  await page.goto(BASE + "/tayssa/entrar/link?t=local-demo-admin-link", { waitUntil: "load" });
  await page.waitForTimeout(700);
  await page.locator("button", { hasText: "Entrar" }).first().evaluate((b) => b.click());
  await page.waitForURL((u) => !u.pathname.includes("/entrar"), { timeout: 20000 });
  await page.goto(BASE + "/tayssa/admin/manual", { waitUntil: "load" });
  await page.waitForFunction(() => !document.querySelector("[hidden] .tya-manual"), null, { timeout: 15000 }).catch(() => {});
  await page.evaluate(async () => {
    for (const img of document.querySelectorAll(".tya-manual img")) img.loading = "eager";
    await Promise.all([...document.querySelectorAll(".tya-manual img")].map((i) => (i.complete ? null : new Promise((r) => { i.onload = i.onerror = r; }))));
  });
  await page.waitForTimeout(800);
  return page;
}
if (MODO === "ver") {
  const cel = await abrirManual({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await cel.screenshot({ path: OUT + "/m-cel-topo.png" });
  await cel.locator("#agenda").scrollIntoViewIfNeeded();
  await cel.evaluate(() => document.querySelector("#confirmar").scrollIntoView());
  await cel.waitForTimeout(500);
  await cel.screenshot({ path: OUT + "/m-cel-topico.png" });
  // a busca
  await cel.evaluate(() => scrollTo(0, 0));
  await cel.locator(".tya-manual__campo input").fill("comprovante");
  await cel.waitForTimeout(600);
  const visiveis = await cel.locator("[data-manual-topico]:not([hidden])").count();
  log("busca 'comprovante':", visiveis, "tópicos visíveis");
  await cel.locator(".tya-manual__campo input").fill("xyzw");
  await cel.waitForTimeout(400);
  log("busca sem nada:", await cel.locator(".tya-manual__busca .tya-small").innerText().catch(() => "sem aviso"));
  const larg = await cel.evaluate(() => document.documentElement.scrollWidth);
  log("largura da página no celular:", larg);
  const pc = await abrirManual({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
  await pc.screenshot({ path: OUT + "/m-pc.png" });
} else {
  const page = await abrirManual({ viewport: { width: 900, height: 1200 }, deviceScaleFactor: 1, jpeg: true });
  await page.addStyleTag({ content: `
    .tya-side, .tya-top, .tya-baixo, .tya-veu, .tya-manual__busca, .ty-grain, .ty-vivo__grao { display: none !important; }
    .tya-main { padding: 0 !important; animation: none !important; }
    .tya, body { background: #fff !important; }
    .tya-manual { max-width: none !important; }
    .tya-manual__indice { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
    .tya-card { box-shadow: none !important; }
    .tya-manual__foto { max-width: 230px !important; break-inside: avoid; page-break-inside: avoid; }
    .tya-manual__foto--larga { max-width: 100% !important; }
    .tya-manual__topico { break-inside: auto !important; overflow: visible !important; }
    .tya-manual__topico h3 { break-after: avoid; }
    .tya-passos li, .tya-manual__dica, .tya-manual__texto { break-inside: avoid; }
    .tya-manual__secao > header { break-after: avoid; }
    * { animation: none !important; transition: none !important; }
  ` });
  await page.waitForTimeout(500);
  await page.pdf({ path: OUT + "/manual.pdf", format: "A4", printBackground: true, margin: { top: "14mm", bottom: "14mm", left: "12mm", right: "12mm" } });
  log("pdf ok");
}
await browser.close();
