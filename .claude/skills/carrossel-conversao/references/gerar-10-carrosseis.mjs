import { createRequire } from 'module';
const require = createRequire('/home/user/paineldosedegrowth/');
const s = require('sharp');
const fs = require('fs');

const BG = '/tmp/claude-0/-home-user-paineldosedegrowth/a7e39f73-9e96-5092-8195-f6ae070240e5/scratchpad/bg';
const OUT = '/tmp/claude-0/-home-user-paineldosedegrowth/a7e39f73-9e96-5092-8195-f6ae070240e5/scratchpad/criativos-dr-samuel.html';

// --- background sources: key -> {file, pos, webp} ---
const SRC = {
  bg1:{f:'bg1.jpg'}, bg2:{f:'bg2.jpg'}, bg4:{f:'bg4.jpg'}, bg5:{f:'bg5.jpg'}, bg7:{f:'bg7.jpg'}, bg9:{f:'bg9.jpg'},
  n1:{f:'n1.jpg'},n2:{f:'n2.jpg'},n3:{f:'n3.jpg'},n4:{f:'n4.jpg'},n5:{f:'n5.jpg'},n6:{f:'n6.jpg'},n7:{f:'n7.jpg'},
  n8:{f:'n8.jpg'},n9:{f:'n9.jpg'},n10:{f:'n10.jpg'},n11:{f:'n11.jpg'},n12:{f:'n12.jpg'},n13:{f:'n13.jpg'},n14:{f:'n14.jpg'},
  real1a:{f:'real1.webp',pos:'left'}, real1b:{f:'real1.webp',pos:'right'},
  real2r:{f:'real2.webp',pos:'right'}, real2l:{f:'real2.webp',pos:'left'},
};

async function uri(key){
  const {f,pos} = SRC[key];
  const real = f.endsWith('.webp');
  let img = s(BG+'/'+f).resize(760,950,{fit:'cover',position:pos||'attention'});
  if(!real) img = img.modulate({brightness:0.95});
  const buf = await img.jpeg({quality:real?66:62,mozjpeg:true}).toBuffer();
  return 'data:image/jpeg;base64,'+buf.toString('base64');
}

