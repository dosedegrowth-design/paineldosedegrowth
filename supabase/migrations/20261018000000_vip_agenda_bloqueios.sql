-- ============================================================
-- Agenda: horários que a Tayssa fecha à mão.
--
-- A grade de horários continua vindo de settings.booking (dias da semana
-- e horários de cada dia). Aqui ficam só as exceções: um horário de um
-- dia específico que ela marcou como indisponível no painel. Para a
-- cliente o horário não some — aparece riscado, igual a um ocupado.
-- ============================================================

create table if not exists vip.agenda_bloqueios (
  dia date not null,
  hora text not null check (hora ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  created_by uuid references vip.users(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (dia, hora)
);
alter table vip.agenda_bloqueios enable row level security;

notify pgrst, 'reload schema';
