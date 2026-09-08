# LP Vem Pra Paraty — briefing de construção

Base preparada em 8/set/2026. Nada de copy final aqui: isto é o chão pra receber
as instruções. Todo número vem de `dados/vpp.json`, que por sua vez vem da
pesquisa em `criativos/vem-pra-paraty/direcao/` (branch `claude/vem-pra-paraty-meta-ads-b43uni`).

## O que já existe e não precisa ser refeito

| Ativo | Onde |
|---|---|
| 144 criativos de Meta Ads (3 lanchas × 9 peças × 3 registros × 2 formatos) | branch dos criativos, `<lancha>/out/` |
| Copy pronta: título, botão e 3 variações de texto por peça | `<lancha>/INDICE-CRIATIVOS.txt` e `criativos.json` |
| 6 frentes de pesquisa com fonte por afirmação | `direcao/pesquisa/` |
| Direção de arte publicada | `direcao/carta-nautica.html` |
| Fotos da frota (16 arquivos) | `public/fotos/` aqui |
| Paleta e tipografia | `tokens.css` aqui |
| Conta de anúncios ativa, com campanha de Mensagens | Meta `1760209501849653` |

A LP não inventa posicionamento. Ela é a versão longa do que os anúncios já dizem.

## A tese, em uma frase

**A LP não fala de valores.** Nenhum preço: nem o nosso, nem o de concorrente,
nem conta por pessoa, nem "a partir de". Preço só no WhatsApp — que é, aliás, o
que metade do mercado de Paraty já faz.

Isso tira do jogo a comparação de preço que sustentava os criativos. O que
sobra da pesquisa é mais difícil de copiar e não envelhece com a tabela:

**O barco é de vocês. Ninguém embarca no meio do caminho, e o roteiro é de quem
fechou.**

A escuna e a lancha compartilhada não têm como oferecer isso — e a queixa
dominante contra elas não é preço, é aglomeração e roteiro engessado, com
relatos de 200 pessoas a bordo. Ganha-se por lotação, não por preço; sem preço
na página, isso deixa de ser apoio e vira o eixo.

Os sete argumentos que sobrevivem sem cifra estão em `dados/vpp.json`, em
`argumentos_da_lp`: lotação, roteiro próprio, criança, banheiro, frota própria,
o marinheiro pelo nome, e a baía abrigada.

O que cada lancha vende, então:

| Lancha | Vende |
|---|---|
| 18 pés | O barco inteiro pro grupo pequeno, roteiro escolhido por eles |
| 24 pés | Doze lugares num barco só — resolve quem hoje se divide em dois barcos |
| 33 pés | Banheiro a bordo e suíte, que ninguém na praça tem. Mais 15 lugares |

Os preços continuam em `dados/vpp.json`, dentro de blocos `_interno_*`, só como
contexto de estratégia. Se algum aparecer renderizado na página, é bug — tem
varredura de cifra no build pra pegar isso.

## Estrutura proposta — e de onde cada seção veio

Ordem por objeção, não por vaidade. Nenhuma seção usa número.

1. **O barco é de vocês** · a promessa central + CTA WhatsApp.
2. **Escolha o barco** · 3 cards com pés, lotação, mínimo e banheiro. Sem preço.
   O mínimo é obrigatório onde existe — grupo de 3 ou 4 que descobre o mínimo só
   no WhatsApp é conversa perdida e cliente irritado. (pesq-objecoes 3)
3. **Os roteiros** · três sugestões com as paradas nomeadas, mais roteiro
   personalizado no mesmo peso. Roteiro nomeado responde a pergunta que o lead
   faz antes de fechar. **Sem afirmar duração nem número de paradas** — varia por
   roteiro, grupo e condição do dia. Sem prometer mangue nem cachoeira no
   Mamanguá: lancha não entra lá. (briefing + pesq-objecoes 17)
4. **O que vai a bordo** · a lista de itens, sem valor e sem comparação.
5. **Privativo × dividir o barco** · lotação, roteiro e horário. A comparação é
   sempre com a categoria ("a escuna", "a compartilhada"), nunca com empresa, e
   agora nunca com preço. (pesq-objecoes 4)
6. **As perguntas que ninguém responde** · criança conta como passageiro,
   inclusive bebê de colo; a compartilhada proíbe menor de 6 anos e tem assento
   demarcado, o que empurra família com filho pequeno pro privativo por
   obrigação; marinheiro não ocupa vaga; banheiro resolvido pela parada, não pelo
   silêncio; enjoo tem resposta geográfica, a baía é abrigada; e se chover.
   (pesq-objecoes 3, 5, 6, 7, 8, 22)
7. **"Vai ter barco no dia?"** · frota própria + documentação da Capitania. O
   medo real não é se o passeio é bom, é se o barco existe. Metade do mercado é
   agência revendendo barco de terceiro. Prova documental que ninguém usa.
   (pesq-objecoes 13, 25, 26)
8. **Quem leva vocês** · o marinheiro pelo primeiro nome, com foto. A unidade de
   confiança do mercado é a pessoa, não a marca. (pesq-objecoes 12)
