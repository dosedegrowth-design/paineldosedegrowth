// Bateria de criativos de teste Vem pra Paraty — 10 ângulos, feed 4:5 + story 9:16
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const BRAND = path.resolve(__dirname, '..');
const OUT = path.join(BRAND, 'ads');
const SRC = path.join(OUT, 'src');
fs.mkdirSync(SRC, { recursive: true });

const F = `file://${BRAND}/fonts/fonts-local.css`;
const IMG = (n) => `file://${BRAND}/templates/img/${n}`;
const SELO = `file://${BRAND}/logo/final/selo-principal-2048.png`;
const SELO_MONO = `file://${BRAND}/logo/final/selo-mono-branco-2048.png`;
const LOCKUP = `file://${BRAND}/logo/final/logo-horizontal-areia-alpha.png`;

const WA = (s, c) => `<svg width="${s}" height="${s}" viewBox="0 0 96 96" fill="none">
  <path d="M48 12 A 36 36 0 1 0 30 79 L 16 84 L 22 70 A 36 36 0 1 0 48 12 Z" stroke="${c}" stroke-width="7" stroke-linejoin="round"/>
  <path d="M36 32 c2.5 -2.5 6 -2.5 8 0 l3 4 c1.8 2.2 1.5 5 -0.5 7 l-2 2 c2.8 5 7 9.2 12 12 l2 -2 c2 -2 4.8 -2.3 7 -0.5 l4 3 c2.5 2 2.5 5.5 0 8 l-2.5 2.5 c-2 2 -5.5 3 -8.5 2 c-13 -4.5 -23 -14.5 -27.5 -27.5 c-1 -3 0 -6.5 2 -8.5 z" fill="${c}"/>
</svg>`;
const STAR = (s) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M12 2 L14.9 8.6 L22 9.3 L16.7 14 L18.2 21 L12 17.4 L5.8 21 L7.3 14 L2 9.3 L9.1 8.6 Z" fill="#FFB84D"/></svg>`;

const BASE = `<meta charset="utf-8"><link rel="stylesheet" href="${F}">
<style>
html,body{margin:0;padding:0}*{box-sizing:border-box}
.lilita{font-family:'Lilita One','Arial Black',sans-serif;font-weight:400}
.pop{font-family:'Poppins',sans-serif}.pac{font-family:'Pacifico',cursive}
.stage{position:relative;overflow:hidden;background:#0B2D48;color:#F6EFE3}
.bg{position:absolute;inset:0;background-size:cover;background-repeat:no-repeat}
.selo-tl{position:absolute;top:44px;left:44px;width:130px;z-index:5}
.selo-tc{position:absolute;top:44px;left:50%;transform:translateX(-50%);width:140px;z-index:5}
.handle{position:absolute;top:70px;right:52px;font:600 26px Poppins;letter-spacing:1.5px;color:#F6EFE3;text-shadow:0 2px 12px rgba(0,0,0,.5);z-index:5}
.cta{display:inline-flex;align-items:center;gap:16px;font:700 33px Poppins;border-radius:999px;padding:26px 42px;box-shadow:0 14px 40px rgba(0,0,0,.35)}
.cta.or{background:#FF7A45;color:#fff}.cta.tq{background:#17C3B2;color:#fff}
.eyebrow{display:inline-block;font:700 27px Poppins;letter-spacing:5px;border-radius:999px;padding:11px 26px}
.foot{font:500 26px Poppins;letter-spacing:2px;color:rgba(246,239,227,.85)}
</style>`;

const stage = (w, h, inner) => `<!doctype html><html><head>${BASE}</head><body><div class="stage" style="width:${w}px;height:${h}px">${inner}</div></body></html>`;

// ---------- definição dos criativos ----------
const ads = {};

