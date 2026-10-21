#!/usr/bin/env python3
"""
DDG Studio - CLI unico pra kie.ai (imagem, video, audio, musica).
Somente stdlib. Uso: python3 kie.py <comando> [opcoes]

Comandos:
  credit                      saldo de creditos
  estimate                    estima custo de um job sem rodar
  upload <arquivo>            sobe arquivo local e devolve URL publica (24h)
  image                       gera imagem (market: nano-banana, seedream, flux-2, gpt-image, ideogram, imagen...)
  video                       gera video (market: kling, seedance, wan, hailuo, pixverse, grok, minimax...)
  veo                         gera video Google Veo 3.1 (endpoint proprio)
  runway                      gera video Runway (endpoint proprio)
  tts                         narracao ElevenLabs (market)
  music                       musica Suno (endpoint proprio)
  run                         passthrough generico: --model X --input '{json}'
  status <familia> <taskId>   consulta status (familia: market|veo|suno|runway)
  wait <familia> <taskId>     espera terminar e baixa o resultado
  log                         resumo de gastos (por projeto)
  models [termo]              catalogo oficial (157 modelos, campos tirados de docs.kie.ai)
  info <modelo>               campos, limites, preco e exemplo oficial de um modelo
  route <intencao>            qual modelo usar (realista, rosto, produto, texto, video-som, avatar-falando...)
  --dry (image/video)         mostra o input montado sem enviar

Chave: env KIE_API_KEY  ou  ~/.ddg-studio/.env (KIE_API_KEY=...)
Log de uso: ~/.ddg-studio/usage.jsonl
"""
import argparse, json, os, sys, time, urllib.request, urllib.parse, mimetypes, uuid, pathlib, datetime

BASE = "https://api.kie.ai"
UPLOAD_BASE = "https://kieai.redpandaai.co"
HOME = pathlib.Path.home() / ".ddg-studio"
LOG = HOME / "usage.jsonl"
CREDIT_USD = 0.005          # 1 credito = US$ 0,005
CONFIRM_THRESHOLD = 200     # acima disso exige --yes (US$ 1,00)
SESSION_SOFT_CAP = 600      # aviso quando a sessao (mesmo --project, hoje) passar disso

# ---------- tabela de custo (creditos). Fonte: api.kie.ai/client/v1/model-pricing/page em 2026-10-16 ----------
# Tabela bruta completa: references/precos-kie-2026-10-16.json (592 linhas). Valor: numero fixo por job, ou funcao(args)->creditos
def _res(a, default="720p"):
    return str(getattr(a, "res", None) or default).lower()

def _dur(a, default=5):
    return float(getattr(a, "duration", None) or default)

def _per_sec(m, audio_m=None):
    """m: {res: creditos/s}. audio_m: tabela quando --audio."""
    def f(a):
        t = audio_m if (audio_m and getattr(a, "audio", False)) else m
        r = _res(a)
        rate = t.get(r) or t.get({"768p": "720p", "720p": "768p", "4k": "2k"}.get(r, ""), None) or list(t.values())[0]
        return rate * _dur(a)
    return f

def _per_clip(m, base=5):
    """m: {res: creditos por clipe de `base` s}; proporcional a duracao."""
    def f(a):
        r = _res(a)
        return (m.get(r) or list(m.values())[0]) * (_dur(a, base) / base)
    return f

def _by_res(m, default="1K"):
    def f(a):
        r = str(getattr(a, "res", None) or default).upper()
        return m.get(r, list(m.values())[0])
    return f

def _by_speed(t, b, q):
    def f(a):
        s = str(getattr(a, "quality", None) or "BALANCED").upper()
        return {"TURBO": t, "BALANCED": b, "QUALITY": q}.get(s, b)
    return f

def _omni(a):
    d = int(_dur(a, 8)); base = {4: 63, 6: 84, 8: 105, 10: 126}.get(d, 105)
    return base + (84 if _res(a) == "4k" else 0)

def _kling3(a):
    mode = {"720p": "std", "1080p": "pro", "4k": "4K"}.get(_res(a), "std")
    t = {"std": 20, "pro": 27, "4K": 67} if getattr(a, "audio", False) else {"std": 14, "pro": 18, "4K": 67}
    return t[mode] * _dur(a)

def _chars(rate):
    return lambda a: rate * max(1, len(getattr(a, "text", "") or "") / 1000)

_NB2 = _by_res({"1K": 8, "2K": 12, "4K": 18})
_NB21 = _by_res({"1K": 4, "2K": 6, "4K": 9})
_GPT = _by_res({"1K": 6, "2K": 10, "4K": 16})
_SD5P = _by_res({"1K": 7, "BASIC": 7, "2K": 14, "HIGH": 14, "4K": 14})
_PIX = _per_sec({"360p": 4, "540p": 5.6, "720p": 7.2, "1080p": 14.4}, {"360p": 5.6, "540p": 7.2, "720p": 9.6, "1080p": 18.4})
_VIDU = _per_sec({"540p": 7.2, "720p": 15.2, "1080p": 19.2, "2k": 30.4, "4k": 62.4})
_OMNI3 = _per_sec({"720p": 14, "1080p": 18, "4k": 67}, {"720p": 18, "1080p": 23, "4k": 67})

