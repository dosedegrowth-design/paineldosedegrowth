# DUMP DE CONTEXTO — Tráfego DDG (Painel de Performance de Anúncios)
Gerado em: 2026-07-21
Fonte: banco Supabase ao vivo (project `hkjukobqpjezhpxzplpj`, schema `trafego_ddg`) + CLAUDE.md/AGENTS.md do repo + histórico git.
Objetivo: passagem de contexto para continuar o trabalho em outro chat/máquina.

> IMPORTANTE sobre datas: o CLAUDE.md do repo foi escrito em ~19/mai/2026 e está DESATUALIZADO em vários números. Este dump usa os NÚMEROS AO VIVO do banco (dados até 03/jul/2026) como verdade. Onde o CLAUDE.md diverge, está anotado "(CLAUDE.md dizia X — desatualizado)".

---

## 1. IDENTIDADE / ORGANIZAÇÃO

- **Agência:** Dose de Growth (DDG) — `dosedegrowth@gmail.com`
- **Dev principal / dono:** Lucas Cassiano
- **Produto:** SaaS interno multi-tenant para gerir anúncios pagos (Meta + Google Ads) de clientes da DDG, com IA de relatórios/anomalias + view whitelabel pública `/c/[slug]`.

### Endereços / infra
| Recurso | Valor |
|---|---|
| Repo GitHub | `dosedegrowth-design/paineldosedegrowth` |
| Branch principal | `main` |
| Branch deste trabalho | `claude/context-dump-migration-sy677g` |
| Domínio produção | `https://paineltrafego.dosedegrowth.com.br` (alias Vercel) |
| Vercel project | `dose-de-growths-projects/paineldosedegrowth` |
| Supabase project | `hkjukobqpjezhpxzplpj` (região sa-east-1) |
| Schema Postgres | `trafego_ddg` |
| Cor primária DDG | `#F15839` (laranja) |

### Stack
Next.js 16 (App Router, Turbopack) · TypeScript estrito · Tailwind v4 (CSS-first) · shadcn/ui + Framer Motion + lucide-react · Supabase (PostgreSQL + RLS + Edge Functions Deno + pg_cron + pg_net) · Anthropic Claude Haiku 4.5 (relatórios) · Deploy na Vercel.

### Credenciais estruturais (NÃO são segredos — IDs públicos)
- Google Ads Developer Token: `ELFSpVDgQdhE73Q9w07I_g` (em **Acesso básico** — limite 15k operações/dia)
- Google Ads MCC (login_customer_id DDG): `5131943362`
- Shopify App "Painel DDG" Client ID: `15cbb5c3d1fa336cfdaa91e9fb268155`
- Anon key Supabase (usada nos curls de teste): `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhranVrb2JxcGplemhweHpwbHBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1NTQ1MzgsImV4cCI6MjA2MjEzMDUzOH0.WK1_e0m2AkAq8yGFv3d_tKqDIzi72yoQ_lwoyDx8kcQ`

---

## 2. CLIENTES TRABALHADOS (com todos os IDs exatos)

Só existem **2 clientes cadastrados** na tabela `clientes`. Ambos `ativo=true`.

### 2.1 PETDERMA
- **cliente_id (UUID):** `02c8629f-b81d-46cd-a002-572b818711f9`
- **slug:** `petderma` → view pública `/c/petderma`
- **Tipo de negócio:** `lead_whatsapp`
- **Moeda:** BRL
- **cor_primaria:** `#00ff91` · **cor_secundaria:** `#E3D4A6`
- **cac_maximo / ticket_medio:** ambos `null` (não configurados)
- **Criado em:** 2026-05-04 01:25 UTC

**Meta Ads (status = conectado):**
- **Ad Account:** `act_1856518087872503` (nome "Pet Derma", BRL, status 1=ativo)
- **Business Manager (BM):** `242472956332833` (nome "Pet Derma")
- **Page ID:** `110616205791746` ("PetDerma - A pele do seu pet em boas mãos.", Pet shop)
  - Instagram business account vinculado: `17841400484703421`
- **Pixel:** `meta_pixel_id` está **null** no registro (pixel não fixado; ver observação Petderma)
- **meta_conversion_action_id:** null
- Tem token Meta long-lived salvo: SIM
- **Última sync Meta:** 2026-07-03 15:00 UTC · status `success`
- Há também no BM Pet Derma a conta `act_1347988785235453` ("Dr. Douglas Bessa", pixel `188438088274334` "Pixel de Douglas Bessa") — mesma BM, contexto do cliente.

