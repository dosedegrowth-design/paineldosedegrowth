# Catálogo completo kie.ai (2026-10-16)

Fonte oficial: `api.kie.ai/client/v1/model-pricing/page` (592 preços: 124 imagem, 347 vídeo, 31 áudio, 90 chat) e
OpenAPI de `docs.kie.ai` (157 modelos do Market). Tabelas brutas: `precos-kie-2026-10-16.json` e `modelos-kie.json`.
**Qual usar em cada situação: `roteador.md`** (esta página é o mapa do que existe).
1 crédito = US$ 0,005. Job que falha não cobra. Campos exatos de qualquer modelo: `python3 kie.py info <id>`.

Legenda: ★ = está no roteador da DDG · ⚠ = cuidado/saindo.

## IMAGEM (por imagem)

### Google
| id | créditos | refs | notas |
|---|---|---|---|
| ★ `nano-banana-2-1` | 1K 4 · 2K 6 · 4K 9 | `image_input` até 10 | **Padrão DDG** desde 16/10. Mesmo nível do NB2 pela metade. Proporções 1:8 a 8:1 |
| ★ `nano-banana-pro` | 1K/2K 18 · 4K 24 | `image_input` até 8 | Premium de realismo e identidade |
| `nano-banana-2` | 8 · 12 · 18 | `image_input` até 10 | Superado pelo 2.1 (alternativa) |
| `nano-banana-2-lite` | 4 | `image_urls` até 10 | Sem resolução. **Nunca com rosto/produto** |
| ★ `google/nano-banana-edit` | 4 | `image_urls` | Edição rápida |
| `google/nano-banana` | 4 | | Geração antiga |
| `google/imagen4-fast` / `imagen4` / `imagen4-ultra` | 4 / 8 / 12 | não edita | ⚠ saída só 864×1152. `negative_prompt` |

### ByteDance Seedream
| id | créditos | refs | notas |
|---|---|---|---|
| ★ `seedream/5-flash-text-to-image` / `-image-to-image` | 3,24 (1K, 1,5K, 2K mesmo preço) | `image_urls` até 10 | Melhor custo em 2K. Campo `size` |
| ★ `seedream/5-flash-layer-decomposition` | 3,24 | | Separa camadas |
| ★ `seedream/5-pro-text-to-image` / `-image-to-image` | basic 7 · high 14 | `image_urls` até 10 | Editorial/publicidade. Campo `quality` (CLI: 1K=basic, 2K=high). Pode inventar logo |
| `seedream/5-pro-layer-decomposition` | 7 · 14 | | |
| `seedream/5-lite-*` | 5,5 | | |
| `seedream/4.5-*` · `bytedance/seedream-v4-*` · `bytedance/seedream` (3.0) | 6,5 · 5 · 3,5 | | Gerações antigas |

### OpenAI GPT Image
| id | créditos | refs | notas |
|---|---|---|---|
| ★ `gpt-image-2-5-sunburst-text-to-image` / `-image-to-image` | 1K 6 · 2K 10 · 4K 16 | `input_urls` até 16 | Melhor tipografia, preserva pessoa entre edições, `background: transparent`. Proporções extras 27:16, 9:8 |
| `gpt-image-2-5-flare-*` | 6 · 10 · 16 | `input_urls` | Variante mais "criativa" do 2.5 |
| `gpt-image-2-text-to-image` / `-image-to-image` | 6 · 10 · 16 | `input_urls` até 16 | |
| `gpt-image/1.5-*` | medium 4 · high 22 | | |

### Ideogram
| id | créditos | notas |
|---|---|---|
| ★ `ideogram/v3-text-to-image` · `v3-edit` · `v3-remix` | TURBO 3,5 · BALANCED 7 · QUALITY 10 | `image_size` (square_hd, portrait_16_9...), `style` AUTO/GENERAL/REALISTIC/DESIGN |
| ★ `ideogram/character` · `character-edit` · `character-remix` | 12 · 18 · 24 | Personagem fixo a partir de 1 foto (`reference_image_urls`) |

