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

Fechar a lancha custa menos por pessoa do que um assento na lancha compartilhada
— e **nenhum dos 19 anúncios ativos do mercado de Paraty faz essa conta**, nem
publica preço. A LP existe pra sustentar essa conta com prova, porque a conta é
o que o anúncio promete e o WhatsApp hoje não consegue provar em escala.

Isso muda por lancha:

| Lancha | Preço | Por pessoa | Contra a compartilhada (R$ 250) | O que vende |
|---|---|---|---|---|
| 18 pés | R$ 1.000 | R$ 167 (com 6) / R$ 143 (com 7) | ganha | a conta |
| 24 pés | R$ 1.600 | R$ 133 (cheio, 12) | ganha por larga margem | a conta, na versão mais forte |
| 33 pés | R$ 2.500 | R$ 278 (com 9) | **perde** | banheiro, suíte, 15 lugares |

A 33 pés nunca entra na comparação de preço por cabeça. Se a LP colocar as três
lado a lado numa tabela de "por pessoa", ela mata a própria lancha de maior ticket.

## Estrutura proposta — e de onde cada seção veio

Ordem por objeção, não por vaidade. Cada uma responde uma pergunta que a pesquisa
achou no mercado real.

1. **Hero — a conta** · a comparação que ninguém faz + CTA WhatsApp.
2. **Escolha o barco** · 3 cards. Preço fechado, lotação, mínimo, por pessoa. A
   linha de apoio do mínimo é obrigatória — é o que impede o lead de chegar no
   WhatsApp achando que o valor é por pessoa. (pesq-objecoes 3)
3. **Os três roteiros, com as paradas nomeadas** · roteiro nomeado responde a
   pergunta que o lead faz antes de fechar. Sem prometer mangue nem cachoeira no
   Mamanguá — lancha não entra lá. (briefing + pesq-objecoes 17)
4. **O que está incluso, o que não está** · precisa listar os MESMOS itens do
   pacote da compartilhada, senão o "mais barato" vira comparação de coisas
   diferentes e cai com uma frase. (pesq-objecoes 18)
5. **Privativo × compartilhada × escuna** · ganha-se por lotação, não por preço.
   A escuna é a âncora de baixo real (R$ 110–130), não a compartilhada. (pesq-objecoes 4, pesq-precos 15)
6. **As perguntas que ninguém responde** · criança conta como passageiro (inclusive
   bebê de colo); marinheiro não ocupa vaga; ninguém embarca no meio do caminho;
   banheiro (resolver pela parada, não pelo silêncio); enjoo (a baía é abrigada);
   e se chover. (pesq-objecoes 3, 5, 6, 7, 8, 22)
7. **"Vai ter barco no dia?"** · frota própria + documentação da Capitania.
   O medo real não é se o passeio é bom, é se o barco existe. Metade do mercado é
   agência revendendo barco de terceiro. Prova documental que ninguém usa. (pesq-objecoes 13, 25, 26)
8. **Quem leva vocês** · o marinheiro pelo primeiro nome, com foto. A unidade de
   confiança do mercado é a pessoa, não a marca — e nenhum anúncio da praça usa isso. (pesq-objecoes 12)
9. **Como reserva** · sinal, saldo no dia, aviso de dinheiro nas ilhas, política de
   chuva e de cancelamento publicadas. Prazo generoso publicado é a garantia mais
   barata de comprar. (pesq-objecoes 8, 11, 20, 27)
10. **FAQ** + **CTA WhatsApp fixo** com mensagem pré-preenchida por lancha.

Seção 8 e a foto de família só entram depois das pendências abaixo.

## O que trava — responder antes de escrever copy final

Ordenado por quanto quebra se ficar sem resposta.

**Trava a LP inteira**
1. **Número do WhatsApp** em formato E.164, e se é o mesmo pras três lanchas.
2. **Duração do passeio em horas** e **quantas paradas**. O padrão do mercado é
   5–6h. Se o R$ 1.000 cobrir menos que 5h, a comparação de preço desmonta
   inteira — o consumidor compara bloco fechado contra bloco fechado.
3. **O que está incluso**, item a item, contra a lista padrão do mercado
   (marinheiro, combustível, coletes, cooler com gelo, água mineral, máscara e
   snorkel, flutuadores).

**Trava seções específicas**
4. **Lotação da 18 pés: 6 ou 7?** O briefing diz 7+1, as 48 artes foram feitas com
   6. Muda o selo das peças e a conta por pessoa (R$ 167 × R$ 143).
5. **Preço da 33 pés acima de 9 pessoas**, até os 15 lugares. Sem isso a seção da
   33 não promete preço pra grupo grande.
6. **Sinal** (% e forma) e **parcelamento**. A 20%, a barreira do "R$ 1.000" vira
   R$ 200 e o CTA fica muito mais fácil.
7. **Política de chuva** e **de cancelamento**, com prazo. É o que mais gera
   conflito pós-venda no setor.
8. **Nomes dos marinheiros** + uma foto de cada.
9. **Documentos**: TIE da Capitania, vistoria da Marinha, habilitação do condutor.
10. **Inventário de coletes infantis por faixa de peso** — sem isso não roda nada
    de família, nem na LP nem no anúncio.
11. **A foto `24-pes-a-confirmar-conves-cais.jpg` é o barco de 24?**

**Não trava, mas melhora muito**
12. Foto do **banheiro e da suíte** da 33 pés — são os dois argumentos centrais
    dela e não aparecem em nenhuma das quatro fotos.
13. Fotos novas da 33 pés em resolução cheia (as atuais têm 768–960px).
14. Diária de foto de meio período, 11h–14h, com gente a bordo.

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
