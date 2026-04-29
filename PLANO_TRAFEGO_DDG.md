# PLANO TRÁFEGO DDG
**Dashboard Inteligente de Tráfego Pago para a Dose de Growth**

> Documento mestre — fonte única da verdade do projeto.
> Criado em: 2026-04-28
> Stack: Next.js 16 + Supabase + Vercel + Anthropic API
> Status: **Fase 0 — Validação**

## DECISÕES TRAVADAS (2026-04-28)

| Decisão | Valor |
|---|---|
| **Cliente piloto** | **Petderma** |
| **Identidade visual** | Brand Guidelines DDG (ver `IDENTIDADE_VISUAL.md`) |
| **Versionamento** | GitHub: `dosedegrowth-design/trafego-ddg` |
| **Deploy** | Vercel (projeto `trafego-ddg`) |
| **Domínio** | A definir depois (subdomínio Vercel default no MVP) |
| **Primeiro acesso** | **ADM GERAL** (Lucas) — único user da Fase 0/1 |
| **Stack** | Next.js 16 + Supabase + Tailwind v4 + shadcn |
| **Plataformas MVP** | Google Ads + Meta Ads |

---

## 1. OBJETIVO

Construir uma plataforma proprietária da DDG que:

1. **Substitui o trabalho manual repetitivo** dos gestores de tráfego DDG (análises diárias, relatórios, otimizações básicas)
2. **Unifica Google Ads + Meta Ads** em uma única interface operacional
3. **Aplica IA acionável** (Claude) para detectar anomalias, narrar mudanças, sugerir otimizações
4. **Entrega transparência ao cliente final** via link branded (read-only ou com permissão)
5. **Alimenta as plataformas com inteligência real** — envia conversões offline (server-side) do Painel Comercial DDG para Google/Meta, fazendo o algoritmo otimizar por quem **realmente fecha**, não só por quem vira lead
6. **Elimina dependência** de ferramentas externas pagas (cada cliente escala = mais SaaS pra pagar)

### Tese central
> *"Banco de dados próprio + IA + integração com painel comercial = inteligência que nenhuma plataforma SaaS oferece."*

---

## 2. CONTEXTO E REFERÊNCIAS

Projeto inspirado em 3 vídeos de referência analisados:

| Vídeo | Foco | O que pegamos |
|---|---|---|
| **V1 — Dashboard p/ Cliente (e-commerce BR)** | Cross-tracking via `eid`, banco próprio, comparação A/B, gerenciador embutido | Cross-tracking real, comparação A vs B drag-and-drop, banco próprio como filosofia |
| **V2 — Dashboard p/ Gestor (BR)** | Otimizações priorizadas, sugestão de ads via IA, simulador funil, relatório WhatsApp | Auditoria de search terms com bulk negative, sugestão de ads em draft, relatório IA via WhatsApp Evolution |
| **V3 — Dashboard de Agência (US, Flying Vgroup)** | 16 contas, anomaly detection, change tracker com narrativa IA, chatbot contextual | **Filosofia operacional**: IA como camada, não substituição. Anomaly detection + change tracker são o core |

### O que NÃO copiamos
- ❌ Stack Python/Flask + DigitalOcean (V3) — DDG é Next.js + Supabase + Vercel
- ❌ Vanilla JS migrando pra React (V3) — começamos em Next.js direto
- ❌ Waha local (V2) — usamos Evolution que já é infra DDG
- ❌ Funcionalidades infladas sem foco (V1) — começamos enxuto

### Diferenciais EXCLUSIVOS DDG (não estão em nenhum dos 3 vídeos)
1. **Server-side conversions** integrado ao Painel Comercial DDG
2. **Multi-projeto DDG** — um cliente pode ter Painel HL Models + Tráfego DDG conectados
3. **Stack consistente** — manutenção compartilhada com dash-supervisao, painel-hl-models, etc.

---

## 3. ARQUITETURA

### 3.1 Stack técnica