### Outros
| id | créditos | notas |
|---|---|---|
| ★ `z-image` | 0,8 | Rascunho em massa |
| `flux-2/pro-text-to-image` / `pro-image-to-image` | 1K 5 · 2K 7 | `input_urls` |
| `flux-2/flex-*` | 14 · 24 | Lento e caro |
| `qwen3/pro-*` · `qwen3/*` | 6,4/12 · 4,8 | Layout estruturado. AR vai em `image_size` |
| `qwen2-1/*` · `qwen2/*` · `qwen/*` | 4/8 · 5,6 · 4 | |
| ★ `grok-imagine-image-2-0/segment-map` + `segment-edit` | 0 + 4 | Edição por região |
| `grok-imagine-image-2-0/text-to-image` / `image-edit` · `grok-imagine/*` | 4 | |
| `wan/2-7-image` · `wan/2-7-image-pro` | 4,8 · 12 | Pro tem `color_palette`, `bbox_list`, `thinking_mode` |
| ★ `recraft/remove-background` · `recraft/crisp-upscale` | 1 · 0,5 | Campo `image` |
| ★ `topaz/image-upscale` | 2K 10 · 4K 20 · 8K 40 | `upscale_factor` |
| legado: `/api/v1/gpt4o-image/generate` (6) · `/api/v1/flux/kontext/generate` (pro 5, max 10) | | Preferir os do Market |

## VÍDEO

### Google (Veo e Gemini Omni)
| id | créditos | notas |
|---|---|---|
| ★ `veo3_lite` / `veo3_fast` / `veo3` (endpoint `/api/v1/veo/generate`) | por 8 s: lite 30/35/150 · fast 60/65/180 · quality 250/255/370 (720p/1080p/4K) | Áudio nativo. Text, image (1 a 3 refs), first+last frame. Extend 30/60/250, get-1080p 5, get-4k 120 |
| `google/gemini-omni-flash-1-1` · `gemini-omni-video` | 4 s 63 · 6 s 84 · 8 s 105 · 10 s 126 (4K +84; com vídeo de entrada 168) | Preço fixo por clipe, com som. Aceita `character_ids` e `audio_ids` (criados em `/api/v1/omni/character/create` e `/api/v1/omni/audio/create`) |

### Kling
| id | créditos | notas |
|---|---|---|
| ★ `kling/v3-turbo-image-to-video` / `text-to-video` | 720p 18/s · 1080p 22,5/s | **Padrão de entrega**. 3 a 15 s |
| ★ `kling-3.0/video` | sem som 14/18/67 por s · com som 20/27/67 (std/pro/4K) | Multi-shot (até 6 cenas), `kling_elements`. Campo `mode` |
| ★ `kling-3.0-omni/text-to-video` · `image-to-video` · `reference-to-video` | sem som 14/18/67 · com som 18/23/67 | Omni: 1 ou 2 frames, até 7 refs, `elements`, multi-shot com roteiro |
| ★ `kling-3.0-omni/transformation` | 20/27/67 por s | Vídeo → vídeo |
| ★ `kling-3.0/motion-control` · `kling-2.6/motion-control` | 20/27 · 11/18 por s | Copiar movimento de um vídeo |
| ★ `kling/ai-avatar-standard` · `ai-avatar-pro` | 8/s · 16/s | Avatar falando, áudio até 5 min |
| `kling-2.6/*` · `kling/v2-5-turbo-*-pro` · `kling/v2-1-*` | 55 a 320 por clipe | Gerações antigas |

### ByteDance Seedance
| id | créditos por s | notas |
|---|---|---|
| ★ `bytedance/seedance-2-mini` | 480p 3,8 · 720p 8,2 | Frames ou até 9 refs (imagem/vídeo/áudio) |
| `bytedance/seedance-2-fast` | 11,7 · 24,8 | |
| `bytedance/seedance-2` | 19 · 41 · 102 · 4K 208 | |
| ★ `bytedance/seedance-2-5` | 28 · 63 · 158 | Até 30 s, 30 refs, `draft` (480p barato) → `seedance-2-5-draft` finaliza em 1080p |
| `bytedance/v1-pro-fast-image-to-video` | 16 por 5 s 720p | Rascunho barato |
| `bytedance/v1-pro-*` · `v1-lite-*` | 2,8/6/14 · 2/4,5/10 | |
| ⚠ `bytedance/seedance-1.5-pro` | 1,75 a 15 | **Sai do ar em 11/11/2026** |