// AD01 — PREÇO (ticket sobre aérea)
const ticket = (fs1, fs2) => `
<div style="background:#F6EFE3;border-radius:30px;padding:44px 54px;transform:rotate(-2deg);box-shadow:0 24px 70px rgba(7,32,58,.45);text-align:center">
  <div class="lilita" style="font-size:${fs1}px;color:#0B2D48;line-height:1.05">PASSEIO PRIVATIVO<br>DE LANCHA</div>
  <div style="border-top:3px dashed rgba(11,45,72,.25);margin:26px 0 22px"></div>
  <div class="pop" style="font-weight:600;font-size:26px;letter-spacing:4px;color:#0E9AA7">A PARTIR DE</div>
  <div class="lilita" style="font-size:${fs2}px;color:#FF7A45;line-height:1">R$ 700</div>
  <div class="pop" style="font-weight:500;font-size:27px;color:#0B2D48;margin-top:8px">o passeio • até 12 pessoas</div>
</div>`;
ads['ad01-preco-feed'] = [1080, 1350, `
  <div class="bg" style="background-image:url('${IMG('foto_aerea.jpg')}');background-position:center"></div>
  <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(7,32,58,.35),rgba(7,32,58,0) 30%,rgba(7,32,58,.15) 70%,rgba(7,32,58,.8))"></div>
  <img class="selo-tl" src="${SELO}"><div class="handle pop">@vempraparaty</div>
  <div style="position:absolute;left:90px;right:90px;top:47%;transform:translateY(-50%)">${ticket(56, 150)}</div>
  <div style="position:absolute;left:0;right:0;bottom:64px;display:flex;flex-direction:column;align-items:center;gap:26px">
    <span class="cta tq">${WA(42, '#fff')} RESERVE PELO WHATSAPP</span>
    <span class="foot">Paraty-RJ • saídas todos os dias</span>
  </div>`];
ads['ad01-preco-story'] = [1080, 1920, `
  <div class="bg" style="background-image:url('${IMG('foto_aerea.jpg')}');background-position:center"></div>
  <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(7,32,58,.45),rgba(7,32,58,0) 28%,rgba(7,32,58,.1) 62%,rgba(7,32,58,.85))"></div>
  <img class="selo-tc" src="${SELO}" style="width:160px">
  <div style="position:absolute;left:80px;right:80px;top:46%;transform:translateY(-50%)">${ticket(62, 190)}</div>
  <div style="position:absolute;left:0;right:0;bottom:110px;display:flex;flex-direction:column;align-items:center;gap:30px">
    <span class="cta tq" style="font-size:38px;padding:30px 50px">${WA(46, '#fff')} RESERVE PELO WHATSAPP</span>
    <span class="foot" style="font-size:29px">@vempraparaty • Paraty-RJ</span>
  </div>`];

// AD02 — PRIVATIVO (split com onda)
ads['ad02-privativo-feed'] = [1080, 1350, `
  <div class="bg" style="background-image:url('${IMG('hero_b.jpg')}');background-position:60% 30%;height:62%"></div>
  <svg style="position:absolute;top:56%;left:0" width="1080" height="90" viewBox="0 0 1080 90" preserveAspectRatio="none">
    <path d="M0 60 Q 135 10 270 45 T 540 40 T 810 45 T 1080 35 L 1080 90 L 0 90 Z" fill="#0B2D48"/>
  </svg>
  <img class="selo-tl" src="${SELO}"><div class="handle pop">@vempraparaty</div>
  <div style="position:absolute;top:62%;left:0;right:0;bottom:0;background:#0B2D48;padding:10px 70px 0;text-align:center">
    <span class="eyebrow" style="background:#FF7A45;color:#fff">SÓ SUA</span>
    <div class="lilita" style="font-size:74px;line-height:1.06;margin-top:22px">Lancha privativa, do jeito<br>que <span style="color:#17C3B2">seu grupo</span> quiser</div>
    <div class="pop" style="font-weight:500;font-size:29px;color:rgba(246,239,227,.85);margin-top:20px">sem horário engessado &nbsp;•&nbsp; paradas à escolha &nbsp;•&nbsp; até 12 pessoas</div>
    <div style="display:flex;align-items:center;justify-content:center;gap:30px;margin-top:34px">
      <span class="cta or">${WA(40, '#fff')} FECHA TEU ROTEIRO</span>
      <span class="pop" style="font-weight:700;font-size:30px;color:#FFB84D">a partir de R$ 700</span>
    </div>
  </div>`];

// AD03 — ROTEIRO (lista numerada)
const stops = ['Praia da Lula', 'Lagoa Azul', 'Ilha Comprida', 'Praia Vermelha', 'Saco do Mamanguá'];
const stopList = (fs, gap) => `<div style="display:flex;flex-direction:column;gap:${gap}px">` + stops.map((s, i) => `
  <div style="display:flex;align-items:center;gap:22px">
    <span class="lilita" style="width:64px;height:64px;border-radius:50%;background:${i === 4 ? '#FF7A45' : 'rgba(246,239,227,.14)'};border:2.5px solid ${i === 4 ? '#FF7A45' : 'rgba(246,239,227,.5)'};display:flex;align-items:center;justify-content:center;font-size:30px;color:#fff">${i + 1}</span>
    <span class="pop" style="font-weight:600;font-size:${fs}px;color:#F6EFE3;text-shadow:0 2px 10px rgba(0,0,0,.5)">${s}</span>
  </div>`).join('') + '</div>';
