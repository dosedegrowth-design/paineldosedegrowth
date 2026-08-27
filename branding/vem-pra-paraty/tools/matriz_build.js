// Matriz de criativos de teste — thumbs + página artifact
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const BRAND = path.resolve(__dirname, '..');
const ADS = path.join(BRAND, 'ads');
const TH = path.join(ADS, 'thumbs');
fs.mkdirSync(TH, { recursive: true });

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

(async () => {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    headless: true, args: ['--no-sandbox', '--force-color-profile=srgb'],
  });
  const page = await browser.newPage({ viewport: { width: 900, height: 1200 } });
  const tmp = path.join(TH, '_t.html');
  for (const a of angles) {
    for (const f of a.formatos) {
      const src = path.join(ADS, `vpp-${a.id}-${a.slug}-${f}.png`);
      const w = f === 'feed' ? 860 : 640;
      fs.writeFileSync(tmp, `<body style="margin:0"><img id="i" src="file://${src}" style="width:${w}px;display:block"></body>`);
      await page.goto('file://' + tmp, { waitUntil: 'load' });
      await page.waitForFunction(() => { const i = document.getElementById('i'); return i.complete && i.naturalWidth > 0; });
      const el = await page.$('#i');
      await el.screenshot({ path: path.join(TH, `${a.id}-${f}.jpg`), type: 'jpeg', quality: 80 });
    }
  }
  await browser.close();
  fs.unlinkSync(tmp);

  const b64 = (f) => 'data:image/jpeg;base64,' + fs.readFileSync(path.join(TH, f)).toString('base64');
  const cards = angles.map((a, i) => `
  <div class="card ang">
    <div class="ahead">
      <span class="anum lilita">${String(i + 1).padStart(2, '0')}</span>
      <div><h3 class="lilita">${a.nome}</h3><span class="func">${a.func}</span></div>
      <span class="fmt pop">${a.formatos.map(f => f === 'feed' ? 'Feed 4:5' : 'Story 9:16').join(' + ')}</span>
    </div>
    <p class="hip">${a.hip}</p>
    <div class="imgs">${a.formatos.map(f => `<img src="${b64(`${a.id}-${f}.jpg`)}" alt="${a.nome} ${f}" class="${f}">`).join('')}</div>
    <div class="files pop">${a.formatos.map(f => `<code>vpp-${a.id}-${a.slug}-${f}.png</code>`).join(' ')}</div>
  </div>`).join('\n');

  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Criativos Vem pra Paraty</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Pacifico&family=Lilita+One&family=Poppins:wght@400;500;600;700;800&display=swap">
