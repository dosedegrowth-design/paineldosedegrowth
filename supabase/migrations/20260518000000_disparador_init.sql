-- ============================================================
-- DDG Disparador · Migration inicial
-- 2026-05-18
-- Schema: disparador
-- ============================================================

create schema if not exists disparador;
grant usage on schema disparador to anon, authenticated, service_role;

-- ============================================================
-- CONTAS WABA (WhatsApp Business Accounts)
-- ============================================================

create table disparador.contas (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,                -- "SuperVisao Matriz", "LNB Maia"
  waba_id text not null unique,              -- WhatsApp Business Account ID (Meta)
  phone_number_id text not null unique,      -- Phone Number ID (Meta)
  phone_number_display text,                 -- "+55 11 99999-9999" pra UI
  token_vault_key text not null,             -- chave no Supabase Vault que guarda o access token
  tier text check (tier in ('TIER_50','TIER_250','TIER_1K','TIER_10K','TIER_100K','TIER_UNLIMITED')) default 'TIER_1K',
  quality_rating text check (quality_rating in ('GREEN','YELLOW','RED','UNKNOWN')) default 'UNKNOWN',
  messaging_limit_per_day integer,           -- cache do limite Meta
  ativo boolean default true,
  observacoes text,
  ultima_sync_meta timestamptz,
  criado_em timestamptz default now(),
  atualizado_em timestamptz default now()
);

create index idx_contas_ativo on disparador.contas(ativo) where ativo = true;

-- ============================================================
-- TEMPLATES (sync da Meta)
-- ============================================================

create table disparador.templates (
  id uuid primary key default gen_random_uuid(),
  conta_id uuid not null references disparador.contas(id) on delete cascade,
  meta_id text,                              -- ID do template na Meta (vem depois da aprovacao)
  name text not null,                        -- nome unico do template na WABA
  language text not null default 'pt_BR',
  category text check (category in ('MARKETING','UTILITY','AUTHENTICATION')) not null,
  status text check (status in ('PENDING','APPROVED','REJECTED','DISABLED','PAUSED')) not null default 'PENDING',
  components jsonb not null,                 -- header/body/footer/buttons da Meta
  variables_count integer default 0,         -- quantas {{N}} no body — pra UI mapear colunas
  rejection_reason text,
  quality_score text,                        -- HIGH/MEDIUM/LOW vindo da Meta
  ultima_sync_meta timestamptz,
  criado_em timestamptz default now(),
  atualizado_em timestamptz default now(),
  unique (conta_id, name, language)
);

create index idx_templates_conta on disparador.templates(conta_id, status);
create index idx_templates_status on disparador.templates(status);

-- ============================================================
-- UPLOADS (arquivos CSV/XLSX brutos)
-- ============================================================

create table disparador.uploads (
  id uuid primary key default gen_random_uuid(),
  conta_id uuid not null references disparador.contas(id) on delete cascade,
  storage_path text not null,                -- path no bucket disparador-uploads
  filename_original text not null,
  total_linhas integer not null default 0,
  total_validos integer not null default 0,
  total_invalidos integer not null default 0,
  column_mapping jsonb,                      -- { telefone: "phone", "1": "nome", "2": "valor" }
  validacao_errors jsonb,                    -- [{ linha: 5, erro: "telefone invalido" }]
  criado_por uuid references auth.users(id),
  criado_em timestamptz default now()
);

create index idx_uploads_conta on disparador.uploads(conta_id, criado_em desc);

-- ============================================================
-- CAMPANHAS
-- ============================================================

create table disparador.campanhas (
  id uuid primary key default gen_random_uuid(),
  conta_id uuid not null references disparador.contas(id) on delete cascade,
  template_id uuid not null references disparador.templates(id) on delete restrict,
  upload_id uuid references disparador.uploads(id) on delete set null,
  nome text not null,
  status text check (status in ('draft','scheduled','running','paused','done','cancelled','error')) not null default 'draft',
  pacing_per_sec integer not null default 3 check (pacing_per_sec between 1 and 80),
  total_contatos integer not null default 0,
  total_enviados integer not null default 0,
  total_entregues integer not null default 0,
  total_lidos integer not null default 0,
  total_falhados integer not null default 0,
  custo_estimado_brl numeric(10,2),          -- total_contatos * preco_por_msg
  scheduled_at timestamptz,
  started_at timestamptz,
  finished_at timestamptz,
  paused_reason text,                        -- "circuit-breaker", "manual", "tier-exceeded"
  criado_por uuid references auth.users(id),
  criado_em timestamptz default now(),
  atualizado_em timestamptz default now()
);

