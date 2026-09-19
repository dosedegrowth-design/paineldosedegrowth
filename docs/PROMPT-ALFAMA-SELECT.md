# PROMPT MASTER v2 — Alfama Select · Plataforma de Sell-Out

> **Como usar (Lucas):** salve este arquivo como `PROMPT-ALFAMA-SELECT.md` dentro de uma pasta vazia
> (ex.: `~/projetos/alfama-select`), abra o Claude Code ali dentro (`claude`) e mande:
> *"Leia PROMPT-ALFAMA-SELECT.md inteiro e execute do início ao fim, fase por fase. Comece pela Fase 0."*
> Se preferir, cole o conteúdo inteiro como primeira mensagem. No Claude Code web (claude.ai/code) também
> funciona: a "pasta local" passa a ser o ambiente da sessão e o GitHub vira a cópia principal.
>
> Este é o "Prompt Master" de 16/set (André Santana) otimizado pela DDG em 19/set/2026. Tudo que estava lá
> continua valendo. O que entrou: padrão DDG de infra e código, rotina de campo, notificações e lembretes,
> proteção de dados e o roteiro completo de instalação (pasta local → GitHub → Supabase → Vercel → login).

---

## 0. Missão

Você vai construir **e colocar no ar** o **Alfama Select**: plataforma web (PC + celular) de CRM + BI para o
**André Silva Santana, Executivo Key Account da Alfama**, gerir sell-out e awareness dos produtos Alfama em
42 distribuidoras (piloto com 4).

Resultado esperado no fim desta sessão:

1. Código num repositório local **e** no GitHub (`dosedegrowth-design/alfama-select`).
2. Banco Supabase com schema, RLS, seed real, auditoria e backup.
3. App no ar na Vercel, com URL própria, login e senha funcionando.
4. André abre no celular, instala como app, recebe lembretes e registra o dia dele em campo.
5. Nenhum dado se perde: auditoria de toda alteração, lixeira, exportação e backup automático.

Quem fala com você é o **Lucas Cassiano** (Dose de Growth — DDG), dono do projeto. O **André** é o usuário
final. Responda sempre em português. O nome da plataforma é **Alfama Select** (pode ser reavaliado depois).

---

## 1. Contexto do negócio (para você tomar decisões certas de produto)

- **Alfama**: indústria de proteína animal para food service (fábricas em Cascavel/PR e Louveira/SP,
  corporativo em São Paulo). Linhas: **Porcionados**, **Desfiados**, **Moídos**. Vende por uma rede de
  distribuidoras; a distribuidora revende para restaurantes, hotéis, dark kitchens, padarias etc.
- **Sell-out** = o que a distribuidora vende de Alfama para os clientes finais dela. O trabalho do André é
  fazer cada distribuidora vender mais Alfama: awareness da força de vendas dela, mix de SKUs no catálogo,
  contas-chave (clientes finais estratégicos), amostras, resolução de reclamações.
- **Rotina real do André**: dia inteiro na rua. Visita distribuidoras, visita clientes de ponta, liga, manda
  WhatsApp, entrega amostra, faz reunião. À noite ou na sexta consolida o que aconteceu. A gerente dele
  (**Marcelle**) cobra um **relatório semanal de visitas** em planilha (modelo na seção 11).
- **Piloto**: Bidfood, Apetito Foods, Gapeixoto/PXT, PMG. **Expansão**: +38 distribuidoras (planilhas ainda
  vão chegar). O modelo de dados nasce para 42; expansão é só inserir registros.
- **Celular é o instrumento de campo, PC é o instrumento de gestão.** As duas telas mostram a mesma base,
  sempre.

---

## 2. Regras inegociáveis

1. **Nunca perder dado.** Sem localStorage como fonte de verdade, sem arquivo local, sem estado só em memória.
   Toda escrita vai para o Postgres (Supabase). Toda alteração fica na auditoria. Exclusão é lógica (lixeira).
2. **Nunca inventar dado.** Campo marcado `[INFORMAÇÃO PENDENTE]` fica exatamente assim e aparece na UI como
   badge "Pendente". Preço de produto entra `null`. Coleções sem dado real (key accounts, estratégias,
   reclamações, checklists, relatórios de visita) nascem **vazias** — nenhuma linha de exemplo.
3. **Seed é literal.** Use os dados da seção 16 exatamente como estão (texto, acentos, divergências e notas
   de atenção incluídas). Não "corrija" endereço, CNPJ ou nome.
4. **Relatório semanal não é entidade.** É view computada de `daily_reports` + `visit_reports`. Nunca duplique.
5. **Relatório de visita tem piso obrigatório** (seção 11). Pode ganhar campo, nunca perder.
6. **Segredo nenhum em commit, print, issue ou chat.** Chaves só em `.env.local` (no `.gitignore`) e nas envs
   da Vercel/Supabase. Senha de usuário nunca aparece na tela nem no chat: entregue **link** de definição de
   senha.
7. **Mesma base para PC e celular.** Nada de "versão mobile" com dados diferentes. Uma URL, um banco.
8. **Modo escuro por padrão**, identidade Alfama adaptada (seção 15). Faz parte do requisito de uso diário.
9. **Integrações futuras (Outlook/Teams, DataSense, Vision) não entram.** Ficam como itens da tela de
   Pendências (seção 18), com texto explicando a dependência.

---

## 3. Como trabalhar (padrão DDG — o Lucas leva a sério)

1. **Fase 0 primeiro.** Este é Next.js 16 e **não é o Next que você conhece**. Antes de escrever qualquer
   código, leia `node_modules/next/dist/docs/` (roteamento, `proxy`/middleware, server actions, cache,
   `params`/`searchParams` assíncronos, deprecações). Crie `AGENTS.md` no repo com esta regra.
2. **Validar antes de dizer "feito".** Padrão: (a) auditar a própria edição, (b) `npx tsc --noEmit` com 0
   erros, (c) `npx next build` passando, (d) testar com caso real (script, Playwright ou o próprio browser),
   (e) mostrar a saída real. Não diga "subi" ou "pronto" sem mostrar a validação.
3. **Commits por fase, `git add` arquivo por arquivo** (nunca `git add -A`). Mensagens claras em português.
   Push no fim de cada fase.
4. **Causa-raiz antes de fix.** Não chute. Se não tiver certeza, diga e proponha como descobrir.
5. **Pergunte só o que está na seção 20.** Para todo o resto, use os defaults deste documento e siga.
6. **No fim de cada fase**, um resumo curto: o que fez, o que validou, o que ficou pendente.
7. **Mantenha `CLAUDE.md` do novo repo atualizado** (stack, envs, crons, gotchas, pendências). Ele é a
   memória do projeto para as próximas sessões.

---

## 4. Stack e convenções (iguais aos projetos DDG)

| Camada | Escolha |
|---|---|
| Framework | **Next.js 16** (App Router, Turbopack) + React 19 + **TypeScript estrito** |
| UI | **Tailwind v4** (config CSS-first) + **shadcn/ui** + lucide-react + Framer Motion (com parcimônia) |
| Gráficos | Recharts (via shadcn charts) |
| Banco/Auth | **Supabase**: Postgres + RLS + Auth (e-mail/senha) + Storage + Realtime + pg_cron + pg_net |
| Deploy | **Vercel** (deploy automático por push na `main`) |
| Libs | `zod`, `@supabase/supabase-js`, `@supabase/ssr`, `date-fns` + `@date-fns/tz`, `sonner`, `web-push`, `exceljs`, `@tanstack/react-table`, `cmdk` (shadcn command) |
| Testes | `node --test` para lógica pura (`lib/rules/*.test.ts`) + Playwright para smoke E2E |
| Node | 22+ |

Convenções de código:

