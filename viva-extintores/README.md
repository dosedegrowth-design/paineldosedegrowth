# VIVA Extintores — Portfólio digital

Ferramenta comercial da VIVA: o visitante entra, entende em segundos que a
VIVA é engenharia de segurança contra incêndio, vê as cinco especialidades,
abre a que é o problema dele, vê prova em fotografia real e sai pelo
WhatsApp.

> "Este não é um álbum de fotos da VIVA. É uma ferramenta comercial que
> precisa transformar experiência técnica e obras reais em confiança e
> geração de negócios." — §26 do briefing

- **Produção:** ainda não publicado (ver *Pendências*)
- **Deploy:** Vercel · projeto próprio, separado do painel
- **Repositório:** vive em `viva-extintores/` dentro do
  `dosedegrowth-design/paineldosedegrowth`, com `package.json`, build, lint
  e deploy próprios — igual ao `tayssa-lash/`

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
npm run build       # 6 páginas estáticas
```

## Mapa

| Pasta | O que tem |
|---|---|
| `app/` | `/` (portfólio) + as 5 páginas de área + `sitemap`, `robots`, `404` |
| `app/viva.css` | tokens e componentes visuais — CSS puro, sem Tailwind |
| `components/ui/` | foto real, botão, reveal, logo, ícones |
| `components/layout/` | cabeçalho, rodapé, WhatsApp flutuante |
| `components/home/` | abertura, grade das 5 áreas, sobre |
| `components/servico/` | esqueleto das páginas de área + blocos exclusivos da 04 e da 05 |
| `components/secoes/` | números, faixa de CTA, casos reais, Google, Instagram |
| `lib/` | todo o conteúdo editável (ver abaixo) |
| `public/photos/` | as fotos reais — ver o README de lá |

## Onde mexer no conteúdo

Nenhum texto está escondido dentro de componente. Tudo mora em `lib/`:

| Arquivo | O que controla |
|---|---|
| `lib/areas.ts` | as cinco áreas: títulos, textos, listas, selos, CTAs, SEO |
| `lib/home.ts` | abertura, diferenciais e faixa da página-mãe |
| `lib/numeros.ts` | os números de credibilidade |
| `lib/relatorio.ts` | página 05: provocação, 20 itens, manutenção, produtos |
| `lib/documentos.ts` | página 04: CLCB, AVCB e as etapas |
| `lib/casos.ts` | as janelas de casos reais (foto ou vídeo) de cada página |
| `lib/prova-social.ts` | selo do Google e os relatos do Google Meu Negócio |
| `lib/instagram.ts` | posts do Instagram |
| `lib/photos.ts` | o manifesto de fotos (nome do arquivo, alt, legenda) |
| `lib/config.ts` | rotas, marca e contatos (via env) |

## Nada é inventado

Onde falta informação real, a página mostra um campo marcado
**"a preencher"** com a descrição do que entra ali. Nunca foto de banco de
imagem, nunca depoimento escrito por nós, nunca número estimado. É feio de
propósito: quem abrir enxerga o buraco e preenche.

Isso vale para fotos (`public/photos/`), relatos do Google
(`lib/prova-social.ts`), posts do Instagram (`lib/instagram.ts`) e janelas
de casos reais (`lib/casos.ts`).

## Env

| Var | Para quê |
|---|---|
| `NEXT_PUBLIC_VIVA_ORIGIN` | origem canônica (links absolutos, sitemap, OG) |
| `NEXT_PUBLIC_VIVA_WHATSAPP` | dígitos com DDI+DDD. **Sem ela, todo CTA cai na seção de contato em vez de abrir conversa** |
| `NEXT_PUBLIC_VIVA_TELEFONE` | telefone exibido no rodapé |
| `NEXT_PUBLIC_VIVA_EMAIL` | e-mail exibido no rodapé |
| `NEXT_PUBLIC_VIVA_INSTAGRAM` | handle, ex. `@vivaextintores` |

## Pendências antes de publicar

Em ordem de impacto:

1. **WhatsApp, telefone, e-mail e Instagram da VIVA.** Sem isso não há
   conversão: os botões descem para o rodapé em vez de abrir conversa.
2. **As fotos reais.** Hoje todos os slots estão vazios. A lista com o nome
   de cada arquivo está em `public/photos/README.md`. As duas mais
   importantes: a abertura da home (§5) e a foto do profissional em
   inspeção, de costas, com prancheta (§13 — não trocar por ícone).
3. **Confirmar os números** +5.000 AVCBs e +2.000 obras (§15: todos devem
   ser confirmados pela VIVA antes da publicação).
4. **Selo e relatos do Google.** Link do perfil, nota, total e três
   avaliações copiadas do Google Meu Negócio, em `lib/prova-social.ts`.
5. **Confirmar as legendas com nome de cliente** na página 04 (Cury,
   Padaria Piemonte, Metrô Tamanduateí, Edifício Araken) em `lib/photos.ts`.
6. **Janelas de casos reais e vídeos** em `lib/casos.ts`.
7. **Instagram**: os posts em `lib/instagram.ts`, ou o token da Graph API
   para puxar o feed de verdade.
8. **Logo oficial em SVG.** Hoje a marca é desenhada em texto no
   `components/ui/logo.tsx` — é trocar o miolo por um `<Image>`.

Já resolvido: **tempo de mercado**. São 16 anos; publicado como "mais de
15 anos", conforme a VIVA pediu.

## Deploy na Vercel

Projeto **separado** do painel, no mesmo repositório:

1. Novo projeto na Vercel a partir de `dosedegrowth-design/paineldosedegrowth`
2. **Root Directory:** `viva-extintores`
3. Framework: Next.js (detecta sozinho) · Node 20+
4. Variáveis de ambiente: as cinco da tabela acima
5. Domínio: apontar o subdomínio escolhido para o projeto

O `turbopack.root` em `next.config.ts` prende a raiz nesta pasta — sem
isso o build sobe um nível e passa a usar o `postcss.config` e o
`middleware` do painel.
