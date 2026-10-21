-- ============================================================
-- Um horário, uma cliente. O agendamento conferia se o horário estava
-- livre e depois gravava, em dois passos: duas clientes marcando no mesmo
-- instante passavam as duas. Agora o banco segura — quem chega por último
-- recebe "Esse horário acabou de ser reservado".
--
-- Só cria um índice. Antes de aplicar, conferido que não havia dois
-- pedidos abertos no mesmo dia/hora.
-- ============================================================

create unique index if not exists appointments_slot_unique
  on vip.appointments (scheduled_date, scheduled_time)
  where status in ('requested', 'confirmed');