PRICES = {
    # ---- imagem (por imagem) ----
    "z-image": 0.8,
    "nano-banana-2-lite": 4,
    "nano-banana-2-1": _NB21,
    "nano-banana-2": _NB2,
    "nano-banana-pro": _by_res({"1K": 18, "2K": 18, "4K": 24}),
    "google/nano-banana": 4, "google/nano-banana-edit": 4,
    "google/imagen4-fast": 4, "google/imagen4": 8, "google/imagen4-ultra": 12,
    "flux-2/pro-text-to-image": _by_res({"1K": 5, "2K": 7}), "flux-2/pro-image-to-image": _by_res({"1K": 5, "2K": 7}),
    "flux-2/flex-text-to-image": _by_res({"1K": 14, "2K": 24}), "flux-2/flex-image-to-image": _by_res({"1K": 14, "2K": 24}),
    "seedream/5-flash-text-to-image": 3.24, "seedream/5-flash-image-to-image": 3.24, "seedream/5-flash-layer-decomposition": 3.24,
    "seedream/5-lite-text-to-image": 5.5, "seedream/5-lite-image-to-image": 5.5,
    "seedream/5-pro-text-to-image": _SD5P, "seedream/5-pro-image-to-image": _SD5P, "seedream/5-pro-layer-decomposition": _SD5P,
    "seedream/4.5-text-to-image": 6.5, "seedream/4.5-edit": 6.5,
    "bytedance/seedream-v4-text-to-image": 5, "bytedance/seedream-v4-edit": 5, "bytedance/seedream": 3.5,
    "gpt-image-2-text-to-image": _GPT, "gpt-image-2-image-to-image": _GPT,
    "gpt-image-2-5-sunburst-text-to-image": _GPT, "gpt-image-2-5-sunburst-image-to-image": _GPT,
    "gpt-image-2-5-flare-text-to-image": _GPT, "gpt-image-2-5-flare-image-to-image": _GPT,
    "gpt-image/1.5-text-to-image": 4, "gpt-image/1.5-image-to-image": 4,     # medium (high = 22)
    "ideogram/v3-text-to-image": _by_speed(3.5, 7, 10), "ideogram/v3-edit": _by_speed(3.5, 7, 10), "ideogram/v3-remix": _by_speed(3.5, 7, 10),
    "ideogram/character": _by_speed(12, 18, 24), "ideogram/character-edit": _by_speed(12, 18, 24), "ideogram/character-remix": _by_speed(12, 18, 24),
    "qwen3/pro-text-to-image": _by_res({"1K": 6.4, "2K": 12}), "qwen3/pro-image-to-image": _by_res({"1K": 6.4, "2K": 12}),
    "qwen3/text-to-image": 4.8, "qwen3/image-to-image": 4.8,
    "qwen2-1/text-to-image": _by_res({"1K": 4, "2K": 8}), "qwen2-1/image-to-image": _by_res({"1K": 4, "2K": 8}),
    "qwen2/text-to-image": 5.6, "qwen2/image-edit": 5.6,
    "grok-imagine-image-2-0/text-to-image": 4, "grok-imagine-image-2-0/image-edit": 4,
    "grok-imagine-image-2-0/segment-edit": 4, "grok-imagine-image-2-0/segment-map": 0,
    "grok-imagine/text-to-image": 4, "grok-imagine/image-to-image": 4,
    "wan/2-7-image": 4.8, "wan/2-7-image-pro": 12,
    "recraft/remove-background": 1, "recraft/crisp-upscale": 0.5,
    "topaz/image-upscale": _by_res({"2K": 10, "4K": 20, "8K": 40}, "2K"),
    # ---- video market ----
    "grok-imagine/image-to-video": _per_sec({"480p": 2.4, "720p": 4.5, "1080p": 8}),
    "grok-imagine/text-to-video": _per_sec({"480p": 2.4, "720p": 4.5, "1080p": 8}),
    "grok-imagine-video-1-5-preview": _per_sec({"480p": 2.4, "720p": 4.5, "1080p": 8}),
    "grok-imagine/upscale": 20, "grok-imagine/extend": _per_clip({"480p": 14.4, "720p": 27}, 6),
    "bytedance/seedance-1.5-pro": _per_sec({"480p": 1.75, "720p": 3.5, "1080p": 7.5}, {"480p": 3.5, "720p": 7, "1080p": 15}),
    "bytedance/v1-lite-image-to-video": _per_sec({"480p": 2, "720p": 4.5, "1080p": 10}),
    "bytedance/v1-lite-text-to-video": _per_sec({"480p": 2, "720p": 4.5, "1080p": 10}),
    "bytedance/v1-pro-image-to-video": _per_sec({"480p": 2.8, "720p": 6, "1080p": 14}),
    "bytedance/v1-pro-text-to-video": _per_sec({"480p": 2.8, "720p": 6, "1080p": 14}),
    "bytedance/v1-pro-fast-image-to-video": _per_clip({"720p": 16, "1080p": 36}),
    "bytedance/seedance-2-mini": _per_sec({"480p": 3.8, "720p": 8.2}),
    "bytedance/seedance-2-fast": _per_sec({"480p": 11.7, "720p": 24.8}),
    "bytedance/seedance-2": _per_sec({"480p": 19, "720p": 41, "1080p": 102, "4k": 208}),
    "bytedance/seedance-2-5": _per_sec({"480p": 28, "720p": 63, "1080p": 158}),
    "kling/v3-turbo-text-to-video": _per_sec({"720p": 18, "1080p": 22.5}),
    "kling/v3-turbo-image-to-video": _per_sec({"720p": 18, "1080p": 22.5}),
    "kling-3.0/video": _kling3,
    "kling-3.0-omni/text-to-video": _OMNI3, "kling-3.0-omni/image-to-video": _OMNI3, "kling-3.0-omni/reference-to-video": _OMNI3,
    "kling-3.0-omni/transformation": _per_sec({"720p": 20, "1080p": 27, "4k": 67}),
    "kling-3.0/motion-control": _per_sec({"720p": 20, "1080p": 27}),
    "kling-2.6/motion-control": _per_sec({"720p": 11, "1080p": 18}),
    "kling-2.6/image-to-video": lambda a: (110 if getattr(a, "audio", False) else 55) * _dur(a) / 5,
    "kling-2.6/text-to-video": lambda a: (110 if getattr(a, "audio", False) else 55) * _dur(a) / 5,
    "kling/v2-5-turbo-image-to-video-pro": lambda a: 42 * _dur(a) / 5, "kling/v2-5-turbo-text-to-video-pro": lambda a: 42 * _dur(a) / 5,
    "kling/ai-avatar-standard": _per_sec({"720p": 8}), "kling/ai-avatar-pro": _per_sec({"1080p": 16}),
    "wan/2-7-text-to-video": _per_sec({"720p": 16, "1080p": 24}), "wan/2-7-image-to-video": _per_sec({"720p": 16, "1080p": 24}),
    "wan/2-7-r2v": _per_sec({"720p": 16, "1080p": 24}), "wan/2-7-videoedit": _per_sec({"720p": 16, "1080p": 24}),
    "wan/3-0-video": _per_sec({"480p": 8, "720p": 16, "1080p": 32}),
    "wan/3-0-video-prime": _per_sec({"480p": 12.2, "720p": 25.2, "1080p": 50.4}),
    "wan/2-6-flash-image-to-video": lambda a: ({"720p": 20, "1080p": 30}.get(_res(a), 20)) * (2 if getattr(a, "audio", False) else 1) * _dur(a) / 5,
    "wan/2-6-flash-video-to-video": lambda a: ({"720p": 20, "1080p": 30}.get(_res(a), 20)) * (2 if getattr(a, "audio", False) else 1) * _dur(a) / 5,
    "wan/2-6-image-to-video": _per_clip({"720p": 70, "1080p": 105}), "wan/2-6-text-to-video": _per_clip({"720p": 70, "1080p": 105}),
    "wan/2-6-video-to-video": _per_clip({"720p": 70, "1080p": 105}),
    "wan/2-2-animate-move": _per_sec({"480p": 6, "580p": 9.5, "720p": 12.5}), "wan/2-2-animate-replace": _per_sec({"480p": 6, "580p": 9.5, "720p": 12.5}),
    "wan/2-2-a14b-speech-to-video-turbo": _per_sec({"480p": 12, "580p": 18, "720p": 24}),
    "pixverse-v6/text-to-video": _PIX, "pixverse-v6/image-to-video": _PIX, "pixverse-v6/transition": _PIX,
    "pixverse-v6/reference-to-video": _PIX, "pixverse-v6/extend": _PIX,
    "minimax-h3/image-to-video": _per_sec({"768p": 8, "2k": 13}), "minimax-h3/text-to-video": _per_sec({"768p": 8, "2k": 13}),
    "minimax-h3/reference-to-video": _per_sec({"768p": 8, "2k": 13}),
    "hailuo/2-3-image-to-video-standard": lambda a: 50 if (_dur(a, 6) > 6 or _res(a) == "1080p") else 30,
    "hailuo/2-3-image-to-video-pro": lambda a: 90 if _dur(a, 6) > 6 else (80 if _res(a) == "1080p" else 45),
    "hailuo/02-image-to-video-standard": lambda a: 50 if _dur(a, 6) > 6 else 30,
    "happyhorse-1-1/image-to-video": _per_sec({"720p": 22.5, "1080p": 29}), "happyhorse-1-1/text-to-video": _per_sec({"720p": 22.5, "1080p": 29}),
    "happyhorse-1-1/reference-to-video": _per_sec({"720p": 22.5, "1080p": 29}),
    "happyhorse/image-to-video": _per_sec({"720p": 28, "1080p": 48}), "happyhorse/video-edit": _per_sec({"720p": 28, "1080p": 48}),
    "vidu-q4/image-to-video": _VIDU, "vidu-q4/reference-to-video": _VIDU,
    "gemini-omni-video": _omni, "google/gemini-omni-flash-1-1": _omni,
    "omnihuman-1-5": _per_sec({"720p": 27, "1080p": 27}),
    "volcengine/video-to-video-lip-sync": _per_sec({"720p": 8}),
    "infinitalk/from-audio": _per_sec({"480p": 3, "720p": 12}),
    "topaz/video-upscale": lambda a: (14 if str(getattr(a, "upscale", "2")) == "4" else 8) * _dur(a),
    # ---- veo (por video de 8 s) ----
    "veo3_lite": _by_res({"720P": 30, "1080P": 35, "4K": 150}, "720P"),
    "veo3_fast": _by_res({"720P": 60, "1080P": 65, "4K": 180}, "720P"),
    "veo3": _by_res({"720P": 250, "1080P": 255, "4K": 370}, "720P"),
    # ---- runway (por video) ----
    "runway": lambda a: 12 if (int(_dur(a)) == 5 and _res(a) == "720p") else 30,
    # ---- audio ----
    "elevenlabs/text-to-speech-turbo-2-5": _chars(6),
    "elevenlabs/text-to-speech-multilingual-v2": _chars(12),
    "elevenlabs/text-to-dialogue-v3": _chars(14),
    # gemini tts: ~25 tokens de audio por segundo, ~15 caracteres por segundo de fala
    "google/gemini-3-8-flash-tts": lambda a: max(0.5, len(getattr(a, "text", "") or "") / 15 * 25 * 1260 / 1e6),
    "google/gemini-3-8-flash-lite-tts": lambda a: max(0.5, len(getattr(a, "text", "") or "") / 15 * 25 * 840 / 1e6),
    "google/gemini-3-1-flash-tts": lambda a: max(0.5, len(getattr(a, "text", "") or "") / 15 * 25 * 2800 / 1e6),
    "suno": 12,   # por request (gera 2 faixas)
}

# ---------- esquemas oficiais (campos de cada modelo, tirados do OpenAPI de docs.kie.ai em 2026-10-16) ----------
REF_DIR = pathlib.Path(__file__).resolve().parent.parent / "references"
_SCHEMAS = None
def schemas():
    global _SCHEMAS
    if _SCHEMAS is None:
        f = REF_DIR / "modelos-kie.json"
        _SCHEMAS = json.loads(f.read_text()) if f.exists() else {}
    return _SCHEMAS

VIDEO_EXT = (".mp4", ".mov", ".webm", ".m4v")
AUDIO_EXT = (".mp3", ".wav", ".m4a", ".aac", ".ogg")

def _kind_of(url):
    p = urllib.parse.urlparse(url).path.lower()
    return "video" if p.endswith(VIDEO_EXT) else "audio" if p.endswith(AUDIO_EXT) else "image"

def _match(val, enum, field, model):
    """Casa o valor pedido com o enum oficial (sem diferenciar maiuscula). Sai com erro claro se nao existir."""
    if val is None or not enum:
        return val
    for e in enum:
        if str(e).lower() == str(val).lower():
            return e
    sys.exit(f"ERRO: {model} nao aceita {field}={val!r}. Opcoes oficiais: {enum}")

def _cast(val, t):
    if t == "integer": return int(float(val))
    if t == "number": return int(val) if float(val).is_integer() else float(val)
    if t == "string": return str(val)
    return val

