# Regras de layout e experiência · linha visual DDG (base: site iWin, 15/10/2026)

Documento-fonte das decisões de layout tomadas com o Lucas no site da iWin. Serve para **qualquer projeto da DDG que precise
seguir a mesma linha** (inclusive a plataforma). Cada regra tem o porquê; o código de referência está em `src/` deste repositório.

---

## 1. Princípios

1. **Base Apple, alma do cliente.** Layout, ritmo, tipografia e movimento no padrão apple.com; conteúdo, prova social e
   chamadas são do cliente (lojas, garantia, WhatsApp, preço). Nunca cópia literal da Apple.
2. **O cliente vem primeiro, o produto depois.** A primeira dobra vende a empresa (quem é, por que confiar); os produtos vêm logo em seguida.
3. **Referência externa = só a peça pedida.** Quando o Lucas manda um site de referência apontando partes ("header", "avaliações"),
   trazemos **só essas partes**. O resto continua na nossa base.
4. **Nada chapado.** Fundo preto nunca fica liso: sempre um efeito discreto (seção 5.4).
5. **Movimento com propósito.** Cada efeito conta algo (troca de cor, valor de entrada contando, aparelho girando).
   Efeito sem função não entra.
6. **Mobile primeiro.** Todo bloco é validado em iPhone 13 (390 px) e em computador (1440 px), e também numa largura
   intermediária (~860 px), onde costuma quebrar.
7. **Informação não se repete.** Um assunto por bloco; uma única listagem de produtos e de lojas por página.

## 2. Cores

| Uso | Valor |
|---|---|
| Fundo escuro principal | `#000000` |
| Fundo escuro alternado | `#1d1d1f` · `#0b0b0c` (abertura/cortina) |
| Fundo claro | `#ffffff` · `#f5f5f7` (surface) |
| Texto principal claro/escuro | `#f5f5f7` / `#1d1d1f` |
| Texto secundário | `#86868b` · `#6e6e73` · `rgba(255,255,255,.6)` |
| Linhas | `rgba(0,0,0,.1)` · `rgba(255,255,255,.1)` |

- **REGRA: só preto, branco e tons de cinza na interface.** Sem cor de acento (nada de laranja, azul, gradiente colorido).
  As únicas cores permitidas são as **do próprio produto** (fotos/renders) e das marcas de terceiros (estrelas do Google `#fbbc05`,
  logo do Google, verde do WhatsApp `#25d366` só no botão/ícone de WhatsApp).
- Botões: primário = branco no escuro / preto no claro; secundário = contorno (`ring-1` branco/30 ou preto/15). **Nada de botão azul.**
- Destaque de texto: frase-chave em branco dentro de parágrafo cinza (`#86868b` com `<span className="text-[#f5f5f7]">`).
- Seleção de texto: cinza (`rgba(134,134,139,.35)`).

## 3. Tipografia

- **Uma família só, sem serifa** (Inter como substituta da SF Pro, que não pode ser usada fora da Apple). **Proibido serifa/itálico decorativo.**
- Títulos em peso 600, tracking negativo leve (`-0.015em` a `-0.025em`), `leading` 1.02–1.08.
- Escala (desktop / mobile):

| Papel | Desktop | Mobile |
|---|---|---|
| Título de hero | 72–84 px | 40–44 px |
| Título XXL de seção | 80–96 px | 40 px |
| Título de seção | 48–64 px | 32–40 px |
| Eyebrow (linha acima do título) | 21 px, 600, cinza | 17 px |
| Parágrafo de destaque | 21–24 px | 17–19 px |
| Corpo | 17 px | 15–17 px |
| Legenda / rótulo | 12–14 px cinza | 12–13 px |

- **Eyebrow sempre em caixa normal** ("Nossas lojas"), nunca CAIXA ALTA espaçada (isso era do site de referência e foi descartado).
- Sem travessão (—) em texto de cliente.

## 4. Espaço, grade e formas

