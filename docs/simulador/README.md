# Simulador de benefício — `/simulador`

Protótipo interno de landing page mobile-first: simulação fictícia de aumento
de benefício previdenciário que termina no WhatsApp. **Roda 100% no
navegador**: sem backend, banco, API, n8n ou qualquer consulta a sistema
(INSS, Gov.br, Dataprev). O CPF só é validado localmente (formato + dígitos
verificadores) e nunca sai da página — a mensagem do WhatsApp leva só nome e
valor.

Identidade própria ("Revisa", plataforma independente) com **linguagem visual
institucional brasileira**: branco predominante, verde nas ações, azul na
informação e navegação, amarelo só em atenção. Sem brasão, sem marca, fonte ou
qualquer elemento do gov.br/INSS — e o cabeçalho e o rodapé dizem
explicitamente que não há vínculo com órgão público. O resultado é sorteado
dentro de uma faixa e vem sempre com o aviso: *"Resultado estimativo para
fins de simulação. Não representa aprovação ou concessão de benefício."*

## Linguagem visual

| | |
|---|---|
| Base | Branco; seções informativas em cinza claro (`--sim-soft`) |
| Verde `#1b7a3f` | Ações principais, barra lateral dos painéis, etapa atual, faixa |
| Azul `#0f4c8f` | Informação (avisos "Orientações"), navegação, botões secundários, foco |
| Amarelo `#f2c400` | Só na faixa tricolor do cabeçalho e no aviso "Atenção" do resultado |
| Tipografia | Public Sans (variável, `@fontsource-variable/public-sans`); títulos 700, corpo 400 |
| Componentes | Painel com borda 1px e cabeçalho com barra verde; campos de 52px com rótulo, dica e erro; botões sólidos (verde) e contornados (azul); avisos em grade ícone + título + texto; indicador de etapas; barra de progresso linear |
| Movimento | Só um fade curto entre etapas e a barra de progresso; `prefers-reduced-motion` desliga tudo |

