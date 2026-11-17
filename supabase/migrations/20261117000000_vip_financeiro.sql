-- Financeiro da Tayssa (17/11/2026): pagamentos de cada atendimento, a divisão
-- Tayssa/Larissa (70/30, guardada no atendimento na hora em que ele fecha),
-- agendamento criado pelo painel (valor, forma de pagamento, origem), links do
-- relatório para a Larissa (token aleatório, revogável) e o backup do que for
-- apagado a pedido. Tudo aditivo: nenhum dado existente é apagado.

-- 1. Agendamento: o valor combinado, a forma de pagamento prevista e de onde veio
alter table vip.appointments
  add column if not exists valor numeric(10,2) check (valor is null or valor >= 0),
  add column if not exists forma_pagamento text
    check (forma_pagamento is null or forma_pagamento in ('pix', 'dinheiro', 'cartao_credito', 'cartao_debito', 'outro')),
  add column if not exists origem text not null default 'site' check (origem in ('site', 'painel'));

-- 2. Atendimento: a parte da Tayssa (%) da hora em que fechou. Mudar a divisão
--    vale para os próximos; os fechados ficam como estavam.
alter table vip.client_services
  add column if not exists pct_tayssa numeric(5,2) check (pct_tayssa is null or (pct_tayssa >= 0 and pct_tayssa <= 100));

-- 3. Pagamentos: um atendimento pode ter mais de um (o sinal no Pix e o resto em dinheiro)
create table if not exists vip.pagamentos (
  id uuid primary key default gen_random_uuid(),
  client_service_id uuid not null references vip.client_services(id) on delete cascade,
  valor numeric(10,2) not null check (valor > 0),
  forma text not null check (forma in ('pix', 'dinheiro', 'cartao_credito', 'cartao_debito', 'outro')),
  origem text not null default 'atendimento' check (origem in ('sinal', 'atendimento', 'manual')),
  recebido_em timestamptz not null default now(),
  nota text,
  created_by uuid references vip.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists pagamentos_atendimento_idx on vip.pagamentos (client_service_id);
create index if not exists pagamentos_recebido_idx on vip.pagamentos (recebido_em);
alter table vip.pagamentos enable row level security;
grant all on vip.pagamentos to service_role;

-- 4. A divisão vigente (Financeiro › Divisão) e o histórico de cada mudança
insert into vip.settings (key, value, updated_at)
values ('financeiro', '{"pct_tayssa": 70, "pct_larissa": 30, "larissa_nome": "Larissa", "larissa_whatsapp": "5511913216079"}'::jsonb, now())
on conflict (key) do nothing;

create table if not exists vip.divisao_historico (
  id uuid primary key default gen_random_uuid(),
  pct_tayssa numeric(5,2) not null check (pct_tayssa >= 0 and pct_tayssa <= 100),
  pct_larissa numeric(5,2) not null check (pct_larissa >= 0 and pct_larissa <= 100),
  vigente_desde timestamptz not null default now(),
  created_by uuid references vip.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint divisao_soma_100 check (pct_tayssa + pct_larissa = 100)
);
insert into vip.divisao_historico (pct_tayssa, pct_larissa, vigente_desde)
select 70, 30, '2026-09-01T00:00:00-03:00'
where not exists (select 1 from vip.divisao_historico);
alter table vip.divisao_historico enable row level security;
grant all on vip.divisao_historico to service_role;

-- 5. Links do relatório (a página que a Larissa abre): só o hash do token fica
--    guardado, o relatório é uma foto do fechamento e o link pode ser revogado
create table if not exists vip.relatorios_links (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  de date not null,
  ate date not null,
  rotulo text not null,
  dados jsonb not null,
  created_by uuid references vip.users(id) on delete set null,
  created_at timestamptz not null default now(),
  revogado_em timestamptz,
  acessos integer not null default 0,
  ultimo_acesso timestamptz
);
create index if not exists relatorios_links_criado_idx on vip.relatorios_links (created_at desc);
alter table vip.relatorios_links enable row level security;
grant all on vip.relatorios_links to service_role;

-- 6. Backup de registros apagados a pedido (a cópia inteira da linha, antes de apagar)
create table if not exists vip.backup_registros (
  id uuid primary key default gen_random_uuid(),
  tabela text not null,
  registro_id uuid,
  registro jsonb not null,
  motivo text not null,
  created_at timestamptz not null default now()
);
alter table vip.backup_registros enable row level security;
grant all on vip.backup_registros to service_role;

-- 7. Atendimentos de antes: a divisão era 70/30 desde o começo
update vip.client_services set pct_tayssa = 70 where pct_tayssa is null and status = 'approved';

-- 8. Valor do atendimento fechado pela agenda (o "Realizado" não gravava o valor):
--    a soma dos serviços do pedido; na manutenção, o da manutenção do volume; senão, o catálogo
update vip.client_services cs
set amount = x.valor
from (
  select c.id,
    coalesce(
      (select sum((e ->> 'preco')::numeric)
         from vip.appointments a, jsonb_array_elements(a.servicos) e
        where a.client_service_id = c.id and a.servicos is not null
       having count(*) = count(e ->> 'preco')),
      (select s.preco_manutencao
         from vip.appointments a
         join vip.services s on s.name = substring(a.client_note from '^Manutenção do (.+)\.$')
        where a.client_service_id = c.id and s.preco_manutencao is not null
        limit 1),
      (select s.preco from vip.services s where s.id = c.service_id)
    ) as valor
  from vip.client_services c
  where c.amount is null and c.status = 'approved'
) x
where cs.id = x.id and x.valor is not null;

-- 9. O sinal no Pix de quem anexou o comprovante vira pagamento do atendimento
--    (o valor do sinal de hoje, no dia em que ela anexou). O resto fica pendente
--    até a Tayssa registrar: o painel não inventa pagamento.
insert into vip.pagamentos (client_service_id, valor, forma, origem, recebido_em, nota)
select a.client_service_id,
       coalesce((select (value ->> 'deposit_reais')::numeric from vip.settings where key = 'booking'), 50),
       'pix', 'sinal', a.comprovante_em, 'Sinal do agendamento (comprovante anexado no site)'
from vip.appointments a
join vip.client_services cs on cs.id = a.client_service_id and cs.status = 'approved'
where a.status = 'done' and a.comprovante_em is not null
  and not exists (select 1 from vip.pagamentos p where p.client_service_id = a.client_service_id and p.origem = 'sinal');

notify pgrst, 'reload schema';
