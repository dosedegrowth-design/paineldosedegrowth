// Carrossel "Agenda de Dezembro" (Tayssa Farias): 5 lâminas 1080x1350.
// Renderiza em 2x; o reduz.py leva para 1080 x 1350.
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import http from 'http';
const { chromium } = createRequire(import.meta.url)('playwright');

const DIR = path.dirname(new URL(import.meta.url).pathname);
const OUT = path.join(DIR, 'out');
fs.mkdirSync(path.join(OUT, 'laminas'), { recursive: true });
fs.mkdirSync(path.join(OUT, 'fundos'), { recursive: true });
const pecas = fs.readFileSync(path.join(DIR, 'pecas.js'), 'utf8');
const only = process.argv[2] ? process.argv[2].split(',').map(Number) : null;
const EXT = fs.existsSync(path.join(DIR, 'canva/capa.jpg')) ? 'jpg' : 'png';
const FEXT = fs.existsSync(path.join(DIR, 'fotos/capa-final.webp')) ? 'webp' : 'png';

// ---------- peças ----------
const papel = (cls, conteudo, { x, y, w, h = 'auto', rot = 0, rasgo = 'trbl', seed = 1, amp = 7, z = 3, estilo = '' } = {}) =>
  `<div class="papel-w ${cls}" style="left:${x}px;top:${y}px;width:${w}px;${h === 'auto' ? '' : `height:${h}px;`}transform:rotate(${rot}deg);z-index:${z};${estilo}"><div class="papel" data-rasgo="${rasgo}" data-seed="${seed}" data-amp="${amp}">${conteudo}</div></div>`;
const fita = ({ x, y, w = 170, h = 46, rot = 0, seed = 3, cor = '' }) =>
  `<div class="fita${cor ? ' fita--' + cor : ''}" data-rasgo="lr" data-seed="${seed}" data-amp="6" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;transform:rotate(${rot}deg)"></div>`;
const clipe = ({ x, y, rot = 0, s = 1 }) =>
  `<svg class="clipe" viewBox="0 0 24 60" style="left:${x}px;top:${y}px;width:${36 * s}px;height:${90 * s}px;transform:rotate(${rot}deg)"><defs><linearGradient id="gc" x1="0" x2="1"><stop offset="0" stop-color="#9c7a42"/><stop offset=".5" stop-color="#f3dfaa"/><stop offset="1" stop-color="#a8854c"/></linearGradient></defs><path d="M7 50V12a5 5 0 0 1 10 0v38a7.5 7.5 0 0 1-15 0V16" fill="none" stroke="url(#gc)" stroke-width="2.6" stroke-linecap="round"/></svg>`;
const estrela = ({ x, y, s = 40, rot = 0, cor = 'var(--bordo)' }) =>
  `<svg class="rabisco" viewBox="0 0 24 24" style="left:${x}px;top:${y}px;width:${s}px;height:${s}px;transform:rotate(${rot}deg);color:${cor}"><path d="M12 2.6l2.5 6.2 6.8.5-5.3 4.3 1.8 6.7L12 16.5l-5.9 3.8 1.8-6.7-5.2-4.4 6.8-.4z" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>`;
const coracao = ({ x, y, s = 44, rot = 0 }) =>
  `<svg class="rabisco" viewBox="0 0 24 24" style="left:${x}px;top:${y}px;width:${s}px;height:${s}px;transform:rotate(${rot}deg)"><path d="M12 20.3c-4-2.7-7.6-5.9-7.6-9.9 0-2.4 1.8-4.2 4-4.2 1.6 0 2.9.9 3.6 2.3.8-1.5 2.1-2.4 3.7-2.4 2.2 0 3.9 1.8 3.9 4.3 0 4-3.6 7.2-7.6 9.9z" fill="none" stroke="var(--bordo)" stroke-width="1.2" stroke-linejoin="round"/></svg>`;
const lacre = ({ x, y, s = 150, rot = 0 }) =>
  `<svg class="lacre" viewBox="0 0 100 100" style="left:${x}px;top:${y}px;width:${s}px;height:${s}px;transform:rotate(${rot}deg)"><defs><radialGradient id="gl" cx="38%" cy="32%" r="70%"><stop offset="0" stop-color="#b03352"/><stop offset=".55" stop-color="#7a1530"/><stop offset="1" stop-color="#4a0d1f"/></radialGradient></defs>
  <path d="M50 4c9 0 12 6 20 8s14 3 17 11-1 13 2 21 6 13 1 20-13 6-18 12-8 15-22 15-15-9-22-15-15-4-18-12 2-13-1-20 0-15 6-21 8-3 15-8 11-11 20-11z" fill="url(#gl)"/>
  <circle cx="50" cy="51" r="30" fill="none" stroke="#3a0715" stroke-opacity=".55" stroke-width="2.4"/><circle cx="50" cy="51" r="30" fill="none" stroke="#d97a92" stroke-opacity=".35" stroke-width="1" transform="translate(-.8 -.8)"/>
  <path d="M50 30l5 11.5 12.5 1-9.6 8 3 12.2L50 56l-10.9 6.7 3-12.2-9.6-8 12.5-1z" fill="#5c0f24" stroke="#d97a92" stroke-opacity=".45" stroke-width=".8"/></svg>`;
