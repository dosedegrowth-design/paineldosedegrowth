/**
 * Motor de arte dos criativos estáticos — Vem Pra Paraty, lancha 18 pés.
 *
 * Dois modos, para teste A/B de registro. A zona segura de story vale nos dois:
 * 250 px livres no topo, 320 px embaixo.
 *
 * MODO SOBRIO — o registro da seção 12 da Carta Náutica.
 *   Serifada leve em caixa alta sobre a foto, sem preço, sem selo, sem CTA
 *   desenhado. Aposta em desejo e em parecer caro.
 *
 * MODO FORTE — o registro que o cliente pediu: mais contraste, mais cor,
 *   preço e lotação na arte, CTA desenhado. A foto ocupa a parte de cima e
 *   toda a mensagem cai num bloco navy sólido, que é o que garante contraste
 *   alto de verdade, em vez de texto claro sobre água clara.
 *
 * O que continua proibido nos dois, porque foi o que barateou as peças antigas:
 * starburst, faixa diagonal, preço riscado, selo de desconto, linha pontilhada
 * de recorte, emoji na arte e sombra dura no texto.
 */

export const PALETA = {
  navy: '#0B2D48',
  noite: '#07203A',
  turq: '#17C3B2',
  teal: '#0E9AA7',
  areia: '#F6EFE3',
  laranja: '#FF7A45',
  dourado: '#FFB84D',
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

  /* A marca cai sobre céu claro numa peça e sobre areia noutra. O halo é o que
     mantém ela legível nas duas sem virar sombra dura nem caixa de fundo. */
  .marca{position:absolute;left:${s.margem}px;
         bottom:${f.safeBottom + s.margem}px;opacity:.95;line-height:0;
         filter:drop-shadow(0 2px 16px rgba(4,20,31,.9))
                drop-shadow(0 0 4px rgba(4,20,31,.65))}
  .marca img{width:${s.logo}px;display:block}

  /* quando a frase fica embaixo, a marca sobe pro topo pra não brigar */
  .peca.baixo .marca{top:${f.safeTop + s.margem}px;bottom:auto}
  `;
}


/* ================================================================== *
 * MODO FORTE — foto em cima, bloco navy sólido embaixo com a oferta
 * ================================================================== */

function escalaForte(fmtKey) {
  return fmtKey === 'story'
    ? { frase: 86, apoio: 32, preco: 62, precoLb: 22, chip: 26, cta: 36,
        logo: 250, margem: 76, foto: 0.545, fim: 1600 }
    : { frase: 78, apoio: 29, preco: 56, precoLb: 20, chip: 24, cta: 33,
        logo: 226, margem: 68, foto: 0.610, fim: 1350 };
}

/** Régua de cor: turquesa correndo para o laranja. É o acento do modo forte. */
const reguaCor = () =>
  `<div class="regua-cor"></div>`;

const glifoWa = `<svg class="wa" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Zm5.8 14.06c-.24.68-1.42 1.31-1.95 1.35-.5.04-.97.22-3.27-.68-2.76-1.09-4.5-3.92-4.64-4.1-.13-.18-1.1-1.47-1.1-2.8 0-1.33.7-1.98.94-2.25.25-.27.54-.34.72-.34h.52c.17 0 .4-.06.62.47.24.57.8 1.98.87 2.12.07.14.12.31.02.5-.09.18-.14.29-.28.45-.14.16-.29.36-.42.48-.14.14-.28.29-.12.57.16.27.72 1.19 1.55 1.93 1.07.95 1.97 1.25 2.25 1.39.28.14.44.12.6-.07.17-.2.7-.81.88-1.09.18-.27.36-.23.61-.14.25.09 1.6.75 1.87.89.27.14.45.2.52.32.07.11.07.65-.17 1.33Z"/></svg>`;

function cssForte(c, f, s) {
  const pos = c.posicao?.[f.key] || 'center 50%';
  const hFoto = Math.round(f.h * s.foto);
  return `
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:${f.w}px;height:${f.h}px;overflow:hidden}
  body{background:${PALETA.noite};-webkit-font-smoothing:antialiased}
  .peca{position:relative;width:${f.w}px;height:${f.h}px;overflow:hidden}

  /* A foto ganha um leve reforço: o cliente pediu mais contraste e mais cor.
     Modesto de propósito — forçar turquesa na água denuncia manipulação. */
  .foto{position:absolute;top:0;left:0;right:0;height:${hFoto}px;
        background-image:url('${c.foto_src}');background-size:cover;
        background-position:${pos};background-repeat:no-repeat;
        background-color:${PALETA.navy};
        filter:saturate(1.14) contrast(1.09)}
  /* véu curto no topo, só para a marca não sumir no céu claro */
  .veu-topo{position:absolute;top:0;left:0;right:0;height:${Math.round(hFoto*0.34)}px;
        background:linear-gradient(180deg,rgba(4,20,31,.52),rgba(4,20,31,0))}

  .marca{position:absolute;top:${f.safeTop + s.margem}px;left:${s.margem}px;
         line-height:0;opacity:.97;
         filter:drop-shadow(0 2px 14px rgba(4,20,31,.9))}
  .marca img{width:${s.logo}px;display:block}

  .bloco{position:absolute;left:0;right:0;top:${hFoto}px;bottom:0;
         background:${PALETA.noite};
         padding:${s.margem - 8}px ${s.margem}px ${f.h - s.fim + 28}px;
         display:flex;flex-direction:column}
  .regua-cor{position:absolute;top:0;left:0;right:0;height:7px;
        background:linear-gradient(90deg,${PALETA.turq} 0%,${PALETA.teal} 38%,
                   ${PALETA.dourado} 72%,${PALETA.laranja} 100%)}

  .frase{font-family:'Lilita One',Impact,'Arial Black',sans-serif;font-weight:400;
         font-size:${s.frase}px;line-height:.99;letter-spacing:.004em;
         color:${PALETA.areia};text-transform:uppercase}
  .frase em{font-style:normal;color:${PALETA.dourado}}

  .apoio{font-family:'Inter',system-ui,sans-serif;font-weight:400;
         font-size:${s.apoio}px;line-height:1.4;color:rgba(246,239,227,.80);
         margin-top:${f.key === 'story' ? 20 : 16}px;max-width:${f.w - s.margem*2 - 20}px}

  .oferta{display:flex;align-items:stretch;gap:${f.key === 'story' ? 18 : 15}px;
          margin-top:auto;padding-top:${f.key === 'story' ? 30 : 24}px}
  .preco{background:${PALETA.laranja};border-radius:14px;
         padding:${f.key === 'story' ? '14px 26px 16px' : '12px 22px 14px'};
         display:flex;flex-direction:column;justify-content:center}
  .preco span{font-family:'Inter',system-ui,sans-serif;font-weight:700;
         font-size:${s.precoLb}px;letter-spacing:.14em;text-transform:uppercase;
         color:rgba(255,255,255,.94);line-height:1}
  .preco b{font-family:'Lilita One',Impact,sans-serif;font-weight:400;
         font-size:${s.preco}px;line-height:1.04;color:#fff;letter-spacing:.01em}
  .chip{border:2.5px solid ${PALETA.turq};border-radius:14px;
        padding:${f.key === 'story' ? '14px 24px' : '12px 20px'};
        display:flex;flex-direction:column;justify-content:center;gap:5px}
  .chip b{font-family:'Lilita One',Impact,sans-serif;font-weight:400;
        font-size:${Math.round(s.preco*0.62)}px;line-height:1;color:${PALETA.turq}}
  .chip span{font-family:'Inter',system-ui,sans-serif;font-weight:600;
        font-size:${s.chip - 6}px;letter-spacing:.1em;text-transform:uppercase;
        color:rgba(246,239,227,.66);line-height:1}

  .cta{display:flex;align-items:center;justify-content:center;gap:14px;
       background:${PALETA.areia};color:${PALETA.noite};border-radius:999px;
       font-family:'Inter',system-ui,sans-serif;font-weight:700;
       font-size:${s.cta}px;padding:${f.key === 'story' ? 20 : 17}px 30px;
       margin-top:${f.key === 'story' ? 22 : 18}px}
  .cta .wa{width:1.2em;height:1.2em;color:#1FA855;flex:none}
  `;
}

function montarForte(c, f, s) {
  const frase = String(c.forte?.frase || c.frase || '').replace(/\n/g, '<br>');
  const apoio = c.forte?.apoio || '';
  return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<style>${FONTES}</style>
<style>${cssForte(c, f, s)}</style></head>
<body><div class="peca">
  <div class="foto"></div>
  <div class="veu-topo"></div>
  <div class="marca"><img src="${MARCA.logo}" alt=""></div>
  <div class="bloco">
    ${reguaCor()}
    <h1 class="frase">${frase}</h1>
    ${apoio ? `<p class="apoio">${esc(apoio)}</p>` : ''}
    <div class="oferta">
      <div class="preco"><span>a partir de</span><b>${esc(c.preco_arte || 'R$ 1.000')}</b></div>
      <div class="chip"><b>${esc(c.lotacao_arte || 'ATÉ 6')}</b><span>pessoas</span></div>
    </div>
    <div class="cta">${glifoWa}${esc(c.cta_arte || 'Reserve pelo WhatsApp')}</div>
  </div>
</div></body></html>`;
}

/* ------------------------------------------------------------------ *
 * API
 * ------------------------------------------------------------------ */

/**
 * Monta o HTML de uma peça em tamanho real.
 * @param {object} c        item de criativos.json, já com foto_src resolvido
 * @param {'feed'|'story'} fmtKey
 * @param {'sobrio'|'forte'} modo
 */
export function montarHTML(c, fmtKey, modo = 'sobrio') {
  const f = { ...FORMATOS[fmtKey], key: fmtKey };
  if (modo === 'forte') return montarForte(c, f, escalaForte(fmtKey));
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
