-- ============================================================
-- Briefing da Marina Saleme: o formulário que a Bia responde no domínio
-- da DDG (painel.dosedegrowth.com/briefing/marina?k=…) dizendo o que a
-- marca quer anunciar no mês seguinte.
--
-- Um anúncio por linha, dentro de um mês. Cada anúncio tem a peça, a
-- estampa, a legenda, o link do produto (opcional) e os arquivos (foto
-- ou vídeo) que a Bia subiu.
--
-- Só cria. Nada existente muda. RLS ligado sem policies: só o
-- service_role (servidor do site) lê e escreve.
-- ============================================================

-- a chave do link e a hora do envio; as duas únicas linhas aqui
create table if not exists marina_saleme.briefing_config (
  chave text primary key check (chave ~ '^_[a-z]{2,20}$'),
  dados jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists marina_saleme.briefing_anuncios (
  id uuid primary key default gen_random_uuid(),
  -- o mês em que esse anúncio vai ao ar; é só isso que separa os cards
  mes text not null check (mes in ('novembro', 'dezembro')),
  -- ordem na lista do mês, para a Bia reordenar depois se quiser
  ordem integer not null default 0,
  peca text not null default '',
  estampa text not null default '',
  legenda text not null default '',
  -- link do produto na loja; opcional, mas é o que evita anúncio
  -- apontando para a página errada
  link text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists briefing_anuncios_mes_idx
  on marina_saleme.briefing_anuncios (mes, ordem, created_at);

create table if not exists marina_saleme.briefing_arquivos (
  id uuid primary key default gen_random_uuid(),
  anuncio_id uuid not null
    references marina_saleme.briefing_anuncios (id) on delete cascade,
  storage_path text not null unique,
  public_url text not null,
  nome text not null,
  mime text not null,
  bytes bigint,
  created_at timestamptz not null default now()
);

create index if not exists briefing_arquivos_anuncio_idx
  on marina_saleme.briefing_arquivos (anuncio_id, created_at);

grant all on
  marina_saleme.briefing_config,
  marina_saleme.briefing_anuncios,
  marina_saleme.briefing_arquivos
  to service_role;

alter table marina_saleme.briefing_config enable row level security;
alter table marina_saleme.briefing_anuncios enable row level security;
alter table marina_saleme.briefing_arquivos enable row level security;

-- onde as fotos e os vídeos da Bia ficam. Público para o painel abrir a
-- prévia sem assinatura; o caminho é um uuid, não dá para adivinhar.
insert into storage.buckets (id, name, public, file_size_limit)
values ('marina-briefing', 'marina-briefing', true, 209715200)
on conflict (id) do nothing;

notify pgrst, 'reload schema';
