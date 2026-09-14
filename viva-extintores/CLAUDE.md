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
Lenis (rolagem suave, carregado sob demanda) · Vercel.

Movimento: sem GSAP. A gramática (linha que sobe de dentro da máscara,
cascata, parallax por scroll, contador) está em `components/ui/motion.tsx`,
em CSS + IntersectionObserver, com a curva `--v-power3`.

Sem banco, sem API, sem autenticação: onze páginas pré-renderizadas. Se
aparecer vontade de adicionar backend, pare e pergunte.

## Direção visual — o sistema

Miolo claro, hero e faixas escuras. Mas o que segura o nível não é a
paleta: é a disciplina.

**Neutros escolhidos, não herdados.** `#0b131b` puxa para o azul do aço,
`#f4f4f1` é papel quente. Nada de preto puro nem cinza de navegador.

**Um acento só.** O vermelho da marca. Verde e vermelho aparecem uma única
vez, na inspeção da página 05, porque ali a cor é informação (conforme /
não conforme). Em nenhum outro lugar se acrescenta cor.

**Cinco degraus de tipo, e só** (`--t-xl` a `--t-label`). Display com
entrelinha curta (0.86–0.9) e **tracking negativo** (−0.012em a −0.028em):
título grande pede letra apertada, senão vira texto ampliado. Rótulo em
caixa alta leva tracking positivo (0.2em).

**O respiro é projeto.** A escala `--s-1` a `--s-6` manda no ritmo; seção
usa `--s-6`. Seção apertada é o que faz site parecer painel administrativo.

**A fotografia passa toda pela mesma receita.** `scripts/grade.mjs` roda
no `prebuild` e gera `public/img/**` a partir de `public/photos/**`: mesmo
contraste, mesma saturação baixa, mesma base fria, três recortes fixos
(3:2, 4:5, 1:1) em dois tamanhos cada. O acervo veio de origens diferentes
— celular em obra, entrega na porta de um comércio amarelo, céu azul — e
lado a lado cada uma puxava para um lado. É correção de cor e
enquadramento, **não** retoque: nada entra nem sai da foto. Nenhum
componente aponta para `/photos` direto; quem serve imagem é o
`<FotoReal>`, que escolhe o recorte (`corte="auto"` troca para retrato no
celular). Recorte automático errando? `ENQUADRAMENTO`, em `grade.mjs`,
manda na mão — já é o caso de `04-laudos` (duas pessoas) e `03-spda`
(céu aberto).

**Composição antes de caixa.** Card só quando o conteúdo é mesmo um
objeto separável. Onde antes havia grade de cards hoje há composição
aberta: `/servicos` é um índice de linhas (`.v-indice`), os pilares do
`/sobre` são colunas com régua no topo (`.v-pilar`), os números são
declaração (`.v-num`), não rótulo em caixinha.

**Cabeçalho de seção é assimétrico** (`.v-cab`): título ancorado à
esquerda, texto de apoio deslocado. Título centralizado com subtítulo
embaixo é o gesto que denuncia template.

**Duas curvas.** `--v-ease` para transição de estado, `--v-power3` para
entrada. Não inventar uma terceira.

Evitar: excesso de ícone, card de estatística solto, excesso de texto,
ilustração artificial, banco de imagem óbvio, visual de catálogo,
elemento "promocional", neon, glassmorphism, sombra pesada, borda em tudo.

## Mobile é o produto

O site é lido de pé, com uma mão. Mobile não é desktop encolhido:

- A **barra de ação** (`components/layout/barra-acao.tsx`) vive na faixa
  do polegar e só aparece depois que a abertura sai da tela — enquanto o
  hero está visível, o CTA dele já resolve.
- Alvo de toque mínimo de 52px.
- A biblioteca das áreas corre na horizontal; nada de empilhar cinco
  cards altos.
- Onde não houver hover (`@media (hover: none)`), o que dependia dele
  fica visível: a seta do índice, por exemplo.

## Regras que NÃO podem quebrar

Vieram do cliente. Não são preferência de estilo.