- `app/` rotas · `components/<modulo>/` (arquivos kebab-case, exports PascalCase) · `components/ui/` shadcn ·
  `lib/actions/*.ts` (server actions, `"use server"`, Zod, retorno `{ ok: true, data } | { ok: false, error }`) ·
  `lib/queries/*.ts` (leituras) · `lib/rules/*.ts` (lógica pura, testada) · `lib/supabase/{server,client,admin}.ts` ·
  `supabase/migrations/*.sql` · `supabase/seed/*.sql`.
- **Banco e código em inglês** (`snake_case` no SQL), **interface em pt-BR**.
- **Datas**: servidor roda em UTC. Toda lógica de "hoje", "esta semana", "vencido" usa `America/Sao_Paulo`
  via helper `nowInBusinessTz()` em `lib/rules/time.ts`. Nunca `new Date()` cru em regra de negócio.
- Acesso ao banco **sempre por server actions / server components** com o client de sessão do usuário
  (RLS ativa). O client `admin` (service role) só em rotas de cron, criação de usuário e backup.
- Toda action passa por um `runAction()` que converte Zod/erros em `{ ok: false, error }` legível e loga o
  técnico no servidor.

Padrões para replicar (copie a ideia, adapte ao Next 16 conforme a doc):

```ts
// lib/supabase/server.ts — client de sessão (Server Components / Actions / Route Handlers)
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list) => { try { list.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {} },
    },
  });
}

// lib/supabase/admin.ts — service role; NUNCA importar em client component
import { createClient as createSb } from "@supabase/supabase-js";
export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("SUPABASE_SERVICE_ROLE_KEY not set");
  return createSb(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// lib/actions/_helpers.ts — toda action passa por aqui
export type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string; field?: string };
export async function runAction<T>(scope: string, fn: () => Promise<T>): Promise<ActionResult<T>> {
  try { return { ok: true, data: await fn() }; }
  catch (e) {
    if (e instanceof ZodError) { const i = e.issues[0]; return { ok: false, error: i.message, field: String(i.path[0] ?? "") }; }
    if (e instanceof BusinessError) return { ok: false, error: e.message, field: e.field };
    console.error(`[alfama:${scope}]`, e instanceof Error ? e.message : e);
    return { ok: false, error: "Não conseguimos concluir isso agora. Tente novamente em instantes." };
  }
}
```

---

## 5. Infraestrutura e identificadores (defaults — mude só se o Lucas mandar)

| Recurso | Default |
|---|---|
| Pasta local | `~/projetos/alfama-select` |
| GitHub | `dosedegrowth-design/alfama-select` (privado), branch `main` |
| Supabase | **Projeto novo** `alfama-select`, org DDG, região `sa-east-1`, schema `public` |
| Vercel | team `dose-de-growths-projects`, projeto `alfama-select` |
| Domínio | `alfama.dosedegrowth.com` (CNAME → `cname.vercel-dns.com`); enquanto não propaga, `alfama-select.vercel.app` |
| Fuso | `America/Sao_Paulo` |
| Usuários | André (executivo) + Lucas (admin). Cadastro público **desligado** |

Por que projeto Supabase novo (e não schema no projeto DDG): isolamento por cliente, backup/restauração
próprios, sem depender da lista de schemas expostos do PostgREST. Se o Lucas preferir reaproveitar o projeto
DDG, use schema `alfama` e lembre de adicioná-lo em `pgrst.db_schemas` (`alter role authenticator set
pgrst.db_schemas = '...,alfama'; notify pgrst, 'reload config';`).

Ferramentas: se os MCPs **Supabase**, **Vercel** e **GitHub** estiverem disponíveis na sessão, use-os
(`create_project`, `apply_migration`, `execute_sql`, `create_git_project`, `create_project_env`,
`add_project_domain`, `create_repository`). Senão, use as CLIs `supabase`, `vercel` e `gh`. Se nenhum dos
dois existir para um passo, escreva o passo exato para o Lucas executar e siga com o resto.

Envs (Vercel production + preview, e `.env.local`):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=https://alfama.dosedegrowth.com
CRON_SECRET=                      # gerado: openssl rand -hex 32
NEXT_PUBLIC_VAPID_PUBLIC_KEY=     # npx web-push generate-vapid-keys
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:dosedegrowth@gmail.com
RESEND_API_KEY=                   # opcional: e-mail de resumo diário. Sem ela, só in-app + push
NOTIFY_FROM_EMAIL=                # opcional, ex.: alfama@notificacoes.dosedegrowth.com
```

---

## 6. Roteiro de execução (fases — faça nesta ordem, commit e push ao fim de cada uma)

**Fase 0 — Leitura e perguntas.** Ler a doc do Next 16 (seção 3). Fazer as perguntas da seção 20 numa
única mensagem. Se o Lucas não responder algo, seguir com o default.

**Fase 1 — Pasta local + GitHub.**
```bash
mkdir -p ~/projetos/alfama-select && cd ~/projetos/alfama-select
npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --turbopack
npx shadcn@latest init            # base neutral, dark por padrão
npx shadcn@latest add button card input textarea select dialog sheet drawer tabs badge table dropdown-menu popover command calendar switch checkbox separator scroll-area tooltip avatar progress skeleton sonner label form chart
npm i @supabase/supabase-js @supabase/ssr zod date-fns @date-fns/tz sonner lucide-react framer-motion recharts web-push exceljs @tanstack/react-table
npm i -D @types/web-push @playwright/test
git init -b main && git add package.json package-lock.json ... && git commit -m "chore: bootstrap Alfama Select"
gh repo create dosedegrowth-design/alfama-select --private --source=. --push   # ou MCP GitHub create_repository + git remote add origin
```
Criar já nesta fase: `AGENTS.md` (regra do Next 16), `CLAUDE.md` (identidade do projeto, stack, regras,
envs, pendências), `.env.example`, `.gitignore` com `.env*.local`.

**Fase 2 — Supabase.** Criar projeto (ou pedir ref + chaves ao Lucas). Habilitar `pg_cron` e `pg_net`.
Aplicar migrations da seção 7 (`supabase/migrations/20260919000000_init.sql`, `..._audit.sql`,
`..._notifications.sql`). Auth: desligar signup público, definir Site URL e Redirect URLs (produção + preview
+ localhost) para reset de senha. Buckets privados `anexos` e `backups`. Rodar seed (seção 16). Guardar
`CRON_SECRET` no Vault (`select vault.create_secret('<valor>', 'cron_secret')`).

**Fase 3 — Base do app.** Login (`/entrar`), logout, esqueci/redefinir senha, guard de rotas (no Next 16
confira na doc se é `proxy.ts` ou `middleware.ts`), layout desktop (sidebar) + mobile (bottom nav), cartão de
identificação, tema escuro, toasts, busca global, `/perfil`.

**Fase 4 — Módulos CRUD.** Distribuidoras (lista + 7 abas), contatos, contas-chave, registro da
distribuidora, pendências, agenda, estratégias, produtos, relatórios de visita, reclamações + checklists.

**Fase 5 — Rotina de campo.** Tela **Hoje**, ação rápida "+", ações de contexto (ligar/WhatsApp/mapa),
rascunho local com reenvio, notificações in-app, PWA + push, cron de lembretes, configurações de notificação.

**Fase 6 — Relatório semanal.** View computada + export XLSX no modelo da Marcelle + "copiar como texto".

**Fase 7 — Proteção de dados.** Auditoria por trigger, lixeira com restauração, exportar tudo (ZIP), backup
semanal automático no Storage, painel de saúde dos crons.

**Fase 8 — Vercel.** Criar projeto ligado ao repo GitHub, cadastrar envs, deploy, domínio, atualizar Site URL
/ Redirect URLs no Supabase Auth, criar os crons do pg_cron apontando para a URL de produção, testar cron
manualmente (`curl -X POST .../api/cron/reminders -H "Authorization: Bearer $CRON_SECRET"`).

**Fase 9 — Usuários.** Criar André e Lucas via `auth.admin.createUser` (`email_confirm: true`) + linha em
`profiles`. Gerar **link de definição de senha** (`auth.admin.generateLink({ type: "recovery" })`) e entregar
o link ao Lucas para repassar ao André. Nunca imprimir senha.

**Fase 10 — Validação real.** Playwright: login → Hoje → criar registro → aparece na aba Registro e no
relatório semanal → exportar XLSX → restaurar item da lixeira. Depois, com o Lucas: instalar no celular, ativar
notificações, receber um push de teste (`/admin` → "Enviar push de teste"), ver o cron rodando em
`/admin/saude`.

**Fase 11 — Documentação e entrega.** `README.md`, `CLAUDE.md` atualizado, `docs/RUNBOOK.md` (infra, envs,
crons, backup e restauração, como criar usuário, como rodar local), `docs/MANUAL-ANDRE.md` (instalar o app no
iPhone/Android, ativar notificações, rotina diária e semanal, como exportar) e `docs/FASE-2-IMPORTACAO.md`
(seção 17). Entregar ao Lucas: URL, link de acesso do André, checklist de aceite (seção 19) preenchido.

---

## 7. Modelo de dados (esqueleto obrigatório — pode adicionar coluna, nunca remover)

Regras gerais: `id uuid default gen_random_uuid()`, `created_at/updated_at timestamptz` (trigger
`set_updated_at`), `deleted_at timestamptz` (soft delete) em toda tabela de negócio, `created_by uuid`
referenciando `auth.users`. Índices em toda FK e em `deleted_at`. `check` em todo campo de status.

```sql
-- ===== Pessoas =====
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','executive')),
  full_name text not null,
  job_title text,                       -- "Executivo Key Account"
  responsibilities text,                -- descrição das funções (André preenche; não inventar)
  phone text, email text, avatar_url text,
  timezone text not null default 'America/Sao_Paulo',
  must_change_password boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table notification_settings (
  user_id uuid primary key references profiles(id) on delete cascade,
  push_enabled boolean not null default true,
  email_enabled boolean not null default false,
  quiet_start time not null default '21:00', quiet_end time not null default '07:00',
  agenda_lead_minutes int[] not null default '{1440,60}',
  daily_briefing_time time not null default '07:30',
  weekly_report_reminder boolean not null default true,   -- sexta 15h
  overdue_digest boolean not null default true,           -- 08:00 pendências vencidas/hoje
  updated_at timestamptz not null default now()
);

