import sharp from "sharp";
import { readdirSync } from "node:fs";
const dir = process.argv[2], saida = process.argv[3], W = Number(process.argv[4]||380);
const de = Number(process.argv[5]||0), ate = Number(process.argv[6]||99);
const files = readdirSync(dir).filter(f=>f.endsWith(".png")).sort().slice(de, ate);
if(!files.length){console.log("vazio");process.exit(0)}
const tiles = [];
for (const f of files) tiles.push(await sharp(`${dir}/${f}`).resize({width:W}).toBuffer());
const metas = await Promise.all(tiles.map(t=>sharp(t).metadata()));
const H = Math.max(...metas.map(m=>m.height));
await sharp({create:{width:W*tiles.length,height:H,channels:3,background:"#777"}})
  .composite(tiles.map((b,i)=>({input:b,left:i*W,top:0})))
  .jpeg({quality:80}).toFile(saida);
console.log(files.join(" | "));
