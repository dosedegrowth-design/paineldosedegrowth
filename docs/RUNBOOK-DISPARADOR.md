# RUNBOOK — Disparador WhatsApp (DDG)

> Documento de handoff. Objetivo: qualquer dev do time consegue clonar,
> rodar, entender e ajustar o Disparador sem precisar perguntar nada.
>
> **Última atualização:** 2026-07-16
> **Mantenedor:** Lucas Cassiano (Dose de Growth)
> **Repo:** github.com/dosedegrowth-design/paineldosedegrowth

---

## 1. O QUE É

Módulo de **disparo em massa via WhatsApp Cloud API** (Meta oficial, não
é bot não-oficial). Roda dentro do painel DDG.

**URL produção:** https://painel.dosedegrowth.com/disparador

**Pra que serve:** cliente sobe uma base de contatos (CSV/XLSX), escolhe
um template aprovado pela Meta, e o sistema dispara pra todo mundo com
pacing controlado (pra não queimar o número).

**Quem usa hoje:** Feel King (barbearia), Bless Estética, Petderma,
Marina Saleme, LNB, SuperVisão.

---

## 2. ACESSOS QUE VOCÊ PRECISA PEDIR PRO LUCAS

Antes de começar, peça:

| # | Acesso | Onde usa | Como pedir |
|---|--------|----------|------------|
| 1 | **GitHub** — repo `dosedegrowth-design/paineldosedegrowth` | clonar código | convite de colaborador |
| 2 | **Vercel** — team `dose-de-growths-projects`, projeto `paineldosedegrowth` | deploy + logs + env vars | convite de membro |
| 3 | **Supabase** — projeto `hkjukobqpjezhpxzplpj` (DDG, sa-east-1) | banco + edge functions | convite de membro |
| 4 | **Meta Business Manager** — BM `138706958770254` (Ai Focus Company) | templates + números WhatsApp | admin te adiciona |
| 5 | **`.env.local`** preenchido | rodar local | Lucas manda por canal seguro (1Password / Bitwarden / DM), **nunca por e-mail ou commit** |

> ⚠️ **NUNCA commite `.env.local`.** Já está no `.gitignore`, mas confira
> antes de qualquer `git add`.

---

## 3. QUICK START (do zero até rodando local)

```bash
# 1. clonar
git clone https://github.com/dosedegrowth-design/paineldosedegrowth.git
cd paineldosedegrowth

# 2. Node 24+ (o projeto usa Next 16 + React 19)
node -v   # precisa ser >= 24

# 3. instalar
npm install

# 4. env vars — peça o arquivo pro Lucas OU puxe da Vercel:
npx vercel link          # escolhe o time dose-de-growths-projects
npx vercel env pull .env.local

# 5. rodar
npm run dev
# abre http://localhost:3000/disparador
```

### Variáveis de ambiente necessárias

Estão no `.env.example`. As que o Disparador usa:

```
NEXT_PUBLIC_SUPABASE_URL          # https://hkjukobqpjezhpxzplpj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY     # sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY         # sb_secret_...  (NUNCA expor no client)
META_API_VERSION                  # v25.0
N8N_DISPATCHER_WEBHOOK_SECRET     # shared secret entre Edge Function e /api/dispatcher/*
```

> O nome `N8N_DISPATCHER_WEBHOOK_SECRET` é legado — o n8n **não é mais
> usado**. Hoje esse secret só autentica a Edge Function chamando as
> rotas internas `/send` e `/pending`. Renomear é tarefa pendente.

---

## 4. ARQUITETURA (fluxo end-to-end)