-- ===== Distribuidoras (42) =====
create table distributors (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,            -- 'bidfood', 'apetito', 'gapeixoto', 'pmg'
  name text not null, brand_name text, cnpj text, website text, phone text, email text,
  address text, city text, state text, region text,
  status text not null check (status in ('prospect','em_contato','amostra','homologacao','ativo','inativo','perdido')),
  status_label text,                    -- frase livre do André ("Cliente ativo — compra mensal em toneladas")
  summary text, relationship_nature text,
  size_estimate text,                   -- porte/faturamento estimado (texto, com fonte)
  awareness_current numeric, awareness_target numeric,   -- % (null = sem dado; nunca 0 por default)
  sellout_pct numeric,                  -- % manual (André atualiza); null = sem dado
  priority int not null default 100,    -- ordem no painel (order do seed)
  is_pilot boolean not null default false,
  tags text[] not null default '{}',
  next_action text, next_action_due date,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz
);
create table distributor_metrics (       -- evolução mensal para o BI (André preenche; nada inventado)
  id uuid primary key default gen_random_uuid(),
  distributor_id uuid not null references distributors(id) on delete cascade,
  period date not null,                 -- primeiro dia do mês
  sellout_kg numeric, sellout_brl numeric, awareness_pct numeric, notes text, source text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (distributor_id, period)
);
create table contacts (
  id uuid primary key default gen_random_uuid(),
  distributor_id uuid not null references distributors(id) on delete cascade,
  name text not null, nickname text, role text, area text, scope text, status text,
  phone text, whatsapp text, email text,
  is_decision_maker boolean not null default false,
  flag boolean not null default false,  -- atenção (ex.: conflito Gustavo/Otávio)
  notes text, last_contact_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz
);
create table key_accounts (              -- clientes finais (contas-chave)
  id uuid primary key default gen_random_uuid(),
  distributor_id uuid references distributors(id) on delete set null,   -- null = cliente direto (ex.: Pronto Light)
  name text not null, segment text, city text, state text,
  contact_name text, contact_phone text, status text,
  products_of_interest text[] not null default '{}', notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz
);

-- ===== Produtos Alfama =====
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  line text not null check (line in ('porcionados_bovino_bifes','porcionados_bovino_cubos_tiras','porcionados_ave','desfiados','moidos')),
  sku text unique, spec text, pack_format text, unit text,
  price numeric, price_updated_at timestamptz,          -- null até o André preencher
  is_active boolean not null default true, sort_order int not null default 100, notes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz
);
create table distributor_products (      -- mix: o que cada distribuidora já compra
  distributor_id uuid references distributors(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  status text not null check (status in ('compra','em_teste','amostra_entregue','interesse','nao_compra')),
  since date, monthly_volume_kg numeric, notes text,
  updated_at timestamptz not null default now(),
  primary key (distributor_id, product_id)
);

-- ===== Operação =====
create table daily_reports (             -- "Registro da distribuidora": diário de bordo, não relatório formal
  id uuid primary key default gen_random_uuid(),
  distributor_id uuid not null references distributors(id) on delete cascade,
  occurred_at timestamptz not null,
  entry_type text not null check (entry_type in ('visita','ligacao','mensagem','reuniao','amostra','observacao','outro')),
  summary text not null, details text, next_steps text,
  contact_ids uuid[] not null default '{}', key_account_ids uuid[] not null default '{}',
  attachments jsonb not null default '[]',              -- [{path, name, mime, size}] no bucket anexos
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz
);
create table pending_items (
  id uuid primary key default gen_random_uuid(),
  distributor_id uuid references distributors(id) on delete cascade,
  key_account_id uuid references key_accounts(id) on delete set null,
  complaint_id uuid, visit_report_id uuid, appointment_id uuid,     -- FKs adicionadas após criar as tabelas
  title text not null, description text,
  status text not null default 'aberta' check (status in ('aberta','em_andamento','concluida','cancelada')),
  priority text not null default 'media' check (priority in ('baixa','media','alta','critica')),
  owner text not null default 'andre' check (owner in ('andre','distribuidora','alfama_interno','outro')),
  origin text not null default 'manual' check (origin in ('manual','visit_follow_up','complaint','agenda','seed')),
  due_date date, completed_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz
);
create table appointments (              -- agenda interna (Outlook/Teams é futuro)
  id uuid primary key default gen_random_uuid(),
  distributor_id uuid references distributors(id) on delete set null,
  key_account_id uuid references key_accounts(id) on delete set null,
  contact_id uuid references contacts(id) on delete set null,
  title text not null, description text, location text,
  starts_at timestamptz not null, ends_at timestamptz,
  kind text not null default 'reuniao' check (kind in ('reuniao','visita','ligacao','prazo','outro')),
  status text not null default 'agendado' check (status in ('agendado','confirmado','realizado','cancelado','remarcado')),
  remind_minutes_before int[] not null default '{1440,60}',
  outcome text, daily_report_id uuid references daily_reports(id) on delete set null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz
);
create table strategies (
  id uuid primary key default gen_random_uuid(),
  distributor_id uuid not null references distributors(id) on delete cascade,
  title text not null, objective text, description text,
  kpi text, target_value numeric, current_value numeric,
  status text not null default 'ideia' check (status in ('ideia','planejada','em_execucao','concluida','descartada')),
  start_date date, end_date date,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz
);
create table visit_reports (             -- piso obrigatório da Marcelle (seção 11)
  id uuid primary key default gen_random_uuid(),
  date date not null,
  period_start date not null, period_end date not null, period_label text not null,   -- seg–sex, "24 a 28/08"
  client_name text not null, segment text, contact_name text, contact_number text, status text,
  sample_given boolean not null default false, product text, quantity text,
  needs_follow_up boolean not null default false, obs text,
  distributor_id uuid references distributors(id) on delete set null,
  key_account_id uuid references key_accounts(id) on delete set null,
  follow_up_pending_item_id uuid references pending_items(id) on delete set null,
  attachments jsonb not null default '[]',
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz
);

-- ===== Reclamações (módulo independente das 42) =====
create table checklist_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null, description text,
  items jsonb not null default '[]',    -- [{id, label, required}]
  is_default boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz
);
create table complaints (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  distributor_id uuid references distributors(id) on delete set null,
  key_account_id uuid references key_accounts(id) on delete set null,
  product_id uuid references products(id) on delete set null, product_text text,
  nature text not null check (nature in ('produto','servico','entrega','comercial','outro')),
  description text not null,
  severity text not null default 'media' check (severity in ('baixa','media','alta')),
  status text not null default 'aberta' check (status in ('aberta','em_analise','em_recuperacao','recuperado','perdido','encerrada')),
  opened_at date not null, closed_at date, outcome text,
  checklist_template_id uuid references checklist_templates(id) on delete set null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz
);
create table complaint_actions (         -- ações tomadas: bonificação, visita, conversa...
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references complaints(id) on delete cascade,
  action_type text not null check (action_type in ('bonificacao','visita','conversa','troca','desconto','amostra','outro')),
  description text, done_at date not null, cost numeric,
  created_by uuid references auth.users(id), created_at timestamptz not null default now()
);
create table complaint_checklist_items ( -- instância do modelo, ajustável por cliente
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references complaints(id) on delete cascade,
  label text not null, required boolean not null default false,
  done boolean not null default false, done_at timestamptz, notes text, sort_order int not null default 100
);

