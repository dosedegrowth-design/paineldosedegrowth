# Fotos reais da VIVA

As fotos reais são o maior ativo do projeto. Enquanto o arquivo não
estiver aqui, o site desenha um campo tonal com a descrição do que aquela
foto precisa ser — **nunca** stock, ilustração ou imagem sintética.

**As fotos já aprovadas são as que entram.** Nenhum gerador substitui uma
foto de obra real por banco de imagem.

## Como colocar

1. A VIVA entrega cinco lotes, um por área. Cada lote vira uma pasta aqui.
2. Salve cada arquivo com **exatamente** o nome que `lib/photos.ts` espera
   (`.jpg`, minúsculas).
3. Pronto. Nenhum componente muda.

Proporções: `hero` em 16:9 (mínimo 2000px de largura), `card` e `destaque`
em 4:3, numeradas (`01`…`05`) em 1:1.

## As pastas

### `00-site/` — institucional
`hero.jpg` · `portfolio-hero.jpg` · `equipe.jpg` · `sobre.jpg` ·
`servicos-hero.jpg` · `contato-hero.jpg`

O `hero.jpg` é a abertura do site: fotografia real e impactante de
combate/proteção contra incêndio, atmosfera escura.

### `01-combate/` — Sistemas de combate a incêndio
`hero.jpg` · `card.jpg` · `destaque.jpg` · `01.jpg` … `04.jpg`

Bombas, casa de bombas, rede de hidrantes, SPK, painéis de comando,
ligações trifásicas, tubulações, instalações concluídas.

> **Não entra:** a obra industrial de recalque/teste de pressão que não
> representa a VIVA.

### `02-alarme/` — Alarme e detecção
`hero.jpg` · `card.jpg` · `destaque.jpg` · `01.jpg` … `04.jpg`

Centrais (inclusive a Ascael), detectores, sirene audiovisual, botoeira,
infraestrutura, cabeamento, instalação real.

> A versão aprovada é a que **substituiu a foto do fio pela obra de
> detecção**. Não voltar a usar o cabo como imagem principal.

### `03-spda/` — SPDA / para-raios
`hero.jpg` · `card.jpg` · `destaque.jpg` · `01.jpg` … `05.jpg`

Mastro e captor, cobertura, malha, cabos, descidas, sinalização,
terrômetro, medições, execução.

### `04-laudos/` — Laudos, CLCB e AVCB
`hero.jpg` · `card.jpg` · `clcb.jpg` · `avcb.jpg` · `01.jpg` … `04.jpg`

O profissional **de frente**, com o documento, em frente ao Ed. Araken de
Moraes. Cury (**versão com a fachada ampliada**), Metrô Tamanduateí,
Padaria Marabá, Banana's Outlet, Studio Rock Rock.

> As legendas com nome de cliente estão em `lib/photos.ts` e precisam de
> confirmação da VIVA antes de publicar.

### `05-relatorio/` — Relatório Tecno-Fotográfico + manutenção
`hero.jpg` · `card.jpg` · `conforme.jpg` · `falha.jpg` · `solucao.jpg` ·
`01.jpg` … `05.jpg`

Técnico em inspeção, prancheta, equipamentos, extintores, mangueiras,
iluminação, situações corretas, situações com falha, manutenção.

> O `hero.jpg` é a foto do profissional **de costas, com prancheta,
> fazendo inspeção**. É a imagem central do conceito — não substituir por
> ícone nem ilustração.

### `instagram/`
Prints de post, com os nomes definidos em `lib/instagram.ts`.
