-- ============================================================
-- Tayssa VIP · cartão de fidelidade raspável + agendamento interno
-- 2026-09-14 (segunda migration do schema vip)
--
-- Cartão: ciclos de N posições (padrão 8). Cada atendimento confirmado
-- vira um carimbo na próxima posição livre. Ao fechar as N posições o
-- cartão completa e nasce um benefício em pending_validation — a Tayssa
-- continua sendo quem libera. A "raspadinha" só revela o carimbo
-- (revealed_at); nunca cria pontos.
--
-- Agendamento: guardado aqui, na própria plataforma. A cliente nunca é
-- mandada para uma agenda externa.
-- ============================================================

create table vip.loyalty_cards (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references vip.users(id) on delete cascade,
  cycle_number integer not null check (cycle_number >= 1),
  card_size integer not null default 8 check (card_size between 4 and 12),
  opened_at timestamptz not null default now(),
  completed_at timestamptz,
  client_benefit_id uuid references vip.client_benefits(id) on delete set null,
  unique (client_id, cycle_number)
);
create index loyalty_cards_client_idx on vip.loyalty_cards (client_id, completed_at);

create table vip.loyalty_stamps (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references vip.loyalty_cards(id) on delete cascade,
  client_id uuid not null references vip.users(id) on delete cascade,
  position integer not null check (position >= 1),
  client_service_id uuid references vip.client_services(id) on delete set null,
  service_name text not null,
  points integer not null default 0 check (points >= 0),
  stamped_at timestamptz not null default now(),
  revealed_at timestamptz,
  unique (card_id, position),
  unique (client_service_id)
);
create index loyalty_stamps_client_idx on vip.loyalty_stamps (client_id, revealed_at);

create table vip.appointments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references vip.users(id) on delete cascade,
  service_id uuid references vip.services(id) on delete set null,
  service_name text not null,
  scheduled_date date not null,
  scheduled_time time not null,
  duration_min integer not null default 90 check (duration_min between 15 and 480),
  status text not null default 'requested'
    check (status in ('requested', 'confirmed', 'done', 'cancelled', 'no_show')),
  client_note text,
  admin_note text,
  client_service_id uuid references vip.client_services(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index appointments_client_idx on vip.appointments (client_id, scheduled_date desc, scheduled_time desc);
create index appointments_slot_idx on vip.appointments (scheduled_date, scheduled_time)
  where status in ('requested', 'confirmed');
create trigger appointments_updated_at before update on vip.appointments
  for each row execute function vip.set_updated_at();

alter table vip.loyalty_cards enable row level security;
alter table vip.loyalty_stamps enable row level security;
alter table vip.appointments enable row level security;
grant all on all tables in schema vip to service_role;

-- ------------------------------------------------------------
-- Configuração (editável no admin)
-- ------------------------------------------------------------
insert into vip.settings (key, value) values
  ('loyalty', '{
    "card_size": 8,
    "card_reward_title": "Cartão completo",
    "card_reward_description": "Um presente escolhido pela Tayssa por completar as 8 visitas do seu cartão."
  }'::jsonb),
  ('booking', '{
    "weekdays": [1, 2, 3, 4, 5, 6],
    "slots": ["09:00", "10:30", "12:00", "13:30", "15:00", "16:30", "18:00"],
    "lead_hours": 12,
    "horizon_days": 30,
    "default_duration_min": 90,
    "max_open_per_client": 2
  }'::jsonb)
on conflict (key) do nothing;

-- Benefício do cartão completo (unidade "services": não é marco de pontos)
insert into vip.benefits (key, name, description, type, threshold, threshold_unit, validity_days, sort_order, config)
values ('card_complete', 'Cartão completo',
        'Um presente escolhido pela Tayssa por completar as 8 visitas do seu cartão.',
        'loyalty', 8, 'services', 60, 0, '{"per_card": true}'::jsonb)
on conflict (key) do nothing;

-- ------------------------------------------------------------
-- Backfill: atendimentos já confirmados viram carimbos, em ordem
-- ------------------------------------------------------------
do $$
declare
  r record;
  v_card uuid;
  v_pos integer;
  v_cycle integer;
  v_size integer := 8;
  v_benefit uuid;
  v_cb uuid;
begin
  select id into v_benefit from vip.benefits where key = 'card_complete';
  for r in
    select cs.* from vip.client_services cs
    where cs.status = 'approved'
    order by cs.client_id, cs.service_date, cs.submitted_at
  loop
    select id into v_card from vip.loyalty_cards
      where client_id = r.client_id and completed_at is null
      order by cycle_number desc limit 1;
    if v_card is null then
      select coalesce(max(cycle_number), 0) + 1 into v_cycle
        from vip.loyalty_cards where client_id = r.client_id;
      insert into vip.loyalty_cards (client_id, cycle_number, card_size, opened_at)
        values (r.client_id, v_cycle, v_size, coalesce(r.reviewed_at, now()))
        returning id into v_card;
    end if;
    select coalesce(max(position), 0) + 1 into v_pos from vip.loyalty_stamps where card_id = v_card;
    insert into vip.loyalty_stamps (card_id, client_id, position, client_service_id, service_name, points, stamped_at, revealed_at)
      values (v_card, r.client_id, v_pos, r.id, r.service_name, r.points,
              coalesce(r.reviewed_at, now()), coalesce(r.reviewed_at, now()));
    if v_pos >= v_size then
      select cycle_number into v_cycle from vip.loyalty_cards where id = v_card;
      insert into vip.client_benefits (client_id, benefit_id, cycle_key, status, title, description, eligible_at)
        values (r.client_id, v_benefit, 'card:' || v_cycle, 'pending_validation',
                'Cartão completo', 'Um presente escolhido pela Tayssa por completar as 8 visitas do seu cartão.',
                coalesce(r.reviewed_at, now()))
        on conflict (client_id, benefit_id, cycle_key) do nothing
        returning id into v_cb;
      update vip.loyalty_cards
        set completed_at = coalesce(r.reviewed_at, now()), client_benefit_id = v_cb
        where id = v_card;
    end if;
  end loop;
end $$;