**Google Ads (status = conectado, mas SEM DADOS):**
- **google_customer_id:** `5017738101`
- **google_login_customer_id (MCC):** `5131943362`
- Tem refresh_token OAuth salvo: SIM
- **google_conversion_action_id:** null
- **Última sync Google:** 2026-05-16 14:47 UTC — mas **0 linhas** em `campanhas_snapshot` para Google. OAuth feito, mas o sync **nunca entregou dado**.
- `google_recursos_disponiveis`: lista 2 customers — MCC `5131943362` "DD Growth" (manager) e `5017738101` (status UNKNOWN, não-manager).

**Shopify / Painel comercial:** não conectado (N/A — é lead gen).

### 2.2 MARINA SALEME
- **cliente_id (UUID):** `4dfe5517-4331-4b8a-8a31-966d43511098`
- **slug:** `marina-saleme` → view pública `/c/marina-saleme`
- **Tipo de negócio:** `ecommerce`
- **Moeda:** BRL
- **cor_primaria:** `#ffffff` · **cor_secundaria:** `#E3D4A6`
- **cac_maximo / ticket_medio:** ambos `null`
- **Criado em:** 2026-05-04 14:41 UTC

**Meta Ads (status = conectado):**
- **Ad Account:** `act_782476046702053` (nome "Marina Saleme - 02", BRL, status 1=ativo)
- **Business Manager (BM):** `653641474986954` (nome "Marina Saleme [ESTAMPARIA]")
- **Page ID:** `1889497158006770` ("Marina Saleme Estamparia", Vestuário)
  - Instagram business account vinculado: `17841401651522338`
- **meta_pixel_id:** null no registro. (No inventário existe o pixel `3744914555533806` "Pixel-MarinaSaleme" ligado à OUTRA conta da mesma BM: `act_10150188564343955` "MarinaSaleme", que é USD.)
- Tem token Meta long-lived salvo: SIM
- **Última sync Meta:** 2026-07-03 15:01 UTC · status `success`
- Nota: a BM `653641474986954` tem 2 contas — `act_10150188564343955` "MarinaSaleme" (USD) e `act_782476046702053` "Marina Saleme - 02" (BRL). O painel está usando a **-02 (BRL)**, que é a que tem campanhas com entrega real.

**Google Ads:** não conectado (`google_customer_id` = null, sem refresh_token).
**Shopify:** não conectado (`status_shopify` = nao_conectado, sem token, sem shop_domain). OAuth em construção — ver pendências.
**Painel comercial:** não conectado.

---

## 3. NÚMEROS DE PERFORMANCE (ao vivo, `campanhas_snapshot`)

Janela de dados: **2026-04-16 a 2026-07-03** (para os dois clientes; Meta).

### PETDERMA (Meta)
| Métrica | Valor |
|---|---|
| Linhas de snapshot | 706 |
| Investimento total | R$ 10.091,96 |
| Impressões | 1.450.909 |
| Cliques | 7.407 |
| Conversões | 536 |
| Receita | R$ 0,00 (é lead gen — sem receita monetária no snapshot) |
| CPA médio | **R$ 18,83** |
| Google | 0 linhas (sync nunca rodou de fato) |

> CLAUDE.md (19/mai) dizia "172 rows, R$5k+, 303 conv" — desatualizado; os números acima são os atuais.

### MARINA SALEME (Meta)
| Métrica | Valor |
|---|---|
| Linhas de snapshot | 1.850 |
| Investimento total | R$ 14.053,44 |
| Impressões | 688.816 |
| Cliques | 22.157 |
| Conversões | 77 |
| Receita | R$ 126.948,28 |
| CPA médio | **R$ 182,51** |
| ROAS implícito | ~9,0 (126.948 / 14.053) |

> IMPORTANTE — divergência com CLAUDE.md: o CLAUDE.md dizia que a Marina "só boosta posts do Instagram (LINK_CLICKS), zero entrega, todos os 72 rows com investimento 0". Isso NÃO reflete mais o banco: a conta em uso agora é `act_782476046702053` (BRL, "-02"), que tem **1.850 linhas com investimento e receita reais** (R$14k gasto, R$126,9k receita, 77 conversões). Ou seja, a integração de e-commerce da Marina passou a ter dado real via Meta — validar com o Lucas se isso veio de Shopify/pixel ou de campanhas de conversão novas na conta -02.

---

## 4. ANOMALIAS DETECTADAS (`anomalias`, total 319 linhas)

