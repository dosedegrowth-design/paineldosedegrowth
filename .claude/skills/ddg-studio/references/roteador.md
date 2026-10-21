# Roteador: do pedido ao modelo certo

Atualizado em 2026-10-16 com o catálogo oficial da kie.ai (157 modelos, 592 preços) e um teste real
de fotorrealismo e identidade (pasta `~/Claude/ddg-imagens/calibracao-2026-10-16`).
O mesmo roteador roda no CLI: `python3 kie.py route <intencao>` (mostra ECO, PADRÃO e PREMIUM com o comando pronto).

## 1. Como ler o pedido (traduzir a fala em intenção)

Leia o pedido procurando 5 sinais. Eles decidem tudo:

| Sinal | Perguntas que respondem | Exemplos de fala |
|---|---|---|
| **Mídia** | imagem, vídeo, áudio? | "arte", "foto", "post" = imagem · "reels", "vídeo", "animar" = vídeo · "locução", "jingle" = áudio |
| **Estilo** | foto real, ilustração, 3D, tipografia? | "extremamente realista", "parece foto", "hiper-real" = **realista** · "desenho", "3D", "cartoon" = **ilustracao** |
| **Referência** | tem foto de pessoa, produto, cena, estilo? E qual o PAPEL de cada uma? | "usa a foto dela" = **rosto** · "é esse produto" = **produto** · "nesse estilo" = estilo (vai no prompt, não é identidade) |
| **Texto na arte** | precisa sair escrito na imagem? | "com o preço", "com a frase", "banner com título" = **texto** (ou gerar limpo e aplicar texto em código) |
| **Som / fala** | o vídeo fala, tem música, ambiente? | "ela falando", "com narração", "com som" = **video-som** ou **avatar-falando** |

Depois, a **camada** pelo momento do trabalho:
- **ECO**: explorar, rascunho, "me mostra umas opções", ainda sem aprovação.
- **PADRÃO**: peça aprovada indo pra entrega (anúncio, post, site).
- **PREMIUM**: peça hero, campanha, cliente exigente. **Só com aprovação** (Lucas ou dono do projeto).

Regra que nunca muda: **rosto ou produto de verdade nunca vão pro modelo lite**, nem em rascunho.

## 2. Tabela do roteador (imagem)

| Intenção | ECO | PADRÃO | PREMIUM |
|---|---|---|---|
| **rascunho** (não sei o que quero) | `z-image` 0,8 | `seedream/5-flash-text-to-image` 2K 3,24 | `nano-banana-2-1` 1K 4 |
| **realista** (foto sem referência) | `seedream/5-flash-text-to-image` 2K 3,24 | **`nano-banana-2-1` 2K 6** | **`nano-banana-pro` 2K 18** (4K 24) |
| **rosto** (pessoa da foto enviada) | `nano-banana-2-1` 1K 4 | `nano-banana-2-1` 2K 6 (alt. `nano-banana-2` 12) | `nano-banana-pro` 2K 18 (alt. `gpt-image-2-5-sunburst-image-to-image` 10) |
| **produto** (tem que ficar idêntico) | `nano-banana-2-1` 1K 4 | `seedream/5-pro-image-to-image` 2K 14 | `nano-banana-pro` 2K 18 |
| **publicidade** (lifestyle, moda, campanha) | `seedream/5-flash-text-to-image` 3,24 | `seedream/5-pro-text-to-image` 2K 14 | `nano-banana-pro` 2K 18 |
| **texto** (tipografia, infográfico, layout com copy) | `ideogram/v3-text-to-image` TURBO 3,5 | `gpt-image-2-5-sunburst-text-to-image` 2K 10 | idem 4K 16 · ou ideogram QUALITY 10 |
| **ilustracao** (3D, cartoon, flat) | `seedream/5-flash-text-to-image` 3,24 | `nano-banana-2-1` 2K 6 | `nano-banana-pro` 2K 18 |
| **logo-icone** (base pra vetorizar) | ideogram TURBO + `style: DESIGN` 3,5 | `gpt-image-2-5-sunburst-text-to-image` + `background: transparent` 10 | ideogram QUALITY + DESIGN 10 |
| **personagem** (mascote recorrente) | `ideogram/character` TURBO 12 | BALANCED 18 | QUALITY 24 |
| **edicao** (troca fundo, cor, remove objeto) | `google/nano-banana-edit` 4 | `nano-banana-2-1` 2K 6 | `gpt-image-2-5-sunburst-image-to-image` 10 |
| **edicao-regiao** (só um pedaço) | `grok-imagine-image-2-0/segment-map` 0 | `grok-imagine-image-2-0/segment-edit` 4 | `nano-banana-pro` 18 |
| **composicao** (3+ referências na mesma cena) | `nano-banana-2-1` 1K 4 (até 10 refs) | `nano-banana-2-1` 2K 6 | `gpt-image-2-5-sunburst-image-to-image` 10 (até 16 refs) |
| **camadas** (separar fundo/objetos) | `seedream/5-flash-layer-decomposition` 3,24 | `seedream/5-pro-layer-decomposition` 2K 14 | idem |
| **remover-fundo** | `recraft/remove-background` 1 | idem | gpt-image 2.5 com `background: transparent` 10 |
| **upscale** | `recraft/crisp-upscale` 0,5 | `topaz/image-upscale` 2K 10 | `topaz/image-upscale` 4K 20 (8K 40) |

