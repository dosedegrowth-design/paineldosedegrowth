# Carrossel de lançamento do site · Natal (Tayssa Farias)

Post do @1.tayssa anunciando o tayssafarias.com.br. 12 lâminas em 1080 x 1350 (4:5), feito em 10/11/2026 e atualizado em 12/11/2026 (valores divididos em cílios e sobrancelhas e lábios, com os Mega).

- `laminas/`: as 12 lâminas prontas, na ordem do post (`tayssa-natal-01.jpg` a `12`).
- `fundos/`: o fundo limpo de cada lâmina, sem texto nem foto.
- `legenda.txt`: a legenda do post.
- `visao-geral.jpg`: as 12 lado a lado.
- `capa-alternativa-chegou.jpg`: a mesma capa com CHEGOU no lugar de AGENDA. A palavra da capa sai de `CAPA="CH|EGOU" node build.mjs 1` (antes da barra fica cheio, depois fica vazado; sem a variável, AGENDA). O NATAL da primeira versão saiu a pedido do Lucas.
- `gerador/`: o que monta as lâminas (HTML + Playwright). Para refazer: `cd gerador && NODE_PATH=$(npm root -g) node build.mjs && python3 reduz.py .` (ou `node build.mjs 3,9` para só algumas). Renderiza em 2x e o `reduz.py` leva para 1080 x 1350, o que deixa o texto mais nítido. Sai em `gerador/out/`.

## Como foi feito

- **Fundos:** IA do Canva (a chave da kie.ai do ambiente deu 401 e não havia outra). Prompt-base do roteiro em todas, mudando só o pedido de cada lâmina. Três fundos: capa (árvore de um lado, espaço para a foto), internas (detalhe no alto à direita e embaixo à esquerda) e dezembro (vinho com dourado; o primeiro saiu claro e foi refeito trocando o papel claro por vinho). O fechamento usa o fundo da capa espelhado. Arte rascunho com os fundos no Canva: "Fundo de Natal em aquarela" (design `DAHainzdQbk`).
- **Fotos:** só as reais que a Tayssa mandou. Capa: a selfie do sorriso com a flor ao fundo. Fechamento (12/11/2026): uma selfie nova de blusa cinza que o Lucas mandou, de fundo no card inteiro, com véu vinho sobre o teto e a parede para o AGENDE claro aparecer e o recorte dela por cima (`fech-fundo*.{webp,png}`). A primeira selfie (a do `portrait.jpg`) saiu da capa a pedido do Lucas. Fundo recortado com rembg (`birefnet-portrait`), no lugar do recraft/remove-background da kie. As fotos vieram em 720 px; para o close ficar nítido foram ampliadas 4x com Real-ESRGAN (`RealESRGAN_x4plus`, só nitidez, não redesenha o rosto) e misturadas com 25% da foto original para manter a textura da pele. Lâmina 5: dois closes de olho com extensão (Volume Inglês e Mega Inglês, fotos do formulário da Tayssa em `vip.photos`); lâmina 6: um close de Brow Lamination e um de Hidragloss; lâmina 9: close de Volume Inglês. Só olho, sobrancelha e boca. Nunca rosto de cliente.
- **Capa e fechamento no desenho da referência:** rosto em close, título com parte cheia e parte só em contorno fino passando pelo rosto ("AG" cheio e "ENDA" vazado na capa; "AGE" vazado e "NDE" cheio no fechamento), linha pequena embaixo que fica vinho sobre o fundo e branca com contorno sobre ela (máscara `*-mask.png`, tirada do recorte da foto, com borda firme).
- **Texto:** aplicado em código por cima (Anton nos títulos, Inter no texto), copiado do roteiro. Valores, sinal de R$ 50, 4 h de antecedência, 10 min de tolerância, 48 h para remarcar e a regra do VIP (4 em 70 dias, 15 a 20 entre um e outro) conferidos com o banco e com `lib/tayssa/config.ts` em 10/11/2026.
- Ícone do WhatsApp: a logo oficial (o mesmo desenho de `components/tayssa/ui/whatsapp.tsx`).

## Antes de postar

- Os valores são os de 12/11/2026 (Mega Inglês R$ 200, Mega Brasileiro R$ 190 e Mega Fox R$ 230, todos 3h, conferidos com `vip.services`). Se a Tayssa mudar preço ou regra, editar `gerador/build.mjs` e gerar de novo.
- Lâmina 7 (12/11/2026, texto da Tayssa): dezembro abre primeiro só para as clientes VIP e, no dia 14 de novembro, para todas. No site, `settings.booking.prioridade_vip.abre_em` precisa dessa data para bater com o post.
- Lâmina 8 (12/11/2026): "Como virar VIP" saiu a pedido da Tayssa; no lugar, "Quem são as VIPs" (acompanham o trabalho dela com fidelidade e fazem os cílios com ela com frequência). A legenda não chama mais para o Cadastro VIP.

## Versão com prints do site (12/11/2026)

A pedido do Lucas, as lâminas 2 a 6 viraram um passo a passo com prints reais do site no celular (iPhone 13, tayssafarias.com.br), em `gerador/prints/`: 2 · Agendar horário e escolher o serviço; 3 · o dia e os horários livres; 4 · criar a conta; 5 · o sinal no Pix e o comprovante; 6 · Meus horários. Anel rosé onde tocar. Ordem nova: 1 capa, 2 a 4 como agendar, 5 sinal, 6 Meus horários, 7 valores (tabela única: cílios e sobrancelhas e lábios), 8 agenda de dezembro, 9 Clientes VIP (quem são e o que ganham, numa página), 10 indique uma amiga, 11 combinados, 12 fechamento.

Os prints das telas 5 e 6 saíram de uma conta e um pedido de teste ("Maria Exemplo", 30/11 às 16h, sem comprovante), criados e apagados no mesmo minuto com o ok do Lucas (conta, pedido, sessão e as 2 linhas do `vip.audit_log`). Para refazer os prints, os roteiros estão no histórico da sessão; a página e os textos podem mudar, então conferir antes de postar.
