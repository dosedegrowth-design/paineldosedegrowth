import { createRequire } from 'module';
const require = createRequire('/home/user/paineldosedegrowth/');
const s = require('sharp');
const fs = require('fs');
const { execFileSync } = require('child_process');
const BG='/tmp/claude-0/-home-user-paineldosedegrowth/a7e39f73-9e96-5092-8195-f6ae070240e5/scratchpad/bg';
const OUT='/tmp/claude-0/-home-user-paineldosedegrowth/a7e39f73-9e96-5092-8195-f6ae070240e5/scratchpad/export';
const TMP=OUT+'/_tmp';
const CHROME='/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
fs.mkdirSync(OUT+'/carrosseis',{recursive:true});
fs.mkdirSync(OUT+'/diretos',{recursive:true});
fs.mkdirSync(TMP,{recursive:true});

const ONLY = process.argv[2]||''; // 'sample' to render just 2

// ---------- backgrounds ----------
const SRC={
 bg1:{f:'bg1.jpg'},bg2:{f:'bg2.jpg'},bg4:{f:'bg4.jpg'},bg5:{f:'bg5.jpg'},bg7:{f:'bg7.jpg'},bg9:{f:'bg9.jpg'},
 n1:{f:'n1.jpg'},n2:{f:'n2.jpg'},n3:{f:'n3.jpg'},n4:{f:'n4.jpg'},n5:{f:'n5.jpg'},n6:{f:'n6.jpg'},n7:{f:'n7.jpg'},
 n8:{f:'n8.jpg'},n9:{f:'n9.jpg'},n10:{f:'n10.jpg'},n11:{f:'n11.jpg'},n12:{f:'n12.jpg'},n13:{f:'n13.jpg'},n14:{f:'n14.jpg'},
 real1a:{f:'real1.webp',pos:'left'},real1b:{f:'real1.webp',pos:'right'},real2r:{f:'real2.webp',pos:'right'},real2l:{f:'real2.webp',pos:'left'},
 d1:{f:'d1.jpg'},d2:{f:'d2.jpg'},d3:{f:'d3.jpg'},d4:{f:'d4.jpg'},d5:{f:'d5.jpg'},d6:{f:'d6.jpg'},d7:{f:'d7.jpg'},ajust:{f:'ajust.webp'},
};
const cache={};
async function uri(key,tall){
 const ck=key+(tall?'_t':''); if(cache[ck])return cache[ck];
 const {f,pos}=SRC[key]; const real=f.endsWith('.webp');
 const w=1080,h=tall?1920:1350;
 let img=s(BG+'/'+f).resize(w,h,{fit:'cover',position:pos||'attention'});
 if(!real) img=img.modulate({brightness:0.95});
 const buf=await img.jpeg({quality:88,mozjpeg:true}).toBuffer();
 return cache[ck]='data:image/jpeg;base64,'+buf.toString('base64');
}

const FONTS='<meta charset="utf-8"><style>'+fs.readFileSync('/tmp/claude-0/-home-user-paineldosedegrowth/a7e39f73-9e96-5092-8195-f6ae070240e5/scratchpad/fonts-embed.css','utf8')+'</style>';
const wa='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 00-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1012 2zm0 2a8 8 0 11-4.2 14.8l-.3-.2-2.8.8.8-2.8-.2-.3A8 8 0 0112 4zm-2.7 3.6c-.2 0-.5.1-.7.3-.3.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.7 2.8 4.3 3.8 2.1.8 2.5.7 3 .6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2 0-.1-.2-.2-.5-.3l-1.6-.8c-.2-.1-.4-.1-.6.1l-.7.9c-.1.2-.3.2-.5.1-.7-.3-1.4-.6-2.1-1.5-.5-.6-.9-1.3-1-1.5-.1-.2 0-.4.1-.5l.4-.5c.1-.2.2-.3.2-.5s0-.3-.1-.4l-.8-1.8c-.2-.4-.4-.4-.6-.4z"/></svg>';
const hl=h=>h.replace(/\{([^}]+)\}/g,'<span class="hl">$1</span>');

