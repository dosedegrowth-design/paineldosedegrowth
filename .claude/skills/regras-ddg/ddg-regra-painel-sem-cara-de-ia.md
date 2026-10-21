---
name: ddg-regra-painel-sem-cara-de-ia
description: "REGRA Lucas 15/10 (painel iWin) — o que é \"cara de IA\" em painel e é proibido; filtro de loja único no topo; controles na mesma altura; dica ao passar o mouse"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 0e5b0b71-aea1-4d14-9ff0-d5bfda37089e
  modified: 2026-10-16T02:56:24.523Z
---

Lucas chamou a Visão Geral do painel iWin de "layout merda, cara de IA absurda, fora da proposta" (15/10/2026). Proibido em painel DDG:
- ícone dentro de bolinha/quadrado pastel colorido no título de cada card;
- parágrafo explicando o bloco embaixo do título;
- barras em arco-íris pastel, bolinhas coloridas por todo lado, borda colorida à esquerda;
- caixas "Sem dado ainda" com texto longo; a mesma informação repetida em 3 blocos;
- coluna de informações com um cartão por seção.

**Why:** a proposta é a linha do site iWin (iwin-site/docs/regras-de-layout.md): base Apple, número grande, pouco texto, preto/branco/cinza; cor só onde informa (cor da loja, verde/vermelho de variação, laranja urgente).

**How to apply:**
- Seções com título grande (28 px) sem ícone; tile branco raio 28 sem borda; números em grade com linha fina (ficha técnica Apple); listas agrupadas tipo Ajustes do iPhone; destaque do mês em tile preto com fundo vivo.
- Filtro de loja: UM só, o seletor do topo (`escolherLoja` do cliente-ctx). Nenhuma página tem seletor de loja próprio; clicar numa loja dentro da página troca o topo.
- Controles de barra na mesma altura: seg/btn/btn-icon 36 px; barra com rótulo (Relatórios) 40 px (`.seg.alto`, `.campo`).
- Todo botão de ícone com `title` em português; o componente global `components/shell/dicas.tsx` vira balão preto.
- Ao delegar tela a agente, mandar essa lista de proibições no prompt.

Ver [[iwin-painel-operacional]], [[ddg-linha-visual-layout]].
