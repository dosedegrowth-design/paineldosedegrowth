-- Marina Saleme · as respostas dos dois links de aprovação.
--
-- Um link mostra o que está no ar hoje (Manter / Tirar) e o outro os
-- anúncios novos (Fica / Sai). A resposta é guardada por item, a última
-- vale, para o Lucas consultar depois. Sem login: o link é o segredo,
-- como no briefing.
--
-- resposta: 'sim' = Manter/Fica, 'nao' = Tirar/Sai, null = ainda não respondeu.

create table if not exists marina_saleme.aprovacoes (
  link text not null check (link in ('no-ar', 'novos')),
  item_id text not null,
  resposta text check (resposta in ('sim', 'nao')),
  comentario text,
  atualizado_em timestamptz not null default now(),
  primary key (link, item_id)
);

create index if not exists aprovacoes_link_idx
  on marina_saleme.aprovacoes (link, atualizado_em desc);

-- RLS ligado sem policies: só o service role (o painel) acessa.
alter table marina_saleme.aprovacoes enable row level security;