-- ===== Notificações, auditoria, saúde =====
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  type text not null,                   -- agenda_reminder | pending_due | follow_up | complaint_stale | weekly_report | daily_briefing | system
  title text not null, body text, url text,
  dedupe_key text not null unique,      -- ex.: 'agenda:<id>:1440' — impede duplicata
  read_at timestamptz, push_sent_at timestamptz, email_sent_at timestamptz,
  created_at timestamptz not null default now()
);
create table push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  endpoint text not null unique, p256dh text not null, auth text not null,
  user_agent text, failed_count int not null default 0,
  created_at timestamptz not null default now(), last_used_at timestamptz
);
create table audit_log (
  id bigserial primary key,
  table_name text not null, row_id uuid, operation text not null,   -- INSERT | UPDATE | DELETE
  actor_id uuid, row_before jsonb, row_after jsonb,
  changed_at timestamptz not null default now()
);
create table cron_runs (
  id bigserial primary key,
  job text not null, started_at timestamptz not null default now(), finished_at timestamptz,
  status text not null default 'running' check (status in ('running','ok','error')),
  summary jsonb not null default '{}', error text
);
```

Complementos obrigatórios na mesma migration:

- `create or replace function set_updated_at()` + trigger `before update` em toda tabela com `updated_at`.
- **Auditoria**: função `audit_row()` (`security definer`) que grava `to_jsonb(OLD)`/`to_jsonb(NEW)` e
  `auth.uid()` em `audit_log`; trigger `after insert or update or delete` em **todas** as tabelas de negócio
  (não em `notifications`, `push_subscriptions`, `cron_runs`).
- **RLS** ligada em tudo. Helper `is_app_user()` (`security definer`, `stable`): existe `profiles` com
  `id = auth.uid()` e `is_active`. Policies `for all to authenticated using (is_app_user()) with check
  (is_app_user())` nas tabelas de negócio; `notifications`/`push_subscriptions`/`notification_settings` só
  do próprio usuário (`user_id = auth.uid()`); `audit_log` e `cron_runs` só leitura para `is_app_user()`.
  `anon` não tem nenhuma policy.
- Storage: buckets `anexos` e `backups` privados, policies para `authenticated` com `is_app_user()`.
- Realtime: `alter publication supabase_realtime add table notifications;`
- Views SQL úteis para o BI: `v_distributor_overview` (contagem de contatos, contas-chave, pendências
  abertas/vencidas, último registro, próximo compromisso por distribuidora) e `v_week_activity` (registros e
  visitas por semana).
- Função `weekly_report(p_week_start date)` retornando JSON consolidado (seção 11) — ou faça em TypeScript em
  `lib/rules/weekly-report.ts` com teste; escolha uma e documente.

---

## 8. Telas e navegação

**Desktop** (uso principal de gestão): sidebar fixa com o **cartão de identificação** no topo (avatar com
iniciais, "André Silva Santana", "Executivo Key Account", ícone de gravata — lucide não tem, faça um SVG
próprio em `components/brand/tie-icon.tsx`), busca global (`Ctrl/Cmd+K`), sino de notificações com contador,
grupos de navegação. Conteúdo com KPIs, tabelas (`@tanstack/react-table`, ordenação, filtro, paginação) e
gráficos.

**Mobile** (campo): bottom nav com 5 itens — **Hoje · Distribuidoras · [+] · Agenda · Mais**. O `[+]` abre
um sheet de ação rápida (seção 9). Tabelas viram cards. Alvos de toque ≥ 44px. Formulários em uma coluna,
teclado certo por campo (`inputmode`), datas com o picker nativo.

| Rota | Conteúdo |
|---|---|
| `/entrar`, `/esqueci-senha`, `/redefinir-senha` | Auth (Supabase e-mail/senha). Sessão longa no celular (refresh automático). |
| `/` **Hoje** | Cockpit do dia (seção 9). É a home no celular e no PC. |
| `/painel` | **Painel geral BI**: distribuidoras por status (funil prospect → ativo), ativos vs prospects, pendências abertas/vencidas, visitas e registros da semana, reclamações abertas, próximo compromisso; **barra de awareness/sell-out por distribuidora** (atual vs meta; sem dado = "sem dado", nunca 0); evolução mensal (de `distributor_metrics`); cards das distribuidoras com **busca e filtros** (nome, UF/região, status, faixa de sell-out, tags, piloto) — já preparado para 42+. |
| `/distribuidoras` | Lista/cards com os mesmos filtros + alternância **kanban por status** (arrastar muda status, com confirmação). Botão "Nova distribuidora" (cadastro básico, o resto vem depois). |
| `/distribuidoras/[slug]` | **7 abas**: Visão geral (cadastro, natureza, porte/faturamento estimado, awareness atual × meta, **mix de produtos Alfama** (matriz `distributor_products`), timeline dos últimos eventos, próxima ação) · Contatos · Contas-chave · **Registro da distribuidora** (era "Relatórios": log contínuo) · Estratégias de sell-out · Pendências · Agenda. No celular: ações de contexto no topo — Registrar agora, Ligar, WhatsApp, Abrir no Maps. |
| `/contatos`, `/contas-chave` | Listas globais com busca; cada contato com `tel:` e `wa.me`; badge de atenção quando `flag = true` (mostra `notes`). |
| `/agenda` | Mês / semana / lista. No celular, lista "próximos". Criar/editar compromisso com lembretes configuráveis (1 dia e 1 h por padrão). Compromisso passado sem resultado pede "O que aconteceu?" e cria o registro na distribuidora. |
| `/pendencias` | Global: vencidas / hoje / semana / todas; por distribuidora, prioridade, responsável. Concluir em 1 toque. |
| `/visitas`, `/visitas/nova` | Relatórios de visita (piso da Marcelle). Ao marcar "precisa retorno", cria pendência ligada (`origin = visit_follow_up`, vencimento +7 dias, editável). |
| `/relatorio-semanal` | Seleciona a semana → consolidado (seção 11) → **Exportar .xlsx** / **Copiar texto**. |
| `/reclamacoes`, `/reclamacoes/[id]`, `/reclamacoes/modelos` | Módulo independente (seção 12). |
| `/produtos` | Catálogo editável inline (linha, SKU, especificação, embalagem, preço, ativo). Histórico de preço via auditoria. |
| `/notificacoes`, `/configuracoes/notificacoes` | Caixa de entrada + preferências (push, e-mail, horários de silêncio, antecedências). |
| `/perfil` | Nome, cargo, descrição das funções/obrigações (André escreve), foto, trocar senha. |
| `/exportar`, `/lixeira` | Backup manual (seção 14) e restauração. |
| `/admin/*` (só `role = admin`) | Usuários (criar, desativar, gerar link de senha), saúde dos crons (`cron_runs`), enviar push de teste, ver `audit_log`. |

Estados vazios com texto útil ("Nenhuma conta-chave cadastrada ainda. Cadastre a primeira a partir de uma
visita."), nunca dado fictício. Loading com skeleton. Erros com toast e mensagem humana.

---

## 9. Rotina de campo e usabilidade real (o que faz o André usar todo dia)

1. **Tela Hoje** (home): saudação com data; **próximos compromissos** (hoje e amanhã) com botão "Registrar
   resultado"; **pendências vencidas e de hoje**; **follow-ups devidos** (visitas com retorno pendente);
   **compromissos passados sem resultado** (ex.: reunião com Gustavo 18/09 — o seed já nasce assim, pois hoje
   é 19/09); **reclamações paradas** há mais de 7 dias; resumo da semana (visitas, registros, contatos novos);
   na sexta, o card "Fechar relatório da semana" com atalho.
2. **Ação rápida `[+]`** (mobile e desktop): Registro na distribuidora · Relatório de visita · Pendência ·
   Compromisso · Reclamação. Cada formulário salva em **3 toques** no cenário comum: distribuidora
   pré-selecionada quando aberto de dentro dela, data = agora, tipo default. Campos avançados atrás de
   "mais detalhes".
3. **Rascunho que não se perde**: todo formulário guarda rascunho no aparelho (localStorage, só como cache)
   e reenvia quando a rede volta; a fonte de verdade continua sendo o banco. Mostrar "rascunho salvo neste
   aparelho" e "enviado" claramente.
4. **Ditado por voz** nos campos de texto longo quando o navegador suportar (Web Speech API); botão some se
   não suportar. Anexar foto (cartão de visita, gôndola, nota) → Storage `anexos`.
5. **Ações de contexto**: telefone abre `tel:`, WhatsApp abre `wa.me/55...`, endereço abre o Maps,
   website abre em nova aba. Contato recebe `last_contact_at` quando aparece num registro.
6. **Sincronização PC ↔ celular**: dados sempre do servidor (server components + `revalidatePath`);
   revalidar ao voltar o foco/visibilidade da aba; Realtime na tabela `notifications` para o sino atualizar
   sozinho. Nada de cache local como verdade.
7. **Busca global** (`Ctrl/Cmd+K` no PC, lupa no celular): distribuidoras, contatos, contas-chave, produtos,
   reclamações. Resultado abre direto na ficha.
8. **Timeline por distribuidora**: registros, visitas, pendências, compromissos e reclamações num só fio
   cronológico — é o que o André abre antes de entrar na distribuidora.
9. **Fricção zero para o piso da gerente**: o relatório de visita tem exatamente os campos dela na ordem da
   planilha; o período é calculado sozinho (seção 11).

---

## 10. Notificações e lembretes (arquitetura obrigatória)

Camadas: **in-app** (tabela `notifications`, sino com contador, caixa de entrada) → **push** (PWA + Web
Push/VAPID, funciona no Android e no iOS 16.4+ com o app instalado na tela inicial) → **e-mail** (opcional,
Resend, só se `RESEND_API_KEY` existir; sem ela, pular em silêncio).

Motor: rota `POST /api/cron/reminders` protegida por `Authorization: Bearer <CRON_SECRET>`, idempotente
(usa `dedupe_key`), roda a cada 15 min via **pg_cron + pg_net** (padrão DDG; independe do plano da Vercel).
Registra cada execução em `cron_runs`. Horários em `America/Sao_Paulo`. Respeita horário de silêncio
(padrão 21h–7h: guarda e entrega às 7h).

```sql
select cron.schedule('alfama_reminders', '*/15 * * * *', $$
  select net.http_post(
    url := 'https://alfama.dosedegrowth.com/api/cron/reminders',
    headers := jsonb_build_object('Content-Type','application/json',
      'Authorization','Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')),
    body := '{}'::jsonb);