// ---------- CARD (carousel 4:5) ----------
function cardPage(sl,active,dataUri){
 const body=sl.cta
   ? `<div class="headline">${hl(sl.h)}</div><div class="cta">${wa}${sl.cta}</div>`
   : `<div class="headline">${hl(sl.h)}</div><p class="support">${sl.x}</p>`;
 const dots=[0,1,2].map(i=>`<i class="${i===active?'on':''}"></i>`).join('');
 return `<!doctype html><html><head>${FONTS}<style>
 *{box-sizing:border-box;margin:0}html,body{width:100%;height:100%}
 body{font-family:"Inter Tight",sans-serif;-webkit-font-smoothing:antialiased}
 .card{position:relative;width:100vw;height:100vh;overflow:hidden;background:#0b1112;color:#F4F6F5;display:grid;grid-template-rows:1fr auto}
 .ph{position:absolute;inset:0;background:url("${dataUri}") center/cover}
 .ph::after{content:"";position:absolute;inset:0;background:radial-gradient(120% 85% at 50% 22%,transparent 42%,rgba(0,0,0,.5))}
 .scrim{position:absolute;inset:0;background:linear-gradient(180deg,rgba(4,10,10,.05) 30%,rgba(5,11,11,.72) 62%,rgba(3,8,8,.95) 100%)}
 .toprow{grid-row:1;position:relative;z-index:3;align-self:start;display:flex;justify-content:space-between;align-items:flex-start;padding:4.6vw 4.6vw 0}
 .pill{font-family:"Archivo";font-weight:700;font-size:3.15vw;letter-spacing:.04em;background:rgba(10,20,20,.42);border:1px solid rgba(255,255,255,.22);color:#fff;padding:1.7vw 3.1vw;border-radius:99vw}
 .pill.accent{background:#0E9E92;border-color:transparent}
 .dots{display:flex;gap:1.4vw;margin-top:1.4vw}
 .dots i{width:4.6vw;height:.85vw;border-radius:2px;background:rgba(255,255,255,.42)}.dots i.on{background:#fff;width:6.3vw}
 .body{grid-row:2;position:relative;z-index:3;padding:0 5vw 4.6vw;display:flex;flex-direction:column;gap:2.3vw}
 .headline{font-family:"Anton";text-transform:uppercase;font-size:6vw;line-height:1.05;letter-spacing:.004em;text-shadow:0 .5vw 4vw rgba(0,0,0,.55)}
 .headline .hl{color:#3fe0cf}
 .support{font-size:3.7vw;line-height:1.34;color:rgba(244,246,245,.92);max-width:74vw;text-shadow:0 .3vw 2.5vw rgba(0,0,0,.55)}
 .cta{margin-top:2.5vw;align-self:flex-start;display:inline-flex;align-items:center;gap:2vw;font-family:"Archivo";font-weight:600;font-size:3.4vw;letter-spacing:.03em;padding:1.7vw 3.4vw;border-radius:99vw;border:1px solid rgba(37,211,102,.55);color:#a7f3c4;background:rgba(37,211,102,.12)}
 .cta svg{width:4vw;height:4vw}
 </style></head><body><div class="card"><div class="ph"></div><div class="scrim"></div>
 <div class="toprow"><span class="pill${active===0?' accent':''}">${sl.pill}</span><span class="dots">${dots}</span></div>
 <div class="body">${body}</div></div></body></html>`;
}

