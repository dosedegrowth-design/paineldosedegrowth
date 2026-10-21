---
name: ddg-site-mobile-primeiro
description: "REGRA Lucas 21/09/2026 — todo site da DDG: SEMPRE validar o mobile (cliente olha 90% das vezes só no celular) e boas práticas antes de dizer que está pronto; mostrar a prova do celular"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: bb3fcdc2-ea3c-4558-bd4f-6c1e5a962bb0
  modified: 2026-09-21T14:05:11.556Z
---

# Site novo ou ajuste em site: olhar o MOBILE primeiro + boas práticas

O cliente (lead ou fechado) vai abrir o link no WhatsApp, no celular. 90% das vezes ele só vê o
mobile. Desktop bonito e celular quebrado = site reprovado.

**Why:** pedido do Lucas em 21/09/2026 ("deixar salvo que sempre quando fizer um site precisamos
olhar o mobile e boas práticas"). É a mesma lógica de [[al-guinchos-site]] (escala própria pro
celular, anti rolagem lateral) e da validação obrigatória que ele cobra em tudo.

**How to apply (checklist antes de falar "pronto" ou "subi"):**
1. **Mobile de verdade**: screenshots com Playwright em 320 e 390px (o Browser pane não aplica
   viewport fiel) + desktop. Olhar as capturas, não só rodar. Mostrar a do celular pro Lucas.
2. **Zero rolagem lateral** (`scrollWidth == clientWidth` em 320/390) e zero erro de console.
3. **Escala do celular**: títulos com tamanho próprio (`text-[26px] sm:text-4xl`), textos legíveis
   (≥15px), botões com área de toque ≥44px, barra fixa Ligar + WhatsApp quando for site de conversão.
4. **Boas práticas**: imagens otimizadas com tamanho certo e alt real, fontes self-hosted (next/font),
   title/description/OG/canonical/JSON-LD, contraste legível, links de contato clicáveis
   (`tel:` e `wa.me`), sem travessão ([[ddg-sem-travessao]]), sem texto ou dado inventado.
5. Vale pra site próprio ([[ddg-processo-padrao-site]]) e pra site do hub de prospecção
   ([[ddg-radar-sites-prospeccao-hub]]).
