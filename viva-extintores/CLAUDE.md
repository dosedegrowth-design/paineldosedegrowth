@AGENTS.md

# VIVA Extintores — Portfólio digital

> Leia este arquivo inteiro antes de mexer no projeto.

## O que é

Portfólio comercial da VIVA Extintores, para síndicos, administradoras,
empresários, gestores prediais, parceiros e indicações. É um **link de
apresentação** — inclusive para parceiros publicarem no site deles.

**Não é página institucional. É ferramenta de venda.**

Lógica da experiência: PROBLEMA → COMPETÊNCIA DA VIVA → PROVA (foto real)
→ CREDIBILIDADE (números) → AÇÃO (WhatsApp).

## Posicionamento

A VIVA **não** é "a empresa que vende e recarrega extintor". É engenharia
especializada em segurança contra incêndio, que atua do diagnóstico e do
projeto até a execução, a regularização e a manutenção.

O visitante precisa pensar: *"essa empresa consegue pegar o meu problema de
segurança contra incêndio e resolver."*

## Endereços

| Recurso | Onde |
|---|---|
| Pasta | `viva-extintores/` dentro do `dosedegrowth-design/paineldosedegrowth` |
| Build/lint/deploy | próprios — o painel exclui esta pasta no `tsconfig.json` e no `eslint.config.mjs` da raiz |
| Vercel | projeto próprio, Root Directory `viva-extintores` |
| Produção | a definir |

## Stack

Next.js 16 (App Router, Turbopack) · TypeScript estrito · **CSS puro**
(sem Tailwind; tokens em `app/viva.css`) · Barlow + Barlow Condensed ·
**sem dependência de runtime além de React/Next** · Vercel.

Não tem banco, não tem API, não tem autenticação. É estático: seis páginas
pré-renderizadas. Se aparecer vontade de adicionar backend, pare e pergunte.

## Estrutura

```
/                              página-mãe: índice das 5 áreas
/combate-a-incendio            01 — bombas, hidrantes, SPK, painéis
/alarme-e-deteccao             02 — centrais, detectores, sirenes
/spda-para-raios               03 — SPDA, aterramento, medição
/laudos-clcb-avcb              04 — regularização, CLCB e AVCB
/relatorio-tecno-fotografico   05 — diagnóstico + manutenção + produtos
```

`components/servico/pagina.tsx` é o esqueleto comum das cinco. O que é só
de uma página entra como `children` (hoje: `documentos.tsx` na 04 e
`relatorio.tsx` na 05).

## Regras que NÃO podem quebrar

Vieram do briefing do cliente. Não são preferência de estilo.

- **As cinco páginas são cinco.** Não resumir, não fundir numa página
  gigante, não deixar todas iguais. A inicial é índice, não resumo.
- **Nunca inventar.** Foto, obra, cliente, número, depoimento: se não veio
  da VIVA, não entra. Onde falta, o site mostra o campo "a preencher" — é
  assim de propósito.
- **Foto real > ícone > ilustração.** Jamais substituir a fotografia de
  obra por desenho para "deixar clean". Já foi rejeitado uma vez.
- **A foto do profissional em inspeção (de costas, com prancheta) é o
  coração da página 05.** Não trocar.
- **Sem CREA** em ilustração, selo ou texto, em lugar nenhum do site.
- Mantém "engenheiro especialista" / "bombeiro especialista em obras".
- **Números não viram quatro quadradinhos.** Entram como prova dentro da
  narrativa, na faixa fina (`components/secoes/numeros.tsx`).
- **"VEJA ALGUNS DOS NOSSOS CASOS REAIS ↓" fecha as cinco páginas.** A
  frase, a seta, e para. Abaixo, poucas janelas — não é catálogo infinito.
- **Mobile reorganiza, não remove.** Os cinco blocos empilham 01→05 com
  foto, texto e hierarquia. Nada de cortar conteúdo para "caber".
- **Sem JavaScript, a página aparece inteira.** O `<Reveal>` só esconde
  depois de montar (`data-js`). Nunca mandar `opacity: 0` no HTML do
  servidor: página de captação com conteúdo preso atrás de JS é lead
  perdido e buscador cego.
- **Todo texto mora em `lib/`.** Não enfiar conteúdo dentro de componente.

## Estética

Empresa forte, engenharia, obra, confiabilidade. Preto azulado + vermelho
VIVA + branco; a fotografia é a cor da página.

Evitar: cara de site genérico, excesso de ícone, card de estatística solto,
excesso de texto, ilustração artificial, banco de imagem óbvio, visual de
catálogo, elemento "promocional".

## Dev

```bash
npm run dev
npm run typecheck   # manter sempre 0
npm run lint        # manter sempre 0
npm run build
```

`next.config.ts` fixa `turbopack.root` nesta pasta — sem isso o build sobe
um nível e usa o `postcss.config` e o `middleware` do painel, e quebra.

## Git

Mesmo repositório do painel. Commit tocando só em `viva-extintores/`
(fora as exclusões na raiz, que já estão feitas).
