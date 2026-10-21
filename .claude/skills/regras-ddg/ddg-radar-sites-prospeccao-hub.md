---
name: ddg-radar-sites-prospeccao-hub
description: "REGRA Lucas 21/09/2026 — site de PROSPECÇÃO do RADAR vai pro hub único sitesdosedegrowth-radar (1 repo + 1 Vercel, cliente em /<cliente>); só quando ele disser que é prospecção no RADAR, senão vale o processo padrão"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: bb3fcdc2-ea3c-4558-bd4f-6c1e5a962bb0
  modified: 2026-09-21T14:03:18.027Z
---

# Sites de prospecção do RADAR → hub único `sitesdosedegrowth-radar`

Quando o Lucas disser que um site é **pra prospecção no RADAR** (plataforma de prospecção da DDG),
ele NÃO ganha repo/projeto Vercel próprios. Vai pro hub:

- Pasta: `~/Antigravity/sitesdosedegrowth-radar/sites/<cliente>` (kebab-case)
- Repo: `github.com/dosedegrowth-design/sitesdosedegrowth-radar` (privado) · Vercel: projeto
  `sitesdosedegrowth-radar` no team Dose de Growth (conectado ao GitHub, `git push` = deploy)
- URL: `https://sitesdosedegrowth-radar.vercel.app/<cliente>`
- Cada site é um Next.js independente com `output: "export"`; `basePath` = nome da pasta
  (`SITE_BASE_PATH`), imagens SEMPRE via `asset("/fotos/x.jpg")` (`next/image` não aplica basePath),
  `robots.ts`/`sitemap.ts` com `dynamic = "force-static"`. `scripts/build.mjs` junta tudo em `dist/`.
- Hub inteiro é prévia: `hub/robots.txt` Disallow tudo + meta noindex em cada site.
- Comandos: `npm run dev -- <cliente> <porta>` · `npm run build -- <cliente>` ·
  `npm run novo -- <origem> <novo>` (clona um site como base).
- launch.json: entrada `radar-<cliente>` (ex.: `radar-lg-guinchos` na porta 3948).

**Why:** o Lucas quer todos os sites de prospecção centralizados ("fica mais simples"): um lugar só
pra achar, clonar e publicar, sem criar repo + projeto Vercel por lead. Ele interrompeu o deploy
avulso do LG Guinchos pra pedir isso.

**How to apply:** só usar o hub quando ele disser explicitamente que é prospecção no RADAR. Fora
isso, vale [[ddg-processo-padrao-site]] (pasta própria + repo próprio + Vercel próprio). Quando um
lead do hub fechar: copiar pra `~/Antigravity/<cliente>` no processo padrão, `SITE_BASE_PATH=""`,
`IS_PREVIEW=false`, domínio do cliente. Primeiro site do hub: [[lg-guinchos-site]].

Antes de mandar o link pro lead: validar o celular primeiro, ver [[ddg-site-mobile-primeiro]].


> ⚠️ 21/09/2026 (noite): o projeto Vercel `sitesdosedegrowth-radar` foi **apagado a pedido do Lucas** na limpeza da conta (ver [[vercel-ddg-hobby-bloqueio-fair-use]]). Os 4 sites (MJW, Guga, Lela, LG) saíram do ar; o código continua em `~/Antigravity/sitesdosedegrowth-radar`. Recriar o projeto na Vercel se voltar a usar.
