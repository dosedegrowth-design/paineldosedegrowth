# Sessão: Site Institucional Climafrio (`/andre`)

> Registro completo da sessão de desenvolvimento com Claude Code.
> O transcript integral está em `transcript-completo.txt` (100% dos diálogos
> e ações de ferramenta, com tokens temporários redigidos).

## O que foi construído

Releitura institucional completa do **climafrio.com.br** no nosso formato
premium, pra apresentação de venda ao cliente. Publicado em:

**https://painel.dosedegrowth.com/andre**

- **29 páginas** com URL própria: Home, Empresa, Soluções, Produtos, Marcas,
  Segmentos, Contato + 8 páginas de produto + 6 de marca + 8 de aplicação
- Paridade total de conteúdo com o site original (desde 1985, missão/visão/
  valores literais, 8 linhas de produto, 6 marcas, 8 aplicações, contatos,
  CNPJ, loja virtual)
- Hero com **globo 3D wireframe** girando (desktop e mobile)
- **7 fotos reais de HVAC** (Freepik, licença free, otimizadas com sharp)
  nos cards de serviço — prontas pra uso em anúncio
- **ClimaRail**: linha de progresso térmica no topo (âmbar→ciano) + régua
  de temperatura na borda direita (34°→21° conforme o scroll)
- Efeitos por página: aurora, grid neon, estrelas, flocos subindo,
  cristais de gelo 3D — versão lite no mobile
- Conversão discreta: CTAs verdes de WhatsApp + botão flutuante
  (sem popup agressivo — é site institucional)

## Linha do tempo (commits no main)

| Commit | O quê |
|---|---|
| `71bdc3f` | Hero em arco de fotos (ArcGalleryHero do 21st.dev) |
| `9b808e4` | Hero globo 3D (DotGlobeHero) + dieta de performance mobile (−51% JS) |
| `78187eb` | Publica arco com miniaturas otimizadas |
| `6b1a4c4` | Publica globo com fallback SVG mobile |
| `531afd4` | Releitura institucional (conteúdo real do climafrio.com.br) |
| `9038ed6` | Multi-páginas: rotas reais por seção, navbar com navegação |
| `52d47cc` | Paridade: 22 páginas de detalhe (produtos/marcas/segmentos) |
| `166553c` | Globo girando no mobile + efeitos em todas as telas |
| `b5fc83e` | SectionFX em todas as páginas + globo inteiro no mobile |
| `4d1c672` | Hero elevado + globo pausa fora da viewport |
| `3d52582` | Fotos reais de HVAC + ClimaRail + centralização total |

Branch de trabalho: `claude/andre-ac-website-redesign-srak6e` (espelho do main).

## Performance medida (viewport mobile)

| Métrica | Início do dia | Final |
|---|---|---|
| JS baixado | 515 KB | 487 KB (com three.js rodando o globo) |
| Página total | 1,7 MB | ~700 KB |
| three.js parado no celular | 231 KB desperdiçados | pausa fora da viewport |

Chaves da dieta: gate de dispositivo ANTES do dynamic import, Lenis só com
mouse, ThermoOverlay desktop-only, malha do globo 40×40 + DPR 1.5 no mobile,
`frameloop="never"` quando o hero sai da tela.

## Skills e ferramentas usadas

- **Skills**: ui-ux-pro-max (UX), design/ui-styling (design system), verify (QA)
- **MCPs**: 21st.dev (componentes ArcGalleryHero, DotGlobeHero, carrossel
  Aceternity, beams), Maginific/Freepik (fotos reais), Vercel (deploys e
  previews), GitHub
- **Automação**: Playwright + Chromium (screenshots, prova de rotação do
  globo por diff de frames, QA de console/imagens/overflow em 12 rotas × 2
  viewports), sharp (otimização de imagem), WebFetch (scraping do site
  original pra extrair conteúdo real)

## Stack do site

Next.js 16 (App Router, rotas estáticas) · TypeScript · Tailwind v4 ·
shadcn/ui · Framer Motion · three.js/React Three Fiber · Lenis · CSS puro
pros efeitos baratos.

## Como retomar o trabalho numa sessão nova

```bash
git clone https://github.com/dosedegrowth-design/paineldosedegrowth.git
cd paineldosedegrowth && npm install
npx tsc --noEmit && npx next build   # 40 rotas, 0 erros
npm run dev                          # http://localhost:3000/andre
```

Arquivos-chave: `app/andre/**` (rotas), `components/andre/**` (seções),
`components/andre/site-data.ts` (conteúdo dos detalhes),
`components/andre/config.ts` (dados da Climafrio),
`components/ui/{arc-gallery-hero,globe-hero}.tsx` (componentes 21st.dev).
Heroes alternativos prontos: `arc-hero.tsx` (arco de fotos) e o antigo
`hero.tsx` (foto cinematográfica) — trocar é 1 linha em `app/andre/page.tsx`.
