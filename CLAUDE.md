@AGENTS.md

# Tráfego DDG — Painel de Performance de Anúncios

> Leia este arquivo **inteiro** antes de fazer qualquer alteração no projeto.

## Quem somos

- **Dose de Growth (DDG)**: Agência que desenvolve automações e IA para clientes (`dosedegrowth@gmail.com`)
- **Lucas Cassiano**: Dev principal, dono da DDG
- **Projeto**: SaaS interno multi-tenant pra gerir anúncios pagos (Meta + Google Ads) dos clientes da DDG, com IA de relatórios/anomalias + view whitelabel pública

## Stack

- **Next.js 16** (App Router · Turbopack · **NÃO é o Next que você conhece** — leia AGENTS.md e `node_modules/next/dist/docs/` antes de escrever código)
- **TypeScript** estrito
- **Tailwind v4** (CSS-first config)
- **shadcn/ui** + Framer Motion + lucide-react
- **Supabase** PostgreSQL + RLS + Edge Functions (Deno) + pg_cron + pg_net
- **Anthropic Claude Haiku 4.5** SDK (relatórios IA)
- **Vercel** (deploy do Next + cron das API routes)

## Endereços importantes

| Recurso | Endereço |
|---|---|
| Repo GitHub | `dosedegrowth-design/paineldosedegrowth` |
| Branch principal | `main` |
| Domínio produção | `https://paineltrafego.dosedegrowth.com.br` (alias do Vercel) |
| Vercel project | `dose-de-growths-projects/paineldosedegrowth` |
| Supabase project | `hkjukobqpjezhpxzplpj` (DDG, sa-east-1) |
| Schema | `trafego_ddg` |

## Quick start (clone novo / outra máquina)

```bash
git clone https://github.com/dosedegrowth-design/paineldosedegrowth.git
cd paineldosedegrowth
npm install
npx vercel env pull .env.local --environment production    # se tiver acesso
npm run dev
```

Verificar:
```bash
npx tsc --noEmit            # deve sair com 0 erros
npx next build              # deve compilar 26 rotas
git log --oneline -5        # último commit local == origin/main?
```

## Arquitetura essencial

```
┌─────────────────────────────────────────────────────────────────┐
│ Meta Ads API ◄── Edge Function sync-meta-ads (cron 4x/dia)       │
│ Google Ads API ◄── Edge Function sync-google-ads (sem cron ainda)│
│ Shopify Admin API ◄── Edge Function sync-shopify (cron 1h)       │
│ Webhook painel comercial ◄── /api/webhooks/painel-comercial     │
└─────────────────────────────────────────────────────────────────┘
                                ▼
                  Supabase trafego_ddg.* (10+ tabelas)
                                ▼
                Server Actions (lib/actions/*.ts)
                                ▼
              Next.js Server Components (app/(dashboard))
                                ▼
        Interno: /dashboard /clientes /campanhas /alertas etc
        Externo: /c/[slug] (whitelabel público pra cliente final)
```

### Tabelas críticas

- `clientes` — multi-tenant. UUID + slug.
- `clientes_acessos` — credenciais OAuth Meta/Google/Shopify + status_*
- `cliente_config` — config de tipo de negócio + setup_concluido
- `campanhas_snapshot` — snapshot diário Meta + Google (upsert por cliente+plataforma+campanha+data)
- `adsets_snapshot`, `ads_snapshot`, `keywords_snapshot`, `search_terms`
- `eventos_offline` — leads/vendas pra mandar via Meta CAPI + Google EC
- `anomalias` — detectadas por detect-anomalies cron
- `mudancas` — auditoria de mudanças em campanhas
- `vendas_manuais` — registros manuais do time comercial
- `relatorios` — gerados via Claude Haiku 4.5
- `shopify_pedidos`, `shopify_carrinhos_abandonados`, `shopify_clientes`, `shopify_produtos_vendidos`

### Edge Functions deployadas (Supabase)

| Função | Versão | Status | Cron |
|---|---|---|---|
| `sync-meta-ads` | v2 | ACTIVE | `0 9,15,21,3 * * *` (4x/dia) |
| `sync-google-ads` | v1 | ACTIVE | ⚠️ **SEM CRON** (criar) |
| `sync-shopify` | v1 | ACTIVE | `0 * * * *` (1h) |
| `detect-anomalies` | v2 | ACTIVE | `0 10 * * *` (diário) |
| `push-offline-conversions` | v1 | ACTIVE | `*/30 * * * *` (30min) |
| `track-change-impact` | v1 | ACTIVE | sem cron |