```
┌──────────────────────────────────────────────────────────────┐
│  FRONTEND                                                    │
│  Next.js 16 (App Router) + TypeScript + Tailwind v4          │
│  + shadcn/ui + Framer Motion + Recharts                      │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│  BACKEND                                                     │
│  Next.js API Routes + Server Actions                         │
│  Supabase Edge Functions (Deno) para crons e workers         │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│  DATA LAYER                                                  │
│  Supabase Postgres                                           │
│  Schema: trafego_ddg (exposto via pgrst.db_schemas)          │
│  RLS por cliente_id + role                                   │
│  Storage: PDFs de relatórios + thumbnails de criativos       │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│  INTEGRAÇÕES ENTRADA (pull)                                  │
│  - Google Ads API v17 (OAuth 2.0 + developer token)          │
│  - Meta Marketing API v22 (System User token)                │
│  - Webhook do Painel Comercial DDG (fechamentos)             │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│  INTEGRAÇÕES SAÍDA (push) ⭐ DIFERENCIAL DDG                 │
│  - Google Ads OfflineDataJobService (Enhanced Conversions)   │
│  - Meta CAPI /offline_events                                 │
│  - Evolution API (relatório WhatsApp)                        │
│  - Anthropic API (Claude Sonnet + Haiku)                     │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│  CRON JOBS (Supabase Edge Functions)                         │
│  - sync-google-ads (4x/dia: 06h, 12h, 18h, 23h)              │
│  - sync-meta-ads (4x/dia)                                    │
│  - detect-anomalies (1x/dia, 07h)                            │
│  - track-change-impact (1x/dia, 08h)                         │
│  - push-offline-conversions (a cada 30min)                   │
│  - daily-report-whatsapp (configurável por cliente)          │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│  HOSTING                                                     │
│  Frontend: Vercel (projeto trafego-ddg)                      │
│  Domínio: trafego.dosedegrowth.pro (subdomínio)              │
└──────────────────────────────────────────────────────────────┘
```

### 3.2 Schema Supabase (proposto)

