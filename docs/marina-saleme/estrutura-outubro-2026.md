# Marina Saleme — Estrutura de anúncios · Outubro 2026

> Handoff para execução no Meta Ads. Alinhado com a cliente e aprovado pelo Lucas em 13/10/2026.
> Esta estrutura **ainda não foi publicada**: o conector Meta Ads não estava autenticado na sessão
> em que ela foi montada. A sessão que pegar este arquivo deve criar tudo **PAUSADO** e avisar
> antes de ligar qualquer coisa.

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

As 9 imagens novas (as 8 geradas no KIE + a foto do Kimono) **ainda não estão nos criativos do Meta**. Dois motivos:

1. Criativo no Meta é imutável. Trocar a imagem = criar criativo novo + trocar o criativo do anúncio. São 9 pares de operações.
2. `ads_creative_upload_media` só aceita **URL pública** (o modo `LOCAL_FILE` depende de app interativo, que não existe nesta sessão). As 9 imagens estão só no scratchpad.

Precisa de um destino público antes. Duas opções, decisão do Lucas:

- **Biblioteca de arquivos da loja da Marina** (`fileCreate` no Admin GraphQL). É onde já moram as 26 imagens atuais dos criativos — consistente. Mas escreve na loja da cliente.
- **Supabase Storage do projeto DDG** (`hkjukobqpjezhpxzplpj`), bucket público. Infra da DDG, não toca na loja da cliente. Precisa da service role key, que não está nas envs desta sessão.

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

**Criativo é imutável.** Trocar a imagem de um anúncio = criar criativo novo + apontar o anúncio para ele. `ads_creative_delete` ainda não está liberado nesta conta, então criativo velho fica na biblioteca (sem anúncio, não entrega nem gasta). Sobrou lá um `ZZ TESTE automacoes desligadas v3 (apagar)`, id `1583073472934692`, dos testes — pode apagar no Gerenciador.


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
