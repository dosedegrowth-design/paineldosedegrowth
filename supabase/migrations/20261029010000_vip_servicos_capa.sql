-- ============================================================
-- A capa de cada serviço, escolhida pela Tayssa.
--
-- No site, cada serviço aparece com a capa e, embaixo, o carrossel das
-- fotos do próprio serviço. A capa era a primeira foto que casava pelo
-- nome, e ela não tinha como trocar nem enquadrar. Agora o painel
-- (Mídia → Capas) guarda aqui a foto escolhida e o enquadramento dela:
-- o centro (em %) e o zoom, igual ao das fotos dos rolos.
--
-- Sem capa escolhida, o site usa a primeira foto do serviço; serviço sem
-- foto fica sem foto (nunca a de outro serviço). Apagar a foto tira a
-- capa (on delete set null). Só acrescenta colunas: nada do que existe muda.
-- ============================================================

alter table vip.services
  add column if not exists capa_photo_id uuid references vip.photos (id) on delete set null,
  add column if not exists capa_x numeric(5, 2) not null default 50,
  add column if not exists capa_y numeric(5, 2) not null default 50,
  add column if not exists capa_zoom numeric(4, 2) not null default 1;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'services_capa_check') then
    alter table vip.services
      add constraint services_capa_check check (capa_x between 0 and 100 and capa_y between 0 and 100 and capa_zoom between 1 and 3);
  end if;
end $$;

comment on column vip.services.capa_photo_id is
  'Foto de capa do serviço no site (Mídia → Capas). Vazio = a primeira foto do serviço.';
comment on column vip.services.capa_x is 'Enquadramento da capa: centro horizontal, em %.';
comment on column vip.services.capa_y is 'Enquadramento da capa: centro vertical, em %.';
comment on column vip.services.capa_zoom is 'Enquadramento da capa: zoom (1 a 3).';

notify pgrst, 'reload schema';
