// Carrossel "Agenda de Dezembro" (@snts_beauty, Thais, nail designer): 5 lâminas 1080 x 1350.
// Renderiza em 2x e o reduz.py leva para 1080 x 1350 (JPEG).
// Uso: NODE_PATH=$(npm root -g) node build.mjs [1,2,...]
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
const { chromium } = createRequire(import.meta.url)('playwright');

const DIR = path.dirname(new URL(import.meta.url).pathname);
const OUT = path.join(DIR, 'out');
fs.mkdirSync(OUT, { recursive: true });
const only = process.argv[2] ? process.argv[2].split(',').map(Number) : null;

const coracao = '<svg viewBox="0 0 24 24"><path d="M12 20.3c-4-2.7-7.6-5.9-7.6-9.9 0-2.4 1.8-4.2 4-4.2 1.6 0 2.9.9 3.6 2.3.8-1.5 2.1-2.4 3.7-2.4 2.2 0 3.9 1.8 3.9 4.3 0 4-3.6 7.2-7.6 9.9z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>';
const aviao = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M21.5 3 9.6 14.9M21.5 3l-7 18-4.9-6.1L3.5 10z"/></svg>';
const enfeite = `<div class="enfeite"><i></i>${coracao}<i></i></div>`;
const pe = (tom) => `<div class="pe pe--${tom}"><span>Thais · Nail Designer</span><span>@snts_beauty</span></div>`;
const peCartao = `<div class="pe-cartao"><span>Thais · Nail Designer</span><i></i><span>@snts_beauty</span></div>`;
const valor = (v) => `<sup>R$</sup>${v}`;
const item = (nome, v, sub = '') => `<li><span class="nome">${nome}${sub ? `<small>${sub}</small>` : ''}</span><span class="pontos"></span><span class="valor">${valor(v)}</span></li>`;

function capa() {
  // recorte 1128 x 1429; altura na lâmina 1150
  const h = 1010, w = Math.round(1128 * h / 1429), l = 1080 - w + 40, t = 380;
  return `<img class="bg" src="img/fundo-capa.jpg">
    <div class="abs script agenda">Agenda de</div>
    <div class="abs rotulo ano">2026</div>
    <div class="abs dez" data-fit="932">DEZEMBRO</div>
    <img class="foto" src="img/thais-recorte.png" style="left:${l}px;top:${t}px;width:${w}px;height:${h}px">
    <img class="laco-frente" src="img/laco-capa.png">
    <div class="abs rotulo assina">Thais · Nail Designer</div>
    <div class="abs chamada"><p>Tudo o que você precisa saber para <b>garantir o seu horário</b></p>
      <div class="arraste rotulo"><span>arraste</span><i></i></div></div>
    <div class="abs ig">@snts_beauty</div>`;
}

function horarios() {
  // dezembro de 2026 começa numa terça; semana começando no domingo
  const folgas = { 2: 1, 14: 1 };
  let dias = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((s) => `<div class="sem">${s}</div>`).join('');
  for (let i = 0; i < 2; i++) dias += '<div class="d fora">.</div>';
  for (let d = 1; d <= 31; d++) dias += `<div class="d${folgas[d] ? ' folga' : ''}"><span>${String(d).padStart(2, '0')}</span></div>`;
  return `<img class="bg" src="img/fundo-cereja.jpg">
    <div class="abs rotulo topo">Dezembro 2026</div>
    <div class="abs tit"><span class="script">Horário de</span><h2>atendimento</h2></div>
    <div class="abs horas">07h<em>às</em>21h</div>
    <div class="cal">
      <div class="cal__cab"><span class="script">Dezembro</span><span class="rotulo">2026</span></div>
      <div class="cal__grade">${dias}</div>
      <div class="cal__leg"><span class="bola"></span><p><b>02/12</b> (quarta) e <b>14/12</b> (segunda): não haverá atendimento.</p></div>
      <div class="cal__taxa"><span class="selo">+ R$ 30</span><p>O <b>primeiro</b> e o <b>último</b> horário de qualquer dia têm adicional de R$ 30.</p></div>
    </div>
    ${pe('creme')}`;
}

function valores1() {
  return `<img class="bg" src="img/fundo-creme-1.jpg">
    <div class="cartao" style="left:118px;right:118px;top:150px">
      <div class="cab"><div class="script">Valores</div><h2>Extensão e gel</h2></div>
      ${enfeite}
      <ul class="itens">
        ${item('Aplicação simples', '160')}
        ${item('Aplicação decorada', '175')}
        ${item('Manutenção simples', '140')}
        ${item('Manutenção decorada', '150')}
        ${item('Banho de gel', '120')}
        ${item('Manutenção banho de gel', '105')}
      </ul>
      <div class="nota"><p>Manutenção de unhas feitas por outra profissional</p><b>+ R$ 30</b></div>
    </div>
    ${peCartao}`;
}

function valores2() {
  return `<img class="bg" src="img/fundo-creme-2.jpg">
    <div class="cartao" style="left:118px;right:118px;top:250px">
      <div class="cab"><div class="script">Valores</div><h2>Esmaltação e<br>tradicionais</h2></div>
      ${enfeite}
      <ul class="itens">
        ${item('Esmaltação em gel', '80', 'pé e mão')}
        ${item('Manicure tradicional', '40')}
        ${item('Pedicure tradicional', '50')}
        ${item('Combo tradicional', '80')}
      </ul>
    </div>
    ${peCartao}`;
}

function fim() {
  return `<img class="bg" src="img/fundo-cereja-esq.jpg">
    <div class="quadro"><img src="img/thais-azul.jpg" style="object-position:50% 22%"></div>
    <div class="abs txt"><span class="script">Garanta o seu</span><h2>horário</h2>
      <p>Agendamentos e informações pelo direct</p></div>
    <div class="abs pilula">${aviao}<span>@snts_beauty</span></div>
    <div class="abs rotulo salve">Salve este post para não esquecer</div>`;
}

const LAMINAS = [['capa', capa], ['hor', horarios], ['val', valores1], ['val', valores2], ['fim', fim]];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 2 });
for (let i = 0; i < LAMINAS.length; i++) {
  if (only && !only.includes(i + 1)) continue;
  const [cls, fn] = LAMINAS[i];
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><link rel="stylesheet" href="style.css"></head><body><div class="slide ${cls}">${fn()}</div></body></html>`;
  const file = path.join(DIR, `_l${i + 1}.html`);
  fs.writeFileSync(file, html);
  await page.goto('file://' + file);
  await page.evaluate(async () => {
    await document.fonts.ready;
    for (const el of document.querySelectorAll('[data-fit]')) {
      const alvo = +el.dataset.fit; const r = document.createRange(); r.selectNodeContents(el);
      const w = r.getBoundingClientRect().width; const fs = parseFloat(getComputedStyle(el).fontSize);
      el.style.fontSize = (fs * alvo / w) + 'px';
    }
  });
  await page.waitForTimeout(250);
  const n = String(i + 1).padStart(2, '0');
  await page.screenshot({ path: path.join(OUT, `snts-dezembro-${n}.png`) });
  console.log('ok', n);
}
await browser.close();