<style>
:root{--navy:#0B2D48;--night:#07203A;--turq:#17C3B2;--sand:#F6EFE3;--sand2:rgba(246,239,227,.68);--orange:#FF7A45;--gold:#FFB84D;--line:rgba(246,239,227,.12)}
*{box-sizing:border-box}
body{margin:0;background:var(--night);color:var(--sand);font-family:'Poppins',ui-sans-serif,system-ui,Arial,sans-serif;font-size:16px;line-height:1.6}
.lilita{font-family:'Lilita One','Arial Black',sans-serif;font-weight:400}
.pop{font-family:'Poppins',sans-serif}.pac{font-family:'Pacifico',cursive}
.wrap{max-width:1100px;margin:0 auto;padding:0 28px}
header{background:linear-gradient(180deg,#0B2D48,#07203A);border-bottom:1px solid var(--line);padding:64px 28px 50px;text-align:center}
.eyebrow{color:var(--turq);font-weight:600;font-size:13px;letter-spacing:4px;text-transform:uppercase}
header h1{font-family:'Lilita One';font-weight:400;font-size:52px;margin:14px 0 0}
header h1 b{color:var(--gold);font-weight:400}
header p{max-width:640px;margin:14px auto 0;color:var(--sand2);text-wrap:balance}
.chips{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:24px}
.chip{border:1.5px solid var(--line);border-radius:999px;padding:7px 16px;font-size:13.5px;font-weight:500;color:var(--sand2)}
.chip b{color:var(--turq);font-weight:600}
section{padding:56px 0 8px}
.shead{display:flex;align-items:baseline;gap:14px;margin-bottom:8px}
.shead h2{font-family:'Lilita One';font-weight:400;font-size:32px;margin:0}
.snum{font-family:'Lilita One';color:var(--orange);font-size:19px}
.sdesc{color:var(--sand2);max-width:660px;margin:0 0 26px}
.card{background:var(--navy);border:1px solid var(--line);border-radius:18px}
.plan{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px}
.pc{padding:26px 28px}
.pc h3{margin:0 0 6px;font-size:16px;color:var(--gold);font-family:'Lilita One';font-weight:400;font-size:22px}
.pc .obj{font-size:12.5px;letter-spacing:2.5px;text-transform:uppercase;color:var(--turq);font-weight:600}
.pc ul{margin:14px 0 0;padding-left:18px;color:var(--sand2);font-size:14px}
.pc li{margin-bottom:7px}
.pc li b{color:var(--sand)}
.steps{counter-reset:s;display:grid;gap:0;margin-top:10px}
.step{display:flex;gap:18px;padding:16px 0;border-bottom:1px dashed var(--line);align-items:baseline}
.step:last-child{border-bottom:none}
.step::before{counter-increment:s;content:counter(s);font-family:'Lilita One';color:var(--orange);font-size:22px;min-width:26px}
.step b{color:var(--sand)}
.step span{color:var(--sand2);font-size:14.5px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:16px}
.ang{padding:24px 26px}
.ahead{display:flex;align-items:center;gap:14px}
.anum{color:var(--orange);font-size:20px}
.ahead h3{margin:0;font-size:23px;font-weight:400}
.func{font-size:11.5px;letter-spacing:2px;text-transform:uppercase;color:var(--turq);font-weight:600}
.fmt{margin-left:auto;font-size:11.5px;font-weight:600;color:var(--sand2);border:1.5px solid var(--line);border-radius:999px;padding:5px 12px;white-space:nowrap}
.hip{color:var(--sand2);font-size:14px;margin:12px 0 16px;line-height:1.55}
.imgs{display:flex;gap:12px;align-items:flex-start}
.imgs img{border-radius:12px;border:1px solid var(--line);max-width:100%}
.imgs img.feed{width:62%}
.imgs img.story{width:36%}
.imgs img:only-child{width:75%;margin:0 auto;display:block}
.files{margin-top:14px;display:flex;gap:8px;flex-wrap:wrap}
.files code{font-family:'Poppins';font-size:11.5px;font-weight:600;color:var(--gold);background:rgba(255,184,77,.08);border-radius:8px;padding:4px 10px}
.note{border-left:4px solid var(--orange);background:rgba(255,122,69,.07);border-radius:0 14px 14px 0;padding:18px 22px;color:var(--sand2);font-size:14.5px;margin-top:26px}
.note b{color:var(--sand)}
footer{margin-top:64px;border-top:1px solid var(--line);padding:32px 28px 44px;text-align:center;color:rgba(246,239,227,.42);font-size:13px}
footer .pac{color:var(--turq);font-size:19px;display:block;margin-bottom:6px}
</style></head><body>
<header>
  <span class="eyebrow">Vem pra Paraty • tráfego pago</span>
  <h1>Bateria de criativos <b>de teste</b></h1>
  <p>16 artes em 10 ângulos de mensagem, prontas pro Meta Ads — cada ângulo é uma hipótese diferente de por que a pessoa fecha o passeio.</p>
  <div class="chips"><span class="chip"><b>10</b> ângulos</span><span class="chip"><b>10</b> feed 4:5</span><span class="chip"><b>6</b> stories 9:16</span><span class="chip">preço mínimo <b>R$ 700</b></span></div>
</header>
<main class="wrap">
<section>
  <div class="shead"><span class="snum">01</span><h2>Plano de teste sugerido</h2></div>
  <p class="sdesc">Três conjuntos por etapa de funil, objetivo Mensagens (WhatsApp). Avalia por custo por conversa iniciada, não por clique.</p>
  <div class="plan">
    <div class="card pc"><span class="obj">Conjunto A • oferta</span><h3>Preço na mesa</h3><ul><li><b>Preço direto</b> (feed + story)</li><li><b>O que tá incluso</b> (feed)</li><li><b>Matemática da galera</b> (feed)</li></ul></div>
    <div class="card pc"><span class="obj">Conjunto B • desejo</span><h3>Roteiro e prova</h3><ul><li><b>Roteiro concreto</b> (feed + story)</li><li><b>Urgência de data</b> (feed + story)</li><li><b>Depoimento</b> (feed + story)</li></ul></div>
    <div class="card pc"><span class="obj">Conjunto C • alcance</span><h3>Marca e emoção</h3><ul><li><b>Pôr do sol</b> (feed + story)</li><li><b>Galera / social</b> (feed + story)</li><li><b>Tradição</b> + <b>Privativo</b> (feed)</li></ul></div>
  </div>
  <div class="card" style="margin-top:14px;padding:10px 28px">
    <div class="steps">
      <div class="step"><div><b>Roda 3–5 dias</b> <span>com orçamento igual por conjunto, sem mexer no meio.</span></div></div>
      <div class="step"><div><b>Mata o pior criativo de cada conjunto</b> <span>(maior custo por conversa) e deixa o resto rodar mais 3 dias.</span></div></div>
      <div class="step"><div><b>Escala o vencedor</b> <span>subindo orçamento aos poucos (20–30% por vez) e cria variações dele — me pede que eu gero.</span></div></div>
    </div>
  </div>
  <div class="note"><b>Antes de subir:</b> o depoimento do ângulo 9 é ilustrativo — troca pelo texto de um cliente real (me manda que eu regenero a arte). Fotos são geradas por IA no clima de Paraty; quando tiver foto boa das lanchas reais, a gente refaz os fundos pra ganhar ainda mais confiança.</div>
</section>
<section>
  <div class="shead"><span class="snum">02</span><h2>Os 10 ângulos</h2></div>
  <p class="sdesc">Cada card traz a hipótese que o ângulo testa e os arquivos correspondentes no kit.</p>
  <div class="grid">${cards}</div>
</section>
</main>
<footer><span class="pac">Vem pra Paraty</span>Bateria de criativos • Dose de Growth • agosto/2026</footer>
</body></html>`;

  fs.writeFileSync(path.join(ADS, 'matriz-criativos.html'), html);
  console.log('matriz ok', Math.round(fs.statSync(path.join(ADS, 'matriz-criativos.html')).size / 1024) + 'KB');
})().catch(e => { console.error('ERR:', e.message); process.exit(1); });
