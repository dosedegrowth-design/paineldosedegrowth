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

## Extrair frame de vídeo (quando tiver ffmpeg)
Os vídeos do cliente (pasta VÍDEOS EDITADOS) têm ótimos movimentos. Com ffmpeg:
`ffmpeg -ss <tempo> -i video.mp4 -frames:v 1 -q:v 2 frame.jpg`, depois passo 3. Neste ambiente
remoto o ffmpeg não está instalado e o download do vídeo é pesado; preferir gerar/stock por ora.
