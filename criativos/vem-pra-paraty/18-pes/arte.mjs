/**
 * Motor de arte dos criativos estáticos — Vem Pra Paraty, lancha 18 pés.
 *
 * Gera o HTML de uma peça em tamanho real (1080x1350 feed ou 1080x1920 story)
 * a partir dos dados de criativos.json. O gerar.mjs fotografa esse HTML em PNG.
 *
 * A identidade (paleta, fontes, selo) é a que já está aprovada na marca —
 * não invente cor nem fonte nova aqui.
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

/* ------------------------------------------------------------------ *
 * Peças compartilhadas
 * ------------------------------------------------------------------ */

/** Onda que separa a foto do bloco navy. */
const onda = (cor, altura = 46) => `
  <svg class="onda" viewBox="0 0 1080 ${altura}" preserveAspectRatio="none" aria-hidden="true">
    <path d="M0,${altura} L0,${altura * 0.55}
             C 150,${altura * 0.05} 300,${altura * 0.95} 470,${altura * 0.42}
             C 640,-${altura * 0.1} 800,${altura * 0.8} 950,${altura * 0.35}
             C 1010,${altura * 0.16} 1050,${altura * 0.3} 1080,${altura * 0.22}
             L1080,${altura} Z" fill="${cor}"></path>
  </svg>`;

/** Selo circular discreto no canto. */
let MARCA = { selo: '', logo: '' };
let FONTES = '';
export function definirFontes(css) { FONTES = css; }
export function definirMarca(m) { MARCA = m; }

const selo = (px) =>
  `<img class="selo" src="${MARCA.selo}" alt="" style="width:${px}px;height:${px}px">`;

/** Assinatura discreta: logo horizontal + arroba. */
const assinatura = (larguraPx) => `
  <div class="assina">
    <img src="${MARCA.logo}" alt="" style="width:${larguraPx}px">
  </div>`;

const arroba = () => `<div class="arroba">@vempraparaty</div>`;

/** Pill do CTA — sempre laranja, sempre a mesma frase da casa. */
const pillCta = (texto, tam) => `
  <div class="cta" style="font-size:${tam}px">
    <svg class="wa" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Zm5.8 14.06c-.24.68-1.42 1.31-1.95 1.35-.5.04-.97.22-3.27-.68-2.76-1.09-4.5-3.92-4.64-4.1-.13-.18-1.1-1.47-1.1-2.8 0-1.33.7-1.98.94-2.25.25-.27.54-.34.72-.34h.52c.17 0 .4-.06.62.47.24.57.8 1.98.87 2.12.07.14.12.31.02.5-.09.18-.14.29-.28.45-.14.16-.29.36-.42.48-.14.14-.28.29-.12.57.16.27.72 1.19 1.55 1.93 1.07.95 1.97 1.25 2.25 1.39.28.14.44.12.6-.07.17-.2.7-.81.88-1.09.18-.27.36-.23.61-.14.25.09 1.6.75 1.87.89.27.14.45.2.52.32.07.11.07.65-.17 1.33Z"/></svg>
    ${esc(texto)}
  </div>`;

/** Selo de preço laranja. */
const badgePreco = (preco, tam) => `
  <div class="preco" style="font-size:${tam}px">
    <span class="preco-lb">a partir de</span><span class="preco-vl">${esc(preco)}</span>
  </div>`;

/** Chip de capacidade / etiqueta em turquesa vazado. */
const chip = (texto, tam) =>
  `<div class="chip" style="font-size:${tam}px">${esc(texto)}</div>`;

/* ------------------------------------------------------------------ *
 * Arquétipos de layout
 * ------------------------------------------------------------------ */

function arqCeu(c, f, s) {
  // Foto inteira. Texto no céu (terço superior). Rodapé navy com CTA.
  return `
  <div class="camada foto"></div>
  <div class="camada scrim-topo"></div>
  <div class="camada scrim-base"></div>
  <div class="camada conteudo ceu">
    <div class="topo">
      ${c.etiqueta ? chip(c.etiqueta, s.chip) : ''}
      <h1 class="hl" style="font-size:${s.hl}px">${c.hl}</h1>
      <p class="ap" style="font-size:${s.ap}px">${esc(c.apoio_imagem)}</p>
    </div>
    <div class="base">
      <div class="linha-base">
        ${badgePreco(c.preco, s.preco)}
        ${pillCta(c.cta_arte, s.cta)}
      </div>
      ${assinatura(s.logo)}
    </div>
  </div>
  ${selo(s.selo)}`;
}