$$);
select cron.schedule('alfama_backup', '0 3 * * 1', $$ ...mesmo padrão, url .../api/cron/backup... $$);
```

Regras (todas com `dedupe_key` e link direto para a tela certa):

| Tipo | Quando | dedupe_key |
|---|---|---|
| `agenda_reminder` | X min antes de cada compromisso (`remind_minutes_before`, padrão 1 dia e 1 h) | `agenda:<id>:<min>` |
| `agenda_no_outcome` | compromisso passou há 2 h sem `outcome` | `agenda_outcome:<id>` |
| `pending_due` | 08:00: pendências vencendo hoje + vencidas (uma notificação agrupada por dia) | `pending:<date>` |
| `follow_up` | pendência com `origin = visit_follow_up` vence hoje | `followup:<id>` |
| `complaint_stale` | reclamação aberta sem ação/atualização há 7 dias (repete a cada 7) | `complaint:<id>:<yyyy-ww>` |
| `weekly_report` | sexta 15:00 se houve visita/registro na semana | `weekly:<yyyy-ww>` |
| `daily_briefing` | 07:30: "Seu dia": compromissos, pendências, follow-ups (push + e-mail opcional) | `briefing:<date>` |

Criação de follow-up não depende do cron: ao salvar visita com `needs_follow_up = true`, a server action cria
a pendência ligada na hora. Ao concluir a pendência, a visita mostra "retorno feito".

PWA: `app/manifest.ts`, ícones, `public/sw.js` (eventos `push` e `notificationclick` abrindo a `url`),
banner "Instalar app" (Android) e instruções para iPhone (Compartilhar → Adicionar à Tela de Início), tela
de permissão explicando o benefício antes de pedir. Endpoint `POST /api/push/subscribe` guarda em
`push_subscriptions`; envio com `web-push`; assinatura que falhar 3× é removida. `/admin` tem "Enviar push
de teste".

---

## 11. Relatório semanal (view computada) e relatório de visita (piso da Marcelle)

**Planilha da gerente** (modelo recebido): organizada por período, ex. `PERÍODO 24 a 28/08`, uma linha por
visita, colunas nesta ordem: **CLIENTE · DATA · SEGMENTO · CONTATO · NÚMERO · STATUS · AMOSTRA · PRODUTO ·
QUANTIDADE · RETORNO · OBSERVAÇÕES**. Isso é o piso: `visit_reports` tem exatamente esses campos
(`client_name, date, segment, contact_name, contact_number, status, sample_given, product, quantity,
needs_follow_up, obs`) + `distributor_id`/`key_account_id` opcionais + período.

**Período**: semana útil segunda–sexta. `period_start` = segunda da semana da `date`, `period_end` = sexta,
`period_label` = `"24 a 28/08"` (dia a dia/mês; se cruzar mês, `"29/09 a 03/10"`). Sábado/domingo entram na
semana daquela segunda. Implementar em `lib/rules/period.ts` com testes.

**Relatório semanal** (`/relatorio-semanal?semana=YYYY-WW`): não é tabela. Agrega, da semana:

1. Visitas a contas-chave (`visit_reports`) — tabela no formato da Marcelle.
2. Idas a distribuidoras (`daily_reports`) — por distribuidora: o que aconteceu, próximos passos.
3. Pessoas conhecidas (contatos criados ou mencionados na semana).
4. Compromissos realizados, pendências abertas/concluídas, amostras entregues, retornos pendentes.

Saídas: **Exportar .xlsx** (`exceljs`): aba "Visitas" com o cabeçalho `PERÍODO <label>` e as 11 colunas na
ordem exata; aba "Distribuidoras" com o diário; aba "Resumo". **Copiar como texto** (para WhatsApp/Teams).
André não preenche nada à parte — só confere e envia.

---

## 12. Reclamações e checklists de recuperação

Módulo **independente das 42**: cliente direto (ex.: Pronto Light) ou conta-chave de uma distribuidora
(vínculo opcional). Ficha: cliente, natureza, produto envolvido, descrição, gravidade, status de recuperação
(`aberta → em_analise → em_recuperacao → recuperado | perdido → encerrada`), data de abertura, resultado.
**Ações tomadas** (`complaint_actions`): bonificação, visita, conversa, troca, desconto, amostra, com data e
custo opcional. **Checklist**: ao aplicar um modelo (`checklist_templates`), os itens são copiados para
`complaint_checklist_items` e viram ajustáveis por cliente (marcar, anotar, adicionar item). Modelos são
CRUD em `/reclamacoes/modelos`. Nasce **sem** modelo pré-cadastrado; oferecer botão "Criar primeiro modelo"
com campos vazios. Reclamação parada 7 dias gera lembrete (seção 10).

---

## 13. Produtos Alfama

Catálogo em `/produtos`, **editável inline pelo André** (linha, nome, SKU, especificação, embalagem, preço,
ativo). Preço `null` mostra "sem preço"; ao preencher, grava `price_updated_at` e o histórico fica no
`audit_log` (mostrar "Histórico de preço" na linha). Mix por distribuidora na aba Visão geral
(`distributor_products`, status: compra / em teste / amostra entregue / interesse / não compra). Seed: os 22
produtos da seção 16, sem preço, sem SKU (campo vazio até o André informar).

---

## 14. Proteção de dados ("nunca perder dado nenhum")

1. **Auditoria total** por trigger (seção 7): toda linha antes/depois, quem e quando. Tela "Histórico" em
   cada ficha (admin vê tudo em `/admin/auditoria`).
2. **Lixeira**: exclusão é `deleted_at`; `/lixeira` lista por tipo e restaura em 1 clique; purga só manual
   pelo admin.
3. **Exportar tudo** (`/exportar`): ZIP com `alfama-select-<data>.json` (todas as tabelas) + um CSV por
   tabela + o XLSX do relatório semanal corrente. Gerado no servidor, sem limite de linhas.
4. **Backup automático**: cron semanal `POST /api/cron/backup` grava o mesmo ZIP no bucket privado
   `backups/` (retenção 12 semanas) e registra em `cron_runs`. `/admin/saude` mostra o último backup e
   permite baixar.
5. **Supabase**: documentar no RUNBOOK como restaurar (backups diários do plano Pro / PITR se contratado) e
   recomendar ao Lucas o plano com backup diário para este projeto. O export semanal é a rede de segurança
   caso o plano seja gratuito.
6. **Formulários** com rascunho local e reenvio (seção 9) — evita perder o que foi digitado na rua.

---

## 15. Identidade visual

- **Modo escuro por padrão**, estilo painel de BI (referência do André: DataSense e 3 imagens de dashboards
  escuros que ele mandou — ficaram no histórico do chat dele; se o Lucas tiver, ele anexa). Fundo escuro,
  cartões com contraste sutil, gráficos limpos. **Só gráfico que ajuda decisão**; nada decorativo.
- **Identidade Alfama, não o site institucional.** O site usa branco com acento bordô/magenta; aqui a cor
  da marca entra **como acento sobre fundo escuro**, nunca como fundo. Cores observadas no site oficial
  (`alfama.com.br`): bordô `#BC204B` e rosa-coral `#D16384`. **O logo oficial manda**: peça ao Lucas o
  arquivo (`public/brand/alfama-logo.svg`); se os hex do logo forem diferentes, use os do logo.