ads['ad03-roteiro-feed'] = [1080, 1350, `
  <div class="bg" style="background-image:url('${IMG('foto_praia.jpg')}');background-position:center"></div>
  <div style="position:absolute;inset:0;background:linear-gradient(100deg,rgba(7,32,58,.88) 0%,rgba(7,32,58,.55) 46%,rgba(7,32,58,.05) 75%),linear-gradient(180deg,rgba(7,32,58,.2),rgba(7,32,58,.75))"></div>
  <img src="${SELO}" style="position:absolute;top:44px;right:44px;width:130px"><\!-- selo à direita -->
  <div style="position:absolute;left:70px;top:170px;right:420px">
    <span class="eyebrow" style="border:3px solid #17C3B2;color:#17C3B2">UM DIA NO MAR</span>
    <div class="lilita" style="font-size:88px;line-height:1.04;margin:26px 0 40px">5 paradas que<br><span style="color:#FFB84D">valem a viagem</span></div>
  </div>
  <div style="position:absolute;left:70px;top:560px">${stopList(36, 26)}</div>
  <div style="position:absolute;left:70px;right:70px;bottom:64px;display:flex;align-items:center;justify-content:space-between">
    <span class="cta or">${WA(40, '#fff')} MONTE SEU ROTEIRO</span>
    <span class="foot">@vempraparaty</span>
  </div>`];
ads['ad03-roteiro-story'] = [1080, 1920, `
  <div class="bg" style="background-image:url('${IMG('foto_praia.jpg')}');background-position:center"></div>
  <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(7,32,58,.65),rgba(7,32,58,.25) 34%,rgba(7,32,58,.65) 66%,rgba(7,32,58,.92))"></div>
  <img class="selo-tc" src="${SELO}" style="width:150px">
  <div style="position:absolute;left:80px;right:80px;top:260px;text-align:center">
    <span class="eyebrow" style="border:3px solid #17C3B2;color:#17C3B2;background:rgba(7,32,58,.6)">UM DIA NO MAR</span>
    <div class="lilita" style="font-size:100px;line-height:1.04;margin-top:26px">5 paradas que<br><span style="color:#FFB84D">valem a viagem</span></div>
  </div>
  <div style="position:absolute;left:170px;top:760px">${stopList(40, 34)}</div>
  <div style="position:absolute;left:0;right:0;bottom:110px;display:flex;flex-direction:column;align-items:center;gap:28px">
    <span class="cta or" style="font-size:38px;padding:30px 50px">${WA(46, '#fff')} MONTE SEU ROTEIRO</span>
    <span class="foot" style="font-size:29px">lancha privativa a partir de R$ 700</span>
  </div>`];

// AD04 — TRADIÇÃO (colonial editorial)
ads['ad04-tradicao-feed'] = [1080, 1350, `
  <div class="bg" style="background-image:url('${IMG('foto_colonial.jpg')}');background-position:center 40%"></div>
  <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(7,32,58,.30),rgba(7,32,58,.05) 40%,rgba(7,32,58,.88) 78%,#07203A)"></div>
  <img class="selo-tl" src="${SELO}"><div class="handle pop">@vempraparaty</div>
  <div style="position:absolute;left:80px;right:80px;bottom:70px;text-align:center">
    <div class="pac" style="font-size:54px;color:#FFB84D;transform:rotate(-2deg)">Desde o começo…</div>
    <div class="lilita" style="font-size:86px;line-height:1.05;margin-top:14px">A <span style="color:#17C3B2">3ª lancha</span> a navegar<br>a baía de Paraty</div>
    <div class="pop" style="font-weight:500;font-size:30px;color:rgba(246,239,227,.88);margin-top:22px;line-height:1.55">A gente conhece cada praia pelo nome —<br>e leva você nas melhores.</div>
    <div style="margin-top:36px"><span class="cta or">${WA(40, '#fff')} CONHEÇA PELO MAR</span></div>
  </div>`];

