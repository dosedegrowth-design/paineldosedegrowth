-- ============================================================
-- Correção de pontos (Lucas, 12/11/2026).
--
-- A cliente marcou manutenção, na hora precisou de aplicação, e o
-- atendimento entrou com os pontos da manutenção. A Tayssa corrige na
-- ficha da cliente: tira ou adiciona os pontos de um serviço do catálogo
-- (nunca um número solto). Cada correção é uma linha aqui; o total de
-- pontos da cliente é a soma dos atendimentos confirmados mais a soma
-- destas linhas. Os atendimentos (e o cartão) não mudam.
-- ============================================================

create table if not exists vip.ajustes_pontos (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references vip.users(id) on delete cascade,
  service_id uuid references vip.services(id) on delete set null,
  -- o serviço de referência, como se chamava na hora
  service_name text not null,
  -- positivo: a Tayssa adicionou; negativo: tirou
  points integer not null check (points <> 0),
  -- o motivo, só para ela
  note text check (note is null or char_length(note) <= 300),
  created_by uuid references vip.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists ajustes_pontos_client_idx on vip.ajustes_pontos (client_id, created_at desc);
alter table vip.ajustes_pontos enable row level security;
grant all on vip.ajustes_pontos to service_role;

notify pgrst, 'reload schema';
