# Tayssa Lash — direção visual (atualizada em 17/out/2026)

Contrato de design do produto inteiro. Quem for mexer em qualquer tela
lê isto antes. Substitui a versão de 15/out (neutomni.com, Montserrat,
marfim/cassis): **a cliente não gostou da fonte e o visual estava
quadrado**. O que vale agora está abaixo.

## As duas referências

1. **A flor pintada na parede do estúdio da Tayssa** (print de story que o
   Lucas mandou em 16/out): flor grande vista de lado, pétalas longas e
   chapadas em magenta-ameixa, com faixas de tom — pintura de parede, não
   foto. O teto do estúdio é vinho. É daí que saem a flor da casa e a noite
   vinho do site.
2. **deltacafes.com** (estudado no navegador, desktop e celular, em
   16/out): a linguagem de movimento e de forma. O que foi trazido:
   - abertura: marca em contorno → palavras deslizam de trás dela → a
     marca vira a janela que revela o site;
   - cartaz em caixa-alta condensada com a palavra pequena em itálico
     ligando a frase ("THE journey OF coffee");
   - nav em pílula flutuante; botão em pílula com a seta num círculo;
   - ícones animados (lá em Rive; aqui SVG);
   - linha tracejada que se desenha com o scroll ligando etapas;
   - colagem de fotos inclinadas em moldura, em volta do título;
   - objetos flutuando em profundidades diferentes;
   - fileira colorida de cartões logo depois da abertura.

   O que **não** foi trazido: o marrom-café e o vermelho do Delta, os
   pacotes de produto, o tom de marca de café. A identidade é da Tayssa.

## Cor

| Token | Valor | Uso |
|---|---|---|
| `--t-paper` | `#fbf7f6` | fundo do site (off-white, levemente rosado — não bege) |
| `--t-blush` | `#f4e8ea` | faixas e superfícies |
| `--t-vinho` | `#6d1530` | **a cor da marca** |
| `--t-bordo` | `#4b0c20` | profundidade |
| `--t-ameixa` | `#5b2346` | variação |
| `--t-rosa` / `--t-rosa-soft` | `#b2566f` / `#d797a8` | rosa fechado; acento sobre o escuro |
| `--t-ink` | `#2a0d18` | texto |
| `--t-noir` | `#1a0810` | a noite (VIP, abertura, fim do site) — vinho, não café |
| `--t-folha` | `#55704f` | **só** em folha, como pontuação |
| magenta da parede | `#933b6c` (flora: `magenta`) | a flor da casa |

Dourado: só no VIP e só no que já está nas mãos da cliente (chip do
cartão, carimbo novo, botão de liberar no painel). Nunca dominante.
Nada de bege/marrom/dourado como base.

## Tipografia

| Papel | Fonte | Onde |
|---|---|---|
| Cartaz | **League Gothic** (caixa-alta condensada) | títulos do site, a marca gigante |
| Ligação | **Fraunces itálico** (eixo SOFT 100) | a palavra em `<em>` dentro do cartaz, minúscula, em vinho |
| Corpo e rótulos | **DM Sans** | texto, botões, rótulos em caixa-alta espaçada; app e painel inteiros |

A mono saiu. Parágrafo grande não é cartaz: volta para DM Sans leve.
Tokens em `app/tayssa/tayssa.css`; regras em `app/tayssa/linguagem.css`.

## Forma

Nada quadrado: pílulas, círculos, arcos (`border-radius: 999px 999px 0 0`
na janela de mídia), cantos de 18–36px em fotos e blocos.

## A flor

`lib/tayssa/flora.ts` + `components/tayssa/flora/*`. Vetor gerado por
código (determinístico — mesma semente, mesma flor no servidor e no
navegador). É ilustração da identidade, **nunca** se passa por trabalho
da Tayssa. Usada sempre em camadas (atrás e na frente da tipografia ou
da mídia), cortada pela borda, com profundidade no scroll. Nunca solta
como adesivo.

## Movimento

- Abertura (`intro-loader.tsx`): uma vez por sessão, ~2,8 s.
- Entradas: linhas do cartaz sobem por máscara (a máscara tem folga para
  o acento da caixa-alta); fotos entram girando; flores abrem pétala por
  pétala.
- Scroll: profundidade por peça (flores, colagem), faixa de serviços que
  anda de lado, linha tracejada que se desenha, o "filme" que abre do arco
  até a tela cheia, a página que escurece até a noite vinho no VIP.
- Ícones (`components/tayssa/ui/icones.tsx`): se desenham ao entrar e têm
  um gesto em loop; aceleram no hover.
- Só `transform`, `opacity`, `clip-path`, `translate` animam.
- `prefers-reduced-motion`: tudo aparece já no lugar, nada gira nem boia.

## Conteúdo

Não inventar fato: nada de anos de experiência, número de clientes,
prêmio, certificação, depoimento ou preço. O que só a Tayssa pode dizer
mora em `lib/tayssa/content.ts`, vazio de propósito; a seção só aparece
no site quando o conteúdo existe. `?estrutura=1` mostra os espaços
reservados marcados.

## Mídia

Foto só se existir (`public/tayssa/photos/` ou a biblioteca do painel).
Vídeo só se existir (`public/tayssa/videos/`, manifesto em
`lib/tayssa/media.ts`, versões horizontal e vertical + pôster). Sem
arquivo, o lugar cai para a foto e depois para o campo tonal com a flor.
Nunca banco de imagens, nunca imagem gerada se passando por trabalho dela.

## As três experiências

- **Site** — a marca: claro e editorial no começo, escurece até a noite
  vinho no VIP.
- **App VIP** — noite vinho, celular primeiro, DM Sans, a flor no topo do
  início, cartão com dourado contido.
- **Painel** — lateral vinho-escuro, tela off-white, DM Sans. Sem
  animação decorativa.
