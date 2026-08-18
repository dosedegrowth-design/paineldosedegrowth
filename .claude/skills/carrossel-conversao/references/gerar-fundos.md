# Fundos fotográficos reais no carrossel (sem crédito de stock, sem rosto)

A prévia web (artifact) só aceita imagem **embutida** (data URI) — bloqueia imagem externa. E os
JPEGs originais do Drive (8–15 MB) não dá pra puxar pra cá. Solução que funciona e impacta:
**gerar fundos por IA (Maginific) ou baixar stock livre, otimizar com `sharp` e embutir como data URI.**

## Pipeline (testado, funciona neste ambiente)

1. **Gerar** os fundos no Maginific (`images_generate`), 1 por cena, `aspectRatio:"4:5"`.
   - Prompt sempre: cena de movimento + **"NO face visible"** + "dark moody cinematic, deep teal and
     dark green tones" (casa com a paleta). Ex.: mão no pescoço, ajuste na coluna, mão na lombar,
     consultório vazio, pessoa sentada no desk vista de trás.
   - Custo: ~60 créditos por imagem (conta Maginific da DDG). Avise o cliente antes.
   - Depois `creations_wait` pelos identifiers → pega o `url` de cada.
2. **Conferir** (obrigatório): `curl` os `url` pra disco, gerar preview 360px com `sharp` e **Read**
   pra garantir que não aparece rosto e a qualidade tá boa (mão de IA às vezes sai torta; como é
   fundo escuro sob texto, imperfeição some, mas cheque).
3. **Otimizar + embutir:** `sharp().resize(760,950,{fit:'cover',position:'attention'})`
   `.modulate({brightness:0.94}).jpeg({quality:64,mozjpeg:true})` → base64 → injeta num template HTML
   que tem tokens `__BG1__`..`__BGn__` em `:root{ --bgN:url("__BGN__") }`. ~20–27 KB por foto.
4. **Publicar** o HTML final como artifact.

Alternativa a (1): stock livre pra uso comercial (sem key) via Openverse API
(`https://api.openverse.org/v1/images/?q=physiotherapy+back`), `curl` do `url`, mesmo passo 3.
O cliente autorizou "fotos da web, sem rosto, só movimento".

## Regras de fundo
- **Sem rosto.** Só movimento/mão/ambiente. Paciente de bruços ou de costas.
- Escuro + teal, pra casar com a paleta e deixar o texto branco legível.
- Sempre `.scrim` (gradiente escuro embaixo) + `text-shadow` no título e apoio.

## CTA fino (pedido do cliente)
Nada de botão gordo. Pílula **fina e pequena** no rodapé: `padding:6px 12px; font-size:12px;
font-weight:600; border:1px solid` translúcido. WhatsApp = verde translúcido + logo pequeno.
Sem número (é anúncio linkado). Carrossel de prevenção pode ser só "Agende sua avaliação".

## Usar foto que o cliente COLOU no chat (funciona!)
Imagem colada no chat não vira arquivo no disco, MAS fica no transcript da sessão em base64.
Extraia assim (é a forma real de usar as fotos reais que o cliente manda aqui):
```
JL=/root/.claude/projects/<proj>/<sessao>.jsonl
node -e "const fs=require('fs');JSON... percorre linhas, message.content[].type==='image',
  source.data (base64) -> fs.writeFileSync('real.webp', Buffer.from(data,'base64'))"
```
Depois trata com sharp e embute como as outras. Foi assim que embutimos o consultório real do Dr. Samuel.
Então PODE pedir pro cliente colar fotos aqui (consultório, ele atendendo, retrato) que dá pra usar de verdade.

## Regra dura de ZERO rosto (aprendido na marra)
Fundo com rosto de estranho estraga: parece que não é o profissional. O modelo INSISTE em botar a
pessoa e o rosto em cenas de "adjustment". Para forçar sem rosto:
- Use "extreme close-up macro", "only forearms and hands and the back", "absolutely NO heads, NO faces,
  NO shoulders of any person in the frame". Enquadrar só mão+região tratada.
- Paciente sempre de bruços ou de costas (nuca/costas, nunca rosto).
- Gere `count:2` e escolha a limpa. SEMPRE confira: monte um contact sheet com sharp e Read, ou
  screenshot do artifact com o Chromium headless (`/opt/pw-browsers/chromium-1194/chrome-linux/chrome
  --headless=new --no-sandbox --window-size=1180,3400 --screenshot=out.png file://...`). Recorte faixas
  com sharp `.extract()` e Read pra validar rosto + colisão de texto antes de publicar.

## Gotchas de layout (validados por screenshot)
- `<meta charset="utf-8">` no topo (sem ele o Chromium local mostra acento quebrado).
- NÃO use `grid-template-rows:minmax(42%,1fr) auto` no card: empurra título longo pra cima e colide.
  Use `1fr auto` + `.headline{font-size:clamp(17px,4.8vw,21px);line-height:1.05}` (título curto embaixo).

## Extrair frame de vídeo (ffmpeg ESTÁ disponível)
`/opt/pw-browsers/ffmpeg-1011/ffmpeg-linux` existe neste ambiente.
Os vídeos do cliente (pasta VÍDEOS EDITADOS) têm ótimos movimentos. Com ffmpeg:
`ffmpeg -ss <tempo> -i video.mp4 -frames:v 1 -q:v 2 frame.jpg`, depois passo 3. Neste ambiente
remoto o ffmpeg não está instalado e o download do vídeo é pesado; preferir gerar/stock por ora.

## Exportar PNG final (1080x1350 feed / 1080x1920 reels) e empacotar
As artes viram arquivo de verdade pro cliente (o link do artifact NAO serve pra mandar/organizar no Drive).
Pipeline (scripts nesta pasta):
1. `embutir-fontes.mjs`: baixa Anton/Archivo/Inter Tight do Google Fonts e gera `fonts-embed.css` (data-URI).
   OBRIGATORIO: o Chromium headless local NAO carrega Google Fonts, entao os titulos saem em serifa se nao embutir.
2. `exportar-pngs.mjs`: para cada card/criativo gera um HTML de tamanho exato (unidades vw, fundo em data-URI,
   fontes embutidas) e tira screenshot com o Chromium headless em `--window-size=1080,1350` (ou 1080,1920 reels),
   `--force-device-scale-factor=1 --virtual-time-budget=3500`. Confira 2 amostras com Read antes de rodar tudo.
3. `empacotar-zip.mjs`: converte pra JPG q86, nomeia por carrossel/criativo e monta pastas "Carrosseis" e
   "Reels e Feed", depois `zip -r`. Entrega via SendUserFile (nao dá pra subir 44 base64 no Drive via MCP: caro).