Listar cron ativos: `SELECT jobname, schedule, active FROM cron.job WHERE jobname LIKE 'trafego_ddg_%';`

### Env vars necessárias

**No Vercel (production):**
- `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `META_APP_ID`, `META_APP_SECRET`
- `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`
- `GOOGLE_ADS_DEVELOPER_TOKEN` (= `ELFSpVDgQdhE73Q9w07I_g`)
- `GOOGLE_ADS_LOGIN_CUSTOMER_ID` (= `5131943362`, MCC DDG)
- `WEBHOOK_HMAC_SECRET`
- `SHOPIFY_APP_CLIENT_ID` (= `15cbb5c3d1fa336cfdaa91e9fb268155`)
- `SHOPIFY_APP_CLIENT_SECRET` (chave secreta `shpss_...` do Dev Dashboard)
- `ANTHROPIC_API_KEY` (**pendente** — sem isso /relatorios não gera)
- `NEXT_PUBLIC_APP_URL`

**No Supabase Edge Functions secrets** (separado das envs Vercel):
- Settings → Functions → Manage secrets
- ⚠️ **PENDENTE**: copiar do Vercel pra cá os 4 secrets Google:
  - `GOOGLE_OAUTH_CLIENT_ID`
  - `GOOGLE_OAUTH_CLIENT_SECRET`
  - `GOOGLE_ADS_DEVELOPER_TOKEN`
  - `GOOGLE_ADS_LOGIN_CUSTOMER_ID`
- Sem isso `sync-google-ads` retorna `{"error":"Faltam secrets no Supabase"}`

## Clientes ativos (estado em 19/mai/2026)

| Cliente | Tipo | Meta | Google | Shopify |
|---|---|---|---|---|
| **Petderma** | lead_whatsapp | ✅ conectado (172 rows, R$5k+, 303 conv) | ✅ OAuth feito mas **sync nunca rodou** (0 rows) | N/A |
| **Marina Saleme** | ecommerce | ✅ conectado mas conta só boosta posts Instagram (zero entrega) | ❌ não conectado | ⚠️ Dev Dashboard configurado, OAuth em construção |

## 🚧 TODO / Pendências críticas

Lê isso antes de começar qualquer trabalho. **Ordem de prioridade:**

### 1. Configurar 4 secrets Google no Supabase
Sem isso, `sync-google-ads` não roda. Vai em `https://supabase.com/dashboard/project/hkjukobqpjezhpxzplpj/settings/functions` → Manage secrets → adiciona os 4 do Google (valores no Vercel env, mascarados pela CLI — Lucas precisa pegar manualmente).

Depois testar:
```bash
curl -X POST "https://hkjukobqpjezhpxzplpj.supabase.co/functions/v1/sync-google-ads" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhranVrb2JxcGplemhweHpwbHBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1NTQ1MzgsImV4cCI6MjA2MjEzMDUzOH0.WK1_e0m2AkAq8yGFv3d_tKqDIzi72yoQ_lwoyDx8kcQ" \
  -d '{"cliente_id":"02c8629f-b81d-46cd-a002-572b818711f9","days_back":30}'
```
Sucesso esperado: `{"status":"ok","total_clientes":1,"sucesso":1,...,"results":[{"ok":true,"campanhas":X,"insight_rows":Y}]}`

### 2. Criar cron Google 4x/dia
Após (1) funcionar:
```sql
SELECT cron.schedule(
  'trafego_ddg_sync_google',
  '0 8,14,20,2 * * *',
  $$
  SELECT net.http_post(
    url := 'https://hkjukobqpjezhpxzplpj.supabase.co/functions/v1/sync-google-ads',
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key')),
    body := '{}'::jsonb
  );
  $$
);
```

### 3. Solicitar Acesso padrão no Google Ads API
Lucas ainda tá em "Acesso básico" no dev token. Limita a 15k operações/dia. Pra produção precisa "Acesso padrão". Link: Google Ads UI → Tools → API Center → "Solicitar acesso padrão". Aprovado em 24-72h.

