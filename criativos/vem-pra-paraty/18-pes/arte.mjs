/**
 * Motor de arte dos criativos estáticos — Vem Pra Paraty, lancha 18 pés.
 *
 * Registro de CAMPANHA (mídia paga), conforme a seção 12 da Carta Náutica.
 * Não é o registro do orgânico: aqui não entra Lilita One, nem selo de preço,
 * nem pill de categoria, nem CTA desenhado.
 *
 * Regras que este motor impõe por construção:
 *   - uma frase de 3 a 6 palavras, e nada mais de texto (fora a linha de local)
 *   - serifada leve em caixa alta, entreletra aberta, sem sombra e sem contorno
 *   - marca pequena num canto
 *   - o texto nunca cai sobre o casco nem sobre a água rasa do primeiro plano
 *   - zona segura de story respeitada: 250 px no topo, 320 px embaixo
 *
 * O CTA não é desenhado: no anúncio ele é o botão do Meta, e no story é o
 * sticker nativo. Preço não entra na imagem — vai no texto principal.
 */

export const PALETA = {
  navy: '#0B2D48',
  noite: '#07203A',
  turq: '#17C3B2',
  areia: '#F6EFE3',
};

export const FORMATOS = {
  feed: { w: 1080, h: 1350, safeTop: 0, safeBottom: 0 },
  story: { w: 1080, h: 1920, safeTop: 250, safeBottom: 320 },
};

const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

let MARCA = { logo: '' };
let FONTES = '';
export function definirFontes(css) { FONTES = css; }
export function definirMarca(m) { MARCA = m; }

/* ------------------------------------------------------------------ *
 * Escala — a frase fica entre 5% e 8% da altura do quadro
 * ------------------------------------------------------------------ */

function escala(fmtKey) {
  return fmtKey === 'story'
    ? { frase: 78, local: 24, logo: 268, margem: 84 }
    : { frase: 70, local: 22, logo: 244, margem: 76 };
}

/* ------------------------------------------------------------------ *
 * CSS
 * ------------------------------------------------------------------ */

function css(c, f, s) {
  const pos = c.posicao?.[f.key] || 'center 50%';
  const alto = c.ancora !== 'baixo';

  // O véu fica confinado à faixa do texto. Não é barra preta: é uma
  // perda de luz suave, só o suficiente pra serifada leve ter contraste.
  const veu = alto
    ? `linear-gradient(180deg,
         rgba(4,20,31,.62) 0%,
         rgba(4,20,31,.44) ${f.key === 'story' ? 32 : 30}%,
         rgba(4,20,31,0) ${f.key === 'story' ? 52 : 50}%)`
    : `linear-gradient(0deg,
         rgba(4,20,31,.72) 0%,
         rgba(4,20,31,.46) ${f.key === 'story' ? 30 : 30}%,
         rgba(4,20,31,0) ${f.key === 'story' ? 54 : 54}%)`;

  return `
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:${f.w}px;height:${f.h}px;overflow:hidden}
  body{background:${PALETA.noite};-webkit-font-smoothing:antialiased;
       font-synthesis-weight:none}
  .peca{position:relative;width:${f.w}px;height:${f.h}px;overflow:hidden}

  .foto{position:absolute;inset:0;background-image:url('${c.foto_src}');
        background-size:cover;background-position:${pos};background-repeat:no-repeat;
        background-color:${PALETA.navy}}
  .veu{position:absolute;inset:0;background:${veu}}

  .conteudo{position:absolute;inset:0;display:flex;flex-direction:column;
            justify-content:${alto ? 'flex-start' : 'flex-end'};
            padding:${f.safeTop + s.margem}px ${s.margem}px ${f.safeBottom + s.margem}px}

  .frase{
    font-family:'Source Serif 4',ui-serif,Georgia,serif;
    font-weight:200;font-size:${s.frase}px;line-height:1.2;
    letter-spacing:.085em;text-transform:uppercase;
    color:${PALETA.areia};max-width:${f.w - s.margem * 2 - 40}px;
    text-shadow:none;
  }
  .frase .fino{color:rgba(242,237,227,.66)}

  .local{
    font-family:'Inter',system-ui,sans-serif;font-weight:400;
    font-size:${s.local}px;letter-spacing:.24em;text-transform:uppercase;
    color:rgba(242,237,227,.66);margin-top:${f.key === 'story' ? 34 : 30}px;
  }

  .marca{position:absolute;left:${s.margem}px;
         bottom:${f.safeBottom + s.margem}px;opacity:.92;line-height:0}
  .marca img{width:${s.logo}px;display:block}

  /* quando a frase fica embaixo, a marca sobe pro topo pra não brigar */
  .peca.baixo .marca{top:${f.safeTop + s.margem}px;bottom:auto}
  `;
}

/* ------------------------------------------------------------------ *
 * API
 * ------------------------------------------------------------------ */

/**
 * Monta o HTML de uma peça em tamanho real.
 * @param {object} c        item de criativos.json, já com foto_src resolvido
 * @param {'feed'|'story'} fmtKey
 */
export function montarHTML(c, fmtKey) {
  const f = { ...FORMATOS[fmtKey], key: fmtKey };
  const s = escala(fmtKey);
  const alto = c.ancora !== 'baixo';

  // A frase aceita <span class="fino"> pra rebaixar uma parte sem mudar de peso.
  const frase = String(c.frase || '').replace(/\n/g, '<br>');

  return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<style>${FONTES}</style>
<style>${css(c, f, s)}</style></head>
<body><div class="peca ${alto ? 'alto' : 'baixo'}">
  <div class="foto"></div>
  <div class="veu"></div>
  <div class="conteudo">
    <div>
      <h1 class="frase">${frase}</h1>
      ${c.local ? `<p class="local">${esc(c.local)}</p>` : ''}
    </div>
  </div>
  <div class="marca"><img src="${MARCA.logo}" alt=""></div>
</div></body></html>`;
}
