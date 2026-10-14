# Marina Saleme — Estrutura de anúncios · Outubro 2026

> Handoff para execução no Meta Ads. Alinhado com a cliente e aprovado pelo Lucas em 13/10/2026.
> **ATIVADA em 14/10/2026**, com o OK do Lucas ("a campanha de conversão tem que parar e ativar uma
> nova com os anúncios que alinhamos"). A campanha `DD Conversao Vendas Lookalike 2.0 - 04/08/2026`
> (`120249487968470535`) foi **pausada** no mesmo momento. As campanhas de Tráfego e de Alcance
> continuam ativas, intocadas.
>
> No ar: campanha `120250690296280535`, R$ 225/dia em CBO, 3 conjuntos, **22 anúncios ACTIVE**.
> A verba de conversão subiu de R$ 150/dia (a antiga) para R$ 225/dia.

## Regras que não podem ser quebradas

- **Criar tudo pausado.** Nada entra no ar sem o Lucas conferir. Já houve um incidente de campanha
  ativada sem autorização; não repetir.
- `client_conversation_id` obrigatório em toda chamada da API Meta Ads: `Pd7kQ2mX9vB4nR8sT1wZ`
- Conta: a mesma já usada para Marina Saleme. Página/IG: perfil da Marina Saleme Estamparia.
- Estoque: **a palavra do Lucas vale mais que a contagem da Shopify** ("as vezes é so estoque
  desatualizado"). Não barrar peça por causa do número da loja.

## Orçamento

| Campanha | Verba/dia | Observação |
|---|---|---|
| Vendas | R$ 225 | **CBO no nível da campanha** |
| Tráfego | R$ 26 | igual ao mês anterior |
| Alcance | R$ 7 | igual ao mês anterior |
| **Total** | **R$ 258** | ≈ R$ 7.998/mês |

CBO e não verba por conjunto: são 26 anúncios para R$ 225/dia — dividido por igual daria
R$ 8,65 por anúncio, que não gera aprendizado. Em CBO o Meta concentra sozinho.

### Como criar CBO pela API (workaround conhecido)

1. Criar a campanha **sem** orçamento
2. Criar os conjuntos com `daily_budget` (ABO)
3. `ads_update_entity` na campanha setando o `daily_budget`

Edição de orçamento força `status_forced_to_paused: true` — o que aqui é o comportamento desejado.

## Público

Instagram · feminino · 40 a 65 anos · Brasil.
`targeting_automation.advantage_audience: 0` para travar idade e gênero.

> A API não expõe busca de interesses. Segmentação por interesse, se for usada, entra na mão no
> Gerenciador.

## Os 4 conjuntos · 26 anúncios

### Conjunto 01 · Sevilha — 10 anúncios

| # | Peça | Status da imagem |
|---|---|---|
| 01 | Chemise Sevilha Vermelho | pronta |
| 02 | Chemise Sevilha Azul | pronta |
| 03 | Calça Sevilha Vermelha | pronta |
| 04 | Calça Sevilha Azul | pronta · pedido da Marina |
| 05 | Caftan Sevilha Vermelho | pronta |
| 06 | Kimono Bali Sevilha | pronta — foto real do Lucas, modelo no fundo azul (frontal, kimono aberto) |
| 07 | Camisa Ana Sevilha | **refeita** — foto 16840 da modelo bege, estampa Sevilha aplicada |
| 08 | Camisa T Sevilha | pronta |
| 09 | Macacão Sevilha Azul | pronta · vendeu em outubro |
| 10 | Lenço Sevilha Rosa | pronta — lenço azul recolorido para o rosa real |

### Conjunto 02 · Ipanema — 5 peças + 2 conjuntos

| # | Peça | Status da imagem |
|---|---|---|
| 11 | Camisa T Ipanema Marrom | pronta |
| 12 | Camisa Ana Ipanema Marrom | pronta |
| 13 | Camisa Ana Ipanema Amarelo | **refeita** — foto 16837 da modelo bege, estampa Ipanema amarela aplicada |
| 14 | Saia Degrau Ipanema Marrom | pronta — saia trocada sobre foto real, 3 poses |
| 15 | Saia Degrau Ipanema Amarelo | pronta · vendeu em outubro |
| 16 | CONJUNTO · Saia Degrau Marrom + Camisa T ou Ana Marrom | foto de look |
| 17 | CONJUNTO · Saia Degrau Amarelo + Camisa Ana Amarelo | foto de look |

### Conjunto 03 · Leque — 3 anúncios

| # | Peça | Status da imagem |
|---|---|---|
| 18 | Vestido Princesa Leque Berinjela | pronta · **legenda tem que dizer que é algodão** |
| 19 | Vestido Clarice Leque Cinza | **TRAVADA** — só existem fotos da modelo Lara, que a cliente pediu para tirar |
| 20 | Camisa Lenço Leque Verde | pronta |

### Conjunto 04 · Sacolões — 5 peças + 1 conjunto

| # | Peça | Status da imagem |
|---|---|---|
| 21 | Sacolão Rei Rainha Vermelho | foto de uso |
| 22 | Sacolão Rei Rainha Mostarda | pronta — cenário de pátio aplicado |
| 23 | Sacolão Stripes Verde | pronta |
| 24 | Sacolão Stripes Vermelho | pronta |
| 25 | Sacolão Stripes Azul | pronta |
| 26 | CONJUNTO · Saia Degrau + Sacolão | pedido do Lucas |

Nenhuma peça ficou com still de catálogo. Os 26 anúncios sobem com a peça vestida.

## Hospedagem das imagens novas — bloqueio aberto

O Meta só aceita imagem por **URL pública** (o modo `LOCAL_FILE` depende de app interativo, que não existe nesta sessão). O Lucas autorizou usar a **biblioteca de arquivos da loja da Marina** como destino — é onde já moram as imagens dos criativos.

Caminho que funciona, via Admin GraphQL:
1. `stagedUploadsCreate` com `httpMethod: "PUT"` e `resource: "FILE"` (com `PUT` o upload é um `curl -X PUT --upload-file` na URL assinada, sem os ~8 parâmetros de formulário que o modo `POST` exige — bem mais simples).
2. `fileCreate` com `originalSource` = o `resourceUrl` de cada staged target, `contentType: IMAGE`, mais `alt` e `filename`.
3. `files(query: "filename:ADS_*")` até `fileStatus: READY` para colher a `image.url` pública.

Gotchas: o Shopify **acrescenta um sufixo UUID** ao nome do arquivo (o `filename` pedido não é respeitado ao pé da letra), então use a URL que volta, e ache cada peça pelo campo `alt`. O CDN também **recomprime o JPEG** (~40% menos peso, dimensões preservadas). As 22 imagens subiram com o prefixo `ADS_` — nenhum produto, preço, estoque, coleção ou tema foi tocado.

## Análise de outubro — o que o dado diz (13/out)

Levantamento em 5 frentes (Meta 30 dias, setembro vs outubro, públicos, Shopify, formato) mais uma passada crítica. Só o que ficou de pé depois da verificação.

### Dois alarmes que NÃO procedem

**"A faixa 40-65 corta o 65+."** Não corta. Li o targeting do conjunto que vendeu em setembro (`120249487980150535`, R$39.262, ROAS 4,46) e ele tem exatamente o mesmo `age_min: 40, age_max: 65` dos 4 conjuntos novos — e foi desse conjunto que saíram as 11 compras atribuídas à faixa "65+" no breakdown. No Meta, 65 é o teto da API e significa "65 ou mais". Não há nada a corrigir.

**"Os 4 públicos estão vazios e a campanha não vai entregar."** O `approximate_count` deles volta 20/20, é verdade. Mas o conjunto que vendeu R$39.262 em setembro usa **exatamente esses mesmos 4 públicos**. O desempenho real ganha do contador: eles entregam. O número 20/20 é artefato, não diagnóstico.

Os 4 conjuntos novos replicam fielmente o targeting do conjunto que vendeu. Está conforme o pedido.

### O que procede e vale decisão

| Achado | Número | Consequência |
|---|---|---|
| ROAS do Meta inflado | pixel disparou 15 eventos Purchase em 01–13/out contra 8 pedidos reais no Shopify (~1,9x). O Meta atribui R$21.747 de 01–13/out, e a loja inteira faturou R$23.722 no período (91,7%) | **A métrica de decisão tem que ser pedido do Shopify, não ROAS do Meta** |
| A estrutura anuncia o que não vendeu | só 26,3% da receita de outubro (R$6.180 de R$23.537) saiu de peças que os 26 anúncios cobrem | as 3 validadas são os anúncios 19, 09 e 15/17 |
| Ipanema: cor errada | vendeu **Verde** (R$3.840 — Calça + Camisa Lenço). Os anúncios são Marrom e Amarelo | trocar a cor ou aceitar que é teste |
| Camisa T é o modelo herói | R$5.092 em outubro (21,6%) nas estampas Tijolo, Cassino, Ondas, Atenas — nenhuma no plano. Em setembro, R$4.455 | dois meses seguidos acima de R$4.400 sem anúncio |
| Sacolões não vendeu | R$0 em 01–13/out nos 5 SKUs. Carrega 6 dos 26 anúncios (23%) | candidato a sair ou entrar com teto |
| Sevilha já foi testada | R$375,93 no Meta em 30 dias, **zero compra**. Carrega 10 dos 26 anúncios (38%) | maior bloco de verba na coleção que não converteu |
| Receita concentrada | 63,5% de outubro (R$15.075) veio de **uma** cliente, em 2 pedidos. Sem ela o ticket cai 4,8% abaixo de setembro | não dimensionar meta em cima do ticket de R$2.942 |
| Frequência saturando | conjunto vencedor em 2,96 e campanha em 3,04, com 19,9 mil de alcance. As 8 compras reais vieram com frequência mediana ~1,5 | público pequeno, 4 conjuntos disputando o mesmo leilão |
| Estoque crítico | Caftan Sevilha (05) 2 unidades; Saia Degrau Amarelo (15), Vestido Princesa (18) e Clarice (19) com 1 cada | 4 anúncios apontando para peça quase esgotada |
| Janela morta | zero pedido em 05–09/out (1º turno). 2º turno é 25/10 | provável repetição em 24–27/10 |

### Canal e posicionamento

100% das vendas de setembro vieram do Instagram, divididas entre Feed e Reels: Feed R$4.151 com 13 compras (ROAS 5,69, CPA R$319), Reels R$620 com 5 compras (ROAS 8,51, CPA R$124). Nenhuma linha de Facebook, Audience Network, Stories ou Explore. Cortar o Facebook não custa venda nenhuma — mas o certo é dizer que **o que vendeu foi 100% Instagram**, não que "Facebook não vende": ele nunca foi comprado nesse conjunto.

O Reels teve CTR melhor nos dois meses (9,90% e 9,64% contra 7,22% e 6,18%) e CPA menor no acumulado (R$258 contra R$404), mas fez **zero compra em outubro** com R$670 gastos. É direcional, não conclusivo — manter Feed e Reels juntos e deixar o CBO decidir.

### Públicos

Inventário real da conta: de ~176 públicos, 15 têm tamanho de entrega e 14 são engajamento de perfil. Os dois confirmadamente da Marina e com volume são `120219888489150535` (Instagram 365 dias, 85–100 mil, conta IG 602357466550214) e `120211613906190535` (lista `neutro.xlsx`, 14–16 mil pessoas reais, sem atualização desde ago/2024). O maior da conta (`120242670781220535`, 187–220 mil) vem de uma conta de Instagram não identificada — não usar.


## Achados técnicos da conta 782476046702053 (13/out)

Testado na própria conta, não é suposição.

**A identidade do Instagram NÃO é bloqueio.** `ads_get_ig_accounts` devolve `[]`, mas isso é falta da permissão `instagram_basic` no app para LISTAR as contas — não ausência de identidade. Os 26 criativos novos já têm `effective_instagram_media_id` preenchido, igual aos criativos da campanha antiga que estão no ar com 29 mil impressões. O Meta usa a Página como identidade no Instagram automaticamente. Passar `instagram_user_id` explícito falha: o id `602357466550214` que aparece no público "Compradoras Marina" é de shopping do Instagram, não de IG Business Account, e é rejeitado.

**Customização por posicionamento está bloqueada nesta conta.** `placement_customizations` (e `multi_media`) retornam: *"Placement Asset Customization is not enabled for this ad account in Ads MCP yet. This capability is controlled by the Ads MCP rollout and cannot be enabled in Ads Manager."* Ou seja, não dá para mandar uma imagem para o Feed e outra para o Reels pela API. É uma imagem por anúncio. Se quiser imagem separada por posicionamento, tem que ser na mão no Gerenciador.

**Proporção da imagem.** O Instagram Feed aceita de 1.91:1 até 4:5 (0,80). Imagem mais alta que isso é recortada. Auditoria dos 26 criativos: **16 estão abaixo de 0,79** e seriam cortados — inclusive as 8 novas geradas no KIE, que saem em 0,73. Como só cabe uma imagem por anúncio, o formato certo é **4:5 exato (1440x1800)**, que passa inteiro no Feed e no Reels aparece inteiro com preenchimento.

Reenquadramento sem cortar: `scratchpad/reformat.py`. A foto inteira é encaixada no quadro e as faixas que sobram são preenchidas esticando a coluna de borda da própria foto com blur leve. Em fundo de estúdio liso (bege, azul, preto) a emenda é invisível.

**Como desligar as automações do Advantage+ creative.** `standard_enhancements` foi descontinuado e é rejeitado; `music` não existe como feature. O spec abaixo foi aceito pela API nesta conta:

```json
{"creative_features_spec":{
  "image_touchups":{"enroll_status":"OPT_OUT"},
  "text_optimizations":{"enroll_status":"OPT_OUT"},
  "image_brightness_and_contrast":{"enroll_status":"OPT_OUT"},
  "enhance_cta":{"enroll_status":"OPT_OUT"},
  "image_templates":{"enroll_status":"OPT_OUT"},
  "image_animation":{"enroll_status":"OPT_OUT"},
  "adapt_to_placement":{"enroll_status":"OPT_OUT"},
  "media_type_automation":{"enroll_status":"OPT_OUT"},
  "video_auto_crop":{"enroll_status":"OPT_OUT"},
  "profile_card":{"enroll_status":"OPT_OUT"},
  "add_text_overlay":{"enroll_status":"OPT_OUT"}}}
```

`adapt_to_placement` é o que impede o recorte por posicionamento. `image_animation` e `media_type_automation` são os que transformam a foto em vídeo — é de onde vem a música automática no Reels; desligados os dois, não há música.

Vai como string JSON em `degrees_of_freedom_spec`, e não pode ser combinado com `advantage_plus_creative`.

**Criativo é imutável, e o anúncio NÃO pode ser reapontado.** Testado: `ads_update_entity` no nível `ad` recusa tanto `creative` quanto `creative_id` — *"Ad creatives are immutable and cannot be edited in place"* e *"Unsupported field(s) for entity_type=ad: creative_id"*. Ou seja, trocar a imagem de um anúncio existente **não existe** na API. O único caminho é criar criativo novo **e anúncio novo** (`ads_create_ad`) no mesmo conjunto, e aposentar o antigo. Como os 26 anúncios de outubro nasceram pausados e nunca entregaram, substituí-los não perde histórico nenhum. `ads_creative_delete` ainda não está liberado nesta conta, então criativo velho fica na biblioteca (sem anúncio, não entrega nem gasta). Sobrou lá um `ZZ TESTE automacoes desligadas v3 (apagar)`, id `1583073472934692`, dos testes — pode apagar no Gerenciador.


## Regra de imagem gerada

O Lucas fechou a regra em 13/out: **quando a imagem for gerada, usar só uma modelo** — a do fundo bege, a mesma do anúncio 08 Camisa T Sevilha.

Método: nunca criar a pessoa do zero. Partir sempre de uma **foto real dela** e trocar só o que a peça exige (estampa, cor, peça de roupa, fundo). Rosto, cabelo, pose, mãos, luz, grão e enquadramento ficam da foto original.

Fotos reais dela já localizadas na biblioteca da loja (ensaio `2509_Marina_Saleme*`, fundo bege, calça branca):

| Arquivo | Enquadramento | Uso |
|---|---|---|
| `2509_Marina_Saleme16902.jpg` | busto, mão na testa, olhos fechados | anúncio 08 |
| `2509_Marina_Saleme16873.jpg` | busto, três-quartos, olhando para a câmera | anúncio 11 (foto real, sem edição) |
| `2509_Marina_Saleme16840_1.jpg` | meio corpo, mãos na cintura, de frente | anúncio 07 |
| `2509_Marina_Saleme16837.jpg` | corpo inteiro, de pé, descalça | anúncio 13 |

Sobraram sem uso ainda: `16728`, `16732`, `16752` (jaqueta jeans, mesmo fundo) — servem se precisar de mais uma pose dela.

Ferramenta: KIE (`google/nano-banana-edit`), que devolve 864×1184 sempre; depois Lanczos 2× + unsharp para 1728×2368. O `nano-banana-2-1` em 4K redesenha a estampa — não usar. O `recraft/crisp-upscale` transforma a foto em vetor — não usar. O `topaz/image-upscale` está retornando erro interno.

Na estampa, o que mais erra é a **escala do rapport**. Dizer no prompt quantas faixas aparecem na frente da peça e qual o tamanho de cada losango, e conferir contra a foto do produto antes de aceitar.

## Fora de outubro

| Peça | Motivo |
|---|---|
| Calça Leque Verde | acabou (confirmado pelo Lucas) — era a nº1 de setembro, R$ 5.040 |
| Camisa Jota Leque Mostarda | acabou · 0 em estoque, rascunho |
| Saia Envelope Sevilha Azul | não tem |
| Saia Envelope Sevilha Vermelho | não tem |
| Lenço Sevilha Azul | substituído pelo rosa |

## Contexto que motivou esta estrutura

- **Nenhuma das 5 campeãs de setembro repetiu em outubro.** A nº1 (Calça Leque Verde, R$ 5.040)
  esgotou. Perseguir o criativo vencedor falha por construção: o estoque por peça é de 1 a 11
  unidades, então quando o vencedor aparece no relatório já não há o que vender.
- **Outubro (1 a 13): 19 peças, 19 pedidos, uma unidade cada, zero repetição.** R$ 23.537.
- 84% do tráfego da loja vem do Instagram (3.469 de 4.117 sessões).
- **Eleição:** de 05 a 09/10, nos cinco dias seguintes ao primeiro turno, a loja recebeu 1.415
  visitas (movimento normal) e vendeu **zero**. O tráfego não caiu — a decisão de compra parou.
  Segundo turno em 25/10.

### Recomendação de calendário

Não estrear os criativos novos entre **24 e 28/10**. Segurar a estreia para **29/10** e deixar no ar
apenas o que já estava rodando. Decisão final é do Lucas.

## Pendências

- [ ] Publicar a estrutura no Meta (pausada) — bloqueado só pelo conector
- [ ] Legendas das 26 peças — processo anterior parou em 9 de 27, refazer
- [ ] Lenço Sevilha Rosa: recolorir a foto real do lenço azul para o rosa real via API do kie.ai
      (`POST https://api.kie.ai/api/v1/jobs/createTask`, modelo `google/nano-banana-edit`).
      Chave do Lucas — pedir a ele, não está versionada.
      Referências públicas:
      - modelo com o lenço azul: `https://cdn.shopify.com/s/files/1/0272/7929/4543/files/em_baixa2510_Marina_Saleme_Alto_Verao26647.jpg`
      - still do lenço rosa: `https://cdn.shopify.com/s/files/1/0272/7929/4543/files/MARINA-SALEME_006_3_e644b2bf-4201-4554-9af0-4de4de97775f.png`
      Regra: trocar **apenas** a base turquesa pelo rosa. Palmeiras douradas, panteras pretas,
      barrado vermelho e moldura geométrica têm que sair idênticos. Se a estampa distorcer,
      descartar — anúncio não pode mostrar produto que não existe.
- [ ] Saia Degrau Ipanema Marrom, Sacolão Rei Rainha Mostarda, Vestido Clarice: sem foto utilizável

## Revisao da cliente — 14/out/2026

A Marina leu os 26 anuncios na pagina `painel.dosedegrowth.com/marina` e devolveu os ajustes
abaixo. **Resultado: 22 anuncios.** Tudo aplicado nos dois lugares (pagina + Meta) em 14/out.

### Legendas — o texto e dela, nao reescrever

| # | O que ela pediu |
|---|---|
| 01, 02 | Trocar "chemise em linho leve e arejado" por **"Chemise 100% linho"** |
| 03 | "compoe com a chemise e com a **blusa Diva**" |
| 06 | "Kimono Sevilha, **100% seda**" + **"com fechamento opcional sem transpasse"**. Ela escreveu antes "aberto ou semi aberto", depois voltou atras: *"Calma: vou pensar. Nao gostei do aberto ou semi aberto."* — o 06 ainda pode mudar |
| 10 | "super versatil, pode ser usado como **top**, na cintura, no pescoco" |
| 11 | "A estampa Ipanema Marrom e **atemporal**, e compoe com a Saia Degrau Ipanema Marrom" |
| 15 | "Na Estampa Ipanema Amarelo compoe muito bem com a Camisa Ana Ipanema Amarelo. Ultima" |

### Fotos trocadas

- **05 Caftan** — *"a Lara e influencer, nao modelo"*. Saiu `IMG-1027.jpg`, entrou
  `embaixa2510MarinaSalemeAltoVerao25238.jpg` (a modelo do ensaio, corpo inteiro, fundo azul).
  Hospedada como `ADS_05b_Caftan_Sevilha_Vermelho.jpg`.
- **12 Camisa Ana Ipanema Marrom** — *"A Foto esta errada! A camisa da foto e a camisa Lenco, e a
  foto esta feia"*. Ela tem razao: a foto vinha de `2509_Marina_Saleme17746.jpg`, onde a modelo
  usa a Camisa Lenco (modelagem larga, mangas amplas), nao a Ana (colarinho e punho).
  Entrou **`CAMISA_ANA_IPANEMA_MARROM_1.jpg`** — foto real da peca certa, na rua em Copacabana,
  que ja estava na propria pagina do produto e ninguem tinha achado. Hospedada como
  `ADS_12b_Camisa_Ana_Ipanema_Marrom.jpg`. **Nao e imagem gerada.**

### Peca errada no texto

- **13** era "Camisa Ana Ipanema Amarelo", mas a foto mostra **gola careca** = Camisa T.
  Ela ofereceu *"Trocar a foto ou a descricao"* — trocamos a descricao, porque a foto esta certa
  e o produto **CAMISA T IPANEMA AMARELO** existe (`camisa-t-ipanema-amarelo`, 9 em estoque).
  O anuncio agora aponta para la.
- **16 e 17** — *"so acertar a camisa"*. Conferido no decote: no 16 a peca e a **Camisa Lenco**
  (larga, mangas amplas); no 17 e a **Camisa T** (gola banda). As legendas nomeiam a peca certa.

### Fora da estrutura

- **18, 19, 20** — o conjunto **Leque inteiro** saiu. O ad set `120250690303110535` foi arquivado.
- **26** (carrossel saia + sacolao) — *"A saia Degrau ja foi mencionada, no anuncio 16"*.

### Como ficou

| Conjunto | Anuncios |
|---|---|
| 01 Sevilha | 10 (01 a 10) |
| 02 Ipanema | 7 (11 a 17) |
| 03 Leque | **arquivado** |
| 04 Sacoloes | 5 (21 a 25) |
| **Total** | **22**, todos PAUSADOS |

16 criativos e 16 anuncios novos (sufixo `v3`), porque criativo e imutavel e anuncio nao pode ser
reapontado. Os substituidos, os excluidos e os 26 `ZZ SUBSTITUIDO` foram **arquivados** — a
campanha mostra so os 22.

### Pendente com a cliente

- **Videos das bolsas** — ela perguntou *"Vamos enviar videos das bolsas tambem ok?"*. Sim: o Meta
  aceita video no Feed e no Reels. A loja nao tem video de bolsa (os unicos videos no acervo sao
  de 2020/2023 e nao sao das bolsas). Quando ela mandar: mp4, 4:5 ou 9:16, ate 60s. Vira anuncio
  novo (`ads_create_creative` com `video_id` + thumbnail).
- **06 Kimono** — ela disse que ia pensar. Esta no ar com "fechamento opcional sem transpasse".
- **Divulgacao de IA**: 10, 13 e 16 usam imagem editada por IA sobre foto real. O campo
  `self_ai_disclosure` do criativo **nao foi preenchido** — a declaracao e do anunciante, nao
  nossa, e so vale na Europa, India, Taiwan, California e Nova York. A campanha e so Brasil.
  Se o Lucas quiser declarar, tem que ser na criacao do criativo (nao da para editar depois).
