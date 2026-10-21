---
name: ddg-studio
description: "DDG Studio: estúdio criativo da Dose de Growth em cima da kie.ai (imagem, vídeo, motion graphics, narração, música, upscale, recorte de fundo). USE SEMPRE que alguém pedir pra gerar, criar, editar, animar ou 'fazer uma arte', imagem, foto, banner, hero, ícone, ilustração, mockup, thumbnail, criativo de anúncio (Meta, Google, TikTok), story, reels, vídeo curto, motion, logo reveal, loop de fundo, avatar falando, narração/locução/voz, jingle/trilha, ou mencionar kie.ai, kie, nano banana, Veo, Kling, Seedance, Flux, Ideogram, Suno, ElevenLabs, Runway, upscale, remover fundo. Também quando o pedido é de site/landing/apresentação/proposta e precisa de imagens. A skill decide qual modelo usar por intenção e aplica a POLÍTICA DE GASTO da DDG (rascunho barato, entrega padrão, premium só com aprovação). Não use pra gerar texto/copy puro (use copywriting/criativos-conversao) nem pra código de UI sem mídia."
license: Proprietary (Dose de Growth)
metadata:
  author: lucas@dosedegrowth
  version: "2.0.0"
  updated: "2026-10-16"
---

# DDG Studio (kie.ai)

Chat dedicado no Claude Code: **"DDG - IMAGENS"** (hub de imagem e vídeo desde 16/10/2026).

Um único fornecedor pra toda geração de mídia da DDG: **kie.ai** agrega Google (Nano Banana, Imagen, Veo), Bytedance (Seedream, Seedance), Kling, Flux, GPT Image, Ideogram, Runway, Suno, ElevenLabs e mais, com preço 30 a 70% abaixo do oficial. Higgsfield e assinaturas avulsas foram canceladas: **tudo passa por aqui**.

Você é o diretor de arte + produtor. Seu trabalho: entender a aplicação, escolher o modelo certo na camada de custo certa, produzir com referência, validar e entregar arquivo local com custo registrado.

## Setup (uma vez por máquina)

```bash
mkdir -p ~/.ddg-studio && printf 'KIE_API_KEY=<chave>\n' > ~/.ddg-studio/.env && chmod 600 ~/.ddg-studio/.env
python3 ~/.claude/skills/ddg-studio/scripts/kie.py credit
```
A chave fica com o Lucas. Nunca commitar, printar ou colocar em front-end. Se a chave vazar, ele reseta em https://kie.ai/api-key.

## Fluxo obrigatório (5 passos)

### 1. Briefing (não gere nada antes disso)
Extraia ou pergunte, no máximo em uma rodada:
- **Aplicação**: site (hero/seção/ícone), anúncio (Meta feed/story, Google display/PMax), social orgânico, vídeo (reels/tiktok/youtube), motion (logo/loop/transição), apresentação, impressão, produto, avatar/narração, música.
- **Cliente/marca**: paleta (hex), tom, referências do que gosta e do que NÃO gosta. Se for cliente DDG existente, procure brand kit no repositório do projeto.
- **Referências**: pediu pra "seguir a referência"? Então é modelo de edição com a imagem enviada, nunca texto→imagem.
- **Mensagem/ângulo** (anúncio): promessa em 1 frase, ângulo (dor/desejo/prova/oferta), público.
- **Quantidade e prazo**: quantas variações, é rascunho ou final.
Se o pedido já traz tudo, siga direto. Se falta a aplicação, pergunte só isso.

### 2. Escolha de formato e modelo
- Proporção/resolução/área segura: `references/formatos-e-canais.md`.
- Modelo por camada e intenção: `references/catalogo-modelos.md`.
- Regra de ouro: **rascunho ECO → aprovação → entrega PADRÃO → PREMIUM só se pedido**.
- Vídeo: **sempre imagem-chave primeiro** (barata, aprovada), depois imagem→vídeo. Texto→vídeo direto só pra teste de movimento.
- Motion graphics: logo/texto/vetor em código; IA só pra fundo, atmosfera, loop e transição.

