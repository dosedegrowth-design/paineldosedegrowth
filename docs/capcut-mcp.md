# CapCut MCP — edição de vídeo por API

Setup do [capcut-mcp](https://github.com/fancyboi999/capcut-mcp) para montar rascunhos
(*drafts*) do CapCut programaticamente, via MCP ou HTTP.

## O que a ferramenta faz (e o que não faz)

Ela **monta o projeto** do CapCut — gera uma pasta `dfd_*` com `draft_info.json`,
tracks e materiais baixados. Ela **não renderiza nem exporta MP4**.

O fluxo é: API monta a timeline → você abre no CapCut desktop → revisa → exporta.

## Requisitos

| Requisito | Observação |
|---|---|
| Python 3.12 | O README pede 3.8.20; 3.12 funciona sem ajuste |
| **ffmpeg + ffprobe** | **Obrigatório.** Sem isso o download de mídia falha e as dimensões/duração caem em `1920x1080` fixo |
| CapCut desktop | Para abrir e exportar o rascunho |
| Rede de saída | O servidor baixa cada mídia pela URL informada |

## Instalação

```bash
# ffmpeg
brew install ffmpeg              # macOS
sudo apt-get install -y ffmpeg   # Ubuntu/Debian

git clone https://github.com/fancyboi999/capcut-mcp.git
cd capcut-mcp
cp config.json.example config.json

uv venv -p 3.12 .venv
uv pip install --python .venv/bin/python -r requirements.txt "mcp==1.13.1"
```

O pin `mcp==1.13.1` evita conflito com o `fastapi-mcp 0.4.0`, que é quem monta
o endpoint `/mcp`.

### config.json

```jsonc
{
  "is_capcut_env": true,     // true = CapCut internacional | false = JianYing (CN)
  "port": 9077,              // lido por settings/local.py e usado pelo main.py
  "is_upload_draft": false,  // true exige oss_config preenchido
  "draft_domain": "https://www.install-ai-guider.top",
  "preview_router": "/draft/downloader"
}
```

Com `is_upload_draft: false` o campo `draft_url` das respostas volta **vazio** —
é o esperado. O link de preview só existe com OSS configurado.

### Rodar

```bash
.venv/bin/python main.py
# Uvicorn running on http://0.0.0.0:9077
```

### Registrar no Claude Code

```bash
claude mcp add --transport sse capcut http://127.0.0.1:9077/mcp
claude mcp list   # capcut: ... (SSE) - Connected
```

O registro só entra em vigor numa **sessão nova** do Claude — o toolbelt é montado
na inicialização.

## Fluxo de trabalho

```
create_draft → add_video / add_audio / add_text / add_effect ... → save_draft
                                                                      ↓
                                              pasta dfd_* na raiz do capcut-mcp
                                                                      ↓
                                            copiar para a pasta de rascunhos do CapCut
```

`save_draft` aceita `draft_folder`: aponte direto para a pasta de rascunhos do
CapCut e o projeto aparece no app sem cópia manual.

Pastas de rascunho por SO:

- **macOS**: `~/Movies/CapCut/User Data/Projects/com.lveditor.draft`
- **Windows**: `%LOCALAPPDATA%\CapCut\User Data\Projects\com.lveditor.draft`

## Gotchas (todos verificados na prática)

1. **`add_effect` quebra sem `params`.** O default é `None` e o código faz
   `params[::-1]` (`add_effect_impl.py:68`), estourando
   `'NoneType' object is not subscriptable`. **Sempre passe `"params": []`.**

2. **Os endpoints `get_*_types` são GET, não POST.** Um POST devolve
   `{"detail":"Method Not Allowed"}`. Use-os para descobrir nomes válidos:
   `get_transition_types` (ex.: `Dissolve`, `White_Flash`), `get_text_intro_types`
   (76 opções), `get_font_types` (335), `get_video_scene_effect_types` (345).

3. **`query_draft_status` reporta `completed` mesmo com download falho.**
   Já vi `"completed_files": 1` com `assets/video/` vazio. Sempre confira os
   arquivos em disco depois do `save_draft`.

4. **Sem ffprobe, falha silenciosa.** O log mostra
   `using default values 1920x1080` e segue — qualquer corte por tempo sai errado.

5. **Caminho local funciona.** Apesar do nome do campo ser `video_url`,
   `downloader.py:114` testa `os.path.isfile()` antes e, se for arquivo local,
   copia direto — sem HTTP, sem bucket. Passe `/Users/voce/Movies/clipe.mp4`
   normalmente.

6. **O download é preguiçoso.** `add_video` só registra a origem; a cópia/download
   real acontece no `save_draft`.

7. **O rascunho vive em memória, e id desconhecido não dá erro.** O `DRAFT_CACHE`
   (`draft_cache.py`) é um dict em memória do processo; nada vai pro disco antes do
   `save_draft`. Pior: se você mandar um `draft_id` que o servidor não conhece,
   `get_or_create_draft` **cria um rascunho novo vazio** e responde
   `success: true` com um id diferente. Se o servidor reiniciar no meio do
   trabalho, as chamadas seguintes vão silenciosamente para um rascunho novo.
   Sempre confira o `draft_id` que volta em cada resposta.

## Não existe preview ao vivo

O CapCut lê o `draft_info.json` quando abre o projeto — ele não observa o arquivo.
Então o ciclo é: montar → `save_draft` → (re)abrir o projeto no CapCut.

**Feche o projeto no CapCut antes de rodar o `save_draft`.** O app mantém o estado
em memória e pode sobrescrever o arquivo ao salvar ou fechar, descartando o que a
API escreveu.

Para preview sem abrir o app, é preciso `is_upload_draft: true` + `oss_config`
preenchido; aí `generate_draft_url` devolve um link. Sem isso o `draft_url` das
respostas volta vazio.

## Exemplo validado

Monta um vertical 1080x1920 de 14s com 2 clipes, transição, trilha, 2 textos e efeito:

```python
import json, urllib.request
API = "http://127.0.0.1:9077"

def call(ep, payload):
    req = urllib.request.Request(f"{API}/{ep}", data=json.dumps(payload).encode(),
                                 headers={"Content-Type": "application/json"})
    r = json.loads(urllib.request.urlopen(req, timeout=180).read())
    if not r.get("success"):
        raise SystemExit(f"FALHOU {ep}: {r.get('error')}")
    return r["output"]

did = call("create_draft", {"width": 1080, "height": 1920})["draft_id"]

call("add_video", {"draft_id": did, "video_url": "https://.../clipe_a.mp4",
                   "start": 0, "end": 8, "target_start": 0, "volume": 0.8})
call("add_video", {"draft_id": did, "video_url": "https://.../clipe_b.mp4",
                   "start": 0, "end": 6, "target_start": 8,
                   "transition": "Dissolve", "transition_duration": 0.6})
call("add_audio", {"draft_id": did, "audio_url": "https://.../trilha.mp3",
                   "start": 0, "end": 12, "volume": 0.25})
call("add_text",  {"draft_id": did, "text": "Dose de Growth", "start": 0.5, "end": 4,
                   "font_color": "#F15839", "font_size": 16, "transform_y": -0.6,
                   "intro_animation": "Fade_In"})
call("add_effect", {"draft_id": did, "effect_type": "Fade_In",
                    "start": 0, "end": 1.5, "params": []})   # params obrigatório

call("save_draft", {"draft_id": did, "draft_folder": "<pasta de rascunhos do CapCut>"})
```

Resultado conferido no `draft_info.json`: 14s totais, canvas 1080x1920,
`video_main` com 2 segmentos (0-8s, 8-14s), `audio_main` 0-12s,
`effect_01` 0-1.5s, `text_main` com 2 segmentos.

## Script pronto: cortar em 3 trechos

`scripts/capcut-cortar-3-partes.py` corta um vídeo em 3 trechos (começo, meio e
fim), descarta as sobras, põe uma legenda em português sobre cada um e salva o
rascunho direto na pasta do CapCut:

```bash
python3 scripts/capcut-cortar-3-partes.py \
    --video "$HOME/Movies/meus-videos/meu-video.mp4" \
    --draft-folder "$HOME/Movies/CapCut/User Data/Projects/com.lveditor.draft"
```

Ele lê a duração real com `ffprobe` e calcula os pontos de corte sozinho, então
serve para qualquer vídeo. `--trecho` muda a duração de cada corte (padrão 5s).
As legendas ficam na constante `LEGENDAS`, no topo do arquivo.

## Limitações no Claude Code na web

O container remoto é efêmero e o egress externo é filtrado por política da
organização — baixar mídia de domínios arbitrários retorna `403 Forbidden` e não
deve ser contornado. Para produção, rode na máquina local, que é onde o CapCut
está instalado de qualquer forma.