create index idx_campanhas_status on disparador.campanhas(status, criado_em desc);
create index idx_campanhas_conta on disparador.campanhas(conta_id, criado_em desc);

-- ============================================================
-- ENVIOS (1 linha por contato)
-- ============================================================

create table disparador.envios (
  id uuid primary key default gen_random_uuid(),
  campanha_id uuid not null references disparador.campanhas(id) on delete cascade,
  telefone text not null,                    -- formato E.164: 5511999999999 (sem +)
  telefone_raw text,                         -- como veio no CSV
  variables jsonb,                           -- { "1": "Joao", "2": "R$ 500" }
  message_id text,                           -- wamid retornado pela Meta
  status text check (status in ('pending','sending','sent','delivered','read','failed')) not null default 'pending',
  error_code text,
  error_message text,
  sent_at timestamptz,
  delivered_at timestamptz,
  read_at timestamptz,
  failed_at timestamptz,
  retry_count integer default 0,
  criado_em timestamptz default now()
);

create index idx_envios_campanha_status on disparador.envios(campanha_id, status);
create index idx_envios_message_id on disparador.envios(message_id) where message_id is not null;
create index idx_envios_telefone on disparador.envios(telefone);

-- ============================================================
-- TRIGGER: atualiza atualizado_em
-- ============================================================

create or replace function disparador.set_atualizado_em()
returns trigger language plpgsql as $$
begin
  new.atualizado_em = now();
  return new;
end $$;

create trigger trg_contas_upd before update on disparador.contas
  for each row execute function disparador.set_atualizado_em();
create trigger trg_templates_upd before update on disparador.templates
  for each row execute function disparador.set_atualizado_em();
create trigger trg_campanhas_upd before update on disparador.campanhas
  for each row execute function disparador.set_atualizado_em();

-- ============================================================
-- TRIGGER: atualiza contadores da campanha
-- ============================================================

create or replace function disparador.update_campanha_counters()
returns trigger language plpgsql as $$
begin
  update disparador.campanhas c
  set
    total_enviados = (select count(*) from disparador.envios where campanha_id = c.id and status in ('sent','delivered','read')),
    total_entregues = (select count(*) from disparador.envios where campanha_id = c.id and status in ('delivered','read')),
    total_lidos = (select count(*) from disparador.envios where campanha_id = c.id and status = 'read'),
    total_falhados = (select count(*) from disparador.envios where campanha_id = c.id and status = 'failed')
  where c.id = coalesce(new.campanha_id, old.campanha_id);
  return coalesce(new, old);
end $$;

create trigger trg_envios_counters
  after insert or update of status or delete on disparador.envios
  for each row execute function disparador.update_campanha_counters();

-- ============================================================
-- RLS
-- ============================================================

alter table disparador.contas enable row level security;
alter table disparador.templates enable row level security;
alter table disparador.campanhas enable row level security;
alter table disparador.envios enable row level security;
alter table disparador.uploads enable row level security;

-- Por enquanto: authenticated users tem acesso total.
-- TODO: refinar por cliente quando estrutura multi-tenant estiver definida.
create policy "auth read contas" on disparador.contas for select to authenticated using (true);
create policy "auth write contas" on disparador.contas for all to authenticated using (true) with check (true);

create policy "auth read templates" on disparador.templates for select to authenticated using (true);
create policy "auth write templates" on disparador.templates for all to authenticated using (true) with check (true);

create policy "auth read campanhas" on disparador.campanhas for select to authenticated using (true);
create policy "auth write campanhas" on disparador.campanhas for all to authenticated using (true) with check (true);

create policy "auth read envios" on disparador.envios for select to authenticated using (true);
create policy "auth write envios" on disparador.envios for all to authenticated using (true) with check (true);

create policy "auth read uploads" on disparador.uploads for select to authenticated using (true);
create policy "auth write uploads" on disparador.uploads for all to authenticated using (true) with check (true);

-- service_role bypass total (n8n + edge functions usam isso)
grant all on all tables in schema disparador to service_role;
grant all on all sequences in schema disparador to service_role;

-- ============================================================
-- STORAGE BUCKET
-- ============================================================

-- Bucket privado pra uploads de CSV/XLSX
insert into storage.buckets (id, name, public)
values ('disparador-uploads', 'disparador-uploads', false)
on conflict (id) do nothing;

create policy "auth upload disparador" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'disparador-uploads');

create policy "auth read disparador" on storage.objects
  for select to authenticated
  using (bucket_id = 'disparador-uploads');