// --- copy ---
const C = [
 {t:'Enxaqueca & cervical',tag:'Ângulo novo',sub:'A dor de cabeça que começa no pescoço.',
  s:[{bg:'bg1',pill:'Quiropraxia',h:'Sua enxaqueca pode {não estar na cabeça}',x:'Ela pode estar começando no seu pescoço.'},
     {bg:'bg2',pill:'Por que acontece',h:'A tensão na cervical vira dor de cabeça',x:'O ajuste postural trata a origem, não só o sintoma.'},
     {bg:'real1a',pill:'Dr. Samuel Chagas',h:'Descubra a real {causa} da sua dor',cta:'Chame no WhatsApp'}]},
 {t:'Nervo ciático',tag:'Ângulo novo',sub:'Formigamento na perna como sinal de alerta.',
  s:[{bg:'bg4',pill:'Fisioterapia',h:'Formigamento na perna {não é normal}',x:'Pode ser o seu nervo ciático inflamado.'},
     {bg:'bg7',pill:'A causa',h:'Hérnia e má postura comprimem o ciático',x:'O tratamento certo alivia a dor e adia a cirurgia.'},
     {bg:'real2r',pill:'Dr. Samuel Chagas',h:'Chega de conviver {com a dor}',cta:'Chame no WhatsApp'}]},
 {t:'Postura no trabalho',tag:'Prevenção',prev:true,sub:'Fala com quem passa o dia sentado.',
  s:[{bg:'bg5',pill:'Quiropraxia',h:'8 horas sentado estão {detonando sua coluna}',x:'E você nem percebe.'},
     {bg:'bg9',pill:'O efeito',h:'Má postura vira dor lombar, cervical e cansaço',x:'O ajuste quiropráxico devolve alinhamento e alívio.'},
     {bg:'real2l',pill:'Dr. Samuel Chagas',h:'Sua coluna está {pedindo socorro}',cta:'Agende sua avaliação'}]},
 {t:'Dor lombar recorrente',tag:'Ângulo novo',sub:'A dor que volta toda semana tem causa.',
  s:[{bg:'n1',pill:'Fisioterapia',h:'Sua lombar trava {toda semana}?',x:'Dor que volta sempre tem uma causa.'},
     {bg:'n2',pill:'Atenção',h:'Dor lombar recorrente não é normal',x:'Tratar a causa evita que ela vire crônica.'},
     {bg:'real1b',pill:'Dr. Samuel Chagas',h:'Pare de conviver com a {dor nas costas}',cta:'Chame no WhatsApp'}]},
 {t:'Ombro de quem treina',tag:'Atleta',sub:'Pra quem treina e sente o ombro travar.',
  s:[{bg:'n3',pill:'Fisioterapia',h:'Treina e o ombro {dói toda vez}?',x:'Pode não ser só cansaço.'},
     {bg:'n4',pill:'Por que acontece',h:'Lesão de ombro tira você do treino',x:'O tratamento certo recupera o movimento.'},
     {bg:'real2r',pill:'Dr. Samuel Chagas',h:'Volte a treinar {sem dor}',cta:'Agende sua avaliação'}]},
 {t:'Recuperação de atleta',tag:'Atleta',sub:'Recuperar também faz parte do treino.',
  s:[{bg:'n5',pill:'Fisioterapia',h:'Seu corpo {não rende como antes}?',x:'Recuperação também é treino.'},
     {bg:'n6',pill:'Performance',h:'Atleta lesionado perde meses de evolução',x:'A fisioterapia acelera a volta com segurança.'},
     {bg:'real1a',pill:'Dr. Samuel Chagas',h:'Recupere sua {performance}',cta:'Chame no WhatsApp'}]},
 {t:'Pescoço travado',tag:'Ângulo novo',sub:'Acordar com o pescoço travado tem explicação.',
  s:[{bg:'n7',pill:'Quiropraxia',h:'Acorda com o pescoço {travado}?',x:'Não é só o travesseiro.'},
     {bg:'n8',pill:'A causa',h:'Tensão na cervical vira dor crônica',x:'O ajuste certo devolve a mobilidade.'},
     {bg:'real2l',pill:'Dr. Samuel Chagas',h:'Acorde {sem dor} no pescoço',cta:'Agende sua avaliação'}]},
 {t:'Dor crônica',tag:'Ângulo novo',sub:'Pra quem já tentou de tudo e a dor volta.',
  s:[{bg:'n9',pill:'Fisioterapia',h:'Cansado de dor que {nunca passa}?',x:'Remédio só tampa o sintoma.'},
     {bg:'n10',pill:'Verdade',h:'Dor crônica tem origem, e tem solução',x:'Tratar a causa é o que dá alívio real.'},
     {bg:'real1b',pill:'Dr. Samuel Chagas',h:'Chega de viver {com dor}',cta:'Chame no WhatsApp'}]},
 {t:'Joelho do corredor',tag:'Atleta',sub:'Pra quem corre e sente o joelho reclamar.',
  s:[{bg:'n11',pill:'Fisioterapia',h:'Dói o joelho quando você {corre}?',x:'Ignorar hoje custa caro amanhã.'},
     {bg:'n12',pill:'Atenção',h:'Dor articular pode virar lesão séria',x:'Avaliação e tratamento protegem sua articulação.'},
     {bg:'real2r',pill:'Dr. Samuel Chagas',h:'Cuide do seu joelho {agora}',cta:'Agende sua avaliação'}]},
 {t:'Estalar as costas',tag:'Ângulo novo',sub:'O hábito que pode estar te machucando.',
  s:[{bg:'n13',pill:'Quiropraxia',h:'Estala as próprias costas {pra aliviar}?',x:'Isso pode estar te machucando.'},
     {bg:'n14',pill:'Cuidado',h:'Ajuste sem técnica agrava a lesão',x:'Quiropraxia é ajuste preciso, feito por profissional.'},
     {bg:'real1a',pill:'Dr. Samuel Chagas',h:'Faça do {jeito certo}',cta:'Chame no WhatsApp'}]},
];