```
┌─────────────────────────────────────────────────────────┐
│ 1. USUÁRIO no painel                                    │
│    /disparador/campanhas/nova  (wizard 5 passos)        │
│    escolhe número → template → sobe base → mapeia → OK  │
└────────────────────┬────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 2. POST /api/dispatcher/upload                          │
│    salva a base em disparador.uploads                   │
│ 3. POST /api/dispatcher/campanhas                       │
│    cria campanha + N linhas em disparador.envios        │
│    (todas status='pending')                             │
└────────────────────┬────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 4. Usuário clica "Iniciar disparo"                      │
│    POST /api/dispatcher/start                           │
│    → marca campanha 'running'                           │
│    → chama Edge Function (fire-and-forget)              │
│    → retorna 200 na hora (Vercel tem timeout de 10s)    │
└────────────────────┬────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 5. EDGE FUNCTION dispatcher-fire-campanha (Supabase)    │
│    loop:                                                │
│      GET  /api/dispatcher/pending?campanha_id=X&limit=50│
│      POST /api/dispatcher/send  { envio_id }  ← 1 a 1   │
│      sleep(delay_ms)  ← pacing                          │
│    processa MAX 150 envios e sai (IDLE_TIMEOUT 150s)    │
└────────────────────┬────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 6. /api/dispatcher/send                                 │
│    → lock otimista (pending → sending)                  │
│    → busca token no Supabase Vault via RPC get_token()  │
│    → WhatsappClient.sendTemplate() → Meta Graph API     │
│    → grava status sent/failed + message_id              │
└────────────────────┬────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 7. CRON pg_cron (job 15, a cada 1 min)                  │
│    dispatcher-trigger-scheduled:                        │
│    (a) campanhas 'scheduled' cuja hora passou → dispara │
│    (b) campanhas 'running' com pending parados >3min    │
│        → RE-dispara (retomada automática)               │
└─────────────────────────────────────────────────────────┘
```

**Por que esse desenho?** A Edge Function tem timeout de 150s. Uma
campanha de 3.000 contatos não cabe numa invocação só. Então ela
processa 150 por vez, sai limpo, e o cron de 1min retoma de onde parou.
Campanha grande termina sozinha sem intervenção.

> **n8n NÃO é mais usado.** Versões v4/v5/v6 do workflow foram
> abandonadas (bugs de If Stop, fetch no Code Node, background mode).
> Se achar referência a n8n no código, é legado.

---

## 5. MAPA DE ARQUIVOS

### Frontend (páginas)
```
app/(dashboard)/disparador/
├── page.tsx                          # visão geral / dashboard
├── layout.tsx                        # tabs de navegação
├── contas/
│   ├── page.tsx                      # lista de números WhatsApp
│   ├── contas-table.tsx              # tabela + toggle ativo
│   └── sync-wabas-button.tsx         # botão "Sincronizar números"
├── templates/
│   ├── page.tsx                      # lista de templates
│   ├── templates-filters.tsx
│   ├── sync-templates-button.tsx     # botão "Atualizar"
│   └── novo/
│       ├── page.tsx
│       └── novo-template-form.tsx    # form de criação (header, body, botões)
└── campanhas/
    ├── page.tsx                      # lista de campanhas
    ├── nova/
    │   ├── page.tsx
    │   └── wizard.tsx                # ⭐ wizard 5 passos (arquivo mais mexido)
    └── [id]/
        ├── page.tsx                  # detalhe da campanha
        ├── envios-table.tsx          # tabela auto-refresh 5s
        └── campanha-actions.tsx      # pausar/retomar
```

### Backend (rotas API)
```
app/api/dispatcher/
├── campanhas/route.ts                # POST cria campanha + envios
├── campanhas/[id]/pause/route.ts     # POST pausa
├── contas/route.ts                   # GET lista
├── contas/[id]/toggle/route.ts       # POST liga/desliga número
├── pending/route.ts                  # GET próximos envios (chamado pela Edge)
├── send/route.ts                     # ⭐ POST envia 1 mensagem via Meta
├── start/route.ts                    # POST inicia campanha
├── sync-wabas/route.ts               # proxy (legado, prefira Edge direto)
├── templates/route.ts                # POST cria template na Meta
├── templates/upload-media/route.ts   # ⭐ Resumable Upload de mídia
└── upload/route.ts                   # POST salva base de contatos
```

### Lib
```
lib/whatsapp/
├── client.ts                         # ⭐ WhatsappClient (sendTemplate, etc)
├── factory.ts                        # monta client a partir de conta_id
├── vault.ts                          # leitura de token no Supabase Vault
├── SETUP.md
└── FANOUT_WEBHOOK.md
```

### Edge Functions (código versionado no repo)
```
supabase/functions/
├── dispatcher-fire-campanha/         # ⭐ motor do disparo
├── dispatcher-trigger-scheduled/     # ⭐ cron de retomada
├── dispatcher-sync-wabas/            # puxa números do Meta
├── dispatcher-sync-templates/        # puxa templates do Meta
└── dispatcher-meta-webhook/          # não usado (webhook aponta pra focos.ia.br)
```

