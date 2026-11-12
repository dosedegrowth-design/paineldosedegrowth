// Gera as 11 lâminas do carrossel (1080x1350): fundo limpo + lâmina com texto.
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
const { chromium } = createRequire(import.meta.url)('playwright');

const DIR = path.dirname(new URL(import.meta.url).pathname);
const OUT = path.join(DIR, 'out');
fs.mkdirSync(path.join(OUT, 'laminas'), { recursive: true });
fs.mkdirSync(path.join(OUT, 'fundos'), { recursive: true });
const painter = fs.readFileSync(path.join(DIR, 'painter.js'), 'utf8');
const WA = fs.readFileSync(path.join(DIR, 'wa-path.txt'), 'utf8').trim();
const only = process.argv[2] ? process.argv[2].split(',').map(Number) : null;

// ---------- ícones (traço) ----------
const I = {
  calendario: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  cartao: '<rect x="2" y="5" width="20" height="14" rx="2.5"/><circle cx="7.5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="16.5" cy="12" r="1.6"/>',
  presente: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
  bolo: '<path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1"/><path d="M2 21h20M7 8v3M12 8v3M17 8v3"/><path d="M7 4.5h.01M12 4.5h.01M17 4.5h.01"/>',
  relogio: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  ampulheta: '<path d="M6 2h12M6 22h12M7 2v4.5a5 5 0 0 0 2.4 4.3L12 12l2.6-1.2A5 5 0 0 0 17 6.5V2M7 22v-4.5a5 5 0 0 1 2.4-4.3L12 12l2.6 1.2A5 5 0 0 1 17 17.5V22"/>',
  antecedencia: '<path d="M21 8V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4M16 2v4M8 2v4M3 10h6"/><circle cx="17" cy="17" r="5"/><path d="M17 15v2.2l1.4 1"/>',
  remarcar: '<path d="M3 12a9 9 0 0 1 15.3-6.4L21 8M21 3v5h-5M21 12a9 9 0 0 1-15.3 6.4L3 16M3 21v-5h5"/>',
  estrela: '<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/>',
};
const ico = (k) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${I[k]}</svg>`;
const wa = `<svg class="wa" viewBox="0 0 24 24"><path fill="#25D366" ${WA}/></svg>`;

const marca = `<span class="marca">TAYSSA <b>FARIAS</b></span>`;
const topo = (n, dark) => `<header class="topo${dark ? ' topo--noite' : ''}">${marca}</header>`;
const pe = (dark) => `<footer class="pe${dark ? ' pe--noite' : ''}"><span>tayssafarias.com.br</span><span class="seta"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></footer>`;
const passos = (arr) => `<ol class="passos">${arr.map((t, i) => `<li><span class="n">${i + 1}</span><p>${t}</p></li>`).join('')}</ol>`;

// ---------- roteiro ----------
const SLIDES = [
  { n: 1, kind: 'capa', img: { src: 'canva/capa.jpg', flip: 0 }, bg: { seed: 31, items: [{ t: 'tree', x: 235, top: 600, base: 1150, w: 420 }, { t: 'dust', x0: 0, y0: 0, x1: 1080, y1: 600, n: 26 }] } },
  {
    n: 2, img: { src: 'canva/interna-a.jpg', flip: 0 }, bg: { seed: 12, items: [{ t: 'corner', at: 'top-right', size: 0.95 }] },
    html: `<div class="cabeca"><div class="eyebrow">AGENDAR FICOU FÁCIL</div>
      <h1>Você mesma agenda, a qualquer hora</h1></div><div class="conteudo">
      ${passos(['Escolha o serviço, o dia e o horário', 'Crie sua conta com o seu WhatsApp e uma senha <em>(só na primeira vez)</em>', '<strong>Pronto:</strong> o horário fica guardado para você'])}</div>`,
  },
  {
    n: 3, img: { src: 'canva/interna-a.jpg', flip: 0 }, bg: { seed: 23, items: [{ t: 'corner', at: 'top-right', size: 0.9 }] },
    html: `<div class="cabeca"><div class="eyebrow">O SINAL EM UM MINUTO</div>
      <h1 class="h1--estreito">Sinal de R$&nbsp;50 no Pix, sem esperar resposta</h1></div><div class="conteudo">
      ${passos(['Copie o código Pix <em>(o valor já vem nele)</em>', 'Anexe o comprovante ali mesmo, no site', `Envie o cartão do seu horário para a Tayssa no WhatsApp ${wa}`])}
      <p class="nota">${ico('relogio')}<span>Seu horário fica guardado por 24 horas esperando o sinal.</span></p></div>`,
  },
  {
    n: 4, img: { src: 'canva/interna-a.jpg', flip: 0 }, bg: { seed: 44, items: [{ t: 'corner', at: 'top-right', size: 0.95 }] },
    html: `<div class="cabeca"><div class="eyebrow">TUDO NA PALMA DA MÃO</div>
      <h1 class="h1--gigante">Meus horários</h1></div><div class="conteudo">
      <div class="abas"><span>Realizados</span><span class="ativa">Em aberto</span><span>Marcar</span></div>
      <p class="corpo">O que está em aberto, o que você já fez e um botão para marcar de novo.</p>
      <p class="corpo corpo--destaque">Precisa desmarcar? É por lá também.</p></div>`,
  },
  {
    n: 5, img: { src: 'canva/interna-a.jpg', flip: 0 }, bg: { seed: 55, items: [{ t: 'corner', at: 'top-right', size: 0.95 }] },
    html: `<div class="cabeca"><figure class="arco arco--par arco--p1"><img src="fotos/cilios-volume.jpg"></figure><figure class="arco arco--par arco--p2"><img src="fotos/cilios-mega.jpg"></figure>
      <h1 class="h1--valores">Cílios: valores e tempo</h1></div><div class="conteudo">
      <ul class="precos precos--cilios">
        <li><span class="nome">Volume brasileiro, inglês ou egípcio<small>manutenção a partir de R$ 120</small></span><span class="val">R$ 170 · 3h</span></li>
        <li><span class="nome">Volume Fox eyes<small>manutenção a partir de R$ 130</small></span><span class="val">R$ 185 · 3h</span></li>
        <li><span class="nome">Mega Volume Inglês<small>manutenção a partir de R$ 150</small></span><span class="val">R$ 200 · 3h</span></li>
        <li><span class="nome">Mega Brasileiro<small>manutenção a partir de R$ 150</small></span><span class="val">R$ 190 · 3h</span></li>
        <li><span class="nome">Mega Fox<small>manutenção a partir de R$ 180</small></span><span class="val">R$ 230 · 3h</span></li>
        <li><span class="nome">Lash lifting</span><span class="val">R$ 160 · 2h</span></li>
        <li><span class="nome">Remoção da extensão</span><span class="val">R$ 40 · 40 min</span></li>
      </ul>
      <p class="nota nota--curta">${ico('estrela')}<span>A manutenção Mega tem valor-base: pode ter acréscimo depois da avaliação.</span></p></div>`,
  },
  {
    n: 6, img: { src: 'canva/interna-a.jpg', flip: 0 }, bg: { seed: 56, items: [{ t: 'corner', at: 'top-right', size: 0.95 }] },
    html: `<div class="cabeca"><figure class="arco arco--par arco--p1"><img src="fotos/trabalho-c.jpg"></figure><figure class="arco arco--par arco--p2"><img src="fotos/trabalho-d.jpg"></figure>
      <h1 class="h1--valores">Sobrancelhas e lábios: valores e tempo</h1></div><div class="conteudo">
      <ul class="precos precos--sobr">
        <li><span class="nome">Brow Lamination</span><span class="val">R$ 120 · 1h30</span></li>
        <li><span class="nome">Design de sobrancelhas</span><span class="val">R$ 50 · 1h</span></li>
        <li><span class="nome">Hidragloss</span><span class="val">R$ 160 · 1h30</span></li>
        <li><span class="nome">Lip spa</span><span class="val">R$ 35 · 30 min</span></li>
      </ul>
      <p class="nota nota--curta">${ico('estrela')}<span>No site, cada técnica tem as fotos do trabalho.</span></p></div>`,
  },
  {
    n: 7, img: { src: 'canva/interna-a.jpg', flip: 0 }, bg: { seed: 66, items: [{ t: 'corner', at: 'top-right', size: 0.95 }] },
    html: `<div class="cabeca"><h1 class="h1--gigante">Agenda de dezembro</h1></div><div class="conteudo">
      <p class="corpo corpo--grande">A agenda de dezembro vai estar disponível <strong>primeiro só para as clientes VIP</strong>.</p>
      <div class="cupom cupom--data">
        <div class="cupom__rotulo">Dia 14 de novembro</div>
        <div class="cupom__valor">Abre para todas</div>
      </div></div>`,
  },
  {
    n: 8, img: { src: 'canva/interna-a.jpg', flip: 0 }, bg: { seed: 77, items: [{ t: 'corner', at: 'top-right', size: 0.9 }] },
    html: `<div class="cabeca"><h1 class="h1--gigante">Quem são as VIPs</h1></div><div class="conteudo">
      <p class="corpo corpo--grande">As clientes VIP são as que:</p>
      <ul class="beneficios beneficios--vips">
        <li><span class="ic">${ico('estrela')}</span><p><strong>Acompanham o meu trabalho</strong> com fidelidade</p></li>
        <li><span class="ic">${ico('calendario')}</span><p><strong>Fazem os cílios comigo</strong> com frequência</p></li>
      </ul></div>`,
  },
  {
    n: 9, img: { src: 'canva/interna-a.jpg', flip: 0 }, bg: { seed: 88, items: [{ t: 'corner', at: 'top-right', size: 0.95 }] },
    html: `<div class="cabeca"><figure class="arco arco--vip"><img src="fotos/cilios-vip.jpg"></figure>
      
      <h1 class="h1--vip">Sendo VIP, você tem</h1></div><div class="conteudo">
      <ul class="beneficios">
        <li><span class="ic">${ico('calendario')}</span><p><strong>Prioridade na agenda</strong>, principalmente em dezembro</p></li>
        <li><span class="ic">${ico('cartao')}</span><p><strong>Cartão de visitas:</strong> a cada 8 visitas, um presente escolhido pela Tayssa</p></li>
        <li><span class="ic">${ico('presente')}</span><p><strong>Pontos que viram mimos:</strong> mimo surpresa com 400 pontos; kit de higienização dos cílios com 800 pontos e 2 meses seguidos</p></li>
        <li><span class="ic">${ico('bolo')}</span><p><strong>No mês do seu aniversário</strong>, com uma aplicação de extensão: limpeza de pele, spa dos lábios e design simples de sobrancelhas</p></li>
      </ul></div>`,
  },
  {
    n: 10, img: { src: 'canva/interna-a.jpg', flip: 0 }, bg: { seed: 99, items: [{ t: 'corner', at: 'top-right', size: 0.95 }] },
    html: `<div class="cabeca"><h1 class="h1--gigante">Indique uma amiga</h1></div><div class="conteudo">
      <p class="corpo corpo--grande">Não precisa ser VIP para indicar.</p>
      <div class="cupom">
        <div class="cupom__rotulo">A cada indicação confirmada</div>
        <div class="cupom__valor"><span>15%</span> de desconto</div>
        <div class="cupom__mais">e um spa dos lábios no seu próximo atendimento.</div>
      </div></div>`,
  },
  {
    n: 11, img: { src: 'canva/interna-a.jpg', flip: 0 }, bg: { seed: 110, items: [{ t: 'corner', at: 'top-right', size: 0.95 }] },
    html: `<div class="cabeca"><h1>Combinados da casa</h1></div><div class="conteudo">
      <ul class="beneficios beneficios--combinados">
        <li><span class="ic">${ico('relogio')}</span><p><strong>Atendimento</strong><span class="horas"><span>segunda 10h às 16h</span><span>terça a sexta 9h às 19h</span><span>sábado 8h às 15h</span></span></p></li>
        <li><span class="ic">${ico('antecedencia')}</span><p>Marque com pelo menos <strong>4 horas de antecedência</strong></p></li>
        <li><span class="ic">${ico('ampulheta')}</span><p><strong>10 minutos de tolerância</strong> para atraso</p></li>
        <li><span class="ic">${ico('remarcar')}</span><p>Remarcando com <strong>48 horas ou mais</strong>, o sinal vale para a nova data</p></li>
      </ul></div>`,
  },
  { n: 12, kind: 'fechamento', img: { src: 'canva/capa.jpg', flip: 1 }, bg: { seed: 31, items: [{ t: 'tree', x: 860, top: 600, base: 1150, w: 400 }, { t: 'dust', x0: 0, y0: 0, x1: 1080, y1: 600, n: 26 }] } },
];

function page(s) {
  let body;
    if (s.kind === 'fechamento') {
    // foto dela de fundo, inteira; o AGENDE passa atrás da cabeça (recorte por cima)
    const k = 1.5, W = 1080, H = 1920, l = 0, t = -190;
    const mk = 'fotos/fech-fundo-mask.png';
    const pos = `left:${l}px;top:${t}px;width:${W}px;height:${H}px`;
    const mask = `-webkit-mask-image:url(${mk});mask-image:url(${mk});-webkit-mask-size:${W}px ${H}px;mask-size:${W}px ${H}px;-webkit-mask-position:${l}px ${t}px;mask-position:${l}px ${t}px;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat`;
    body = `<div class="fg fundo-foto">
      <img class="ff-bg" src="fotos/fech-fundo.webp" style="${pos}">
      <div class="ff-veu"></div>
      <div class="ff-titulo ff-titulo--cheio" data-fit="960">AGE<span class="ff-oco">NDE</span></div>
      <img class="ff-recorte" src="fotos/fech-fundo-cut.png" style="${pos}">
      <div class="ff-sobre" style="${mask}"><div class="ff-titulo ff-titulo--contorno" data-fit="960">AGE<span>NDE</span></div></div>
      <div class="ff-pe"></div>
      <div class="ff-marca">${marca}</div>
      <div class="ff-linha"><span>SEU NATAL COMEÇA NO OLHAR</span><span><b>TAYSSAFARIAS.COM.BR</b> · LINK NA BIO</span></div>
    </div>`;
  } else if (s.kind === 'capa' || s.kind === 'fechamento') {
    const c = s.kind === 'capa'
      ? { foto: 'fotos/capa-final.webp', fw: 2755, fh: 2591, k: 0.56, l: 108, t: 22, a: (process.env.CAPA || 'AG|ENDA').split('|')[0], b: (process.env.CAPA || 'AG|ENDA').split('|')[1], aCheio: true, top: 250,
          sub: 'O SEU HORÁRIO AGORA É NO SITE · TAYSSAFARIAS.COM.BR', marca: 'esq' }
      : { foto: 'fotos/fech-final.webp', fw: 2740, fh: 3479, k: 0.6, l: -400, t: 60, a: 'AGE', b: 'NDE', aCheio: false, top: 250,
          sub: 'SEU NATAL COMEÇA NO OLHAR · TAYSSAFARIAS.COM.BR · LINK NA BIO', marca: 'dir' };
    const W = Math.round(c.fw * c.k), H = Math.round(c.fh * c.k);
    const mk = c.foto.replace(/-final\.\w+$/, '-mask.png');
    const mask = `-webkit-mask-image:url(${mk});mask-image:url(${mk});-webkit-mask-size:${W}px ${H}px;mask-size:${W}px ${H}px;-webkit-mask-position:${c.l}px ${c.t}px;mask-position:${c.l}px ${c.t}px;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat`;
    const subHtml = (cls) => `<div class="sub2 ${cls}" style="top:var(--subtop)">${c.sub}</div>`;
    body = `<div class="fg capa2 ${s.kind}">
      <div class="capa2__marca capa2__marca--${c.marca}">${marca}</div>
      ${subHtml('sub2--fundo')}
      <img class="foto2" src="${c.foto}" style="left:${c.l}px;top:${c.t}px;width:${W}px;height:${H}px">
      <div class="capa2__mascara" style="${mask}">${subHtml('sub2--frente')}</div>
      <div class="titulo2" data-fit="900" style="top:${c.top}px"><span class="${c.aCheio ? 'cheio' : 'contorno'}">${c.a}</span><span class="${c.aCheio ? 'contorno' : 'cheio'}">${c.b}</span></div>
    </div>`;
  } else {
    body = `<div class="fg interna${s.dark ? ' interna--noite' : ''}">${topo(s.n, s.dark)}<main>${s.html}</main>${pe(s.dark)}</div>`;
  }
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
  <link rel="stylesheet" href="fonts/fonts.css"><link rel="stylesheet" href="style.css"></head>
  <body><div class="slide${s.dark ? ' slide--noite' : ''}"><div id="bg"></div>${body}</div>
  <script>${painter}</script>
  <script>
    ${s.img ? `document.getElementById('bg').innerHTML = '<img class="bgimg${s.img.flip ? ' bgimg--flip' : ''}" src="${s.img.src}">';` : `document.getElementById('bg').innerHTML = paint(${JSON.stringify(s.bg)});`}
    Promise.all([document.fonts.ready, ...[...document.images].map(i => i.decode().catch(() => {}))]).then(() => {
      document.querySelectorAll('[data-fit]').forEach(el => {
        const target = +el.dataset.fit; let fs = 200; el.style.fontSize = fs + 'px';
        fs = fs * target / el.getBoundingClientRect().width; el.style.fontSize = fs + 'px';
      });
      const t2 = document.querySelector('.titulo2');
      if (t2) { const r = t2.getBoundingClientRect(); document.querySelectorAll('.sub2').forEach(el => { el.style.fontSize = '40px'; const w = el.getBoundingClientRect().width; el.style.fontSize = (40 * r.width / w) + 'px'; el.style.left = r.left + 'px'; el.style.top = (r.bottom + 16) + 'px'; }); }
      document.body.dataset.ready = '1';
    });
  </script></body></html>`;
}

import http from 'http';
const TIPOS = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.js': 'text/javascript' };
const srv = http.createServer((req, res) => {
  const f = path.join(DIR, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!f.startsWith(DIR) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': TIPOS[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
await new Promise(r => srv.listen(0, '127.0.0.1', r));
const BASE = `http://127.0.0.1:${srv.address().port}/`;
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
for (const s of SLIDES) {
  if (only && !only.includes(s.n)) continue;
  const file = path.join(DIR, `_l${s.n}.html`);
  fs.writeFileSync(file, page(s));
  await p.goto(BASE + path.basename(file));
  await p.waitForSelector('body[data-ready="1"]');
  await p.waitForTimeout(150);
  const nn = String(s.n).padStart(2, '0');
  await p.screenshot({ path: path.join(OUT, 'laminas', `tayssa-natal-${nn}.png`) });
  await p.addStyleTag({ content: '.fg{display:none!important}' });
  await p.screenshot({ path: path.join(OUT, 'fundos', `tayssa-natal-fundo-${nn}.png`) });
  console.log('ok', nn);
}
await browser.close();
srv.close();
