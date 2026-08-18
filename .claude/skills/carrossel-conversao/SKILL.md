---
name: carrossel-conversao
description: "Cria carrosséis e criativos de conversão para Instagram/Meta Ads dos clientes da DDG, com foco em conversa no WhatsApp. Metodologia interna destilada do CarrosseIA (MCP externo) para gerar roteiros e artes SEM depender de créditos externos. Actions: criar carrossel, criativo de conversão, roteiro de carrossel, anúncio, renovar criativo, combater fadiga de criativo. Nichos: médicos, fisioterapia, quiropraxia, estética, odonto, nutrição, advocacia, imobiliária, marketing, pets, academia, beleza. Ativa quando o pedido envolve carrossel, criativo, anúncio, copy de anúncio, roteiro de post, arte de conversão ou 'gerar carrossel do cliente X'."
argument-hint: "[cliente] [nicho] [angulo]"
license: MIT
metadata:
  author: Dose de Growth
  version: "1.0.0"
  origem: "Destilado do MCP CarrosseIA (carrosseia.com.br) em 18/ago/2026"
---

# Carrossel de Conversão — Metodologia DDG (interna, sem crédito externo)

Gera roteiros e artes de **carrossel de conversão** para Instagram/Meta Ads dos clientes
da Dose de Growth, com foco em **gerar conversa no WhatsApp**. Esta skill é a expertise do
**CarrosseIA** destilada e internalizada: **não precisa mais chamar o MCP externo nem gastar
crédito** para produzir. Use o MCP `carrosseia` só quando o cliente quiser o download final
pela plataforma deles; o roteiro e o design a gente faz aqui.

