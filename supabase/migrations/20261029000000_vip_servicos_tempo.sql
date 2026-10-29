-- ============================================================
-- Quanto tempo cada serviço ocupa na agenda, e o valor da manutenção
-- de cada volume.
--
-- A agenda passa a ter horário de hora em hora (cada dia com o seu
-- começo e fim). Um volume de 3h marcado às 9h segura também 10h e 11h:
-- para isso a agenda precisa saber quanto cada serviço dura. Vazio =
-- a duração padrão de Configurações → Agenda.
--
-- `preco_manutencao` é o valor da manutenção daquele volume (Fox eyes
-- custa mais que os outros). Quem pede manutenção pelo site escolhe de
-- qual volume é, e a mensagem leva o valor certo.
--
-- Só acrescenta colunas que aceitam vazio: nada do que existe muda.
-- ============================================================

alter table vip.services
  add column if not exists duration_min integer
    check (duration_min is null or duration_min between 10 and 600),
  add column if not exists preco_manutencao numeric
    check (preco_manutencao is null or preco_manutencao between 0 and 100000);

comment on column vip.services.duration_min is
  'Minutos que o serviço ocupa na agenda. Vazio = duração padrão (settings.booking.default_duration_min).';
comment on column vip.services.preco_manutencao is
  'Valor da manutenção deste volume. Vazio = o serviço não tem manutenção própria.';

notify pgrst, 'reload schema';
