# kie.ai: referência técnica

Docs: https://docs.kie.ai (índice completo em https://docs.kie.ai/llms.txt; cada página `.md` traz o OpenAPI do modelo). Painel: https://kie.ai/api-key · logs de uso: https://kie.ai/logs · preços: https://kie.ai/pricing

## Autenticação

`Authorization: Bearer <KIE_API_KEY>` em toda chamada. Chave da DDG em `~/.ddg-studio/.env` (ou env `KIE_API_KEY`). Nunca em código de cliente, repositório ou print.

## Padrão assíncrono (todos os modelos)

1. `POST` cria a tarefa → responde `{"code":200,"data":{"taskId":"..."}}`. **200 = tarefa criada, não concluída.**
2. Poll no endpoint de status a cada 6 a 10 s, ou receber `callBackUrl`.
3. Resultado vem como URL temporária (**14 dias**, uploads só 24h). Baixar sempre. O arquivo local é a cópia oficial.

Erros comuns: `401` chave errada · `402` sem créditos · `422` parâmetro inválido (conferir nome do campo no doc do modelo) · `429` rate limit (~20 req / 10 s) · `501` geração falhou (sem cobrança).

## Famílias de endpoint (4 formatos diferentes, atenção)

### 1. Market (maioria: nano-banana, seedream, flux-2, gpt-image, ideogram, kling, seedance, wan, pixverse, grok, minimax, hailuo, topaz, recraft, elevenlabs)
```
POST https://api.kie.ai/api/v1/jobs/createTask
{ "model": "<id>", "input": { ...campos do modelo... }, "callBackUrl": "opcional" }

GET  https://api.kie.ai/api/v1/jobs/recordInfo?taskId=<id>
data.state: waiting | queuing | generating | success | fail
data.resultJson: string JSON → {"resultUrls":[...]}
data.creditsConsumed, data.costTime (s), data.failMsg
```
Nome do campo de referência varia: `image_urls` (nano-banana-2-lite, nano-banana-edit, seedream, gpt-image-2, kling, pixverse, grok, minimax), `image_input` (nano-banana-2), `input_urls` (flux-2), `first_frame_url`/`last_frame_url` (wan 2.7, seedance), `reference_image_urls` (seedance modo referência), `image_url` (hailuo, topaz), `image` (recraft).
Resolução: `resolution` "1K/2K/4K" (imagem) ou "480p/720p/1080p" (vídeo); pixverse usa `quality`. Ideogram usa `image_size` (square_hd, portrait_16_9, landscape_16_9...) e `rendering_speed` (TURBO/BALANCED/QUALITY).

### 2. Veo 3.1 (Google)
```
POST https://api.kie.ai/api/v1/veo/generate
{ "prompt", "model": "veo3_lite|veo3_fast|veo3", "aspect_ratio": "16:9|9:16|Auto",
  "resolution": "720p|1080p|4k", "duration": 4|6|8, "imageUrls": [1 a 3],
  "generationType": "TEXT_2_VIDEO|FIRST_AND_LAST_FRAMES_2_VIDEO|REFERENCE_2_VIDEO",
  "enableTranslation": false, "watermark": "" }
GET  https://api.kie.ai/api/v1/veo/record-info?taskId=
data.successFlag: 0 gerando · 1 sucesso · 2/3 falha ; data.response.resultUrls
Extras: /api/v1/veo/extend, /api/v1/veo/get-1080p-video (5 cr), /api/v1/veo/get-4k-video (120 cr)
```

### 3. Suno (música)
```
POST https://api.kie.ai/api/v1/generate
{ "prompt", "customMode": bool, "instrumental": bool, "model": "V4_5|V4_5PLUS|V5|V5_5",
  "style", "title", "negativeTags", "vocalGender", "callBackUrl" (obrigatório no doc) }
GET  https://api.kie.ai/api/v1/generate/record-info?taskId=
data.status: PENDING | TEXT_SUCCESS | FIRST_SUCCESS | SUCCESS | *_FAILED ; data.response.sunoData[{audioUrl,imageUrl,title,duration}]
Outros: /api/v1/lyrics, /api/v1/generate/extend, /api/v1/vocal-removal/generate, /api/v1/wav/generate
```

### 4. Runway
```
POST https://api.kie.ai/api/v1/runway/generate
{ "prompt", "imageUrl" (opcional), "duration": 5|10, "quality": "720p|1080p", "aspectRatio": "16:9|9:16|1:1|4:3|3:4", "waterMark": "" }
GET  https://api.kie.ai/api/v1/runway/record-detail?taskId=
data.state: wait | queueing | generating | success | fail ; data.videoInfo.videoUrl
Aleph (vídeo→vídeo): POST /api/v1/runway/generate-aleph
```