const waSvg = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 00-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1012 2zm0 2a8 8 0 11-4.2 14.8l-.3-.2-2.8.8.8-2.8-.2-.3A8 8 0 0112 4zm-2.7 3.6c-.2 0-.5.1-.7.3-.3.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.7 2.8 4.3 3.8 2.1.8 2.5.7 3 .6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2 0-.1-.2-.2-.5-.3l-1.6-.8c-.2-.1-.4-.1-.6.1l-.7.9c-.1.2-.3.2-.5.1-.7-.3-1.4-.6-2.1-1.5-.5-.6-.9-1.3-1-1.5-.1-.2 0-.4.1-.5l.4-.5c.1-.2.2-.3.2-.5s0-.3-.1-.4l-.8-1.8c-.2-.4-.4-.4-.6-.4z"/></svg>';
const pad2 = n => String(n).padStart(2,'0');
const hl = h => h.replace(/\{([^}]+)\}/g,'<span class="hl">$1</span>');
const esc = t => t.replace(/&/g,'&amp;');

function dots(active){ return '<span class="dots">'+[0,1,2].map(i=>`<i class="${i===active?'on':''}"></i>`).join('')+'</span>'; }

function card(sl, i){
  const body = sl.cta
    ? `<div class="headline">${hl(sl.h)}</div><div class="cta whats">${waSvg}${sl.cta}</div>`
    : `<div class="headline">${hl(sl.h)}</div><p class="support">${sl.x}</p>`;
  return `<article class="card"><div class="ph k_${sl.bg}"></div><div class="scrim"></div>
    <div class="toprow"><span class="pill${i===0?' accent':''}">${sl.pill}</span>${dots(i)}</div>
    <div class="body">${body}</div></article>`;
}
function scriptPanel(c){
  return '<div class="script">'+c.s.map((sl,i)=>{
    const label = i===0?'Card 1 · Capa':i===1?'Card 2 · Conteúdo':'Card 3 · CTA';
    const sub = sl.cta?('Botão fino: '+sl.cta+'.'):sl.x;
    return `<div class="slot"><h4>${label}</h4><p>${sl.h.replace(/[{}]/g,'')}.</p><p class="sup">${sub}</p></div>`;
  }).join('')+'</div>';
}
function block(c,i){
  return `<section class="block"><div class="block-head"><span class="idx">${pad2(i+1)}</span>
    <span class="block-title">${esc(c.t)}</span><span class="tag-new${c.prev?' tag-prev':''}">${c.tag}</span>
    <span class="block-sub">${c.sub}</span></div>
    <div class="cards">${c.s.map((sl,j)=>card(sl,j)).join('')}</div>${scriptPanel(c)}</section>`;
}