// AD05 — URGÊNCIA (calendário)
const dayChips = (h) => `
  <div style="display:flex;gap:18px;justify-content:center">
    ${['SEX', 'SÁB', 'DOM'].map((d, i) => `<span class="lilita" style="font-size:${h * 0.42}px;width:${h * 1.55}px;height:${h}px;display:flex;align-items:center;justify-content:center;border-radius:22px;${i === 1 ? 'background:#FF7A45;color:#fff;box-shadow:0 12px 34px rgba(0,0,0,.35)' : 'background:rgba(246,239,227,.12);border:2.5px solid rgba(246,239,227,.45);color:#F6EFE3'}">${d}</span>`).join('')}
  </div>`;
ads['ad05-urgencia-feed'] = [1080, 1350, `
  <div class="bg" style="background-image:url('${IMG('hero_a.jpg')}');background-position:center 30%"></div>
  <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(7,32,58,.5),rgba(7,32,58,.08) 34%,rgba(7,32,58,.6) 62%,rgba(7,32,58,.95))"></div>
  <img class="selo-tl" src="${SELO}"><div class="handle pop">@vempraparaty</div>
  <div style="position:absolute;left:70px;right:70px;bottom:66px;text-align:center">
    <span class="eyebrow" style="background:#FF7A45;color:#fff">VAGAS ABERTAS</span>
    <div class="lilita" style="font-size:104px;line-height:1.03;margin:24px 0 36px">Fim de semana<br><span style="color:#17C3B2">no mar?</span></div>
    ${dayChips(110)}
    <div class="pop" style="font-weight:500;font-size:29px;color:rgba(246,239,227,.88);margin-top:34px">saídas do cais de Paraty &nbsp;•&nbsp; lancha privativa a partir de <b style="color:#FFB84D">R$ 700</b></div>
    <div style="margin-top:34px"><span class="cta tq">${WA(40, '#fff')} GARANTA SUA DATA</span></div>
  </div>`];
ads['ad05-urgencia-story'] = [1080, 1920, `
  <div class="bg" style="background-image:url('${IMG('hero_a.jpg')}');background-position:center 25%"></div>
  <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(7,32,58,.55),rgba(7,32,58,.12) 30%,rgba(7,32,58,.55) 58%,rgba(7,32,58,.96))"></div>
  <img class="selo-tc" src="${SELO}" style="width:160px">
  <div style="position:absolute;left:70px;right:70px;bottom:110px;text-align:center">
    <span class="eyebrow" style="background:#FF7A45;color:#fff;font-size:30px">VAGAS ABERTAS</span>
    <div class="lilita" style="font-size:122px;line-height:1.03;margin:28px 0 44px">Fim de semana<br><span style="color:#17C3B2">no mar?</span></div>
    ${dayChips(130)}
    <div class="pop" style="font-weight:500;font-size:32px;color:rgba(246,239,227,.88);margin-top:44px">lancha privativa a partir de <b style="color:#FFB84D">R$ 700</b></div>
    <div style="margin-top:40px"><span class="cta tq" style="font-size:40px;padding:32px 54px">${WA(48, '#fff')} GARANTA SUA DATA</span></div>
  </div>`];

// AD06 — PÔR DO SOL (minimal aspiracional)
ads['ad06-pordosol-feed'] = [1080, 1350, `
  <div class="bg" style="background-image:url('${IMG('foto_casal.jpg')}');background-position:center"></div>
  <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(7,32,58,.15),rgba(7,32,58,0) 40%,rgba(7,32,58,.72))"></div>
  <div style="position:absolute;left:70px;right:70px;bottom:84px;text-align:center">
    <div class="pac" style="font-size:88px;color:#F6EFE3;line-height:1.35;text-shadow:0 4px 24px rgba(0,0,0,.4)">Seu pôr do sol<br>tem endereço</div>
    <div class="pop" style="font-weight:600;font-size:26px;letter-spacing:8px;color:#FFB84D;margin-top:26px">BAÍA DE PARATY • RJ</div>
    <div class="pop" style="font-weight:500;font-size:27px;color:rgba(246,239,227,.85);margin-top:30px">reservas pelo WhatsApp &nbsp;•&nbsp; @vempraparaty</div>
  </div>
  <img src="${SELO_MONO}" style="position:absolute;top:48px;left:50%;transform:translateX(-50%);width:120px;opacity:.9">`];