// ---------- AD (direct feed/reel) ----------
function adPage(a,fmt,dataUri){
 const reel=fmt==='reel';
 const lift=a.lift?`transform:${a.lift};transform-origin:50% 30%`:'';
 return `<!doctype html><html><head>${FONTS}<style>
 *{box-sizing:border-box;margin:0}html,body{width:100%;height:100%}
 body{font-family:"Inter Tight",sans-serif;-webkit-font-smoothing:antialiased}
 .ad{position:relative;width:100vw;height:100vh;overflow:hidden;background:#0b1112;color:#F4F6F5}
 .ph{position:absolute;inset:0;background:url("${dataUri}") center/cover;${lift}}
 .ph::after{content:"";position:absolute;inset:0;background:radial-gradient(120% 80% at 50% 18%,transparent 40%,rgba(0,0,0,.5))}
 .scrim{position:absolute;inset:0;background:linear-gradient(180deg,rgba(4,10,10,.15) 22%,rgba(5,11,11,.72) 58%,rgba(3,8,8,.96) 100%)}
 .top{position:absolute;top:0;left:0;right:0;display:flex;justify-content:space-between;align-items:center;padding:5vw 5.5vw 0;z-index:3}
 .pill{font-family:"Archivo";font-weight:700;font-size:2.9vw;letter-spacing:.04em;background:rgba(10,20,20,.42);border:1px solid rgba(255,255,255,.22);color:#fff;padding:1.7vw 3.2vw;border-radius:99vw}
 .handle{font-family:"Archivo";font-weight:600;font-size:2.8vw;color:rgba(255,255,255,.85);text-shadow:0 .3vw 1.6vw rgba(0,0,0,.6)}
 .content{position:absolute;left:0;right:0;bottom:0;padding:0 5.5vw ${reel?'24vw':'6vw'};display:flex;flex-direction:column;z-index:3}
 .headline{font-family:"Anton";text-transform:uppercase;line-height:1.04;letter-spacing:.004em;text-shadow:0 .5vw 3.6vw rgba(0,0,0,.55);font-size:${reel?'8.9':'8.6'}vw}
 .headline .hl{color:#3fe0cf}
 .support{margin:3.4vw 0 0;font-size:3.6vw;line-height:1.32;color:rgba(244,246,245,.92);max-width:64vw;text-shadow:0 .3vw 2vw rgba(0,0,0,.55)}
 .cta{margin-top:4.4vw;align-self:flex-start;display:inline-flex;align-items:center;gap:1.8vw;font-family:"Archivo";font-weight:700;font-size:3.4vw;letter-spacing:.02em;padding:2vw 3.6vw;border-radius:99vw;color:#062a12;background:#25D366}
 .cta svg{width:4.4vw;height:4.4vw}
 .sig{margin-top:3vw;font-family:"Archivo";font-weight:600;font-size:2.7vw;color:rgba(255,255,255,.72);text-shadow:0 .3vw 1.6vw rgba(0,0,0,.6)}
 </style></head><body><div class="ad"><div class="ph"></div><div class="scrim"></div>
 <div class="top"><span class="pill">${a.pill}</span><span class="handle">@dr.samuelchagas</span></div>
 <div class="content"><div class="headline">${hl(a.h)}</div><p class="support">${a.x}</p>
 <div class="cta">${wa}${a.cta}</div><div class="sig">Dr. Samuel Chagas · Fisioterapia + Quiropraxia</div></div></div></body></html>`;
}

function shoot(htmlPath,pngPath,w,h){
 execFileSync(CHROME,['--headless=new','--no-sandbox','--disable-gpu','--hide-scrollbars',
  '--force-device-scale-factor=1',`--window-size=${w},${h}`,'--virtual-time-budget=3500',
  `--screenshot=${pngPath}`,`file://${htmlPath}`],{stdio:'ignore'});
}

// ---------- data ----------
const {CARQ, ADS} = await import('./export-data.mjs');

async function run(){
 const jobs=[];
 // carousels
 CARQ.forEach((c,ci)=>{ c.s.forEach((sl,si)=>{
   jobs.push({kind:'card',bg:sl.bg,sl,active:si,
     name:`carrosseis/C${String(ci+1).padStart(2,'0')}_${si+1}.png`});
 });});
 // direct
 ADS.forEach((a,ai)=>{ ['feed','reel'].forEach(fmt=>{
   jobs.push({kind:'ad',bg:a.bg,a,fmt,tall:fmt==='reel',
     name:`diretos/D${ai+1}_${fmt==='reel'?'reels_1080x1920':'feed_1080x1350'}.png`});
 });});
 const list = ONLY==='sample' ? [jobs[0], jobs.find(j=>j.kind==='ad'&&j.fmt==='reel')] : jobs;
 let i=0;
 for(const j of list){
   i++;
   const tall=!!j.tall;
   const du=await uri(j.bg,tall);
   const html = j.kind==='card'? cardPage(j.sl,j.active,du) : adPage(j.a,j.fmt,du);
   const hp=`${TMP}/j.html`; fs.writeFileSync(hp,html);
   const w=1080,h=tall?1920:1350;
   shoot(hp,`${OUT}/${j.name}`,w,h);
   process.stderr.write(`[${i}/${list.length}] ${j.name}\n`);
 }
 console.log('DONE',list.length,'pngs');
}
run();
