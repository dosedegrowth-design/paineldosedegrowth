-- Dezembro de 2026 (carrossel "Agenda de Dezembro" da Tayssa; Lucas, 12/11/2026):
-- seg a sáb das 07h às 21h, domingo das 07h às 17h; 24/12 das 06h às 15h com R$ 30 em qualquer horário;
-- R$ 30 no primeiro e no último horário de cada dia; sem atendimento em 25, 30 e 31/12.
insert into vip.settings (key, value, updated_at)
values ('periodo_especial', jsonb_build_object(
  'desde', '2026-12-01',
  'ate', '2026-12-31',
  'slots_por_dia', jsonb_build_object(
    '0', to_jsonb(array(select lpad(h::text, 2, '0') || ':00' from generate_series(7, 17) h)),
    '1', to_jsonb(array(select lpad(h::text, 2, '0') || ':00' from generate_series(7, 21) h)),
    '2', to_jsonb(array(select lpad(h::text, 2, '0') || ':00' from generate_series(7, 21) h)),
    '3', to_jsonb(array(select lpad(h::text, 2, '0') || ':00' from generate_series(7, 21) h)),
    '4', to_jsonb(array(select lpad(h::text, 2, '0') || ':00' from generate_series(7, 21) h)),
    '5', to_jsonb(array(select lpad(h::text, 2, '0') || ':00' from generate_series(7, 21) h)),
    '6', to_jsonb(array(select lpad(h::text, 2, '0') || ':00' from generate_series(7, 21) h))
  ),
  'taxa', 30,
  'dias', jsonb_build_object('2026-12-24', jsonb_build_object(
    'slots', to_jsonb(array(select lpad(h::text, 2, '0') || ':00' from generate_series(6, 15) h)),
    'taxa_em_todos', true)),
  'folgas', jsonb_build_array('2026-12-25', '2026-12-30', '2026-12-31')
), now())
on conflict (key) do update set value = excluded.value, updated_at = now();
select value->'dias'->'2026-12-24'->'slots' as dia24, value->'slots_por_dia'->'0' as domingo, value->'folgas' as folgas from vip.settings where key = 'periodo_especial';
