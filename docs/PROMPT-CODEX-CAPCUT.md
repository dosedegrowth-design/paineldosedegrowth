# Prompt para o Codex (ou outro agente) — CapCut MCP

Cole o bloco abaixo como primeira mensagem. Ele já carrega as armadilhas
descobertas na prática, que é o que custa tempo descobrir sozinho.

---

Preciso que você configure e opere um servidor MCP que monta rascunhos do
CapCut por API, e depois monte um vídeo com ele. Trabalhe no macOS.

## Parte 1 — Setup

```bash
brew install ffmpeg          # OBRIGATÓRIO, ver armadilha 1
git clone https://github.com/fancyboi999/capcut-mcp.git
cd capcut-mcp
cp config.json.example config.json
# em config.json: "port": 9077 e "is_capcut_env": true
uv venv -p 3.12 .venv
uv pip install --python .venv/bin/python -r requirements.txt "mcp==1.13.1"
.venv/bin/python main.py      # sobe em 0.0.0.0:9077
```

O pin `mcp==1.13.1` evita conflito com o `fastapi-mcp 0.4.0`, que é quem monta
o endpoint `/mcp`. Para registrar no cliente:
`claude mcp add --transport sse capcut http://127.0.0.1:9077/mcp` (ou o
equivalente do seu cliente). O registro só vale em sessão nova.

## Parte 2 — O que a ferramenta faz

Ela monta o **projeto** do CapCut (pasta `dfd_*` com `draft_info.json`). Ela
**não renderiza nem exporta MP4** — o export é no app. O fluxo é:
`create_draft` → `add_video`/`add_audio`/`add_text`/`add_effect` → `save_draft`.

`save_draft` aceita `draft_folder`; aponte para
`~/Movies/CapCut/User Data/Projects/com.lveditor.draft` e o projeto aparece
direto no app, sem cópia manual.

## Parte 3 — Armadilhas (todas verificadas, não são teoria)

1. **Sem ffprobe falha em silêncio.** O log diz
   `using default values 1920x1080` e continua — todo corte por tempo sai errado.

2. **`add_effect` quebra com os parâmetros padrão.** O default de `params` é
   `None` e o código faz `params[::-1]` (`add_effect_impl.py:68`), estourando
   `'NoneType' object is not subscriptable`. **Sempre passe `"params": []`.**

3. **Os endpoints `get_*_types` são GET, não POST.** POST devolve
   `Method Not Allowed`. Use-os para descobrir nomes válidos antes de usar:
   `get_transition_types`, `get_text_intro_types` (76), `get_font_types` (335),
   `get_video_scene_effect_types` (345). Para texto em português,
   `Poppins_Bold` existe e funciona; o default `文轩体` é fonte chinesa.

4. **`query_draft_status` reporta `completed` mesmo com download falho.** Já vi
   `completed_files: 1` com a pasta `assets/` vazia. Confira os arquivos em
   disco depois de salvar.

5. **Caminho local funciona como `video_url`.** Apesar do nome do campo,
   `downloader.py:114` testa `os.path.isfile()` e copia direto — sem HTTP,
   sem bucket.

6. **O download é preguiçoso.** `add_video` só registra a origem; a cópia
   acontece no `save_draft`.

7. **O rascunho vive em memória e id desconhecido não dá erro.** O `DRAFT_CACHE`
   é um dict do processo. Se você mandar um `draft_id` que ele não conhece,
   `get_or_create_draft` **cria um rascunho novo vazio** e responde
   `success: true` com outro id. Confira o `draft_id` de cada resposta.

8. **Não existe preview ao vivo.** O CapCut lê o `draft_info.json` ao abrir o
   projeto. Feche o projeto no app antes de rodar `save_draft`, senão o app
   sobrescreve o que a API escreveu.

9. **Conta CapCut Pro logada não ajuda a API.** O servidor não faz login, não
   vê a nuvem do CapCut e não baixa nada de lá. Os vídeos precisam estar numa
   pasta comum no disco.

## Parte 4 — O trabalho

Os vídeos estão em `<PASTA>`. São clipes de <DESCREVA: lancha, praia, ilhas>.
Não sei quantos são nem a duração de cada um — descubra com `ffprobe`.

Monte <N> variações de um vídeo vertical 1080x1920 para Reels, cada uma com
música diferente (arquivos em `<PASTA_MUSICAS>`), com:

- os clipes na ordem do percurso (não alfabética — veja o conteúdo e decida)
- um trecho bom de cada clipe, evitando o começo (câmera se acomodando)
- transição entre os cortes
- trilha por baixo, com o som ambiente dos clipes abaixado (~0.15)
- legenda curta em português sobre cada trecho, com contorno preto para ler
  sobre qualquer imagem

Salve cada variação direto na pasta de rascunhos do CapCut e me diga o nome
da pasta (`dfd_*`) de cada uma.

Antes de montar, me mostre o plano de cortes (arquivo, trecho escolhido,
legenda) para eu revisar.