const IC = {
  relogio: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/>',
  pessoas: '<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="9.5" r="2.4"/><path d="M15.6 14.2a4.4 4.4 0 0 1 5.4 4.3"/><path d="M3 3l18 18"/>',
  sinal: '<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6.5 9.5v.01M17.5 14.5v.01"/>',
  calendario: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/><path d="M9.5 15.5l2 2 3.5-4"/>',
};
const ic = (k) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${IC[k]}</svg>`;
const marca = (estilo = '') => `<div class="marca" style="${estilo}">TAYSSA <b>FARIAS</b></div>`;
const faixa = (texto, o) => papel('faixa', `<span>${texto}</span>`, { rasgo: 'tb', amp: 9, ...o });

// ---------- lâminas ----------
function capa() {
  const k = 0.38, fw = 2755, fh = 2591, W = Math.round(fw * k), H = Math.round(fh * k), l = 500 - Math.round(1080 * k), t = 880 - Math.round(800 * k);
  const foto = `fotos/capa-final.${FEXT}`, mk = 'fotos/capa-mask.png';
  const mask = `-webkit-mask-image:url(${mk});mask-image:url(${mk});-webkit-mask-size:${W}px ${H}px;mask-size:${W}px ${H}px;-webkit-mask-position:${l}px ${t}px;mask-position:${l}px ${t}px;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat`;
  return `
    <div class="grande grande--cheio" data-fit="960" style="top:96px">AGENDA</div>
    <img class="foto adesivo" src="${foto}" style="left:${l}px;top:${t}px;width:${W}px;height:${H}px">
    <div class="sobre-foto" style="${mask}"><div class="grande grande--vazado" data-fit="960" style="top:96px">AGENDA</div></div>
    ${faixa('DE DEZEMBRO', { x: 170, y: 342, w: 740, rot: -2.2, seed: 11, z: 6 })}
    ${fita({ x: 140, y: 350, w: 120, rot: -38, seed: 4 })}${fita({ x: 840, y: 360, w: 120, rot: 32, seed: 5 })}
    ${papel('bilhete', `<p>As datas de abertura estão chegando.</p><p><em>Prepare-se para garantir seu horário!</em></p><svg class="risco" viewBox="0 0 300 30"><path d="M6 18c40-10 90-12 140-6s90 8 120-4" fill="none" stroke="var(--bordo)" stroke-width="2.2" stroke-linecap="round"/></svg>`, { x: 742, y: 700, w: 300, rot: 3, seed: 21, z: 7 })}
    ${fita({ x: 830, y: 684, w: 120, rot: -4, seed: 8 })}
    ${coracao({ x: 940, y: 1040, s: 50, rot: 12 })}
    ${estrela({ x: 80, y: 640, s: 44, rot: -10 })}${estrela({ x: 980, y: 580, s: 38, rot: 14 })}
    ${papel('etiqueta', marca(), { x: 70, y: 1210, w: 330, rot: -1.5, seed: 31, z: 7, rasgo: 'lr', amp: 5 })}
    ${clipe({ x: 52, y: 1180, rot: -14, s: 0.9 })}
    <div class="deslize">deslize <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></div>`;
}

const data = (dia, mes, semana, texto, o) => papel('bilhete-data', `
  <div class="d-num">${dia}</div>
  <div class="d-txt"><div class="d-mes">${mes}</div><div class="d-sem">${semana}</div><p>${texto}</p></div>`, o);

function abertura() {
  return `
    ${faixa('ABERTURA DA AGENDA', { x: 120, y: 120, w: 840, rot: -1.6, seed: 41, z: 6 })}
    ${fita({ x: 90, y: 128, w: 110, rot: -30, seed: 2 })}
    ${data('12', 'DE NOVEMBRO', 'quinta-feira', 'Abertura exclusiva para <strong>clientes fixas e VIP</strong>.', { x: 90, y: 340, w: 840, rot: -1.8, seed: 51, z: 5 })}
    ${fita({ x: 430, y: 322, w: 160, rot: 3, seed: 9 })}
    ${lacre({ x: 840, y: 520, s: 132, rot: 10 })}
    ${data('14', 'DE NOVEMBRO', 'sábado', 'Abertura para as <strong>demais clientes</strong>.', { x: 150, y: 760, w: 840, rot: 1.6, seed: 61, z: 5 })}
    ${clipe({ x: 912, y: 700, rot: 10 })}
    ${estrela({ x: 70, y: 1150, s: 42, rot: -8 })}${coracao({ x: 140, y: 690, s: 40, rot: -14 })}
    ${papel('marca-papel', marca(), { x: 390, y: 1232, w: 300, rot: -1, rasgo: 'lr', amp: 5, seed: 77, z: 8 })}`;
}

function horarios() {
  const linha = (dias, ini, fim) => papel('etiqueta-hora', `
    <div class="h-dias">${dias}</div>
    <div class="h-grade"><div><b>${ini}</b><span>início dos<br>atendimentos</span></div><i></i><div><b>${fim}</b><span>último<br>horário</span></div></div>`,
    { x: 0, y: 0, w: 450 });
  return `
    ${faixa('HORÁRIOS DE ATENDIMENTO', { x: 90, y: 104, w: 900, rot: 1.4, seed: 71, z: 6 })}
    <div class="dupla" style="top:270px">
      ${linha('Segunda a sábado', '07h', '21h').replace('papel-w etiqueta-hora', 'papel-w etiqueta-hora e1')}
      ${linha('Domingos', '07h', '17h').replace('papel-w etiqueta-hora', 'papel-w etiqueta-hora e2')}
    </div>
    ${fita({ x: 250, y: 254, w: 120, rot: -6, seed: 13 })}${fita({ x: 720, y: 258, w: 120, rot: 5, seed: 14 })}
    ${papel('taxa', `<div class="rotulo">TAXA DE HORÁRIO ESPECIAL</div><div class="taxa__valor">+ R$ 30,00</div><p>Acréscimo de R$ 30,00 <strong>somente no primeiro e no último horário</strong> de atendimento de cada dia.</p>`, { x: 110, y: 650, w: 860, rot: -1, seed: 81, z: 5 })}
    ${clipe({ x: 120, y: 612, rot: -12 })}
    ${papel('excecao', `<div class="exc__cab"><span class="rotulo">EXCEÇÃO</span><span class="exc__dia">dia 24/12</span></div>
      <ul><li><b>06h</b><span>primeiro horário</span></li><li><b>15h</b><span>último horário</span></li><li><b>R$ 30,00</b><span>de acréscimo em qualquer horário agendado</span></li></ul>`, { x: 150, y: 952, w: 800, rot: 1.2, seed: 91, z: 5 })}
    ${fita({ x: 820, y: 936, w: 130, rot: 18, seed: 16 })}
    ${estrela({ x: 960, y: 610, s: 40, rot: 10 })}
    ${papel('marca-papel', marca(), { x: 390, y: 1250, w: 300, rot: 1, rasgo: 'lr', amp: 5, seed: 78, z: 8 })}`;
}

function avisos() {
  const item = (k, n, tit, txt) => `<li><span class="av__ic">${ic(k)}</span><div><div class="av__tit"><em>${n}</em> ${tit}</div><p>${txt}</p></div></li>`;
  return `
    <div class="envelope" style="left:110px;top:150px;transform:rotate(-3deg)"><div class="envelope__aba"></div></div>
    ${papel('carta', `
      <div class="carta__cab"><h2>Avisos importantes</h2></div>
      <ol class="avisos">
        ${item('relogio', '01', 'Tolerância de atraso', '10 minutos.')}
        ${item('pessoas', '02', 'Acompanhantes e crianças', 'Por segurança e conforto, não é permitida a entrada de acompanhantes nem de crianças durante o atendimento.')}
        ${item('sinal', '03', 'Sinal para agendamento', 'R$ 50,00 via Pix, descontado do valor final do procedimento.')}
        ${item('calendario', '04', 'Cancelamentos, reagendamentos e faltas', 'Reagendando com 48 horas ou mais de antecedência, o sinal vale para a nova data. Com menos de 48 horas, em cancelamentos ou faltas, o sinal não é devolvido.')}
      </ol>`, { x: 120, y: 92, w: 840, rot: 1.2, seed: 101, z: 5, rasgo: 'b', amp: 6 })}
    ${fita({ x: 455, y: 72, w: 170, rot: -2, seed: 17 })}
    ${papel('ajuste', '<p><em>AVISO</em>Tivemos ajuste de valores.</p>', { x: 230, y: 1050, w: 520, rot: -2, seed: 141, z: 7 })}
    ${fita({ x: 640, y: 1036, w: 120, rot: 24, seed: 21 })}
    ${lacre({ x: 820, y: 1100, s: 140, rot: -12 })}
    ${coracao({ x: 70, y: 1180, s: 46, rot: -10 })}
    ${papel('marca-papel', marca(), { x: 640, y: 1240, w: 300, rot: -1.5, rasgo: 'lr', amp: 5, seed: 79, z: 8 })}`;
}

function calendario() {
  const semana = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  const inicio = new Date(Date.UTC(2026, 11, 1)).getUTCDay(); // 2 = terça
  let cel = semana.map((d) => `<div class="cal__sem">${d}</div>`).join('');
  for (let i = 0; i < inicio; i++) cel += '<div></div>';
  for (let d = 1; d <= 31; d++) {
    const tipo = d === 24 ? ' esp' : [25, 30, 31].includes(d) ? ' sem' : '';
    const marca = d === 24 ? '<svg class="circ" viewBox="0 0 100 100"><path d="M50 8c26 0 43 16 43 40s-19 44-45 44S6 74 7 48 26 6 55 9" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/></svg>'
      : tipo ? '<svg class="xis" viewBox="0 0 100 100"><path d="M22 20c20 22 38 42 58 62M78 18C58 40 40 60 22 82" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>' : '';
    cel += `<div class="cal__dia${tipo}"><span>${d}</span>${marca}</div>`;
  }
  return `
    ${faixa('CALENDÁRIO DE DEZEMBRO', { x: 110, y: 84, w: 860, rot: -1.2, seed: 111, z: 6 })}
    ${papel('folha-cal', `<div class="cal__cab"><h2>Dezembro</h2><span>2026</span></div><div class="cal">${cel}</div>`, { x: 120, y: 236, w: 840, rot: 0.8, seed: 121, z: 5, rasgo: 't', amp: 6 })}
    ${fita({ x: 160, y: 222, w: 140, rot: -10, seed: 18 })}${fita({ x: 780, y: 226, w: 140, rot: 9, seed: 19 })}
    ${papel('legenda', `
      <div class="leg"><span class="leg__m leg__m--esp"></span><p><b>24/12</b> Atendimento especial, das 06h às 15h. Taxa de R$ 30,00 em qualquer horário.</p></div>
      <div class="leg"><span class="leg__m leg__m--sem"></span><p><b>25/12, 30/12 e 31/12</b> Não haverá atendimento.</p></div>
      <div class="leg"><span class="leg__m"></span><p>Os demais dias seguem a programação especial de fim de ano.</p></div>`, { x: 150, y: 960, w: 790, rot: -1, seed: 131, z: 6 })}
    ${clipe({ x: 928, y: 520, rot: 8 })}
    ${estrela({ x: 70, y: 980, s: 40, rot: -12 })}
    ${papel('marca-papel', marca(), { x: 690, y: 1252, w: 300, rot: 1, rasgo: 'lr', amp: 5, seed: 80, z: 8 })}`;
}

const SLIDES = [
  { n: 1, bg: 'capa', html: capa() },
  { n: 2, bg: 'interna-a', html: abertura() },
  { n: 3, bg: 'interna-b', html: horarios() },
  { n: 4, bg: 'interna-a', flip: true, html: avisos() },
  { n: 5, bg: 'interna-b', flip: true, html: calendario() },
];

function page(s) {
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
  <link rel="stylesheet" href="fonts/fonts.css"><link rel="stylesheet" href="style.css"></head>
  <body><div class="slide l${s.n}"><img class="bg${s.flip ? ' bg--flip' : ''}" src="canva/${s.bg}.${EXT}"><div class="fg">${s.html}</div></div>
  <script>${pecas}</script>
  <script>
    Promise.all([document.fonts.ready, ...[...document.images].map(i => i.decode().catch(() => {}))]).then(() => {
      document.querySelectorAll('[data-fit]').forEach(el => { el.style.fontSize = '200px'; const w = el.getBoundingClientRect().width; el.style.fontSize = (200 * (+el.dataset.fit) / w) + 'px'; });
      montarPecas();
      document.body.dataset.ready = '1';
    });
  </script></body></html>`;
}

const TIPOS = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2' };
const srv = http.createServer((req, res) => {
  const f = path.join(DIR, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!f.startsWith(DIR) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': TIPOS[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const BASE = `http://127.0.0.1:${srv.address().port}/`;
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
for (const s of SLIDES) {
  if (only && !only.includes(s.n)) continue;
  const file = `_d${s.n}.html`;
  fs.writeFileSync(path.join(DIR, file), page(s));
  await p.goto(BASE + file);
  await p.waitForSelector('body[data-ready="1"]');
  await p.waitForTimeout(150);
  const nn = String(s.n).padStart(2, '0');
  await p.screenshot({ path: path.join(OUT, 'laminas', `tayssa-dezembro-${nn}.png`) });
  await p.addStyleTag({ content: '.fg{display:none!important}' });
  await p.screenshot({ path: path.join(OUT, 'fundos', `tayssa-dezembro-fundo-${nn}.png`) });
  console.log('ok', nn);
}
await browser.close();
srv.close();
