-- Marina Saleme · terceiro link de aprovação: estampas novas de dezembro (24/11/2026).
alter table marina_saleme.aprovacoes drop constraint if exists aprovacoes_link_check;
alter table marina_saleme.aprovacoes
  add constraint aprovacoes_link_check check (link in ('no-ar', 'novos', 'dezembro'));
