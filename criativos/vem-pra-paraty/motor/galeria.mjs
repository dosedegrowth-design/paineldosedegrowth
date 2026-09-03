/**
 * Monta uma página única com as 144 peças das três lanchas, junto do texto
 * principal de cada anúncio. É o que o Lucas abre no celular pra escolher
 * criativo sem precisar do repositório.
 *
 * As imagens entram reduzidas e em JPEG, geradas pelo próprio Chromium via
 * canvas — não há encoder de imagem instalado nesta máquina, e o PNG cheio
 * (78 MB por lancha) não caberia numa página.
 *
 *   node galeria.mjs                 # escreve galeria.html na raiz do projeto
 *   node galeria.mjs --qualidade=.8
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
/* mesma resolução do gerar.mjs: playwright pode estar local ou global */
const { chromium } = (() => {
  for (const t of [
    'playwright',
    '/opt/node22/lib/node_modules/playwright',
    '/usr/lib/node_modules/playwright',
    '/usr/local/lib/node_modules/playwright',
  ]) {
    try {
      return require(t);
    } catch {}
  }
  throw new Error('Playwright não encontrado. Instale com: npm i -g playwright');
})();

const MOTOR = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.join(MOTOR, '..');
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => a.replace(/^--/, '').split('='))
);
const Q = Number(args.qualidade ?? 0.74);
const LARGURA = Number(args.largura ?? 420);

const LANCHAS = [
  { pasta: '18-pes', nome: '18 pés', sub: 'Mestra 180', prefixo: 'vpp18' },
  { pasta: '24-pes', nome: '24 pés', sub: '12 lugares', prefixo: 'vpp24' },
  { pasta: '33-pes', nome: '33 pés', sub: 'banheiro e suíte', prefixo: 'vpp33' },
];
const FORMATOS = {
  feed: { rot: 'Feed', w: 1080, h: 1350 },
  story: { rot: 'Story', w: 1080, h: 1920 },
};