ads['ad06-pordosol-story'] = [1080, 1920, `
  <div class="bg" style="background-image:url('${IMG('foto_casal.jpg')}');background-position:center"></div>
  <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(7,32,58,.2),rgba(7,32,58,0) 45%,rgba(7,32,58,.78))"></div>
  <img src="${SELO_MONO}" style="position:absolute;top:70px;left:50%;transform:translateX(-50%);width:140px;opacity:.92">
  <div style="position:absolute;left:70px;right:70px;bottom:130px;text-align:center">
    <div class="pac" style="font-size:104px;color:#F6EFE3;line-height:1.35;text-shadow:0 4px 26px rgba(0,0,0,.45)">Seu pôr do sol<br>tem endereço</div>
    <div class="pop" style="font-weight:600;font-size:29px;letter-spacing:9px;color:#FFB84D;margin-top:30px">BAÍA DE PARATY • RJ</div>
    <div style="margin-top:44px"><span class="cta or" style="font-size:36px">${WA(44, '#fff')} RESERVAS PELO WHATSAPP</span></div>
  </div>`];

// AD07 — GRUPO (polaroid + stickers)
const polaroid = (imgN, w, rot) => `
  <div style="width:${w}px;background:#fff;padding:22px 22px 30px;border-radius:10px;transform:rotate(${rot}deg);box-shadow:0 30px 80px rgba(0,0,0,.45)">
    <div style="width:100%;aspect-ratio:0.92;background:url('${IMG(imgN)}') center/cover;border-radius:4px"></div>
  </div>`;
ads['ad07-grupo-feed'] = [1080, 1350, `
  <div style="position:absolute;inset:0;background:linear-gradient(180deg,#0B2D48,#0E5A6E)"></div>
  <svg style="position:absolute;inset:0;opacity:.1" width="1080" height="1350" viewBox="0 0 1080 1350">
    <g fill="none" stroke="#F6EFE3" stroke-width="4" stroke-linecap="round">
      <path d="M-40 240 Q 120 180 280 240 T 600 240 T 920 240 T 1240 240"/>
      <path d="M-40 1130 Q 120 1070 280 1130 T 600 1130 T 920 1130 T 1240 1130"/>
    </g>
  </svg>
  <img class="selo-tl" src="${SELO}"><div class="handle pop">@vempraparaty</div>
  <div style="position:absolute;left:50%;top:212px;transform:translateX(-50%)">${polaroid('foto_grupo.jpg', 620, 2.5)}</div>
  <span class="lilita" style="position:absolute;top:210px;right:96px;transform:rotate(7deg);background:#FF7A45;color:#fff;font-size:32px;padding:16px 26px;border-radius:14px;box-shadow:0 12px 30px rgba(0,0,0,.35)">ATÉ 12 PESSOAS</span>
  <span class="lilita" style="position:absolute;top:820px;left:84px;transform:rotate(-6deg);background:#17C3B2;color:#fff;font-size:28px;padding:14px 22px;border-radius:14px;box-shadow:0 12px 30px rgba(0,0,0,.35)">LANCHA SÓ SUA</span>
  <div style="position:absolute;left:70px;right:70px;bottom:66px;text-align:center">
    <div class="lilita" style="font-size:96px;line-height:1.02">Junta a galera <span style="color:#FFB84D">e vem</span></div>
    <div class="pop" style="font-weight:500;font-size:29px;color:rgba(246,239,227,.88);margin-top:16px">Paradas pra nadar nas melhores praias da baía de Paraty</div>
    <div style="margin-top:30px"><span class="cta or">${WA(40, '#fff')} BORA MARCAR</span></div>
  </div>`];
