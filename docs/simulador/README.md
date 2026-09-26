# Simulador de benefício — `/simulador`

Protótipo interno de landing page mobile-first: simulação fictícia de aumento
de benefício previdenciário que termina no WhatsApp. **Roda 100% no
navegador**: sem backend, banco, API, n8n ou qualquer consulta a sistema
(INSS, Gov.br, Dataprev). O CPF só é validado localmente (formato + dígitos
verificadores) e nunca sai da página — a mensagem do WhatsApp leva só nome e
valor.

Marca fictícia ("Revisa"), sem brasão, logotipo ou cores de governo. O
resultado é sorteado dentro de uma faixa e vem sempre com o aviso:
*"Resultado estimativo para fins de simulação. Não representa aprovação ou
concessão de benefício."*

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
| Peças | `lead-form`, `text-field`, `progress-ring`, `brand-header`, `site-footer`, `how-it-works`, `screen-shell`, `icons` |
| Ícones do site | `public/simulador/icon.svg`, `icon-32.png`, `apple-icon.png` |
| Rota pública no middleware | `middleware.ts` (`publicPaths` → `/simulador`) |

## Como alterar

Tudo que muda de cliente pra cliente está em `lib/simulador/config.ts`:

- `BRAND.name` / `tagline` / `themeColor` / `indexable` (hoje `false`: protótipo com `noindex`)
- `WHATSAPP_NUMBER` — só dígitos, DDI+DDD+número (`5511999999999`)
- `WHATSAPP_MESSAGE` — placeholders `{nome}` e `{valor}`
- `ESTIMATE.minBRL` / `maxBRL` — faixa do sorteio (hoje R$ 870 – R$ 1.400)
- `PROCESSING.durationMs` / `settleMs` / `steps` — tempo e etapas da tela de análise
- `COPY.*` — todos os textos da interface

Cores e tipografia: variáveis `--sim-*` no topo de `app/simulador/simulador.css`
(Inter + Inter Tight, já instaladas via `@fontsource`).

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
overflow horizontal, CTA na dobra em telas baixas, envio vazio → erros nos
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
tags `<html>/<head>/<body>`, que o host coloca). As fontes (Inter + Inter
Tight) vêm do Google Fonts, com fallback de sistema.

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
- Nada de identidade visual de governo (brasão, verde-amarelo institucional,
  "gov.br", "Meu INSS").
- Mobile primeiro: inputs com 17px (sem zoom no iOS), alvos ≥ 48px, sem
  overflow horizontal de 320 a 430px.
