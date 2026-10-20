-- ============================================================
-- Briefing da Tayssa: o formulário que ela responde no domínio da DDG
-- (painel.dosedegrowth.com/briefing/tayssa?k=…) com o que falta para o
-- site — biografia, serviços, atendimento, regras do VIP, depoimentos —
-- e os arquivos originais (fotos e vídeos).
--
-- Só cria. Nada existente muda. RLS ligado sem policies: só o
-- service_role (servidor do site) lê e escreve, como o resto do schema.
-- ============================================================

-- uma linha por parte do formulário; '_acesso' guarda o hash da chave do
-- link e '_envio' a hora em que ela mandou (as partes de verdade são
-- validadas no servidor, nunca vêm com '_' na frente)
create table if not exists vip.briefing (
  secao text primary key check (secao ~ '^_?[a-z]{2,20}$'),
  dados jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists vip.briefing_arquivos (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (
    tipo in ('trabalho', 'retrato', 'estudio', 'flor', 'video_abertura', 'video_processo', 'depoimento', 'insights', 'logo')
  ),
  storage_path text not null unique,
  public_url text not null,
  nome text not null,
  mime text not null,
  bytes bigint,
  -- só nas fotos do trabalho: qual técnica aparece
  tecnica text,
  created_at timestamptz not null default now()
);

create index if not exists briefing_arquivos_tipo_idx on vip.briefing_arquivos (tipo, created_at);

grant all on vip.briefing, vip.briefing_arquivos to service_role;

alter table vip.briefing enable row level security;
alter table vip.briefing_arquivos enable row level security;

notify pgrst, 'reload schema';
