# VIVA Extintores — site

Site institucional da VIVA com o portfólio como a parte mais pesada de
conteúdo: seis páginas de site e, dentro de **Portfólio**, a página-mãe
mais uma página completa por área de atuação.

> É um site. O portfólio é uma parte dele — a que mostra obra real.

- **Produção:** ainda não publicado (ver *Pendências*)
- **Deploy:** Vercel, projeto próprio, separado do painel
- **Repositório:** vive em `viva-extintores/` dentro do
  `dosedegrowth-design/paineldosedegrowth`, com `package.json`, build,
  lint e deploy próprios — igual ao `tayssa-lash/`

## Rodar aqui

```bash
cd viva-extintores
npm install
cp .env.example .env.local
npm run dev
```

```bash
npm run typecheck   # 0 erros
npm run lint        # 0 erros
npm run build       # 11 páginas estáticas
```

## As páginas

| Rota | O que é |
|---|---|
| `/` | Início — institucional, com os números e as cinco áreas |
| `/sobre` | Sobre nós |
| `/servicos` | Catálogo de serviços (inclui extintores/recarga e treinamento de brigada) |
| `/portfolio` | Página-mãe: o índice das cinco áreas |
| `/portfolio/combate-a-incendio` | 01 — bombas, hidrantes, SPK, painéis |
| `/portfolio/alarme-e-deteccao` | 02 — centrais, detectores, sirenes, botoeiras |
| `/portfolio/spda-para-raios` | 03 — SPDA, aterramento, medição |
| `/portfolio/laudos-clcb-avcb` | 04 — regularização, CLCB e AVCB |
| `/portfolio/relatorio-tecno-fotografico` | 05 — diagnóstico + manutenção + produtos |
| `/clientes` | Clientes e prova social |
| `/contato` | Contato |

**Serviços** responde "o que a VIVA oferece?". **Portfólio** responde
"olha o que a VIVA sabe executar na prática" — é ali que entram as fotos
reais.

## Mapa

| Pasta | O que tem |
|---|---|
| `app/` | as rotas acima + `sitemap`, `robots`, `404` |
| `app/viva.css` | tokens e componentes — CSS puro, sem Tailwind |
| `components/ui/` | foto real, botão, reveal, logo, ícones |
| `components/layout/` | cabeçalho, rodapé, WhatsApp flutuante |
| `components/secoes/` | hero, números, faixa de CTA, fecho, casos reais, Google, Instagram |
| `components/servico/` | esqueleto das páginas de área + blocos da 04 e da 05 |
| `lib/` | todo o conteúdo editável (ver abaixo) |
| `public/photos/` | os cinco lotes de fotos — ver o README de lá |

## Onde mexer no conteúdo

Nenhum texto está escondido dentro de componente. Tudo mora em `lib/`:

| Arquivo | O que controla |
|---|---|
| `lib/areas.ts` | as cinco áreas: títulos, textos, listas, CTAs, SEO |
| `lib/institucional.ts` | Início, Sobre nós, Serviços, Clientes e Contato |
| `lib/numeros.ts` | os números |
| `lib/relatorio.ts` | página 05: provocação, itens, manutenção |
| `lib/documentos.ts` | página 04: CLCB, AVCB e as etapas |
| `lib/prova-social.ts` | selo do Google e relatos do Google Meu Negócio |
| `lib/instagram.ts` | posts do Instagram |
| `lib/photos.ts` | o manifesto de fotos (arquivo, alt, legenda) |
| `lib/config.ts` | rotas, menu, marca e contatos (via env) |

## Nada é inventado

Onde falta informação real, a página mostra um campo marcado
**"a preencher"** com a descrição do que entra ali. Nunca foto de banco de
imagem, nunca depoimento escrito por nós, nunca número estimado. É feio de
propósito: quem abrir enxerga o buraco e preenche.

Vale para fotos (`public/photos/`), relatos do Google
(`lib/prova-social.ts`), posts do Instagram (`lib/instagram.ts`) e dados
de contato.

## Env

| Var | Para quê |
|---|---|
| `NEXT_PUBLIC_VIVA_ORIGIN` | origem canônica (links absolutos, sitemap, OG) |
| `NEXT_PUBLIC_VIVA_WHATSAPP` | dígitos com DDI+DDD. **Sem ela, todo CTA cai na página de contato em vez de abrir conversa** |
| `NEXT_PUBLIC_VIVA_TELEFONE` | telefone exibido |
| `NEXT_PUBLIC_VIVA_EMAIL` | e-mail exibido |
| `NEXT_PUBLIC_VIVA_INSTAGRAM` | handle, ex. `@vivaextintores` |

## Pendências antes de publicar

1. **WhatsApp, telefone, e-mail e Instagram da VIVA.** Sem isso não há
   conversão.
2. **As fotos reais**, nos cinco lotes. Lista de arquivos em
   `public/photos/README.md`. As duas críticas: a abertura do site e a do
   profissional de costas com prancheta (não trocar por ícone).
3. **Validação final dos números.** Estão publicados só os quatro que
   saíram da VIVA: +15 anos, +10.000 laudos entregues, +30 obras
   entregues em 2026, +20 itens no Relatório. Os números que apareceram
   nos mockups da agência (+3.000 clientes, +1.500 obras, +300 sistemas,
   100% conformidade…) **não** entraram: são números de layout.
4. **Selo e relatos do Google** em `lib/prova-social.ts`.
5. **Confirmar as legendas com nome de cliente** na área 04 (Cury, Padaria
   Marabá, Metrô Tamanduateí, Ed. Araken de Moraes, Banana's Outlet,
   Studio Rock Rock) em `lib/photos.ts`.
6. **Instagram**: posts em `lib/instagram.ts` ou o token da Graph API.
7. **Logo oficial em SVG.** Hoje a marca é desenhada em texto em
   `components/ui/logo.tsx` — é trocar o miolo por um `<Image>`.
8. **Conteúdo institucional**: Sobre nós e Contato estão com a estrutura
   pronta e texto que descreve o que a VIVA faz, mas sem história,
   endereço, horário nem certificações — a VIVA precisa passar.

## O módulo de casos reais não é daqui

Cada página de área fecha com **"VEJA ALGUNS DOS NOSSOS CASOS REAIS"** e
uma seta para baixo. E para. A galeria de casos é da agência e já existe —
não é para reconstruir aqui nem virar catálogo de trinta fotos.

## Deploy na Vercel

Projeto **separado** do painel, no mesmo repositório — e separado também
do projeto `vivaextintores` que já existe na conta, que aponta para outro
repositório e não deve ser tocado.

1. **Add New → Project** → importar `dosedegrowth-design/paineldosedegrowth`
2. **Project Name:** `viva-extintores-site`
3. **Root Directory:** `viva-extintores`
4. **Deploy**
5. **Settings → Git → Production Branch:** trocar `main` por
   `claude/sweet-cori-tutfes` (a pasta só existe nessa branch)
6. Variáveis de ambiente: as cinco da tabela acima
7. Domínio: apontar o subdomínio escolhido

> Criar o projeto por API/MCP devolve `403 — You don't have permission to
> create a project`. É papel de Owner do time; pelo painel, funciona.

O `turbopack.root` em `next.config.ts` prende a raiz nesta pasta — sem
isso o build sobe um nível e passa a usar o `postcss.config` e o
`middleware` do painel.
