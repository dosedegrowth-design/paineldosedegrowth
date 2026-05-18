-- ============================================================
-- DDG Disparador · Migration inicial
-- 2026-05-18
-- Schema: disparador
-- Modelo: auto-sync de WABAs via System User token (1 token por BM)
-- ============================================================

create schema if not exists disparador;
grant usage on schema disparador to anon, authenticated, service_role;

-- ============================================================
-- BUSINESS MANAGERS (1 token por BM, compartilhado entre WABAs)
-- ============================================================

create table disparador.businesses (
  id uuid primary key default gen_random_uuid(),
  meta_business_id text not null unique,
  display_name text not null,
  token_vault_key text not null,
  system_user_id text,
  meta_app_id text,
  ativo boolean default true,
  ultima_sync_meta timestamptz,
  criado_em timestamptz default now(),
  atualizado_em timestamptz default now()
);

create index idx_businesses_ativo on disparador.businesses(ativo) where ativo = true;

-- ============================================================
-- CONTAS = WABA + Phone Number (auto-sync da Meta)
-- ativo=false por default: usuario marca manualmente quais quer usar
-- ============================================================

create table disparador.contas (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references disparador.businesses(id) on delete cascade,
  waba_id text not null,
  phone_number_id text not null,
  display_name text not null,
  waba_name text,
  phone_number_display text,
  tier text check (tier in ('TIER_50','TIER_250','TIER_1K','TIER_10K','TIER_100K','TIER_UNLIMITED')) default 'TIER_1K',
  quality_rating text check (quality_rating in ('GREEN','YELLOW','RED','UNKNOWN')) default 'UNKNOWN',
  messaging_limit_per_day integer,
  origem text check (origem in ('OWNED','CLIENT')) default 'CLIENT',
  ativo boolean default false,
  observacoes text,
  ultima_sync_meta timestamptz,
  criado_em timestamptz default now(),
  atualizado_em timestamptz default now(),
  unique (waba_id, phone_number_id)
);

create index idx_contas_business on disparador.contas(business_id, ativo);
create index idx_contas_phone on disparador.contas(phone_number_id);

-- ============================================================
-- TEMPLATES (sync da Meta — chave por waba_id)
-- ============================================================

create table disparador.templates (
  id uuid primary key default gen_random_uuid(),
  waba_id text not null,
  business_id uuid references disparador.businesses(id) on delete cascade,
  meta_id text,
  name text not null,
  language text not null default 'pt_BR',
  category text check (category in ('MARKETING','UTILITY','AUTHENTICATION')) not null,
  status text check (status in ('PENDING','APPROVED','REJECTED','DISABLED','PAUSED')) not null default 'PENDING',
  components jsonb not null,
  variables_count integer default 0,
  rejection_reason text,
  quality_score text,
  ultima_sync_meta timestamptz,
  criado_em timestamptz default now(),
  atualizado_em timestamptz default now(),
  unique (waba_id, name, language)
);

create index idx_templates_waba on disparador.templates(waba_id, status);
create index idx_templates_status on disparador.templates(status);

-- ============================================================
-- UPLOADS (arquivos CSV/XLSX brutos)
-- ============================================================

create table disparador.uploads (
  id uuid primary key default gen_random_uuid(),
  conta_id uuid not null references disparador.contas(id) on delete cascade,
  storage_path text not null,
  filename_original text not null,
  total_linhas integer not null default 0,
  total_validos integer not null default 0,
  total_invalidos integer not null default 0,
  column_mapping jsonb,
  validacao_errors jsonb,
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
  custo_estimado_brl numeric(10,2),
  scheduled_at timestamptz,
  started_at timestamptz,
  finished_at timestamptz,
  paused_reason text,
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
  telefone text not null,
  telefone_raw text,
  variables jsonb,
  message_id text,
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
-- TRIGGERS
-- ============================================================

create or replace function disparador.set_atualizado_em()
returns trigger language plpgsql as $$
begin
  new.atualizado_em = now();
  return new;
end $$;

create trigger trg_businesses_upd before update on disparador.businesses
  for each row execute function disparador.set_atualizado_em();
create trigger trg_contas_upd before update on disparador.contas
  for each row execute function disparador.set_atualizado_em();
create trigger trg_templates_upd before update on disparador.templates
  for each row execute function disparador.set_atualizado_em();
create trigger trg_campanhas_upd before update on disparador.campanhas
  for each row execute function disparador.set_atualizado_em();

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
-- RPC: leitura de token do Vault (security definer)
-- ============================================================

create or replace function disparador.get_token(secret_name text)
returns text
language plpgsql
security definer
set search_path = vault, pg_temp
as $$
declare
  s text;
begin
  select decrypted_secret into s
  from vault.decrypted_secrets
  where name = secret_name
  limit 1;
  return s;
end $$;

revoke all on function disparador.get_token(text) from public, anon, authenticated;
grant execute on function disparador.get_token(text) to service_role;

-- ============================================================
-- RLS
-- ============================================================

alter table disparador.businesses enable row level security;
alter table disparador.contas enable row level security;
alter table disparador.templates enable row level security;
alter table disparador.campanhas enable row level security;
alter table disparador.envios enable row level security;
alter table disparador.uploads enable row level security;

create policy "auth_all_businesses" on disparador.businesses for all to authenticated using (true) with check (true);
create policy "auth_all_contas" on disparador.contas for all to authenticated using (true) with check (true);
create policy "auth_all_templates" on disparador.templates for all to authenticated using (true) with check (true);
create policy "auth_all_campanhas" on disparador.campanhas for all to authenticated using (true) with check (true);
create policy "auth_all_envios" on disparador.envios for all to authenticated using (true) with check (true);
create policy "auth_all_uploads" on disparador.uploads for all to authenticated using (true) with check (true);

grant all on all tables in schema disparador to service_role;
grant all on all sequences in schema disparador to service_role;

-- ============================================================
-- STORAGE BUCKET
-- ============================================================

insert into storage.buckets (id, name, public)
values ('disparador-uploads', 'disparador-uploads', false)
on conflict (id) do nothing;

-- ============================================================
-- POSTGREST: expor schema disparador via API
-- (executar manualmente se nao foi feito; necessita SUPERUSER)
-- ============================================================
-- alter role authenticator set pgrst.db_schemas = 'public,...,disparador';
-- notify pgrst, 'reload config';