### Alibaba Wan e HappyHorse
| id | créditos | notas |
|---|---|---|
| ★ `wan/3-0-video` · `wan/3-0-video-prime` | 8/16/32 por s · 12,2/25,2/50,4 | 2 a 30 s, áudio, refs de imagem/vídeo/áudio, até de link ou arquivo |
| ★ `wan/2-6-flash-image-to-video` / `video-to-video` | 20 por 5 s 720p (x2 com som) | `multi_shots`, até 15 s |
| `wan/2-7-*` (t2v, i2v, r2v, videoedit) | 16/24 por s | first/last frame, `driving_audio_url` |
| `wan/2-6-*` · `wan/2-5-*` · `wan/2-2-*` | 60 a 315 por clipe | Antigos. `2-2-animate-move/replace` (6 a 12,5/s) ainda úteis |
| ★ `happyhorse-1-1/image-to-video` · `text-to-video` · `reference-to-video` | 720p 22,5 · 1080p 29 por s | Realismo cinematográfico, até 9 refs |
| `happyhorse/*` (1.0) incl. `video-edit` | 28 · 48 por s | |

### Outros vídeo
| id | créditos | notas |
|---|---|---|
| ★ `runway` (endpoint próprio) | 12 por 5 s 720p · 30 (10 s ou 1080p) | Mais barato. Extend 12/30. Aleph (v2v) 110 |
| ★ `vidu-q4/image-to-video` · `reference-to-video` | 540p 7,2 · 720p 15,2 · 1080p 19,2 · 2K 30,4 · 4K 62,4 por s | Áudio sincronizado (padrão ligado), 3 a 16 s, até 15 refs + 3 áudios |
| ★ `minimax-h3/*` (t2v, i2v, r2v) | 768P 8 · 2K 13 por s | Pessoas e expressão, first+last frame |
| `hailuo/2-3-image-to-video-standard` / `-pro` | 30 a 90 por clipe | Duração só 6 ou 10 s |
| ★ `pixverse-v6/*` (t2v, i2v, transition, reference, extend) | 360p 4 · 540p 5,6 · 720p 7,2 · 1080p 14,4 por s (com som 5,6 a 18,4) | Campo `quality`, templates |
| ★ `grok-imagine-video-1-5-preview` · `grok-imagine/*` | 480p 2,4 · 720p 4,5 · 1080p 8 por s | Rascunho barato. Extend e upscale |
| ★ `omnihuman-1-5` | 27/s | Avatar mais natural (foto + áudio < 60 s) |
| ★ `infinitalk/from-audio` | 480p 3 · 720p 12 por s | Lip sync barato |
| ★ `volcengine/video-to-video-lip-sync` | 8/s | Dublar vídeo existente (`mode` lite/basic) |
| ★ `topaz/video-upscale` | 2x 8/s · 4x 14/s | |

## ÁUDIO

| id | créditos | notas |
|---|---|---|
| ★ `elevenlabs/text-to-speech-multilingual-v2` | 12 por 1.000 caracteres | pt-BR com `language_code: pt`. 67 vozes (ids no enum; `kie.py info`) |
| `elevenlabs/text-to-speech-turbo-2-5` | 6 por 1.000 | |
| ★ `elevenlabs/text-to-dialogue-v3` | 14 por 1.000 | Emoção, várias vozes |
| `elevenlabs/audio-isolation` | | Limpar voz |
| ★ `google/gemini-3-8-flash-tts` · `-lite-tts` · `gemini-3-1-flash-tts` · `gemini-2-5-pro-tts` | por token (1 min ≈ 2 a 4 cr) | `speakers` + `dialogue_turns`, até 2 vozes |
| ★ Suno (`/api/v1/generate`) | 12 (2 faixas) | Extend 12, cover 12, stems 10 a 50, sons 2,5, letra 0,4, wav 0,4, clipe 2, persona, mashup |

## CHAT (fora do escopo criativo)
Claude, GPT, Gemini, Grok, DeepSeek, Kimi via kie (90 preços). Não substitui a API oficial da Anthropic nos produtos DDG.