```sql
-- ========== CORE ==========
clientes (
  id uuid pk,
  nome text,
  slug text unique,        -- usado em URL pública
  cor_primaria text,       -- whitelabel
  cor_secundaria text,
  logo_url text,
  cac_maximo numeric,
  ticket_medio numeric,
  ativo boolean default true,
  criado_em timestamptz
)

-- Credenciais e contas vinculadas (criptografado)
clientes_acessos (
  cliente_id uuid fk,
  google_customer_id text,         -- ex: '123-456-7890'
  google_oauth_refresh_token text, -- encrypted
  meta_ad_account_id text,         -- ex: 'act_123456'
  meta_long_lived_token text,      -- encrypted
  meta_business_id text,
  painel_comercial_webhook_secret text,
  ultima_sync_google timestamptz,
  ultima_sync_meta timestamptz
)

-- Multi-tenant access
clientes_users (
  cliente_id uuid fk,
  user_id uuid fk auth.users,
  role text check (role in ('admin_ddg','gestor_ddg','viewer_cliente')),
  pk (cliente_id, user_id)
)

-- ========== SNAPSHOTS DIÁRIOS (source of truth) ==========
campanhas_snapshot (
  id uuid pk,
  cliente_id uuid fk,
  plataforma text check (plataforma in ('google','meta')),
  campanha_id text,            -- id externo
  campanha_nome text,
  objetivo text,
  status text,
  data date,
  -- métricas
  investimento numeric,
  impressoes int,
  cliques int,
  ctr numeric,
  cpc numeric,
  conversoes int,
  cpa numeric,
  receita numeric,
  roas numeric,
  -- raw payload pra debug/feature futura
  raw_jsonb jsonb,
  unique (cliente_id, plataforma, campanha_id, data)
)

adsets_snapshot (mesmo padrão)
ads_snapshot (
  id, cliente_id, plataforma, ad_id, ad_nome,
  thumbnail_url,           -- nosso storage
  thumbnail_origem text,   -- url original
  headline text,
  description text,
  cta text,
  ...mesmas métricas...,
  raw_jsonb jsonb
)

-- ========== GOOGLE ESPECÍFICO ==========
keywords_snapshot (cliente_id, keyword, match_type, quality_score, ...)
search_terms (
  id, cliente_id, termo, campanha_id, adgroup_id,
  gasto, conversoes, cliques,
  status text default 'ativo', -- 'ativo' | 'negativada_pendente' | 'negativada'
  acao_em timestamptz,
  acao_por uuid fk auth.users
)

-- ========== META ESPECÍFICO ==========
creatives_assets (cliente_id, ad_id, tipo, url_storage, hash)

-- ========== CHANGE TRACKER ⭐ ==========
mudancas (
  id uuid pk,
  cliente_id uuid fk,
  plataforma text,
  entidade_tipo text,    -- 'campanha' | 'adset' | 'ad' | 'keyword'
  entidade_id text,
  campo text,            -- 'budget' | 'status' | 'lance' | etc
  valor_antes text,
  valor_depois text,
  feita_por uuid fk auth.users,
  feita_em timestamptz,
  -- impactos calculados depois
  metricas_antes_jsonb jsonb,   -- snapshot 7d antes
  metricas_apos_7d_jsonb jsonb,
  metricas_apos_14d_jsonb jsonb,
  metricas_apos_21d_jsonb jsonb,
  narrativa_ia text,
  veredicto text         -- 'positiva' | 'negativa' | 'neutra' | 'aguardando'
)

-- ========== ANOMALIAS ⭐ ==========
anomalias (
  id uuid pk,
  cliente_id uuid fk,
  tipo text,             -- 'gasto_acima_baseline' | 'cpa_subiu' | 'roas_caiu' | etc
  severidade text,       -- 'baixa' | 'media' | 'alta' | 'critica'
  entidade_tipo text,
  entidade_id text,
  metrica text,
  valor_atual numeric,
  baseline_7d numeric,
  baseline_14d numeric,
  desvio_percentual numeric,
  descricao text,
  narrativa_ia text,
  detectada_em timestamptz,
  resolvida_em timestamptz,
  resolvida_por uuid
)

-- ========== OFFLINE CONVERSIONS ⭐ DIFERENCIAL ==========
eventos_offline (
  id uuid pk,
  cliente_id uuid fk,
  origem text,                -- 'painel_comercial_hl' | 'painel_comercial_xyz'
  origem_lead_id text,
  tipo_evento text,           -- 'lead_qualificado' | 'venda' | 'reuniao' | 'fechamento'
  valor numeric,
  moeda text default 'BRL',
  -- match keys (1+ obrigatório)
  email_hash text,            -- sha256
  telefone_hash text,
  gclid text,                 -- Google click id
  fbclid text,                -- Meta click id
  click_id text,              -- nosso eid (cross-tracking)
  -- envio
  ocorrido_em timestamptz,
  enviado_google_em timestamptz,
  enviado_google_status text,
  enviado_meta_em timestamptz,
  enviado_meta_status text,
  tentativas int default 0,
  raw_payload_jsonb jsonb
)

-- ========== RELATÓRIOS ==========
relatorios (
  id uuid pk,
  cliente_id uuid fk,
  tipo text,           -- 'pdf' | 'whatsapp' | 'email' | 'csv'
  periodo_inicio date,
  periodo_fim date,
  url_storage text,
  prompt_usado text,
  modelo_ia text,      -- 'claude-sonnet-4-5' | 'claude-haiku-4-5'
  enviado_para text[],
  gerado_em timestamptz,
  gerado_por uuid
)

-- Prompts customizados por cliente
relatorios_prompts (
  cliente_id uuid fk,
  tipo text,           -- 'whatsapp_diario' | 'pdf_semanal' | 'email_mensal'
  prompt text,
  ativo boolean,
  pk (cliente_id, tipo)
)

-- ========== AUDITORIA ==========
logs (
  id uuid pk,
  cliente_id uuid,
  user_id uuid,
  acao text,
  entidade text,
  payload_jsonb jsonb,
  sucesso boolean,
  erro text,
  ip text,
  user_agent text,
  criado_em timestamptz default now()
)

-- ========== CONFIG ==========
config_global (chave text pk, valor jsonb)
config_alertas (
  cliente_id uuid,
  metrica text,
  threshold_warn numeric,    -- ex: 20% acima do baseline
  threshold_critical numeric,
  pk (cliente_id, metrica)
)
```

### 3.3 Padrões de design

- **RLS obrigatório**: toda query passa por `cliente_id` do user logado
- **Soft delete**: `deletado_em timestamptz` ao invés de DELETE
- **Snapshot diário imutável**: nunca UPDATE em `*_snapshot`, sempre INSERT
- **Encrypted at rest**: tokens OAuth via Supabase Vault
- **Webhooks com HMAC**: Painel Comercial → Tráfego DDG validado por shared secret

