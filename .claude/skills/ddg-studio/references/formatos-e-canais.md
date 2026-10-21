# Formatos por aplicação (visão de agência)

Antes de gerar qualquer coisa, descubra **onde a peça vai viver**. O destino define proporção, resolução, área segura, se pode ter texto embutido e qual camada de custo faz sentido.

## Tabela mestra

| Aplicação | Proporção | Tamanho de entrega | Texto embutido? | Camada padrão | Notas de craft |
|---|---|---|---|---|---|
| **Site: hero / banner topo** | 16:9 ou 21:9 | 1920x1080 (2K se retina) | NÃO. Headline vai em HTML | Rascunho ECO → final PADRÃO 2K | Deixar 40 a 50% de espaço negativo do lado da headline. Evitar rostos olhando pra fora do texto. Exportar WebP. |
| **Site: fundo de seção / textura** | 16:9 | 1920x1080 | Não | ECO | Baixo contraste, sem ponto focal forte (o conteúdo é o foco). |
| **Site: ícones / ilustrações spot** | 1:1 | 512 a 1024 | Não | ECO (`ideogram/v3` ou `nano-banana-2-lite`) + `recraft/remove-background` | Estilo uniforme: gerar todos no mesmo prompt base, mudando só o assunto. Fundo chapado pra recortar. |
| **Site: foto de equipe / lifestyle** | 3:2 ou 4:3 | 1600 px lado maior | Não | PADRÃO | Realismo: `flux-2/pro` ou `nano-banana-2`. Diversidade e naturalidade, nada de "stock face". |
| **Meta Ads: feed** | 1:1 (1080x1080) ou 4:5 (1080x1350) | 1080 px | Pouco (headline curta ok) | Rascunho ECO → PADRÃO | 4:5 ocupa mais tela no mobile. Produto/benefício nos primeiros 30% da imagem. |
| **Meta Ads: Stories / Reels** | 9:16 (1080x1920) | 1080x1920 | Sim, mas fora das áreas seguras | PADRÃO | Área segura: **250 px no topo e 340 px embaixo** livres (UI do app cobre). Texto e CTA no terço central. |
| **Reels / TikTok vídeo** | 9:16 | 1080x1920, 5 a 15 s | Legendas em pós | Rascunho ECO → `kling/v3-turbo` 720p → upscale se aprovado | **Hook nos primeiros 2 s** (movimento, rosto, produto). Loop limpo ajuda retenção. |
| **Google Display** | 300x250 · 336x280 · 728x90 · 160x600 · 320x50 (responsivo: 1200x628 + 300x300) | Múltiplos | Sim | ECO/PADRÃO | Gerar a base em 1.91:1 (1200x628) e 1:1, recortar os demais em código. Logo obrigatório, CTA visível. |
| **Google Performance Max / vídeo** | 16:9 + 9:16 + 1:1 | 1080p, 6 a 15 s | Sim | PADRÃO | Entregar as 3 proporções da MESMA cena (gerar 16:9 e reenquadrar, ou gerar 9:16 separado com o mesmo prompt + seed). |
| **YouTube thumbnail** | 16:9 (1280x720) | 1280x720 | Sim, grande | PADRÃO (`gpt-image-2` ou compor em código) | Rosto + emoção + 3 a 5 palavras. Contraste alto. |
| **Instagram carrossel** | 4:5 ou 1:1 | 1080 px | Sim | ECO → PADRÃO | Capa forte, continuidade visual entre cards (mesmo prompt base + variação de assunto). |
| **LinkedIn post** | 1.91:1 (1200x627) ou 1:1 | 1200 px | Pouco | ECO/PADRÃO | Tom mais sóbrio, menos saturação. |
| **WhatsApp (imagem em disparo)** | 1:1 ou 4:5 | 1080 px, < 1 MB | Sim | ECO | Comprime muito: evitar texto fino e degradês sutis. |
| **Apresentação / proposta** | 16:9 | 1920x1080 | Não (texto no slide) | ECO | Ilustrações consistentes por deck: mesmo estilo, paleta e iluminação. |
| **Motion graphics (logo reveal, lower third, loop de fundo)** | 16:9 ou 9:16 | 1080p, 3 a 8 s | Não | ver seção abaixo | Modelo de vídeo gera "footage", não vetor. Ver estratégia. |
| **Impressão / outdoor / PDV** | conforme peça | 300 dpi (A4 = 2480x3508) | Sim | PADRÃO + `topaz/image-upscale` 4K/8K | Gerar 2K e subir. Conferir bleed de 3 a 5 mm. CMYK na saída final. |
| **Foto de produto e-commerce** | 1:1 | 2000x2000 | Não | Referência obrigatória + `recraft/remove-background` | Fundo branco puro ou cenário lifestyle a partir da foto real do produto. Nunca inventar o produto. |
| **Avatar / vídeo explicador com apresentador** | 9:16 ou 16:9 | 1080p | Legenda em pós | TTS `multilingual-v2` + `kling/ai-avatar` ou `infinitalk` | Roteiro curto (≤ 60 s), voz pt-BR, pausas marcadas com vírgula. |
| **Jingle / trilha** | áudio | MP3/WAV, 15 a 60 s | | Suno (12 créditos, 2 faixas) | `instrumental: true` pra trilha de fundo. Prompt com BPM, humor, instrumentos, referência de gênero. |

