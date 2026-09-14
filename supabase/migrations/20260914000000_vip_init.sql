-- ============================================================
-- Tayssa VIP · schema `vip` · migration inicial
-- 2026-09-14
--
-- Clube privado de clientes de uma profissional de beleza:
-- fidelidade por pontos, indicação com validação, aniversário,
-- benefícios genéricos com aprovação da administradora.
--
-- Acesso SOMENTE via service_role (server actions do Next).
-- RLS ligado em todas as tabelas SEM policies => anon/authenticated
-- não leem nada pela REST. Autorização acontece no servidor (DAL).
--
-- Precisa estar em "Exposed schemas" do PostgREST (pgrst.db_schemas).
-- ============================================================

create schema if not exists vip;
grant usage on schema vip to service_role;

create or replace function vip.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ------------------------------------------------------------
-- Pessoas: clientes e administradora
-- ------------------------------------------------------------
create table vip.users (
  id uuid primary key default gen_random_uuid(),
  role text not null check (role in ('client', 'admin')),
  email text not null,
  name text not null,
  nickname text,
  phone text,                       -- dígitos E.164 sem '+', ex.: 5511999999999
  password_hash text,               -- null até a cliente definir a senha pelo link
  status text not null default 'active' check (status in ('active', 'inactive', 'suspended')),
  last_login_at timestamptz,
  created_by uuid references vip.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index users_email_lower_idx on vip.users (lower(email));
create index users_phone_idx on vip.users (phone);
create trigger users_updated_at before update on vip.users
  for each row execute function vip.set_updated_at();

create table vip.client_profiles (
  user_id uuid primary key references vip.users(id) on delete cascade,
  birthday date,
  vip_status text not null default 'none' check (vip_status in ('none', 'active', 'suspended')),
  vip_since timestamptz,
  vip_level text not null default 'vip',   -- reservado p/ níveis futuros (vip, vip_plus, private)
  referral_code text unique,
  notes text,
  updated_at timestamptz not null default now()
);
create trigger client_profiles_updated_at before update on vip.client_profiles
  for each row execute function vip.set_updated_at();

-- ------------------------------------------------------------
-- Autenticação própria (senha com scrypt, sessão em cookie httpOnly)
-- ------------------------------------------------------------
create table vip.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references vip.users(id) on delete cascade,
  token_hash text not null unique,  -- sha256 do token que vive no cookie
  user_agent text,
  ip text,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz
);
create index sessions_user_idx on vip.sessions (user_id);

create table vip.password_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references vip.users(id) on delete cascade,
  token_hash text not null unique,
  purpose text not null check (purpose in ('setup', 'reset')),
  expires_at timestamptz not null,
  used_at timestamptz,
  created_by uuid references vip.users(id),
  created_at timestamptz not null default now()
);
create index password_tokens_user_idx on vip.password_tokens (user_id);

-- ------------------------------------------------------------
-- Catálogo de serviços (pontos configuráveis)
-- ------------------------------------------------------------
create table vip.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  point_value integer not null default 0 check (point_value >= 0),
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger services_updated_at before update on vip.services
  for each row execute function vip.set_updated_at();