Legados ainda no ar: `POST /api/v1/gpt4o-image/generate` (4o Image) e `POST /api/v1/flux/kontext/generate` (`model: flux-kontext-pro|max`, `inputImage`). Preferir os equivalentes do Market.

## Upload de arquivo (grátis, expira em 24h)

```
POST https://kieai.redpandaai.co/api/file-stream-upload   (multipart: file, uploadPath, fileName)
POST https://kieai.redpandaai.co/api/file-url-upload      ({fileUrl, uploadPath, fileName})
POST https://kieai.redpandaai.co/api/file-base64-upload
→ data.downloadUrl  (usar como referência nos modelos)
```

## Saldo e download

```
GET https://api.kie.ai/api/v1/chat/credit     → data: número de créditos
POST https://api.kie.ai/api/v1/common/download-url  → link temporário de download (fallback)
```
Download direto das URLs `tempfile.aiquickdraw.com` exige header `User-Agent` (sem ele dá 403).

## Callbacks

`callBackUrl` recebe POST com `{code, msg, data:{taskId, state, resultJson, creditsConsumed, ...}}`. Verificação de assinatura: https://docs.kie.ai/common-api/webhook-verification. Pra n8n: Webhook node → guardar `taskId` → mapear `resultUrls`.

## Rate limit e estabilidade

~20 requisições novas por 10 s por chave. Estabilidade um pouco abaixo dos provedores oficiais (é o trade-off do preço). Se um modelo cair, o script devolve `fail` sem cobrar: trocar pra alternativa da mesma camada no catálogo.

## Atualizar catálogo (preços + campos)

- Preços oficiais (público, sem chave): `POST https://api.kie.ai/client/v1/model-pricing/page` com `{"pageNum":1,"pageSize":100}`
  → `data.records[]` (`modelDescription`, `interfaceType`, `creditPrice`, `creditUnit`, `anchor` com `?model=<id>`).
  Total por tipo: `POST .../model-pricing/count`. GET devolve 404.
- Campos: bloco OpenAPI (```yaml) de cada `https://docs.kie.ai/market/<familia>/<modelo>.md`. Alguns usam `oneOf`
  (ex.: Kling Omni com 1 ou 2 frames): juntar as variantes.
- Tudo isso roda em `python3 scripts/atualizar_catalogo.py` (gera `precos-kie-<data>.json` e `modelos-kie.json` e lista o que entrou/saiu).

## Endpoints fora do createTask

- Gemini Omni: `POST /api/v1/omni/character/create` (`descriptions`, `image_urls` até 2, `character_name`, `audio_ids`)
  e `POST /api/v1/omni/audio/create` (`audio_id` voz preset, `name`, `voice_description`, `example_dialogue`). Os ids
  voltam pra `gemini-omni-video` / `google/gemini-omni-flash-1-1` em `character_ids` e `audio_ids`.
- Seedance 2.5 draft: gerar com `draft: true` (480p, barato), aprovar, depois `bytedance/seedance-2-5-draft` com
  `draft_task_id` (válido 7 dias) e `resolution: 1080p`. Referências podem ser `asset://<assetId>`.
- OmniHuman 1.5: `omnihuman-1-5/subject-detection` e `human-identification` geram a máscara (`mask_url`) pra escolher
  quem fala numa foto com várias pessoas.

## Pegadinhas conferidas em 16/10

- ids sem barra: `gpt-image-2-text-to-image`, `gpt-image-2-5-sunburst-image-to-image`, `grok-imagine-video-1-5-preview`.
- `pixverse-v6/*` (não `pixverse/*`); `kling-3.0/motion-control` (não `kling/motion-control-v3`).
- Seedream 5 Pro usa `quality` basic/high (não `resolution`); Seedream 5 Flash usa `size` 1K/1.5K/2K.
- MiniMax H3 e Hailuo usam `768P`/`1080P` maiúsculo; Hailuo só aceita duração 6 ou 10.
- Qwen3 põe a proporção em `image_size`; Ideogram em `image_size` com nomes (`portrait_16_9`).
- Imagen 4 (fast/ultra) devolve 864×1152 mesmo em 3:4: não serve pra entrega grande.
- Vidu Q4 vem com áudio LIGADO por padrão (o CLI desliga, `--audio` liga).
