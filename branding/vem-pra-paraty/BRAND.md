# Vem pra Paraty — Identidade Visual (Instagram)

> Kit criado pela DDG em 27/ago/2026. **Leia este arquivo antes de criar qualquer arte pro cliente** — toda imagem de carrossel, flyer, story ou anúncio do @vempraparaty sai deste sistema.

## Cliente

- **Negócio**: passeios de lancha em Paraty-RJ. **4 lanchas** próprias, boa disponibilidade, preço competitivo. Foi a terceira lancha a operar em Paraty (história/tradição é diferencial).
- **Instagram**: [@vempraparaty](https://www.instagram.com/vempraparaty/)
- **Meta Ads**: conta "Vem Pra Paraty - 001" (`1760209501849653`) no business DD Growth
- **Posicionamento**: acessível e animado — "passeio incrível que cabe no bolso". Convite, não anúncio.
- **Preço mínimo oficial: R$ 700 (lancha privativa, o passeio)** — todo criativo com preço usa "a partir de R$ 700"; nunca inventar outro valor. Ângulo "matemática da galera": R$ 700 ÷ 12 = menos de R$ 60/pessoa.

## Paleta (fixa — não inventar cor nova)

| Cor | Hex | Uso |
|---|---|---|
| Navy Profundo | `#0B2D48` | Fundo principal de artes; overlay sobre fotos |
| Navy Noite | `#07203A` | Par do navy em gradientes/rodapés |
| Turquesa | `#17C3B2` | Água, palavras de destaque, pills secundárias |
| Teal Maré | `#0E9AA7` | Ondas, apoio da turquesa em fundo claro |
| Areia | `#F6EFE3` | Texto sobre escuro; fundos claros |
| Laranja Pôr do Sol | `#FF7A45` | **CTA, preço, promoção — nunca texto longo** |
| Dourado Sol | `#FFB84D` | Detalhes quentes, palavra de destaque |

Proporção alvo: navy ~52% · turquesa ~16% · teal ~8% · areia ~14% · laranja ~7% · dourado ~3%.

## Tipografia (Google Fonts, gratuitas)

- **Pacifico** — só frases curtas de emoção ("Bora pro mar?"). Nunca caps, nunca texto corrido.
- **Lilita One** — títulos/headlines. Grande, uma ideia por linha, uma palavra destacada em turquesa ou dourado.
- **Poppins** 400–800 — corpo, legendas, pills, botões. Labels em caps com letter-spacing.

Arquivos woff2 locais em `fonts/` (usados pelos geradores; PT precisa dos subsets latin).

## Logo

- `logo/selo-principal-2048.png` — selo náutico (sol, serra, lancha, ondas). Fundos escuros.
- `logo/avatar-perfil-1080.png` — **usar como foto de perfil do IG**.
- `logo/selo-fundo-claro-2048.png` — fundos areia/branco.
- `logo/selo-mono-branco-2048.png` — marca d'água sobre foto (60–75% opacidade).
- `logo/logo-horizontal-fundo-navy.png` / `logo-horizontal-areia-alpha.png` (texto areia, fundo transparente) / `logo-horizontal-fundo-claro-alpha.png` (texto navy) — cabeçalhos.
- Fontes editáveis dos desenhos em `logo/src/*.html` (SVG inline).

**Regras**: respiro = altura do "V"; mínimo 110px; não esticar/rotacionar/recolorir/sombrear.

## Capas de destaque

`capas/capa-{roteiros,frota,precos,depoimentos,reservas,paraty,promocoes,bastidores}.png` — 1080×1920, ícone centralizado no anel, é só subir. Novo destaque? Gerar no mesmo sistema editando `tools/capas_build.js` (adicionar ícone no objeto `icons`).

## Templates (exemplos prontos)

- `templates/template-carrossel-capa.png` — capa de carrossel 1080×1350: selo topo-esquerda, @ topo-direita, pill laranja de categoria, headline Lilita em 2 cores, "Arrasta pro lado" + dots.
- `templates/template-flyer-promo.png` — flyer feed/ads 1080×1350: selo central, pill turquesa outline, headline, linha de benefícios, bloco de preço laranja rotacionado + CTA WhatsApp turquesa.
- `templates/template-story-promo.png` — story 1080×1920: Pacifico de abertura, headline, checklist ✓, CTA laranja full-width.
- `templates/foto-lancha-paraty-{a,b}.jpg`, `foto-aerea-paraty.jpg`, `foto-grupo-lancha.jpg`, `foto-casal-pordosol.jpg`, `foto-praia-deserta.jpg`, `foto-paraty-colonial.jpg` — fotos geradas (Maginific) pra fundo enquanto não há foto real boa. **Preferir fotos reais do cliente quando existirem.**
- Textos dos templates são ilustrativos; preço sempre "a partir de R$ 700".

## Criativos de teste (Meta Ads)

`ads/vpp-adXX-<angulo>-<formato>.jpg` — 16 artes em 10 ângulos (preco, privativo, roteiro, tradicao, urgencia, pordosol, grupo, incluso, depoimento, matematica), formatos feed 4:5 e story 9:16. Guardadas em JPEG no repo; `tools/ads_build.js` regenera os PNG 1080 full. Hipóteses de cada ângulo + plano de teste: seção 08 do manual único (https://claude.ai/code/artifact/e67c8640-f904-442b-979a-f9b16263915a) — **este é o único link que circula com o cliente**; `ads/matriz-criativos.html` é só a versão standalone local. O depoimento do ad09 é ilustrativo — trocar por depoimento real. Novas variações: editar/duplicar blocos em `tools/ads_build.js`.

## Tom de voz

Convite de amigo, alegre, direto, zero jargão. Frases da casa: "Bora pro mar?", "Seu dia de lancha em Paraty.", "A gente conhece cada praia pelo nome.", "Fecha teu roteiro no WhatsApp."
CTA padrão: **"Reserve pelo WhatsApp"**. Hashtags fixas: #VemPraParaty #Paraty #PasseioDeLancha #ParatyRJ #CostaVerde.

Bio sugerida do perfil:

```
Vem pra Paraty 🚤
Passeios de lancha em Paraty-RJ
🏝️ Praias e ilhas num dia inesquecível
⚓ 4 lanchas • saídas todos os dias
👇 Reserva rápida pelo WhatsApp
```

## Manual

- PDF pro cliente: `manual/identidade-visual-vem-pra-paraty.pdf`
- Brand board online (artifact): https://claude.ai/code/artifact/e67c8640-f904-442b-979a-f9b16263915a
- HTML auto-contido: `manual/manual-artifact.html`

## Como regenerar/derivar artes

Os geradores usam Chromium headless (Playwright) e as fontes locais:

```bash
cd branding/vem-pra-paraty/tools
npm init -y && npm i playwright-core   # uma vez
node render.js <arquivo.html> <saida.png> <largura> <altura> [escala] [alpha]
node capas_build.js       # regenera as 8 capas
node templates_build.js   # regenera os 3 templates (edite textos/foto no próprio script)
node manual_build.js      # regenera manual html + PDF (precisa thumbs_build.js antes)
```

O executável do Chromium está hardcoded (`/opt/pw-browsers/chromium-1194/...`) — ajustar pro ambiente se necessário. Pra nova arte de carrossel/flyer: duplicar o bloco correspondente em `templates_build.js`, trocar headline/foto/preço e rodar.

## Operação (estado em 27/ago/2026)

- **Cliente cadastrado no painel DDG**: `trafego_ddg.clientes` id `c4c0f24d-b8ea-44cc-9208-05a7bcc1a685`, slug `vem-pra-paraty`, cor `#FF7A45`, tipo `lead_whatsapp`, ticket R$ 700. View pública: https://painel.dosedegrowth.com/c/vem-pra-paraty (exige o fix do middleware deste branch mergeado no main + OAuth Meta feito em /clientes).
- **Plano de lançamento** (checklist D1/D2, semana 1 com legendas prontas, roteiros de stories, scripts de WhatsApp, KPIs e insumos do cliente): seção 09 do manual — fonte em `tools/manual_build.js`.
- Pendências com o cliente: fotos reais das 4 lanchas, nomes/capacidades, depoimentos reais, WhatsApp oficial de reservas, roteiros/preços por lancha, autorização de imagem.