IDEOGRAM_SIZE = {"1:1": "square_hd", "16:9": "landscape_16_9", "9:16": "portrait_16_9", "4:3": "landscape_4_3",
                 "3:4": "portrait_4_3", "4:5": "portrait_4_3", "3:2": "landscape_4_3", "2:3": "portrait_4_3"}

def build_input(model, args, refs):
    """Monta o input do Market a partir do esquema oficial do modelo. Retorna (input, avisos)."""
    sch = schemas().get(model)
    if not sch:
        return None, [f"{model} nao esta em references/modelos-kie.json: usando montagem generica"]
    F = sch["fields"]; inp = {}; notes = []
    has = lambda k: k in F
    enum = lambda k: F[k].get("enum")
    imgs = [r for r in refs if _kind_of(r) == "image"]
    vids = [r for r in refs if _kind_of(r) == "video"]
    auds = [r for r in refs if _kind_of(r) == "audio"]
    prompt = getattr(args, "prompt", None)
    if prompt:
        if has("prompt"): inp["prompt"] = prompt
        elif has("text"): inp["text"] = prompt
        elif has("descriptions"): inp["descriptions"] = prompt
    # ---- referencias de imagem: o campo muda por modelo ----
    mode = (getattr(args, "mode", None) or "").lower()
    if imgs:
        def arr(k):
            mx = F[k].get("maxItems")
            if mx and len(imgs) > mx:
                notes.append(f"{k} aceita no maximo {mx}; usando as {mx} primeiras")
            inp[k] = imgs[:mx] if mx else imgs
        if has("reference_image_urls") and (mode == "reference" or (len(imgs) > 2 and not has("image_input") and not has("image_urls") and not has("input_urls"))):
            arr("reference_image_urls")
        elif has("image_input"): arr("image_input")
        elif has("image_urls"): arr("image_urls")
        elif has("input_urls"): arr("input_urls")
        elif has("reference_image") and F["reference_image"]["t"] == "array": arr("reference_image")
        elif has("first_frame_url"):
            inp["first_frame_url"] = imgs[0]
            if len(imgs) > 1 and has("last_frame_url"): inp["last_frame_url"] = imgs[1]
        elif has("reference_image_urls"): arr("reference_image_urls")
        elif has("image_url"):
            inp["image_url"] = imgs[0]
            for k in ("end_image_url", "tail_image_url", "last_frame_url"):
                if len(imgs) > 1 and has(k): inp[k] = imgs[1]; break
        elif has("image"): inp["image"] = imgs[0]
        elif has("first_frame_image_url"):
            inp["first_frame_image_url"] = imgs[0]
            if len(imgs) > 1 and has("last_frame_image_url"): inp["last_frame_image_url"] = imgs[1]
        else:
            notes.append("este modelo nao recebe imagem de referencia; refs de imagem ignoradas")
    if vids:
        if has("video_url"): inp["video_url"] = vids[0]
        elif has("video_urls"): inp["video_urls"] = vids[: F["video_urls"].get("maxItems") or len(vids)]
        elif has("reference_video_urls"): inp["reference_video_urls"] = vids
        else: notes.append("este modelo nao recebe video; refs de video ignoradas")
    if auds:
        if has("audio_url"): inp["audio_url"] = auds[0]
        elif has("reference_audio_urls"): inp["reference_audio_urls"] = auds
        elif has("driving_audio_url"): inp["driving_audio_url"] = auds[0]
        else: notes.append("este modelo nao recebe audio; refs de audio ignoradas")
    # ---- proporcao ----
    ar = getattr(args, "ar", None)
    if has("aspect_ratio"):
        if ar: inp["aspect_ratio"] = _match(ar, enum("aspect_ratio"), "aspect_ratio", model)
        elif F["aspect_ratio"].get("req") and "default" not in F["aspect_ratio"]:
            e = enum("aspect_ratio") or []
            inp["aspect_ratio"] = "auto" if "auto" in e else ("16:9" if "16:9" in e else (e[0] if e else "16:9"))
    elif has("image_size") and ar:
        e = enum("image_size") or []
        inp["image_size"] = ar if ar in e else _match(IDEOGRAM_SIZE.get(ar, "square_hd"), e, "image_size", model)
    elif has("ratio") and ar:
        inp["ratio"] = ar
    # ---- resolucao / qualidade (nome do campo muda) ----
    res = getattr(args, "res", None)
    special = {}
    if model.startswith("seedream/5-pro"):
        special["quality"] = {"1k": "basic", "basic": "basic", "2k": "high", "4k": "high", "high": "high"}
    if model == "kling-3.0/video":
        special["mode"] = {"720p": "std", "std": "std", "1080p": "pro", "pro": "pro", "4k": "4K"}
    for k in ("resolution", "size", "quality", "output_resolution", "image_resolution", "mode"):
        if not has(k) or k in inp:
            continue
        e = enum(k)
        if k == "mode" and model != "kling-3.0/video" and not (e and any(str(x).endswith("p") for x in e)):
            continue  # mode de outros modelos nao e resolucao
        if k == "quality" and e and not any(str(x).lower() in ("basic", "high") or str(x).endswith("p") for x in e):
            continue
        val = res
        if k in special:
            val = special[k].get(str(res or "").lower(), list(special[k].values())[0])
        elif val and e:
            low = str(val).lower()
            alias = {"720p": ["768p"], "768p": ["720p"], "1080p": ["1080"], "720": ["720p"], "2k": ["2k"], "4k": ["4k"]}
            if not any(str(x).lower() == low for x in e):
                for a in alias.get(low, []):
                    hit = [x for x in e if str(x).lower() == a]
                    if hit: val = hit[0]; break
        if val is None:
            if F[k].get("req") and "default" not in F[k] and e:
                val = next((x for x in e if str(x).lower() in ("1k", "720p", "768p", "basic", "std")), e[0])
            else:
                continue
        inp[k] = _match(val, e, k, model) if e else val
        break
    # ---- duracao ----
    if has("duration") and getattr(args, "duration", None) is not None:
        d = F["duration"]; val = _cast(args.duration, d["t"] or "integer")
        e = d.get("enum")
        if e and str(val) not in [str(x) for x in e]:
            sys.exit(f"ERRO: {model} nao aceita duration={val}. Opcoes oficiais: {e}")
        if e: val = next(x for x in e if str(x) == str(val))
        inp["duration"] = val
    # ---- audio (padrao DDG: sem audio, salvo --audio) ----
    for k in ("generate_audio", "audio", "sound", "generate_audio_switch"):
        if has(k) and F[k]["t"] == "boolean":
            inp[k] = bool(getattr(args, "audio", False)); break
    if has("multi_shots") and F["multi_shots"].get("req"): inp.setdefault("multi_shots", False)
    # ---- extras comuns ----
    if has("output_format"):
        fmt = getattr(args, "format", None)
        e = enum("output_format") or []
        if fmt: inp["output_format"] = _match("jpeg" if fmt == "jpg" and "jpeg" in e else fmt, e, "output_format", model)
        elif "png" in e: inp["output_format"] = "png"
    if has("rendering_speed"):
        inp["rendering_speed"] = _match((getattr(args, "quality", None) or "BALANCED").upper(), enum("rendering_speed"), "rendering_speed", model)
    if has("upscale_factor") and getattr(args, "upscale", None):
        inp["upscale_factor"] = str(args.upscale)
    if has("negative_prompt") and getattr(args, "negative", None):
        inp["negative_prompt"] = args.negative
    if getattr(args, "extra", None):
        inp.update(json.loads(args.extra))
    # ---- obrigatorios sem valor: usa default oficial ou avisa ----
    for k, d in F.items():
        if d.get("req") and k not in inp:
            if "default" in d: inp[k] = d["default"]
            else: notes.append(f"campo obrigatorio '{k}' sem valor (passe via --extra)")
    return inp, notes

