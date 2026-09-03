# Como gerar os 4 projetos no CapCut

## Uma vez só

```bash
brew install ffmpeg

git clone https://github.com/fancyboi999/capcut-mcp.git
cd capcut-mcp
cp config.json.example config.json     # troque "port" para 9077
uv venv -p 3.12 .venv
uv pip install --python .venv/bin/python -r requirements.txt "mcp==1.13.1"
.venv/bin/python main.py &             # servidor em 127.0.0.1:9077
```

Os scripts estão no repo do painel, branch `claude/capcut-mcp-setup-93ehvg`,
na pasta `scripts/`.

## Toda vez

**1. Todos os vídeos numa pasta só, com os nomes originais do WhatsApp:**

```
~/Movies/lancha/WhatsApp_Video_20260826_at_16.43.51.mp4
~/Movies/lancha/WhatsApp_Video_20260827_at_06.05.48.mp4
...
```

**2. Normalizar** (obrigatório — três clipes estão gravados como 1280x720 com
rotação embutida e entram deitados no CapCut sem esse passo):

```bash
python3 scripts/normalizar-clipes.py ~/Movies/lancha ~/Movies/lancha-prontos
```

Sai tudo em 1080x1920, com o mesmo nome de arquivo.

**3. Gerar os projetos** (feche o CapCut antes):

```bash
for r in 1-o-passeio 2-gancho-rapido 3-contemplativo 4-experiencia; do
  python3 scripts/capcut-montagem-percurso.py --roteiro $r.json \
      --draft-folder "$HOME/Movies/CapCut/User Data/Projects/com.lveditor.draft"
done
```

Cada um imprime `PASTA DO RASCUNHO: dfd_cat_...`. Abra o CapCut e os quatro
projetos estarão lá.

## A trilha

Os quatro MP3 deste pacote são trilhas originais, geradas para estas peças —
sem risco de direitos autorais, que é o que costuma derrubar anúncio com áudio
em alta. **Copie os quatro para a mesma pasta dos clipes normalizados**
(`~/Movies/lancha-prontos`), senão o script para com "arquivo nao encontrado".

Cada roteiro já aponta para a sua:

| Variação | Trilha | Andamento |
|---|---|---|
| 1 · O Passeio | `trilha-1-passeio-corte.mp3` | 110 BPM, tropical house |
| 2 · Gancho Rápido | `trilha-2-gancho-corte.mp3` | 125 BPM, pop energético |
| 3 · Contemplativo | `trilha-3-contemplativo-corte.mp3` | ambiente, sem percussão no início |
| 4 · Experiência | `trilha-4-experiencia-corte.mp3` | house solar |

Todas já vêm cortadas no tamanho do vídeo, com fade no fim. O som ambiente dos
clipes fica em 0.12 e a trilha em 0.75.

Se preferir áudio em alta do CapCut, apague a linha `"musica"` do JSON e ponha
a faixa dentro do app.

## Mudar alguma coisa

Tudo está no JSON, é texto:

- `legenda` — o texto sobre o trecho
- `posicao` — `cima`, `meio` ou `baixo`
- `tamanho` — multiplicador do tamanho da fonte (1.35 no CTA, por exemplo)
- `inicio` — em que segundo do arquivo original o trecho começa
- `duracao` — quanto tempo ele fica
- `trecho` — duração padrão de todos os cortes
- ordem dos clipes — a ordem na lista `clipes`
- `transicao` — nomes válidos em `GET http://127.0.0.1:9077/get_transition_types`

Para revisar antes de abrir o CapCut:

```bash
python3 scripts/previa-roteiro.py 1-o-passeio.json previa.mp4
```
