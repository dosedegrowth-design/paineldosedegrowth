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
