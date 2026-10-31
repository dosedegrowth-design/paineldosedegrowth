# Estrutura de novembro 2026 — campanha de conversão nova

Subida em 31/out/2026 com o OK do Lucas ("pode subir tudo"). Conta
`782476046702053`, página `1889497158006770`.

## O que ficou no ar

| Campanha | ID | Status | Orçamento |
|---|---|---|---|
| **DD 🛒 Conversão Vendas - Novembro 2026 - Últimas Peças** | `120251016045330535` | **ACTIVE** | R$ 200/dia (CBO) |
| DD 🛒 Conversão Vendas - Outubro 2026 - Sevilha/Ipanema/Leque | `120250690296280535` | **PAUSED** | era R$ 200/dia |
| DD 🌐 Tráfego Site - 17/06/2026 (topo) | `120247870258460535` | ACTIVE, não tocada | |
| DD 🔷 Alcance - Ipanema Verao (meio) | `120247776962600535` | ACTIVE, não tocada | R$ 7/dia |

Topo e meio ficam como estavam, por ordem do Lucas. Só a de conversão trocou.

## Conjunto único

`120251016046860535` — **01 Novembro - Compradoras + RMKT 30d + Lookalike 1% -
Feed e Reels**. Público copiado do conjunto 04 de outubro, campo a campo:

- Mulheres, 40 a 65, Brasil (`frequently_in` + `home`)
- Só Instagram, posições `stream` e `reels`
- Quatro públicos somados: site 30 dias (`120224108593100535`), compradoras
  180 dias (`120247779294400535`), semelhante 1% de compra
  (`120247878745590535`), semelhante 1% de carrinho (`120247878773500535`)
- Advantage+ Audience **desligado** (`ADVERTISER_REQUESTED_OFF`), como estava
- Compra no pixel `3744914555533806`, 7 dias clique / 1 dia visualização

## Os 18 anúncios, todos com modelo

**Mantidos, 6** — reaproveitam o `creative_id` original, então o post e o
histórico dele continuam:

| Anúncio | ID | Criativo |
|---|---|---|
| 01 Sacolão Stripes Azul modelo vestida | `120251016052820535` | `1618842572953617` |
| 02 Sacolão Stripes Verde | `120251016054850535` | `1086941244198110` |
| 03 Sacolão Stripes Vermelho | `120251016056280535` | `2162705387675152` |
| 04 Sacolão Stripes Azul | `120251016058450535` | `3661502960684995` |
| 05 Lenço Sevilha Rosa | `120251016059380535` | `2260154564717438` |
| 06 Camisa T Ipanema Marrom | `120251016060830535` | `1105870445359338` |

**Carrossel 1:1, 5** · 07 Vitrine Últimas Peças (10 cards) · 08 A Camisa Ana em
três estampas · 09 Vestidos de seda · 10 Pied de Poule duas cores · 11 O look
Azulejo + Zodíaco.

**Feed 4:5, 4** · 12 Moletom Iguana · 13 Saia Stripes Mostarda · 14 Calça
Glória Azulejo Laranja · 15 Camisa Ana Tribeca.

**Reels 9:16, 3** · 16 Vestido Lele Longo Paraíso · 17 Moletom Iguana ·
18 Vestido Princesa Damas.

## O que ficou de fora

- **Tudo sem foto de modelo.** Os 12 produtos de estampa nova que só vieram em
  still vão num conjunto separado depois da produção.
- **Sacolão Rei Rainha Mostarda**, mesmo tendo vendido R$ 1.715: a foto é a
  bolsa sozinha numa cadeira, sem modelo.
- **Camisa Ana Damas** (estoque 0) e **Caftan Amélia Paraíso** (rascunho).

## As peças

`public/marina/criativos/` — 27 imagens e 3 vídeos, gerados das fotos do
briefing. Ficam em `public/` porque o Meta precisa buscar a mídia por URL
pública para ingerir; depois ele serve da CDN dele.

- Feed 1440×1800, carrossel 1080×1080, Reels 1080×1920.
- A foto inteira cabe na caixa em todo formato: a sobra é a própria borda
  esticada e desfocada. Nada de cabeça ou pé cortado.
- Os Reels são 6 s de aproximação lenta feitos da própria foto, sem áudio e
  sem IA. O único vídeo que a Bia mandou tem "CapCut Ai" gravado no quadro e
  ficou fora.
- `degrees_of_freedom_spec` com as 11 melhorias do Advantage+ Creative em
  OPT_OUT em todo criativo novo: sem recorte por posicionamento, sem animação,
  sem música, sem retoque.

## Pegadinhas que apareceram

- **O `link_url` de topo sobrescreve o link de cada card do carrossel.** Na
  primeira versão os 10 cards da vitrine caíram todos na home da loja. Criar
  carrossel **sem** `link_url` de topo: aí o `link` de cada card vale. Os cinco
  criativos errados foram refeitos (v2) e os cinco anúncios, arquivados.
- **Editar orçamento força a campanha para PAUSED** (`status_forced_to_paused`),
  mesmo numa campanha já ativa. Depois de mexer no orçamento, reativar.
- `ads_update_entity` não aceita `status: ACTIVE`; ativar é com
  `ads_activate_entity`.
- `ads_get_creatives` não devolve `link_url` de criativo de imagem ou vídeo,
  só o `link` de card de carrossel. Não dá para conferir o destino de um
  anúncio de imagem por ali.
- A conta não expõe contas do Instagram por `ads_get_ig_accounts` (devolve
  lista vazia). Os criativos são criados sem `instagram_user_id` e entregam no
  Instagram pela página, igual aos de outubro.

## Pendente

- Legendas ainda **não aprovadas pela Marina**
  (`docs/marina-saleme/legendas-novembro-2026.md`).
- Produção das fotos com modelo dos 12 produtos sem foto.
- Conferir o destino dos 4 anúncios de feed e dos 3 Reels no gerenciador: a API
  de leitura não devolve o link.
