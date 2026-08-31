// Monta o brand board (artifact + print) e gera o PDF
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const BRAND = path.resolve(__dirname, '..');
const M = path.join(BRAND, 'manual');
const TH = path.join(M, 'thumbs');

const b64 = (f, mime) => `data:${mime};base64,` + fs.readFileSync(path.join(TH, f)).toString('base64');
const img = {
  lockup: b64('lockup.png', 'image/png'),
  selo: b64('selo.png', 'image/png'),
  seloClaro: b64('selo-claro.png', 'image/png'),
  seloMono: b64('selo-mono.png', 'image/png'),
  tplCar: b64('tpl-carrossel.jpg', 'image/jpeg'),
  tplFly: b64('tpl-flyer.jpg', 'image/jpeg'),
  tplSto: b64('tpl-story.jpg', 'image/jpeg'),
};
const capas = ['roteiros','frota','precos','depoimentos','reservas','paraty','promocoes','bastidores']
  .map(s => ({ s, d: b64(`capa-${s}.png`, 'image/png') }));

// criativos de teste (thumbs gerados por matriz_build.js)
const ATH = path.join(BRAND, 'ads', 'thumbs');
const b64a = (f) => 'data:image/jpeg;base64,' + fs.readFileSync(path.join(ATH, f)).toString('base64');
const angles = [
  { id: 'ad01', nome: 'Preço direto', formatos: ['feed', 'story'], hip: 'Preço claro no criativo qualifica o clique — quem chama no Whats já sabe que é a partir de R$ 700.', func: 'Fundo de funil', slug: 'preco' },
  { id: 'ad02', nome: 'Privativo / controle', formatos: ['feed'], hip: 'O gatilho é a flexibilidade: sem horário engessado, paradas à escolha. Fala com quem odeia excursão lotada.', func: 'Meio de funil', slug: 'privativo' },
  { id: 'ad03', nome: 'Roteiro concreto', formatos: ['feed', 'story'], hip: 'Nomear as 5 paradas gera desejo e salvamento. Concretude vence promessa genérica.', func: 'Meio de funil', slug: 'roteiro' },
  { id: 'ad04', nome: 'Tradição local', formatos: ['feed'], hip: '"Das primeiras lanchas de Paraty, +5.000 passeios" — autoridade converte quem está comparando fornecedores.', func: 'Meio/fundo', slug: 'tradicao' },
  { id: 'ad05', nome: 'Urgência de data', formatos: ['feed', 'story'], hip: 'Janela de decisão curta: pega quem já está em Paraty ou fechando o feriado. SEX/SÁB/DOM.', func: 'Fundo de funil', slug: 'urgencia' },
  { id: 'ad06', nome: 'Pôr do sol (emoção)', formatos: ['feed', 'story'], hip: 'Emoção pura, quase sem texto. Alcance barato pra topo de funil e remarketing.', func: 'Topo de funil', slug: 'pordosol' },
  { id: 'ad07', nome: 'Galera / social', formatos: ['feed', 'story'], hip: 'Feito pra marcar os amigos nos comentários — engajamento orgânico dentro do tráfego pago.', func: 'Topo/meio', slug: 'grupo' },
  { id: 'ad08', nome: 'O que tá incluso', formatos: ['feed'], hip: 'Mata a objeção de valor: o recibo mostra tudo que os R$ 700 cobrem.', func: 'Fundo de funil', slug: 'incluso' },
  { id: 'ad09', nome: 'Depoimento', formatos: ['feed', 'story'], hip: 'Prova social direta pra quem está em dúvida. Trocar o texto pelo depoimento real assim que tiver.', func: 'Meio/fundo', slug: 'depoimento' },
  { id: 'ad10', nome: 'Matemática da galera', formatos: ['feed'], hip: 'Reenquadra o preço: R$ 700 ÷ 12 = menos de R$ 60 por pessoa. Destrava o público sensível a preço.', func: 'Fundo de funil', slug: 'matematica' },
];
const adCards = angles.map((a, i) => `
  <div class="card ang">
    <div class="ahead">
      <span class="anum lilita">${String(i + 1).padStart(2, '0')}</span>
      <div><h3 class="lilita">${a.nome}</h3><span class="afunc">${a.func}</span></div>
      <span class="afmt">${a.formatos.map(f => f === 'feed' ? 'Feed 4:5' : 'Story 9:16').join(' + ')}</span>
    </div>
    <p class="ahip">${a.hip}</p>
    <div class="aimgs">${a.formatos.map(f => `<img src="${b64a(`${a.id}-${f}.jpg`)}" alt="${a.nome} ${f}" class="${f} zoom" data-cap="Ângulo ${String(i + 1).padStart(2, '0')} • ${a.nome} — ${f === 'feed' ? 'Feed 4:5' : 'Story 9:16'}">`).join('')}</div>
    <div class="afiles">${a.formatos.map(f => `<code>vpp-${a.id}-${a.slug}-${f}.png</code>`).join(' ')}</div>
  </div>`).join('\n');
const capaLabel = { roteiros:'Roteiros', frota:'Frota', precos:'Preços', depoimentos:'Depoimentos', reservas:'Reservas', paraty:'Paraty', promocoes:'Promoções', bastidores:'Bastidores' };

const capaCircle = (c, size) => `<div class="hl"><div class="hlc" style="width:${size}px;height:${size}px"><img class="zoom" data-cap="Capa de destaque — ${capaLabel[c.s]}" src="${c.d}" alt="Capa ${capaLabel[c.s]}"></div><span>${capaLabel[c.s]}</span></div>`;