Apelidos que o CLI entende: foto, ultra-realista, fotorrealista, hiper-realista → realista · pessoa, modelo → rosto ·
anuncio, criativo, lifestyle → publicidade · tipografia, lettering, infografico → texto · 3d, cartoon → ilustracao ·
mascote → personagem · logo, icone → logo-icone · colagem → composicao.

## 3. Tabela do roteador (vídeo) · padrão DDG: 5 s, 720p, sem som

| Intenção | ECO | PADRÃO | PREMIUM |
|---|---|---|---|
| **video** (imagem aprovada → movimento) | `runway` 12 por 5 s | `kling/v3-turbo-image-to-video` 90 | `kling-3.0/video` pro 90 (135 com som) |
| **video-rascunho** (testar movimento) | `grok-imagine-video-1-5-preview` 480p 12 | `bytedance/v1-pro-fast-image-to-video` 16 | `pixverse-v6/image-to-video` 36 |
| **video-realista** (pessoas, cinema) | `minimax-h3/image-to-video` 40 | `kling/v3-turbo-image-to-video` 90 | `happyhorse-1-1/image-to-video` 1080p 145 · ou `veo3` com som |
| **video-som** (fala, ambiente, diálogo) | `veo3_lite` 30 por 8 s | `veo3_fast` 60 por 8 s · alt. `vidu-q4` 15,2/s | `veo3` 255 por 8 s |
| **video-personagem** (mesma pessoa em vários clipes) | `bytedance/seedance-2-mini` `--mode reference` 41 | `vidu-q4/reference-to-video` 76 (15 refs + voz) | `kling-3.0-omni/reference-to-video` 1080p 90 |
| **video-multishot** (várias cenas num job) | `wan/2-6-flash-image-to-video` `multi_shots` 40 por 10 s | `kling-3.0/video` `multi_shots` 70 a 135 | `kling-3.0-omni/image-to-video` `customize_multi_shots` |
| **video-transicao** (primeiro + último frame) | `pixverse-v6/transition` 36 | `minimax-h3/image-to-video` 40 | `kling-3.0-omni/image-to-video` 1080p 90 |
| **avatar-falando** (foto + áudio = boca mexendo) | `infinitalk/from-audio` 480p 3/s | `kling/ai-avatar-standard` 8/s (até 5 min) | `omnihuman-1-5` 27/s · alt. `kling/ai-avatar-pro` 16/s |
| **dublar-video** (trocar a fala de um vídeo) | `volcengine/video-to-video-lip-sync` lite 8/s | idem `basic` (várias pessoas) | idem |
| **mover-personagem** (copiar movimento de um vídeo) | `wan/2-2-animate-move` 6 a 12,5/s | `kling-3.0/motion-control` 20/s | idem 1080p 27/s |
| **editar-video** (trocar estilo, objeto, clima) | `wan/2-6-flash-video-to-video` 20 por 5 s | `kling-3.0-omni/transformation` 20/s | `happyhorse/video-edit` 28/s · runway aleph 110 |
| **video-longo** (até 30 s) | `wan/3-0-video` 480p 8/s | `wan/3-0-video` 720p 16/s | `bytedance/seedance-2-5` 63/s (usar `draft` antes) |
| **upscale-video** | `grok-imagine/upscale` 10 a 30 | `topaz/video-upscale` 2x 8/s | 4x 14/s |

