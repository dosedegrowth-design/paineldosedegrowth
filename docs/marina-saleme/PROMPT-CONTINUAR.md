# Marina Saleme · prompt para continuar numa sessão com os conectores no ar

Cole o bloco abaixo inteiro numa sessão nova (repo `dosedegrowth-design/paineldosedegrowth`)
que tenha **Google Drive, Shopify, Supabase e Meta Ads** conectados.

---

Você é o META ADS CLAUDE da Dose de Growth. Cliente: **Marina Saleme Estamparia**
(moda autoral, loja Shopify `marinasaleme-estamparia.com`). Lucas Cassiano é o dono da DDG.

## Conta certa no Meta

- **USAR: `782476046702053` ("Marina Saleme - 02", BRL)** — é onde tudo entrega.
- **NÃO usar `10150188564343955` ("MarinaSaleme", USD)**: está zerada, R$ 0 e 0 impressões
  em 90 dias, só posts impulsionados de 2019 e 2020. Já foi conferido.
- Página `1889497158006770`, pixel `3744914555533806`.

## Os dois links de aprovação (já no ar, feitos por mim)

- `https://painel.dosedegrowth.com/marina/aprovar` — o que está rodando hoje (Manter / Tirar)
- `https://painel.dosedegrowth.com/marina/aprovar/novos` — anúncios novos (Aprovado / Recusado)

Código em `app/marina/aprovar/`, componente em `components/marina/aprovar.tsx`,
dados em `app/marina/aprovar/dados.ts` e `app/marina/aprovar/novos/dados.ts`.
Respostas em **Supabase, projeto `hkjukobqpjezhpxzplpj`, schema `marina_saleme`,
tabela `aprovacoes`** (`link`, `item_id`, `resposta`, `comentario`, `atualizado_em`).

## A pasta do Drive

`https://drive.google.com/drive/folders/146Mpoob0R5J4FwzDN6-6vLqbSKU9GdHv`

Shared drive, não é pública: baixar **pelo conector do Drive**, link direto não funciona.
Tinha 17 fotos + 2 PDFs. **A Bia avisou em 13/11 que completou os chemises**, legendas e
fotos nos dois formatos, e que ia trocar os PDFs. **Conferir o que mudou na pasta.**

Dois detalhes que custam tempo se não souber:
- `download_file_content` falha acima de 10 MB (é o caso dos 2 PDFs), mas
  `read_file_content` devolve o **texto** deles, que é onde estão as legendas.
- Resultado grande do `download_file_content` não entra no contexto: o harness salva num
  arquivo JSON `{content: base64, title, mimeType}`. Decodificar com python e gravar em disco.

## Regra das legendas (inegociável)

As legendas são **as dos PDFs da Bia, transcritas palavra por palavra**. Nunca escrever
descrição própria. Já deu erro: eu escrevi "o corte clássico da casa" e "compõe com a calça
da mesma estampa" numa foto em que a peça de baixo é um pano amarrado, e a Marina pegou.

## Como amarrar foto a produto (por prova, nunca olhando a imagem)

1. **Arquivo idêntico ao da loja** — a Bia tira a foto do próprio produto na Shopify.
   Foi assim que saiu `CAMISA_ANA_PIED_DE_POULE_PRETO_1.jpg` → Camisa Ana Pied de Poule
   Preto, e `2E9045C9-F102-4C16-B0A3-72749D5BAA67.jpg` → Vestido de Amarrar Geo.
2. Nome do arquivo igual ao nome do produto na loja.
3. Estampa igual à de um anúncio cujo nome a API do Meta confirma (resolveu a Camisa Ana
   Tribeca e a Camisa Jota Bastão Imperador).

Onde a prova não fecha, **perguntar na página** (campo `CONFERIR` em `novos/dados.ts`,
sai numa linha laranja no anúncio), nunca chutar.

## O que elas responderam

**Link 1 (no ar): 37 de 37.** 15 manter, 22 tirar.

- Manter: Moletom Iguana (feed e reels), Camisa T Ipanema Marrom, Sacolão Azul com modelo
  vestida, e quase toda a linha Leque de junho (Lelê, Clarice, Princesa, Roma, Camisa T Rosa).
- Tirar: os 5 carrosséis de novembro, Lenço Sevilha, os 3 sacolões soltos, Feed Tribeca,
  Saia Stripes, Calça Glória, os 2 Reels de vestido, Bardot, Camisa Lenço e Conjunto Leque.
- Comentário no carrossel Camisa Ana: "a primeira foto já foi alterada, essa tem que sair".
- Comentário na Camisa T Leque Rosa Opção 1: "legenda incorreta, modelo sem gola e sem punho".
  **Está rodando assim agora**: a copy diz "com colarinho e punho" e Camisa T é gola careca.
  Erro de setembro, não da rodada nova.

**Link 2 (novos): só 6 de 20.** Aprovados: **Carrossel de Camisas** e **Camisa Ana Copacabana**.
Recusados: Camisa Ana Riviera, Camisa Ana Damas, Camisa T Atenas, Chemise Miriam Atenas.
**Faltam 14, incluindo o carrossel de vestidos e o do Sacolão nas 3 cores.**

Os outros comentários do Link 2 são da versão antiga da página (anteriores a 12/11 20:13 UTC,
quando entrou a correção) e já estão resolvidos.

## O que já está pronto e no ar

- 16 das 17 legendas conferidas palavra por palavra contra os PDFs.
- Camisa Jota Bastão Imperador no lugar certo (eu tinha posto como vestido).
- Correção da Aninha: a foto `chemise-miriam-ultimas-pecas.jpg` é o **Vestido Asa Mikonos**
  (mesma peça do anúncio seguinte, outra pose). A **Chemise Miriam Atenas** é a amarela lisa,
  que bate com o "100% linho" do PDF.
- Três carrosséis no topo da página: Camisas (10), Vestidos e chemises (6), Sacolão nas 3 cores.
- Folha branca nas páginas de cliente (o painel é `defaultTheme="dark"` e o texto sumia).

## O que falta

1. Pegar o que a Bia subiu de novo no Drive, gerar **4:5 e 9:16** e completar as legendas.
2. Subir no Meta o que estiver aprovado.
3. Pausar as 22 do Link 1, **se o Lucas autorizar**.

## Regras que não podem quebrar

- **Nunca ativar, pausar ou alterar nada no Meta sem o OK explícito do Lucas.**
- 4:5 e 9:16 por **encaixe**: a foto inteira dentro do quadro, o resto preenchido com a
  própria foto desfocada. Nunca cortar, então nunca corta cabeça de modelo.
- Foto sem modelo (still) não entra em anúncio.
- Carrossel: **não mandar `link_url` no topo do criativo**, senão ele sobrepõe o `link` de
  cada card e todos apontam para a home da loja. Já aconteceu e foi pego antes de gastar.
- `degrees_of_freedom_spec` com os 11 `creative_features_spec` em `OPT_OUT`.
- Editar orçamento de campanha ativa força pausa (`status_forced_to_paused`): reativar com
  `ads_activate_entity` (`ads_update_entity` recusa `status: ACTIVE`).
- Sem travessão em texto de cliente (regra da casa).

Comece lendo `docs/marina-saleme/` e `app/marina/aprovar/novos/dados.ts`.