function arqBloco(c, f, s) {
  // Foto no topo, bloco navy embaixo com toda a mensagem. Máxima legibilidade.
  const hFoto = f.key === 'story' ? 0.53 : 0.56;
  return `
  <div class="camada foto" style="height:${Math.round(f.h * hFoto)}px"></div>
  <div class="painel" style="top:${Math.round(f.h * hFoto) - 44}px">
    ${onda(PALETA.noite, 46)}
    <div class="painel-in">
      ${c.etiqueta ? chip(c.etiqueta, s.chip) : ''}
      <h1 class="hl" style="font-size:${s.hl}px">${c.hl}</h1>
      <p class="ap" style="font-size:${s.ap}px">${esc(c.apoio_imagem)}</p>
      <div class="linha-base">
        ${badgePreco(c.preco, s.preco)}
        ${pillCta(c.cta_arte, s.cta)}
      </div>
      ${assinatura(s.logo)}
    </div>
  </div>
  ${selo(s.selo)}`;
}

function arqScrim(c, f, s) {
  // Foto inteira com gradiente navy subindo. Texto empilhado embaixo.
  return `
  <div class="camada foto"></div>
  <div class="camada scrim-alto"></div>
  <div class="camada conteudo scrim">
    <div class="base">
      ${c.etiqueta ? chip(c.etiqueta, s.chip) : ''}
      <h1 class="hl" style="font-size:${s.hl}px">${c.hl}</h1>
      <p class="ap" style="font-size:${s.ap}px">${esc(c.apoio_imagem)}</p>
      <div class="linha-base">
        ${badgePreco(c.preco, s.preco)}
        ${pillCta(c.cta_arte, s.cta)}
      </div>
      ${assinatura(s.logo)}
    </div>
  </div>
  ${selo(s.selo)}`;
}

function arqLista(c, f, s) {
  // Foto no topo, painel navy com lista de itens nomeados.
  const hFoto = f.key === 'story' ? 0.40 : 0.42;
  const itens = (c.lista || [])
    .map((i) => `<li><span class="mk"></span>${esc(i)}</li>`)
    .join('');
  return `
  <div class="camada foto" style="height:${Math.round(f.h * hFoto)}px"></div>
  <div class="painel" style="top:${Math.round(f.h * hFoto) - 44}px">
    ${onda(PALETA.noite, 46)}
    <div class="painel-in">
      ${c.etiqueta ? chip(c.etiqueta, s.chip) : ''}
      <h1 class="hl" style="font-size:${s.hl}px">${c.hl}</h1>
      <ul class="lista" style="font-size:${s.item}px">${itens}</ul>
      <p class="ap ap-lista" style="font-size:${s.ap}px">${esc(c.apoio_imagem)}</p>
      <div class="linha-base">
        ${badgePreco(c.preco, s.preco)}
        ${pillCta(c.cta_arte, s.cta)}
      </div>
      ${assinatura(s.logo)}
    </div>
  </div>
  ${selo(s.selo)}`;
}

function arqConta(c, f, s) {
  // Foto com scrim forte + cartela central com a conta em número grande.
  const k = c.conta || {};
  return `
  <div class="camada foto"></div>
  <div class="camada scrim-cheio"></div>
  <div class="camada conteudo conta">
    <div class="meio">
      ${c.etiqueta ? chip(c.etiqueta, s.chip) : ''}
      <h1 class="hl" style="font-size:${s.hl}px">${c.hl}</h1>
      <div class="cartela">
        <div class="op"><b style="font-size:${s.num}px">${esc(k.a || '')}</b><span style="font-size:${s.numlb}px">${esc(k.a_lb || '')}</span></div>
        <div class="sinal" style="font-size:${s.sinal}px">÷</div>
        <div class="op"><b style="font-size:${s.num}px">${esc(k.b || '')}</b><span style="font-size:${s.numlb}px">${esc(k.b_lb || '')}</span></div>
        <div class="sinal" style="font-size:${s.sinal}px">=</div>
        <div class="op res"><b style="font-size:${s.num}px">${esc(k.r || '')}</b><span style="font-size:${s.numlb}px">${esc(k.r_lb || '')}</span></div>
      </div>
      <p class="ap" style="font-size:${s.ap}px">${esc(c.apoio_imagem)}</p>
    </div>
    <div class="base">
      ${pillCta(c.cta_arte, s.cta)}
      ${assinatura(s.logo)}
    </div>
  </div>
  ${selo(s.selo)}`;
}

