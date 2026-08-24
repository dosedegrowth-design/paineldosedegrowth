# Design de carrossel de conversão (arte própria, HTML/CSS)

Como o CarrosseIA, a arte é **desenhada no navegador**. Replicamos com HTML/CSS e exportamos
por screenshot/print. Zero crédito, controle total do texto (que é onde IA de imagem falha).

## Formato
- **4:5 = 1080×1350px** (feed, padrão). **1:1 = 1080×1080px** se pedirem.
- **Área de segurança:** margem interna de ~72–96px. Nada crítico encostado na borda.
- Exportar cada slide como PNG separado; a ordem é a ordem dos cards.

## Anatomia do card
1. **Foto de fundo** (do cliente) cobrindo 55–70% do card, `object-fit: cover`.
2. **Gradiente escuro** de baixo pra cima (`linear-gradient(transparent, rgba(0,0,0,.85))`) pro texto ler.
3. **Título** (bold/caixa alta), 1 ideia, alto contraste, embaixo.
4. **Texto de apoio** menor, opcional.
5. **Etiqueta/pílula** no topo (nicho) e **@ + assinatura** discretos no rodapé.
6. **Acento de cor** por cliente (`--brand-color`). Barras, pílula e CTA usam o acento.

## Hierarquia visual por slide
- **Capa:** título ocupa o maior peso, foto marcante, pílula de nicho. Sem CTA ainda.
- **Conteúdo:** pode ter lista de checkmarks (dores/benefícios) sobre a foto ou faixa sólida.
- **CTA:** botão/faixa de WhatsApp bem visível (verde `#25D366` + ícone), verbo imperativo,
  WhatsApp/handle claros.

## Tipografia
- Fonte forte e legível (ex.: Inter Tight, Montserrat, Anton para títulos de impacto).
- Título 64–96px, apoio 32–40px, rodapé 24–28px (na escala 1080px).
- Line-height apertado no título (1.05–1.15). Peso 700–900.

## Cor
- Whitelabel: usar `cor_primaria` do cliente como `--brand-color`.
- DDG default: laranja `#F15839`. WhatsApp CTA sempre verde `#25D366`.
- Fundo do texto: preto/gradiente. Texto branco `#F3F3F3`.

## Regras de copy na arte
- Sem travessão. Frases curtas. Uma ideia por card.
- CTA sempre WhatsApp + imperativo. Ex.: "Agende sua avaliação pelo WhatsApp".
- @ sem o arroba dobrado; assinatura "Dr. Fulano | Nicho".

## Uso do template
`references/template-carrossel.html` é um render de 3 cards parametrizável (edite as variáveis no topo
do `<script>`/CSS: cor, @, textos, e as URLs/observações de foto). Abra no navegador, ajuste o
zoom pra 1080 de largura por card e tire o print de cada um, ou rode via Playwright para exportar PNG.

## Padrão vencedor v2 (validado ago/2026 — anúncio de clique pro WhatsApp)

Estrutura TOF→MOF→BOF em 3 cards, pesquisada em fontes BR de tráfego pago
(CTW tem CPL 30–60% menor quando a peça vende a *conversa*, não o produto):

1. **Card 1 · Gancho**: foto real full-bleed + headline em TARJA (caixas Anton
   empilhadas, linha de punch com fundo na cor de destaque) + selo pill no topo
   ("Cotação grátis · 2 min"). Nunca card só tipográfico — lê como IA amadora.
2. **Card 2 · Prova**: mockup fiel de conversa do WhatsApp (header #008069 com
   avatar + "digitando…", wallpaper #EFE7DE, balão in #FFF / out #D9FDD3, horário
   + tick azul #53BDEB, barra "Mensagem"). Mostra a conversa exata que o clique
   inicia. Sempre nota "Conversa ilustrativa" + disclaimers do nicho.
3. **Card 3 · Fechamento**: headline tarja + botão verde WhatsApp gigante
   (gradiente #2BD46A→#1BA84F) + 3 chips de objeção ("Sem custo", "2 minutos").

Fotos: 1 foto por nicho basta — 3 recortes diferentes (zoom/posição/brilho/blur
via sharp) pra capa, fundo escurecido do mockup e CTA. Banco Freepik via
Maginific `stock_search` (license free) = zero créditos.

⚠️ **Gotcha Chromium `--headless=new`**: o viewport CSS fica **87px menor** que
o `--window-size` (barra de UI). Layout com 100vh sai com faixa branca no
rodapé. Fix (já aplicado em exportar-pngs.mjs): janela `h+87` + crop `WxH`.

Compliance emagrecimento/saúde (mais rígido que financeiro): sem antes/depois,
sem "perca X kg", sem prazo, sem foco em partes do corpo; público 18+;
"resultados variam de pessoa para pessoa" no card 2 e 3.