Detectadas pelo cron `detect-anomalies` (diário). Resumo por cliente/tipo/severidade:

**Marina Saleme** (janela 2026-05-17 → 2026-07-03):
- conversões / crítica: 36
- cpa / crítica: 36
- investimento / crítica: 31
- ctr / crítica: 12
- roas / crítica: 10 (2026-05-31 → 2026-06-09)
- investimento / alta: 6 · ctr / alta: 5 · ctr / média: 4 · ctr / baixa: 4 · investimento / média: 1

**Petderma** (janela 2026-05-16 → 2026-07-03):
- investimento / crítica: 35
- conversões / crítica: 33
- cpa / crítica: 28
- ctr / crítica: 20
- ctr / média: 7 · ctr / alta: 7 · investimento / alta: 7
- cpa / baixa: 6 · investimento / média: 6 · cpa / alta: 6
- conversões / baixa: 5 · ctr / baixa: 5 · cpa / média: 5 · conversões / alta: 4

(Muitas "críticas" recorrentes indicam thresholds de alerta provavelmente calibrados de forma sensível demais — vale revisar a config de severidade.)

---

## 5. INFRA DE DADOS — TABELAS E CONTAGENS (schema `trafego_ddg`)

| Tabela | Linhas | RLS |
|---|---|---|
| clientes | 2 (query direta; list_tables mostra 0 por cache) | on |
| clientes_acessos | 2 | on |
| campanhas_snapshot | 2.556 | on |
| adsets_snapshot | 662 | on |
| ads_snapshot | 32.915 | on |
| keywords_snapshot | 0 | on |
| search_terms | 0 | on |
| anomalias | 319 | on |
| mudancas | 0 | on |
| eventos_offline | 0 | on |
| relatorios | 0 | on |
| relatorios_prompts | 0 | on |
| logs | 483 | on |
| config_global | 0 | **RLS DESLIGADO** ⚠️ |
| config_alertas | 0 | on |
| vendas_manuais | 0 | on |
| leads_whatsapp | 0 | on |
| carrinhos_abandonados | 0 | on |
| cliente_config | 0 | on |
| shopify_pedidos / produtos_vendidos / carrinhos_abandonados / clientes | 0 cada | on |
| clientes_users | 0 | on |

⚠️ **Alerta de segurança (Supabase advisor):** `trafego_ddg.config_global` está com **Row Level Security DESLIGADO** — exposta a anon/authenticated. Remediação (decidir políticas antes de rodar): `ALTER TABLE trafego_ddg.config_global ENABLE ROW LEVEL SECURITY;` — mas hoje a tabela tem 0 linhas, então baixo risco imediato.

---

## 6. EDGE FUNCTIONS & CRONS (estado ao vivo)

### Crons ativos (`cron.job`, prefixo `trafego_ddg`)
| jobname | schedule | active |
|---|---|---|
| trafego_ddg_sync_meta | `0 9,15,21,3 * * *` (4x/dia) | true |
| trafego_ddg_detect_anomalies | `0 10 * * *` (diário) | true |
| trafego_ddg_push_offline_conversions | `*/30 * * * *` (30min) | true |
| trafego_ddg_sync_shopify | `0 * * * *` (1h) | true |
| **trafego_ddg_sync_google** | **NÃO EXISTE** ⚠️ | — |

### Saúde das execuções (`cron.job_run_details`, últimos 25 dias)
- `sync_meta`: **succeeded**, última 2026-07-21 15:00 — MAS ver alerta abaixo.
- `detect_anomalies`: succeeded, última 2026-07-21 10:00.
- `push_offline_conversions`: succeeded (1199x), 1 failed em 2026-07-07.
- `sync_shopify`: **failed** — falha de hora em hora (600 falhas). Esperado: Shopify não conectado / secrets ausentes.

### ⚠️ ACHADO CRÍTICO (não estava documentado em lugar nenhum)
**A sincronização Meta está QUEBRADA desde 03/jul/2026 (~18 dias), mesmo com o cron "succeeded".**
- O pg_cron reporta `sync_meta` como succeeded porque o `net.http_post` **despacha** com sucesso (retorna request_id) — ele NÃO valida o resultado da Edge Function.
- Mas: os dados em `campanhas_snapshot` param em **2026-07-03**, os `logs` de `sync_meta`/`detect_anomalies` param em **2026-07-03**, e `ultima_sync_meta` dos dois clientes é **2026-07-03 15:00/15:01**.
- Conclusão provável: a Edge Function `sync-meta-ads` passou a **falhar internamente** (ou o token Meta long-lived expirou / permissão revogada) por volta de 03/jul, e ninguém percebeu porque o cron continua "verde". **Investigar primeiro isto ao retomar** (ver logs da função via `mcp Supabase get_logs` / dashboard).