-- Atendimentos: só contam depois de aprovados pela administradora
create table vip.client_services (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references vip.users(id) on delete cascade,
  service_id uuid references vip.services(id) on delete set null,
  service_name text not null,       -- snapshot do nome na época
  service_date date not null,
  amount numeric(10, 2),
  points integer not null default 0 check (points >= 0),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  notes text,
  submitted_by text not null check (submitted_by in ('client', 'admin')),
  submitted_at timestamptz not null default now(),
  reviewed_by uuid references vip.users(id),
  reviewed_at timestamptz,
  review_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index client_services_client_idx on vip.client_services (client_id, status, service_date desc);
create index client_services_pending_idx on vip.client_services (submitted_at) where status = 'pending';
create trigger client_services_updated_at before update on vip.client_services
  for each row execute function vip.set_updated_at();

-- ------------------------------------------------------------
-- Indicações (públicas ou pelo VIP) — só 'approved' conta
-- ------------------------------------------------------------
create table vip.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_user_id uuid references vip.users(id) on delete set null,
  referrer_name text,
  referrer_phone text,
  referred_name text not null,
  referred_phone text not null,     -- dígitos normalizados
  note text,
  source text not null check (source in ('public', 'vip')),
  status text not null default 'pending'
    check (status in ('pending', 'contacted', 'scheduled', 'completed', 'approved', 'rejected')),
  status_note text,
  completed_at timestamptz,
  approved_at timestamptz,
  reviewed_by uuid references vip.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index referrals_referrer_idx on vip.referrals (referrer_user_id, status);
create index referrals_referred_phone_idx on vip.referrals (referred_phone);
-- uma mesma pessoa só pode ser contabilizada uma vez
create unique index referrals_referred_once_idx on vip.referrals (referred_phone) where status <> 'rejected';
create trigger referrals_updated_at before update on vip.referrals
  for each row execute function vip.set_updated_at();

-- ------------------------------------------------------------
-- Motor de benefícios (genérico, extensível)
-- ------------------------------------------------------------
create table vip.benefits (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  description text,
  type text not null check (type in ('loyalty', 'referral', 'birthday', 'custom')),
  threshold integer,
  threshold_unit text check (threshold_unit in ('points', 'referrals', 'services')),
  validity_days integer,
  requires_approval boolean not null default true,
  active boolean not null default true,
  sort_order integer not null default 0,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger benefits_updated_at before update on vip.benefits
  for each row execute function vip.set_updated_at();

-- Ciclo de vida: pending_validation -> available -> requested -> approved -> redeemed
--                                    \-> rejected      qualquer um -> expired
create table vip.client_benefits (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references vip.users(id) on delete cascade,
  benefit_id uuid not null references vip.benefits(id) on delete cascade,
  cycle_key text not null,          -- ex.: 'loyalty:100', 'referral:1', 'birthday:2026'
  status text not null default 'pending_validation'
    check (status in ('pending_validation', 'available', 'requested', 'approved', 'redeemed', 'expired', 'rejected')),
  title text not null,
  description text,
  eligible_at timestamptz not null default now(),
  available_at timestamptz,
  requested_at timestamptz,
  approved_at timestamptz,
  redeemed_at timestamptz,
  rejected_at timestamptz,
  expires_at timestamptz,
  client_note text,
  admin_note text,
  created_by uuid references vip.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_id, benefit_id, cycle_key)
);
create index client_benefits_client_idx on vip.client_benefits (client_id, status);
create index client_benefits_status_idx on vip.client_benefits (status, created_at desc);
create trigger client_benefits_updated_at before update on vip.client_benefits
  for each row execute function vip.set_updated_at();

create table vip.blackout_periods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  starts_on date not null,
  ends_on date not null check (ends_on >= starts_on),
  benefit_types text[] not null default '{birthday}',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table vip.settings (
  key text primary key,
  value jsonb not null,
  updated_by uuid references vip.users(id),
  updated_at timestamptz not null default now()
);

create table vip.audit_log (
  id bigint generated always as identity primary key,
  actor_user_id uuid references vip.users(id) on delete set null,
  actor_role text,
  action text not null,
  entity_type text,
  entity_id text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index audit_log_action_idx on vip.audit_log (action, created_at desc);
create index audit_log_entity_idx on vip.audit_log (entity_type, entity_id);

-- ------------------------------------------------------------
-- Segurança: RLS ligado sem policies; só service_role acessa
-- ------------------------------------------------------------
alter table vip.users enable row level security;
alter table vip.client_profiles enable row level security;
alter table vip.sessions enable row level security;
alter table vip.password_tokens enable row level security;
alter table vip.services enable row level security;
alter table vip.client_services enable row level security;
alter table vip.referrals enable row level security;
alter table vip.benefits enable row level security;
alter table vip.client_benefits enable row level security;
alter table vip.blackout_periods enable row level security;
alter table vip.settings enable row level security;
alter table vip.audit_log enable row level security;

grant all on all tables in schema vip to service_role;
grant all on all sequences in schema vip to service_role;
alter default privileges in schema vip grant all on tables to service_role;
alter default privileges in schema vip grant all on sequences to service_role;

-- ------------------------------------------------------------
-- Seeds de configuração (tudo editável no admin)
-- ------------------------------------------------------------
insert into vip.settings (key, value) values
  ('business', '{
    "name": "Tayssa",
    "tagline": "Private Beauty Experience",
    "specialty": "Cílios e embelezamento do olhar",
    "whatsapp": "5511999827606",
    "instagram_url": "https://www.instagram.com/1.tayssa/",
    "instagram_handle": "@1.tayssa"
  }'::jsonb),
  ('rules', '{
    "vip_min_services": 4,
    "inactivity_days": 30,
    "benefit_validity_days": 60
  }'::jsonb),
  ('birthday', '{
    "window_days_before": 3,
    "window_days_after": 3,
    "once_per_year": true,
    "rules": [
      "Exclusivo para clientes com acesso VIP ativo.",
      "Pode ser usado uma vez por ano, na semana do seu aniversário.",
      "Precisa de agendamento e depende da disponibilidade da agenda.",
      "É pessoal e intransferível.",
      "Não vira dinheiro, desconto ou crédito.",
      "Não acumula com outras condições especiais.",
      "Em dezembro a agenda pode ter restrições.",
      "A Tayssa confirma cada benefício."
    ]
  }'::jsonb),
  ('whatsapp', '{
    "public_schedule": "Oi, Tayssa! Vi seu site e quero agendar um atendimento.",
    "public_vip_info": "Oi, Tayssa! Quero saber mais sobre a experiência VIP.",
    "public_refer": "Oi, Tayssa! Quero indicar alguém pra conhecer seu trabalho.",
    "vip_support": "Oi, Tayssa! Aqui é {name}, do VIP.",
    "vip_refer": "Oi, Tayssa! Quero indicar uma nova cliente pelo meu acesso VIP.",
    "benefit_request": "Oi, Tayssa! Aqui é {name}. Quero agendar meu benefício: {benefit}.",
    "birthday_request": "Oi, Tayssa! Aqui é {name} e quero agendar meu benefício de aniversário.",
    "inactive_outreach": "Oi, {name}! Faz um tempinho que não te vejo por aqui. Que tal marcarmos sua próxima manutenção?"
  }'::jsonb)
on conflict (key) do nothing;

insert into vip.services (slug, name, description, point_value, sort_order) values
  ('aplicacao-cilios', 'Aplicação de cílios', 'Aplicação completa, fio a fio ou volume.', 40, 1),
  ('manutencao-cilios', 'Manutenção de cílios', 'Manutenção periódica da aplicação.', 25, 2),
  ('design-sobrancelhas', 'Design de sobrancelhas', 'Design e acabamento.', 15, 3),
  ('lip-spa', 'Lip spa', 'Hidratação e cuidado dos lábios.', 15, 4),
  ('limpeza-de-pele', 'Limpeza de pele', 'Facial e limpeza profunda.', 30, 5),
  ('outro', 'Outro atendimento', 'Serviço avulso definido pela Tayssa.', 10, 99)
on conflict (slug) do nothing;

insert into vip.benefits (key, name, description, type, threshold, threshold_unit, validity_days, sort_order, config) values
  ('loyalty_100', 'Primeiro marco', 'Um cuidado extra, escolhido pela Tayssa, no seu próximo atendimento.', 'loyalty', 100, 'points', 60, 1, '{}'),
  ('loyalty_250', 'Cliente de casa', 'Um benefício especial definido pela Tayssa para quem já faz parte da rotina do estúdio.', 'loyalty', 250, 'points', 60, 2, '{}'),
  ('referral_reward', 'Indicação confirmada', '10% de desconto no seu próximo atendimento.', 'referral', 3, 'referrals', 60, 3, '{"percent": 10}'),
  ('birthday', 'Experiência de aniversário', 'Um presente escolhido pela Tayssa para a semana do seu aniversário.', 'birthday', null, null, 14, 4, '{}')
on conflict (key) do nothing;
