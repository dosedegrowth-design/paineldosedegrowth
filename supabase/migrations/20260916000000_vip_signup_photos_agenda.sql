-- ============================================================
-- Tayssa Lash · cadastro com aprovação, biblioteca de fotos e
-- agenda no admin. Aplicada em 16/set/2026.
-- ============================================================

-- ---------- cadastro: a cliente pede acesso, a Tayssa aprova ----------
-- users.status ganha 'pending' (pediu) e 'rejected' (recusada).
do $$
declare c text;
begin
  select conname into c
    from pg_constraint
   where conrelid = 'vip.users'::regclass
     and contype = 'c'
     and pg_get_constraintdef(oid) like '%status%';
  if c is not null then
    execute format('alter table vip.users drop constraint %I', c);
  end if;
end $$;

alter table vip.users
  add constraint users_status_check
  check (status in ('pending', 'active', 'inactive', 'suspended', 'rejected'));

alter table vip.users
  add column if not exists signup_source text not null default 'admin'
    check (signup_source in ('admin', 'self')),
  add column if not exists signup_message text,
  add column if not exists requested_at timestamptz,
  add column if not exists reviewed_at timestamptz,
  add column if not exists reviewed_by uuid references vip.users(id),
  add column if not exists review_note text;

create index if not exists users_pending_idx on vip.users (requested_at)
  where status = 'pending';

-- ---------- fotos: uma biblioteca, um upload, vários consumidores ----------
create table if not exists vip.photos (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  public_url text not null,
  lash_style text not null,                 -- volume/estilo (ex.: "Volume brasileiro")
  caption text,
  alt text not null,
  width integer,
  height integer,
  status text not null default 'active' check (status in ('active', 'archived')),
  featured boolean not null default false,  -- entra no herói / frente do cartão
  sort_order integer not null default 0,
  created_by uuid references vip.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists photos_active_idx on vip.photos (status, featured desc, sort_order, created_at desc);
drop trigger if exists photos_updated_at on vip.photos;
create trigger photos_updated_at before update on vip.photos
  for each row execute function vip.set_updated_at();
alter table vip.photos enable row level security;

-- bucket público: a URL da foto é estável e servida pelo CDN da Supabase
insert into storage.buckets (id, name, public)
values ('tayssa-fotos', 'tayssa-fotos', true)
on conflict (id) do nothing;

-- ---------- agenda: quem confirmou/cancelou ----------
alter table vip.appointments
  add column if not exists reviewed_by uuid references vip.users(id),
  add column if not exists reviewed_at timestamptz;

-- ---------- configurações do cadastro ----------
insert into vip.settings (key, value) values (
  'signup',
  '{"open": true, "welcome_template": "Oi, {name}! Seu acesso ao Tayssa Lash foi liberado. Defina sua senha por aqui: {url}"}'::jsonb
) on conflict (key) do update set value = excluded.value;