- Tokens sugeridos (Tailwind v4, `@theme` em `app/globals.css`): fundo `#0E0F13`, superfície `#15171D`,
  superfície elevada `#1C1F27`, borda `#2A2E3A`, texto `#E8E9EE`, texto secundário `#9BA0AE`, acento
  `--brand: #BC204B`, acento suave `--brand-soft: #D16384`, sucesso `#22C55E`, alerta `#F59E0B`, erro
  `#EF4444`, info `#60A5FA`. Gráficos: acento da marca para a série principal, neutros para o resto.
- **Tipografia séria**: Inter (corpo) + Inter Tight (títulos e KPIs), números tabulares (`tabular-nums`) em
  tabelas e cartões. Sem fonte decorativa, sem emoji na UI.
- **Cartão de identificação** executivo (crachá): iniciais, nome completo, cargo, ícone de gravata, filete
  na cor da marca. Sidebar no PC; cabeçalho da aba "Mais" no celular.
- Comportamento **CRM + BI**: pipeline (kanban por status), cadastro, histórico (timeline) + indicadores,
  evolução de awareness, funil de distribuidoras.
- Responsivo de verdade: sem scroll horizontal, gutter 16px no celular, tabelas viram cards.

---

## 16. Seed — dados iniciais (usar exatamente como está)

Marcações de fonte dos dossiês do André: [OFICIAL]/[PESQUISA]/[INTERNO]/[HIPÓTESE]. Não completar nenhum
`[INFORMAÇÃO PENDENTE]`. Mapear `id` → `slug`, `brandName` → `brand_name`, `natureza` →
`relationship_nature`, `order` → `priority`, `awarenessAtual/awarenessMeta` → `awareness_current/
awareness_target` (só Bidfood tem; as outras ficam `null`), `statusLabel` → `status_label`. Todas as 4 com
`is_pilot = true`. Extrair `city/state` do endereço quando inequívoco; senão deixar vazio.

### distributors (4)

