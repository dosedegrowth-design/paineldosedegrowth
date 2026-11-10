# Carrossel · Agenda de Dezembro (Tayssa Farias)

6 lâminas em 1080 x 1350 para o Instagram (@1.tayssa), feitas em 10/11/2026 a pedido da Tayssa.

- `laminas/`: as 6 lâminas na ordem do post (`tayssa-dezembro-01.jpg` a `06`).
- `legenda.txt`: a legenda do post.
- `fundos/`: o fundo de cada lâmina, sem texto.
- `visao-geral.jpg`: as 6 lado a lado.
- `gerador/`: o que monta as lâminas. Para refazer: `cd gerador && NODE_PATH=$(npm root -g) node build.mjs && python3 reduz.py .` (ou `node build.mjs 3` para uma só). Renderiza em 2x e reduz para 1080 x 1350. Sai em `gerador/out/`.

## Conteúdo (conferido)

1. **Abertura ("Vocês estão a isso aqui"):** mão feminina realista (unhas bordô, anel dourado, manga de veludo bordô com punho de pelúcia) no gesto de pertinho, com "Descobrir a data da agenda de Dezembro" ao lado. O Lucas pediu a mão do Grinch, de um post de referência; ficou a mão de pessoa porque o Grinch é personagem registrado (risco de denúncia e de o post cair). Fundo e mão gerados pela IA do Canva (página 13 da arte rascunho).
2. **Capa:** AGENDA DE DEZEMBRO + "As datas de abertura estão chegando. Prepare-se para garantir seu horário!". O rosto da Tayssa nunca fica coberto.
3. **Abertura da agenda:** 12 de novembro (quinta-feira), exclusiva para clientes fixas e VIP; 14 de novembro (sábado), para as demais clientes.
4. **Horários:** segunda a sábado, das 07h (início) às 21h (último horário); domingos, das 07h às 17h. Taxa de horário especial: acréscimo de R$ 30,00 só no primeiro e no último horário de cada dia. Exceção, 24/12: primeiro horário 06h, último 15h, acréscimo de R$ 30,00 em qualquer horário.
5. **Avisos importantes (a carta):**
   - Tolerância de 10 minutos.
   - Não é permitida a entrada de acompanhantes nem de crianças (regra confirmada pelo Lucas).
   - Sinal de R$ 50,00 via Pix, descontado do valor final.
   - Cancelamentos e faltas seguem a regra do site: 48 h ou mais, o sinal vale para a nova data; com menos de 48 h, cancelamento ou falta, o sinal não é devolvido.
   - Bilhete: "Tivemos ajuste de valores."
6. **Calendário de dezembro de 2026:** começa numa terça e a semana começa no domingo. 24/12 em dourado (atendimento especial, 06h às 15h, taxa de R$ 30,00 em qualquer horário). 25, 30 e 31/12 em bordô (sem atendimento). Os demais dias seguem a programação especial.

## Visual

Mistura das duas referências de que a Tayssa gostou:
- **Referência 1:** a palavra grande e a árvore em aquarela.
- **Referência 2 (@studio_schneiider, "Agenda de Dezembro"):** a colagem de papéis rasgados, fita, clipes, selos, laço, estrelas e corações desenhados à mão, a foto com borda de adesivo, a carta e o calendário.

Base marfim e champagne, bordô nos títulos e detalhes, dourado nos fios e clipes. As flores são como as do mural do estúdio: lírios bordô vivo com folhas verde-esmeralda.

- **Fundos:** gerados pela IA do Canva (arte rascunho "Fundo de Natal em aquarela", design `DAHainzdQbk`, páginas 9 a 11).
- **Papéis, fita, clipe, lacre, envelope e calendário:** desenhados em código, para as datas e os textos saírem certos.
- **Fontes:** Bodoni Moda com ajuste óptico de texto (`opsz` 11, para os traços finos não sumirem no celular) e Inter.
- **Foto:** a selfie do sorriso, da foto original (só ampliada 2x, sem IA), maior e mais para cima, com o alto do cabelo passando atrás da faixa "DE DEZEMBRO" (pedido do Lucas).

## Pendências no site

O site ainda não está configurado com estas regras de dezembro:
- horários das 07h às 21h e aos domingos;
- folga nos dias 25, 30 e 31;
- taxa de R$ 30,00;
- abertura para as demais clientes em 14/11 (`settings.booking.prioridade_vip.abre_em`);
- "clientes fixas", que não existe como grupo no sistema (hoje só há VIP).