Apelidos: reels, b-roll → video · cinema, cinematografico → video-realista · fala, audio → video-som ·
lip-sync, avatar → avatar-falando.

## 4. Áudio

| Intenção | ECO | PADRÃO | PREMIUM |
|---|---|---|---|
| **narracao** pt-BR | `google/gemini-3-8-flash-lite-tts` (centavos) | `elevenlabs/text-to-speech-multilingual-v2` + `language_code: pt` 12/1.000 caracteres | `elevenlabs/text-to-dialogue-v3` 14/1.000 |
| **diálogo 2 vozes** | `google/gemini-3-8-flash-tts` (`speakers` + `dialogue_turns`) | `elevenlabs/text-to-dialogue-v3` | idem |
| **musica** / jingle / trilha | Suno 12 (2 faixas) | Suno V5 | Suno V5_5 + extend/stems |
| **efeito sonoro** | Suno `generate-sounds` 2,5 | | |
| **limpar voz** | `elevenlabs/audio-isolation` | | |

## 5. O que o teste de 16/10 provou (mesmo prompt em 9 modelos, 3:4)

| Modelo | Créditos | Resultado |
|---|---|---|
| Nano Banana Pro 2K | 18 | O mais "pessoa real": acne, frizz, luz de galpão crível. Premium de realismo. |
| Nano Banana 2 2K | 12 | Foto documental excelente, mas pôs placas legíveis no fundo (ignorou parte do "no text"). |
| **Nano Banana 2.1 2K** | **6** | **Mesmo nível do Nano Banana 2 pela metade do preço**, sem texto indevido. Vira o padrão. |
| GPT Image 2.5 Sunburst 2K | 10 | Pele boa, composição de banco de imagem. Melhor uso: texto e edição. |
| Seedream 5 Pro 2K | 14 | Acabamento editorial bonito, mas **inventou bandeira no uniforme** (desobedeceu "no logos"). Conferir logo sempre. |
| Seedream 5 Flash 2K | 3,24 | Muito bom pelo preço; sardas exageradas de perto. Ótimo rascunho em 2K. |
| Flux 2 Pro 2K | 7 | Correto, pessoa pequena no quadro. Sem vantagem clara. |
| Imagen 4 Ultra / Fast | 12 / 4 | **Saem só em 864×1152** mesmo pedindo mais. Fora do roteador de realismo. |

Teste de identidade (foto de referência → cena nova): Nano Banana 2.1 e 2 mantiveram o mesmo rosto, cabelo e corpo.
Com a instrução "Reference image 1 is the person: keep her exact face... (same identity)" no prompt.

## 6. Regras de prompt que fazem o roteador funcionar

- **Papel de cada referência no prompt**, sempre: "Reference image 1 is the person: keep her exact face, facial features,
  skin tone, hair texture and body type (same identity). Reference image 2 is the product: keep label and shape exactly."
- **Realismo**: descrever câmera e luz (lente 35mm, f/2.8, luz natural lateral, grão leve), imperfeições ("visible skin
  texture, flyaway hair, realistic hands") e o que NÃO quer ("no text, no logos, no license plate").
- **Rascunho e final com as mesmas referências originais**. Nunca usar só o rascunho como referência da final.
- **Conferir sempre**: mãos, texto indevido, logo inventado, placa legível, produto diferente da referência.
- Modelo que não aceita uma proporção: o CLI para com a lista oficial (não queima tentativa).

## 7. Quando um modelo novo aparecer

1. `python3 kie.py models <termo>` e `python3 kie.py info <modelo>` (campos e preço oficiais).
2. Se não estiver lá: atualizar o catálogo (script em `references/api.md`, seção "Atualizar catálogo").
3. Testar contra o atual da mesma intenção com o MESMO prompt (custo baixo) e só então trocar no `ROUTER` do `kie.py`
   e nesta página.