---

## 4. FUNCIONALIDADES POR FASE

### FASE 0 — VALIDAÇÃO (1 semana)
**Objetivo**: setup base + validar acessos Petderma antes de codar.

- [x] Cliente piloto definido: **Petderma**
- [x] Identidade visual definida: brand DDG (ver `IDENTIDADE_VISUAL.md`)
- [x] Stack definida: Next.js + Supabase + Vercel
- [x] ADM GERAL como user único da Fase 0/1
- [ ] Coletar credenciais necessárias:
  - [ ] Google Ads developer token (DDG) — aplicar no MCC DDG
  - [ ] Google Cloud OAuth 2.0 client — projeto `dose-de-growth` ou novo
  - [ ] Acesso Petderma Google Ads (Customer ID + admin)
  - [ ] Meta App ID + Business Manager — Petderma como Ad Account
  - [ ] Anthropic API key (já temos)
  - [ ] Evolution API endpoint (já temos)
- [ ] Mapear stack Petderma: tem CRM? Painel comercial? Como rastreia fechamentos hoje?
- [ ] Criar projeto Supabase `trafego-ddg` na org DDG (sa-east-1)
- [ ] Criar repo GitHub `dosedegrowth-design/trafego-ddg`
- [ ] Criar projeto Vercel linkado ao repo

**Entregável**: ambiente provisionado + acessos Petderma validados + deploy vazio rodando ✅

---

### FASE 1 — SYNC DE DADOS (2 semanas)
**Objetivo**: 30 dias de histórico do cliente piloto no Supabase, sem UI ainda.

#### 1.1 Setup
- [ ] Repositório `github.com/dosedegrowth-design/trafego-ddg`
- [ ] Estrutura Next.js 16 + TS + Tailwind v4 + shadcn
- [ ] Supabase CLI + migrations versionadas
- [ ] Schema `trafego_ddg` exposto: `alter role authenticator set pgrst.db_schemas = 'public,graphql_public,trafego_ddg';`
- [ ] Tabelas core (clientes, clientes_acessos, clientes_users)
- [ ] Auth Supabase (email + senha simples no MVP)

#### 1.2 Google Ads sync
- [ ] OAuth flow completo (admin DDG conecta a conta do cliente)
- [ ] Edge Function `sync-google-ads`:
  - [ ] Pull `customer.descriptive_name` (validação)
  - [ ] Pull campaigns + ad_groups + ads + keywords + search_terms
  - [ ] Pull insights diários (metrics dos últimos 30 dias na primeira sync)
  - [ ] Salvar thumbnails no Supabase Storage
  - [ ] Logs em `logs` com sucesso/erro
- [ ] Rate limiting + retry exponencial
- [ ] Cron 4x/dia

#### 1.3 Meta Ads sync
- [ ] System User token long-lived (60d) via Business Manager
- [ ] Edge Function `sync-meta-ads`:
  - [ ] Pull campaigns/adsets/ads + insights diários
  - [ ] Pull creative assets (image/video URL)
  - [ ] Cache de thumbnails no Storage
- [ ] Cron 4x/dia

#### 1.4 Validação
- [ ] Cross-check: dados do dashboard batem com gerenciador da plataforma (±2% aceitável)
- [ ] 30 dias de histórico completo

**Entregável**: dados fluindo + jobs estáveis ✅

---

### FASE 2 — DASHBOARD OPERACIONAL (2 semanas)
**Objetivo**: gestor faz 80% do trabalho diário sem abrir Google/Meta.

#### 2.1 Layout base
- [ ] Sidebar fixa com navegação (Visão Geral, Campanhas, Search Terms, Mudanças, Alertas, Relatórios, Config)
- [ ] Header com switcher de cliente (multi-cliente desde o dia 1)
- [ ] Light/Dark mode + cor da marca do cliente atual
- [ ] Indicador de "última sync" + botão sync manual

#### 2.2 Visão Geral (Daily/Weekly/Monthly)
- [ ] Cards de KPI top: investimento, conversões, CPA, ROAS, receita
- [ ] Comparação automática vs baseline 7d e 14d
- [ ] Gráfico de evolução temporal (Recharts)
- [ ] Comparação Meta vs Google lado a lado
- [ ] Filtros: período, plataforma, conta