9. **Como reserva** · como funciona o combinado, política de chuva e de
   cancelamento publicadas, e o aviso de que nas ilhas o pagamento costuma ser só
   em dinheiro. Valores e sinal ficam pra conversa. (pesq-objecoes 8, 20, 27)
10. **FAQ** + **CTA WhatsApp fixo**, com mensagem pré-preenchida por lancha.

Seção 8 e qualquer peça de família só entram depois das pendências abaixo.

## O que trava — 8/set, fim do dia

**Trava a LP inteira**
- Nada.

**Trava uma seção**
1. **Lotação da 18 pés: 6 ou 7?** O briefing do cliente diz 7+1, as 48 artes
   foram feitas com 6. Enquanto não vier, a ficha e a pergunta "cabem quantas
   pessoas?" da 18 pés saem sem número. As outras duas lanchas estão zeradas.

**Vale insistir, não bloqueia**
2. **Prazo concreto pra chuva e cancelamento.** Ficou "avisando com
   antecedência, a gente remarca". A pesquisa apontou a política de chuva como o
   maior gerador de conflito pós-venda do setor — há reclamação pública de
   reembolso negado — e o padrão de mercado é prazo fixo (aviso até 21h da
   véspera). Um número aqui é a garantia mais barata de comprar.
3. **A foto `24-pes-a-confirmar-conves-cais.jpg` é o barco de 24?** Ficou fora
   das peças porque o convés de teca não bate com o casco das outras.
4. **Foto do banheiro e da suíte da 33 pés**, e fotos dela em resolução cheia
   (as quatro atuais têm 768–960px). São os dois argumentos centrais da lancha de
   maior ticket e não aparecem em imagem nenhuma.

**Escrito**
- **O que vai a bordo:** marinheiro (não ocupa vaga), combustível, coletes
  salva-vidas incluindo infantis por faixa de peso, cooler com gelo, água, fruta,
  boias e snorkel. Comida e bebida por conta do cliente entram como liberdade, e
  não como custo — é assim que o setor vende.
- **As perguntas que ninguém responde:** quantas pessoas cabem (criança conta,
  inclusive bebê de colo), colete infantil, ninguém embarca no meio do caminho,
  banheiro, enjoo (a baía é abrigada) e chuva. Banheiro e lotação variam por barco.
- **"Vai ter barco no dia?":** frota própria, sem exibir documento.
- **Como reserva:** data e número de pessoas pelo WhatsApp, remarcação avisando
  com antecedência, e o aviso de levar trocado porque nas ilhas costuma ser só
  dinheiro.

**Fora da LP, por decisão do cliente**
- **Documentos da Capitania.** Sem necessidade.
- **Seção "Quem leva vocês", com nome e foto dos marinheiros.** Sem necessidade.
  Fica registrado que a pesquisa apontou o primeiro nome do marinheiro como a
  unidade de confiança do mercado: as avaliações 5 estrelas elogiam a pessoa,
  quase nunca a marca. Se um dia quiser, é uma seção barata de montar.

A LP passou de dez seções pra nove.

## Decisões tomadas (8/set/2026)

- **Onde mora:** aqui, em `sites/vem-pra-paraty/`, junto dos criativos e da
  pesquisa. App Next 16.2.4 próprio, Tailwind v4, mesma config do painel.
  Deploy num projeto Vercel novo com Root Directory apontando pra esta pasta.
- **Escopo:** três páginas, uma por lancha (`/18-pes`, `/24-pes`, `/33-pes`),
  com seletor no topo. `/` redireciona pra `/24-pes`, que é a de argumento mais
  forte. Separar era obrigatório: a 33 pés contradiz a conta das outras duas.
- **Funil:** a campanha de Mensagens continua indo direto pro WhatsApp — não se
  mexe no que já converte. A de Tráfego, que hoje manda pro perfil do Instagram,
  passa a apontar pra LP.
- **Sem valores na página** (8/set). Preço só no WhatsApp.
  *Consequência aberta:* 96 das 144 artes têm selo de preço. Anúncio com cifra
  levando pra página sem cifra é atrito. Ou as artes do registro "forte" são
  regeradas sem selo (`node gerar.mjs`, um comando por lancha), ou a LP recebe só
  o tráfego das peças do registro "sóbrio", que já não têm preço. A decidir.
- **Domínio:** ainda não há domínio próprio. O projeto Vercel
  `vem-pra-paraty-proposta` que já existe no time é a proposta comercial, não
  esta LP — a LP precisa de projeto novo.

## Estado do esqueleto

`npx next build` passa, gerando as três páginas estáticas. O que está no ar é a
moldura: seletor de lancha, cabeçalho com preço vindo do JSON, as dez seções
numeradas vazias e um bloco "Trava publicação" que lista sozinho as pendências
que ainda faltam pra aquela lancha. Some quando os campos deixarem de ser
PENDENTE.

`next.config.ts` fixa `turbopack.root` nesta pasta — sem isso o Turbopack sobe
até a raiz do repo e tenta compilar o `middleware.ts` do painel.

## Regras que a LP herda dos anúncios

Estão em `tokens.css` e valem como restrição, não como sugestão:
sem starburst, sem preço riscado, sem selo de desconto, sem emoji, e nenhuma
menção a concorrente pelo nome — a comparação é sempre com a categoria.
