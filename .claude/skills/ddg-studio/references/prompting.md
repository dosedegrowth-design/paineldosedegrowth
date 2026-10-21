# Receitas de prompt (imagem, vídeo, áudio)

Prompt em **inglês** rende melhor em quase todos os modelos (Veo tem `enableTranslation`; os outros não). Copy/texto embutido em português só em `gpt-image-2` e `ideogram`.

## Estrutura de prompt de imagem (ordem importa)

```
[ASSUNTO principal, específico] + [AÇÃO/pose] + [CENÁRIO] + [LUZ] + [CÂMERA/lente/enquadramento] + [ESTILO/estética] + [PALETA] + [RESTRIÇÕES: no text, no logos, no watermark]
```

Exemplo hero de site (serviço local):
```
Wide photorealistic shot of a friendly female vehicle inspector in a navy uniform holding a tablet next to a generic silver SUV (no brand logo, blurred plate) inside a bright, clean inspection bay; soft daylight from skylights, subtle blue accent lighting; 35mm lens, eye level; large empty negative space on the left third for headline; corporate, trustworthy, modern; muted navy and white palette; no text, no watermark
```

Exemplo anúncio Meta (feed 4:5, ângulo "dor"):
```
Close-up of a worried man looking at a used car ad on his phone in a driveway at dusk, shallow depth of field, warm streetlight, candid documentary style, 50mm, natural skin, no text, no logos
```

Exemplo ícone (série consistente):
```
Flat minimal icon of a [car key], single-weight navy line, rounded corners, soft blue circular background, centered, generous padding, vector style, no text, no shadow
```
(repetir o mesmo prompt trocando só `[car key]` → série uniforme)

## Edição com referência (imagem→imagem)

Descreva **o que manter** e **o que mudar**. Modelos multi-referência (`nano-banana-2`, `seedream/5-pro`) aceitam 2 a 5 imagens: produto + cenário + estilo.

```
Keep the product from image 1 exactly as is (shape, label, colors). Place it on a marble kitchen counter with morning light, add a blurred plant in the background. Match the color grading of image 2. No text.
```

Gotchas:
- Referência precisa ser **URL pública** (o script faz upload de arquivo local automaticamente; link expira em 24h).
- Se o modelo "reinventar" o produto, troque pra `google/nano-banana-edit` (mais conservador) ou reduza o pedido a uma mudança por vez.
- Rosto de pessoa real do cliente: só com autorização, e avisar que o modelo pode alterar traços.

## Prompt de vídeo (imagem→vídeo)

O prompt descreve **movimento**, não a cena (a cena já está na imagem).

```
[MOVIMENTO DO SUJEITO] + [MOVIMENTO DE CÂMERA] + [RITMO] + [ATMOSFERA] + [o que NÃO mudar]
```

Exemplo:
```
The inspector slowly lifts the tablet and smiles; camera does a gentle dolly-in, slight parallax; slow, smooth, cinematic; keep the car, uniform and background unchanged; no text, no flicker
```

Vocabulário útil: `dolly in/out`, `slow orbit`, `pan left/right`, `tilt up`, `handheld subtle`, `static camera`, `rack focus`, `slow motion`, `seamless loop`, `no cuts`, `no camera shake`.

Loop: "seamless loop, ends exactly where it starts, slow drifting motion". Melhor ainda: mesmo frame no início e fim (ver formatos-e-canais.md).

Veo 3.1 (com áudio): descrever também o som. `"ambient garage sounds, soft tool clinks, no music, no dialogue"` ou diálogo curto entre aspas com o idioma: `She says in Brazilian Portuguese: "Sua vistoria pronta em 40 minutos."` (voz pode sair com sotaque; validar).

## Texto em imagem

- Texto curto (até 5 palavras) em `ideogram/v3` ou `gpt-image-2`: colocar entre aspas no prompt: `poster with the headline "VISTORIA EM 40 MIN" in bold condensed sans-serif`.
- Textos longos, CTA, preço: sempre em código/Figma sobre a imagem limpa.
- Português: `gpt-image-2` acerta acento na maioria das vezes; `ideogram` às vezes erra til/cedilha. Conferir letra por letra.

## Negative prompt (quando o modelo aceita: ideogram, wan)

`text, watermark, logo, extra fingers, deformed hands, blurry, low quality, oversaturated, stock photo look`

## Narração (ElevenLabs multilingual v2)

- Frases curtas. Vírgula = pausa curta, ponto = pausa média, reticências = pausa longa.
- Números por extenso ("quarenta minutos", não "40 min").
- `stability` 0.4 a 0.6 pra tom natural, 0.7+ pra institucional.
- `speed` 0.95 a 1.05. Pt-BR tende a soar rápido: 0.95.
- Testar 1 parágrafo no `turbo-2-5` (6 créditos/1k) antes de rodar o roteiro inteiro no `multilingual-v2`.

## Música (Suno)

Prompt = gênero + humor + instrumentos + BPM + uso. Ex.: `upbeat corporate pop, acoustic guitar and light synth, 110 bpm, optimistic, background music for a 30s ad, no vocals`. `instrumental: true` pra trilha. Vem 2 faixas por request: escolher 1.

## Iteração eficiente (política de gasto aplicada ao prompt)

1. 3 a 4 rascunhos ECO com prompts diferentes (ângulo, luz, enquadramento).
2. Mostrar ao responsável. Escolher 1.
3. Refinar o prompt escolhido (não recomeçar do zero) e gerar na camada PADRÃO.
4. Só sobe pra PREMIUM/4K a peça aprovada.
5. Vídeo: nunca texto→vídeo direto pra entrega. Imagem-chave aprovada → imagem→vídeo.