Estrutura fixa em todas as etapas: cabeçalho (logo + "Plataforma independente
de simulação de benefício" + menu Início / Como funciona / Ajuda) → faixa
verde-amarelo-azul → indicador de etapas → área do serviço (formulário,
análise ou resultado) → "Como funciona" (3 cards) → "Ajuda e orientações"
(declarações + contato) → rodapé com as mesmas declarações.

## Fluxo e estados

LANDING → FORMULÁRIO → VALIDAÇÃO → PROCESSAMENTO → SIMULAÇÃO → RESULTADO → CTA → WHATSAPP

Os sete estados ficam expostos em `data-state` no elemento `.sim-app`
(útil pra QA e pra estilizar):

| # | `data-state` | Quando |
|---|---|---|
| 1 | `idle` | landing, nada válido ainda |
| 2 | `filled` | nome e CPF válidos |
| 3 | `error` | envio falhou na validação (erros nos campos) |
| 4 | `processing` | tela de "Analisando seus dados..." (3–5 s) |
| 5 | `result` | resultado com a estimativa |
| 6 | `redirecting` | botão "Abrindo WhatsApp..." (1,6 s após o toque) |
| 7 | `restart` | transição de "Fazer nova simulação" de volta à landing |

Nenhuma etapa recarrega a página; cada troca tem transição própria
(`.sim-anim` entra/sai; os fundos ficam fixos pra não piscar).

## Onde fica o quê

| Camada | Arquivo |
|---|---|
| **Configuração** (marca, `WHATSAPP_NUMBER`, mensagem, faixa da estimativa, duração/etapas do processamento, todos os textos, SEO) | `lib/simulador/config.ts` |
| Lógica pura (testada) | `lib/simulador/cpf.ts` (máscara + validação), `name.ts`, `estimate.ts`, `whatsapp.ts` |
| Rota, metadados, fontes, CSS | `app/simulador/{layout,page}.tsx`, `app/simulador/simulador.css` (classes `sim-*`) |
| Máquina de estados + telas | `components/simulador/simulador-app.tsx` → `landing-screen`, `processing-screen`, `result-screen` |
| Peças | `brand-header` (menu + faixa), `stepper`, `lead-form`, `text-field`, `progress-bar`, `how-it-works`, `help-section`, `site-footer`, `screen-shell`, `icons` (inclui o emblema `BrandMark`) |
| Ícones do site | `public/simulador/icon.svg`, `icon-32.png`, `apple-icon.png` |
| Rota pública no middleware | `middleware.ts` (`publicPaths` → `/simulador`) |

## Como alterar

Tudo que muda de cliente pra cliente está em `lib/simulador/config.ts`:

- `BRAND.name` / `descriptor` (identificação ao lado do logo — manter a ideia de "plataforma independente") / `themeColor` / `indexable` (hoje `false`: protótipo com `noindex`)
- `MENU` (itens do cabeçalho e do rodapé, âncoras da própria página) e `STEPS` (rótulos do indicador de etapas)
- `WHATSAPP_NUMBER` — só dígitos, DDI+DDD+número (`5511999999999`)
- `WHATSAPP_MESSAGE` — placeholders `{nome}` e `{valor}`
- `ESTIMATE.minBRL` / `maxBRL` — faixa do sorteio (hoje R$ 870 – R$ 1.400)
- `PROCESSING.durationMs` / `settleMs` / `steps` — tempo e etapas da tela de análise
- `COPY.*` — todos os textos da interface

Cores e tipografia: variáveis `--sim-*` no topo de `app/simulador/simulador.css`
(Public Sans via `@fontsource-variable/public-sans`). Para trocar o emblema
pelo logo do cliente: `BrandMark` em `components/simulador/icons.tsx` +
`public/simulador/icon.svg` (e os PNGs) + `icons.brand` no standalone.

## Testes

```bash
# lógica pura (CPF, nome, estimativa, link do WhatsApp)
node --experimental-strip-types --test lib/simulador/simulador.test.ts

# interface em Chromium real (precisa de `playwright` local ou global)
npm run dev -- -p 3011
BASE=http://localhost:3011/simulador node scripts/simulador-qa.cjs
# capturas em .qa/simulador/
```

O QA de interface cobre: larguras 320/360/375/390/412/430/768/1280 sem
overflow horizontal, formulário no primeiro quadro, menu do cabeçalho,
indicador de etapas, envio vazio → erros nos
campos (sem `alert()`), máscara e backspace do CPF, CPF inválido, estado
`filled`, processamento com progresso e etapas, resultado dentro da faixa,
URL do `wa.me` (nome formatado, valor, sem CPF, `noopener`), estado
`redirecting`, explicação expansível, nova simulação com formulário limpo,
ordem de tabulação, `prefers-reduced-motion` e a coluna centralizada no
desktop.

## Versão standalone (arquivo único)

`standalone/simulador/index.html` é a mesma experiência em HTML + CSS + JS
puro, num arquivo só, sem Next e sem nada do painel. É o que se usa quando
se quer um link de teste fora do domínio da DDG: serve em qualquer
hospedagem estática, ou publicado como página na claude.ai (aí sem as
tags `<html>/<head>/<body>`, que o host coloca). A fonte (Public Sans) vem do
Google Fonts, com fallback de sistema.

- Configuração: bloco `CONFIGURAÇÃO` no topo do `<script>` (mesmos nomes de
  `lib/simulador/config.ts`).
- CSS: espelho de `app/simulador/simulador.css` mais um reset mínimo. Ao
  mudar um, mude o outro.
- Ids, classes e `data-state` são idênticos aos da rota, então o mesmo QA
  roda nele: sirva a pasta (`python3 -m http.server 8090 --directory
  standalone/simulador`) e rode `BASE=http://localhost:8090/ node
  scripts/simulador-qa.cjs`.

## Regras que não podem quebrar

- Nunca afirmar consulta oficial, aprovação ou concessão. O aviso fica logo
  abaixo do valor.
- O CPF não vai pra URL do WhatsApp, pra storage nem pra lugar nenhum.
- Nada que afirme ou insinue vínculo com órgão público: sem brasão, marca,
  fonte ou padrões do gov.br/INSS; o descritor "plataforma independente" no
  cabeçalho e as declarações do rodapé e da seção Ajuda ficam sempre visíveis.
- Mobile primeiro: inputs com 17px (sem zoom no iOS), alvos ≥ 48px, sem
  overflow horizontal de 320 a 430px.