---

## 6. BANCO — schema `disparador` (Supabase `hkjukobqpjezhpxzplpj`)

| Tabela | O que guarda | Campos-chave |
|---|---|---|
| `businesses` | Business Managers da Meta (1 token por BM) | `meta_business_id`, `token_vault_key`, `meta_app_id` |
| `contas` | Números de WhatsApp (WABAs) | `waba_id`, `phone_number_id`, `ativo`, `business_id` |
| `templates` | Templates aprovados/pendentes | `name`, `status`, `components`, `variables_count`, `header_media_url` |
| `campanhas` | Campanhas criadas | `status`, `pacing_per_sec`, `total_enviados`, `scheduled_at` |
| `envios` | 1 linha por destinatário | `telefone`, `status`, `message_id`, `variables` |
| `uploads` | Bases de contatos subidas | `column_mapping`, `total_linhas` |

**RPC:** `disparador.get_token(secret_name)` — SECURITY DEFINER, lê o
Vault (Vault não é acessível via REST direto).

**Storage:** bucket `disparador-media` (público) — guarda mídia de header
dos templates. A Meta exige URL pública no disparo.

**RLS:** ligado em todas as tabelas, mas com policy `open_all` para
`anon`+`authenticated`. Não é restritivo hoje — o painel inteiro é
atrás de login.

### ⚠️ GOTCHA CRÍTICO: schema exposto na API

O schema `disparador` **precisa estar na lista de schemas expostos do
PostgREST**, senão toda query volta vazia (sem erro!).

```sql
-- conferir
SELECT rolconfig FROM pg_roles WHERE rolname='authenticator';
-- tem que aparecer 'disparador' em pgrst.db_schemas

-- consertar
ALTER ROLE authenticator SET pgrst.db_schemas =
  'public, nova_kar, crm_onboarding, disparador';
NOTIFY pgrst, 'reload config';
NOTIFY pgrst, 'reload schema';
```