ads['ad07-grupo-story'] = [1080, 1920, `
  <div style="position:absolute;inset:0;background:linear-gradient(180deg,#0B2D48,#0E5A6E)"></div>
  <svg style="position:absolute;inset:0;opacity:.1" width="1080" height="1920" viewBox="0 0 1080 1920">
    <g fill="none" stroke="#F6EFE3" stroke-width="4" stroke-linecap="round">
      <path d="M-40 300 Q 120 240 280 300 T 600 300 T 920 300 T 1240 300"/>
      <path d="M-40 1650 Q 120 1590 280 1650 T 600 1650 T 920 1650 T 1240 1650"/>
    </g>
  </svg>
  <img class="selo-tc" src="${SELO}" style="width:150px">
  <div style="position:absolute;left:50%;top:290px;transform:translateX(-50%)">${polaroid('foto_grupo.jpg', 700, -2.5)}</div>
  <span class="lilita" style="position:absolute;top:300px;right:60px;transform:rotate(7deg);background:#FF7A45;color:#fff;font-size:34px;padding:18px 28px;border-radius:14px;box-shadow:0 12px 30px rgba(0,0,0,.35)">ATÉ 12 PESSOAS</span>
  <div style="position:absolute;left:70px;right:70px;bottom:120px;text-align:center">
    <div class="lilita" style="font-size:110px;line-height:1.02">Junta a galera<br><span style="color:#FFB84D">e vem</span></div>
    <div class="pop" style="font-weight:500;font-size:31px;color:rgba(246,239,227,.88);margin-top:20px">Paradas pra nadar nas melhores praias da baía</div>
    <div style="margin-top:38px"><span class="cta or" style="font-size:38px;padding:30px 50px">${WA(46, '#fff')} BORA MARCAR</span></div>
  </div>`];

// AD08 — INCLUSO (recibo)
const inclusos = ['Marinheiro experiente', 'Combustível incluso', 'Coletes e equipamentos', 'Paradas pra nadar', 'Roteiro personalizado'];
ads['ad08-incluso-feed'] = [1080, 1350, `
  <div class="bg" style="background-image:url('${IMG('foto_aerea.jpg')}');background-position:center;filter:brightness(.55) saturate(1.1)"></div>
  <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(7,32,58,.55),rgba(7,32,58,.75))"></div>
  <img class="selo-tl" src="${SELO}"><div class="handle pop">@vempraparaty</div>
  <div style="position:absolute;left:50%;top:190px;transform:translateX(-50%);width:660px;background:#F6EFE3;border-radius:22px;padding:46px 54px;box-shadow:0 28px 80px rgba(0,0,0,.5)">
    <div class="lilita" style="font-size:52px;color:#0B2D48;text-align:center">O QUE TÁ INCLUSO</div>
    <div style="border-top:3px dashed rgba(11,45,72,.25);margin:28px 0"></div>
    ${inclusos.map(i => `<div style="display:flex;align-items:center;gap:18px;margin-bottom:20px">
      <span style="width:40px;height:40px;border-radius:50%;background:#17C3B2;color:#fff;display:flex;align-items:center;justify-content:center;font:800 24px Poppins">✓</span>
      <span class="pop" style="font-weight:600;font-size:30px;color:#0B2D48">${i}</span></div>`).join('')}
    <div style="border-top:3px dashed rgba(11,45,72,.25);margin:26px 0 22px"></div>
    <div style="display:flex;align-items:baseline;justify-content:space-between">
      <span class="pop" style="font-weight:600;font-size:26px;letter-spacing:3px;color:#0E9AA7">A PARTIR DE</span>
      <span class="lilita" style="font-size:64px;color:#FF7A45">R$ 700</span>
    </div>
  </div>
  <div style="position:absolute;left:0;right:0;bottom:56px;text-align:center">
    <span class="cta or">${WA(40, '#fff')} PEDIR ORÇAMENTO</span>
  </div>`];

// AD09 — DEPOIMENTO (quote card)
const quoteCard = (w, qfs) => `
  <div style="width:${w}px;background:#F6EFE3;border-radius:26px;padding:52px 56px;box-shadow:0 28px 80px rgba(0,0,0,.45);position:relative">
    <div class="lilita" style="position:absolute;top:-46px;left:44px;font-size:150px;color:#FF7A45">“</div>
    <div style="display:flex;gap:8px;margin-bottom:24px">${STAR(38)}${STAR(38)}${STAR(38)}${STAR(38)}${STAR(38)}</div>
    <div class="pop" style="font-weight:600;font-size:${qfs}px;line-height:1.5;color:#0B2D48">Melhor dia da viagem. Água cristalina, praia sem ninguém e o capitão conhece cada canto da baía.</div>
    <div style="display:flex;align-items:center;gap:18px;margin-top:30px">
      <span class="lilita" style="width:64px;height:64px;border-radius:50%;background:#0E9AA7;color:#fff;display:flex;align-items:center;justify-content:center;font-size:30px">V</span>
      <div><div class="pop" style="font-weight:700;font-size:26px;color:#0B2D48">Cliente Vem pra Paraty</div>
      <div class="pop" style="font-weight:500;font-size:22px;color:#0E9AA7">passeio privativo • baía de Paraty</div></div>
    </div>
  </div>`;
