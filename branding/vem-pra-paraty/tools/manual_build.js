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
  { id: 'ad04', nome: 'Tradição local', formatos: ['feed'], hip: '"A 3ª lancha de Paraty" — autoridade converte quem está comparando fornecedores.', func: 'Meio/fundo', slug: 'tradicao' },
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
    <div class="aimgs">${a.formatos.map(f => `<img src="${b64a(`${a.id}-${f}.jpg`)}" alt="${a.nome} ${f}" class="${f}">`).join('')}</div>
    <div class="afiles">${a.formatos.map(f => `<code>vpp-${a.id}-${a.slug}-${f}.png</code>`).join(' ')}</div>
  </div>`).join('\n');
const capaLabel = { roteiros:'Roteiros', frota:'Frota', precos:'Preços', depoimentos:'Depoimentos', reservas:'Reservas', paraty:'Paraty', promocoes:'Promoções', bastidores:'Bastidores' };

const capaCircle = (c, size) => `<div class="hl"><div class="hlc" style="width:${size}px;height:${size}px"><img src="${c.d}" alt="Capa ${capaLabel[c.s]}"></div><span>${capaLabel[c.s]}</span></div>`;

const html = (fontsBlock, printCss) => `<!doctype html>
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
      <div class="chip"><b>4 lanchas</b> na água</div>
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
    <div class="lg" style="background:#0B2D48"><img src="${img.selo}" alt="Selo principal"><span><b>Principal</b> — foto de perfil e fundos escuros</span></div>
    <div class="lg" style="background:#F6EFE3"><img src="${img.seloClaro}" alt="Selo fundo claro"><span style="color:#0B2D48"><b>Fundo claro</b> — papelaria, fundos areia/branco</span></div>
    <div class="lg" style="background:linear-gradient(180deg,#0E9AA7,#17C3B2)"><img src="${img.seloMono}" alt="Selo monocromático"><span style="color:#fff"><b>Mono branca</b> — marca d’água sobre foto (60–75% opacidade)</span></div>
    <div class="lg wide" style="background:#0B2D48"><img src="${img.lockup}" alt="Logo horizontal"><span><b>Horizontal</b> — cabeçalho de flyer, capa de vídeo, assinatura de arte</span></div>
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
    <div class="mbio"><b>Vem pra Paraty 🚤</b>
Passeios de lancha em Paraty-RJ
🏝️ Praias e ilhas num dia inesquecível
⚓ 4 lanchas • saídas todos os dias
👇 Reserva rápida pelo WhatsApp</div>
    <div class="mbtns"><span class="mbtn">Reservar</span><span class="mbtn sec">Seguir</span><span class="mbtn sec">Mensagem</span></div>
    <div class="mhls">
      ${capas.slice(0, 5).map(c => capaCircle(c, 56)).join('\n      ')}
    </div>
    <div class="mposts">
      <img src="${img.tplCar}" alt=""><img src="${img.tplFly}" alt=""><img src="${img.tplSto}" alt="">
    </div>
  </div>
</section>

<section>
  <div class="shead"><span class="snum">06</span><h2>Templates de post</h2></div>
  <p class="sdesc">Três estruturas prontas que cobrem o dia a dia: conteúdo de valor, oferta no feed e oferta em story. Preços e textos são ilustrativos — troca a foto, troca a frase, a identidade segura o resto.</p>
  <div class="tpls">
    <div class="tpl"><img src="${img.tplCar}" alt="Template capa de carrossel"><b>Capa de carrossel — 1080×1350</b><span>Selo no topo, pill laranja de categoria, headline em duas cores, “arrasta pro lado”.</span></div>
    <div class="tpl"><img src="${img.tplFly}" alt="Template flyer promocional"><b>Flyer promo (feed/ads) — 1080×1350</b><span>Selo central, pill turquesa, bloco de preço laranja + CTA WhatsApp.</span></div>
    <div class="tpl"><img src="${img.tplSto}" alt="Template story promocional"><b>Story promo — 1080×1920</b><span>Pacifico de abertura, checklist de benefícios, CTA laranja full-width.</span></div>
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

</main>

<footer>
  <span class="pacifico">Vem pra Paraty</span>
  Identidade visual desenvolvida pela Dose de Growth • agosto/2026
</footer>
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
  }`;

fs.writeFileSync(path.join(M, 'manual-artifact.html'), html(gfLink, ''));
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
