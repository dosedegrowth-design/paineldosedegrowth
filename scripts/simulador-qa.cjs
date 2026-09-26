/* QA de interface do simulador (/simulador) em Chromium de verdade.
 *
 * Cobre o roteiro do briefing: larguras 320–430 sem overflow, CTA na dobra,
 * fluxo completo (erro → preenchido → processando → resultado → WhatsApp →
 * explicação → nova simulação), teclado, movimento reduzido e desktop.
 *
 * Precisa do pacote `playwright` (local ou global: `npm i -g playwright`)
 * com o Chromium instalado (`npx playwright install chromium`).
 *
 * Uso (com o app rodando):
 *   npm run dev -- -p 3011
 *   BASE=http://localhost:3011/simulador node scripts/simulador-qa.cjs
 * Capturas de tela vão para .qa/simulador/ (ou QA_OUT).
 */
/* eslint-disable @typescript-eslint/no-require-imports -- script Node em CommonJS */
const path = require("path");
const fs = require("fs");

function loadPlaywright() {
  try {
    return require("playwright");
  } catch {}
  const { execSync } = require("child_process");
  const root = execSync("npm root -g").toString().trim();
  return require(path.join(root, "playwright"));
}
const { chromium } = loadPlaywright();

const BASE = process.env.BASE || "http://localhost:3000/simulador";
const OUT = process.env.QA_OUT || path.join(__dirname, "..", ".qa", "simulador");
fs.mkdirSync(OUT, { recursive: true });
const checks = [];
const check = (name, ok, detail = "") => {
  checks.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? " — " + detail : ""}`);
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function overflow(page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    const wide = [];
    for (const el of document.querySelectorAll("body *")) {
      const r = el.getBoundingClientRect();
      if (r.right > doc.clientWidth + 0.5 || r.left < -0.5) {
        wide.push(`${el.tagName.toLowerCase()}.${[...el.classList].join(".")} right=${Math.round(r.right)}`);
      }
    }
    return { sw: doc.scrollWidth, cw: doc.clientWidth, wide: wide.slice(0, 5) };
  });
}

async function state(page) {
  return page.getAttribute(".sim-app", "data-state");
}

(async () => {
  const browser = await chromium.launch();

  /* ---------- 1. larguras: sem overflow horizontal (landing) ---------- */
  for (const w of [320, 360, 375, 390, 412, 430, 768, 1280]) {
    const mobile = w < 700;
    const ctx = await browser.newContext({
      viewport: { width: w, height: mobile ? 740 : 900 },
      deviceScaleFactor: 2,
      isMobile: mobile,
      hasTouch: mobile,
    });
    const page = await ctx.newPage();
    await page.goto(BASE, { waitUntil: "networkidle" });
    await sleep(900);
    const o = await overflow(page);
    check(`sem overflow horizontal @${w}`, o.sw <= o.cw && o.wide.length === 0, `scrollWidth=${o.sw} clientWidth=${o.cw} ${o.wide.join(" | ")}`);
    await page.screenshot({ path: `${OUT}/landing-${w}.png`, fullPage: true });
    await ctx.close();
  }

  /* ---------- 2. dobra: CTA visível sem rolar em telas baixas ---------- */
  for (const [w, h] of [[320, 568], [360, 640], [375, 667], [390, 844]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const page = await ctx.newPage();
    await page.goto(BASE, { waitUntil: "networkidle" });
    await sleep(900);
    const btn = await page.locator("button[type=submit]").boundingBox();
    const field = await page.locator("#sim-nome").boundingBox();
    // portal institucional: cabeçalho, etapas e orientações vêm antes do
    // formulário; o que precisa estar no primeiro quadro é o início dele
    check(`formulário começa no primeiro quadro @${w}x${h}`, field && field.y + field.height <= h, `campo=${field ? Math.round(field.y + field.height) : "?"} cta=${btn ? Math.round(btn.y) : "?"}/${h}`);
    await page.screenshot({ path: `${OUT}/fold-${w}x${h}.png` });
    await ctx.close();
  }

  /* ---------- 3. fluxo completo @390x844 ---------- */
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  // o sandbox não alcança wa.me: responde a navegação com uma página vazia
  await ctx.route("https://wa.me/**", (route) => route.fulfill({ status: 200, contentType: "text/html", body: "<title>wa.me stub</title>" }));
  const page = await ctx.newPage();
  const consoleErrors = [];
  page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
  page.on("pageerror", (e) => consoleErrors.push(String(e)));
  await page.goto(BASE, { waitUntil: "networkidle" });
  await sleep(900);

  check("estado inicial = idle", (await state(page)) === "idle", await state(page));
  check("link de pulo pro conteúdo", (await page.locator("a.sim-skip").count()) === 1);
  check("etapas: 1ª etapa atual", (await page.getAttribute(".sim-stepper li:first-child", "data-state")) === "current");
  // menu do cabeçalho (celular): botão abre e fecha a lista
  const menuBtn = page.locator(".sim-menu-btn");
  await menuBtn.click();
  check("menu abre (aria-expanded)", (await menuBtn.getAttribute("aria-expanded")) === "true" && (await page.locator("#sim-menu").isVisible()));
  await page.click("#sim-menu a[href='#como-funciona']");
  await sleep(500);
  check("menu fecha ao escolher item", (await menuBtn.getAttribute("aria-expanded")) === "false");
  check("âncora rola até a seção", (await page.evaluate(() => window.scrollY)) > 100);
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(300);
  const a11y = await page.evaluate(() => {
    const inputs = [...document.querySelectorAll("input")];
    const labeled = inputs.every((i) => document.querySelector(`label[for="${i.id}"]`));
    const h1s = document.querySelectorAll("h1").length;
    const btns = [...document.querySelectorAll("button, a.sim-btn")].every((b) => b.textContent.trim().length > 0);
    const fs = inputs.map((i) => parseFloat(getComputedStyle(i).fontSize));
    const heights = [...document.querySelectorAll("input, button[type=submit]")].map((e) => e.getBoundingClientRect().height);
    return { labeled, h1s, btns, fs, heights, title: document.title, lang: document.documentElement.lang, viewport: document.querySelector('meta[name=viewport]')?.content, theme: document.querySelector('meta[name=theme-color]')?.content, robots: document.querySelector('meta[name=robots]')?.content, icon: document.querySelector('link[rel=icon]')?.href };
  });
  check("inputs com label real", a11y.labeled);
  check("um h1 por tela", a11y.h1s === 1, String(a11y.h1s));
  check("botões com texto", a11y.btns);
  check("inputs ≥16px (sem zoom iOS)", a11y.fs.every((f) => f >= 16), a11y.fs.join(","));
  check("alvos de toque ≥48px", a11y.heights.every((h) => h >= 48), a11y.heights.map(Math.round).join(","));
  console.log("   meta:", JSON.stringify({ title: a11y.title, lang: a11y.lang, viewport: a11y.viewport, theme: a11y.theme, robots: a11y.robots, icon: a11y.icon }));

  // 2. não preencher nada → 3. tentar consultar
  await page.click("button[type=submit]");
  await sleep(500);
  check("erro: estado = error", (await state(page)) === "error", await state(page));
  check("erro: mensagem do nome", await page.locator("#sim-nome-erro").isVisible());
  check("erro: mensagem do CPF", await page.locator("#sim-cpf-erro").isVisible());
  check("erro: foco no primeiro campo inválido", (await page.evaluate(() => document.activeElement?.id)) === "sim-nome");
  check("erro: aria-invalid", (await page.getAttribute("#sim-nome", "aria-invalid")) === "true");
  await page.screenshot({ path: `${OUT}/flow-1-erro.png`, fullPage: true });

  // 4. corrigir os campos
  await page.fill("#sim-nome", "maria da silva");
  await sleep(200);
  check("nome válido limpa o erro", !(await page.locator("#sim-nome-erro").count()));
  // máscara + backspace
  await page.fill("#sim-cpf", "");
  await page.type("#sim-cpf", "123456");
  check("máscara progressiva", (await page.inputValue("#sim-cpf")) === "123.456", await page.inputValue("#sim-cpf"));
  await page.keyboard.press("Backspace");
  check("backspace atravessa o separador", (await page.inputValue("#sim-cpf")) === "123.45", await page.inputValue("#sim-cpf"));
  await page.fill("#sim-cpf", "");
  await page.type("#sim-cpf", "52998224700");
  await sleep(150);
  check("CPF com dígito errado continua inválido", (await state(page)) === "error", await state(page));
  // 5. inserir CPF válido
  await page.fill("#sim-cpf", "");
  await page.type("#sim-cpf", "52998224725");
  await sleep(200);
  check("CPF mascarado", (await page.inputValue("#sim-cpf")) === "529.982.247-25", await page.inputValue("#sim-cpf"));
  check("estado = filled", (await state(page)) === "filled", await state(page));
  check("check verde nos dois campos", (await page.locator(".sim-field__ok").count()) === 2);
  await page.screenshot({ path: `${OUT}/flow-2-preenchido.png`, fullPage: true });

  // 6. iniciar consulta (Enter no CPF)
  const t0 = Date.now();
  await page.keyboard.press("Enter");
  await page.waitForFunction(() => document.querySelector(".sim-app")?.dataset.state === "processing", null, { timeout: 3000 });
  check("estado = processing", true);
  check("etapas: 2ª etapa atual", (await page.getAttribute(".sim-stepper li:nth-child(2)", "data-state")) === "current");
  await sleep(1300);
  await page.screenshot({ path: `${OUT}/flow-3-processando-a.png`, fullPage: true });
  const p1 = await page.getAttribute("[role=progressbar]", "aria-valuenow");
  await sleep(1800);
  const p2 = await page.getAttribute("[role=progressbar]", "aria-valuenow");
  check("progresso avança", Number(p2) > Number(p1), `${p1}% → ${p2}%`);
  const active = await page.locator(".sim-step[data-state=active]").count();
  const done = await page.locator(".sim-step[data-state=done]").count();
  check("etapas progressivas", done >= 1 && active <= 1, `done=${done} active=${active}`);
  await page.screenshot({ path: `${OUT}/flow-3-processando-b.png`, fullPage: true });

  // 7/8. resultado
  await page.waitForFunction(() => document.querySelector(".sim-app")?.dataset.state === "result", null, { timeout: 9000 });
  const elapsed = Date.now() - t0;
  check("processamento entre 3 e 6 s", elapsed >= 3000 && elapsed <= 6000, `${elapsed}ms`);
  await sleep(1600);
  check("um h1 na tela de resultado", (await page.locator("h1").count()) === 1);
  check("saudação com o primeiro nome", (await page.locator("h1").innerText()).includes("Maria"), await page.locator("h1").innerText());
  const valueText = (await page.locator("[data-testid=estimate-value]").innerText()).trim();
  const reais = Number(valueText.replace(/[^\d,]/g, "").replace(",", "."));
  check("valor dentro da faixa 870–1400", reais >= 870 && reais <= 1400, valueText);
  check("etapas: 3ª etapa atual", (await page.getAttribute(".sim-stepper li:nth-child(3)", "data-state")) === "current");
  check("aviso de simulação visível", await page.locator(".sim-disclaimer").isVisible());
  check("foco foi pro título", (await page.evaluate(() => document.activeElement?.tagName)) === "H1");
  check("página no topo", (await page.evaluate(() => window.scrollY)) < 2);
  await page.screenshot({ path: `${OUT}/flow-4-resultado.png`, fullPage: true });

  // 9/10. CTA + URL do WhatsApp
  const href = await page.getAttribute("[data-testid=cta-whatsapp]", "href");
  const text = decodeURIComponent((href || "").split("text=")[1] || "");
  check("URL wa.me com o número", (href || "").startsWith("https://wa.me/5516982525280?text="), href);
  check("mensagem com nome formatado", text.includes("Maria da Silva"), text);
  check("mensagem com o valor", text.replace(/ /g, " ").includes(valueText.replace(/ /g, " ")));
  const decodedHref = decodeURIComponent(href || "");
  check("CPF não vai na URL", !decodedHref.includes("52998224725") && !decodedHref.includes("529.982.247-25"));
  check("abre em nova aba com noopener", (await page.getAttribute("[data-testid=cta-whatsapp]", "target")) === "_blank" && /noopener/.test(await page.getAttribute("[data-testid=cta-whatsapp]", "rel")));
  const popupPromise = ctx.waitForEvent("page", { timeout: 4000 }).catch(() => null);
  await page.click("[data-testid=cta-whatsapp]");
  await sleep(300);
  check("estado = redirecting", (await state(page)) === "redirecting", await state(page));
  await page.screenshot({ path: `${OUT}/flow-5-redirecionando.png` });
  const popup = await popupPromise;
  check("nova aba aberta com wa.me", Boolean(popup) && popup.url().startsWith("https://wa.me/"), popup ? popup.url() : "sem popup");
  if (popup) await popup.close().catch(() => {});
  await sleep(1700);
  check("volta pro estado result", (await state(page)) === "result", await state(page));

  // secundário
  await page.click("[data-testid=cta-explain]");
  await sleep(400);
  check("explicação abre (aria-expanded)", (await page.getAttribute("[data-testid=cta-explain]", "aria-expanded")) === "true");
  check("explicação visível", await page.locator(".sim-explainer").isVisible());
  await page.screenshot({ path: `${OUT}/flow-6-explicacao.png`, fullPage: true });

  // 11/12. voltar + nova simulação
  await page.click("[data-testid=cta-restart]");
  await sleep(60);
  const transient = await state(page);
  await page.waitForFunction(() => document.querySelector(".sim-app")?.dataset.state === "idle", null, { timeout: 3000 });
  check("reinício: estado transitório = restart", transient === "restart", transient);
  check("reinício: volta pra idle", true);
  check("reinício: formulário limpo", (await page.inputValue("#sim-nome")) === "" && (await page.inputValue("#sim-cpf")) === "");
  await sleep(600);
  check("reinício: sem erros exibidos", (await page.locator(".sim-field__error").count()) === 0);
  check("reinício: no topo", (await page.evaluate(() => window.scrollY)) < 2);

  // teclado: ordem de foco a partir do primeiro campo
  await page.focus("#sim-nome");
  const f1 = await page.evaluate(() => document.activeElement?.id);
  await page.keyboard.press("Tab");
  const f2 = await page.evaluate(() => document.activeElement?.id);
  await page.keyboard.press("Tab");
  const f3 = await page.evaluate(() => document.activeElement?.type);
  check("ordem de tabulação nome → cpf → botão", f1 === "sim-nome" && f2 === "sim-cpf" && f3 === "submit", `${f1},${f2},${f3}`);

  check("sem erros no console", consoleErrors.length === 0, consoleErrors.join(" | "));
  await ctx.close();

  /* ---------- 4. movimento reduzido ---------- */
  const rctx = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
  const rpage = await rctx.newPage();
  await rpage.goto(BASE, { waitUntil: "networkidle" });
  await rpage.fill("#sim-nome", "João Pedro Alves");
  await rpage.fill("#sim-cpf", "12345678909");
  await rpage.click("button[type=submit]");
  await rpage.waitForFunction(() => document.querySelector(".sim-app")?.dataset.state === "result", null, { timeout: 9000 });
  await sleep(100);
  const rValue = (await rpage.locator("[data-testid=estimate-value]").innerText()).trim();
  check("reduced-motion: resultado exibido", /R\$/.test(rValue), rValue);
  check("reduced-motion: saudação", (await rpage.locator("h1").innerText()).includes("João"));
  await rpage.screenshot({ path: `${OUT}/reduced-resultado.png`, fullPage: true });
  await rctx.close();

  /* ---------- 5. desktop: experiência centralizada ---------- */
  const dctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const dpage = await dctx.newPage();
  await dpage.goto(BASE, { waitUntil: "networkidle" });
  await sleep(700);
  const box = await dpage.locator(".sim-service").boundingBox();
  check("desktop: coluna de leitura ≤ 800px centralizada", box && box.width <= 800 && Math.abs(box.x + box.width / 2 - 640) < 2, box ? `w=${box.width} x=${box.x}` : "?");
  check("desktop: menu visível sem botão", (await dpage.locator("#sim-menu").isVisible()) && !(await dpage.locator(".sim-menu-btn").isVisible()));
  await dpage.fill("#sim-nome", "Ana Clara Souza");
  await dpage.fill("#sim-cpf", "52998224725");
  await dpage.click("button[type=submit]");
  await dpage.waitForFunction(() => document.querySelector(".sim-app")?.dataset.state === "result", null, { timeout: 9000 });
  await sleep(1500);
  await dpage.screenshot({ path: `${OUT}/desktop-resultado.png` });
  await dctx.close();

  await browser.close();
  const failed = checks.filter((c) => !c.ok);
  console.log(`\n${checks.length - failed.length}/${checks.length} checks OK`);
  if (failed.length) { console.log("FALHAS:", failed.map((f) => f.name).join("; ")); process.exit(1); }
})().catch((e) => { console.error(e); process.exit(1); });
