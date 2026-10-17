# Tayssa Lash — briefing consolidado (17/out/2026)

Tudo que foi pedido desde o PROMPT MESTRE, em um lugar só, com o estado de
cada item. Atualizar a cada rodada. Ordem: o que o cliente sente primeiro.

## Princípios que valem para tudo

- **Fluidez primeiro.** Nível do site da iWin (https://iwin-site.vercel.app):
  rápido, sem travar, rolagem nativa, animação só em transform/opacity.
  No celular a mesma intenção visual, nunca uma versão quebrada.
- **Celular encaixado.** Nada de zoom sozinho, nada de proporção "se
  arrumando" ao carregar, nada de rolagem lateral, margem dos dois lados.
- **Identidade.** Branco e vinho/bordô protagonistas, ameixa e rosa fechado
  de apoio, verde mínimo (folhas), dourado só no detalhe. Flores integradas.
  Linguagem de movimento e acabamento da iWin (Apple): vidro, cápsulas,
  fundo vivo, tudo flutuando de leve, letra com volume.
- **Seções com fundos diferentes.** Cada tópico com um fundo próprio dentro
  da paleta (vinho, marfim, ameixa, rosé, bordô…), para marcar a mudança.
- **Tipografia limpa.** Uma família (sistema Apple/Inter), escala clara,
  respiro; nunca linhas encostando ou sobrepostas; nada de caixa-alta espaçada.
- **Nada inventado.** Serviços, preços, depoimentos e fotos só reais.
- **Mostrar cada etapa** com vídeo/print verificado. Falar sempre em português.

## Site institucional

| Pedido | Estado |
|---|---|
| Abertura com o nome "Tayssa Lash" animado, uma linha, centralizado, traço de assinatura | feito |
| Fundo vivo (luzes vinho/rosé/ouro, grade, chão em perspectiva, bordas em ameixa) | feito — otimizado (animação só onde o olho está, chão por transform, grão sem mistura) |
| Fotos com pouca luz como fundo nas seções vinho | feito |
| Rolos de foto/vídeo por produto (catálogo), alimentados pelo painel | feito |
| Abertura com foto quadrada (o arco saiu) | feito |
| Portfólio em celulares com a cara do Instagram (Reel para vídeo, publicação para foto), flutuando soltos embaixo do "O trabalho sai do estúdio…", nunca em fileira; tocar abre o trabalho dentro do site e de lá "Ver no Instagram" vai ao post | feito — alimentado pela Mídia do painel; link de cada post em Mídia → No site (sem link, vai ao perfil) |
| Quadro de números animado (números subindo, celular com o Insights, selos flutuando) | feito — só aparece com os números reais que a Tayssa escrever em Configurações → Números do site |
| Valores dos serviços e dos produtos no site e na mensagem do WhatsApp | feito (Configurações → Serviços e Mídia → valor de cada produto) |
| Agenda que nunca some horário: o que está fechado ou ocupado aparece riscado (site e VIP) | feito |
| Branco que conversa com o vinho (luz rosé/ouro, sombra vinho) | feito |
| Agendar → folha de agendamento: serviço (volume/técnica ou manutenção), dia, horário livre, nome → WhatsApp com a mensagem pronta pedindo o Pix do sinal (R$ 50, editável em Configurações → Agenda) | feito |
| Cada seção com fundo de cor diferente da paleta, a seguinte sobe como folha de cantos redondos | feito |
| Fluidez nível iWin (sem travar, rápido) | muito melhor, ainda abaixo da iWin na rolagem pesada (ver números em CLAUDE.md). Computador: o desfoque das luzes do fundo vivo (só no desktop) e filtros esquecidos pela animação de entrada saíram — o dobro de quadros parado |
| Encaixe perfeito no celular (sem zoom em campo, sem pulo de fonte, sem rolagem lateral 320–414) | feito |
| Tipografia menos massiva, sem frases encavaladas | feito |
| "Clube" → "VIP" | feito |

## Área VIP

| Pedido | Estado |
|---|---|
| Mesmas cores e efeitos do site, ouro só no detalhe | feito |
| "Olá, Nome" + cartão de aproximação logo abaixo (vira: carimbos e pontos) | feito |
| Home com ícones para cada parte | feito |
| Gráficos azul, amarelo e vermelho (na paleta) | feito |
| Chamar pelo nome em toda tela | feito |
| Barra flutuante com ícones nível Apple (contorno/cheio, lente de vidro que desliza) | feito |

## Painel da Tayssa

| Pedido | Estado |
|---|---|
| Linguagem do painel operacional da iWin | feito |
| Celular: gaveta + pílula de atalhos flutuando no alto, ícones nível Apple | feito |
| Mídia: galeria no original (lote, baixar), publicar com categoria, produto e enquadramento | feito |
| Agenda no desenho do Google Agenda: semana em colunas, horário livre fecha/abre com um toque, dia inteiro de uma vez | feito (`vip.agenda_bloqueios`) |
| Valor no serviço novo e no produto | feito |
| Aprovação de cadastro limpa: um cartão centrado (recado, contato, interruptor VIP, aprovar/recusar) | feito |
| Números do site editáveis | feito |

## Endereço e infraestrutura

- Por enquanto em `painel.dosedegrowth.com/tayssa`.
- Migrations do Tayssa aplicadas no Supabase até `20261018020000_vip_portfolio.sql` (galeria, agenda, valores, link do post).
- Prévia pública: link de compartilhamento da branch (sem prazo).

## Materiais pendentes (cliente)

Ver `MATERIAIS.md`: fotos e vídeos originais, vídeos do Instagram com links,
serviços reais (duração, preço se quiser), biografia, atendimento.
