// A imagem de compartilhamento do site (app/tayssa/opengraph-image.jpg).
// Estática e em JPEG (~80 KB): o PNG que o Next gerava tinha 670 KB, e o
// WhatsApp deixa de mostrar a prévia com imagem pesada. Para refazer (foto
// nova da abertura, por exemplo):
//   node docs/tayssa/og-imagem.mjs /tmp/og.png
//   (converter para JPEG qualidade ~86 e salvar em app/tayssa/opengraph-image.jpg)
// "InterBold" é uma família própria de propósito: com a mesma família em
// peso 700 o Satori mede a palavra com a fonte fina e "Tayssa" invade "Lash".
import { createRequire } from "module";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
const require = createRequire(join(process.cwd(), "package.json"));
const { ImageResponse } = require("next/dist/compiled/@vercel/og/index.node.js");
const React = require("react");
const h = React.createElement;
const raiz = process.cwd();
const [foto, regular, negrito] = await Promise.all([
  readFile(join(raiz, "public/tayssa/photos/hero.jpg")),
  readFile(join(raiz, "node_modules/@fontsource/inter/files/inter-latin-400-normal.woff")),
  readFile(join(raiz, "node_modules/@fontsource/inter/files/inter-latin-700-normal.woff")),
]);
const el = h("div", { style: { width: "100%", height: "100%", display: "flex", background: "linear-gradient(135deg, #6c1529 0%, #4a0d1f 55%, #2c0712 100%)", color: "#fbf0f3", fontFamily: "Inter" } },
  h("div", { style: { flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 72px" } },
    h("div", { style: { fontSize: 22, letterSpacing: 6, color: "#e6c993", textTransform: "uppercase" } }, "Private Beauty Experience"),
    h("div", { style: { display: "flex", alignItems: "baseline", marginTop: 18, gap: 26 } },
      h("span", { style: { fontFamily: "InterBold", fontSize: 104, flexShrink: 0, fontWeight: 700, letterSpacing: -2, lineHeight: 1 } }, "Tayssa"),
      h("span", { style: { fontSize: 104, flexShrink: 0, fontWeight: 400, letterSpacing: -2, lineHeight: 1, color: "#e6c993" } }, "Lash")),
    h("div", { style: { fontSize: 34, marginTop: 28, color: "rgba(251, 240, 243, 0.82)", lineHeight: 1.3 } }, "Cílios e embelezamento do olhar"),
    h("div", { style: { display: "flex", marginTop: 40, width: 120, height: 2, background: "#e6c993" } })),
  h("img", { src: `data:image/jpeg;base64,${foto.toString("base64")}`, width: 420, height: 630, style: { width: 420, height: 630, objectFit: "cover" } })
);
const r = new ImageResponse(el, { width: 1200, height: 630, fonts: [{ name: "Inter", data: regular, weight: 400, style: "normal" }, { name: "InterBold", data: negrito, weight: 700, style: "normal" }] });
const buf = Buffer.from(await r.arrayBuffer());
await writeFile(process.argv[2], buf);
console.log("ok", buf.length);