#### 2.3 Campanhas (tabela rica)
- [ ] Tabela TanStack Table com colunas configuráveis
- [ ] Meta + Google unificados na mesma tabela
- [ ] Sort por qualquer métrica (default: ROAS desc)
- [ ] Cores por threshold de CPA (verde/amarelo/vermelho)
- [ ] Drill-down: campanha → adsets → ads
- [ ] Thumbnails de criativos inline
- [ ] **Ações inline**:
  - [ ] Pause/ativar (com confirmação)
  - [ ] Editar budget (lock 20% máximo de mudança — regra do V2)
  - [ ] Tudo registrado em `mudancas`

#### 2.4 Search Terms (Google)
- [ ] Tabela com filtro "alto gasto + zero conversão"
- [ ] Bulk select + ação "adicionar negativada"
- [ ] Opção: negativada de campanha OU lista compartilhada
- [ ] Confirmação antes de enviar à API

#### 2.5 Logs/Auditoria
- [ ] Página com toda ação registrada
- [ ] Filtros por user, ação, sucesso/erro, período

**Entregável**: gestor real testa por 1 semana e dá feedback ✅

---

### FASE 3 — INTELIGÊNCIA IA (2 semanas)
**Objetivo**: IA acionável que substitui análise manual.

#### 3.1 Anomaly Detection (cron diário 07h)
- [ ] Edge Function `detect-anomalies`:
  - [ ] Para cada cliente ativo, comparar D-1 com baseline 7d e 14d
  - [ ] 5 métricas-chave: investimento, conversões, CPA, ROAS, CTR
  - [ ] Threshold padrão: ±20% = warn, ±40% = critical
  - [ ] Threshold custom por cliente em `config_alertas`
  - [ ] Gerar registro em `anomalias`
  - [ ] Narrativa via Claude Haiku (massa, barato): "ROAS caiu 35% vs últimos 7 dias. Causa provável: [análise contextual]"
- [ ] Página `/alertas` com lista priorizada por severidade
- [ ] Ação "marcar como resolvida"
- [ ] Notificação WhatsApp pro gestor (Evolution) quando severidade = crítica

#### 3.2 Change Tracker
- [ ] Hook em toda ação inline (Fase 2.3) → grava em `mudancas` com snapshot 7d antes
- [ ] Edge Function diária `track-change-impact`:
  - [ ] Para mudanças de 7/14/21 dias atrás, calcular delta
  - [ ] Gerar narrativa via Haiku: "Aumento de budget de 20% em 14/04 resultou em +18 conversões e CPA estável. Mudança positiva."
  - [ ] Veredicto: positiva/negativa/neutra
- [ ] Página `/mudancas` com timeline + veredictos

#### 3.3 Otimizações Priorizadas
- [ ] Edge Function `find-optimizations`:
  - [ ] Regras hardcoded:
    - Campanha sem prospecting → high
    - Adset em learning há +14d → medium
    - Keyword com QS<5 e gasto >R$100 → high
    - Ad com CTR <50% da média do adset → medium
    - Search term com gasto >R$200 e zero conv → high
  - [ ] Layer Claude Sonnet por cima: contextualiza + sugere ação concreta
- [ ] Página `/otimizacoes` com cards priorizados + botão "executar" (quando aplicável)

#### 3.4 Chatbot Contextual
- [ ] Sidebar persistente em todas as páginas
- [ ] Pré-carrega contexto: cliente atual + período selecionado + métricas top
- [ ] Tools disponíveis ao Claude:
  - `query_supabase(sql)` — read-only com schema scopado
  - `get_campaign_details(id)`
  - `get_changes_history(period)`
  - `suggest_negative_keywords()`
- [ ] Modelo: Claude Sonnet 4.5 (qualidade > custo)
- [ ] Histórico de chat por cliente

#### 3.5 Relatório IA
- [ ] Página `/relatorios` com:
  - Selector de cliente + período + tipo (PDF/WhatsApp/Email)
  - Preview do prompt configurável (`relatorios_prompts`)
  - Geração via Haiku