> **Por que esta skill existe:** o CarrosseIA cobra créditos (1 por carrossel, +10 por capa IA,
> e download exige plano pago). A metodologia dele é replicável em HTML/CSS ("a arte é desenhada
> no navegador"). Guardamos aqui a receita para produzir à vontade, de graça, e com controle total.

## Quando ativar

- Pedido de carrossel, criativo, anúncio, "renovar criativo", "combater fadiga de criativo".
- Roteiro/copy de post de conversão para cliente DDG.
- "Gera o carrossel do [cliente]", "cria 3 criativos pra WhatsApp".

## O que é o CarrosseIA (o que estamos replicando)

MCP que transforma **roteiro em texto → carrossel pronto** (link editável no navegador).

- **Ferramentas:** `listar_templates` (grátis), `meus_creditos` (grátis), `criar_carrossel` (1 crédito).
- **Capa:** `ia` (gera imagem por IA, +10 créditos, cobrado ao abrir o link), `propria`
  (cliente sobe a foto no app, grátis) ou `nenhuma` (só tipografia).
- **Limitação real:** fotos NÃO passam pelo chat/tool. Quem sobe as fotos é o cliente, card a card,
  no editor. A ferramenta recebe só texto. A gente OLHA as fotos (ex.: no Drive) para escrever o
  roteiro e recomendar qual foto vai em cada card.
- **Renderização:** HTML/CSS no navegador, por template de nicho. Por isso replicamos em HTML.
- **Templates (19):** post-social, insider, advocacia, noticias-virais, marketing, ia, imobiliaria,
  nutricionista, medicos, educacao, clinica-estetica, contabilidade, academia, turismo, beleza,
  categoria, dentistas, joias, pets.

## As 8 regras de ouro (copiar sempre)

1. **2 a 10 slides.** O **primeiro é a capa (gancho)**, o **último é a chamada pra ação (CTA)**.
   Carrossel de conversão pedido pela DDG costuma ser **3 páginas**: capa → conteúdo → CTA.
2. **Uma ideia por slide.** Frase direta, sem enrolação, sem jargão.
3. **Título curto e forte:** no máximo **~12 palavras**. Texto de apoio é opcional e complementa.
4. **NUNCA use travessão** (—, o traço longo). Use vírgula, ponto ou dois-pontos. (O servidor troca,
   mas escreva já certo.)
5. **Gancho na dor, não no serviço.** A capa fala do problema que a pessoa sente, não do procedimento.
6. **CTA sempre pra ação, sem número.** O objetivo da conta é conversa no WhatsApp, mas o card é
   **anúncio linkado a um botão**: NÃO coloque telefone nem descrição longa no card. Use botão curto
   com verbo no imperativo: "Chame no WhatsApp" (com logo do WhatsApp) ou "Agende sua avaliação".
7. **Prova/autoridade no card do meio:** causa do problema + por que o tratamento certo resolve.
8. **Etiqueta (pílula):** opcional, no canto do card. Use para nicho/assinatura ("Quiropraxia",
   "Dr. Fulano"). Vazio = sem pílula.

## Fórmula do roteiro de 3 páginas (conversão WhatsApp)

| Slide | Papel | Fórmula |
|---|---|---|
| 1 · Capa | Gancho na dor | "[Sintoma/dor] + quebra de expectativa." Ex.: "Sua enxaqueca pode não estar na cabeça." |
| 2 · Conteúdo | Causa + autoridade | "[Causa real do problema]. [Tratamento certo] resolve a origem, não o sintoma." |
| 3 · CTA | Ação no WhatsApp | "[Frase de virada]. Agende sua avaliação pelo WhatsApp." |

Ângulos que convertem (troque o ângulo para **combater fadiga de criativo** — nunca repita o mesmo
gancho de sempre): dor específica (lombar, cervical, ciático), sintoma "silencioso" (formigamento,
insônia, enxaqueca), erro do dia a dia (postura, celular, sedentarismo), medo (cirurgia, piora),
prova social (nº de pacientes, tempo de experiência).

## Fluxo de trabalho (produzir sem MCP)

1. **Contexto do cliente:** especialidade, dores tratadas, tom, @ do Instagram, WhatsApp, cidade.
   (Site, contrato, relatórios no Drive.) Puxe o que já existe antes de perguntar.
2. **Fotos:** liste a pasta do Drive do cliente. Escolha e recomende qual foto vai em cada card
   (capa = retrato confiante/atendendo; meio = mão na massa/atendimento; CTA = sorriso/braços cruzados).
3. **Roteiro:** 3 slides pela fórmula acima. 2–3 ângulos diferentes por rodada.
4. **Arte:** renderize em HTML com `references/template-carrossel.html` (tokens editáveis: cor,
   foto, @). Entregue como artifact ou screenshot. 4:5 (feed) por padrão; 1:1 se pedirem.
5. **Confirme antes de "publicar":** @ do Instagram na arte? Capa foto própria ou IA?
   (Só precisa do MCP se o cliente for baixar pela plataforma dele.)

## Regras de design da arte (ver `references/design-conversao.md`)

- **4:5 (1080×1350)** para feed; 1:1 (1080×1080) se pedirem. Área de segurança de 96px nas bordas.
- Foto do cliente ocupando 55–70% do card, com **gradiente escuro** de baixo pra cima para o texto
  respirar. Título em caixa alta ou bold, alto contraste. @ discreto no rodapé.
- Cor de acento por cliente (whitelabel `--brand-color`). DDG default: laranja `#F15839`.
- Sem travessão. Frase de CTA sempre com o ícone/again do WhatsApp e verbo imperativo.

## Não faça

- Não peça pra pessoa mandar foto "aqui no chat" achando que vai pro carrossel: não vai.
- Não invente número de prova social (pacientes/anos) sem fonte real do cliente.
- Não gaste crédito do MCP para ver o resultado: renderize aqui em HTML primeiro.
- Não use o mesmo gancho dos criativos antigos (fadiga). Sempre traga ângulo novo.

## Playbooks de cliente

- Dr. Samuel Chagas (fisio/quiropraxia): ver `references/cliente-dr-samuel.md`.
