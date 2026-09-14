@AGENTS.md

# VIVA Extintores — site

> Leia este arquivo inteiro antes de mexer no projeto.

## O que é

O **site** da VIVA Extintores. Não é um portfólio avulso: é um site
institucional completo, e o portfólio é a parte dele com mais conteúdo —
a que prova execução com fotografia de obra real.

Seis páginas de site (Início, Sobre nós, Serviços, Portfólio, Clientes,
Contato) e, dentro de Portfólio, a página-mãe mais **cinco** páginas
completas, uma por área de atuação.

Se alguém disser "é só um portfólio", está errado. É um site.

## Posicionamento

A VIVA **não** é "a empresa que vende e recarrega extintor". É engenharia
especializada em segurança contra incêndio, que atua do diagnóstico e do
projeto até a execução, a regularização e a manutenção.

O visitante precisa pensar: *"essa empresa consegue pegar o meu problema
de segurança contra incêndio e resolver."*

## As cinco áreas — a lista é fechada

| # | Área | Rota |
|---|---|---|
| 01 | Sistemas de Combate a Incêndio | `/portfolio/combate-a-incendio` |
| 02 | Alarme e Detecção de Incêndio | `/portfolio/alarme-e-deteccao` |
| 03 | SPDA / Para-raios | `/portfolio/spda-para-raios` |
| 04 | Laudos, CLCB e AVCB | `/portfolio/laudos-clcb-avcb` |
| 05 | Relatório Tecno-Fotográfico + Manutenção | `/portfolio/relatorio-tecno-fotografico` |

- São **cinco**. Não vira seis.
- **Treinamento de Brigada não entra aqui** — vive em `/servicos`.
- **Relatório Tecno-Fotográfico e Manutenção são UMA página**, não duas.
- **Não criar página genérica de "Projetos e Laudos"** por fora da 04.
- O nome da 04 é *Laudos, CLCB e AVCB*.

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

Sem banco, sem API, sem autenticação: onze páginas pré-renderizadas. Se
aparecer vontade de adicionar backend, pare e pergunte.

## Direção visual

O layout aprovado é **claro**: hero escuro com foto, barra de áreas em
ladrilhos escuros com ícone (a ativa em vermelho), miolo em papel claro,
faixas escuras de CTA e rodapé. O vermelho aparece com parcimônia, para
marcar ação.

Evitar: cara de site genérico, excesso de ícone, card de estatística
solto, excesso de texto, ilustração artificial, banco de imagem óbvio,
visual de catálogo, elemento "promocional".

## Regras que NÃO podem quebrar

Vieram do cliente. Não são preferência de estilo.

- **Nunca inventar.** Foto, obra, cliente, número, depoimento: se não veio
  da VIVA, não entra. Onde falta, o site mostra "a preencher" — é assim de
  propósito.
- **Só entram os números confirmados** (`lib/numeros.ts`): +15 anos,
  +10.000 laudos entregues, +30 obras entregues em 2026, +20 itens no
  Relatório. Os números dos mockups da agência são números de layout, não
  fatos. Estão pendentes de validação final da VIVA.
- **Foto real > ícone > ilustração.** Jamais substituir a fotografia de
  obra por desenho para "deixar clean". Já foi rejeitado uma vez.
- **A foto do profissional em inspeção (de costas, com prancheta) é o
  coração da página 05.** Não trocar.
- Na área 02, vale a versão que **substituiu a foto do fio pela obra de
  detecção**.
- Na área 04, a foto da Cury é a **versão com a fachada ampliada**.
- **Sem CREA** em ilustração, selo ou texto, em lugar nenhum do site.
- Mantém "engenheiro especialista" / "bombeiro especialista em obras".
- **Sem parede de logos de clientes.** Se um cliente aparecer naturalmente
  numa foto de obra, tudo bem; seção de logos, não.
- **O módulo de casos reais não é daqui.** Cada página de área fecha com
  "VEJA ALGUNS DOS NOSSOS CASOS REAIS" + seta, e para. A galeria é da
  agência e já existe.
- **Mobile reorganiza, não remove.** Os cinco blocos empilham 01→05 com
  foto, texto e hierarquia.
- **Sem JavaScript, a página aparece inteira.** O `<Reveal>` só esconde
  depois de montar (`data-js`). Nunca mandar `opacity: 0` no HTML do
  servidor.
- **Todo texto mora em `lib/`.** Não enfiar conteúdo dentro de componente.

## Armadilhas já pagas

- `next.config.ts` fixa `turbopack.root` nesta pasta. Sem isso o build
  sobe um nível e usa o `postcss.config` e o `middleware` do painel.
- Custom property definida em `style={{"--cols": …}}` **vence** a media
  query. Nas grades responsivas, sobrescreva `grid-template-columns`
  direto, não o `--cols`.
- Na faixa escura de CTA, o botão precisa de `grid-column: 1 / -1` no
  mobile: senão ele engorda a coluna `auto` e o título fica abaixo do
  próprio min-content, vazando na horizontal.

## Dev

```bash
npm run dev
npm run typecheck   # manter sempre 0
npm run lint        # manter sempre 0
npm run build
```

## Git

Mesmo repositório do painel. Commit tocando só em `viva-extintores/`.
