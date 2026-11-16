-- ============================================================
-- Vários serviços num horário só (Lucas, 16/11/2026).
--
-- "Marcar qualquer serviço é R$ 50: se ela marcar boca, cílios e
-- sobrancelha, ela manda só R$ 50." Um pedido pode ter mais de um
-- serviço, feitos um depois do outro no mesmo horário: um sinal, um Pix,
-- um comprovante, uma confirmação. O pedido continua com `service_id`
-- (o primeiro), `service_name` (os nomes juntos, "A + B") e
-- `duration_min` (o tempo somado); esta coluna guarda a lista, como estava
-- na hora de marcar: [{ id, nome, duracao, preco }]. Vazia em pedido
-- antigo (um serviço só, lido de service_id).
-- ============================================================

alter table vip.appointments add column if not exists servicos jsonb
  check (servicos is null or jsonb_typeof(servicos) = 'array');

notify pgrst, 'reload schema';
