# WhatsApp Cloud API — Setup

Checklist passo a passo pra preparar uma conta WABA pra usar no Disparador.

## 1. Pré-requisitos (Meta Business Manager)

- [ ] Conta no [business.facebook.com](https://business.facebook.com)
- [ ] WhatsApp Business Account (WABA) já criada
- [ ] Número de telefone verificado na WABA
- [ ] Display name aprovado pela Meta (necessário pra sair do sandbox)
- [ ] Método de pagamento configurado (conversações são pagas)

## 2. Criar System User

System User token é **permanente** (não expira) — único token recomendado pra produção.

1. Acesse [business.facebook.com/settings/system-users](https://business.facebook.com/settings/system-users)
2. **Adicionar System User** → tipo `Employee` ou `Admin`
3. Nome: `DDG-Disparador-System-User`
4. Em **Assets**, adicione:
   - WhatsApp Business Account (com permissão `Manage`)
   - WhatsApp Account (com permissão `Manage`)
5. Em **Generate New Token**:
   - App: o app Meta que vai usar (ou crie um novo em [developers.facebook.com](https://developers.facebook.com))
   - Token expiration: **Never**
   - Scopes obrigatórios:
     - `whatsapp_business_management`
     - `whatsapp_business_messaging`
     - `business_management`
6. **Copie e guarde o token** — ele só aparece uma vez!

## 3. Coletar IDs

Você precisa de 2 IDs:

- **WABA ID** (WhatsApp Business Account ID):
  - business.facebook.com → WhatsApp Accounts → clique na sua WABA → URL contém `?business_id=` ou veja em "ID" no painel
- **Phone Number ID**:
  - WhatsApp Manager → Phone Numbers → clique no número → ID aparece em "Phone number details"

Validação rápida via curl:

```bash
curl -G "https://graph.facebook.com/v25.0/<PHONE_NUMBER_ID>" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  --data-urlencode "fields=verified_name,display_phone_number,quality_rating,messaging_limit_tier"
```

Deve retornar 200 com:
```json
{
  "verified_name": "SuperVisao Brasil",
  "display_phone_number": "+55 11 9999-9999",
  "quality_rating": "GREEN",
  "messaging_limit_tier": "TIER_10K"
}
```

## 4. Configurar Webhook Meta

O webhook recebe callbacks de status (sent / delivered / read / failed) e atualiza `disparador.envios` automaticamente.

URL do webhook (Edge Function Supabase):
```
https://<SUPABASE_PROJECT>.supabase.co/functions/v1/dispatcher-meta-webhook
```

Onde configurar:
1. Meta Business Manager → WhatsApp Manager → **Webhooks**
2. **Callback URL**: cole a URL acima
3. **Verify Token**: gere com `openssl rand -hex 32` e coloque em:
   - Supabase: Settings → Edge Functions → secrets → `META_WEBHOOK_VERIFY_TOKEN`
   - Meta: campo "Verify token" do webhook
4. **Webhook fields** (subscribe):
   - `messages` — pra status sent/delivered/read/failed
   - `message_template_status_update` — pra status de templates (PENDING → APPROVED/REJECTED)
5. Clique **Verify and Save**

## 5. Cadastrar no painel

1. Acesse `/disparador/contas`
2. Preencha:
   - Nome de exibição (ex: "SuperVisão Matriz")
   - WABA ID
   - Phone Number ID
   - Access Token (System User)
3. O painel valida com a Meta e salva o token criptografado no Vault.

## 6. Sincronizar templates

Os templates já criados na Meta aparecem automaticamente após sync:

```bash
curl -X POST "https://<SUPABASE_PROJECT>.supabase.co/functions/v1/dispatcher-sync-templates" \
  -H "Authorization: Bearer <SUPABASE_ANON_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"conta_id": "<UUID DA CONTA>"}'
```

Ou aguarde o cron diário (configurar via pg_cron, ver seção 8).

## 7. Tier de mensagens (limites Meta)

| Tier | Conversações marketing/dia |
|---|---|
| TIER_50 | 50 |
| TIER_250 | 250 |
| TIER_1K | 1.000 |
| TIER_10K | 10.000 |
| TIER_100K | 100.000 |
| TIER_UNLIMITED | sem limite |

Meta promove automaticamente quando:
- Quality rating = GREEN por 7 dias
- Conversações > 50% do tier atual

## 8. Cron sync templates (opcional)

No Supabase SQL Editor:

```sql
select cron.schedule(
  'disparador-sync-templates',
  '0 3 * * *',  -- todo dia às 3h
  $$
  select net.http_post(
    url := 'https://<PROJECT>.supabase.co/functions/v1/dispatcher-sync-templates',
    headers := '{"Authorization": "Bearer <SERVICE_ROLE_KEY>"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
```

## 9. Importar workflow n8n

1. Acesse o n8n
2. Workflows → Import from file
3. Selecione `fluxos n8n/DDG - Disparador Mass v1.json`
4. Configure variáveis de ambiente n8n:
   - `PAINEL_URL` = `https://trafegoddg.vercel.app` (ou local)
   - `N8N_DISPATCHER_WEBHOOK_SECRET` = mesmo valor do `.env.local` do painel
5. Ative o workflow

## 10. Política Meta (CRÍTICO)

- **Templates aprovados são obrigatórios** pra mensagens fora da janela de 24h
- **Marketing exige opt-in** do destinatário (LGPD + política Meta)
- **Block/report** derruba quality rating → tier trava → disparo bloqueia
- **Repetição** de templates idênticos pode ser sinalizada
- Comece com **pacing baixo** (3 msg/s) e escale só após validar quality

## Troubleshooting

### "Invalid OAuth access token"
Token expirou ou foi revogado. Gere novo System User token.

### "Recipient phone number not in allowed list"
WABA ainda está em sandbox. Adicione o número de destino em "Allowed test numbers" ou complete o display name approval.

### "Template name does not exist in the translation"
Template não está APPROVED no idioma. Verifique status em `/disparador/templates`.

### "Re-engagement message"
Janela de 24h fechada. Só funciona template categoria MARKETING/UTILITY.