# ---------- ROTEADOR POR INTENCAO (espelha references/roteador.md) ----------
# cada camada: (modelo, opcoes, por que). ECO = rascunho · PADRAO = entrega · PREMIUM = so com aprovacao
ROUTER = {
  # ===== IMAGEM =====
  "rascunho":      {"eco": ("z-image", "--ar 16:9", "0,8 cr: 10 ideias de composicao por 8 creditos"),
                    "padrao": ("seedream/5-flash-text-to-image", "--res 2K", "3,24 cr em 2K, bonito o bastante pra aprovar direcao"),
                    "premium": ("nano-banana-2-1", "--res 1K", "4 cr, segue prompt complexo")},
  "realista":      {"eco": ("seedream/5-flash-text-to-image", "--res 2K", "3,24 cr em 2K; pele um pouco exagerada, otimo pra aprovar cena (teste 16/10)"),
                    "padrao": ("nano-banana-2-1", "--res 2K", "6 cr, foto documental (poro, fio solto); empatou com nano-banana-2 pela metade do preco (teste 16/10)"),
                    "premium": ("nano-banana-pro", "--res 2K", "18 cr, o mais 'pessoa real' do teste; 4K = 24")},
  "rosto":         {"eco": ("nano-banana-2-1", "--res 1K --ref <foto>", "4 cr, mantem identidade; nunca usar lite com rosto"),
                    "padrao": ("nano-banana-2-1", "--res 2K --ref <foto>", "6 cr, manteve o rosto no teste de identidade 16/10; alternativa nano-banana-2 (12)"),
                    "premium": ("nano-banana-pro", "--res 2K --ref <foto>", "18 cr, identidade maxima; alternativa gpt-image-2-5-sunburst-image-to-image")},
  "produto":       {"eco": ("nano-banana-2-1", "--res 1K --ref <produto>", "4 cr, produto igual a referencia"),
                    "padrao": ("seedream/5-pro-image-to-image", "--res 2K --ref <produto>", "14 cr, estetica publicitaria"),
                    "premium": ("nano-banana-pro", "--res 2K --ref <produto>", "18 cr, rotulo e forma fieis")},
  "publicidade":   {"eco": ("seedream/5-flash-text-to-image", "--res 2K", "3,24 cr, cor rica de anuncio"),
                    "padrao": ("seedream/5-pro-text-to-image", "--res 2K", "14 cr, moda/lifestyle/campanha"),
                    "premium": ("nano-banana-pro", "--res 2K", "18 cr, peca hero")},
  "texto":         {"eco": ("ideogram/v3-text-to-image", "--quality TURBO", "3,5 cr, lettering curto"),
                    "padrao": ("gpt-image-2-5-sunburst-text-to-image", "--res 2K", "10 cr, melhor tipografia em portugues, layouts e infograficos"),
                    "premium": ("gpt-image-2-5-sunburst-text-to-image", "--res 4K", "16 cr; ou ideogram QUALITY (10)")},
  "ilustracao":    {"eco": ("seedream/5-flash-text-to-image", "--res 2K", "3,24 cr"),
                    "padrao": ("nano-banana-2-1", "--res 2K", "6 cr, 3D/cartoon/flat consistentes"),
                    "premium": ("nano-banana-pro", "--res 2K", "18 cr")},
  "logo-icone":    {"eco": ("ideogram/v3-text-to-image", "--quality TURBO --extra '{\"style\":\"DESIGN\"}'", "3,5 cr, estilo design"),
                    "padrao": ("gpt-image-2-5-sunburst-text-to-image", "--res 2K --extra '{\"background\":\"transparent\"}'", "10 cr, fundo transparente"),
                    "premium": ("ideogram/v3-text-to-image", "--quality QUALITY --extra '{\"style\":\"DESIGN\"}'", "10 cr; vetor final sempre redesenhado")},
  "personagem":    {"eco": ("ideogram/character", "--quality TURBO --ref <1 foto>", "12 cr, mascote/personagem fixo"),
                    "padrao": ("ideogram/character", "--quality BALANCED --ref <1 foto>", "18 cr"),
                    "premium": ("ideogram/character", "--quality QUALITY --ref <1 foto>", "24 cr")},
  "edicao":        {"eco": ("google/nano-banana-edit", "--ref <img>", "4 cr, troca fundo/cor/remove objeto"),
                    "padrao": ("nano-banana-2-1", "--res 2K --ref <img>", "6 cr, edicao por instrucao complexa"),
                    "premium": ("gpt-image-2-5-sunburst-image-to-image", "--res 2K --ref <img>", "10 cr, preserva pessoa/produto entre edicoes")},
  "edicao-regiao": {"eco": ("grok-imagine-image-2-0/segment-map", "--ref <img>", "0 cr, mapeia regioes"),
                    "padrao": ("grok-imagine-image-2-0/segment-edit", "--ref <img>", "4 cr, edita so a regiao escolhida"),
                    "premium": ("nano-banana-pro", "--ref <img>", "18 cr")},
  "composicao":    {"eco": ("nano-banana-2-1", "--res 1K --ref a --ref b --ref c", "4 cr, ate 10 refs"),
                    "padrao": ("nano-banana-2-1", "--res 2K --ref ...", "6 cr, ate 10 refs"),
                    "premium": ("gpt-image-2-5-sunburst-image-to-image", "--res 2K --ref ...", "10 cr, ate 16 refs; ou nano-banana-pro (8 refs)")},
  "camadas":       {"eco": ("seedream/5-flash-layer-decomposition", "--ref <img>", "3,24 cr, separa fundo e objetos"),
                    "padrao": ("seedream/5-pro-layer-decomposition", "--res 2K --ref <img>", "14 cr"),
                    "premium": ("seedream/5-pro-layer-decomposition", "--res 2K --ref <img>", "14 cr")},
  "remover-fundo": {"eco": ("recraft/remove-background", "--ref <img>", "1 cr"),
                    "padrao": ("recraft/remove-background", "--ref <img>", "1 cr"),
                    "premium": ("gpt-image-2-5-sunburst-image-to-image", "--ref <img> --extra '{\"background\":\"transparent\"}'", "10 cr, recorte refeito")},
  "upscale":       {"eco": ("recraft/crisp-upscale", "--ref <img>", "0,5 cr"),
                    "padrao": ("topaz/image-upscale", "--res 2K --upscale 2 --ref <img>", "10 cr"),
                    "premium": ("topaz/image-upscale", "--res 4K --upscale 4 --ref <img>", "20 cr, impressao/outdoor")},
  # ===== VIDEO (clipe 5 s, 720p, sem som) =====
  "video":         {"eco": ("runway", "--duration 5 --res 720p", "12 cr por 5 s, b-roll e camera simples"),
                    "padrao": ("kling/v3-turbo-image-to-video", "--duration 5 --res 720p", "90 cr, fisica e movimento coerentes"),
                    "premium": ("kling-3.0/video", "--duration 5 --res 1080p", "90 cr sem som (135 com), multi-shot e elementos")},
  "video-rascunho":{"eco": ("grok-imagine-video-1-5-preview", "--res 480p --duration 5", "12 cr, testar prompt de movimento"),
                    "padrao": ("bytedance/v1-pro-fast-image-to-video", "--res 720p --duration 5", "16 cr por 5 s"),
                    "premium": ("pixverse-v6/image-to-video", "--res 720p --duration 5", "36 cr")},
  "video-realista":{"eco": ("minimax-h3/image-to-video", "--res 768p --duration 5", "40 cr, pessoas e expressao"),
                    "padrao": ("kling/v3-turbo-image-to-video", "--res 720p --duration 5", "90 cr"),
                    "premium": ("happyhorse-1-1/image-to-video", "--res 1080p --duration 5", "145 cr, realismo cinematografico; alternativa veo3 com som")},
  "video-som":     {"eco": ("veo3_lite", "--res 720p", "30 cr por 8 s com audio nativo (fala, ambiente)"),
                    "padrao": ("veo3_fast", "--res 720p", "60 cr por 8 s; alternativa vidu-q4 (15,2/s com audio)"),
                    "premium": ("veo3", "--res 1080p", "255 cr por 8 s, aprovacao obrigatoria")},
  "video-personagem":{"eco": ("bytedance/seedance-2-mini", "--mode reference --ref ... --res 720p", "41 cr, ate 9 refs"),
                    "padrao": ("vidu-q4/reference-to-video", "--ref ... --res 720p", "76 cr, ate 15 refs + audio de referencia"),
                    "premium": ("kling-3.0-omni/reference-to-video", "--ref ... --res 1080p", "90 cr, elementos/sujeitos fixos")},
  "video-multishot":{"eco": ("wan/2-6-flash-image-to-video", "--extra '{\"multi_shots\":true}' --duration 10", "40 cr por 10 s"),
                    "padrao": ("kling-3.0/video", "--extra '{\"multi_shots\":true,...}'", "70 a 135 cr, ate 6 cenas num job"),
                    "premium": ("kling-3.0-omni/image-to-video", "--extra '{\"customize_multi_shots\":true,...}'", "omni com roteiro de cenas")},
  "video-transicao":{"eco": ("pixverse-v6/transition", "--ref primeiro --ref ultimo", "36 cr, primeiro + ultimo frame"),
                    "padrao": ("minimax-h3/image-to-video", "--ref primeiro --ref ultimo", "40 cr"),
                    "premium": ("kling-3.0-omni/image-to-video", "--ref primeiro --ref ultimo --res 1080p", "90 cr")},
  "avatar-falando":{"eco": ("infinitalk/from-audio", "--ref foto --ref audio.mp3 --res 480p", "3 cr/s, lip sync de foto"),
                    "padrao": ("kling/ai-avatar-standard", "--ref foto --ref audio.mp3", "8 cr/s, ate 5 min"),
                    "premium": ("omnihuman-1-5", "--ref foto --ref audio.mp3", "27 cr/s, corpo e gesto naturais; ou kling/ai-avatar-pro 16/s")},
  "dublar-video":  {"eco": ("volcengine/video-to-video-lip-sync", "--ref video --ref audio --extra '{\"mode\":\"lite\"}'", "8 cr/s"),
                    "padrao": ("volcengine/video-to-video-lip-sync", "--ref video --ref audio --extra '{\"mode\":\"basic\"}'", "8 cr/s, varias pessoas"),
                    "premium": ("volcengine/video-to-video-lip-sync", "--extra '{\"mode\":\"basic\"}'", "8 cr/s")},
  "mover-personagem":{"eco": ("wan/2-2-animate-move", "--ref foto --ref video", "6 a 12,5 cr/s"),
                    "padrao": ("kling-3.0/motion-control", "--ref foto --ref video", "20 cr/s"),
                    "premium": ("kling-3.0/motion-control", "--ref foto --ref video --res 1080p", "27 cr/s")},
  "editar-video":  {"eco": ("wan/2-6-flash-video-to-video", "--ref video", "20 cr por 5 s"),
                    "padrao": ("kling-3.0-omni/transformation", "--ref video", "20 cr/s, troca estilo/objeto/clima"),
                    "premium": ("happyhorse/video-edit", "--ref video", "28 cr/s; ou runway aleph 110")},
  "video-longo":   {"eco": ("wan/3-0-video", "--duration 15 --res 480p", "8 cr/s, ate 30 s com audio"),
                    "padrao": ("wan/3-0-video", "--duration 15 --res 720p", "16 cr/s"),
                    "premium": ("bytedance/seedance-2-5", "--duration 15 --res 720p", "63 cr/s, ate 30 s; usar draft antes")},
  "upscale-video": {"eco": ("grok-imagine/upscale", "--ref video", "10 a 30 cr"),
                    "padrao": ("topaz/video-upscale", "--upscale 2 --ref video", "8 cr/s"),
                    "premium": ("topaz/video-upscale", "--upscale 4 --ref video", "14 cr/s")},
  # ===== AUDIO =====
  "narracao":      {"eco": ("google/gemini-3-8-flash-lite-tts", "", "centavos por minuto"),
                    "padrao": ("elevenlabs/text-to-speech-multilingual-v2", "--extra '{\"language_code\":\"pt\"}'", "12 cr por 1.000 caracteres, pt-BR"),
                    "premium": ("elevenlabs/text-to-dialogue-v3", "", "14 cr por 1.000, emocao e dialogo")},
  "musica":        {"eco": ("suno", "--instrumental", "12 cr, vem 2 faixas"),
                    "padrao": ("suno", "--model V5", "12 cr"),
                    "premium": ("suno", "--model V5_5", "12 cr + extend/stems")},
}
ALIASES = {"foto": "realista", "ultra-realista": "realista", "fotorrealista": "realista", "hiper-realista": "realista",
           "pessoa": "rosto", "modelo": "rosto", "anuncio": "publicidade", "criativo": "publicidade", "lifestyle": "publicidade",
           "tipografia": "texto", "lettering": "texto", "infografico": "texto", "3d": "ilustracao", "cartoon": "ilustracao",
           "mascote": "personagem", "logo": "logo-icone", "icone": "logo-icone", "colagem": "composicao",
           "reels": "video", "b-roll": "video", "cinema": "video-realista", "cinematografico": "video-realista",
           "fala": "video-som", "audio": "video-som", "lip-sync": "avatar-falando", "avatar": "avatar-falando",
           "locucao": "narracao", "voz": "narracao", "jingle": "musica", "trilha": "musica"}

