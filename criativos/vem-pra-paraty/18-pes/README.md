# Criativos estáticos — lancha 18 pés (Mestra 180)

Seis peças de Meta Ads, cada uma em 1080×1350 (feed) e 1080×1920 (story).
A direção está na Carta Náutica, em `../direcao/carta-nautica.html`.

## Pra gerar os PNGs finais

```bash
# 1. jogue as três fotos originais aqui, com estes nomes exatos:
#    fotos/lancha18-a.jpg   três-quartos traseiro, serra ao fundo, muito céu
#    fotos/lancha18-b.jpg   lateral, coqueiros, água espelhada
#    fotos/lancha18-c.jpg   lateral próxima, bancos do interior visíveis

# 2. rode
node gerar.mjs

# saída: out/*.png  ·  prévias navegáveis: previa/*.html
```

Sem as fotos o script roda mesmo assim e usa um fundo de conferência, pra você
validar tipografia e diagramação. As peças em `out/` hoje estão assim.

Precisa do Playwright (`npm i -g playwright` ou `npm i -D playwright`). Não recorte
nem redimensione as fotos antes: o corte de cada formato é feito aqui.

Outras opções:

```bash
node gerar.mjs --so=feed              # só 1080×1350
node gerar.mjs --so=story             # só 1080×1920
node gerar.mjs --id=conta,fiorde      # só algumas peças
```

## As seis peças

| # | Peça | Foto | Frase na arte | Funil |
|---|---|---|---|---|
| 01 | A conta invertida | C | Sete lugares / Nenhum estranho | Fundo |
| 02 | O fiorde | A | O único fiorde / do Brasil | Topo |
| 03 | Mar de piscina | B | Baía fechada / Mar parado | Meio |
| 04 | Quatro horas | A | Quatro horas / de São Paulo | Topo |
| 05 | Só vocês a bordo | B | A lancha inteira / é de vocês | Meio |
| 06 | Setembro e outubro | C | Mar limpo / Praia vazia | Fundo |

Título, CTA e as três variações de texto principal de cada peça estão em
`criativos.json`, junto da hipótese que a peça testa.

## O que o motor impõe

`arte.mjs` é o registro de campanha, não o do orgânico. Ele não deixa entrar
preço na imagem, selo de desconto, pill de categoria, CTA desenhado nem sombra
no texto. A frase é serifada leve em caixa alta com entreletra aberta, no
máximo seis palavras, e a marca fica pequena num canto.

O CTA não é desenhado de propósito: no anúncio ele é o botão do Meta, e no
story é o sticker nativo. O preço vai no texto principal, sempre com a divisão
por pessoa já feita.

Zona segura de story respeitada: 250 px no topo, 320 px embaixo. Quando a frase
fica embaixo (`"ancora": "baixo"`), a marca sobe pro topo sozinha.

## Pra mexer

- **Trocar uma frase ou um texto:** só `criativos.json`, e rode de novo.
- **Ajustar o corte de uma foto:** o campo `posicao` de cada peça, um valor de
  `background-position` por formato. Suba a porcentagem pra mostrar mais água,
  desça pra mostrar mais céu.
- **Mudar tamanho de tipo ou margem:** `escala()` em `arte.mjs`.

As fontes ficam embutidas em `fontes/fontes-inline.css`, então o render sai
igual em qualquer máquina, com ou sem internet.

## Ainda não dá pra fazer

Quatro ângulos da grade dependem de gente a bordo e do rosto do marinheiro:
o marinheiro, a família com criança, documento na mão e traga sua bebida.
Eles entram depois da diária de foto descrita na seção 11 da Carta Náutica.
