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
| Vídeos do Instagram tocando no site com "Ver no Instagram" | estrutura pronta, faltam os vídeos |
| Branco que conversa com o vinho (luz rosé/ouro, sombra vinho) | feito |
| Agendar → folha de agendamento: serviço (volume/técnica ou manutenção), dia, horário livre, nome → WhatsApp com a mensagem pronta pedindo o Pix do sinal (R$ 50, editável em Configurações → Agenda) | feito |
| Cada seção com fundo de cor diferente da paleta, a seguinte sobe como folha de cantos redondos | feito |
| Fluidez nível iWin (sem travar, rápido) | muito melhor, ainda abaixo da iWin na rolagem pesada (ver números em CLAUDE.md) |
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
| Mídia: galeria no original (lote, baixar), publicar com categoria, produto e enquadramento | feito (falta migration no Supabase) |

## Endereço e infraestrutura

- Por enquanto em `painel.dosedegrowth.com/tayssa`.
- Supabase parado por ora (migration `20261017000000_vip_media_catalog.sql` pendente).
- Prévia pública: link de compartilhamento da branch (sem prazo).

## Materiais pendentes (cliente)

Ver `MATERIAIS.md`: fotos e vídeos originais, vídeos do Instagram com links,
serviços reais (duração, preço se quiser), biografia, atendimento.
