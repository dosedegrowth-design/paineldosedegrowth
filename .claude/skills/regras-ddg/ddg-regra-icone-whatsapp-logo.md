---
name: ddg-regra-icone-whatsapp-logo
description: REGRA Lucas — ícone que se refere a WhatsApp é sempre a logo oficial, nunca balão genérico
metadata:
  type: feedback
---

Sempre que um ícone se referir a **WhatsApp**, usar a **logo certa** do WhatsApp — nunca
`MessageCircle`, `MessageSquare`, `Phone` ou qualquer balão genérico do lucide.

**Why:** o lucide não tem ícones de marca; o balão genérico faz o botão parecer "mensagem
interna" em vez do canal que o franqueado reconhece na hora.

**How to apply:** no dash-supervisao existe `src/components/icons/whatsapp.tsx` →
`<WhatsAppIcon className="w-4 h-4" />` (SVG oficial em `currentColor`, herda a cor do pai).
Em projeto novo, copiar esse componente. Antes de dar por pronto, procurar por
`MessageCircle|MessageSquare|Phone` perto da palavra "WhatsApp" e trocar.
Verde da marca quando precisar de cor própria: `#25D366`.

Aplicado 23/09 em: botão e modal "Resumo p/ WhatsApp" (Relatórios), comercial, appointment-sheet.
Ver [[spv-regra-validar-localhost-antes-deploy]].