- [ ] PDF: Next.js + react-pdf ou Puppeteer (Vercel) com branding do cliente
- [ ] WhatsApp: gera texto otimizado pra WPP (emojis, formatação, links curtos) + envia via Evolution
- [ ] Cron `daily-report-whatsapp` configurável por cliente
- [ ] Botão "regenerar" se gestor não gostou

**Entregável**: gestor recebe alertas matinais + chat funcional + relatórios automáticos ✅

---

### FASE 4 — SERVER-SIDE CONVERSIONS ⭐ DIFERENCIAL DDG (2 semanas)
**Objetivo**: alimentar Google/Meta com quem **realmente fecha** vindo do Painel Comercial.

#### 4.1 Webhook receiver
- [ ] API route `/api/webhooks/painel-comercial`
- [ ] Validação HMAC com `painel_comercial_webhook_secret`
- [ ] Payload esperado:
  ```json
  {
    "cliente_slug": "hl-models",
    "lead_id": "abc123",
    "tipo_evento": "fechamento",
    "valor": 4500.00,
    "ocorrido_em": "2026-04-28T14:30:00Z",
    "match_keys": {
      "email": "lead@example.com",
      "telefone": "+5511999999999",
      "gclid": "Cj0KC...",
      "fbclid": "IwAR..."
    }
  }
  ```
- [ ] Hash de email/telefone (SHA-256) automático
- [ ] Salva em `eventos_offline` com status pendente

#### 4.2 Push para Google Ads
- [ ] Edge Function `push-google-conversions` (cron 30min):
  - [ ] Busca eventos pendentes
  - [ ] Usa Enhanced Conversions for Leads API
  - [ ] Match por gclid (priority 1) ou email_hash + phone_hash (fallback)
  - [ ] Atualiza `enviado_google_em` + status
  - [ ] Retry: 3 tentativas com backoff
- [ ] Conversion action customizada por cliente em Google Ads ("DDG - Fechamento")

#### 4.3 Push para Meta CAPI
- [ ] Edge Function `push-meta-conversions`:
  - [ ] Endpoint `/{pixel_id}/events` com `event_name: "Purchase"` ou "Lead"
  - [ ] Match keys: `em` (email hash), `ph` (phone hash), `fbc` (fbclid)
  - [ ] Deduplication via `event_id`
- [ ] Test events mode até validação, depois produção

#### 4.4 Painel de monitoramento
- [ ] Página `/conversoes-offline`:
  - Timeline de eventos enviados
  - Taxa de match (% que casou em Google/Meta)
  - Eventos com falha (com botão retry manual)
- [ ] Alerta se taxa de match cai abaixo de 70% (qualidade dos UTMs)

#### 4.5 Documentação para integração com Painel Comercial
- [ ] Doc técnico: como Painel HL Models, dash-supervisao, etc. devem mandar webhook
- [ ] Helper SDK em TS pra outros projetos DDG usarem

**Entregável**: 1 cliente recebendo conversões offline em Google + Meta com taxa de match >80% ✅

---

### FASE 5 — TRANSPARÊNCIA CLIENTE (2 semanas)
**Objetivo**: cliente final vê seus dados em link branded.

#### 5.1 Acesso do cliente
- [ ] Role `viewer_cliente` em `clientes_users`
- [ ] Convite por email com magic link Supabase
- [ ] Dashboard simplificado em `/cliente/[slug]`
- [ ] Whitelabel: cor + logo do cliente, sem branding DDG

#### 5.2 Telas do cliente
- [ ] Visão geral mensal (mais simples que do gestor)
- [ ] Funil de aquisição
- [ ] Top criativos (read-only, sem ações)
- [ ] Receba relatório semanal/mensal por email automaticamente
- [ ] Comentários do gestor (gestor escreve, cliente lê)

#### 5.3 Link público com token
- [ ] `/p/[client_slug]/[token]` — sem login
- [ ] Token expira após N dias (config)
- [ ] Read-only, dados agregados (sem detalhes sensíveis)

**Entregável**: cliente piloto acessando + 2 clientes adicionais embarcando ✅

---

### FASE 6 — AVANÇADO (contínuo)

- [ ] **Cross-tracking via `eid`** (V1):
  - Padrão UTM `?eid={ad.id}` em todos os ads
  - Webhook do GTM/Pixel grava em `eventos_site`
  - Funil real do site (não do gerenciador)
