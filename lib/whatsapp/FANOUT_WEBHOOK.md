# Fan-out de webhook WhatsApp (focos.ia.br → DDG Disparador)

## Problema

O app Meta `Ai Focus Company` (id 4223706594541964) já tem subscription WhatsApp ativa apontando pra:
```
https://app.focos.ia.br/webhooks/whatsapp/+5598984054833
```

A Meta **não permite múltiplos subscribers** no mesmo objeto `whatsapp_business_account` do mesmo app. Só 1 callback URL.

Se trocarmos pelo nosso webhook, o `focos.ia.br` para de receber eventos. Solução: **fan-out no focos** — focos recebe e repassa pro Disparador.

## Solução: focos repassa eventos relevantes

No código do `app.focos.ia.br`, na rota `/webhooks/whatsapp/[phone]`, adicionar **após processar localmente**:

```typescript
// app/api/webhooks/whatsapp/[phone]/route.ts (ou similar)

export async function POST(req: NextRequest, { params }: { params: { phone: string } }) {
  const body = await req.json();

  // 1. PROCESSA LOCALMENTE COMO JA FAZ (focos)
  await processarEventoFocos(body, params.phone);

  // 2. FAN-OUT: repassa pro DDG Disparador (best-effort, nao bloqueia resposta)
  fetch("https://hkjukobqpjezhpxzplpj.supabase.co/functions/v1/dispatcher-meta-webhook", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Forwarded-From": "focos.ia.br",
    },
    body: JSON.stringify(body),
  }).catch((err) => console.error("[fanout-ddg] falhou:", err));

  return new Response("OK", { status: 200 });
}
```

**Pontos importantes:**

1. **Best-effort** — não usar `await` nem deixar erro do fan-out quebrar o webhook principal. Meta espera resposta 200 em até 20s ou tenta de novo (degrada quality rating).
2. **Sem retry** — se o Disparador estiver fora, perde aquele evento. Aceitável porque os IDs/status são reconstruíveis via sync periódico (`dispatcher-sync-templates`).
3. **Filtragem opcional** — você pode filtrar pra repassar só `statuses` e `message_template_status_update`, ignorando `messages` (inbox de cliente, irrelevante pro Disparador).

## Versão otimizada (só repassa o que importa)

```typescript
const ddgRelevante = body.entry?.some((entry: any) =>
  entry.changes?.some((c: any) =>
    c.field === "message_template_status_update" ||
    (c.field === "messages" && c.value?.statuses)
  )
);

if (ddgRelevante) {
  fetch("https://hkjukobqpjezhpxzplpj.supabase.co/functions/v1/dispatcher-meta-webhook", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Forwarded-From": "focos.ia.br" },
    body: JSON.stringify(body),
  }).catch((err) => console.error("[fanout-ddg]", err));
}
```

## Configuração do webhook Meta (não mexer)

Mantenha como está hoje no Meta Business Manager:
- URL: `https://app.focos.ia.br/webhooks/whatsapp/...`
- Verify token: o que já está configurado na focos
- Fields: `messages`, `message_template_status_update`

A Edge Function `dispatcher-meta-webhook` aceita o payload bruto da Meta sem precisar de verify (verify só é necessário no GET inicial da Meta, que continua indo pra focos).

## Alternativa: app Meta separado pra DDG

Se preferir desacoplar 100%, criar app Meta novo:

1. [developers.facebook.com](https://developers.facebook.com) → My Apps → Create App → "Business"
2. Adicionar produto **WhatsApp** + **Facebook Login for Business**
3. Criar Embedded Signup Configuration nova
4. Adicionar System User no Business Manager com permissão nesse app
5. Webhook próprio apontando pro `dispatcher-meta-webhook`

**Trade-off:** apps separados = clientes que conectam em ambos têm que fazer 2 signups. Fan-out evita isso mas exige código no focos.

## Validação rápida (depois de instalar o fan-out)

```bash
# Envia evento fake pra focos
curl -X POST "https://app.focos.ia.br/webhooks/whatsapp/+5511981812630" \
  -H "Content-Type: application/json" \
  -d '{
    "entry": [{
      "changes": [{
        "field": "messages",
        "value": {
          "statuses": [{
            "id": "wamid.TESTE_FANOUT",
            "status": "delivered",
            "timestamp": "1735000000",
            "recipient_id": "5511981812630"
          }]
        }
      }]
    }]
  }'
```

Em seguida, verifica no Supabase se chegou:
```sql
select * from disparador.envios where message_id = 'wamid.TESTE_FANOUT';
```