- Contêiner de conteúdo: `.wrap-site` = 1280 px + 20/32 px de respiro (alinhado ao header). Texto corrido: `.wrap` 1024 px. Mosaico de tiles: `.wrap-wide` 1440 px.
- Respiro vertical de seção: 80–144 px no desktop, 64–112 px no mobile.
- Raio: cards/tiles **28 px**; pílulas e botões **cápsula** (`rounded-full`); controles circulares 44–56 px.
- Largura máxima de parágrafo centralizado: ~840 px.

## 5. Componentes e padrões (com o arquivo de referência)

### 5.1 Header em pílula · `src/components/Nav.tsx`
- Cápsula flutuante (`max-w 1240`, `rounded-full`, margem 12 px do topo), logo + "ESPECIALIZADA APPLE" pequeno, links no centro,
  Instagram (círculo) e "Falar com a loja" (botão branco) à direita.
- Em páginas com **topo escuro** (home, lançamento) começa transparente e vira vidro escuro (`bg-[#111113]/90 + blur`) ao rolar.
  Em páginas com **topo claro ou com foto** já nasce em vidro escuro (contraste sempre garantido).
- Some ao descer rápido e volta ao subir. Mobile: botão "Menu" abre tela cheia com efeito de círculo e links numerados.

### 5.2 Carregamento · `src/components/Intro.tsx`, `src/data/intro.ts`
- **1ª visita da sessão:** abertura com a logo (desfoque → nítida + brilho, nome e linha de progresso), ~1,6 s, renderizada no servidor (não espera JS).
- **Recarregar na mesma sessão:** a mesma abertura em versão curta (~0,7 s, só a logo).
- **Troca de página no site:** cortina preta sobe com a logo pulsando e sai por cima quando a página nova chega + barra fina no topo.
- Tudo respeita "reduzir movimento".

### 5.3 Barra de rolagem
- Fina, arredondada, estilo macOS, cinza translúcido, some no trilho (`globals.css`).

### 5.4 Fundo vivo (preto nunca chapado) · classe `.fundo-vivo`
- Duas luzes brancas muito suaves (13% e 10%) flutuando em ciclo de 28–34 s, grade fina de 64 px que some nas bordas e um brilho que varre a cada 9 s.
- Só `transform`/`opacity` (leve no celular). Usar em hero, sequências fixas, abertura de páginas internas e blocos escuros grandes.

### 5.5 Hero da home · `HeroIwin.tsx`
- Centralizado: eyebrow com a promessa da empresa ("A melhor loja de iPhone do interior de São Paulo."), título, subtítulo, 2 botões
  (branco + contorno com WhatsApp), linha de prova social (nota do Google).
- Embaixo, vitrine em leque de produtos reais que abre na entrada e com a rolagem, inclina com o mouse, e o item central troca de cor sozinho.

### 5.6 Sequência fixa na rolagem (o "efeito Apple") · `Lancamento18.tsx`, `TrocaScroll.tsx`, `Iphone18.tsx`
- Seção alta (280–320vh) com um palco `sticky` de 100svh; a história é contada em atos ligados ao `scrollYProgress`.
- **Regras técnicas obrigatórias:**
  - toda faixa do `useTransform` fica **entre 0 e 1 e em ordem crescente** (senão o navegador derruba a página);
  - layout do palco em **grade/colunas fixas**, nunca peças soltas por porcentagem (evita sobreposição em larguras intermediárias);
  - mídia dimensionada pela **altura** da tela (`svh`), nunca só pela largura;
  - texto por cima de imagem sempre com contraste garantido (posição livre ou sombra só onde não cobre o produto);
  - a cor/estado final tem que ser **visível no fundo** (ex.: terminar em prateado, não em preto sobre preto);
  - no celular o produto sobe/suaviza em vez de ir para o lado.
- Vídeo controlado pela rolagem: MP4 com **keyframe em todo frame** (`ffmpeg -g 1`), ≤ 3 MB, sempre com imagem antes de tocar.