ads['ad09-depoimento-feed'] = [1080, 1350, `
  <div style="position:absolute;inset:0;background:linear-gradient(160deg,#0B2D48 0%,#0E5A6E 100%)"></div>
  <img src="${SELO_MONO}" style="position:absolute;right:-160px;bottom:-160px;width:640px;opacity:.08">
  <img class="selo-tl" src="${SELO}"><div class="handle pop">@vempraparaty</div>
  <div style="position:absolute;left:70px;top:220px">
    <div class="lilita" style="font-size:78px;line-height:1.05">Quem foi,<br><span style="color:#17C3B2">voltou apaixonado</span></div>
  </div>
  <div style="position:absolute;left:50%;top:470px;transform:translateX(-50%)">${quoteCard(760, 34)}</div>
  <div style="position:absolute;left:0;right:0;bottom:60px;display:flex;flex-direction:column;align-items:center;gap:22px">
    <span class="cta tq">${WA(40, '#fff')} VEM VIVER ISSO</span>
    <span class="foot">lancha privativa a partir de R$ 700</span>
  </div>`];
ads['ad09-depoimento-story'] = [1080, 1920, `
  <div style="position:absolute;inset:0;background:linear-gradient(170deg,#0B2D48 0%,#0E5A6E 100%)"></div>
  <img src="${SELO_MONO}" style="position:absolute;right:-180px;bottom:-180px;width:760px;opacity:.08">
  <img class="selo-tc" src="${SELO}" style="width:150px">
  <div style="position:absolute;left:80px;right:80px;top:300px;text-align:center">
    <div class="lilita" style="font-size:92px;line-height:1.05">Quem foi,<br><span style="color:#17C3B2">voltou apaixonado</span></div>
  </div>
  <div style="position:absolute;left:50%;top:620px;transform:translateX(-50%)">${quoteCard(820, 38)}</div>
  <div style="position:absolute;left:0;right:0;bottom:120px;display:flex;flex-direction:column;align-items:center;gap:28px">
    <span class="cta tq" style="font-size:38px;padding:30px 50px">${WA(46, '#fff')} VEM VIVER ISSO</span>
    <span class="foot" style="font-size:29px">lancha privativa a partir de R$ 700</span>
  </div>`];

// AD10 — MATEMÁTICA DA GALERA
ads['ad10-matematica-feed'] = [1080, 1350, `
  <div class="bg" style="background-image:url('${IMG('foto_grupo.jpg')}');background-position:center 20%"></div>
  <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(7,32,58,.45),rgba(7,32,58,.1) 32%,rgba(7,32,58,.7) 58%,rgba(7,32,58,.97))"></div>
  <img class="selo-tl" src="${SELO}"><div class="handle pop">@vempraparaty</div>
  <div style="position:absolute;left:70px;right:70px;bottom:64px;text-align:center">
    <span class="eyebrow" style="background:#17C3B2;color:#fff">FAZ AS CONTAS</span>
    <div style="display:flex;align-items:center;justify-content:center;gap:26px;margin-top:34px">
      <span class="lilita" style="font-size:96px;color:#F6EFE3">R$ 700</span>
      <span class="lilita" style="font-size:70px;color:#17C3B2">÷</span>
      <span class="lilita" style="font-size:96px;color:#F6EFE3">12 amigos</span>
    </div>
    <div class="lilita" style="font-size:74px;color:#FFB84D;margin-top:10px">= menos de R$ 60 cada</div>
    <div class="pop" style="font-weight:500;font-size:29px;color:rgba(246,239,227,.88);margin-top:22px">Um dia inteiro de lancha privativa em Paraty. Sim, é sério.</div>
    <div style="margin-top:32px"><span class="cta or">${WA(40, '#fff')} SIMULA NO WHATS</span></div>
  </div>`];

(async () => {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    headless: true,
    args: ['--no-sandbox', '--force-color-profile=srgb'],
  });
  for (const [slug, [w, h, inner]] of Object.entries(ads)) {
    const file = path.join(SRC, `vpp-${slug}.html`);
    fs.writeFileSync(file, stage(w, h, inner));
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    await page.goto('file://' + file, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(250);
    await page.screenshot({ path: path.join(OUT, `vpp-${slug}.png`) });
    await page.close();
    console.log('ok', slug);
  }
  await browser.close();
  console.log('total:', Object.keys(ads).length);
})().catch(e => { console.error('ERR:', e.message); process.exit(1); });
