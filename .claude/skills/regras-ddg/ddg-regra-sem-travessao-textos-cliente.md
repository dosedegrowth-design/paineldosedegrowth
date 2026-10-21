---
name: ddg-regra-sem-travessao-textos-cliente
description: REGRA Lucas 09/10/2026 — nada de travessão (—) em texto que vai para cliente (propostas, páginas, mensagens); usar vírgula, ponto, dois-pontos ou parênteses
metadata:
  type: feedback
---

Em proposta, página, site ou mensagem para cliente, **não usar travessão (—)**. Trocar por vírgula, ponto final,
dois-pontos ou parênteses, conforme o sentido. Em rótulos curtos, usar "·".

**Why:** o Lucas achou os travessões "desnecessários" na proposta da Promopress (v1.3 → v1.4, 09/10/2026); deixam o texto com cara de gerado.
**How to apply:** antes de publicar qualquer texto de cliente, `grep -c "—"` tem que dar 0. Vale também para en dash (–).
Ver [[promopress-reuniao-multi360-escopo]].