```json
[
{"id":"bidfood","name":"BidFood","brandName":"Grupo Bidfood — Distribuidora e Importadora Irmãos Avelino S.A. (marcas Irmãos Avelino, Mariusso, Vinhais)","cnpj":"02.814.340/0001-81","website":"bidfood.com.br","phone":"(11) 4146-7000","address":"Rua Jacofer, 255/321 (divergência entre fontes) — Jardim Pereira Leite (Limão), São Paulo/SP — CEP 02712-070 (unidade Vinhais). Outras unidades: Carapicuíba, Centro, Paulínia.","status":"ativo","statusLabel":"Cliente ativo — compra mensal em toneladas","summary":"Operação brasileira de grupo global de distribuição food service (23 países), 3 marcas no Brasil. Estrutura regionalizada com gerentes por unidade. Diferenciais: entrega multitemperatura em 24h, importação própria, app myBidfood.","natureza":"Canal de distribuição já ativo — o trabalho é gestão/expansão de conta, não homologação do zero.","order":1,"awarenessAtual":0.5,"awarenessMeta":10},
{"id":"apetito","name":"Apetito Foods","brandName":"Apetito Foods Ltda (nome histórico: Carnes San Pedro)","cnpj":"00.474.763/0001-74","website":"apetitofoods.com.br","phone":"(11) 2206-7979","address":"Rua Capitão Alcock, 530 — Jardim Brasil, São Paulo/SP — CEP 02234-010 (divergência: André se refere como Guarulhos)","status":"prospect","statusLabel":"Prospect — primeira visita de campo em 16/09/2026","summary":"Distribuidora atacadista multicategoria fundada em 1995, sócios Monica Paula Guaglini Garcia Antunes e Edvilson Moura Nunes. 4 CNPJs. Sem key account formal.","natureza":"Venda de canal — entrar no mix de fornecedores homologados.","order":2},
{"id":"gapeixoto","name":"Gapeixoto / PXT","brandName":"Gapeixoto Distribuidora de Produtos Alimentícios LTDA — marca comercial PXT Alimentos","cnpj":"18.765.188/0001-24","website":"pxtalimentos.com.br / pxtonline.com.br","phone":"[INFORMAÇÃO PENDENTE]","address":"Americana/SP (matriz) e Serra Negra/SP (filial) — cobertura de 200+ cidades do interior paulista","status":"ativo","statusLabel":"Cliente ativo — 3 dos 6 SKUs de Desfiados confirmados no catálogo online","summary":"Distribuidora atacadista multimarca do interior paulista, 2.000+ SKUs. Sócio-fundador Gustavo Andreolli Peixoto.","natureza":"Expansão de mix — já compra e revende Desfiados Alfama.","order":3},
{"id":"pmg","name":"PMG Atacadista","brandName":"Pama Comércio de Gêneros Alimentícios Ltda (marca PMG)","cnpj":"11.660.951/0001-03","website":"pmg.com.br","phone":"(11) 5645-0000","address":"Rua Ada Negri, 96/104 — Santo Amaro, São Paulo/SP — CEP 04755-000 (loja) · CD em Itapecerica da Serra/SP","status":"prospect","statusLabel":"Prospect — nenhum contato comercial iniciado ainda","summary":"Atacadista regional (SP), 31 anos de mercado, 22.000+ clientes, 2.100+ SKUs, 280+ veículos refrigerados.","natureza":"Venda de canal — linha de hambúrguer dominada por Friboi/Seara/Sadia; Desfiados parece espaço em branco.","order":4}
]
```

Observação de mix: Gapeixoto tem "3 dos 6 SKUs de Desfiados confirmados", mas **quais 3 não foi
levantado** — não criar linhas em `distributor_products`; deixar a nota na ficha e uma pendência "Confirmar
quais 3 Desfiados a PXT já revende".

### contacts (12)

```json
[
{"id":"c_bf_felipe","distributorId":"bidfood","name":"Felipe","nickname":"Felipinho","role":"Comprador","area":"Compras","scope":"Unidade não confirmada","status":"Contato de conta ativa","flag":false},
{"id":"c_bf_fernanda","distributorId":"bidfood","name":"Fernanda","role":"Gerente","area":"Vendas","scope":"BidFood Centro","status":"Identificada — sem contato direto ainda","flag":false},
{"id":"c_bf_fernando","distributorId":"bidfood","name":"Fernando Avelino","role":"Diretor Comercial","area":"Diretoria","scope":"Grupo/Irmãos Avelino","status":"Identificado — sem contato direto confirmado","flag":false},
{"id":"c_bf_gustavo","distributorId":"bidfood","name":"Gustavo","role":"Key Account","area":"Vendas — Key Account","scope":"Grupo/BidFood","status":"Reunião marcada 18/09/2026, 14h","flag":true,"notes":"Conflito não resolvido: pode ser a mesma pessoa que Otávio ou pessoa diferente. Não confundir com Luiz Gustavo (interno Alfama) nem com Gustavo Andreolli Peixoto (Gapeixoto)."},
{"id":"c_bf_mari","distributorId":"bidfood","name":"Mari","role":"Gerente","area":"Vendas","scope":"BidFood Carapicuíba","status":"Identificada — sem contato direto ainda","flag":false},
{"id":"c_bf_otavio","distributorId":"bidfood","name":"Otávio","role":"Estratégia de vendas — Key Account","area":"Vendas — Key Account","scope":"Grupo","status":"Contato relevante para crescer via clientes finais estratégicos","flag":false},
{"id":"c_bf_wagner","distributorId":"bidfood","name":"Wagner","role":"Gerente","area":"Vendas","scope":"BidFood Paulínia","status":"Identificado — unidade confirmada","flag":false},
{"id":"c_ap_edvilson","distributorId":"apetito","name":"Edvilson Moura Nunes","role":"Sócio-administrador","area":"Diretoria","scope":"Matriz","status":"Sócio desde 2012 — decisor provável","flag":false},
{"id":"c_ap_monica","distributorId":"apetito","name":"Monica Paula Guaglini Garcia Antunes","role":"Sócia-administradora","area":"Diretoria","scope":"Matriz","status":"Sócia desde 1998 — decisora provável","flag":false},
{"id":"c_gp_gustavo","distributorId":"gapeixoto","name":"Gustavo Andreolli Peixoto","role":"Sócio-administrador","area":"Diretoria","scope":"Matriz (Americana/SP)","status":"Fundador desde 2013","flag":true,"notes":"Não confundir com o 'Gustavo' (Key Account) da conta BidFood — são pessoas diferentes."},
{"id":"c_pmg_marcos","distributorId":"pmg","name":"Marcos Antônio Nunes","role":"Presidente Financeiro","area":"Diretoria","scope":"Matriz","status":"Sócio-fundador desde 2010","flag":false},
{"id":"c_pmg_paulo","distributorId":"pmg","name":"Paulo Rogério Ramos de Oliveira","role":"Presidente Comercial","area":"Diretoria","scope":"Matriz","status":"Sócio-fundador desde 2010","flag":false}
]
```

Contatos com `"flag": true` mantêm `notes` e aparecem com badge de atenção. Marcar Edvilson, Monica, Gustavo
Peixoto, Marcos e Paulo como `is_decision_maker = true` (são sócios/presidentes); os demais `false`.

### pending_items (16), appointments (1), daily_reports (1)

Esses registros já estão validados no protótipo Cowork:
**https://claude.ai/artifact/737RuTt1TKTeURYCaLuM9Z** (coleções `pendingItems`, `agenda`, `dailyReports`).
Extraia de lá **literalmente** (ferramenta de leitura de artifact, ou peça ao Lucas para abrir o protótipo e
colar/exportar o JSON das três coleções). **Não retranscreva de memória e não invente.** Se o artifact não
abrir na sua sessão, pare este passo, peça o JSON ao Lucas e continue as outras fases enquanto espera.
Mapeamento: pendências recebem `origin = 'seed'`; o compromisso é a reunião com Gustavo (BidFood) em
**18/09/2026 14:00** — seed com `status = 'agendado'` e sem `outcome` (já passou; a tela Hoje vai cobrar o
resultado, é o comportamento certo); o diário é da Apetito (visita de 16/09/2026), `entry_type = 'visita'`.

### products (22, sem preço, sem SKU)

