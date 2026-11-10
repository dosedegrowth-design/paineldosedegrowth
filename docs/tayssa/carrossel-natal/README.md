# Carrossel de lançamento do site · Natal (Tayssa Farias)

Post do @1.tayssa anunciando o tayssafarias.com.br. 11 lâminas em 1080 x 1350 (4:5), feito em 10/11/2026.

- `laminas/`: as 11 lâminas prontas, na ordem do post (`tayssa-natal-01.jpg` a `11`).
- `fundos/`: o fundo limpo de cada lâmina, sem texto nem foto.
- `legenda.txt`: a legenda do post.
- `visao-geral.jpg`: as 11 lado a lado.
- `gerador/`: o que monta as lâminas (HTML + Playwright). Para refazer: `cd gerador && NODE_PATH=$(npm root -g) node build.mjs && python3 reduz.py .` (ou `node build.mjs 3,9` para só algumas). Renderiza em 2x e o `reduz.py` leva para 1080 x 1350, o que deixa o texto mais nítido. Sai em `gerador/out/`.

## Como foi feito

- **Fundos:** IA do Canva (a chave da kie.ai do ambiente deu 401 e não havia outra). Prompt-base do roteiro em todas, mudando só o pedido de cada lâmina. Três fundos: capa (árvore de um lado, espaço para a foto), internas (detalhe no alto à direita e embaixo à esquerda) e dezembro (vinho com dourado; o primeiro saiu claro e foi refeito trocando o papel claro por vinho). O fechamento usa o fundo da capa espelhado. Arte rascunho com os fundos no Canva: "Fundo de Natal em aquarela" (design `DAHainzdQbk`).
- **Fotos:** só as reais que a Tayssa mandou. Capa: a selfie do sorriso com a flor ao fundo. Fechamento: a de blusa cinza. A primeira selfie (a do `portrait.jpg`) saiu da capa a pedido do Lucas. Fundo recortado com rembg (`birefnet-portrait`), no lugar do recraft/remove-background da kie. As fotos vieram em 720 px; para o close ficar nítido foram ampliadas 4x com Real-ESRGAN (`RealESRGAN_x4plus`, só nitidez, não redesenha o rosto) e misturadas com 25% da foto original para manter a textura da pele. Lâminas 5 e 8: close dos cílios (`work-01.jpg` e `work-03.jpg`), só olho, sem rosto de cliente.
- **Capa e fechamento no desenho da referência:** rosto em close, título com parte cheia e parte só em contorno fino passando pelo rosto ("AG" cheio e "ENDA" vazado na capa; "AGE" vazado e "NDE" cheio no fechamento), linha pequena embaixo que fica vinho sobre o fundo e branca com contorno sobre ela (máscara `*-mask.png`, tirada do recorte da foto, com borda firme).
- **Texto:** aplicado em código por cima (Anton nos títulos, Inter no texto), copiado do roteiro. Valores, sinal de R$ 50, 4 h de antecedência, 10 min de tolerância, 48 h para remarcar e a regra do VIP (4 em 70 dias, 15 a 20 entre um e outro) conferidos com o banco e com `lib/tayssa/config.ts` em 10/11/2026.
- Ícone do WhatsApp: a logo oficial (o mesmo desenho de `components/tayssa/ui/whatsapp.tsx`).

## Antes de postar

- Os valores são os de 10/11/2026. Se a Tayssa mudar preço ou regra, editar `gerador/build.mjs` e gerar de novo.
- A lâmina 6 diz que dezembro abre primeiro para as VIPs: hoje `settings.booking.prioridade_vip` está ligada a partir de 01/12 e sem data para abrir a todas. Se ela marcar a data antes do post, a lâmina continua certa ("abre em breve").