**Roteador (fonte da verdade): `references/roteador.md`** ou `python3 kie.py route <intencao>`. Resumo:
| Necessidade | Rascunho (ECO) | Entrega (PADRÃO) | Destaque (PREMIUM, com aprovação) |
|---|---|---|---|
| Imagem geral / realista | `seedream/5-flash-text-to-image` 2K (3,24) | **`nano-banana-2-1` 2K (6)** | `nano-banana-pro` 2K (18) |
| Rosto ou produto da referência | `nano-banana-2-1` 1K (4) | `nano-banana-2-1` 2K (6) · produto: `seedream/5-pro-image-to-image` (14) | `nano-banana-pro` (18) |
| Texto na arte | `ideogram/v3-text-to-image` TURBO (3,5) | `gpt-image-2-5-sunburst-text-to-image` 2K (10) | idem 4K (16) |
| Vídeo 5 s | `runway` (12) | `kling/v3-turbo-image-to-video` 720p (90) | `kling-3.0/video` ou `happyhorse-1-1` 1080p (90 a 145) |
| Vídeo com som | `veo3_lite` 8 s (30) | `veo3_fast` 8 s (60) ou `vidu-q4` | `veo3` (255) |
| Mesmo personagem em vídeo | `bytedance/seedance-2-mini` reference (41) | `vidu-q4/reference-to-video` (76) | `kling-3.0-omni/reference-to-video` (90) |
| Avatar falando | `infinitalk/from-audio` (3/s) | `kling/ai-avatar-standard` (8/s) | `omnihuman-1-5` (27/s) |
| Narração | `google/gemini-3-8-flash-lite-tts` | `elevenlabs/text-to-speech-multilingual-v2` | `elevenlabs/text-to-dialogue-v3` |
| Utilidades | `recraft/remove-background` (1), `recraft/crisp-upscale` (0,5), `topaz/image-upscale` (10/20), `topaz/video-upscale` (8/s) | | |

Teste de 16/10 (9 modelos, mesmo prompt): Nano Banana 2.1 empata com o 2 pela metade do preço e mantém identidade com
referência; Seedream 5 Pro inventa logo; Imagen 4 sai só em 864 px. Detalhes em `roteador.md`.

### 3. Estimar e produzir
Sempre pelo script (ele estima, aplica a política, faz upload de referência local, espera, baixa e registra no log):

```bash
K=~/.claude/skills/ddg-studio/scripts/kie.py
python3 $K credit                                   # saldo
python3 $K route realista                           # qual modelo usar (eco/padrao/premium + comando pronto)
python3 $K models video                             # catalogo oficial (157 modelos); filtro --kind image|video|audio
python3 $K info vidu-q4/image-to-video              # campos oficiais, limites, preco e exemplo
python3 $K image --model nano-banana-2-1 --prompt "..." --ar 4:5 --res 2K --dry   # mostra o input sem gastar
python3 $K image --model nano-banana-2-1 --prompt "Reference image 1 is the person: keep her exact face..." --ref ./foto.png --res 2K --ar 4:5 --project cliente --out ./assets/ia
python3 $K image --model gpt-image-2-5-sunburst-text-to-image --prompt "..." --res 2K --extra '{"background":"transparent"}' --project x
python3 $K video --model kling/v3-turbo-image-to-video --prompt "slow dolly in..." --ref ./hero-aprovado.png --duration 5 --res 720p --project x
python3 $K video --model vidu-q4/reference-to-video --prompt "the woman in reference image 1..." --ref a.png --ref b.png --audio --project x
python3 $K video --model omnihuman-1-5 --ref ./foto.png --ref ./fala.mp3 --duration 12 --project x   # duration = tamanho do audio (pra estimar)
python3 $K veo --model veo3_lite --prompt "..." --ref ./frame.png --res 720p --project x
python3 $K tts --text "Sua vistoria pronta em quarenta minutos." --extra '{"language_code":"pt"}' --project x
python3 $K music --prompt "upbeat corporate pop, 110 bpm, no vocals" --instrumental --project x
python3 $K run --model <qualquer-id> --input '{...json...}' --project x      # passthrough
python3 $K log --days 30                            # gastos por projeto
python3 ~/.claude/skills/ddg-studio/scripts/atualizar_catalogo.py            # baixa precos + campos novos da kie
```
O `image`/`video` monta o input pelo **esquema oficial** de cada modelo (`references/modelos-kie.json`): nome do campo de
referência, proporção, resolução (`resolution`/`size`/`quality`/`mode`), duração e áudio. Valor fora do permitido para
antes de enviar, com a lista oficial. Referências locais sobem sozinhas; `.mp4` vai como vídeo e `.mp3` como áudio.
Áudio fica DESLIGADO por padrão (política de gasto); `--audio` liga.
Sempre passe `--project <nome-do-projeto>` (é assim que o custo vira rateio por cliente). Saída padrão em `./ddg-studio-out`; prefira `--out` dentro da pasta de assets do projeto.