## Estratégia pra motion graphics

Modelos de vídeo IA são bons em **movimento de câmera, partículas, luz, fluidos, transições orgânicas**. São ruins em **tipografia animada, vetores precisos, logo exato**.

Regra DDG:
1. **Logo, texto, gráficos**: animar em código (CSS/Framer Motion/Remotion/After Effects). Não gastar crédito com isso.
2. **Fundo e atmosfera**: gerar um loop com IA (imagem-chave → `runway`/`pixverse`/`kling`, prompt de "câmera lenta, loop suave, sem cortes") e colocar por baixo da tipografia.
3. **Loop perfeito**: usar modelos com primeiro+último frame iguais (`pixverse/transition`, `kling-3.0/video` com 2 `image_urls`, `wan/2-7` com `first_frame_url` = `last_frame_url`).
4. **Transição entre cenas**: primeiro frame = cena A, último frame = cena B (`pixverse/transition`, Veo `FIRST_AND_LAST_FRAMES_2_VIDEO`).
5. **Reveal de produto**: foto real do produto → `nano-banana-2` cria a cena → `kling/v3-turbo` anima com "slow orbit / dolly in".

## Anúncios: checklist de conversão antes de gerar

- Qual é a **promessa** em 1 frase? A imagem tem que sustentar essa frase, não competir com ela.
- Qual o **ângulo** (dor, desejo, prova social, oferta, urgência)? Ele muda o cenário e a expressão das pessoas.
- **Produto ou pessoa em destaque?** Serviço local (vistoria, barbearia, clínica): pessoa + ambiente real. Produto físico: produto herói.
- **Público**: idade, contexto, classe. A cena tem que parecer a vida do público, não um catálogo.
- **Uma ideia por peça.** Se o briefing tem 3 benefícios, são 3 criativos (ótimo pra teste A/B).
- **Marcas e rostos reais**: NÃO gerar logos de terceiros, celebridades, placas legíveis, marcas de carro identificáveis. Pedir "veículo genérico sem logotipo, placa desfocada". (Teste real: pedir "SUV prateado" gerou um Audi com logo. Corrigir no prompt.)
- **Texto**: se o anúncio precisa de headline na arte, gerar a imagem limpa e aplicar o texto em código/Figma. Só usar `gpt-image-2`/`ideogram` se o texto for parte da ideia visual (lettering, pôster).
- **Variações**: 3 a 4 por ângulo, escolher 1 a 2 pra subir na camada PADRÃO.

## Branding: mantendo consistência entre peças

- Extrair do cliente: paleta (hex), tipografia, tom (sério, jovem, premium, popular), referências que ele gosta E que ele não gosta.
- Criar um **prompt-base da marca** (estilo, luz, paleta, lente, humor) e reutilizar em todas as peças mudando só o assunto. Guardar em `docs/brand-prompt.md` do projeto.
- Referência visual sempre que existir: subir a imagem e usar modelo de edição (`nano-banana-2` com `image_input`, `seedream/5-pro-image-to-image`). Descrever o que MANTER e o que MUDAR.
- Personagem/mascote recorrente: `ideogram/character` com a referência do personagem.
- Nunca colocar a logo do cliente via IA. Logo entra em pós, do arquivo vetorial oficial.
- Se a marca é um cliente DDG existente (SuperVisão, Petderma, Feel King, etc.), procurar o brand kit no repositório do projeto antes de inventar estilo.

## Sem travessão

Regra global DDG: nada de travessão em copy, prompt visível ao cliente ou texto embutido em arte. Usar vírgula, dois pontos ou ponto.