const html = (fontsBlock, printCss, extras = '') => `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Vem pra Paraty</title>
${fontsBlock}
<style>
  :root{
    --navy:#0B2D48; --night:#07203A; --turq:#17C3B2; --teal:#0E9AA7;
    --sand:#F6EFE3; --sand-2:rgba(246,239,227,.68); --sand-3:rgba(246,239,227,.42);
    --orange:#FF7A45; --gold:#FFB84D; --line:rgba(246,239,227,.12);
  }
  *{box-sizing:border-box}
  html{-webkit-text-size-adjust:100%}
  body{margin:0;background:var(--night);color:var(--sand);
    font-family:'Poppins',ui-sans-serif,system-ui,'Segoe UI',Arial,sans-serif;
    font-size:16px;line-height:1.6}
  .wrap{max-width:1060px;margin:0 auto;padding:0 28px}
  .lilita{font-family:'Lilita One','Arial Black',sans-serif;font-weight:400}
  .pacifico{font-family:'Pacifico','Brush Script MT',cursive}

  /* hero */
  header{position:relative;overflow:hidden;background:linear-gradient(180deg,#0B2D48,#07203A);border-bottom:1px solid var(--line)}
  .waves{position:absolute;inset:0;opacity:.07;pointer-events:none}
  .hero{position:relative;padding:72px 28px 58px;text-align:center}
  .eyebrow{display:inline-block;color:var(--turq);font-weight:600;font-size:13px;letter-spacing:4px;text-transform:uppercase}
  .hero img.lk{width:min(560px,86%);margin:26px auto 8px;display:block}
  .hero p.tag{max-width:560px;margin:10px auto 0;color:var(--sand-2);font-size:17px;text-wrap:balance}
  .chips{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:26px}
  .chip{border:1.5px solid var(--line);border-radius:999px;padding:7px 16px;font-size:13.5px;font-weight:500;color:var(--sand-2)}
  .chip b{color:var(--gold);font-weight:600}

  /* section scaffolding */
  section{padding:64px 0 8px}
  .shead{display:flex;align-items:baseline;gap:16px;margin-bottom:8px}
  .snum{font-family:'Lilita One';color:var(--orange);font-size:20px}
  .shead h2{font-family:'Lilita One';font-weight:400;font-size:34px;margin:0;letter-spacing:.5px}
  .sdesc{color:var(--sand-2);max-width:640px;margin:0 0 28px}

  .card{background:var(--navy);border:1px solid var(--line);border-radius:18px}

  /* paleta */
  .pal{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:14px}
  .sw{border-radius:16px;overflow:hidden;border:1px solid var(--line);break-inside:avoid}
  .sw .c{height:96px}
  .sw .i{background:var(--navy);padding:12px 16px}
  .sw .i b{display:block;font-size:14.5px}
  .sw .i code{font-family:'Poppins';font-weight:600;font-size:13px;color:var(--gold);letter-spacing:.5px}
  .sw .i span{display:block;font-size:12.5px;color:var(--sand-2);margin-top:3px;line-height:1.45}
  .propbar{display:flex;height:20px;border-radius:999px;overflow:hidden;margin:26px 0 6px;border:1px solid var(--line)}
  .plegend{display:flex;gap:18px;flex-wrap:wrap;font-size:12.5px;color:var(--sand-2);margin-bottom:4px}
  .plegend i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:6px}

  /* tipografia */
  .types{display:grid;gap:14px}
  .type{padding:26px 30px;display:grid;grid-template-columns:1fr auto;gap:8px 22px;align-items:center;break-inside:avoid}
  .type .sample{font-size:52px;line-height:1.15}
  .type .meta{text-align:right}
  .type .meta b{font-size:15px}
  .type .meta span{display:block;font-size:12.5px;color:var(--sand-2);margin-top:2px}
  .type .use{grid-column:1/-1;color:var(--sand-2);font-size:13.5px;border-top:1px dashed var(--line);padding-top:12px}

  /* logos */
  .logos{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px}
  .lg{border-radius:16px;border:1px solid var(--line);padding:26px;display:flex;flex-direction:column;align-items:center;gap:14px;break-inside:avoid}
  .lg img{width:78%;max-width:230px}
  .lg span{font-size:12.5px;color:var(--sand-2);text-align:center}
  .lg.wide{grid-column:1/-1;flex-direction:row;justify-content:center;gap:34px}
  .lg.wide img{width:min(480px,70%);max-width:none}
  .rules{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}
  .rule{font-size:13px;padding:8px 14px;border-radius:999px;border:1.5px solid var(--line);color:var(--sand-2)}
  .rule.ok{border-color:rgba(23,195,178,.5);color:var(--turq)}
  .rule.no{border-color:rgba(255,122,69,.5);color:var(--orange)}

  /* capas */
  .hls{display:flex;gap:22px;flex-wrap:wrap;justify-content:center;padding:30px 18px}
  .hl{display:flex;flex-direction:column;align-items:center;gap:9px}
  .hl span{font-size:12.5px;color:var(--sand-2)}
  .hlc{border-radius:50%;overflow:hidden;border:2.5px solid rgba(246,239,227,.35);position:relative}
  .hlc img{width:100%;height:178%;object-fit:cover;margin-top:-39%}

  /* mockup perfil */
  .mock{max-width:430px;margin:0 auto;padding:26px 24px 30px;break-inside:avoid}
  .mhead{display:flex;align-items:center;gap:22px}
  .mhead img{width:86px;height:86px;border-radius:50%}
  .mstats{display:flex;gap:22px;font-size:13px;color:var(--sand-2)}
  .mstats b{display:block;color:var(--sand);font-size:16px;text-align:center}
  .mbio{margin-top:16px;font-size:13.8px;line-height:1.65;white-space:pre-line}
  .mbio b{font-weight:600}
  .mbtns{display:flex;gap:8px;margin-top:16px}
  .mbtn{flex:1;text-align:center;font-size:13px;font-weight:600;padding:9px 0;border-radius:10px;background:var(--orange);color:#fff}
  .mbtn.sec{background:rgba(246,239,227,.14);color:var(--sand)}
  .mhls{display:flex;gap:14px;margin-top:22px;justify-content:space-between}
  .mhls .hl span{font-size:11px}
  .mposts{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;margin-top:20px;border-radius:10px;overflow:hidden}
  .mposts img{width:100%;aspect-ratio:1;object-fit:cover;display:block}

  /* templates */
  .tpls{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:16px;align-items:start}
  .tpl{display:flex;flex-direction:column;gap:10px;break-inside:avoid}
  .tpl img{width:100%;border-radius:14px;border:1px solid var(--line)}
  .tpl b{font-size:14px}
  .tpl span{font-size:12.5px;color:var(--sand-2)}

  /* voz */
  .voz{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px}
  .vz{padding:24px 26px;break-inside:avoid}
  .vz h3{margin:0 0 12px;font-size:15px;letter-spacing:2.5px;text-transform:uppercase;color:var(--turq);font-weight:600}
  .vz ul{margin:0;padding-left:18px;color:var(--sand-2);font-size:14px}
  .vz li{margin-bottom:8px}
  .vz li b{color:var(--sand)}
  .frase{font-family:'Pacifico';font-size:21px;color:var(--gold);line-height:1.7}
  .tags{display:flex;gap:8px;flex-wrap:wrap}
  .tags span{font-size:13px;font-weight:500;color:var(--turq);background:rgba(23,195,178,.1);border-radius:999px;padding:6px 13px}

  footer{margin-top:70px;border-top:1px solid var(--line);padding:34px 28px 46px;text-align:center;color:var(--sand-3);font-size:13px}
  footer .pacifico{color:var(--turq);font-size:20px;display:block;margin-bottom:8px}

  /* criativos de teste */
  .plan{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px}
  .pc{padding:24px 26px;break-inside:avoid}
  .pc .obj{font-size:12px;letter-spacing:2.5px;text-transform:uppercase;color:var(--turq);font-weight:600}
  .pc h3{margin:6px 0 0;font-family:'Lilita One';font-weight:400;font-size:22px;color:var(--gold)}
  .pc ul{margin:12px 0 0;padding-left:18px;color:var(--sand-2);font-size:14px}
  .pc li{margin-bottom:7px}
  .pc li b{color:var(--sand)}
  .steps{counter-reset:s;margin-top:10px}
  .step{display:flex;gap:18px;padding:15px 0;border-bottom:1px dashed var(--line);align-items:baseline}
  .step:last-child{border-bottom:none}
  .step::before{counter-increment:s;content:counter(s);font-family:'Lilita One';color:var(--orange);font-size:22px;min-width:26px}
  .step b{color:var(--sand)}
  .step span{color:var(--sand-2);font-size:14.5px}
  .agrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:16px}
  .ang{padding:22px 24px;break-inside:avoid}
  .ahead{display:flex;align-items:center;gap:14px}
  .anum{color:var(--orange);font-size:19px}
  .ahead h3{margin:0;font-size:22px;font-weight:400}
  .afunc{font-size:11px;letter-spacing:2px;text-transform:uppercase;color:var(--turq);font-weight:600}
  .afmt{margin-left:auto;font-size:11px;font-weight:600;color:var(--sand-2);border:1.5px solid var(--line);border-radius:999px;padding:5px 12px;white-space:nowrap}
  .ahip{color:var(--sand-2);font-size:13.5px;margin:12px 0 14px;line-height:1.55}
  .aimgs{display:flex;gap:12px;align-items:flex-start}
  .aimgs img{border-radius:12px;border:1px solid var(--line);max-width:100%}
  .aimgs img.feed{width:62%}
  .aimgs img.story{width:36%}
  .aimgs img:only-child{width:75%;margin:0 auto;display:block}
  .afiles{margin-top:12px;display:flex;gap:8px;flex-wrap:wrap}
  .afiles code{font-family:'Poppins';font-size:11px;font-weight:600;color:var(--gold);background:rgba(255,184,77,.08);border-radius:8px;padding:4px 10px}
  .anote{border-left:4px solid var(--orange);background:rgba(255,122,69,.07);border-radius:0 14px 14px 0;padding:16px 20px;color:var(--sand-2);font-size:14px;margin-top:24px}
  .anote b{color:var(--sand)}

  /* plano de lançamento */
  .sub{font-family:'Lilita One';font-weight:400;font-size:26px;margin:46px 0 6px;color:var(--sand)}
  .subdesc{color:var(--sand-2);font-size:14.5px;margin:0 0 18px;max-width:660px}
  .capgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:14px}
  .cap{padding:22px 24px;display:flex;flex-direction:column;gap:12px;break-inside:avoid}
  .caphead b{display:block;font-size:15px;color:var(--gold)}
  .caphead span{font-size:12.5px;color:var(--turq);font-weight:600}
  .captext{white-space:pre-line;font-size:13.5px;color:var(--sand-2);line-height:1.62;border-left:3px solid var(--line);padding-left:14px}
  .cpy{align-self:flex-start;font:600 12.5px Poppins,sans-serif;color:#fff;background:var(--teal);border:none;border-radius:999px;padding:8px 16px;cursor:pointer;transition:background .2s}
  .cpy:hover{background:var(--orange)}
  .painel-link{color:var(--turq);font-weight:600;word-break:break-all}
  .kchip{display:inline-block;border:1.5px solid rgba(23,195,178,.4);color:var(--turq);border-radius:999px;padding:6px 14px;font-size:13px;font-weight:600;margin:4px 6px 0 0}

  /* mobile */
  @media (max-width:700px){
    .wrap{padding:0 18px}
    .hero{padding:52px 18px 42px}
    .hero img.lk{width:94%}
    .hero p.tag{font-size:15.5px}
    section{padding:42px 0 6px}
    .shead h2{font-size:26px}
    .snum{font-size:17px}
    .sub{font-size:21px;margin:36px 0 6px}
    .type{grid-template-columns:1fr;gap:10px}
    .type .sample{font-size:34px}
    .type .meta{text-align:left}
    .lg{padding:20px}
    .lg.wide{flex-direction:column;gap:14px}
    .lg.wide img{width:94%;max-width:none}
    .hls{gap:14px;padding:22px 8px}
    .ahead{flex-wrap:wrap;row-gap:6px}
    .fmt,.afmt{margin-left:0}
    .mock{padding:20px 16px 24px}
    .mhead{gap:14px}
    .mhead img{width:68px;height:68px}
    .mstats{gap:14px;font-size:12px}
    .mhls{gap:8px}
    .propbar{height:16px}
    .plegend{gap:12px;font-size:11.5px}
    .cap{padding:18px 18px}
    .pc{padding:20px 20px}
    .step{gap:12px;padding:13px 0}
  }
  ${printCss}
</style></head>
<body>
<header>
  <svg class="waves" width="100%" height="100%" viewBox="0 0 1400 520" preserveAspectRatio="none">
    <g fill="none" stroke="#F6EFE3" stroke-width="2.5" stroke-linecap="round">
      <path d="M-40 110 Q 130 60 300 110 T 640 110 T 980 110 T 1320 110 T 1660 110"/>
      <path d="M-40 260 Q 130 210 300 260 T 640 260 T 980 260 T 1320 260 T 1660 260"/>
      <path d="M-40 410 Q 130 360 300 410 T 640 410 T 980 410 T 1320 410 T 1660 410"/>
    </g>
  </svg>
  <div class="hero">
    <span class="eyebrow">Identidade visual • Instagram</span>
    <img class="lk" src="${img.lockup}" alt="Logo Vem pra Paraty">
    <p class="tag">O convite pro mar de Paraty: paleta, logo, capas de destaque e templates prontos pra todo post, story e anúncio do <b>@vempraparaty</b>.</p>
    <div class="chips">
      <div class="chip"><b>24 anos</b> de mar</div>
      <div class="chip">Paraty • RJ</div>
      <div class="chip">Feed + Stories + Ads</div>
    </div>
  </div>
</header>

<main class="wrap">

<section>
  <div class="shead"><span class="snum">01</span><h2>Paleta de cores</h2></div>
  <p class="sdesc">O mar esmeralda da baía no fim de tarde. Navy segura o fundo, turquesa dá a água, areia dá a leitura — e o laranja do pôr do sol é a cor que vende: só em CTA, preço e destaque.</p>
  <div class="pal">
    <div class="sw"><div class="c" style="background:#0B2D48"></div><div class="i"><b>Navy Profundo</b> <code>#0B2D48</code><span>Fundo principal de artes e fotos com overlay</span></div></div>
    <div class="sw"><div class="c" style="background:#07203A"></div><div class="i"><b>Navy Noite</b> <code>#07203A</code><span>Gradientes e rodapés (par do Navy Profundo)</span></div></div>
    <div class="sw"><div class="c" style="background:#17C3B2"></div><div class="i"><b>Turquesa</b> <code>#17C3B2</code><span>Água, destaques de texto, pills secundárias</span></div></div>
    <div class="sw"><div class="c" style="background:#0E9AA7"></div><div class="i"><b>Teal Maré</b> <code>#0E9AA7</code><span>Ondas, apoio da turquesa em fundo claro</span></div></div>
    <div class="sw"><div class="c" style="background:#F6EFE3"></div><div class="i"><b>Areia</b> <code>#F6EFE3</code><span>Texto sobre navy e fundos claros</span></div></div>
    <div class="sw"><div class="c" style="background:#FF7A45"></div><div class="i"><b>Laranja Pôr do Sol</b> <code>#FF7A45</code><span>CTA, preço, promoção — nunca texto longo</span></div></div>
    <div class="sw"><div class="c" style="background:#FFB84D"></div><div class="i"><b>Dourado Sol</b> <code>#FFB84D</code><span>Detalhes quentes, palavras de destaque</span></div></div>
  </div>
  <div class="propbar">
    <div style="flex:52;background:#0B2D48"></div>
    <div style="flex:16;background:#17C3B2"></div>
    <div style="flex:8;background:#0E9AA7"></div>
    <div style="flex:14;background:#F6EFE3"></div>
    <div style="flex:7;background:#FF7A45"></div>
    <div style="flex:3;background:#FFB84D"></div>
  </div>
  <div class="plegend">
    <span><i style="background:#0B2D48;border:1px solid var(--line)"></i>Navy ~52%</span>
    <span><i style="background:#17C3B2"></i>Turquesa ~16%</span>
    <span><i style="background:#0E9AA7"></i>Teal ~8%</span>
    <span><i style="background:#F6EFE3"></i>Areia ~14%</span>
    <span><i style="background:#FF7A45"></i>Laranja ~7%</span>
    <span><i style="background:#FFB84D"></i>Dourado ~3%</span>
  </div>
</section>

<section>
  <div class="shead"><span class="snum">02</span><h2>Tipografia</h2></div>
  <p class="sdesc">Três fontes, todas gratuitas no Google Fonts — funciona no Canva, no Figma e em qualquer editor.</p>
  <div class="types">
    <div class="card type">
      <div class="sample pacifico" style="color:var(--turq)">Vem pro mar</div>
      <div class="meta"><b>Pacifico</b><span>Regular</span></div>
      <div class="use">O convite manuscrito. Só em frases curtas de emoção (“Bora pro mar?”) — nunca em texto corrido nem em caps.</div>
    </div>
    <div class="card type">
      <div class="sample lilita">PASSEIO DE LANCHA</div>
      <div class="meta"><b>Lilita One</b><span>Regular</span></div>
      <div class="use">Títulos e headlines. Sempre grande, uma ideia por linha; destaque uma palavra em turquesa ou dourado.</div>
    </div>
    <div class="card type">
      <div class="sample" style="font-size:30px;font-weight:500">Roteiro personalizado, saída do cais de Paraty às 10h. <b style="color:var(--gold)">Reserve pelo WhatsApp.</b></div>
      <div class="meta"><b>Poppins</b><span>400 · 500 · 600 · 700 · 800</span></div>
      <div class="use">Corpo de texto, legendas, pills e botões. Caps com letter-spacing em labels (“ROTEIROS”, “SAÍDAS TODOS OS DIAS”).</div>
    </div>
  </div>
</section>

<section>
  <div class="shead"><span class="snum">03</span><h2>Logo</h2></div>
  <p class="sdesc">O selo náutico é a assinatura: sol de fim de tarde, a serra, a lancha planando. Versão principal pra foto de perfil e carimbos; horizontal pra cabeçalhos; monocromática pra marca d’água.</p>
  <div class="logos">
    <div class="lg" style="background:#0B2D48"><img class="zoom" data-cap="Logo — Selo principal" src="${img.selo}" alt="Selo principal"><span><b>Principal</b> — foto de perfil e fundos escuros</span></div>
    <div class="lg" style="background:#F6EFE3"><img class="zoom" data-cap="Logo — Selo em fundo claro" src="${img.seloClaro}" alt="Selo fundo claro"><span style="color:#0B2D48"><b>Fundo claro</b> — papelaria, fundos areia/branco</span></div>
    <div class="lg" style="background:linear-gradient(180deg,#0E9AA7,#17C3B2)"><img class="zoom" data-cap="Logo — Mono branca (marca d’água)" src="${img.seloMono}" alt="Selo monocromático"><span style="color:#fff"><b>Mono branca</b> — marca d’água sobre foto (60–75% opacidade)</span></div>
    <div class="lg wide" style="background:#0B2D48"><img class="zoom" data-cap="Logo — Horizontal" src="${img.lockup}" alt="Logo horizontal"><span><b>Horizontal</b> — cabeçalho de flyer, capa de vídeo, assinatura de arte</span></div>
  </div>
  <div class="rules">
    <span class="rule ok">✓ Respiro mínimo: altura do “V” ao redor</span>
    <span class="rule ok">✓ Tamanho mínimo: 110 px de largura</span>
    <span class="rule no">✕ Não esticar nem rotacionar</span>
    <span class="rule no">✕ Não trocar cores nem tirar elementos</span>
    <span class="rule no">✕ Não aplicar sombra ou contorno</span>
  </div>
</section>

<section>
  <div class="shead"><span class="snum">04</span><h2>Capas de destaque</h2></div>
  <p class="sdesc">Oito capas no mesmo sistema: anel areia, ícone de linha e um toque laranja. Arquivo em 1080×1920 com o ícone centralizado — é só subir no destaque, sem ajuste.</p>
  <div class="card hls">
    ${capas.map(c => capaCircle(c, 92)).join('\n    ')}
  </div>
</section>

<section>
  <div class="shead"><span class="snum">05</span><h2>O perfil montado</h2></div>
  <p class="sdesc">Como tudo se encaixa no Instagram — avatar, bio sugerida, destaques e o feed com as artes do sistema.</p>
  <div class="card mock">
    <div class="mhead">
      <img src="${img.selo}" alt="Avatar">
      <div>
        <b style="font-size:16px">vempraparaty</b>
        <div class="mstats" style="margin-top:8px"><span><b>—</b>posts</span><span><b>—</b>seguidores</span><span><b>—</b>seguindo</span></div>
      </div>
    </div>
    <div class="mbio"><b>Vem pra Paraty | Passeio de Lancha</b>
🚤 Turismo náutico em Paraty há 24 anos
⭐ +5.000 passeios realizados
🏝️ Roteiros privativos por ilhas e praias
👇 Reserve pelo WhatsApp</div>
    <div class="mbtns"><span class="mbtn">Reservar</span><span class="mbtn sec">Seguir</span><span class="mbtn sec">Mensagem</span></div>
    <div class="mhls">
      ${capas.slice(0, 5).map(c => capaCircle(c, 56)).join('\n      ')}
    </div>
    <div class="mposts">
      <img class="zoom" data-cap="Feed montado — capa de carrossel" src="${img.tplCar}" alt="Post carrossel"><img class="zoom" data-cap="Feed montado — flyer promo" src="${img.tplFly}" alt="Post flyer"><img class="zoom" data-cap="Feed montado — story promo" src="${img.tplSto}" alt="Post story">
    </div>
  </div>
</section>

<section>
  <div class="shead"><span class="snum">06</span><h2>Templates de post</h2></div>
  <p class="sdesc">Três estruturas prontas que cobrem o dia a dia: conteúdo de valor, oferta no feed e oferta em story. Preços e textos são ilustrativos — troca a foto, troca a frase, a identidade segura o resto.</p>
  <div class="tpls">
    <div class="tpl"><img class="zoom" data-cap="Template — Capa de carrossel 1080×1350" src="${img.tplCar}" alt="Template capa de carrossel"><b>Capa de carrossel — 1080×1350</b><span>Selo no topo, pill laranja de categoria, headline em duas cores, “arrasta pro lado”.</span></div>
    <div class="tpl"><img class="zoom" data-cap="Template — Flyer promo (feed/ads) 1080×1350" src="${img.tplFly}" alt="Template flyer promocional"><b>Flyer promo (feed/ads) — 1080×1350</b><span>Selo central, pill turquesa, bloco de preço laranja + CTA WhatsApp.</span></div>
    <div class="tpl"><img class="zoom" data-cap="Template — Story promo 1080×1920" src="${img.tplSto}" alt="Template story promocional"><b>Story promo — 1080×1920</b><span>Pacifico de abertura, checklist de benefícios, CTA laranja full-width.</span></div>
  </div>
</section>

<section>
  <div class="shead"><span class="snum">07</span><h2>Tom de voz</h2></div>
  <div class="voz">
    <div class="card vz">
      <h3>Personalidade</h3>
      <ul>
        <li><b>Convite, não anúncio</b> — fala como quem chama um amigo pro passeio.</li>
        <li><b>Alegre e direto</b> — frases curtas, zero jargão náutico.</li>
        <li><b>Confiança de quem conhece</b> — uma das primeiras lanchas de Paraty, conhece cada praia pelo nome.</li>
      </ul>
    </div>
    <div class="card vz">
      <h3>Frases da casa</h3>
      <div class="frase">“Bora pro mar?”<br>“Seu dia de lancha em Paraty.”<br>“A gente conhece cada praia pelo nome.”<br>“Fecha teu roteiro no WhatsApp.”</div>
    </div>
    <div class="card vz">
      <h3>Hashtags fixas</h3>
      <div class="tags"><span>#VemPraParaty</span><span>#Paraty</span><span>#PasseioDeLancha</span><span>#ParatyRJ</span><span>#CostaVerde</span></div>
      <h3 style="margin-top:20px">CTA padrão</h3>
      <ul><li>Feed e story fecham sempre em <b>“Reserve pelo WhatsApp”</b> (pill laranja ou turquesa).</li></ul>
    </div>
  </div>
</section>

<section>
  <div class="shead"><span class="snum">08</span><h2>Criativos de teste</h2></div>
  <p class="sdesc">16 artes em 10 ângulos de mensagem, prontas pro Meta Ads — cada ângulo testa uma hipótese diferente de por que a pessoa fecha o passeio. Objetivo Mensagens (WhatsApp); avalia por custo por conversa iniciada, não por clique.</p>
  <div class="plan">
    <div class="card pc"><span class="obj">Conjunto A • oferta</span><h3>Preço na mesa</h3><ul><li><b>Preço direto</b> (feed + story)</li><li><b>O que tá incluso</b> (feed)</li><li><b>Matemática da galera</b> (feed)</li></ul></div>
    <div class="card pc"><span class="obj">Conjunto B • desejo</span><h3>Roteiro e prova</h3><ul><li><b>Roteiro concreto</b> (feed + story)</li><li><b>Urgência de data</b> (feed + story)</li><li><b>Depoimento</b> (feed + story)</li></ul></div>
    <div class="card pc"><span class="obj">Conjunto C • alcance</span><h3>Marca e emoção</h3><ul><li><b>Pôr do sol</b> (feed + story)</li><li><b>Galera / social</b> (feed + story)</li><li><b>Tradição</b> + <b>Privativo</b> (feed)</li></ul></div>
  </div>
  <div class="card" style="margin-top:14px;padding:8px 26px">
    <div class="steps">
      <div class="step"><div><b>Roda 3–5 dias</b> <span>com orçamento igual por conjunto, sem mexer no meio.</span></div></div>
      <div class="step"><div><b>Mata o pior criativo de cada conjunto</b> <span>(maior custo por conversa) e deixa o resto rodar mais 3 dias.</span></div></div>
      <div class="step"><div><b>Escala o vencedor</b> <span>subindo orçamento aos poucos (20–30% por vez) e criando variações dele.</span></div></div>
    </div>
  </div>
  <div class="anote"><b>Antes de subir:</b> o depoimento do ângulo 9 é ilustrativo — trocar pelo texto de um cliente real. Fotos geradas por IA no clima de Paraty; quando houver fotos boas das lanchas reais, os fundos são refeitos pra ganhar ainda mais confiança.</div>
  <div class="agrid" style="margin-top:26px">${adCards}</div>
</section>

<section>
  <div class="shead"><span class="snum">09</span><h2>Plano de lançamento</h2></div>
  <p class="sdesc">Do perfil novo à primeira campanha no ar — implantação em dois dias, primeira semana com legenda pronta pra copiar, stories, atendimento e como medimos tudo.</p>

  <div class="plan">
    <div class="card pc"><span class="obj">Hoje • implantação</span><h3>Dia 1</h3><ul>
      <li>Foto de perfil: <b>avatar-perfil-1080.png</b></li>
      <li>Bio nova (seção 05) + link do WhatsApp na bio</li>
      <li>Subir as <b>8 capas de destaque</b> na ordem: Roteiros, Frota, Preços, Depoimentos, Reservas, Paraty, Promoções, Bastidores</li>
      <li>Publicar o <b>post de estreia</b> e fixar carrossel + flyer + pôr do sol no topo do grid</li>
    </ul></div>
    <div class="card pc"><span class="obj">Amanhã • tração</span><h3>Dia 2</h3><ul>
      <li>Posts 2 e 3 da Semana 1 (legendas abaixo)</li>
      <li>Stories "Bom dia do cais" (roteiro 1)</li>
      <li>Conectar a conta de anúncios no painel DDG</li>
      <li>Subir a campanha <b>Conjunto A — oferta</b> (criativos 01, 08 e 10, objetivo Mensagens)</li>
    </ul></div>
    <div class="card pc"><span class="obj">Ritmo • 30 dias</span><h3>Calendário</h3><ul>
      <li><b>SEG</b> — roteiro/praia (conteúdo de valor)</li>
      <li><b>QUA</b> — prova social (depoimento, frota, bastidor)</li>
      <li><b>SEX</b> — oferta (flyer, urgência de fim de semana)</li>
      <li><b>DOM</b> — aspiracional (pôr do sol)</li>
      <li><b>Stories todo dia</b> • Reels a partir da 1ª saída filmada</li>
    </ul></div>
  </div>

  <h3 class="sub">Semana 1 — sete posts com legenda pronta</h3>
  <p class="subdesc">É só publicar a arte indicada e copiar a legenda. Ordem pensada: estreia → oferta → emoção → social → transparência → história → conta na ponta do lápis.</p>
  <div class="capgrid">
    <div class="card cap"><div class="caphead"><b>DIA 1 • Estreia</b><span>arte: capa de carrossel "5 praias"</span></div><div class="captext">Tem praia em Paraty que você não chega de carro. Nem de chinelo. Só de lancha. 🚤

Separamos 5 paradas que valem o dia inteiro — arrasta pro lado e escolhe a tua.

Roteiro do seu jeito, saída do cais de Paraty, todos os dias. Reserva rápida pelo WhatsApp (link na bio). 👆🏽

#VemPraParaty #Paraty #PasseioDeLancha #ParatyRJ #CostaVerde</div><button class="cpy">Copiar legenda</button></div>

    <div class="card cap"><div class="caphead"><b>DIA 2 • Oferta</b><span>arte: flyer promo (R$ 700)</span></div><div class="captext">Lancha privativa em Paraty a partir de R$ 700 — o passeio inteiro, não por pessoa. 😉

Até 12 pessoas, roteiro do seu jeito, saídas todos os dias direto do cais.

📲 Chama no WhatsApp e garante tua data (link na bio).

#VemPraParaty #Paraty #PasseioDeLancha #ParatyRJ #CostaVerde</div><button class="cpy">Copiar legenda</button></div>

    <div class="card cap"><div class="caphead"><b>DIA 3 • Emoção</b><span>arte: pôr do sol (ad06 feed)</span></div><div class="captext">Tem gente que acha que o dia termina às 18h.

A gente prefere desligar o motor no meio da baía e assistir o céu pegar fogo. 🌅

Seu pôr do sol tem endereço: Paraty.

#VemPraParaty #Paraty #PasseioDeLancha #ParatyRJ #CostaVerde</div><button class="cpy">Copiar legenda</button></div>

    <div class="card cap"><div class="caphead"><b>DIA 4 • Galera</b><span>arte: grupo polaroid (ad07 feed)</span></div><div class="captext">Regra da casa: ninguém volta sem história pra contar. 😄

Até 12 pessoas por lancha, paradas pra nadar nas melhores praias da baía.

Marca aqui embaixo a galera que precisa entrar nesse barco. 👇🏽

#VemPraParaty #Paraty #PasseioDeLancha #ParatyRJ #CostaVerde</div><button class="cpy">Copiar legenda</button></div>

    <div class="card cap"><div class="caphead"><b>DIA 5 • Transparência</b><span>arte: o que tá incluso (ad08 feed)</span></div><div class="captext">Sem pegadinha. O que tá incluso no seu passeio: 👇🏽

✔️ Marinheiro experiente
✔️ Combustível
✔️ Coletes e equipamentos
✔️ Paradas pra nadar
✔️ Roteiro personalizado

A partir de R$ 700 o passeio. Pede teu orçamento no WhatsApp (link na bio).

#VemPraParaty #Paraty #PasseioDeLancha #ParatyRJ #CostaVerde</div><button class="cpy">Copiar legenda</button></div>

    <div class="card cap"><div class="caphead"><b>DIA 6 • História</b><span>arte: tradição (ad04 feed)</span></div><div class="captext">Quando o passeio de lancha virou moda em Paraty, a gente já estava na água — somos das primeiras lanchas da cidade, há 24 anos no mar. ⚓

Mais de 5.000 passeios depois, sabemos o nome de cada praia, a hora de cada maré e o canto certo pra fugir do vento.

Vem navegar com quem conhece. 🌊

#VemPraParaty #Paraty #PasseioDeLancha #ParatyRJ #CostaVerde</div><button class="cpy">Copiar legenda</button></div>

    <div class="card cap"><div class="caphead"><b>DIA 7 • A conta</b><span>arte: matemática da galera (ad10 feed)</span></div><div class="captext">Faz a conta com a gente: R$ 700 ÷ 12 amigos = menos de R$ 60 cada. 🧮

Um dia INTEIRO de lancha privativa em Paraty. Sai mais barato que muito rodízio por aí.

Simula tua data no WhatsApp (link na bio). 🚤

#VemPraParaty #Paraty #PasseioDeLancha #ParatyRJ #CostaVerde</div><button class="cpy">Copiar legenda</button></div>
  </div>

  <h3 class="sub">Stories que vendem — cinco roteiros prontos</h3>
  <div class="card" style="padding:8px 26px">
    <div class="steps">
      <div class="step"><div><b>Bom dia do cais</b> <span>— vídeo curto da lancha saindo + sticker "hoje tem vaga" + link do WhatsApp. Todo dia de saída.</span></div></div>
      <div class="step"><div><b>Enquete de praia</b> <span>— "Qual dessas você conhece: Praia da Lula ou Lagoa Azul?" Quem vota recebe DM com o roteiro.</span></div></div>
      <div class="step"><div><b>Bastidor</b> <span>— preparando a lancha (gelo, coletes, checagem) + "saída 10h". Gera confiança sem produção.</span></div></div>
      <div class="step"><div><b>Contagem do fim de semana</b> <span>— quinta/sexta: sticker de contagem + "restam X datas pro sábado". Urgência honesta.</span></div></div>
      <div class="step"><div><b>Caixinha "quanto custa?"</b> <span>— responde com o flyer de R$ 700 + repost de cliente marcando a página.</span></div></div>
    </div>
  </div>
  <div class="anote"><b>Regra de ouro:</b> todo story termina com um caminho — link do WhatsApp, caixinha ou enquete. Story sem CTA é foto de álbum.</div>

  <h3 class="sub">Atendimento no WhatsApp — onde a venda fecha</h3>
  <p class="subdesc">O anúncio traz a conversa; quem fecha é a resposta. Meta: responder em até 15 minutos em horário comercial.</p>
  <div class="capgrid">
    <div class="card cap"><div class="caphead"><b>Primeira resposta</b><span>enviar em até 5 min</span></div><div class="captext">Oi! 👋🏽 Que bom te ver por aqui. Pra eu montar teu orçamento certinho, me conta:

📅 Qual data você tá pensando?
👥 Quantas pessoas vão?
🏝️ Já tem roteiro em mente ou quer nossa sugestão?</div><button class="cpy">Copiar mensagem</button></div>
    <div class="card cap"><div class="caphead"><b>Proposta</b><span>sempre 2 opções</span></div><div class="captext">Perfeito! Pra [data] com [X] pessoas eu tenho:

🚤 Roteiro completo (5h) — praias + ilhas + pôr do sol: R$ [valor]
🚤 Meio período (3h) — 3 paradas escolhidas: R$ [valor]

Os dois já incluem marinheiro, combustível, coletes e paradas pra nadar. Qual combina mais com vocês?</div><button class="cpy">Copiar mensagem</button></div>
    <div class="card cap"><div class="caphead"><b>Fechamento + follow-up</b><span>sinal garante a data</span></div><div class="captext">Fechamento: "Pra garantir a data eu só preciso de um sinal de [X]% — o restante no dia do passeio. Fecho pra vocês?"

Follow-up (24h sem resposta): "Oi, [nome]! Segurei a cotação da tua data até amanhã. Quer que eu mantenha? 🌊"</div><button class="cpy">Copiar mensagem</button></div>
  </div>

  <h3 class="sub">Como vamos medir — transparência total</h3>
  <div class="card" style="padding:26px 30px">
    <p style="margin:0 0 10px;font-size:15px;color:var(--sand-2)">O Vem pra Paraty já está cadastrado no painel da Dose de Growth. Assim que a conta de anúncios for conectada, você acompanha tudo em tempo real, sem pedir relatório pra ninguém:</p>
    <p style="margin:0 0 16px"><a class="painel-link" href="https://painel.dosedegrowth.com/c/vem-pra-paraty">painel.dosedegrowth.com/c/vem-pra-paraty</a></p>
    <div>
      <span class="kchip">Investimento por dia</span>
      <span class="kchip">Conversas iniciadas no WhatsApp</span>
      <span class="kchip">Custo por conversa</span>
      <span class="kchip">Campanha a campanha</span>
      <span class="kchip">Detecção automática de anomalia</span>
    </div>
    <p style="margin:16px 0 0;font-size:14px;color:var(--sand-2)">A decisão de matar ou escalar criativo segue o plano da seção 08: custo por conversa manda, clique bonito não paga combustível.</p>
  </div>

  <h3 class="sub">O que precisamos de você essa semana</h3>
  <div class="card" style="padding:8px 26px">
    <div class="steps">
      <div class="step"><div><b>Fotos e vídeos reais da frota</b> <span>— de celular serve; de manhã, com sol. Substituem as imagens geradas e aumentam conversão.</span></div></div>
      <div class="step"><div><b>Nome e capacidade de cada lancha</b> <span>— vira conteúdo da capa "Frota" e dos posts.</span></div></div>
      <div class="step"><div><b>3 a 5 depoimentos reais</b> <span>— print de WhatsApp vale. Entram no lugar do depoimento ilustrativo do ângulo 9.</span></div></div>
      <div class="step"><div><b>Número oficial do WhatsApp de reservas</b> <span>— e quem responde (os anúncios apontam pra lá).</span></div></div>
      <div class="step"><div><b>Roteiros e preços reais</b> <span>— por lancha e tamanho de grupo, pra proposta do atendimento ficar exata.</span></div></div>
      <div class="step"><div><b>Autorização de uso de imagem</b> <span>— dos clientes que aparecerem em foto e vídeo.</span></div></div>
    </div>
  </div>
</section>

</main>

<footer>
  <span class="pacifico">Vem pra Paraty</span>
  Identidade visual desenvolvida pela Dose de Growth • agosto/2026
</footer>
${extras}
</body></html>`;

