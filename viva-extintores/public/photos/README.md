# Imagens do site

Duas procedências, e a diferença importa:

## Foto real da VIVA

Veio do acervo do site atual (`dosedegrowth-design/vivaextintores`).
Está em `00-site/`, `01-combate/`, `04-laudos/` e em parte da
`05-relatorio/`.

A legenda descreve **o que a foto mostra de fato**. Não atribuir a foto de
um cliente ao nome de outro: as entregas de laudo estão legendadas por
tipo de cliente (comércio, padaria, transportadora, estúdio), que é como o
acervo da VIVA as identifica.

## Imagem ilustrativa

Gerada para a apresentação, porque a VIVA ainda não mandou foto dessas
áreas. Está em `02-alarme/`, `03-spda/` e em parte da `05-relatorio/`.

No site elas aparecem com a etiqueta **"Imagem ilustrativa"** no canto —
ninguém pode confundir com obra executada pela VIVA. **São as primeiras a
trocar quando as fotos reais chegarem.** Ao trocar, remova o
`ilustrativa: true` do slot em `lib/photos.ts` e a etiqueta some sozinha.

Prioridade de troca:
1. `05-relatorio/hero.jpg` — o profissional de costas com prancheta é a
   imagem central do conceito.
2. `02-alarme/*` — centrais, detectores, sirenes, acionadores em obra.
3. `03-spda/*` — captores, mastros, malha, descidas, terrômetro.
4. `05-relatorio/conforme|falha|solucao` — o antes/depois da inspeção.

## Como trocar

1. Salve o arquivo com **exatamente** o nome que `lib/photos.ts` espera
   (`.jpg`, minúsculas), na pasta da área.
2. Tire o `ilustrativa: true` do slot, se houver.
3. Pronto. Nenhum componente muda.

Proporções: `hero` 16:9 (1920×1080), `card`/`destaque`/estados 4:3
(1400×1050), numeradas 1:1 (1100×1100).

## As pastas

| Pasta | O que é |
|---|---|
| `00-site/` | institucional: abertura, portfólio, equipe, sede, serviços, contato |
| `01-combate/` | bombas, barrilete, hidrantes, SPK — **fotos reais** |
| `02-alarme/` | centrais, detectores, sirenes, acionadores — **ilustrativas** |
| `03-spda/` | captores, descidas, cobertura, terrômetro — **ilustrativas** |
| `04-laudos/` | entregas de documentação — **fotos reais** |
| `05-relatorio/` | inspeção e manutenção — hero e estados ilustrativos, galeria real |
| `instagram/` | prints de post, se algum dia forem usados no lugar do embed |

## Acervo disponível e ainda não usado

O repositório do site atual da VIVA tem mais material que pode entrar:
fotos de **treinamento de brigada** (combate ao fogo, mangueira, resgate,
simulação, turma) — que servem para `/servicos` — e **logos de clientes**.
Os logos ficaram de fora de propósito: a VIVA pediu para não montar parede
de marcas nesta versão.
