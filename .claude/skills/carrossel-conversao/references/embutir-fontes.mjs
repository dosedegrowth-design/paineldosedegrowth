import { createRequire } from 'module';
const require = createRequire('/home/user/paineldosedegrowth/');
const fs=require('fs'); const {execSync}=require('child_process');
const SP='/tmp/claude-0/-home-user-paineldosedegrowth/a7e39f73-9e96-5092-8195-f6ae070240e5/scratchpad';
const CSSURL='https://fonts.googleapis.com/css2?family=Anton&family=Archivo:wght@600;700;800&family=Inter+Tight:wght@400;500;600&display=swap';
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';
const css=execSync(`curl -s -H "User-Agent: ${UA}" "${CSSURL}"`,{maxBuffer:1e7}).toString();
// split into blocks by comment label, keep only /* latin */
const parts=css.split('/*');
let out=[];
for(const p of parts){
  const label=p.slice(0,p.indexOf('*/')).trim();
  if(label!=='latin') continue;
  const block=p.slice(p.indexOf('*/')+2);
  const fam=(block.match(/font-family:\s*'([^']+)'/)||[])[1];
  const wght=(block.match(/font-weight:\s*(\d+)/)||[])[1]||'400';
  const style=(block.match(/font-style:\s*(\w+)/)||[])[1]||'normal';
  const url=(block.match(/src:\s*url\(([^)]+)\)/)||[])[1];
  if(!fam||!url) continue;
  const b64=execSync(`curl -s "${url}"`,{maxBuffer:1e7});
  const data='data:font/woff2;base64,'+Buffer.from(b64).toString('base64');
  out.push(`@font-face{font-family:'${fam}';font-style:${style};font-weight:${wght};font-display:swap;src:url(${data}) format('woff2')}`);
  process.stderr.write(`${fam} ${wght} ${Math.round(b64.length/1024)}KB\n`);
}
fs.writeFileSync(SP+'/fonts-embed.css', out.join('\n'));
console.log('blocks:', out.length, 'size', Math.round(fs.statSync(SP+'/fonts-embed.css').size/1024)+'KB');