| line | Nome | Especificação | Embalagem |
|---|---|---|---|
| porcionados_bovino_bifes | Alcatra Bifes | 170g, 1,5cm | pacote 2kg / 12un |
| porcionados_bovino_bifes | Coxão Mole Bifes | 150g, 1,5cm | pacote 2kg / 14un |
| porcionados_bovino_bifes | Patinho Bifes | 150g, 1,4cm | pacote 2kg / 14un |
| porcionados_bovino_bifes | Paleta Bifes | 130g, 1,3cm | pacote 2kg / 16un |
| porcionados_bovino_cubos_tiras | Filé Mignon Cubos | 2x2x2cm | — |
| porcionados_bovino_cubos_tiras | Alcatra Tiras | 4x1,5x1,5cm | — |
| porcionados_bovino_cubos_tiras | Bovino Iscas Slice | 4x2,5cm | — |
| porcionados_bovino_cubos_tiras | Patinho Cubos | 2x2x2cm | — |
| porcionados_bovino_cubos_tiras | Patinho Tiras | 4x1,5x1,5cm | — |
| porcionados_bovino_cubos_tiras | Acém Cubos | 3x3x3cm | — |
| porcionados_bovino_cubos_tiras | Carne Seca Cubos / Curada | 3x3x3cm | — |
| porcionados_ave | Peito de Frango Bifes | 130g, 1,2cm | pacote 2kg / 16un |
| porcionados_ave | Peito de Frango Cubos | 2x2x2cm | — |
| porcionados_ave | Peito de Frango Tiras | 4x1,5x1,5cm | — |
| desfiados | Carne Desfiada Bovina Carne Seca | — | pacote 1kg, caixa master 6x1kg |
| desfiados | Carne Desfiada Bovina Costela | — | pacote 1kg, caixa master 6x1kg |
| desfiados | Carne Desfiada Bovina Cupim | — | pacote 1kg, caixa master 6x1kg |
| desfiados | Carne Desfiada Bovina Carne de Sol | — | pacote 1kg, caixa master 6x1kg |
| desfiados | Peito de Frango Desfiado | — | pacote 1kg, caixa master 6x1kg |
| desfiados | Pernil Suíno Desfiado | — | pacote 1kg, caixa master 6x1kg |
| moidos | Carne Moída Light | 9% gordura | 1kg |
| moidos | Carne Moída Tradicional | até 18% gordura | 1kg |

`[INFORMAÇÃO PENDENTE]`: preço de cada SKU, código SKU, disponibilidade regional, condição comercial. Campos
vazios até o André preencher na plataforma. Embalagem "—" = não informada (deixar `null`).

### key_accounts, strategies, complaints, checklist_templates, visit_reports, distributor_metrics

**Vazias.** Nenhum dado real levantado. Não inventar linha de exemplo.

### profiles

André: `full_name = 'André Silva Santana'`, `job_title = 'Executivo Key Account'`, `role = 'executive'`,
`responsibilities = null` (ele escreve). Lucas: `role = 'admin'`. E-mails: seção 20.

---

## 17. Fase 2 — expansão para 42 (preparar agora, executar quando as planilhas chegarem)

- Nenhuma estrutura nova. As 38 entram como linhas em `distributors` (cadastro básico) e, quando
  aprofundadas, em `contacts`, `distributor_products`, `key_accounts`.
- Criar `docs/FASE-2-IMPORTACAO.md` com: (1) modelo de planilha de importação (colunas = campos de
  `distributors` + uma aba `produtos_comprados` com `slug_distribuidora, produto, status, volume_mensal_kg`);
  (2) tela `/admin/importar` que aceita `.xlsx/.csv`, valida com Zod, mostra prévia (novas × existentes por
  CNPJ/slug) e só então grava — nunca sobrescreve sem confirmar; (3) o padrão de **dossiê** usado nas 4
  primeiras (cadastro, natureza do relacionamento, o que a distribuidora compra/consome no geral, quais
  produtos Alfama já compra, contatos, pendências) para o Claude montar o mesmo para cada uma das 38 a
  partir das planilhas do André.
- Filtros, busca e paginação do painel já devem aguentar 42+ desde o piloto.

---

## 18. Pendências e atenções (carregar na tela de Pendências como itens de sistema, não resolver sozinho)

- **[PENDENTE]** Planilhas das 38 distribuidoras restantes → expandir seed e dossiês (seção 17).
- **[PENDENTE]** Tabela de preços dos produtos Alfama → André preenche em `/produtos`.
- **[FUTURO — não bloqueia]** Outlook/Teams: sincronizar a agenda em mão dupla. Depende de registro de app
  no Azure AD pelo TI da Alfama (contato: Vinícius Barbosa). Não é só código.
- **[FUTURO]** DataSense e **Vision**: André ainda não tem acesso às ferramentas. Nada a integrar.
- **[ATENÇÃO]** "Gustavo" (Key Account, BidFood) ≠ "Gustavo Andreolli Peixoto" (sócio, Gapeixoto).
  Possível sobreposição "Gustavo" × "Otávio" na BidFood ainda não resolvida (reunião de 18/09 deveria
  esclarecer — cobrar resultado na tela Hoje).
- **[ATENÇÃO]** Endereço da Apetito Foods: Guarulhos (André) × São Paulo (CNPJ). Não resolvido.
- **[RESOLVIDO]** Nome da plataforma (Alfama Select), cargo do crachá (Executivo Key Account), modelo do
  relatório de visita (recebido da gerente).

---

## 19. Critérios de aceite (entregar esta lista preenchida com evidência)

- [ ] `npx tsc --noEmit` = 0 erros · `npx next build` passa · `node --test lib/rules/*.test.ts` passa
      (período semanal, agregação do relatório, regras de lembrete/dedupe, horário de silêncio).
- [ ] Playwright smoke passa contra o deploy: login → Hoje → criar registro → aparece na aba Registro e no
      relatório semanal → exportar XLSX abre com o cabeçalho `PERÍODO ...` e as 11 colunas na ordem →
      excluir e restaurar da lixeira.
- [ ] Seed conferido por contagem: 4 distribuidoras (`is_pilot`), 12 contatos (2 com flag), 22 produtos
      (preço `null`), 16 pendências, 1 compromisso (18/09/2026 14:00, sem resultado), 1 diário (Apetito).
      Coleções vazias continuam vazias.
- [ ] URL de produção no ar com HTTPS, login e senha funcionando, cadastro público desligado, `anon` sem
      acesso a nenhuma tabela (testar com a anon key via REST: deve voltar vazio/erro).
- [ ] PWA instalável; push de teste recebido no celular do Lucas; cron `alfama_reminders` com execução `ok`
      em `/admin/saude`; lembrete de compromisso chegou no horário.
- [ ] Auditoria registrando insert/update/delete; histórico visível na ficha; export ZIP baixado e aberto;
      backup semanal agendado (`cron.job` lista `alfama_reminders` e `alfama_backup`).
- [ ] Responsivo: sem scroll horizontal no celular, bottom nav, ação rápida em 3 toques, `tel:`/`wa.me`
      funcionando.
- [ ] Docs entregues: `README.md`, `CLAUDE.md`, `AGENTS.md`, `docs/RUNBOOK.md`, `docs/MANUAL-ANDRE.md`,
      `docs/FASE-2-IMPORTACAO.md`.
- [ ] Nenhum segredo no repo (`git log -p | grep -iE "service_role|vapid_private|resend_"` vazio) e
      `.env.local` ignorado.

---

## 20. O que perguntar ao Lucas antes de começar (uma única mensagem; o resto segue com os defaults)

1. **E-mail de login do André** (obrigatório para criar o usuário e para "esqueci minha senha").
2. **E-mail do Lucas** para o usuário admin (default: o e-mail da conta DDG).
3. Supabase: **projeto novo** `alfama-select` na org DDG (default) ou schema no projeto existente?
4. Domínio: `alfama.dosedegrowth.com` (default) — quem cria o CNAME? Se o DNS estiver na Vercel, você mesmo
   adiciona via `add_project_domain`.
5. **Logo da Alfama** em SVG/PNG (para o crachá, PWA e paleta). Sem ele, seguir com os tokens da seção 15.
6. Tem `RESEND_API_KEY` para o resumo diário por e-mail? (Sem ela, in-app + push apenas.)
7. As 3 imagens de referência de dashboard que o André mandou — se o Lucas tiver, anexar.

Depois das respostas (ou dos defaults), execute as fases 1 a 11 sem parar para perguntar, salvo bloqueio
real. Comece confirmando em 5 linhas o que entendeu da arquitetura e da rotina do André, e vá para a Fase 1.
