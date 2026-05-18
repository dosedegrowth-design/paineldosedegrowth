# DDG Disparador — WhatsApp Cloud API (Massa)

> Módulo de disparo em massa via Meta Cloud API oficial, integrado ao painel `trafego-ddg`. Permite cadastrar contas WABA, sincronizar/criar templates aprovados pela Meta, fazer upload de bases CSV/XLSX e disparar campanhas com pacing controlado.

## Status atual
- Branch: `feature/disparador`
- Versão: 0.1.0 (esqueleto end-to-end)
- WABA inicial: SuperVisão Matriz

## Arquitetura

```
┌─────────────────────────────────┐
│ Frontend Next.js                │  /disparador/*
│ (trafego-ddg · app router)      │  upload CSV → mapeia variáveis → dispara
└──────────────┬──────────────────┘
               │
               ▼ insert / select
┌─────────────────────────────────┐       ┌──────────────────────────────────┐
│ Supabase DDG                    │◄──────│ Edge Function                    │
│ schema: disparador              │       │ dispatcher-meta-webhook          │
│ - contas, templates, campanhas, │       │ (status callbacks Meta)          │
│   envios, uploads               │       └──────────────────────────────────┘
└──────────────┬──────────────────┘
               │ HTTP trigger
               ▼
┌─────────────────────────────────┐
│ n8n workflow                    │──► graph.facebook.com/v25.0/{phone_id}/messages
│ DDG-Disparador-Mass-v1          │    (Meta Cloud API oficial)
│ - pacing throttle               │
│ - retry / circuit-breaker       │
└─────────────────────────────────┘
```

## Convenções

- **Schema Supabase**: `disparador` (separado do `trafego_ddg`)
- **Token Meta**: Supabase Vault (`vault.secrets`), referenciado por `token_vault_key` em `disparador.contas`
- **Storage**: bucket privado `disparador-uploads`
- **API version Meta**: `v25.0` (alinhado com `META_API_VERSION` do `.env`)
- **Pacing default**: 3 msg/s (conservador, escala manual)
- **Circuit-breaker**: pausa campanha se taxa de erro > 10% nos últimos 50 envios

## Fases

### Fase 0 — Setup Meta (DEPENDÊNCIAS EXTERNAS)
Pré-requisitos no Meta Business Manager — ver [SETUP.md](lib/whatsapp/SETUP.md):
- [ ] System User token permanente com `whatsapp_business_management` + `whatsapp_business_messaging`
- [ ] `waba_id` + `phone_number_id` da WABA Matriz SPV
- [ ] Tier de mensagens conhecido
- [ ] Webhook Meta apontando pra Edge Function `dispatcher-meta-webhook`

### Fase 1 — Schema Supabase ✅
Migration: `supabase/migrations/20260518000000_disparador_init.sql`

5 tabelas em schema `disparador`:
- `contas` — WABA cadastradas (waba_id, phone_number_id, token_vault_key, tier, quality_rating)
- `templates` — sync da Meta (status: PENDING/APPROVED/REJECTED)
- `campanhas` — job de disparo (status: draft/scheduled/running/done/paused)
- `envios` — 1 linha por contato (status: pending/sent/delivered/read/failed)
- `uploads` — arquivo bruto + mapping de colunas

### Fase 2 — Backend
- `lib/whatsapp/client.ts` — cliente Meta Cloud API (sendTemplate, listTemplates, createTemplate, getPhoneNumberInfo)
- `lib/whatsapp/vault.ts` — wrapper Supabase Vault pra ler tokens
- Edge Function `dispatcher-meta-webhook` — recebe status sent/delivered/read/failed
- Edge Function `dispatcher-sync-templates` — pull diário da Meta
- API Routes:
  - `POST /api/dispatcher/start` — dispara n8n
  - `POST /api/dispatcher/upload` — upload + parsing CSV/XLSX
  - `GET /api/dispatcher/templates` — lista templates da conta
  - `POST /api/dispatcher/templates` — cria template novo (vai pra Meta)
  - `GET /api/dispatcher/contas` — lista WABAs

### Fase 3 — Workflow n8n
`fluxos n8n/DDG - Disparador Mass v1.json`:
1. Webhook trigger
2. Supabase get envios pending
3. SplitInBatches + Wait (pacing)
4. HTTP Meta API
5. Supabase update envio
6. Loop + circuit-breaker

### Fase 4 — Frontend
Rotas em `app/(dashboard)/disparador/`:
- `/disparador` — overview
- `/disparador/contas` — gerenciar WABAs
- `/disparador/templates` — listar + criar templates
- `/disparador/campanhas/nova` — wizard 5 steps
- `/disparador/campanhas/[id]` — detalhe da campanha

### Fase 5 — Testes
Validação manual com 5 contatos reais, depois 100 com pacing 5/s.

## Notas operacionais

### Política Meta (CRÍTICO)
- Disparo em massa **só com template APPROVED**
- Mensagens marketing exigem opt-in do destinatário
- **Quality rating** do número cai com block/report → tier trava → disparo bloqueia
- Custo conversação marketing BR: ~R$ 0,30–0,45 por contato

### Idempotência
n8n só processa envios `status=pending`. Se cair no meio, ao reiniciar pula `sent`/`failed`.

### Variáveis de template
Templates Meta usam variáveis posicionais `{{1}}, {{2}}, ...`. UI mapeia colunas CSV → posições e mostra preview com substituição.

## Variáveis de ambiente

Adicionar em `.env.local`:

```bash
# ----- WhatsApp Cloud API (Disparador) -----
# Cliente Meta usa META_APP_ID/META_APP_SECRET/META_API_VERSION já existentes.
# Token por conta fica em Supabase Vault.
N8N_DISPATCHER_WEBHOOK_URL=https://n8n.dosedegrowth.pro/webhook/disparador-start
N8N_DISPATCHER_WEBHOOK_SECRET=
META_WEBHOOK_VERIFY_TOKEN=
```

## Próximos passos

1. Aplicar migration no Supabase DDG (`hkjukobqpjezhpxzplpj`)
2. Configurar System User + token no Business Manager (cliente)
3. Inserir conta WABA Matriz no banco (via UI ou seed)
4. Deploy Edge Functions
5. Importar workflow n8n
6. Testar com 1 contato real
