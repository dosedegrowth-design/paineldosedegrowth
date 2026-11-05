-- Conta da agenda (pedido do Lucas, 05/11/2026). Com o VIP fechado, a
-- cliente cria a conta na própria folha de agendar do site, só com nome,
-- WhatsApp e senha, e marca o horário ali mesmo. O WhatsApp é o login; o
-- e-mail fica opcional.

-- e-mail deixa de ser obrigatório (o índice único em lower(email) continua
-- valendo para quem tem e-mail; vários nulos não colidem)
alter table vip.users alter column email drop not null;

-- nova origem de conta: 'agenda' (criada na folha de agendar do site)
alter table vip.users drop constraint if exists users_signup_source_check;
alter table vip.users add constraint users_signup_source_check
  check (signup_source in ('admin', 'self', 'agenda'));

-- um WhatsApp, uma cliente: o login pelo número precisa achar uma pessoa só
-- (pedido recusado não segura o número)
create unique index if not exists users_cliente_phone_idx
  on vip.users (phone)
  where role = 'client' and phone is not null and status <> 'rejected';

-- Avisos no celular da Tayssa (pedido do Lucas, 05/11/2026): cada aparelho
-- em que ela ativou "Avisos de novos pedidos" no painel recebe uma
-- notificação (Web Push) quando uma cliente marca um horário. A chave do
-- servidor (VAPID) fica em vip.settings, linha 'push', criada no primeiro uso.
create table if not exists vip.avisos_aparelhos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references vip.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  aparelho text,
  created_at timestamptz not null default now(),
  ultimo_envio_at timestamptz
);
alter table vip.avisos_aparelhos enable row level security;
grant all on vip.avisos_aparelhos to service_role;