// artifact: Google Fonts por link; print: fontes locais
const gfLink = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Pacifico&family=Lilita+One&family=Poppins:wght@400;500;600;700;800&display=swap">`;
const localLink = `<link rel="stylesheet" href="file://${BRAND}/fonts/fonts-local.css">`;
const printCss = `
  @media print{
    body{background:#07203A !important;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    section{padding:34px 0 4px;break-inside:auto}
    header .hero{padding:46px 28px 40px}
    .card,.sw,.lg,.tpl,.vz{break-inside:avoid}
    .mock{break-inside:avoid}
    .cpy{display:none}
  }`;

// camada interativa (só na versão artifact): lightbox-carrossel + animações
const extras = `
<style>
  .zoom{cursor:zoom-in;transition:transform .35s cubic-bezier(.16,1,.3,1),box-shadow .35s ease}
  .zoom:hover{transform:translateY(-4px) scale(1.015);box-shadow:0 18px 50px rgba(0,0,0,.45)}
  .hlc .zoom:hover{transform:scale(1.07);box-shadow:none}
  .mposts .zoom:hover{transform:scale(1.04);box-shadow:none}
  html.js .rv{opacity:0;transform:translateY(26px);transition:opacity .7s ease,transform .7s cubic-bezier(.16,1,.3,1)}
  html.js .rv.in{opacity:1;transform:none}
  html.js .hero>*{opacity:0;animation:vppUp .8s cubic-bezier(.16,1,.3,1) forwards}
  html.js .hero .eyebrow{animation-delay:.05s}
  html.js .hero img.lk{animation-delay:.22s}
  html.js .hero p.tag{animation-delay:.42s}
  html.js .hero .chips{animation-delay:.58s}
  @keyframes vppUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
  html.js .waves g{animation:vppDrift 26s ease-in-out infinite alternate}
  @keyframes vppDrift{from{transform:translateX(-34px)}to{transform:translateX(34px)}}
  #lb{position:fixed;inset:0;z-index:99;background:rgba(4,17,30,.94);display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity .28s ease}
  #lb.open{opacity:1;pointer-events:auto}
  #lb figure{margin:0;display:flex;flex-direction:column;align-items:center;gap:16px;max-width:calc(100vw - 190px)}
  #lbi{max-width:min(86vw,1000px);max-height:80vh;border-radius:16px;box-shadow:0 40px 120px rgba(0,0,0,.65);transform:scale(.94);opacity:0;transition:transform .3s cubic-bezier(.16,1,.3,1),opacity .3s ease}
  #lb.open #lbi.show{transform:scale(1);opacity:1}
  #lbc{font:500 15.5px Poppins,sans-serif;color:rgba(246,239,227,.88);letter-spacing:.5px;text-align:center;max-width:80vw}
  .lbbtn{position:fixed;top:50%;transform:translateY(-50%);width:64px;height:64px;border-radius:50%;border:1.5px solid rgba(246,239,227,.28);background:rgba(11,45,72,.65);color:#F6EFE3;font-size:34px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;font-family:Poppins,sans-serif;transition:background .2s,border-color .2s,transform .2s}
  .lbbtn:hover{background:#FF7A45;border-color:#FF7A45;transform:translateY(-50%) scale(1.08)}
  #lbp{left:26px}#lbn{right:26px}
  #lbx{top:24px;right:26px;left:auto;transform:none;width:52px;height:52px;font-size:22px}
  #lbx:hover{transform:scale(1.08)}
  #lbt{position:fixed;bottom:26px;left:50%;transform:translateX(-50%);font:600 14px Poppins,sans-serif;letter-spacing:2px;color:rgba(246,239,227,.75);background:rgba(11,45,72,.65);border:1px solid rgba(246,239,227,.16);border-radius:999px;padding:8px 18px}
  #lbhint{position:fixed;bottom:28px;right:28px;font:500 12.5px Poppins,sans-serif;color:rgba(246,239,227,.42)}
  @media (max-width:760px){.lbbtn{width:48px;height:48px;font-size:26px}#lbp{left:8px}#lbn{right:8px}#lb figure{max-width:calc(100vw - 24px)}#lbi{max-width:94vw}#lbhint{display:none}}
  @media (prefers-reduced-motion: reduce){
    html.js .rv,html.js .hero>*{opacity:1 !important;transform:none !important;animation:none !important;transition:none !important}
    html.js .waves g{animation:none !important}
    .zoom,.zoom:hover{transform:none !important;transition:none !important}
    #lbi,#lb{transition:none !important}
  }
</style>
<div id="lb" role="dialog" aria-modal="true" aria-label="Visualização da arte">
  <button class="lbbtn" id="lbx" aria-label="Fechar">✕</button>
  <button class="lbbtn" id="lbp" aria-label="Anterior">‹</button>
  <figure><img id="lbi" alt=""><figcaption id="lbc"></figcaption></figure>
  <button class="lbbtn" id="lbn" aria-label="Próxima">›</button>
  <div id="lbt"></div>
  <div id="lbhint">← → navegam &nbsp;•&nbsp; Esc fecha</div>
</div>
<script>
(function(){
  document.documentElement.classList.add('js');
  var items=[].slice.call(document.querySelectorAll('img.zoom'));
  var lb=document.getElementById('lb'),lbi=document.getElementById('lbi'),
      lbc=document.getElementById('lbc'),lbt=document.getElementById('lbt');
  var cur=0,open=false,swapT=null;
  function show(i){
    cur=(i+items.length)%items.length;
    var el=items[cur];
    lbi.classList.remove('show');
    clearTimeout(swapT);
    swapT=setTimeout(function(){
      lbi.src=el.src;lbi.alt=el.alt||'';
      lbc.textContent=el.getAttribute('data-cap')||el.alt||'';
      lbt.textContent=(cur+1)+' / '+items.length;
      requestAnimationFrame(function(){requestAnimationFrame(function(){lbi.classList.add('show')})});
    },110);
  }
  function openLb(i){open=true;lb.classList.add('open');document.body.style.overflow='hidden';show(i)}
  function close(){open=false;lb.classList.remove('open');document.body.style.overflow=''}
  items.forEach(function(el,i){el.addEventListener('click',function(){openLb(i)})});
  document.getElementById('lbx').addEventListener('click',close);
  document.getElementById('lbp').addEventListener('click',function(e){e.stopPropagation();show(cur-1)});
  document.getElementById('lbn').addEventListener('click',function(e){e.stopPropagation();show(cur+1)});
  lb.addEventListener('click',function(e){if(e.target===lb)close()});
  var tx=null;
  lb.addEventListener('touchstart',function(e){tx=e.changedTouches[0].clientX},{passive:true});
  lb.addEventListener('touchend',function(e){
    if(tx===null)return;
    var dx=e.changedTouches[0].clientX-tx;tx=null;
    if(Math.abs(dx)>48){if(dx<0)show(cur+1);else show(cur-1)}
  },{passive:true});
  document.addEventListener('keydown',function(e){
    if(!open)return;
    if(e.key==='Escape')close();
    else if(e.key==='ArrowLeft')show(cur-1);
    else if(e.key==='ArrowRight')show(cur+1);
  });
  document.querySelectorAll('.cpy').forEach(function(b){
    b.addEventListener('click',function(){
      var box=b.parentElement.querySelector('.captext');
      var t=box.innerText;
      var done=function(){b.textContent='Copiado ✓';setTimeout(function(){b.textContent=b.dataset.orig},1600)};
      b.dataset.orig=b.dataset.orig||b.textContent;
      if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(done).catch(function(){selFallback()})}
      else selFallback();
      function selFallback(){var r=document.createRange();r.selectNodeContents(box);var s=getSelection();s.removeAllRanges();s.addRange(r);b.textContent='Selecionado — Ctrl+C';setTimeout(function(){b.textContent=b.dataset.orig},2200)}
    });
  });
  var rvs=[].slice.call(document.querySelectorAll('.shead,.sdesc,.card,.sw,.lg,.tpl,.pc,.propbar,.plegend,.rules,.anote'));
  rvs.forEach(function(el){el.classList.add('rv')});
  if('IntersectionObserver' in window){
    var seen=0;
    var io=new IntersectionObserver(function(es){
      es.forEach(function(en){
        if(en.isIntersecting){
          en.target.style.transitionDelay=(seen%4)*80+'ms';seen++;
          en.target.classList.add('in');io.unobserve(en.target);
        }
      });
    },{threshold:.1,rootMargin:'0px 0px -40px 0px'});
    rvs.forEach(function(el){io.observe(el)});
  } else { rvs.forEach(function(el){el.classList.add('in')}) }
})();
</script>`;

fs.writeFileSync(path.join(M, 'manual-artifact.html'), html(gfLink, '', extras));
fs.writeFileSync(path.join(M, 'manual-print.html'), html(localLink, printCss));
console.log('html ok');

(async () => {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    headless: true,
    args: ['--no-sandbox', '--force-color-profile=srgb'],
  });
  const page = await browser.newPage({ viewport: { width: 1120, height: 1400 } });
  await page.goto('file://' + path.join(M, 'manual-print.html'), { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
  await page.pdf({
    path: path.join(M, 'identidade-visual-vem-pra-paraty.pdf'),
    format: 'A4', printBackground: true,
    margin: { top: '0', bottom: '0', left: '0', right: '0' },
  });
  // preview do topo do manual pra conferência
  await page.screenshot({ path: path.join(M, 'preview-top.png'), clip: { x: 0, y: 0, width: 1120, height: 1400 } });
  await browser.close();
  console.log('pdf ok', Math.round(fs.statSync(path.join(M, 'identidade-visual-vem-pra-paraty.pdf')).size / 1024) + 'KB');
})().catch(e => { console.error('ERR:', e.message); process.exit(1); });