const ARQUETIPOS = {
  ceu: arqCeu,
  bloco: arqBloco,
  scrim: arqScrim,
  lista: arqLista,
  conta: arqConta,
};

/* ------------------------------------------------------------------ *
 * Escala tipográfica por formato
 * ------------------------------------------------------------------ */

function escala(fmtKey, arq) {
  const base =
    fmtKey === 'story'
      ? { hl: 100, ap: 38, cta: 36, preco: 34, chip: 27, item: 39, selo: 132, logo: 300,
          num: 104, numlb: 24, sinal: 56 }
      : { hl: 92, ap: 35, cta: 33, preco: 32, chip: 25, item: 36, selo: 118, logo: 268,
          num: 96, numlb: 22, sinal: 50 };
  // A lista precisa de headline menor pra caber o painel inteiro.
  if (arq === 'lista') base.hl = Math.round(base.hl * 0.76);
  if (arq === 'conta') base.hl = Math.round(base.hl * 0.72);
  return base;
}

/* ------------------------------------------------------------------ *
 * CSS
 * ------------------------------------------------------------------ */

function css(c, f, s) {
  const p = c.posicao?.[f.key] || 'center 50%';
  return `
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:${f.w}px;height:${f.h}px;overflow:hidden}
  body{background:${PALETA.noite};font-family:'Poppins',system-ui,sans-serif;
       -webkit-font-smoothing:antialiased}
  .peca{position:relative;width:${f.w}px;height:${f.h}px;overflow:hidden}

  .camada{position:absolute;inset:0}
  .foto{background-image:url('${c.foto_src}');background-size:cover;
        background-position:${p};background-repeat:no-repeat;
        background-color:${PALETA.navy}}

  /* véus: nunca cobrem o casco nem a água do primeiro plano */
  .scrim-topo{background:linear-gradient(180deg,
      rgba(7,32,58,.86) 0%, rgba(7,32,58,.62) 26%, rgba(7,32,58,0) 46%);}
  .scrim-base{background:linear-gradient(0deg,
      rgba(7,32,58,.95) 0%, rgba(7,32,58,.72) 12%, rgba(7,32,58,0) 30%);}
  .scrim-alto{background:linear-gradient(0deg,
      rgba(7,32,58,.97) 0%, rgba(7,32,58,.93) 26%, rgba(7,32,58,.55) 46%, rgba(7,32,58,0) 66%);}
  .scrim-cheio{background:linear-gradient(180deg,
      rgba(7,32,58,.58) 0%, rgba(7,32,58,.74) 40%, rgba(7,32,58,.90) 100%);}

  .conteudo{display:flex;flex-direction:column;justify-content:space-between;
            padding:${f.safeTop + 76}px 72px ${f.safeBottom + 68}px}
  .conteudo.conta{justify-content:center;gap:${f.key === 'story' ? 92 : 70}px;
                  padding-top:${f.safeTop + (f.key === 'story' ? 150 : 96)}px}
  .conteudo.scrim{justify-content:flex-end}

  .hl{font-family:'Lilita One',Impact,'Arial Black',sans-serif;font-weight:400;
      color:${PALETA.areia};line-height:.96;letter-spacing:-.5px;
      text-shadow:0 4px 28px rgba(7,32,58,.55)}
  .hl em{font-style:normal;color:${PALETA.dourado}}
  .hl b{font-weight:400;color:${PALETA.turq}}

  .ap{color:rgba(246,239,227,.86);font-weight:500;line-height:1.38;margin-top:22px;
      max-width:900px}
  .ap-lista{margin-top:26px}

  .chip{display:inline-block;color:${PALETA.turq};font-weight:600;
        letter-spacing:3.2px;text-transform:uppercase;
        border:2px solid rgba(23,195,178,.55);border-radius:999px;
        padding:9px 22px;margin-bottom:26px}

  .linha-base{display:flex;align-items:center;gap:22px;flex-wrap:wrap;margin-top:38px}

  .preco{display:flex;align-items:baseline;gap:12px;background:${PALETA.laranja};
         color:#fff;border-radius:16px;padding:14px 24px}
  .preco-lb{font-weight:600;opacity:.9;font-size:.62em;letter-spacing:.4px}
  .preco-vl{font-family:'Lilita One',Impact,sans-serif;font-size:1.18em;letter-spacing:.3px}

  .cta{display:inline-flex;align-items:center;gap:14px;background:${PALETA.areia};
       color:${PALETA.noite};font-weight:700;border-radius:999px;padding:16px 32px}
  .cta .wa{width:1.15em;height:1.15em;color:#1FA855;flex:none}

  .painel{position:absolute;left:0;right:0;bottom:0;background:${PALETA.noite}}
  .painel .onda{position:absolute;top:0;left:0;width:100%;height:46px}
  .painel-in{padding:${f.key === 'story' ? 74 : 62}px 72px ${f.safeBottom + 62}px}

  .lista{list-style:none;margin-top:26px;display:flex;flex-direction:column;
         gap:${f.key === 'story' ? 16 : 13}px}
  .lista li{display:flex;align-items:center;gap:18px;color:${PALETA.areia};
            font-weight:500;line-height:1.24}
  .lista .mk{width:11px;height:11px;border-radius:50%;background:${PALETA.turq};flex:none}

  .cartela{display:flex;align-items:flex-end;justify-content:center;
           gap:${f.key === 'story' ? 30 : 24}px;margin-top:${f.key === 'story' ? 48 : 38}px;
           background:rgba(11,45,72,.72);border:2px solid rgba(23,195,178,.34);
           border-radius:28px;padding:${f.key === 'story' ? '44px 34px' : '36px 28px'}}
  .cartela .op{display:flex;flex-direction:column;align-items:center;gap:8px;min-width:0}
  .cartela .op b{font-family:'Lilita One',Impact,sans-serif;font-weight:400;
                 color:${PALETA.areia};line-height:.9;white-space:nowrap}
  .cartela .op.res b{color:${PALETA.dourado}}
  .cartela .op span{color:rgba(246,239,227,.6);font-weight:600;letter-spacing:2.2px;
                    text-transform:uppercase;white-space:nowrap}
  .cartela .sinal{color:${PALETA.turq};font-family:'Lilita One',Impact,sans-serif;
                  padding-bottom:${f.key === 'story' ? 34 : 30}px}

  .conteudo.conta .meio{display:flex;flex-direction:column;align-items:center;
                        text-align:center}
  .conteudo.conta .base{display:flex;flex-direction:column;align-items:center;gap:26px}
  .conteudo.conta .hl{text-align:center}
  .conteudo.conta .ap{text-align:center;margin-top:28px}

  .selo{position:absolute;top:${f.safeTop + 44}px;right:52px;opacity:.94;
        filter:drop-shadow(0 6px 20px rgba(7,32,58,.45))}
  .assina{margin-top:${f.key === 'story' ? 40 : 32}px;opacity:.92}
  .arroba{color:rgba(246,239,227,.55);font-weight:600;letter-spacing:2px;
          font-size:24px;margin-top:16px}

  /* o selo sai do caminho quando o texto ocupa o topo */
  .peca.semselo .selo{display:none}
  `;
}

/* ------------------------------------------------------------------ *
 * API
 * ------------------------------------------------------------------ */

/**
 * Monta o HTML de uma peça.
 * @param {object} c   item de criativos.json (já com foto_src resolvido)
 * @param {'feed'|'story'} fmtKey
 */
export function montarHTML(c, fmtKey) {
  const f = { ...FORMATOS[fmtKey], key: fmtKey };
  const arq = c.arquetipo || 'bloco';
  const s = escala(fmtKey, arq);

  // headline em duas linhas; <em> vira dourado, <b> vira turquesa
  const hl = [c.headline_linha1, c.headline_linha2]
    .filter((l) => l && String(l).trim())
    .map((l) => `<span>${l}</span>`)
    .join('<br>');

  const dados = { ...c, hl, cta_arte: c.cta_arte || 'Reserve pelo WhatsApp' };
  const corpo = (ARQUETIPOS[arq] || arqBloco)(dados, f, s);
  const semSelo = arq === 'ceu' || arq === 'conta' ? '' : '';

  return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<style>${FONTES}</style>
<style>${css(dados, f, s)}</style></head>
<body><div class="peca ${semSelo}">${corpo}</div></body></html>`;
}