- **Nunca passar imagem ilustrativa por obra da VIVA.** As áreas sem foto
  real (alarme, SPDA e parte do relatório) usam imagem gerada, marcada com
  `ilustrativa: true` em `lib/photos.ts`. A marca aparece **sempre**, na
  legenda ao pé da foto — discreta, mas presente mesmo quando a legenda
  descritiva está desligada (`legenda={false}`). Ela saiu da etiqueta
  preta no canto porque etiqueta gritando sobre a foto era o que mais
  denunciava layout de template; o que não pode é sumir. Não remover sem
  trocar o arquivo pela foto real. Obra, cliente, número e depoimento continuam
  valendo a regra antiga: se não veio da VIVA, não entra.
- **Legenda descreve a foto que está ali.** As entregas de laudo são
  legendadas por tipo de cliente (comércio, padaria, transportadora),
  porque é assim que o acervo da VIVA as identifica — não colar nome de
  cliente numa foto que é de outro.
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
- **O módulo de casos reais não é daqui.** A galeria é da agência e já
  existe. A chamada "VEJA ALGUNS DOS NOSSOS CASOS REAIS" + seta fecha a
  página de área — **mas só quando houver destino**: sem
  `NEXT_PUBLIC_VIVA_CASOS`, a seção não aparece. Título e seta apontando
  para o nada eram uma faixa vazia no fim das cinco páginas, e foi o
  cliente que apontou. Mesma regra dos posts do Instagram.
- **A biblioteca das cinco áreas tem dois toques.** O primeiro abre o
  painel e mostra do que a área trata; o segundo leva para a página. Não
  transformar em link de um clique só.
- **O card da biblioteca é QUADRADO — sempre.** Formato alto "parece
  Reels" e já foi reprovado pelo cliente uma vez; foi reprovado de novo
  quando voltou. `aspect-ratio: 1`, grande (até 520px), e se os cinco não
  couberem a fileira corre na horizontal. Nunca esticar o quadrado para
  caber mais.
- **A biblioteca corre na horizontal**, com encaixe e setas — no celular e
  no desktop. **Não** é lista rolando para baixo. A seção é escura, e sem
  ponto de carrossel, sem botão vermelho dentro do card e sem canto
  arredondado (`components/home/frentes.tsx`).
- **Número nenhum na abertura.** Os números entram lá embaixo, numa linha
  fina dentro da narrativa — nunca quatro quadradinhos logo abaixo do
  hero.
- **Os posts do Instagram são publicações reais**, incorporadas pelo
  permalink e clicáveis para o post. Nada de print nem de foto solta
  imitando post. **Sem permalink, a seção não aparece** — moldura vazia
  numa página que vai ao cliente lê como obra inacabada.
- **Movimento: o padrão é visível.** `components/ui/motion.tsx` só esconde
  depois que o JavaScript monta (`data-motion="on"`), e `prefers-reduced-motion`
  desliga tudo. Nunca mandar `opacity: 0` no HTML do servidor.
- **Número na tela é sempre o número certo.** O contador mostra o valor
  final até a contagem realmente começar — se o observador não disparar, o
  visitante lê "+15", nunca "+0".
- **Mobile reorganiza, não remove.** Nenhum conteúdo some para "caber".
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
- O cabeçalho é grade de três colunas (marca · menu · ação), não flex. Em
  flex, os seis links e o botão vermelho se amontoavam à direita e a
  assinatura embaixo da marca esticava a barra. A assinatura saiu do
  cabeçalho (`<Logo assinatura />` só onde fizer sentido).
- Na faixa escura de CTA, o botão precisa de `grid-column: 1 / -1` no
  mobile: senão ele engorda a coluna `auto` e o título fica abaixo do
  próprio min-content, vazando na horizontal.

## Ritmo da página-mãe

Capa escura → as cinco frentes escuras → números → como trabalhamos
(`processo.tsx`) → faixa escura de CTA → fecho → rodapé.

Houve uma seção clara de abertura entre a capa e as frentes ("Pegamos o
problema e resolvemos", com a foto da equipe). **O cliente pediu para
tirar** — não repor sem ele pedir. O que ela resolvia continua valendo:
duas seções escuras coladas deixam uma faixa preta morta no meio. Por
isso `.v-hero + .v-frentes` encurta o topo. Mexeu na ordem das seções?
Confira esse encosto de novo.

## Dev

```bash
npm run dev
npm run typecheck   # manter sempre 0
npm run lint        # manter sempre 0
npm run build
```

## Git

Mesmo repositório do painel. Commit tocando só em `viva-extintores/`.