- [ ] **Comparação A vs B** drag-and-drop (V1)
- [ ] **Simulador de funil** com CAC máximo + ROAS (V2)
- [ ] **Sugestão de ads via Claude** (V2):
  - Lê top 10 ads do cliente
  - Gera 3 headlines + 3 descriptions
  - Cria draft pausado no Meta
- [ ] **Top of funnel detector**: detecta se cliente só roda BoFu e sugere prospecting
- [ ] **TikTok Ads** integração
- [ ] **GA4** integração para cross-source attribution
- [ ] **Onboarding self-service**: cliente conecta Google/Meta sozinho via OAuth
- [ ] **API pública DDG**: outros projetos da agência consomem dados de tráfego

---

## 5. INTEGRAÇÃO COM ECOSISTEMA DDG

### 5.1 Conexões já mapeadas

| Projeto DDG | Como integra com Tráfego DDG |
|---|---|
| **Painel Comercial HL Models** | Envia webhook de fechamento → Tráfego DDG → Google/Meta offline conversions |
| **dash-supervisao** | Mesma lógica: status muda pra "Fechado" via API → webhook → server-side conversions |
| **Cardápio Inteligente** | (futuro) se rodar tráfego, conecta da mesma forma |
| **LNB** | (futuro) tráfego de aquisição de devedores |
| **SiteFlow** | Tráfego de prospecção de novos sites pode ser monitorado aqui |

### 5.2 Padrão de webhook DDG (proposta)

Todos os painéis DDG que tiverem cobrança/fechamento devem implementar o webhook:

```typescript
// SDK proposto: @ddg/trafego-sdk
import { sendOfflineEvent } from '@ddg/trafego-sdk';

await sendOfflineEvent({
  clienteSlug: 'hl-models',
  leadId: 'abc123',
  tipoEvento: 'fechamento',
  valor: 4500,
  ocorridoEm: new Date(),
  matchKeys: {
    email: lead.email,
    telefone: lead.telefone,
    gclid: lead.gclid,  // capturado no form de origem
    fbclid: lead.fbclid,
  }
});
```

---

## 6. SEGURANÇA E COMPLIANCE

- [ ] OAuth tokens criptografados via Supabase Vault
- [ ] Webhooks com HMAC obrigatório
- [ ] RLS em todas as tabelas
- [ ] Logs de auditoria imutáveis (append-only)
- [ ] Rate limiting nas API routes
- [ ] LGPD: hash de email/telefone antes de mandar para Google/Meta (já é boa prática)
- [ ] Cliente pode pedir export ou exclusão dos dados dele
- [ ] Backup diário Supabase (já incluso no plano)

---

## 7. CUSTOS ESTIMADOS

| Item | Custo mensal | Notas |
|---|---|---|
| Vercel Hobby/Pro | $0 - $20 | Pro só se ultrapassar limites |
| Supabase Pro | $25 | Necessário pra Edge Functions sem limite Worker |
| Anthropic API | $30 - $100 | Depende do volume (Haiku é barato) |
| Evolution API | $0 | Já temos infra DDG |
| Google Ads API | $0 | Free, só precisa developer token |
| Meta Marketing API | $0 | Free |
| **Total** | **~$60-150/mês** | Por agência inteira (não por cliente) |

Comparação: 1 ferramenta SaaS de tráfego (TripleWhale, Triple A, etc.) = $200-800/mês **por cliente**.

---

## 8. RISCOS E MITIGAÇÕES

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Google Ads developer token negado | Média | Aplicar cedo, ter fallback de import CSV |
| Meta API quebra (mudanças frequentes) | Alta | Testes E2E semanais + alerta de erro |
| Custo Anthropic explode | Baixa | Haiku para massa, Sonnet só pra chatbot. Cache de respostas |
| Cliente não conecta as contas | Média | Onboarding assistido pelo gestor DDG nos 3 primeiros |
| Match de offline conversions <70% | Média | Capturar gclid/fbclid no form de origem (instrumentar painéis) |
| Performance Supabase (queries pesadas) | Média | Materialized views + índices + agregações pré-calculadas |

---

## 9. DEFINITION OF DONE (por fase)