# ---------- infra ----------
def load_key():
    k = os.environ.get("KIE_API_KEY")
    if k:
        return k.strip()
    env = HOME / ".env"
    if env.exists():
        for line in env.read_text().splitlines():
            if line.startswith("KIE_API_KEY="):
                return line.split("=", 1)[1].strip().strip('"').strip("'")
    sys.exit("ERRO: defina KIE_API_KEY no ambiente ou em ~/.ddg-studio/.env")

def api(method, path, body=None, base=BASE, raw=None, headers=None):
    url = base + path
    h = {"Authorization": f"Bearer {load_key()}"}
    if headers:
        h.update(headers)
    data = None
    if raw is not None:
        data = raw
    elif body is not None:
        data = json.dumps(body).encode()
        h["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=data, method=method, headers=h)
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            txt = r.read().decode()
    except urllib.error.HTTPError as e:
        txt = e.read().decode()
        try:
            j = json.loads(txt)
        except Exception:
            sys.exit(f"HTTP {e.code}: {txt[:400]}")
        sys.exit(f"HTTP {e.code}: {j.get('msg') or j}")
    try:
        return json.loads(txt)
    except Exception:
        sys.exit(f"Resposta nao-JSON: {txt[:400]}")

def ok(j, what="request"):
    if j.get("code") != 200:
        sys.exit(f"ERRO {what}: code={j.get('code')} msg={j.get('msg')}")
    return j.get("data")

def usd(credits):
    return credits * CREDIT_USD

def fmt_cost(credits):
    return f"{credits:.1f} creditos (~US$ {usd(credits):.2f})"

def estimate(model, args):
    p = PRICES.get(model)
    if p is None:
        return None
    return p(args) if callable(p) else p

def log_usage(entry):
    HOME.mkdir(exist_ok=True)
    entry["ts"] = datetime.datetime.now().isoformat(timespec="seconds")
    with open(LOG, "a") as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")

def session_spent(project):
    if not LOG.exists():
        return 0.0
    today = datetime.date.today().isoformat()
    tot = 0.0
    for line in LOG.read_text().splitlines():
        try:
            e = json.loads(line)
        except Exception:
            continue
        if e.get("ts", "").startswith(today) and (e.get("project") or "sem-projeto") == (project or "sem-projeto"):
            tot += float(e.get("credits") or 0)
    return tot

def guard(model, args, n=1):
    """Mostra estimativa e aplica a politica de gasto. Retorna estimativa (creditos)."""
    est = estimate(model, args)
    total = (est or 0) * n
    proj = getattr(args, "project", None) or "sem-projeto"
    spent = session_spent(proj)
    if est is None:
        print(f"[custo] modelo {model}: sem tabela local, consulte references/catalogo-modelos.md. Prosseguindo.", file=sys.stderr)
    else:
        print(f"[custo] estimado: {fmt_cost(total)}  ({n}x {model})  | gasto hoje no projeto '{proj}': {fmt_cost(spent)}", file=sys.stderr)
    if total > CONFIRM_THRESHOLD and not getattr(args, "yes", False):
        sys.exit(f"BLOQUEADO pela politica de gasto: {fmt_cost(total)} > {CONFIRM_THRESHOLD} creditos. "
                 f"Confirme com o responsavel e rode de novo com --yes.")
    if spent + total > SESSION_SOFT_CAP:
        print(f"[aviso] o projeto '{proj}' passa de {SESSION_SOFT_CAP} creditos hoje. Avalie se vale continuar.", file=sys.stderr)
    return total

def download(url, outdir, prefix):
    outdir = pathlib.Path(outdir)
    outdir.mkdir(parents=True, exist_ok=True)
    ext = os.path.splitext(urllib.parse.urlparse(url).path)[1] or ".bin"
    name = outdir / f"{prefix}{ext}"
    i = 1
    while name.exists():
        name = outdir / f"{prefix}-{i}{ext}"
        i += 1
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (ddg-studio)"})
    with urllib.request.urlopen(req, timeout=300) as r, open(name, "wb") as f:
        while True:
            chunk = r.read(1 << 20)
            if not chunk: break
            f.write(chunk)
    return str(name)

# ---------- upload ----------
def cmd_upload(args):
    return upload_file(args.file, args.path)

def upload_file(path, upload_path="ddg-studio"):
    p = pathlib.Path(path)
    if not p.exists():
        sys.exit(f"arquivo nao existe: {path}")
    boundary = "----ddg" + uuid.uuid4().hex
    mt = mimetypes.guess_type(p.name)[0] or "application/octet-stream"
    body = b""
    def field(name, value):
        return (f"--{boundary}\r\nContent-Disposition: form-data; name=\"{name}\"\r\n\r\n{value}\r\n").encode()
    body += field("uploadPath", upload_path)
    body += field("fileName", p.name)
    body += (f"--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"{p.name}\"\r\nContent-Type: {mt}\r\n\r\n").encode()
    body += p.read_bytes() + b"\r\n" + f"--{boundary}--\r\n".encode()
    j = api("POST", "/api/file-stream-upload", base=UPLOAD_BASE, raw=body,
            headers={"Content-Type": f"multipart/form-data; boundary={boundary}"})
    if not j.get("success", j.get("code") == 200):
        sys.exit(f"upload falhou: {j}")
    d = j.get("data") or {}
    url = d.get("downloadUrl") or d.get("fileUrl") or d.get("url")
    print(url)
    return url

def resolve_refs(refs):
    """Aceita URLs ou caminhos locais. Locais sao enviados via upload."""
    out = []
    for r in refs or []:
        if r.startswith("http://") or r.startswith("https://"):
            out.append(r)
        else:
            print(f"[upload] {r}", file=sys.stderr)
            out.append(upload_file(r))
    return out

# ---------- market (createTask / recordInfo) ----------
def market_create(model, inp, callback=None):
    body = {"model": model, "input": inp}
    if callback:
        body["callBackUrl"] = callback
    d = ok(api("POST", "/api/v1/jobs/createTask", body), "createTask")
    return d["taskId"]

def market_status(task_id):
    d = ok(api("GET", f"/api/v1/jobs/recordInfo?taskId={task_id}"), "recordInfo")
    state = d.get("state")
    urls = []
    if d.get("resultJson"):
        try:
            rj = json.loads(d["resultJson"]) if isinstance(d["resultJson"], str) else d["resultJson"]
            urls = rj.get("resultUrls") or rj.get("result_urls") or []
        except Exception:
            pass
    return {"state": state, "done": state in ("success", "fail"), "ok": state == "success",
            "urls": urls, "credits": d.get("creditsConsumed"), "fail": d.get("failMsg"), "raw": d}

def veo_status(task_id):
    d = ok(api("GET", f"/api/v1/veo/record-info?taskId={task_id}"), "veo record-info")
    flag = d.get("successFlag")
    urls = []
    resp = d.get("response") or {}
    ru = resp.get("resultUrls")
    if isinstance(ru, str):
        try:
            ru = json.loads(ru)
        except Exception:
            ru = [ru]
    urls = ru or []
    return {"state": {0: "generating", 1: "success"}.get(flag, "fail"), "done": flag in (1, 2, 3),
            "ok": flag == 1, "urls": urls, "credits": None, "fail": d.get("errorMessage"), "raw": d}

def suno_status(task_id):
    d = ok(api("GET", f"/api/v1/generate/record-info?taskId={task_id}"), "suno record-info")
    st = d.get("status")
    urls = []
    resp = d.get("response") or {}
    for t in resp.get("sunoData") or []:
        if t.get("audioUrl"):
            urls.append(t["audioUrl"])
    done = st in ("SUCCESS", "CREATE_TASK_FAILED", "GENERATE_AUDIO_FAILED", "CALLBACK_EXCEPTION", "SENSITIVE_WORD_ERROR")
    return {"state": st, "done": done, "ok": st == "SUCCESS", "urls": urls, "credits": None,
            "fail": d.get("errorMessage"), "raw": d}

def runway_status(task_id):
    d = ok(api("GET", f"/api/v1/runway/record-detail?taskId={task_id}"), "runway record-detail")
    st = d.get("state")
    vi = d.get("videoInfo") or {}
    urls = [u for u in [vi.get("videoUrl")] if u]
    return {"state": st, "done": st in ("success", "fail"), "ok": st == "success", "urls": urls,
            "credits": None, "fail": d.get("failMsg"), "raw": d}

STATUS = {"market": market_status, "veo": veo_status, "suno": suno_status, "runway": runway_status}

def wait_and_download(family, task_id, args, model, est, extra=None):
    fn = STATUS[family]
    t0 = time.time()
    timeout = int(getattr(args, "timeout", 900) or 900)
    last = None
    while True:
        s = fn(task_id)
        if s["state"] != last:
            print(f"[{family}] {task_id} -> {s['state']}", file=sys.stderr)
            last = s["state"]
        if s["done"]:
            break
        if time.time() - t0 > timeout:
            sys.exit(f"timeout apos {timeout}s. Consulte depois: python3 kie.py status {family} {task_id}")
        time.sleep(6 if family == "market" else 10)
    if not s["ok"]:
        log_usage({"project": getattr(args, "project", None), "model": model, "taskId": task_id,
                   "credits": 0, "status": "fail", "msg": s.get("fail")})
        sys.exit(f"FALHOU: {s.get('fail') or s['raw']}")
    files = []
    outdir = getattr(args, "out", None) or "./ddg-studio-out"
    prefix = (getattr(args, "name", None) or model.split("/")[-1]) + "-" + task_id[:8]
    for i, u in enumerate(s["urls"]):
        files.append(download(u, outdir, prefix if len(s["urls"]) == 1 else f"{prefix}-{i+1}"))
    credits = s.get("credits") if s.get("credits") is not None else est
    log_usage({"project": getattr(args, "project", None), "model": model, "taskId": task_id,
               "credits": credits, "status": "success", "files": files, "urls": s["urls"], **(extra or {})})
    print(json.dumps({"taskId": task_id, "model": model, "credits": credits, "files": files, "urls": s["urls"]},
                     ensure_ascii=False, indent=1))
    print(f"[ok] {fmt_cost(credits or 0)} | arquivos: {', '.join(files)} | ATENCAO: URLs expiram em 14 dias, o arquivo local e a copia oficial.", file=sys.stderr)
    return files

# ---------- comandos ----------
def cmd_credit(args):
    d = ok(api("GET", "/api/v1/chat/credit"), "credit")
    print(f"{d} creditos (~US$ {usd(float(d)):.2f})")
    if float(d) < 200:
        print("[aviso] saldo baixo (<200). Avise o Lucas pra recarregar.", file=sys.stderr)

def cmd_estimate(args):
    est = estimate(args.model, args)
    n = args.n or 1
    if est is None:
        sys.exit("modelo sem tabela local. Veja references/catalogo-modelos.md ou o JSON de precos.")
    print(f"{args.model} x{n}: {fmt_cost(est * n)}")

def _send(model, args, inp, refs, extra_log):
    if getattr(args, "dry", False):
        print(json.dumps({"model": model, "input": inp}, ensure_ascii=False, indent=1)); return []
    n = args.n or 1
    est = guard(model, args, n)
    files = []
    for _ in range(n):
        tid = market_create(model, inp)
        files += wait_and_download("market", tid, args, model, est / n, extra_log)
    return files

def cmd_image(args):
    model = args.model
    refs = resolve_refs(args.ref) if not getattr(args, "dry", False) else (args.ref or [])
    inp, notes = build_input(model, args, refs)
    for nt in notes: print(f"[aviso] {nt}", file=sys.stderr)
    if inp is not None:
        return _send(model, args, inp, refs, {"prompt": args.prompt[:200], "refs": refs})
    inp = {"prompt": args.prompt}
    # nomes de campo variam por familia
    if model.startswith("nano-banana-2") and not model.endswith("lite"):
        if refs: inp["image_input"] = refs
        inp["aspect_ratio"] = args.ar or "auto"
        inp["resolution"] = (args.res or "1K").upper()
        inp["output_format"] = args.format or "png"
    elif model == "nano-banana-2-lite" or model == "google/nano-banana-edit":
        if refs: inp["image_urls"] = refs
        inp["aspect_ratio"] = args.ar or "auto"
        if model == "google/nano-banana-edit":
            inp["output_format"] = args.format or "png"
    elif model == "google/nano-banana":
        inp["aspect_ratio"] = args.ar or "1:1"
        inp["output_format"] = args.format or "png"
    elif model.startswith("google/imagen4"):
        inp["aspect_ratio"] = args.ar or "16:9"
    elif model.startswith("flux-2/"):
        if refs: inp["input_urls"] = refs
        inp["aspect_ratio"] = args.ar or "1:1"
        inp["resolution"] = (args.res or "1K").upper()
    elif model.startswith("seedream/"):
        if refs: inp["image_urls"] = refs
        inp["aspect_ratio"] = args.ar or "1:1"
        inp["output_format"] = args.format or "png"
        if "5-pro" in model: inp["resolution"] = (args.res or "1K").upper()
    elif model.startswith("gpt-image-2"):
        if refs: inp["image_urls"] = refs
        inp["aspect_ratio"] = args.ar or "1:1"
        inp["resolution"] = (args.res or "1K").upper()
    elif model.startswith("ideogram/"):
        if refs: inp["image_urls"] = refs
        ar_map = {"1:1": "square_hd", "16:9": "landscape_16_9", "9:16": "portrait_16_9", "4:3": "landscape_4_3", "3:4": "portrait_4_3", "4:5": "portrait_4_3", "3:2": "landscape_4_3", "2:3": "portrait_4_3"}
        inp["image_size"] = ar_map.get(args.ar or "1:1", "square_hd")
        inp["rendering_speed"] = (args.quality or "BALANCED").upper()
    elif model.startswith("qwen"):
        if refs: inp["image_urls"] = refs
        inp["aspect_ratio"] = args.ar or "1:1"
    elif model == "recraft/remove-background":
        inp = {"image": refs[0]}
    elif model == "recraft/crisp-upscale":
        inp = {"image": refs[0]}
    elif model == "topaz/image-upscale":
        inp = {"image_url": refs[0], "upscale_factor": args.upscale or "2"}
    else:
        if refs: inp["image_urls"] = refs
        if args.ar: inp["aspect_ratio"] = args.ar
    if args.extra:
        inp.update(json.loads(args.extra))
    n = args.n or 1
    est = guard(model, args, n)
    files = []
    for i in range(n):
        tid = market_create(model, inp)
        files += wait_and_download("market", tid, args, model, est / n, {"prompt": args.prompt[:200], "refs": refs})
    return files

def cmd_video(args):
    model = args.model
    refs = resolve_refs(args.ref) if not getattr(args, "dry", False) else (args.ref or [])
    dur = str(args.duration or 5)
    res = args.res or "720p"
    args.res = res
    inp, notes = build_input(model, args, refs)
    for nt in notes: print(f"[aviso] {nt}", file=sys.stderr)
    if inp is not None:
        return _send(model, args, inp, refs, {"prompt": (args.prompt or "")[:200], "refs": refs, "duration": dur, "res": res})
    inp = {"prompt": args.prompt}
    if model.startswith("kling/v3-turbo") or model.startswith("kling/v3-omni"):
        if refs: inp["image_urls"] = refs
        inp["duration"] = dur; inp["resolution"] = res
    elif model == "kling-3.0/video":
        if refs: inp["image_urls"] = refs          # [primeiro, ultimo] frame
        inp["duration"] = dur; inp["mode"] = args.mode or "std"
        if not refs: inp["aspect_ratio"] = args.ar or "16:9"
        inp["sound"] = bool(args.audio)
    elif model.startswith("bytedance/seedance-2"):
        # 1 ref = primeiro frame; 2 refs = primeiro+ultimo; --mode reference = imagens de referencia (estilo/personagem)
        if refs and (args.mode == "reference" or len(refs) > 2): inp["reference_image_urls"] = refs
        elif refs:
            inp["first_frame_url"] = refs[0]
            if len(refs) == 2: inp["last_frame_url"] = refs[1]
        inp["resolution"] = res; inp["aspect_ratio"] = args.ar or "16:9"
        inp["duration"] = int(dur); inp["generate_audio"] = bool(args.audio)
    elif model.startswith("wan/2-7"):
        if refs:
            inp["first_frame_url"] = refs[0]
            if len(refs) > 1: inp["last_frame_url"] = refs[1]
        inp["resolution"] = res; inp["duration"] = int(dur)
    elif model.startswith("pixverse/"):
        if refs: inp["image_urls"] = refs
        inp["quality"] = res; inp["duration"] = int(dur)
        inp["generate_audio_switch"] = bool(args.audio)
    elif model.startswith("grok-imagine/"):
        if refs: inp["image_urls"] = refs
        inp["resolution"] = res; inp["duration"] = int(dur)
        inp["aspect_ratio"] = args.ar or "16:9"
    elif model.startswith("minimax-h3/"):
        if refs: inp["image_urls"] = refs
        inp["resolution"] = res if res != "720p" else "768p"; inp["duration"] = int(dur)
    elif model.startswith("hailuo/"):
        if refs: inp["image_url"] = refs[0]
        inp["duration"] = int(dur); inp["resolution"] = res if res != "720p" else "768P"
    elif model == "topaz/video-upscale":
        inp = {"video_url": refs[0], "upscale_factor": args.upscale or "2"}
    else:
        if refs: inp["image_urls"] = refs
        inp["duration"] = dur; inp["resolution"] = res
        if args.ar: inp["aspect_ratio"] = args.ar
    if args.extra:
        inp.update(json.loads(args.extra))
    n = args.n or 1
    est = guard(model, args, n)
    for _ in range(n):
        tid = market_create(model, inp)
        wait_and_download("market", tid, args, model, est / n, {"prompt": args.prompt[:200], "refs": refs, "duration": dur, "res": res})

def cmd_veo(args):
    model = args.model or "veo3_fast"
    refs = resolve_refs(args.ref)
    args.res = (args.res or "720p")
    body = {"prompt": args.prompt, "model": model, "aspect_ratio": args.ar or "16:9",
            "resolution": args.res, "duration": int(args.duration or 8)}
    if refs:
        body["imageUrls"] = refs
        body["generationType"] = "FIRST_AND_LAST_FRAMES_2_VIDEO" if len(refs) == 2 else (args.gen_type or "REFERENCE_2_VIDEO" if len(refs) > 2 else "FIRST_AND_LAST_FRAMES_2_VIDEO")
    if args.extra:
        body.update(json.loads(args.extra))
    setattr(args, "res", args.res.upper())
    est = guard(model, args, args.n or 1)
    for _ in range(args.n or 1):
        d = ok(api("POST", "/api/v1/veo/generate", body), "veo generate")
        wait_and_download("veo", d["taskId"], args, model, est / (args.n or 1), {"prompt": args.prompt[:200], "refs": refs})

def cmd_runway(args):
    refs = resolve_refs(args.ref)
    body = {"prompt": args.prompt, "duration": int(args.duration or 5), "quality": args.res or "720p",
            "aspectRatio": args.ar or "16:9"}
    if refs: body["imageUrl"] = refs[0]
    if args.extra: body.update(json.loads(args.extra))
    est = guard("runway", args, args.n or 1)
    for _ in range(args.n or 1):
        d = ok(api("POST", "/api/v1/runway/generate", body), "runway generate")
        wait_and_download("runway", d["taskId"], args, "runway", est / (args.n or 1), {"prompt": args.prompt[:200]})

def cmd_tts(args):
    model = args.model or "elevenlabs/text-to-speech-multilingual-v2"
    inp = {"text": args.text, "voice": args.voice or "Rachel"}
    if args.extra: inp.update(json.loads(args.extra))
    est = guard(model, args)
    tid = market_create(model, inp)
    wait_and_download("market", tid, args, model, est, {"chars": len(args.text)})

def cmd_music(args):
    body = {"prompt": args.prompt, "customMode": bool(args.style or args.title),
            "instrumental": bool(args.instrumental), "model": args.model or "V4_5",
            "callBackUrl": args.callback or "https://example.com/ddg-studio-noop"}
    if args.style: body["style"] = args.style
    if args.title: body["title"] = args.title
    if args.extra: body.update(json.loads(args.extra))
    est = guard("suno", args)
    d = ok(api("POST", "/api/v1/generate", body), "suno generate")
    wait_and_download("suno", d["taskId"], args, "suno", est, {"prompt": args.prompt[:200], "style": args.style})

def cmd_run(args):
    inp = json.loads(args.input)
    est = guard(args.model, args)
    tid = market_create(args.model, inp, args.callback)
    if args.no_wait:
        print(tid); return
    wait_and_download("market", tid, args, args.model, est, {"input": inp})

def cmd_status(args):
    s = STATUS[args.family](args.task_id)
    print(json.dumps({k: v for k, v in s.items() if k != "raw"}, ensure_ascii=False, indent=1))
    if args.raw: print(json.dumps(s["raw"], ensure_ascii=False, indent=1))

def cmd_wait(args):
    wait_and_download(args.family, args.task_id, args, args.model or args.family, 0)

def cmd_log(args):
    if not LOG.exists():
        print("sem uso registrado"); return
    by = {}
    for line in LOG.read_text().splitlines():
        try: e = json.loads(line)
        except Exception: continue
        if args.days:
            d0 = (datetime.date.today() - datetime.timedelta(days=args.days)).isoformat()
            if e.get("ts", "") < d0: continue
        k = e.get("project") or "sem-projeto"
        by.setdefault(k, {"jobs": 0, "credits": 0.0, "fails": 0, "models": {}})
        by[k]["jobs"] += 1
        by[k]["credits"] += float(e.get("credits") or 0)
        if e.get("status") == "fail": by[k]["fails"] += 1
        m = e.get("model", "?"); by[k]["models"][m] = by[k]["models"].get(m, 0) + 1
    tot = 0
    for k, v in sorted(by.items(), key=lambda kv: -kv[1]["credits"]):
        tot += v["credits"]
        print(f"{k:30} {v['jobs']:4} jobs  {fmt_cost(v['credits']):32} falhas={v['fails']}  modelos={v['models']}")
    print(f"{'TOTAL':30} {fmt_cost(tot)}")

# ---------- catalogo / roteador ----------
# modelos cuja linha de preco nao traz o id (prefixo da descricao em kie.ai/pricing)
DESC_PREFIX = {"kling-3.0/video": "kling 3.0, video", "kling/v3-turbo-image-to-video": "kling 3.0 turbo, image",
    "kling/v3-turbo-text-to-video": "kling 3.0 turbo, text", "kling-3.0/motion-control": "kling 3.0 motion control",
    "kling-2.6/motion-control": "kling 2.6 motion control", "pixverse-v6/text-to-video": "pixverse-v6, text /image",
    "wan/3-0-video": "wan 3.0 video", "wan/3-0-video-prime": "wan3.0 video prime", "nano-banana-pro": "google nano banana pro",
    "nano-banana-2": "google nano banana 2,", "google/nano-banana": "google nano banana,", "topaz/image-upscale": "topaz image",
    "topaz/video-upscale": "topaz video", "recraft/remove-background": "recraft remove", "recraft/crisp-upscale": "recraft crisp",
    "z-image": "qwen z-image", "infinitalk/from-audio": "meigen-ai infinitetalk", "volcengine/video-to-video-lip-sync": "volcengine",
    "elevenlabs/text-to-dialogue-v3": "elevenlabs v3", "gpt-image-2-5-flare-text-to-image": "gpt-image-2-5-flare, text",
    "gpt-image-2-5-flare-image-to-image": "gpt-image-2-5-flare, image", "qwen2-1/text-to-image": "qwen-image-2.1, text",
    "wan/2-7-image": "wan 2.7 image", "bytedance/seedream": "seedream 3.0", "wan/2-2-animate-move": "wan 2.2 animate, 2.2 animate move",
    "wan/2-2-animate-replace": "wan 2.2 animate, 2.2 animate replace", "wan/2-2-a14b-speech-to-video-turbo": "wan 2.2 a14b turbo api speech",
    "google/gemini-3-8-flash-tts": "gemini 3.8 flash tts", "google/gemini-3-8-flash-lite-tts": "gemini 3.8 flash-lite tts",
    "google/gemini-3-1-flash-tts": "gemini 3.1 flash tts", "google/gemini-2-5-pro-tts": "gemini 2.5 pro tts"}

def _price_rows(model):
    fs = sorted(REF_DIR.glob("precos-kie-*.json"))
    if not fs: return []
    f = fs[-1]
    rows = json.loads(f.read_text())
    out = [r for r in rows if ("model=" + urllib.parse.quote(model, safe="")) in (r.get("anchor") or "")]
    if not out:  # sem anchor: o id aparece literalmente na descricao?
        pre = DESC_PREFIX.get(model, model.lower() + ",")
        out = [r for r in rows if r["modelDescription"].lower().startswith(pre)]
    if not out:  # ultimo recurso: palavras do id
        toks = [t for t in model.replace("/", " ").replace("-", " ").split() if len(t) > 1 and t not in ("to", "image", "video", "text")]
        out = [r for r in rows if toks and all(t.lower() in r["modelDescription"].lower().replace("-", " ").replace(".", " ") for t in toks[:2])]
    return [f'{r["modelDescription"]} = {r["creditPrice"]} cr {r["creditUnit"]}' for r in out]

def cmd_models(args):
    s = schemas(); q = (args.termo or "").lower()
    for k in sorted(s):
        v = s[k]
        if args.kind and v["kind"] != args.kind: continue
        if q and q not in k.lower() and q not in (v.get("title") or "").lower(): continue
        p = PRICES.get(k)
        tag = "" if p is None else (" | tabela local" if callable(p) else f" | {p} cr")
        print(f"{v['kind']:6} {k:46} {(v.get('title') or '')[:48]}{tag}")

def cmd_info(args):
    v = schemas().get(args.model)
    if not v: sys.exit(f"{args.model} nao esta no catalogo. Use: kie.py models <termo>")
    print(f"# {args.model}  ({v['kind']})  {v.get('title')}\ndoc: {v['doc']}\nendpoint: {v['path']}\n\ncampos (* = obrigatorio):")
    for k, d in v["fields"].items():
        e = d.get("enum") or (f"<{d['enum_n']} opcoes>" if d.get("enum_n") else "")
        extra = " ".join(f"{a}={d[a]}" for a in ("default", "maxItems", "minimum", "maximum") if a in d)
        print(f"  {k}{'*' if d.get('req') else ''} ({d['t']}) {e} {extra}\n      {d['desc'][:200]}")
    rows = _price_rows(args.model)
    print("\npreco (kie.ai/pricing 2026-10-16):"); print("\n".join("  " + r for r in rows) or "  (sem linha de preco; conferir em kie.ai/pricing)")
    if v.get("example"): print("\nexemplo oficial de input:\n" + json.dumps(v["example"], ensure_ascii=False, indent=1))

def cmd_route(args):
    key = (args.intencao or "").lower()
    key = ALIASES.get(key, key)
    if key not in ROUTER:
        print("intencoes: " + ", ".join(ROUTER) + "\napelidos: " + ", ".join(f"{a}->{b}" for a, b in ALIASES.items())); return
    for camada in (["eco", "padrao", "premium"] if not args.camada else [args.camada]):
        m, opts, why = ROUTER[key][camada]
        cmd = "veo" if m.startswith("veo3") else "runway" if m == "runway" else "music" if m == "suno" else \
              "tts" if ("tts" in m or "elevenlabs" in m) else ("video" if schemas().get(m, {}).get("kind") == "video" else "image")
        print(f"[{camada:7}] {m:44} {why}\n          python3 kie.py {cmd} --model {m} {opts} --prompt \"...\" --project <cliente>")

# ---------- parser ----------
def common(p, video=False):
    p.add_argument("--project", help="tag do projeto (vai pro log de gastos)")
    p.add_argument("--out", help="pasta de saida (default ./ddg-studio-out)")
    p.add_argument("--name", help="prefixo do arquivo")
    p.add_argument("--n", type=int, help="quantas variacoes")
    p.add_argument("--yes", action="store_true", help="confirma jobs acima do limite de gasto")
    p.add_argument("--extra", help="JSON com campos extras do input")
    p.add_argument("--timeout", type=int, default=900)
    p.add_argument("--dry", action="store_true", help="so mostra o input que seria enviado (nao gasta credito)")
    p.add_argument("--negative", help="negative_prompt (modelos que aceitam)")

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sp = ap.add_subparsers(dest="cmd", required=True)

    sp.add_parser("credit").set_defaults(fn=cmd_credit)

    p = sp.add_parser("estimate"); p.add_argument("--model", required=True); p.add_argument("--res"); p.add_argument("--duration", type=int); p.add_argument("--n", type=int); p.add_argument("--text", default="")
    p.add_argument("--audio", action="store_true"); p.add_argument("--quality"); p.add_argument("--upscale")
    p.set_defaults(fn=cmd_estimate)

    p = sp.add_parser("upload"); p.add_argument("file"); p.add_argument("--path", default="ddg-studio"); p.set_defaults(fn=cmd_upload)

    p = sp.add_parser("image"); common(p)
    p.add_argument("--model", default="nano-banana-2-1"); p.add_argument("--prompt", default="")
    p.add_argument("--ref", action="append", help="URL ou arquivo local (repetivel)")
    p.add_argument("--ar", help="aspect ratio ex 16:9, 9:16, 1:1, 4:5"); p.add_argument("--res", help="1K|2K|4K (seedream 5 pro: 1K=basic, 2K=high)")
    p.add_argument("--format", help="png|jpg|webp"); p.add_argument("--quality", help="ideogram: TURBO|BALANCED|QUALITY")
    p.add_argument("--upscale", help="fator 2|4 (topaz)")
    p.set_defaults(fn=cmd_image)

    p = sp.add_parser("video"); common(p)
    p.add_argument("--model", default="kling/v3-turbo-image-to-video"); p.add_argument("--prompt", default="")
    p.add_argument("--ref", action="append"); p.add_argument("--duration", type=int, default=5)
    p.add_argument("--res", default="720p"); p.add_argument("--ar"); p.add_argument("--audio", action="store_true")
    p.add_argument("--mode", help="kling-3.0: std|pro ; seedance: reference (usa refs como referencia em vez de frames)"); p.add_argument("--upscale")
    p.set_defaults(fn=cmd_video)

    p = sp.add_parser("veo"); common(p)
    p.add_argument("--model", default="veo3_fast", help="veo3_lite|veo3_fast|veo3"); p.add_argument("--prompt", required=True)
    p.add_argument("--ref", action="append"); p.add_argument("--duration", type=int, default=8)
    p.add_argument("--res", default="720p"); p.add_argument("--ar", default="16:9"); p.add_argument("--gen-type")
    p.set_defaults(fn=cmd_veo)

    p = sp.add_parser("runway"); common(p)
    p.add_argument("--prompt", required=True); p.add_argument("--ref", action="append")
    p.add_argument("--duration", type=int, default=5); p.add_argument("--res", default="720p"); p.add_argument("--ar", default="16:9")
    p.set_defaults(fn=cmd_runway)

    p = sp.add_parser("tts"); common(p)
    p.add_argument("--text", required=True); p.add_argument("--voice"); p.add_argument("--model")
    p.set_defaults(fn=cmd_tts)

    p = sp.add_parser("music"); common(p)
    p.add_argument("--prompt", required=True); p.add_argument("--style"); p.add_argument("--title")
    p.add_argument("--instrumental", action="store_true"); p.add_argument("--model", help="V4_5|V4_5PLUS|V5"); p.add_argument("--callback")
    p.set_defaults(fn=cmd_music)

    p = sp.add_parser("run"); common(p)
    p.add_argument("--model", required=True); p.add_argument("--input", required=True, help="JSON do input")
    p.add_argument("--callback"); p.add_argument("--no-wait", action="store_true")
    p.set_defaults(fn=cmd_run)

    p = sp.add_parser("status"); p.add_argument("family", choices=list(STATUS)); p.add_argument("task_id"); p.add_argument("--raw", action="store_true")
    p.set_defaults(fn=cmd_status)

    p = sp.add_parser("wait"); common(p); p.add_argument("family", choices=list(STATUS)); p.add_argument("task_id"); p.add_argument("--model")
    p.set_defaults(fn=cmd_wait)

    p = sp.add_parser("log"); p.add_argument("--days", type=int); p.set_defaults(fn=cmd_log)

    p = sp.add_parser("models", help="lista o catalogo oficial (157 modelos)"); p.add_argument("termo", nargs="?"); p.add_argument("--kind", choices=["image", "video", "audio", "other"])
    p.set_defaults(fn=cmd_models)
    p = sp.add_parser("info", help="campos oficiais + preco de um modelo"); p.add_argument("model"); p.set_defaults(fn=cmd_info)
    p = sp.add_parser("route", help="qual modelo usar pra uma intencao"); p.add_argument("intencao", nargs="?"); p.add_argument("--camada", choices=["eco", "padrao", "premium"])
    p.set_defaults(fn=cmd_route)

    args = ap.parse_args()
    args.fn(args)

if __name__ == "__main__":
    main()