### Edge Functions (conforme CLAUDE.md — confirmar versões no dashboard)
| Função | Ver | Cron |
|---|---|---|
| sync-meta-ads | v2 | 4x/dia (mas ver achado crítico) |
| sync-google-ads | v1 | **sem cron** |
| sync-shopify | v1 | 1h (falhando) |
| detect-anomalies | v2 | diário |
| push-offline-conversions | v1 | 30min |
| track-change-impact | v1 | sem cron |

Padrão das Edge Functions: `Deno.serve()` + `jsr:@supabase/supabase-js@2`; service role bypassa RLS; local em `supabase/functions/<nome>/index.ts`; deploy via MCP `deploy_edge_function`.

---

## 7. LINHA DO TEMPO (execuções, `logs` — cronológico)

Todas as execuções registradas foram bem-sucedidas (`todos_ok=true`), até o corte de 03/jul.

- **2026-05-04:** cadastro dos 2 clientes (Petderma 01:25, Marina 14:41).
- **2026-05-16:** primeiro `sync_meta` (10 execuções no dia) + `detect_anomalies` começam a rodar. Snapshots de dados começam em 16/abr (backfill). Google: `ultima_sync_google` 16/mai, porém 0 linhas gravadas.
- **2026-05-16 → 2026-07-03:** operação estável e diária:
  - `sync_meta`: 8 execuções/dia (2 clientes × 4 janelas) — ~batendo o cron 4x/dia.
  - `detect_anomalies`: 2 execuções/dia.
  - (26/mai teve só 4 syncs; 05/jun 1 detect — pequenas variações.)
- **2026-07-03 15:00/15:01:** ÚLTIMO sync_meta que gravou dados. Depois disso, silêncio nos logs (ver achado crítico §6).
- **2026-07-07 15:30:** 1 falha isolada de `push_offline_conversions`.
- **2026-07-21 (hoje):** cron ainda dispara sync_meta (15:00) e detect_anomalies (10:00) como "succeeded", mas sem novos dados/logs desde 03/jul; sync_shopify falhando de hora em hora.

> Observação: o repositório git também acumulou muitos entregáveis paralelos (sites/relatórios de outros projetos — Climafrio/"andre", apostila Tayssa, relatório @1.tayssa, etc.) — ver §9. Esses NÃO fazem parte do painel de tráfego em si; são artefatos que moram no mesmo repo.

---

## 8. DECISÕES E REGRAS DE TRABALHO DEFINIDAS

### Git
- `main` é a verdade; sem feature branches de longa duração.
- Commits com trailer `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>`.
- `git add` arquivo por arquivo em commits grandes (nunca `git add -A` — evita pegar lixo).
- Sempre `git push origin main` depois de commit.

### Server Actions
- `lib/actions/*.ts` com `"use server"` no topo.
- Validar input com **Zod** sempre.
- Retorno padronizado: `{ ok: true, ... } | { ok: false, error: string }`.

### UI
- Componentes em `components/*` (arquivos kebab-case, exports PascalCase).
- Tailwind v4 + shadcn/ui.
- Whitelabel do cliente usa CSS var `--brand-color` a partir de `cor_primaria` da tabela `clientes`.

### Next.js 16 (REGRA CRÍTICA do AGENTS.md)
- **NÃO é o Next.js do training data.** Há breaking changes de API/convenções/estrutura. **Ler `node_modules/next/dist/docs/`** e a doc relevante ANTES de escrever qualquer código. Respeitar avisos de deprecation.

### Gotchas conhecidos (regras aprendidas)
1. **Vercel env vars ≠ Supabase Edge Function secrets.** Edge Functions NÃO leem as envs do Vercel; tem que duplicar manualmente em Settings → Functions → Manage secrets.
2. **OAuth Google reauthorize:** ao reautorizar app já conectado, o Google NÃO devolve `refresh_token` por padrão (mesmo com `prompt=consent`). Solução: botão "Trocar conta" abre modal usando `google_recursos_disponiveis` já salvo (sem refazer OAuth); botão "Re-listar contas" atualiza a lista usando o refresh_token existente.
3. **Apps Shopify custom legacy** foram aposentados em 01/jan/2026. Custom Apps agora exigem OAuth completo via Dev Dashboard novo (não dá `install_custom_app` direto).
4. **Marina posts boostados Instagram:** Meta Marketing API não devolve insights de campanhas LINK_CLICKS criadas via botão "Promover" do Instagram. Solução planejada: integrar Shopify para puxar receita real. (Nota: a conta -02 em uso já apresenta dados de entrega — reconfirmar.)
5. **Acesso básico Google Ads API:** 15k operações/dia, 1k GETs de conta/dia. Produção precisa "Acesso padrão".