const CSS = `
:root{--paper:#EAEEF0;--panel:#FFF;--ink:#101619;--ink-soft:#3B474C;--line:#D3DBDE;--muted:#66757B;
--teal:#0E9E92;--teal-deep:#0B6E67;--ddg:#F15839;--wa:#25D366;--tealTint:#DDEEEB;
--shadow:0 18px 40px -22px rgba(16,40,44,.45);--radius:18px}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--paper:#0C1113;--panel:#141B1E;--ink:#EDF1F2;--ink-soft:#B7C2C6;--line:#25302F;--muted:#849499;--tealTint:#0F2A28;--shadow:0 22px 46px -24px rgba(0,0,0,.7)}}
:root[data-theme="dark"]{--paper:#0C1113;--panel:#141B1E;--ink:#EDF1F2;--ink-soft:#B7C2C6;--line:#25302F;--muted:#849499;--tealTint:#0F2A28;--shadow:0 22px 46px -24px rgba(0,0,0,.7)}
*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font-family:"Inter Tight",system-ui,sans-serif;-webkit-font-smoothing:antialiased;line-height:1.5}
.wrap{max-width:1120px;margin:0 auto;padding:48px 24px 96px}
header.top{margin-bottom:8px}
.eyebrow{font-family:"Archivo",sans-serif;font-weight:700;font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:var(--teal-deep);display:flex;align-items:center;gap:10px}
:root[data-theme="dark"] .eyebrow{color:var(--teal)}@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .eyebrow{color:var(--teal)}}
.eyebrow::before{content:"";width:26px;height:2px;background:currentColor;display:inline-block}
h1{font-family:"Archivo",sans-serif;font-weight:800;font-size:clamp(34px,6vw,54px);line-height:1.02;letter-spacing:-.02em;margin:14px 0 0;text-wrap:balance;max-width:16ch}
.lede{margin:16px 0 0;color:var(--ink-soft);font-size:18px;max-width:60ch}
.meta-row{display:flex;flex-wrap:wrap;gap:10px;margin-top:24px}
.chip{font-family:"Archivo",sans-serif;font-weight:600;font-size:12.5px;padding:7px 13px;border-radius:999px;border:1px solid var(--line);background:var(--panel);color:var(--ink-soft);display:inline-flex;align-items:center;gap:7px}
.chip b{color:var(--ink);font-weight:700}.chip.free{border-color:transparent;background:var(--tealTint);color:var(--teal-deep)}
:root[data-theme="dark"] .chip.free{color:#5fd8cc}@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .chip.free{color:#5fd8cc}}
.block{margin-top:52px}
.block-head{display:flex;align-items:baseline;gap:14px;flex-wrap:wrap;margin-bottom:20px}
.idx{font-family:"Anton",sans-serif;font-size:34px;line-height:1;color:var(--teal)}
.block-title{font-family:"Archivo",sans-serif;font-weight:800;font-size:24px;letter-spacing:-.01em}
.tag-new{font-family:"Archivo",sans-serif;font-weight:700;font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:#fff;background:var(--ddg);padding:5px 9px;border-radius:6px}
.tag-prev{background:var(--teal-deep)}
.block-sub{color:var(--muted);font-size:14.5px;width:100%;margin-top:-8px}
.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
@media(max-width:760px){.cards{grid-auto-flow:column;grid-template-columns:none;grid-auto-columns:80%;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:8px;margin:0 -24px;padding-left:24px;padding-right:24px}.card{scroll-snap-align:center}}
.card{position:relative;aspect-ratio:4/5;border-radius:var(--radius);overflow:hidden;background:#0b1112;color:#F4F6F5;box-shadow:var(--shadow);isolation:isolate;display:grid;grid-template-rows:1fr auto}
.ph{position:absolute;inset:0;z-index:0;background-size:cover;background-position:center}
.ph::after{content:"";position:absolute;inset:0;background:radial-gradient(120% 85% at 50% 22%,transparent 42%,rgba(0,0,0,.5))}
.scrim{position:absolute;inset:0;z-index:1;background:linear-gradient(180deg,rgba(4,10,10,.05) 30%,rgba(5,11,11,.72) 62%,rgba(3,8,8,.95) 100%)}
.toprow{grid-row:1;z-index:3;align-self:start;display:flex;justify-content:space-between;align-items:flex-start;gap:8px;padding:16px 16px 0}
.pill{font-family:"Archivo",sans-serif;font-weight:700;font-size:11px;letter-spacing:.04em;background:rgba(10,20,20,.42);backdrop-filter:blur(5px);border:1px solid rgba(255,255,255,.20);color:#fff;padding:6px 11px;border-radius:999px}
.pill.accent{background:var(--teal);border-color:transparent}
.dots{display:flex;gap:5px;margin-top:5px}.dots i{width:16px;height:3px;border-radius:2px;background:rgba(255,255,255,.42)}.dots i.on{background:#fff;width:22px}
.body{grid-row:2;z-index:3;padding:0 18px 16px;display:flex;flex-direction:column;gap:8px}
.headline{font-family:"Anton",sans-serif;font-weight:400;text-transform:uppercase;font-size:clamp(17px,4.8vw,21px);line-height:1.05;letter-spacing:.004em;text-wrap:balance;text-shadow:0 2px 18px rgba(0,0,0,.5)}
.headline .hl{color:#3fe0cf}
.support{font-size:13px;color:rgba(244,246,245,.9);line-height:1.34;max-width:26ch;text-shadow:0 1px 10px rgba(0,0,0,.5)}
.cta{margin-top:9px;align-self:start;display:inline-flex;align-items:center;gap:7px;font-family:"Archivo",sans-serif;font-weight:600;font-size:12px;letter-spacing:.03em;padding:6px 12px;border-radius:999px;border:1px solid}
.cta.whats{color:#a7f3c4;border-color:rgba(37,211,102,.55);background:rgba(37,211,102,.12)}
.cta svg{width:14px;height:14px;flex:none}
.script{margin-top:16px;background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:16px 18px;display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
@media(max-width:760px){.script{grid-template-columns:1fr}}
.slot h4{margin:0 0 6px;font-family:"Archivo",sans-serif;font-weight:700;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--teal-deep)}
:root[data-theme="dark"] .slot h4{color:#5fd8cc}@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .slot h4{color:#5fd8cc}}
.slot p{margin:0;font-size:14px;color:var(--ink)}.slot p.sup{color:var(--muted);font-size:13px;margin-top:3px}
.note{margin-top:60px;border-top:1px solid var(--line);padding-top:24px;color:var(--muted);font-size:13.5px;max-width:76ch}
.note b{color:var(--ink)}.note code{font-family:"Archivo",monospace;background:var(--tealTint);color:var(--teal-deep);padding:1px 6px;border-radius:5px;font-size:12.5px}
:root[data-theme="dark"] .note code{color:#5fd8cc}@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .note code{color:#5fd8cc}}
`;