const esc = (s) =>
  String(s ?? '').replace(/[&<>"]/g, (m) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m])
  );

/* vpp24-01-conta-forte-p1600-feed.png → partes da peça */
function lerNome(arq) {
  const m = arq.match(/^(vpp\d+)-(\d+)-(.+?)-(sobrio|forte|roteiro)(?:-(p\w+))?-(feed|story)\.png$/);
  if (!m) return null;
  return { prefixo: m[1], n: m[2], key: m[3], modo: m[4], preco: m[5] || null, fmt: m[6] };
}

const navegador = await chromium.launch();
const pagina = await navegador.newPage();
await pagina.setContent('<canvas id="c"></canvas>');

async function reduzir(abs, fmtKey) {
  const f = FORMATOS[fmtKey];
  const w = LARGURA;
  const h = Math.round((f.h / f.w) * LARGURA);
  const src = 'data:image/png;base64,' + (await readFile(abs)).toString('base64');
  return pagina.evaluate(
    async ({ src, w, h, q }) => {
      const img = new Image();
      img.src = src;
      await img.decode();
      const c = document.getElementById('c');
      c.width = w;
      c.height = h;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      return c.toDataURL('image/jpeg', q);
    },
    { src, w, h, q: Q }
  );
}

const cartoes = [];
let bytes = 0;

for (const l of LANCHAS) {
  const dados = JSON.parse(
    await readFile(path.join(RAIZ, l.pasta, 'criativos.json'), 'utf8')
  );
  const porKey = Object.fromEntries(dados.criativos.map((c) => [c.key, c]));
  const precos = dados.precos_em_teste || {};

  for (const fmtKey of Object.keys(FORMATOS)) {
    const dir = path.join(RAIZ, l.pasta, 'out', fmtKey === 'feed' ? 'feed-1080x1350' : 'story-1080x1920');
    const arquivos = (await readdir(dir)).filter((a) => a.endsWith('.png')).sort();
    for (const arq of arquivos) {
      const p = lerNome(arq);
      if (!p) continue;
      const c = porKey[p.key];
      const jpg = await reduzir(path.join(dir, arq), fmtKey);
      bytes += jpg.length;
      cartoes.push({
        lancha: l.pasta, lanchaNome: l.nome, fmt: p.fmt, modo: p.modo,
        preco: p.preco ? precos[p.preco] : null,
        n: p.n, arq, jpg,
        titulo_peca: c?.titulo_peca || c?.key || p.key,
        funil: c?.funil || '', publico: c?.publico || '',
        hipotese: c?.hipotese || '',
        titulo: c?.titulo || '', cta: c?.cta || '',
        textos: c?.textos || [],
      });
      process.stdout.write('.');
    }
  }
}
await navegador.close();
console.log(`\n${cartoes.length} peças  ·  ${(bytes / 1048576).toFixed(1)} MB de imagem`);

const chip = (t, cls = '') => `<span class="chip ${cls}">${esc(t)}</span>`;

const cartaoHTML = (c, i) => `
<article class="peca" data-lancha="${c.lancha}" data-fmt="${c.fmt}" data-modo="${c.modo}">
  <div class="arte ${c.fmt}"><img src="${c.jpg}" alt="${esc(c.titulo_peca)}" loading="lazy"></div>
  <div class="meta">
    <div class="linha">
      <span class="num">${esc(c.n)}</span>
      <h3>${esc(c.titulo_peca)}</h3>
    </div>
    <div class="chips">
      ${chip(c.modo, 'm-' + c.modo)}${c.preco ? chip(c.preco, 'preco') : ''}${c.funil ? chip(c.funil) : ''}
    </div>
    <button class="arquivo" data-copia="${esc(c.arq)}" type="button">${esc(c.arq)}</button>
    <details>
      <summary>Texto do anúncio</summary>
      <div class="copy">
        ${c.titulo ? `<p class="rot">Título</p><p class="val">${esc(c.titulo)}</p>` : ''}
        ${c.cta ? `<p class="rot">Botão</p><p class="val">${esc(c.cta)}</p>` : ''}
        ${c.publico ? `<p class="rot">Público</p><p class="val">${esc(c.publico)}</p>` : ''}
        <p class="rot">Três textos para testar</p>
        <ol class="textos">
          ${c.textos
            .map(
              (t) =>
                `<li><span class="rotulo">${esc(t.rotulo || '')}</span>${esc(t.primeira_linha || '')}${
                  t.resto ? '\n' + esc(t.resto) : ''
                }</li>`
            )
            .join('')}
        </ol>
        ${c.hipotese ? `<p class="rot">Hipótese</p><p class="val fina">${esc(c.hipotese)}</p>` : ''}
      </div>
    </details>
  </div>
</article>`;

const html = `<title>Grade de Criativos Vem Pra Paraty</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,200;8..60,400&amp;family=Inter:wght@400;500;600&amp;family=IBM+Plex+Mono:wght@400;500&amp;display=swap">
<style>

:root{
  --mar:#F2EEE4; --mar-2:#E7E0D0; --tinta:#0B2D48; --tinta-2:#3E5B72;
  --linha:#CFC6B2; --turq:#0E9AA7; --laranja:#D9542B; --plate:#0B2D48;
  --sombra:0 1px 2px rgba(11,45,72,.08);
}
@media (prefers-color-scheme:dark){
  :root:not([data-theme="light"]){
    --mar:#071A26; --mar-2:#0C2433; --tinta:#E7EDF0; --tinta-2:#8CA3B0;
      --linha:#183446; --turq:#2ED3C0; --laranja:#FF8B5E; --plate:#04121B;
    --sombra:0 1px 2px rgba(0,0,0,.4);
  }
}
:root[data-theme="dark"]{
  --mar:#071A26; --mar-2:#0C2433; --tinta:#E7EDF0; --tinta-2:#8CA3B0;
  --linha:#183446; --turq:#2ED3C0; --laranja:#FF8B5E; --plate:#04121B;
  --sombra:0 1px 2px rgba(0,0,0,.4);
}

*{box-sizing:border-box}
body{background:var(--mar);color:var(--tinta);
     font-family:Inter,system-ui,-apple-system,sans-serif;font-size:14px;line-height:1.55}
.wrap{max-width:1400px;margin:0 auto;padding:0 20px 80px}

header{padding:44px 0 22px}
.eyebrow{font-family:'Source Serif 4',Georgia,serif;font-weight:200;
     text-transform:uppercase;letter-spacing:.22em;font-size:12px;color:var(--tinta-2)}
h1{font-family:'Source Serif 4',Georgia,serif;font-weight:200;
   font-size:clamp(30px,5vw,46px);line-height:1.1;letter-spacing:.02em;
   margin:10px 0 12px;text-wrap:balance}
.intro{max-width:62ch;color:var(--tinta-2);margin:0}
.intro b{color:var(--tinta);font-weight:500}

/* sondagem: a régua de profundidade da carta náutica, virada em divisória */
.sonda{height:14px;margin:26px 0 0;
  background-image:repeating-linear-gradient(90deg,var(--linha) 0 1px,transparent 1px 13px);
  border-bottom:1px solid var(--linha);opacity:.7}

.filtros{position:sticky;top:0;z-index:5;background:var(--mar);
   padding:14px 0;border-bottom:1px solid var(--linha);
   display:flex;flex-wrap:wrap;gap:18px 26px;align-items:baseline}
.grupo{display:flex;gap:8px;align-items:baseline;flex-wrap:wrap}
.grupo>span{font-size:11px;text-transform:uppercase;letter-spacing:.14em;
   color:var(--tinta-2);margin-right:2px}
button.f{font:inherit;font-size:13px;background:none;border:1px solid var(--linha);
   color:var(--tinta-2);border-radius:2px;padding:4px 11px;cursor:pointer}
button.f:hover{border-color:var(--turq);color:var(--tinta)}
button.f[aria-pressed="true"]{background:var(--tinta);border-color:var(--tinta);
   color:var(--mar);font-weight:500}
button.f:focus-visible,button.arquivo:focus-visible,summary:focus-visible{
   outline:2px solid var(--turq);outline-offset:2px}
.conta{margin-left:auto;font-family:'IBM Plex Mono',ui-monospace,monospace;
   font-size:12px;color:var(--tinta-2);font-variant-numeric:tabular-nums}

.grade{display:grid;gap:34px 24px;padding-top:30px;
   grid-template-columns:repeat(auto-fill,minmax(230px,1fr))}
.peca{display:flex;flex-direction:column;gap:10px;min-width:0}
.meta{display:flex;flex-direction:column;gap:6px;flex:1}
.meta details{margin-top:auto}
.arte{background:var(--plate);border-radius:2px;overflow:hidden;line-height:0;
   box-shadow:var(--sombra)}
.arte img{width:100%;height:auto;display:block}

.linha{display:flex;gap:8px;align-items:baseline;min-width:0}
.num{font-family:'IBM Plex Mono',ui-monospace,monospace;font-size:12px;
   color:var(--turq);font-variant-numeric:tabular-nums}
.meta h3{font-size:14px;font-weight:600;margin:0;letter-spacing:-.005em}
.chips{display:flex;flex-wrap:wrap;gap:5px;margin-top:2px}
.chip{font-size:10.5px;text-transform:uppercase;letter-spacing:.11em;
   border:1px solid var(--linha);border-radius:2px;padding:2px 6px;color:var(--tinta-2)}
.chip.m-forte{border-color:var(--turq);color:var(--turq)}
.chip.m-roteiro{border-color:var(--tinta-2);color:var(--tinta)}
.chip.preco{border-color:var(--laranja);color:var(--laranja);letter-spacing:.06em}

button.arquivo{font-family:'IBM Plex Mono',ui-monospace,monospace;font-size:11px;
   color:var(--tinta-2);background:none;border:0;border-bottom:1px dotted var(--linha);
   padding:0 0 1px;text-align:left;cursor:pointer;word-break:break-all;width:100%;
   min-height:2.55em;line-height:1.25}
button.arquivo:hover{color:var(--turq);border-bottom-color:var(--turq)}
button.arquivo.ok{color:var(--turq)}

details{border-top:1px solid var(--linha);padding-top:8px}
summary{font-size:12px;color:var(--tinta-2);cursor:pointer;list-style:none}
summary::-webkit-details-marker{display:none}
summary::before{content:'+ ';font-family:'IBM Plex Mono',monospace}
details[open] summary::before{content:'– '}
summary:hover{color:var(--turq)}
.copy{padding-top:8px}
.rot{font-size:10.5px;text-transform:uppercase;letter-spacing:.13em;
   color:var(--tinta-2);margin:10px 0 3px}
.rot:first-child{margin-top:0}
.val{margin:0;font-size:13px}
.val.fina{color:var(--tinta-2);font-size:12.5px}
.textos{margin:0;padding-left:18px;display:flex;flex-direction:column;gap:9px}
.textos li{font-size:12.5px;white-space:pre-line;color:var(--tinta)}
.rotulo{display:block;font-size:10px;text-transform:uppercase;letter-spacing:.12em;
   color:var(--turq);margin-bottom:2px}

.vazio{padding:60px 0;color:var(--tinta-2)}
footer{margin-top:60px;padding-top:20px;border-top:1px solid var(--linha);
   color:var(--tinta-2);font-size:12.5px;max-width:70ch}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
</style>

<div class="wrap">
<header>
  <p class="eyebrow">Vem Pra Paraty · Meta Ads · setembro de 2026</p>
  <h1>Grade de criativos da frota</h1>
  <p class="intro">Cento e quarenta e quatro peças, três lanchas, três registros. Cada peça traz o
  nome do arquivo — <b>toque nele pra copiar</b> — e os três textos principais pra testar.
  Os PNGs em tamanho real ficam no repositório, em <code>criativos/vem-pra-paraty/</code>.</p>
  <div class="sonda"></div>
</header>

<div class="filtros">
  <div class="grupo"><span>Lancha</span>
    <button class="f" data-f="lancha" data-v="" aria-pressed="true">Todas</button>
    <button class="f" data-f="lancha" data-v="18-pes" aria-pressed="false">18 pés</button>
    <button class="f" data-f="lancha" data-v="24-pes" aria-pressed="false">24 pés</button>
    <button class="f" data-f="lancha" data-v="33-pes" aria-pressed="false">33 pés</button>
  </div>
  <div class="grupo"><span>Formato</span>
    <button class="f" data-f="fmt" data-v="feed" aria-pressed="true">Feed</button>
    <button class="f" data-f="fmt" data-v="story" aria-pressed="false">Story</button>
  </div>
  <div class="grupo"><span>Registro</span>
    <button class="f" data-f="modo" data-v="" aria-pressed="true">Todos</button>
    <button class="f" data-f="modo" data-v="sobrio" aria-pressed="false">Sóbrio</button>
    <button class="f" data-f="modo" data-v="forte" aria-pressed="false">Forte</button>
    <button class="f" data-f="modo" data-v="roteiro" aria-pressed="false">Roteiro</button>
  </div>
  <p class="conta" id="conta"></p>
</div>

<div class="grade" id="grade">
${cartoes.map(cartaoHTML).join('\n')}
</div>
<p class="vazio" id="vazio" hidden>Nenhuma peça com esses filtros.</p>

<footer>
  <p>Os três registros estão no ar de propósito: a escolha entre eles é teste A/B, medido por
  custo por conversa qualificada, não preferência estética. A direção completa está na Carta
  Náutica. Lotação da 18 pés e valor da 33 acima de nove pessoas seguem pendentes de confirmação.</p>
</footer>
</div>

<script>
const estado = {lancha:'', fmt:'feed', modo:''};
const pecas = [...document.querySelectorAll('.peca')];
const conta = document.getElementById('conta');
const vazio = document.getElementById('vazio');

function aplicar(){
  let n = 0;
  for (const p of pecas){
    const ok = (!estado.lancha || p.dataset.lancha === estado.lancha)
            && (!estado.fmt    || p.dataset.fmt    === estado.fmt)
            && (!estado.modo   || p.dataset.modo   === estado.modo);
    p.hidden = !ok;
    if (ok) n++;
  }
  conta.textContent = n + (n === 1 ? ' peça' : ' peças');
  vazio.hidden = n > 0;
}

for (const b of document.querySelectorAll('button.f')){
  b.addEventListener('click', () => {
    const {f, v} = b.dataset;
    estado[f] = v;
    for (const irmao of document.querySelectorAll('button.f[data-f="'+f+'"]'))
      irmao.setAttribute('aria-pressed', String(irmao === b));
    aplicar();
  });
}

for (const b of document.querySelectorAll('button.arquivo')){
  b.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(b.dataset.copia); } catch (e) {}
    const antes = b.textContent;
    b.textContent = 'copiado';
    b.classList.add('ok');
    setTimeout(() => { b.textContent = antes; b.classList.remove('ok'); }, 1100);
  });
}

aplicar();
</script>`;

const saida = path.join(RAIZ, 'galeria.html');
await writeFile(saida, html, 'utf8');
console.log(`galeria.html: ${(html.length / 1048576).toFixed(1)} MB  ·  ${saida}`);