### Comandos de verificação (quick start)
```bash
npx tsc --noEmit        # deve sair com 0 erros
npx next build          # deve compilar ~26 rotas
npm run dev             # Next 16 + Turbopack
```

---

## 9. HISTÓRICO GIT RECENTE (branch atual: claude/context-dump-migration-sy677g)

Últimos commits em `main` (via `git log --oneline`):
```
ef0ad9e docs(disparador): prompt de arranque pro dev novo colar no Claude Code
8ace47d docs(disparador): runbook completo de handoff pro time
90b6f5f Apostila Tayssa: corrige renderização em leitores de PDF mobile
45874fa Apostila Tayssa: redesign editorial completo
6e5f617 middleware: libera rota pública /apostilas (PDF/HTML compartilháveis)
e5ab5eb Apostila Tayssa: imagens didáticas das técnicas + PDF A4
9dad311 Apostila profissional de extensão de cílios — Tayssa Lash Designer (@1.tayssa)
b9d1dc2 docs: arquivo completo da sessão de construção do site Climafrio
... (vários commits de sites/relatórios "andre"/Climafrio, hero 3D, 21st.dev, etc.)
```
Nota: já existe um "runbook completo de handoff pro time" (commit 8ace47d) e um "prompt de arranque pro dev novo" (ef0ad9e) no repo — vale ler junto com este dump.

---

## 10. PENDÊNCIAS EM ABERTO (ordem de prioridade)

### 🔴 P0 — Sync Meta quebrado desde 03/jul (NOVO, achado neste dump)
Nenhum dado novo desde 2026-07-03 apesar do cron "succeeded". Investigar `sync-meta-ads` (logs da Edge Function, validade do token Meta long-lived dos 2 clientes, permissões da BM). Até resolver, o painel mostra dados com ~18+ dias de atraso.

### 🔴 P0 — Sync Shopify falhando de hora em hora
`trafego_ddg_sync_shopify` acumula falhas (600). Esperado enquanto Shopify não estiver conectado + secrets ausentes, mas está poluindo o histórico e consumindo execuções. Ou conectar (item abaixo) ou desativar o cron até lá.

### 1. Configurar 4 secrets Google no Supabase Edge Functions
Sem eles, `sync-google-ads` retorna `{"error":"Faltam secrets no Supabase"}`. Adicionar em `https://supabase.com/dashboard/project/hkjukobqpjezhpxzplpj/settings/functions` → Manage secrets:
- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRET`
- `GOOGLE_ADS_DEVELOPER_TOKEN` (= `ELFSpVDgQdhE73Q9w07I_g`)
- `GOOGLE_ADS_LOGIN_CUSTOMER_ID` (= `5131943362`)

Teste após configurar:
```bash
curl -X POST "https://hkjukobqpjezhpxzplpj.supabase.co/functions/v1/sync-google-ads" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <anon key>" \
  -d '{"cliente_id":"02c8629f-b81d-46cd-a002-572b818711f9","days_back":30}'
```
Sucesso esperado: `{"status":"ok","total_clientes":1,"sucesso":1,...,"results":[{"ok":true,"campanhas":X,"insight_rows":Y}]}`

### 2. Criar cron Google 4x/dia (depois do item 1 funcionar)
```sql
SELECT cron.schedule(
  'trafego_ddg_sync_google',
  '0 8,14,20,2 * * *',
  $$
  SELECT net.http_post(
    url := 'https://hkjukobqpjezhpxzplpj.supabase.co/functions/v1/sync-google-ads',
    headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key')),
    body := '{}'::jsonb
  );
  $$
);
```

### 3. Solicitar Acesso padrão no Google Ads API
Token está em "Acesso básico" (15k ops/dia). Para produção: Google Ads UI → Tools → API Center → "Solicitar acesso padrão". Aprovação 24-72h.

### 4. Finalizar OAuth Shopify da Marina
- App "Painel DDG" já criado no Dev Dashboard novo (Client ID `15cbb5c3d1fa336cfdaa91e9fb268155`).
- **Falta registrar redirect URL no app:** `https://paineltrafego.dosedegrowth.com.br/api/oauth/shopify/callback` (Dev Dashboard → Painel DDG → Versões → Criar versão → "URLs de redirecionamento" → Lançar).
- **Falta adicionar 2 env vars no Vercel:** `SHOPIFY_APP_CLIENT_ID = 15cbb5c3d1fa336cfdaa91e9fb268155` e `SHOPIFY_APP_CLIENT_SECRET = <shpss_...>`.
- Depois: `/clientes/marina-saleme` → card Shopify → tab "OAuth (recomendado)" → digitar `marinasaleme-estamparia` → "Autorizar via Shopify".