const keys = [...new Set(C.flatMap(c=>c.s.map(sl=>sl.bg)))];
const uris = {};
for(const k of keys){ uris[k]=await uri(k); process.stderr.write('.'); }
const bgCss = keys.map(k=>`.k_${k}{background-image:url("${uris[k]}")}`).join('\n');

const html = `<title>Criativos Dr. Samuel</title>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Archivo:wght@500;600;700;800&family=Inter+Tight:wght@400;500;600&display=swap">
<style>${CSS}${bgCss}</style>
<div class="wrap">
<header class="top"><div class="eyebrow">Dose de Growth · Renovação de criativo</div>
<h1>10 carrosséis de conversão, Dr. Samuel</h1>
<p class="lede">Dez ângulos para o feed e Meta Ads, cada um em 3 páginas: dor, tratamento e a chamada pro WhatsApp. Foco em dor crônica e atletas. Fundos reais de movimento, sem rosto, e o consultório dele nos fechos.</p>
<div class="meta-row"><span class="chip"><b>@dr.samuelchagas</b> · Fisioterapia + Quiropraxia</span>
<span class="chip">Formato <b>4:5</b> · feed</span><span class="chip">Objetivo <b>conversa no WhatsApp</b></span>
<span class="chip free">10 variações · 30 cards</span></div></header>
${C.map((c,i)=>block(c,i)).join('\n')}
<p class="note"><b>10 variações prontas.</b> Cada carrossel tem um tema e um gancho diferente, sempre no arco dor, tratamento, WhatsApp, com foco em dor crônica e atletas. Todos os fundos são de movimento e <b>sem rosto de ninguém</b>, na paleta escura/teal, e os fechos mostram o <b>consultório real</b> do Dr. Samuel. CTA fino com o logo do WhatsApp, sem número (é anúncio linkado). Sem travessão, uma ideia por card, <code>4:5</code> pro feed.</p>
</div>`;

fs.writeFileSync(OUT, html);
process.stderr.write('\n');
console.log('OK', Math.round(fs.statSync(OUT).size/1024)+'KB', '| imagens unicas:', keys.length);