### 4. Finalizar OAuth Shopify Marina
- Lucas já criou app "Painel DDG" no Dev Dashboard novo do Shopify (Client ID `15cbb5c3d1fa336cfdaa91e9fb268155`).
- ⚠️ **Falta registrar redirect URL no app:** `https://paineltrafego.dosedegrowth.com.br/api/oauth/shopify/callback`
  - No Dev Dashboard → Painel DDG → Versões → Criar versão → preenche "URLs de redirecionamento" → Lançar
- ⚠️ **Falta adicionar 2 env vars no Vercel:**
  - `SHOPIFY_APP_CLIENT_ID = 15cbb5c3d1fa336cfdaa91e9fb268155`
  - `SHOPIFY_APP_CLIENT_SECRET = <chave secreta do app, começa com shpss_>`
- Depois Lucas vai em `/clientes/marina-saleme`, card Shopify, tab "OAuth (recomendado)", digita `marinasaleme-estamparia` e clica "Autorizar via Shopify".

### 5. ANTHROPIC_API_KEY no Vercel
Sem isso `/relatorios` falha graciosamente com "ANTHROPIC_API_KEY não configurado". `lib/actions/relatorios.ts` espera essa env.

### 6. Marina Saleme: integrar dado real
Hoje ela tem 72 rows Meta mas TODOS com investimento 0 — porque ela só boosta posts do Instagram (LINK_CLICKS), Meta API não devolve insights desse tipo. A solução **é Shopify integrado** (item 4) — aí o ROAS/receita vem da loja, não do pixel.

## Regras de trabalho neste projeto

### Dev local
- `npm run dev` — Next 16 com Turbopack
- `npx tsc --noEmit` — type check (manter sempre 0 erros)
- `npx next build` — build local (sempre testar antes de commit grande)

### Git
- Branch `main` é a verdade. Sem feature branches longa duração.
- Commit com Co-Authored-By:
  ```
  Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
  ```
- `git add` arquivo por arquivo (NÃO `git add -A` em commits grandes — evita pegar lixo)
- Sempre `git push origin main` depois de commit

### Edge Functions
- Local em `supabase/functions/<nome>/index.ts`
- Deploy via MCP `deploy_edge_function` (Supabase Management API)
- Use `Deno.serve()` + `jsr:@supabase/supabase-js@2`
- Service role bypassa RLS por padrão — usar nos crons

### Server Actions
- `lib/actions/*.ts` com `"use server"` no topo
- Sempre validar input com Zod
- Retornar `{ ok: true, ... } | { ok: false, error: string }`

### UI
- Componentes em `components/*` (kebab-case files, PascalCase exports)
- Tailwind v4 + shadcn/ui já configurados
- Cor primária DDG: `#F15839` (laranja)
- Whitelabel de cliente usa `--brand-color` CSS var (`cor_primaria` da tabela `clientes`)

## Como testar mudanças em produção

```bash
# Build local (catch type errors)
npx next build

# Commit + push
git add <arquivos>
git commit -m "..."
git push origin main

# Vercel auto-deploya em ~1-2min
# Acompanhar em https://vercel.com/dose-de-growths-projects/paineldosedegrowth
```

## Padrões importantes (gotchas conhecidos)

- **Vercel env vars** são separadas das **Supabase Edge Function secrets**. Edge Functions NÃO leem das envs do Vercel. Tem que duplicar.
- **OAuth Google reauthorize**: Quando user reautoriza app já conectado, Google NÃO retorna `refresh_token` por padrão (mesmo com `prompt=consent`). Solução: botão "Trocar conta" abre modal usando `google_recursos_disponiveis` já salvo no banco, sem refazer OAuth. Botão "Re-listar contas" atualiza a lista usando o refresh_token existente.
- **Apps Shopify custom legacy** foram aposentados em 1/jan/2026. Custom Apps agora são via Dev Dashboard novo (precisa OAuth completo, não dá pra `install_custom_app` direto).
- **Marina Saleme posts boostados Instagram**: Meta Marketing API não devolve insights de campanhas LINK_CLICKS criadas via app do Instagram (botão "Promover"). Solução é integrar Shopify direto pra puxar receita real.
- **Acesso básico Google Ads API**: 15k operações/dia, 1k GETs de conta/dia. Pra produção precisa "Acesso padrão".

## Documentação relacionada

- `AGENTS.md` — regra crítica sobre Next.js 16 (não confiar em training data)
- `README.md` — descrição mais alto-nível do projeto
- `supabase/migrations/` — migrations aplicadas em ordem