Cada fase só é considerada DONE quando:

1. ✅ Todas as features da fase implementadas e em produção
2. ✅ Testes manuais E2E executados pelo gestor piloto
3. ✅ Documentação atualizada em `REGRAS_E_LOGICA.md`
4. ✅ Memória DDG atualizada em `~/.claude/projects/-Users-lucascassiano-Claude/memory/MEMORY.md`
5. ✅ Sem bug crítico aberto
6. ✅ Logs e métricas de sync sem erros nas últimas 24h

---

## 10. PRÓXIMOS PASSOS IMEDIATOS

### ✅ JÁ DECIDIDO
- [x] Cliente piloto: **Petderma**
- [x] Identidade visual: brand guidelines DDG aplicado (laranja `#F15839` + dark theme)
- [x] Stack confirmada: Next.js + Supabase + GitHub + Vercel
- [x] ADM GERAL como primeiro user

### 🚧 FAZER AGORA (Fase 0)

#### A. Acessos e contas Petderma
- [ ] Coletar com a equipe Petderma:
  - [ ] Acesso Google Ads (Customer ID + permissão admin)
  - [ ] Acesso Meta Business Manager (Ad Account ID + admin)
  - [ ] Pixel ID do Meta + Tag ID do Google Ads
  - [ ] CAC máximo / ticket médio Petderma (pra config inicial)
- [ ] Validar se Petderma tem painel comercial conectado (CRM próprio? planilha? Chatwoot?)

#### B. Infraestrutura DDG
- [ ] Criar repo `github.com/dosedegrowth-design/trafego-ddg` (privado inicialmente)
- [ ] Criar projeto Supabase `trafego-ddg` (org DDG, sa-east-1)
- [ ] Criar projeto Vercel `trafego-ddg` (linkado ao repo)
- [ ] Aplicar para **Google Ads developer token** (pode levar 3-7 dias)
  - URL: https://developers.google.com/google-ads/api/docs/get-started/dev-token
  - Usar conta MCC da DDG
- [ ] Criar **Meta App** no developers.facebook.com (modo dev)
- [ ] Configurar OAuth Client no GCP `dose-de-growth`

#### C. Estrutura inicial do projeto
- [ ] `npx create-next-app@latest trafego-ddg --typescript --tailwind --app`
- [ ] Setup shadcn/ui com tema DDG (cores do `IDENTIDADE_VISUAL.md`)
- [ ] Layout base: header + sidebar + dark mode default
- [ ] Auth Supabase (email + senha) — único user `ADM_GERAL`
- [ ] Página `/login` + `/dashboard` com placeholder
- [ ] Deploy inicial no Vercel (mesmo vazio, pra validar pipeline)

#### D. Documentação
- [ ] `README.md` ✅ (criado)
- [ ] `IDENTIDADE_VISUAL.md` ✅ (criado)
- [ ] `REGRAS_E_LOGICA.md` (criar quando começar Fase 1)
- [ ] Skill `trafego-ddg-core` em `~/.claude/skills/` (criar quando ramp-up)

---

## 11. REFERÊNCIAS EXTERNAS

- Google Ads API docs: https://developers.google.com/google-ads/api/docs/start
- Google Ads Enhanced Conversions: https://developers.google.com/google-ads/api/docs/conversions/upload-clicks
- Meta Marketing API: https://developers.facebook.com/docs/marketing-api/
- Meta CAPI Offline Events: https://developers.facebook.com/docs/marketing-api/conversions-api/offline
- Anthropic API: https://docs.anthropic.com/
- Supabase Edge Functions: https://supabase.com/docs/guides/functions

---

## 12. CHANGELOG

| Data | Versão | Mudança | Autor |
|---|---|---|---|
| 2026-04-28 | v0.1 | Documento inicial criado a partir da análise de 3 vídeos de referência | Claude + Lucas |
| 2026-04-28 | v0.2 | Decisões travadas: Petderma como piloto, identidade DDG, GitHub+Vercel, ADM GERAL como user inicial. Adicionados arquivos `IDENTIDADE_VISUAL.md` e `README.md` | Claude + Lucas |

---

> **Próxima atualização**: após criação do repo GitHub + projetos Supabase/Vercel + scaffold Next.js.
