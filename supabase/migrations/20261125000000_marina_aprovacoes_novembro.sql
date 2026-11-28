-- Marina Saleme · o terceiro link de aprovação passa de "dezembro" para "novembro" (25/11/2026).
-- As estampas novas são do fim de novembro; nenhuma resposta tinha sido gravada em "dezembro".
alter table marina_saleme.aprovacoes drop constraint if exists aprovacoes_link_check;
alter table marina_saleme.aprovacoes
  add constraint aprovacoes_link_check check (link in ('no-ar', 'novos', 'novembro'));