Prompts: `references/prompting.md` (estrutura, referência, vídeo, texto, narração). Prompt em inglês; sem marcas/logos/placas reais; `no text` quando o texto vai em código.

### 4. Validar antes de entregar
- Abra o arquivo (Read) e confira: proporção certa, área segura respeitada, sem texto/logo indesejado, sem mão/rosto deformado, produto igual à referência, cores da marca.
- Vídeo: primeiros 2 s têm hook? Loop fecha? Sem flicker?
- Narração: ouvir; números por extenso; ritmo.
- Se reprovou, ajuste o prompt (não recomece do zero) e gere de novo na mesma camada. Máximo 2 rodadas antes de mostrar ao responsável.

### 5. Entregar
- Arquivo local (a URL da kie expira em 14 dias, upload em 24h).
- Nomear: `{projeto}-{aplicacao}-{variacao}.{ext}` (ex.: `spv-hero-v2.webp`). Converter pra WebP/MP4 H.264 quando for web.
- Informar custo do job e acumulado do projeto (`kie.py log`).
- Registrar no projeto o prompt final que funcionou (`docs/brand-prompt.md` ou similar) pra reuso e consistência.

## Continuidade (série): várias peças ou clipes da MESMA cena
1. **Âncoras fixas** antes de produzir a 2ª peça: pessoa (rosto), produto, cenário, estilo, sempre de peça APROVADA. Toda geração recebe as âncoras com papel + instrução "keep the exact face/product".
2. **Prompt-base** da série (cena, pessoa, luz, paleta em 1 a 2 frases) entra em todo prompt; cada peça só descreve o que muda (enquadramento, ação). Nunca redescrever a pessoa/cena de outro jeito.
3. **Modelo, resolução e proporção travados** na 1ª geração da série. Rosto/produto na série nunca em modelo lite (mínimo `nano-banana-2-1`; entrega `nano-banana-pro`).
4. **Vídeo em cadeia de quadros**: clipe N+1 parte do último frame do clipe N (`ffmpeg -sseof -0.1 -i a.mp4 -frames:v 1 frame.png`), mesmo modelo, mesmo `movimento_base`, mesma duração. Personagem consistente: `bytedance/seedance-2-mini` `--mode reference`, `vidu-q4/reference-to-video` (até 15 refs + voz), `wan/3-0-video` `--mode reference` ou `kling-3.0-omni/reference-to-video` (`elements`). Último frame: `return_last_frame: true` no Seedance 2.5. Histórias curtas: Kling 3.0 `multi_shots` num job só.
5. Saiu diferente? Regenerar com as MESMAS âncoras subindo a camada; não trocar de modelo no meio.
No painel Radar isso é automático (`src/lib/continuidade.ts`, botão "Continuar cena", caixa "Série" no Fluxo).

## POLÍTICA DE GASTO (regra da casa)

