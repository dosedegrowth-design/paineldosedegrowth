# Tayssa Lash — direção visual (out/2026)

Contrato de design do produto inteiro. Quem for mexer em qualquer tela
lê isto antes. Não é inspiração: é a regra da casa.

## A referência e o que foi extraído dela

Referência principal, inspecionada em 15/out: **neutomni.com** (medida no
navegador, não de memória). O que faz ela funcionar, e que adotamos:

1. **Duas cores e ponto.** Uma cor de marca saturada sobre um fundo
   quase-branco. Nada de gradiente decorativo, sombra ou card flutuante.
   Bloco de cor é chapado.
2. **A palavra é a imagem.** A marca ocupa a largura inteira da tela, com
   as pontas tocando as bordas. Tipografia como elemento gráfico, não
   como rótulo em cima de uma foto.
3. **Sans neutra + itálico serifado dentro da frase.** A frase corre em
   sans; a palavra que carrega emoção vira itálico serifado. É o gesto
   que dá voz ao texto sem precisar de enfeite.
4. **Mono como ficha técnica.** Rótulo, contador, hora, estado e
   categoria vão em monoespaçada caixa-alta, pequena, bem espaçada.
5. **Peso 400 em quase tudo.** A hierarquia vem de corpo, cor e estilo —
   não de negrito.
6. **Assimetria com ar.** Blocos desalinhados de propósito, muito branco,
   ritmo vertical generoso.

O que **não** copiamos: o vermelho, o humor de agência e o volume de
movimento. A casa é outra.

## A tradução para a Tayssa

| Elemento | Decisão |
|---|---|
| Fundo | marfim `--t-ivory` `#f4efe8` |
| Marca / tinta | cassis `--t-cassis` `#6e2f45` |
| Texto | `--t-ink` `#1a1512`, secundário `--t-umber` |
| Dourado | **reservado ao VIP** (cartão, carimbo, benefício). No site público, quase nunca |
| Sans | Montserrat 200/300/400/500/600 — escolha explícita do Lucas, fica |
| Itálico serifado | **Bodoni Moda itálico**, só em `<em>` dentro de título ou frase |
| Mono | JetBrains Mono, só em rótulo/contador/estado |

A troca do `<em>` é global: todo título que já marcava ênfase ganhou a
serifa itálica automaticamente, no site, no VIP e no painel.

## Primitivos (em `app/tayssa/tayssa.css`)

- `.ty-wordmark` — a marca gigante; corpo sai do número de letras
  (`--ty-letras`), então ela cabe na largura em qualquer tela.
- `.ty-mono`, `.ty-rail` — ficha técnica; o trilho é `A + B + C = D`.
- `.ty-block` (`--ink`, `--bone`) — bloco de cor chapado.
- `.ty-oval` — rótulo em elipse desenhada.
- `.ty-figure` — foto chapada com legenda em mono.
- `.ty-split` (`--wide-left`, `--wide-right`, `--offset`) — grade
  editorial assimétrica; `.ty-measure` para coluna de texto.
- `.ty-index`, `.ty-rule` — numeração de seção e régua fina.

## Regra que manda em tudo: foto só se existir

A biblioteca (`vip.photos`) hoje está **vazia**. Nenhuma tela pode
depender de foto para ter composição:

- `app/tayssa/page.tsx` filtra o que chega: só passa foto que existe
  mesmo (URL do Storage ou arquivo presente em `public/`).
- Seção que ficaria só com caixote vazio **se sustenta na tipografia**.
  Quando a Tayssa subir fotos em `/admin/fotos`, elas entram no mesmo
  lugar, sem redesenho.
- Nunca usar foto de banco de imagens, nem de outra marca, como se fosse
  trabalho dela. (Em 15/out o herói estava servindo o logo da MoveCar:
  a foto foi arquivada.)

## Conteúdo

Não inventar fato: nada de anos de experiência, número de clientes,
prêmio, certificação, depoimento ou preço. O que não existe no banco ou
nos ativos da marca não vai para a tela. Texto em português do Brasil,
voz de profissional de beleza — não de agência.

## Movimento

Entrada por máscara (de baixo para cima), deslize curto no scroll,
troca de estado com mola. Nada de parallax exagerado, cursor
personalizado ou animação que atrase a leitura. `prefers-reduced-motion`
desliga tudo — e a tela precisa continuar correta.

## As três experiências

- **Site público** — a marca. Claro, editorial, desktop e celular com
  composições próprias. É o produto principal.
- **VIP** — o relacionamento. Noturno, celular primeiro, dourado
  permitido. Cartão de 8 posições é peça assinatura.
- **Painel** — a operação. Casco escuro na lateral, tela clara com
  cards, mesma identidade (cassis), vocabulário em `app/tayssa/admin/admin.css`.

Os três partilham o mesmo banco e as mesmas regras de negócio. Nenhum
benefício é concedido automaticamente: o sistema propõe, a Tayssa
confirma.
