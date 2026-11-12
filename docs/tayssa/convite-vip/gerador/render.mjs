import { createRequire } from 'module'; import http from 'http'; import fs from 'fs'; import path from 'path';
const { chromium } = createRequire(import.meta.url)('playwright'); const DIR = path.dirname(new URL(import.meta.url).pathname);
const T = { '.html':'text/html; charset=utf-8', '.css':'text/css', '.png':'image/png', '.jpg':'image/jpeg', '.woff2':'font/woff2' };
const srv = http.createServer((q, r) => { const f = path.join(DIR, decodeURIComponent(new URL(q.url,'http://x').pathname)); if (!f.startsWith(DIR) || !fs.existsSync(f)) { r.writeHead(404); return r.end(); } r.writeHead(200, {'Content-Type': T[path.extname(f)] || 'application/octet-stream'}); fs.createReadStream(f).pipe(r); });
await new Promise(r => srv.listen(0, '127.0.0.1', r));
const b = await chromium.launch(); const p = await (await b.newContext({ viewport:{width:1080,height:1350}, deviceScaleFactor:2 })).newPage();
await p.goto(`http://127.0.0.1:${srv.address().port}/card.html`); await p.waitForSelector('body[data-ready="1"]'); await p.waitForTimeout(150);
fs.mkdirSync(DIR + '/out', { recursive: true }); await p.screenshot({ path: DIR + '/out/convite-vip-2x.png' }); await b.close(); srv.close(); console.log('ok');