### 5. ANTHROPIC_API_KEY no Vercel
Sem ela, `/relatorios` falha graciosamente ("ANTHROPIC_API_KEY não configurado"). `lib/actions/relatorios.ts` espera essa env. (Tabela `relatorios` está com 0 linhas — nada gerado ainda.)

### 6. Marina Saleme: dado real / Shopify
Historicamente ela só boostava posts (sem insights). A conta `-02` já apresenta dados reais no banco — **confirmar a origem** (pixel/campanhas de conversão vs Shopify) e concluir a integração Shopify (item 4) para ROAS/receita virem da loja.

### 7. Petderma Google: 0 linhas
OAuth conectado (`5017738101`) mas sync nunca gravou. Depende dos itens 1-2. Após configurar, rodar o curl de teste com o cliente_id do Petderma.

### 8. (Opcional) config_alertas / severidade de anomalias
Muitas anomalias "críticas" recorrentes (§4) sugerem thresholds sensíveis demais. `config_alertas` está vazia — calibrar.

### 9. Envs Vercel a garantir (production)
`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `META_APP_ID`, `META_APP_SECRET`, `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_ADS_DEVELOPER_TOKEN`, `GOOGLE_ADS_LOGIN_CUSTOMER_ID`, `WEBHOOK_HMAC_SECRET`, `SHOPIFY_APP_CLIENT_ID`, `SHOPIFY_APP_CLIENT_SECRET`, `ANTHROPIC_API_KEY` (pendente), `NEXT_PUBLIC_APP_URL`.

---

## 11. APÊNDICE — INVENTÁRIO COMPLETO DE ATIVOS META DISPONÍVEIS

O token Meta salvo (recursos_disponiveis) enxerga TODO o portfólio da agência/Lucas — 70+ ad accounts, 60+ páginas, 7 pixels. Abaixo o inventário completo para referência (NÃO são todos "clientes do painel" — só Petderma e Marina estão no painel). Útil para futuros onboardings.

### 11.1 Pixels (7)
| Pixel ID | Nome | Ad Account |
|---|---|---|
| 3744914555533806 | Pixel-MarinaSaleme | act_10150188564343955 |
| 812564605476088 | Gráfica Promopress's Pixel | act_1478029342464221 |
| 1512285015735857 | DmaisUm | act_147008762314925 |
| 188438088274334 | Pixel de Douglas Bessa | act_1347988785235453 |
| 1568790033267431 | Pixel de mu | act_1339895406080725 |
| 140044781482749 | Biscotteriapixelfb | act_481537622431529 |
| 242103750524902 | Pixel Feel King | act_1315817875275653 |

### 11.2 Ad Accounts (por Business Manager) — 70+ contas
(account_status: 1=ativo, 2=desativado, 3=fechado/pendente, 101=com problema/limitado)

**BM 242472956332833 — Pet Derma:** act_1856518087872503 "Pet Derma" (BRL,1) · act_1347988785235453 "Dr. Douglas Bessa" (BRL,1)
**BM 653641474986954 — Marina Saleme [ESTAMPARIA]:** act_10150188564343955 "MarinaSaleme" (USD,1) · act_782476046702053 "Marina Saleme - 02" (BRL,1)
**BM 422105221677256 — Feel King Barbearia:** act_1315817875275653 "feel king" (BRL,1) · act_269445504883191 "Feek King 2" (BRL,3) · act_319861333103582 "Feel King Moema" (BRL,1) · act_851347752253895 "Marcelo Jr | Feel King" (BRL,1) · act_4850499568507768 "FK Visagismo" (BRL,1)
**BM 429135974289538 — Grupo Caraiga:** act_402691011609634 "Volkswagen Caraigá" (BRL,1) · act_487105086299045 "Audi Caraigá" (BRL,2) · act_642025866853782 "Audi Caraigá" (BRL,1) · act_713572650088670 "Caraigá | Audi" (BRL,1) · act_1586503138416006 "Caraigá | Volkswagen" (BRL,1)
**BM 447611519673642 — HERC Construtora:** act_585268502434450 "HERC - HABITAT" (BRL,1) · act_946099159902229 "HERC Topázio Cupecê" (BRL,1) · act_2384447405075896 "HERC - QUARTZO IMIRIM" (BRL,1)
**BM 427557748101619 — Super Visão Vistorias (várias contas Read-Only, USD):** act_911443094935038 · act_1394446789001868 · act_1984622679066707 · act_908898938448783 · act_1169415095393506 (SAC) · act_1372482794282842
**BM 5811268688950075 — supervisaobrasilia:** act_440209522082875 "CA01" (BRL,1) · act_1003037244839405 "CA02" (BRL,1) · act_3016418658564463 "Super Visão Brasilia SIA" (BRL,1)
**BM 1339698706100395 — MultiPark:** act_1339895406080725 "Multipark Oficial" (BRL,1) · act_1339729109430688 "MultiPark" (BRL,101)
**BM 286819071907320 — Dmais 1 Agência BM1:** act_147008762314925 "DmaisUm" (BRL,1) · act_824269340157828 "Mult Park Matriz - Conta Nova" (BRL,1)
**BM 1634166280360845 — Danilo Macedo:** act_1393862358830988 "Danilo Visagismo - 02" (BRL,1) · act_816208737688642 "Danilo Visagismo - 01" (BRL,3)
**BM 289685856342789 — BM3:** act_422618765882933 "Repasse Novo" (BRL,3) · act_1254967009602006 "CA - 01 - Confeitaria" (BRL,1)
**BM 301418973811698 — Jonas Nevola:** act_247646830745308 "Nevola Ink" (BRL,101) · act_1032893144264325 "Nevola Ink 2024" (BRL,1)
**BM 768092247702635 — Marcos Monteiro Imóveis:** act_575833524254113 (BRL,1) · act_787426712245077 "- 02" (BRL,1)
**BM 808476619717888 — DD Growth:** act_426941281805732 "DD Growth" (BRL,1) · act_3323529211115685 "VIVA EXTINTORES" (BRL,1)
**Outras BMs / contas avulsas:**
- act_1478029342464221 "Gráfica Promopress" — BM 1199623133405523 (BRL,1)
- act_1262312055735997 "X - UNY" — BM 2318459445281252 (BRL,1)
- act_364867057587799 "Juliana Jardim" (BRL,3, sem BM)
- act_481537622431529 "Biscotteria" — BM 1956276551355147 (BRL,1)
- act_389252728394327 "Cura Acessórios" — BM 656503608176352 (BRL,101)
- act_676174379872828 "Supervisão Sorocaba" — BM 172920270478503 (BRL,1)
- act_725530641553375 "Supervisão Moema" — BM 399002164230553 (BRL,1)
- act_604901760727656 "SUPER VISAO INTERLAGOS" — BM 4190234764427409 (BRL,1)
- act_657609312710073 "FWM - 02" — BM 148592654533594 (BRL,1)
- act_578548684033877 "CA - PHYSAVIE" — BM 1767424316683084 Phytos Fórmula (BRL,1)
- act_765013211715893 "Dra.Caroline Ferreira" — BM 113436718339620 (BRL,1)
- act_1658426081261980 "Loopstone - 01" — BM 1829290037173581 (BRL,1)
- act_206360562033607 "Tayssa Farias - 01" — BM 183451267890941 (BRL,1)
- act_170642632663983 "Java Móveis Planejados" — BM 229225860034015 (BRL,1)
- act_1007161733704179 "Revolution" — BM 237376754491531 revolutiontints (USD,1)
- act_683467660540028 "UNIÃO PARK PARTICIPAÇÕES" — BM 3001228326675611 (BRL,1)
- act_1480837645808793 "COMUNIDADE SGARBI" — BM 1037714104009421 (BRL,101)
- act_479791197947702 "Sgarbi 2.0 - Novo tudo" — BM 452934147183268 (BRL,1)
- act_435853238909267 "Vida Oxigenio" — BM 1298059230659774 (BRL,101)
- act_401203262664192 "Vida Oxigenio" — BM 594281946215921 (BRL,1)
- act_436747262352128 "SUPERVISAO PERDIZES" — BM 1356993751861972 (BRL,1)
- act_471032848636136 "Gunnen Shoes" — BM 1439051163632202 (BRL,1)
- act_1572702880128126 "Madame Du Vin" — BM 407748765247799 (BRL,1)
- act_593862419932416 "Aline Munueira" — BM 515594671513612 (BRL,1)
- act_1063037705602624 "Findu - Test Disc" — BM 633223126162122 (BRL,1)
- act_1371323124072822 "Carla Costa" — BM 471643602377950 (BRL,1)
- act_708699315304479 "Prime Fiiisio(01)" — BM 105114677707511 (BRL,1)
- act_2821478468054448 "VOCTOR CAMARGO 01" — BM 406520392555572 V.Camargo Advocacia (BRL,1)
- act_1031481885144230 "Fisio - Prime - Pilates" — BM 1204295504510924 (BRL,1)
- act_9555353871235393 "Bless Concept - Casa Verde 01" — BM 3620154014955492 (BRL,1)
- act_631237146716199 "SPV - Raposo - Tavares" — BM 748596590722549 (BRL,1)
- act_1233816735339134 "Super Visão Vistorias (Read-Only)" (USD,2, sem BM)
- act_2365617763906109 "Dr. Samuel Chagas 01DD" — BM 1090328490821386 (BRL,1)

### 11.3 Páginas Facebook (com Instagram vinculado, quando houver) — 60+
Principais com Instagram business account:
- 110616205791746 "PetDerma - A pele do seu pet em boas mãos." → IG 17841400484703421  **(cliente Petderma)**
- 1889497158006770 "Marina Saleme Estamparia" → IG 17841401651522338  **(cliente Marina)**
- 100993982772645 "Petderma 3" → IG 17841410883942734
- 572914019248837 "DD Growth" → IG 17841458417998598
- 248879601639146 "Lucas Cassiano Trafego Pago" → IG 17841400103942707
- 106449075700855 "Super Visão DF" → IG 17841405806164862
- 101262752678013 "Marcos Monteiro Imóveis" → IG 17841400852363534
- 437665193055085 "SuperVisão Moema" → IG 17841411391310416
- 104956281910406 "Super Visão Vistorias Interlagos 1" → IG 17841449113200468
- 208690465810948 "MultiPark" → IG 17841404051832576
- 104266120957323 "Feel King Barbearia" → IG 17841419263231913

Demais páginas (sem IG listado): Dr.samuelchagas (1090321494155419), X-UNY (774534745753838), Danilo Visagismo (780280098511568), Dmais1 (837450359441706), Bel Confeiteira (662036610335681), Petdermastore (735349429657191), Bless-Concept (653324127870109), Petdermafood (634726463062125), ADM Principal (676138202239882), FeelKing Visagismo (584771658057964), Prime Fisio (621516274371342), Dr. Carla Costa (532413566632398), Findu (525992830606767), Viva Extintores (526157243917330), Aline Munuera (528420183681907), Seu Pet Connect (352932541246587), Supervisão Auto Shopping Raposo (379764388544258), Madame Du Vin (295638760309666), Gunnen Shoes (355618830957980), V.Camargo Advocacia (222783684262578), Vida Oxigênio (269466012917575 / 212486761958803), Sgarbi (230926616762353), Multpark Confins (180457715155200), Super Visão Perdizes (129758193556674), Java Marcenaria (109034815576484), Tayssa Farias (102684609471416), LC - Lucas Cassiano (101007722959398), Dra. Caroline Ferreira (113433855006573), Hemopet (105102242430259), FWM Models (102442296023898), Soluções Rocha (103154649265155), Eusolzinho (112934154812949), THOM Quiroprata (100458239346076), SuperVisão Sorocaba (100460394826851), Loopstone (109541164973595), Super Visão Interlagos (107208755069250), CURA_acessorios (106151540753604), SOP Veículos Premium (100182152363759), Super Visão Jabaquara (997645027035699), Biscotteria Cookie & Cia. (197392626973045), Dentz Rio Preto (108033538032673), PAA Label (107380568096174), Garantido.Net (100135445436016), RevolutionTints (110371504179217), juliaanajardim (111888700737678), nevola.ink (118148886678977), HERC Construtora (111300300655858), Madameduvinoficial (105743561198387), Solufil (157915627745651), Cura (2275651566098230), Leonardo Brito (147318455965652), Fasttrans (1722861211338939), Gráfica Promopress (376299405852704).

---

FIM DO DUMP.