### 5.7 Vídeos das redes · `Reels.tsx`, `tools/ig-reels.py`
- Carrossel horizontal com snap; cada vídeo toca **mudo** quando ≥ 60% visível e pausa ao sair; toque abre player em tela cheia **com som** e setas.
- Cartão limpo: **sem @ e sem número de visualizações**. Legenda curta embaixo.
- Animação de entrada **só com opacidade** (o trilho tem `overflow-x`, qualquer deslocamento vertical é cortado).
- Vídeos baixados pela incorporação oficial do Instagram, comprimidos (≤ 960 px de altura, H.264, faststart) + capa WebP.

### 5.8 Avaliações do Google · `Avaliacoes.tsx`
- Cartão grande com a nota (G do Google + estrelas + total) e **duas faixas de depoimentos correndo em sentidos opostos**
  (param no hover, máscara nas bordas). Por loja: `<Avaliacoes loja="slug" />`.
- Depoimento: primeiro nome + inicial, cidade/loja, estrelas, texto. Nunca nome completo. Só 4–5 estrelas com texto.

### 5.9 Cartões de unidade/loja · `LojaCartao.tsx`, `LojasDestaque.tsx`
- Foto 16:10 (vídeo da loja ao passar o mouse), selo "Aberta agora/Fechada agora", nota do Google, endereço, horário, cidades atendidas,
  3 ações: Ver a loja (preto), Como chegar (ícone), WhatsApp da loja (ícone verde).

### 5.10 WhatsApp · `EscolhaLoja.tsx`
- Interceptador único de links `wa.me`: número **geral** → janela "Com qual loja você quer falar?" (5 lojas, endereço, aberta/fechada);
  número **de loja** → abre direto.
- Toda mensagem começa dizendo que veio do site: **"Oi, iWin {cidade}! Vim pelo site. {mensagem}"**.
- Botão flutuante verde no canto (logo oficial do WhatsApp, nunca balão genérico).

### 5.11 Números e comparativos
- Números grandes contando ao aparecer (`Contador`); barras de comparação que crescem ao aparecer (`BarraGarantia`), cliente em branco, mercado em cinza.

## 6. Movimento (valores padrão)

| Efeito | Valores |
|---|---|
| Entrada de bloco | sobe 30 px + opacidade, 0,7 s (y) / 0,9 s (opacidade), 0,15 s entre itens, `once` |
| Curva | `[0.22, 1, 0.36, 1]` (saída suave) |
| Título que "acende" | gradiente cinza→branco varrendo em 3,5 s ao entrar 60% na tela (1 vez por página) |
| Hover de cartão | zoom 1,03–1,05 em 1–1,4 s na mídia |
| Faixas infinitas | 40–65 s por volta, param no hover |
| Troca de página | cortina 0,42 s entrando, 0,55 s saindo |

- Sempre respeitar `prefers-reduced-motion`.
- Animações pesadas só com `transform`/`opacity`.

## 7. Conteúdo e linguagem

- Português do Brasil, tom próximo e direto ("Fala com a gente", "Bora trocar de iPhone?"), sem jargão.
- **Não expor detalhes operacionais** que são do atendimento (ex.: "sob encomenda", prazos internos). O site mostra produto, preço e chamada.
- Preço sempre "no Pix" + parcelamento ("ou em até 21x"). Exemplos de simulação devem mostrar **vantagem clara** (diferença pequena + parcela).
- Prova social real (Google, Instagram) sempre que possível; nunca inventar depoimento ou número.
- Nunca usar o nome de ferramentas internas (ex.: Chatwoot) em texto visível.

## 8. Checklist antes de publicar

- [ ] Celular 390 px, intermediário ~860 px e computador 1440 px conferidos com print.
- [ ] Sequências de rolagem conferidas no meio e no fim (nada sobreposto, produto visível).
- [ ] Console sem erro (e sem aviso de hidratação).
- [ ] Contraste do header em todas as páginas (topo claro, escuro e com foto).
- [ ] Nenhuma cor fora da paleta, nenhuma fonte serifada, nenhum "sob encomenda".
- [ ] Botões de WhatsApp abrindo a escolha de loja com a mensagem "Vim pelo site".