**Sintoma quando quebra:** dropdowns vazios no painel (ex: "selecionar
número de WhatsApp" não lista nada), mas o SQL direto retorna dados.
Isso já aconteceu 2x — alguém rodou um ALTER ROLE sem incluir
`disparador` na lista.

---

## 7. EDGE FUNCTIONS (deployadas em produção)

| Função | Versão | verify_jwt | Quem chama |
|---|---|---|---|
| `dispatcher-fire-campanha` | v12 | false | `/api/dispatcher/start` + cron de retomada |
| `dispatcher-trigger-scheduled` | v11 | false | pg_cron job **15**, `* * * * *` |
| `dispatcher-sync-wabas` | v14 | false | botão "Sincronizar números" na UI |
| `dispatcher-sync-templates` | v11 | false | botão "Atualizar" na UI |
| `dispatcher-meta-webhook` | v10 | false | não usado |
| `dispatcher-migrate-legacy-media` | v10 | false | rodou 1x, migração pontual |

### Deploy de Edge Function
```bash
cd paineldosedegrowth
npx supabase functions deploy dispatcher-fire-campanha \
  --project-ref hkjukobqpjezhpxzplpj
```
Precisa do PAT do Supabase (`SUPABASE_ACCESS_TOKEN`). Peça pro Lucas.

### Invocar manualmente (debug)
```bash
ANON="<anon key do projeto>"
curl -X POST \
  "https://hkjukobqpjezhpxzplpj.supabase.co/functions/v1/dispatcher-sync-templates" \
  -H "Authorization: Bearer $ANON" \
  -H "Content-Type: application/json" -d '{}'
```

---

## 8. SETUP META (WhatsApp Cloud API)

| Item | Valor |
|---|---|
| App | **Ai Focus Company** — id `4223706594541964` |
| Business Manager | `138706958770254` |
| System User | "token" — id `122166078986710897` |
| Token guardado em | Supabase Vault, chave `disparador_bm_138706958770254_token` |
| API version | **v25.0** |

**Como pegar o token pra debug:**
```sql
SELECT disparador.get_token('disparador_bm_138706958770254_token');
```
> Nunca cole esse token em chat, issue, ou commit.

**Modelo de acesso:** 1 System User token por Business Manager dá acesso
a TODAS as WABAs daquele BM. Por isso o sync automático funciona — não
precisa cadastrar número por número.

---

## 9. OPERAÇÃO DO DIA A DIA

### Criar uma campanha
1. `/disparador/campanhas/nova`
2. **Passo 1** — escolhe o número de WhatsApp (só lista os `ativo=true`)
3. **Passo 2** — escolhe template APPROVED daquele número
4. **Passo 3** — sobe CSV/XLSX **ou** cola a lista na aba "Colar CSV"
5. **Passo 4** — mapeia qual coluna é o telefone + variáveis `{{1}}`, `{{2}}`
6. **Passo 5** — nomeia, define pacing, agenda (opcional) e cria
7. Na tela da campanha, clica **"Iniciar disparo"**

### Sincronizar números novos
Botão **"Sincronizar números"** em `/disparador/contas`.
Chama a Edge Function direto (não passa pela Vercel, que tem timeout 10s).
Demora 20–60s — é normal. Depois de sincronizar, ative o número no toggle.

### Sincronizar templates
Botão **"Atualizar"** em `/disparador/templates`. Leva ~10s.

### Criar template novo
`/disparador/templates/novo`. Depois de submeter, a Meta leva de
minutos a 24h pra aprovar. Rode "Atualizar" pra ver o status mudar.

---

## 10. TROUBLESHOOTING

### 🔴 "Dropdown de números vazio" / "não deixa selecionar nada"
**Causa:** schema `disparador` saiu da lista do PostgREST.
**Fix:** ver seção 6 (GOTCHA CRÍTICO). Rode o `ALTER ROLE` + `NOTIFY`.

---

### 🔴 "(#4) Application request limit reached" ao subir imagem
**Causa:** rate limit do app Meta estourado. Cada app tem uma cota
horária de chamadas. Syncs repetidos + tentativas de upload queimam.

**Diagnóstico:**
```bash
TOKEN="<token do vault>"
curl -sI "https://graph.facebook.com/v25.0/138706958770254?access_token=$TOKEN" \
  | grep -i x-app-usage
# retorna: {"call_count":162,...}  ← acima de 100 = bloqueado
```

**Fix:** esperar. Janela deslizante de ~1h. Cai ~7–15 pontos a cada
12min se você parar de chamar. **Não adianta insistir** — cada tentativa
que falha ainda conta pra cota.

**Prevenção:** não rodar sync em loop. O sync de templates completo
custa ~12 chamadas (1 por WABA).

---

### 🔴 Aba do navegador crasha ("This page couldn't load")
**Causa histórica (RESOLVIDO):** textarea de colar CSV era controlado
por React state. Colar 50k linhas fazia o React reconciliar uma string
de 1–2MB a cada tecla → OOM no renderer do Chrome.

**Fix aplicado (commit `3410714`):** textarea virou uncontrolled
(`useRef`), `spellCheck={false}`.

**Fixes relacionados:**
- `ab46cb6` — parser CSV em chunks, rows em `useRef` em vez de state
- `b0a11a7` — validação de tamanho antes do parse, XLSX `dense:true`
- `d588fff` — `xlsx` (870KB) e `papaparse` viraram lazy import

**Limites atuais:** CSV até 100MB / 200k linhas. XLSX até 20MB
(acima disso o form pede pra salvar como CSV — XLSX estoura memória
do navegador por design do formato).

---

### 🟡 Campanha grande parou no meio
**Esperado.** A Edge Function processa 150 por invocação. O cron
`dispatcher-trigger-scheduled` (job 15, a cada 1min) detecta campanhas
`running` com envios `pending` parados há >3min e re-dispara.

**Se não retomar:** confira se o cron está ativo:
```sql
SELECT jobid, jobname, schedule, active FROM cron.job WHERE jobid = 15;
```

---

### 🟡 Template com imagem dá erro 132012 no disparo
**Causa:** template criado com header IMAGE mas sem `header_media_url`
salvo no banco. A Meta exige o parâmetro de mídia no envio.

**Fix:** a coluna `templates.header_media_url` precisa estar preenchida.
Templates antigos foram migrados pela função
`dispatcher-migrate-legacy-media`.

---

### 🔵 Como ver logs
- **Vercel (rotas API):** dashboard Vercel → projeto → Logs → filtrar
  por `/api/dispatcher`
- **Supabase (Edge Functions):** dashboard Supabase → Edge Functions →
  escolher função → Logs
- **pg_cron:** `SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 20;`

---

## 11. GOTCHAS (leia antes de mexer)

1. **Vercel Hobby = 1 build por vez.** Se travar na fila, cancele os
   deploys QUEUED pela API/dashboard.
2. **Next 15.5.19 / 16.2.4** — versões específicas. 15.1 e 15.5.4 estão
   barradas por vulnerabilidade. Não faça downgrade.
3. **`git add` arquivo por arquivo.** Nunca `git add -A` — o repo tem
   erros pré-existentes em outras páginas que quebram o build se forem
   commitados junto.
4. **Rate limit da Meta é compartilhado** entre todos os clientes do
   mesmo app. Um sync agressivo pra um cliente derruba upload pra todos.
5. **`/api/dispatcher/send` usa service_role** — escapa RLS de propósito.
   Não exponha essa rota sem o header `X-Dispatcher-Secret`.
6. **Pacing:** o padrão é 3/seg mas a velocidade real hoje é ~0.5/seg,
   limitada por cold start da Vercel a cada `POST /send`. Ver pendência #1.

---

## 12. PENDÊNCIAS / ROADMAP

| # | Item | Impacto | Dificuldade |
|---|------|---------|-------------|
| 1 | **Edge Function chamar a Meta direto** (hoje faz round-trip pela Vercel a cada mensagem) | 0.5/seg → 2–5/seg | média |
| 2 | Renomear `N8N_DISPATCHER_WEBHOOK_SECRET` → `DISPATCHER_SECRET` | limpeza | baixa |
| 3 | Tirar `PAINEL_URL` e secret hardcoded de `dispatcher-fire-campanha/index.ts` → env vars | segurança | baixa |
| 4 | **Rotacionar tokens expostos** (Meta System User, service_role, secret do dispatcher) | segurança | baixa |
| 5 | Webhook de status da Meta (delivered/read) não está ligado neste projeto | métricas | média |
| 6 | Retry automático de envios `failed` | confiabilidade | média |

> **#4 é o mais urgente.** Tokens foram expostos em chat durante o
> desenvolvimento. Antes de escalar volume, rotacione.

---

## 13. REGRAS DE TRABALHO (padrão DDG)

1. **Sempre validar antes de dizer "feito".** Padrão: (a) auditoria
   pós-edição, (b) teste com caso real, (c) monitorar em produção depois
   do deploy. Mostre o resultado da validação, não só "subi".
2. **Commit por arquivo**, nunca `git add -A`.
3. **Documentar o que mudou** — este runbook deve ser atualizado junto
   com mudanças estruturais.
4. **Não remova regras/validações existentes** sem entender por que
   estão lá. Muita coisa aqui foi construída em cima de bug real.
5. **Nada de token em commit, issue, chat ou print.**

---

## 14. CONTATOS

| Assunto | Quem |
|---|---|
| Acessos, decisão de produto, prioridade | Lucas Cassiano |
| Meta Business Manager (admin do app) | Paulo (via Lucas) |

---

## APÊNDICE — comandos úteis

```bash
# rodar local
npm run dev

# type-check antes de commitar
npx tsc --noEmit

# build local (pega erro que só aparece em prod)
npm run build

# deploy: só dar push na main, Vercel builda sozinho
git push origin main

# ver status de deploy
npx vercel ls
```

```sql
-- campanhas em andamento
SELECT id, nome, status, total_contatos, total_enviados, total_falhados
FROM disparador.campanhas
WHERE status IN ('running','scheduled')
ORDER BY criado_em DESC;

-- envios travados
SELECT campanha_id, status, COUNT(*)
FROM disparador.envios
GROUP BY 1,2 ORDER BY 1;

-- números ativos
SELECT display_name, phone_number_display, waba_id
FROM disparador.contas WHERE ativo = true ORDER BY display_name;

-- templates aprovados de um número
SELECT t.name, t.status, t.variables_count
FROM disparador.templates t
JOIN disparador.contas c ON c.waba_id = t.waba_id
WHERE c.display_name = 'Feel King Barbearia e Visagismo'
ORDER BY t.name;
```