1. **Rascunho barato, final caro.** Explorar em ECO (≤ 5 créditos por imagem, ≤ 40 por vídeo). Só sobe de camada o que foi aprovado.
2. **Trava automática**: job > 200 créditos (US$ 1) o script bloqueia; precisa de `--yes` depois de confirmar com o responsável (Lucas ou dono do projeto). Aviso quando o projeto passa de 600 créditos no dia.
3. **Vídeo**: 5 s e 720p por padrão. 1080p/4K só na versão final aprovada, de preferência via `topaz/video-upscale`. Áudio só quando o roteiro pede.
4. **Sem texto→vídeo direto pra entrega** (queima crédito em retrabalho). Imagem-chave aprovada primeiro.
5. **Máximo 4 variações por rodada.** Mais que isso é falta de briefing, não de opções.
6. **Sempre `--project`**. Sem tag, o custo não fecha no rateio do cliente.
7. **Saldo < 200 créditos**: avisar o Lucas pra recarregar (recarga em https://kie.ai/billing; acima de US$ 1.250 tem 10% de bônus).
8. **Falha não cobra.** Se um modelo estiver instável, troque pela alternativa da mesma camada, não fique repetindo.
9. Referência de custo pra orçar cliente: imagem final ~US$ 0,05 a 0,10 · vídeo 5 s final ~US$ 0,45 · vídeo 8 s com áudio ~US$ 0,30 a 1,30 · narração 1 min ~US$ 0,10 · jingle ~US$ 0,06.

## Regras de craft (agência)

- **Marca/logo do cliente nunca via IA**: entra em pós, do vetor oficial. Logos de terceiros, celebridades, placas legíveis: proibido no prompt (pedir "generic, no logo").
- **Texto na arte**: gerar limpo e aplicar em código/Figma. Exceção: lettering é a ideia (ideogram/gpt-image-2), conferir letra por letra em português.
- **Consistência**: prompt-base da marca reutilizado em todas as peças; personagem recorrente via `ideogram/character`; série de ícones com o mesmo prompt trocando só o assunto.
- **Anúncio = uma ideia por peça.** 3 benefícios = 3 criativos. Área segura de story (250 px topo, 340 px base). Hook nos 2 primeiros segundos.
- **Site**: hero com 40 a 50% de espaço negativo do lado da headline, exportar WebP, 2K só se retina importa.
- **Sem travessão** em qualquer texto visível (regra global DDG).
- **Vocabulário**: não citar "Chatwoot" nem ferramentas internas em peças pra cliente.

## Referências
- `references/roteador.md`: **qual modelo usar** por intenção e camada, como ler o pedido, resultado do teste de 16/10.
- `references/catalogo-modelos.md`: mapa completo do que existe na kie (todas as famílias, ids, créditos).
- `references/modelos-kie.json`: campos oficiais dos 157 modelos (usado pelo CLI; `kie.py info <id>`).
- `references/formatos-e-canais.md`: proporção, tamanho, área segura, camada por aplicação; motion graphics; checklist de anúncio; branding.
- `references/prompting.md`: receitas de prompt por tipo.
- `references/api.md`: endpoints, campos, estados, upload, callbacks, erros.
- `references/precos-kie-2026-10-16.json`: tabela bruta oficial (592 linhas). Versão antiga em `references/_arquivo/`.
- `scripts/kie.py`: CLI (stdlib) com roteador, catálogo, montagem por esquema, estimativa, trava de gasto, upload, poll, download e log em `~/.ddg-studio/usage.jsonl`.
- `scripts/atualizar_catalogo.py`: atualiza preços e campos direto da kie (rodar quando sair modelo novo).

## Quando NÃO usar
- Texto/copy sem mídia: skills `copywriting`, `criativos-conversao`, `social-content`.
- Layout de página/componentes: `frontend-design`, `ui-ux-pro-max` (a imagem gerada aqui entra como asset).
- Foto real do cliente disponível e suficiente: use a foto. IA é pra quando não existe material ou pra ampliar o que existe.
