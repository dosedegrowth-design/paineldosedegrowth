-- ============================================================
-- Tráfego DDG · Migration inicial
-- 2026-04-28
-- ============================================================

-- Schema dedicado
create schema if not exists trafego_ddg;
grant usage on schema trafego_ddg to anon, authenticated, service_role;

-- ============================================================
-- CORE: Clientes e acessos
-- ============================================================

create table trafego_ddg.clientes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  slug text unique not null,
  cor_primaria text default '#F15839',
  cor_secundaria text default '#E3D4A6',
  logo_url text,
  cac_maximo numeric,
  ticket_medio numeric,
  ativo boolean default true,
  criado_em timestamptz default now(),
  atualizado_em timestamptz default now()
);

create table trafego_ddg.clientes_acessos (
  cliente_id uuid primary key references trafego_ddg.clientes(id) on delete cascade,
  google_customer_id text,
  google_login_customer_id text,
  google_oauth_refresh_token text,
  meta_ad_account_id text,
  meta_long_lived_token text,
  meta_business_id text,
  meta_pixel_id text,
  painel_comercial_webhook_secret text,
  ultima_sync_google timestamptz,
  ultima_sync_meta timestamptz,
  ultima_sync_status text,
  atualizado_em timestamptz default now()
);

create table trafego_ddg.clientes_users (
  cliente_id uuid references trafego_ddg.clientes(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text check (role in ('adm_geral', 'gestor_ddg', 'viewer_cliente')) not null,
  criado_em timestamptz default now(),
  primary key (cliente_id, user_id)
);

create index idx_users_cliente on trafego_ddg.clientes_users(user_id);

-- ============================================================
-- SNAPSHOTS (source of truth)
-- ============================================================

create table trafego_ddg.campanhas_snapshot (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references trafego_ddg.clientes(id) on delete cascade,
  plataforma text check (plataforma in ('google', 'meta')) not null,
  campanha_id text not null,
  campanha_nome text,
  objetivo text,
  status text,
  data date not null,
  investimento numeric default 0,
  impressoes bigint default 0,
  cliques bigint default 0,
  ctr numeric,
  cpc numeric,
  conversoes numeric default 0,
  cpa numeric,
  receita numeric default 0,
  roas numeric,
  raw_jsonb jsonb,
  sincronizado_em timestamptz default now(),
  unique (cliente_id, plataforma, campanha_id, data)
);

create index idx_camp_cliente_data on trafego_ddg.campanhas_snapshot(cliente_id, data desc);
create index idx_camp_plat on trafego_ddg.campanhas_snapshot(plataforma, data desc);

create table trafego_ddg.adsets_snapshot (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references trafego_ddg.clientes(id) on delete cascade,
  plataforma text check (plataforma in ('google', 'meta')) not null,
  campanha_id text not null,
  adset_id text not null,
  adset_nome text,
  status text,
  data date not null,
  investimento numeric default 0,
  impressoes bigint default 0,
  cliques bigint default 0,
  conversoes numeric default 0,
  receita numeric default 0,
  raw_jsonb jsonb,
  unique (cliente_id, plataforma, adset_id, data)
);

create table trafego_ddg.ads_snapshot (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references trafego_ddg.clientes(id) on delete cascade,
  plataforma text check (plataforma in ('google', 'meta')) not null,
  adset_id text,
  ad_id text not null,
  ad_nome text,
  thumbnail_url text,
  thumbnail_storage_path text,
  headline text,
  description text,
  cta text,
  status text,
  data date not null,
  investimento numeric default 0,
  impressoes bigint default 0,
  cliques bigint default 0,
  conversoes numeric default 0,
  receita numeric default 0,
  raw_jsonb jsonb,
  unique (cliente_id, plataforma, ad_id, data)
);

-- Google-specific
create table trafego_ddg.keywords_snapshot (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references trafego_ddg.clientes(id) on delete cascade,
  campanha_id text not null,
  adgroup_id text,
  keyword text,
  match_type text,
  quality_score int,
  data date not null,
  investimento numeric default 0,
  cliques bigint default 0,
  conversoes numeric default 0,
  unique (cliente_id, campanha_id, keyword, match_type, data)
);

create table trafego_ddg.search_terms (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references trafego_ddg.clientes(id) on delete cascade,
  termo text not null,
  campanha_id text,
  adgroup_id text,
  gasto_total numeric default 0,
  cliques_total bigint default 0,
  conversoes_total numeric default 0,
  status text default 'ativo' check (status in ('ativo','negativada_pendente','negativada')),
  acao_em timestamptz,
  acao_por uuid references auth.users(id),
  primeiro_visto date,
  ultimo_visto date,
  unique (cliente_id, termo, campanha_id)
);

-- ============================================================
-- INTELIGÊNCIA: Anomalias e Mudanças
-- ============================================================

create table trafego_ddg.anomalias (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references trafego_ddg.clientes(id) on delete cascade,
  tipo text not null,
  severidade text check (severidade in ('baixa','media','alta','critica')) not null,
  metrica text not null,
  entidade_tipo text,
  entidade_id text,
  entidade_nome text,
  valor_atual numeric,
  baseline_7d numeric,
  baseline_14d numeric,
  desvio_percentual numeric,
  descricao text,
  narrativa_ia text,
  detectada_em timestamptz default now(),
  resolvida_em timestamptz,
  resolvida_por uuid references auth.users(id)
);

create index idx_anom_cliente_status on trafego_ddg.anomalias(cliente_id, resolvida_em) where resolvida_em is null;
create index idx_anom_severidade on trafego_ddg.anomalias(severidade, detectada_em desc);

create table trafego_ddg.mudancas (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references trafego_ddg.clientes(id) on delete cascade,
  plataforma text check (plataforma in ('google','meta')) not null,
  entidade_tipo text not null,
  entidade_id text not null,
  entidade_nome text,
  campo text not null,
  valor_antes text,
  valor_depois text,
  feita_por uuid references auth.users(id),
  feita_em timestamptz default now(),
  metricas_antes_jsonb jsonb,
  metricas_apos_7d_jsonb jsonb,
  metricas_apos_14d_jsonb jsonb,
  metricas_apos_21d_jsonb jsonb,
  narrativa_ia text,
  veredicto text check (veredicto in ('positiva','negativa','neutra','aguardando')) default 'aguardando'
);

create index idx_mud_cliente on trafego_ddg.mudancas(cliente_id, feita_em desc);
create index idx_mud_aguardando on trafego_ddg.mudancas(veredicto, feita_em) where veredicto = 'aguardando';

-- ============================================================
-- ⭐ DIFERENCIAL: Server-side conversions
-- ============================================================

create table trafego_ddg.eventos_offline (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references trafego_ddg.clientes(id) on delete cascade,
  origem text not null,
  origem_lead_id text,
  tipo_evento text not null,
  valor numeric default 0,
  moeda text default 'BRL',
  -- match keys
  email_hash text,
  telefone_hash text,
  gclid text,
  fbclid text,
  fbp text,
  click_id_ddg text,
  -- envio
  ocorrido_em timestamptz not null,
  enviado_google_em timestamptz,
  enviado_google_status text,
  enviado_google_response jsonb,
  enviado_meta_em timestamptz,
  enviado_meta_status text,
  enviado_meta_response jsonb,
  tentativas int default 0,
  erro_msg text,
  raw_payload_jsonb jsonb,
  criado_em timestamptz default now()
);

create index idx_eventos_pendentes_google on trafego_ddg.eventos_offline(cliente_id, criado_em)
  where enviado_google_status is null or enviado_google_status = 'falha';
create index idx_eventos_pendentes_meta on trafego_ddg.eventos_offline(cliente_id, criado_em)
  where enviado_meta_status is null or enviado_meta_status = 'falha';

-- ============================================================
-- RELATÓRIOS
-- ============================================================

create table trafego_ddg.relatorios (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references trafego_ddg.clientes(id) on delete cascade,
  tipo text check (tipo in ('pdf','whatsapp','email','csv')) not null,
  periodo_inicio date,
  periodo_fim date,
  url_storage text,
  conteudo text,
  prompt_usado text,
  modelo_ia text,
  tokens_usados int,
  enviado_para text[],
  gerado_em timestamptz default now(),
  gerado_por uuid references auth.users(id)
);

create table trafego_ddg.relatorios_prompts (
  cliente_id uuid references trafego_ddg.clientes(id) on delete cascade,
  tipo text check (tipo in ('whatsapp_diario','pdf_semanal','pdf_mensal','email_semanal')),
  prompt text not null,
  ativo boolean default true,
  atualizado_em timestamptz default now(),
  primary key (cliente_id, tipo)
);

-- ============================================================
-- AUDITORIA + CONFIG
-- ============================================================

create table trafego_ddg.logs (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid references trafego_ddg.clientes(id) on delete set null,
  user_id uuid references auth.users(id),
  acao text not null,
  entidade text,
  entidade_id text,
  payload_jsonb jsonb,
  sucesso boolean default true,
  erro text,
  ip text,
  user_agent text,
  criado_em timestamptz default now()
);

create index idx_logs_cliente on trafego_ddg.logs(cliente_id, criado_em desc);
create index idx_logs_user on trafego_ddg.logs(user_id, criado_em desc);

create table trafego_ddg.config_global (
  chave text primary key,
  valor jsonb,
  descricao text,
  atualizado_em timestamptz default now()
);

create table trafego_ddg.config_alertas (
  cliente_id uuid references trafego_ddg.clientes(id) on delete cascade,
  metrica text not null,
  threshold_warn numeric,
  threshold_critical numeric,
  ativo boolean default true,
  primary key (cliente_id, metrica)
);

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================

alter table trafego_ddg.clientes enable row level security;
alter table trafego_ddg.clientes_acessos enable row level security;
alter table trafego_ddg.clientes_users enable row level security;
alter table trafego_ddg.campanhas_snapshot enable row level security;
alter table trafego_ddg.adsets_snapshot enable row level security;
alter table trafego_ddg.ads_snapshot enable row level security;
alter table trafego_ddg.keywords_snapshot enable row level security;
alter table trafego_ddg.search_terms enable row level security;
alter table trafego_ddg.anomalias enable row level security;
alter table trafego_ddg.mudancas enable row level security;
alter table trafego_ddg.eventos_offline enable row level security;
alter table trafego_ddg.relatorios enable row level security;
alter table trafego_ddg.relatorios_prompts enable row level security;
alter table trafego_ddg.logs enable row level security;
alter table trafego_ddg.config_alertas enable row level security;

-- Helper: verifica se user pertence ao cliente
create or replace function trafego_ddg.user_has_cliente(_cliente_id uuid)
returns boolean as $$
  select exists (
    select 1 from trafego_ddg.clientes_users
    where cliente_id = _cliente_id and user_id = auth.uid()
  );
$$ language sql security definer stable;

-- Helper: ADM Geral pode tudo
create or replace function trafego_ddg.user_is_adm_geral()
returns boolean as $$
  select exists (
    select 1 from trafego_ddg.clientes_users
    where user_id = auth.uid() and role = 'adm_geral'
  );
$$ language sql security definer stable;

-- Policies (mesma policy genérica em todas as tabelas com cliente_id)
do $$
declare
  t text;
begin
  for t in
    select unnest(array[
      'campanhas_snapshot','adsets_snapshot','ads_snapshot','keywords_snapshot',
      'search_terms','anomalias','mudancas','eventos_offline',
      'relatorios','relatorios_prompts','logs','config_alertas'
    ])
  loop
    execute format('
      create policy "cliente_access_%I" on trafego_ddg.%I
      for all using (trafego_ddg.user_is_adm_geral() or trafego_ddg.user_has_cliente(cliente_id))
      with check (trafego_ddg.user_is_adm_geral() or trafego_ddg.user_has_cliente(cliente_id));
    ', t, t);
  end loop;
end $$;

create policy "clientes_select" on trafego_ddg.clientes
  for select using (trafego_ddg.user_is_adm_geral() or trafego_ddg.user_has_cliente(id));
create policy "clientes_admin_all" on trafego_ddg.clientes
  for all using (trafego_ddg.user_is_adm_geral()) with check (trafego_ddg.user_is_adm_geral());

create policy "acessos_admin" on trafego_ddg.clientes_acessos
  for all using (trafego_ddg.user_is_adm_geral()) with check (trafego_ddg.user_is_adm_geral());

create policy "users_select" on trafego_ddg.clientes_users
  for select using (trafego_ddg.user_is_adm_geral() or user_id = auth.uid());
create policy "users_admin" on trafego_ddg.clientes_users
  for all using (trafego_ddg.user_is_adm_geral()) with check (trafego_ddg.user_is_adm_geral());

-- ============================================================
-- SEED inicial: cliente Petderma
-- ============================================================

insert into trafego_ddg.clientes (slug, nome, cor_primaria, cac_maximo, ticket_medio)
values ('petderma', 'Petderma', '#F15839', 80, 250)
on conflict (slug) do nothing;
