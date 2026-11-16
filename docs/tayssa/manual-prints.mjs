// Tira os prints do Manual do painel (public/tayssa/manual/*.webp) do painel rodando LOCAL, com
// o banco de teste (só clientes falsas). Uso: node docs/tayssa/manual-prints.mjs <pasta> <id da Duda> <id da Carla>
// e depois converter para .webp (sharp, qualidade 80) em public/tayssa/manual/. Nunca rodar contra o site no ar.

// Prints do manual do painel: só dados falsos do banco local. Celular 390 @2x (o computador 1280 @1x... @2x também).
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("/opt/node22/lib/node_modules/playwright");
const BASE = "http://localhost:3014";
const OUT = process.argv[2];
const DUDA = process.argv[3];
const CARLA = process.argv[4];
const log = (...a) => console.log("•", ...a);
const browser = await chromium.launch({ args: ["--lang=pt-BR"] });
const celular = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: "pt-BR", timezoneId: "America/Sao_Paulo" };

async function contexto(opts) {
  const ctx = await browser.newContext(opts);
  await ctx.route(/google-analytics|googletagmanager/, (r) => r.abort());
  await ctx.grantPermissions(["notifications"], { origin: BASE });
  return ctx;
}
async function entrarAdmin(page) {
  await page.goto(BASE + "/tayssa/entrar/link?t=local-demo-admin-link", { waitUntil: "load" });
  await page.waitForTimeout(700);
  await page.locator("button", { hasText: "Entrar" }).first().evaluate((b) => b.click());
  await page.waitForURL((u) => !u.pathname.includes("/entrar"), { timeout: 20000 });
}
async function abrir(page, caminho) {
  await page.goto(BASE + caminho, { waitUntil: "load" });
  await page.waitForFunction(() => !document.querySelector("[hidden] .tya-pagehead"), null, { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1400);
}
const tela = async (page, nome) => { await page.screenshot({ path: `${OUT}/${nome}.png` }); log(nome); };
const peca = async (loc, nome, folga = 12) => {
  const p = loc.page();
  await p.addStyleTag({ content: ".tya-baixo{visibility:hidden!important}" });
  await loc.scrollIntoViewIfNeeded();
  await p.waitForTimeout(700);
  const b = await loc.boundingBox();
  const vw = p.viewportSize().width;
  const x = Math.max(0, b.x - folga);
  const topo = Math.max(0, b.y + (await p.evaluate(() => scrollY)) - folga);
  await p.screenshot({ path: `${OUT}/${nome}.png`, fullPage: true, clip: { x, y: topo, width: Math.min(vw - x, b.width + folga * 2), height: b.height + folga * 2 } });
  log(nome);
};

const ctx = await contexto(celular);
const page = await ctx.newPage();
page.on("pageerror", (e) => log("PAGEERROR", e.message));
try {
  await entrarAdmin(page);
  // Visão geral
  await abrir(page, "/tayssa/admin");
  await tela(page, "visao-geral");
  // menu (Mais)
  await page.locator(".tya-baixo__rotulo", { hasText: "Mais" }).first().evaluate((s) => s.closest("button,a").click());
  await page.waitForTimeout(900);
  await tela(page, "menu");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(500);
  // busca
  await abrir(page, "/tayssa/admin");
  await page.locator('[aria-label="Buscar no painel"], button:has-text("Buscar")').first().evaluate((b) => b.click());
  await page.waitForTimeout(700);
  await page.keyboard.type("agen");
  await page.waitForTimeout(500);
  await tela(page, "busca");
  await page.keyboard.press("Escape");

  // Agenda
  await abrir(page, "/tayssa/admin/agenda");
  await peca(page.locator("li.tya-slot", { hasText: "Gabi Exemplo" }).first(), "pedido");
  const elis = page.locator("li.tya-slot", { hasText: "Elis Simulada" }).first();
  await elis.locator("button", { hasText: "Corrigir data" }).first().evaluate((b) => b.click());
  await page.waitForTimeout(600);
  await peca(elis, "corrigir-data");
  // a semana
  const semana = page.locator("section", { has: page.locator("h2", { hasText: "Semana" }) }).first();
  await peca(semana, "semana");

  // Relatórios
  await abrir(page, "/tayssa/admin/relatorios");
  await tela(page, "relatorios");

  // ficha da Carla (cliente nova)
  await abrir(page, `/tayssa/admin/clientes/${CARLA}`);
  await tela(page, "nova-cliente");

  // ficha da Duda: corrigir pontos
  await abrir(page, `/tayssa/admin/clientes/${DUDA}`);
  const cp = page.locator("#corrigir-pontos").first();
  await cp.scrollIntoViewIfNeeded();
  await cp.locator("button,label", { hasText: "Tirar pontos" }).first().evaluate((b) => b.click());
  await page.waitForTimeout(500);
  const sel = cp.locator("select").first();
  const opcoes = await sel.locator("option").allInnerTexts();
  const alvo = opcoes.find((o) => /Manuten/i.test(o));
  if (alvo) await sel.selectOption({ label: alvo });
  await page.waitForTimeout(700);
  await peca(cp, "corrigir-pontos");

  // Configurações: o serviço com o valor da manutenção
  await abrir(page, "/tayssa/admin/configuracoes");
  const form = page.locator('form:has(input[value="Volume brasileiro"])').first();
  await peca(form, "servico");
} catch (e) {
  log("FALHOU (admin celular):", e.message.split("\n")[0]);
  await page.screenshot({ path: `${OUT}/erro-admin.png` });
}
await ctx.close();

// topo do painel no computador
const ctxPc = await contexto({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2, locale: "pt-BR", timezoneId: "America/Sao_Paulo" });
const pc = await ctxPc.newPage();
try {
  await entrarAdmin(pc);
  await abrir(pc, "/tayssa/admin");
  await peca(pc.locator("header.tya-top").first(), "topo");
} catch (e) {
  log("FALHOU (computador):", e.message.split("\n")[0]);
}
await ctxPc.close();

// a folha de agendar do site, com dois serviços (sem login: nenhum nome aparece)
const ctxSite = await contexto(celular);
const site = await ctxSite.newPage();
try {
  await site.goto(BASE + "/tayssa", { waitUntil: "load" });
  await site.waitForTimeout(1500);
  await site.locator('a[aria-haspopup="dialog"]').first().evaluate((a) => a.click());
  const folha = site.locator("dialog.tyag[open]");
  await folha.waitFor({ timeout: 10000 });
  await site.waitForTimeout(900);
  const chips = folha.locator("label.tyag__chip--servico");
  const nomes = (await chips.allInnerTexts()).map((t) => t.split("\n")[0]);
  await chips.nth(nomes.findIndex((n) => !/manuten/i.test(n))).locator("input").evaluate((x) => x.click());
  await site.waitForTimeout(500);
  await folha.locator("button.tyag__mais").evaluate((b) => b.click()).catch(() => {});
  await folha.locator("button.tyag__adicionar").evaluate((b) => b.click()).catch(() => {});
  await site.waitForTimeout(500);
  const nomes2 = (await folha.locator("label.tyag__chip--servico").allInnerTexts()).map((t) => t.split("\n")[0]);
  const i2 = nomes2.findIndex((n) => /design/i.test(n));
  if (i2 < 0) {
    await folha.locator("button.tyag__mais").evaluate((b) => b.click()).catch(() => {});
    await site.waitForTimeout(400);
  }
  const nomes3 = (await folha.locator("label.tyag__chip--servico").allInnerTexts()).map((t) => t.split("\n")[0]);
  await folha.locator("label.tyag__chip--servico").nth(Math.max(0, nomes3.findIndex((n) => /design/i.test(n)))).locator("input").evaluate((x) => x.click());
  await site.waitForTimeout(900);
  await site.screenshot({ path: `${OUT}/folha-varios.png` });
  log("folha-varios");
} catch (e) {
  log("FALHOU (site):", e.message.split("\n")[0]);
  await site.screenshot({ path: `${OUT}/erro-site.png` });
}
await browser.close();
