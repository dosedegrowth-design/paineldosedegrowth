import { createRequire } from 'module';
const require = createRequire('/home/user/paineldosedegrowth/');
const s = require('sharp'); const fs=require('fs');
const { CARQ, ADS } = await import('./export-data.mjs');
const SP='/tmp/claude-0/-home-user-paineldosedegrowth/a7e39f73-9e96-5092-8195-f6ae070240e5/scratchpad';
const EXP=SP+'/export';
const STAGE=SP+'/pacote/Criativos Dr. Samuel - DDG';
const A=STAGE+'/Carrosseis'; const B=STAGE+'/Reels e Feed';
fs.rmSync(SP+'/pacote',{recursive:true,force:true});
fs.mkdirSync(A,{recursive:true}); fs.mkdirSync(B,{recursive:true});

const slug=t=>t.normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-zA-Z0-9]+/g,' ').trim();
const cardName=['capa','conteudo','CTA'];
async function jpg(src,dst){ await s(src).jpeg({quality:86,mozjpeg:true}).toFile(dst); }

let n=0;
for(let ci=0;ci<CARQ.length;ci++){
  const num=String(ci+1).padStart(2,'0'); const t=slug(CARQ[ci].t);
  for(let si=0;si<3;si++){
    const src=`${EXP}/carrosseis/C${num}_${si+1}.png`;
    const dst=`${A}/Carrossel ${num} - ${t} - ${si+1} ${cardName[si]}.jpg`;
    await jpg(src,dst); n++;
  }
}
for(let ai=0;ai<ADS.length;ai++){
  const t=slug(ADS[ai].h.replace(/[{}]/g,'')).slice(0,42);
  await jpg(`${EXP}/diretos/D${ai+1}_feed_1080x1350.png`, `${B}/Criativo ${ai+1} - ${t} - Feed 1080x1350.jpg`); n++;
  await jpg(`${EXP}/diretos/D${ai+1}_reels_1080x1920.png`, `${B}/Criativo ${ai+1} - ${t} - Reels 1080x1920.jpg`); n++;
}
// README
fs.writeFileSync(STAGE+'/LEIA-ME.txt',
`Criativos de conversao - Dr. Samuel Chagas (Dose de Growth)

Pasta "Carrosseis": 10 carrosseis de 3 cards cada (1080x1350). Poste cada carrossel
na ordem 1 (capa), 2 (conteudo), 3 (CTA).

Pasta "Reels e Feed": 7 criativos diretos, cada um em Feed (1080x1350) e Reels (1080x1920).

Todos com foco em conversa no WhatsApp. @dr.samuelchagas.
`);
console.log('arquivos JPG:', n);
