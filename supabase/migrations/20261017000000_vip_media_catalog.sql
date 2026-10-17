-- Tayssa VIP — galeria e catálogo de mídia (out/2026)
-- GALERIA: a Tayssa sobe quantas fotos e vídeos quiser, no arquivo original
-- (sem compressão, sem perder resolução) e baixa de volta quando quiser.
-- Item da galeria (status 'gallery') não aparece no site.
-- PUBLICAR: daí ela escolhe categoria, produto e enquadramento — o item vira
-- 'active' e entra no rolo do produto.
-- Cada foto ou vídeo da biblioteca ganha a categoria (cílios, sobrancelha,
-- boca, pele…) e o produto/técnica (ex.: "Volume inglês", que já morava em
-- lash_style). O site monta os rolos de cada produto a partir daqui: a
-- Tayssa sobe no painel e o site se alimenta sozinho.

alter table vip.photos
  add column if not exists category text not null default 'cilios',
  add column if not exists media_type text not null default 'image',
  -- enquadramento que a Tayssa escolhe antes de aprovar: o ponto que fica
  -- no centro (em %) e o zoom. Os rolos do site usam exatamente isso.
  add column if not exists focus_x numeric(5, 2) not null default 50,
  add column if not exists focus_y numeric(5, 2) not null default 50,
  add column if not exists zoom numeric(4, 2) not null default 1,
  -- o arquivo como chegou: nome, tamanho e tipo (para baixar igual)
  add column if not exists original_name text,
  add column if not exists bytes bigint,
  add column if not exists mime text,
  add column if not exists published_at timestamptz;

-- o status ganha 'gallery': guardado, ainda não publicado
alter table vip.photos drop constraint if exists photos_status_check;
alter table vip.photos
  add constraint photos_status_check check (status in ('gallery', 'active', 'archived'));

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'photos_category_check') then
    alter table vip.photos
      add constraint photos_category_check check (category in ('cilios', 'sobrancelha', 'labios', 'pele', 'outro'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'photos_framing_check') then
    alter table vip.photos
      add constraint photos_framing_check check (focus_x between 0 and 100 and focus_y between 0 and 100 and zoom between 1 and 3);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'photos_media_type_check') then
    alter table vip.photos
      add constraint photos_media_type_check check (media_type in ('image', 'video'));
  end if;
end $$;

comment on column vip.photos.lash_style is 'produto/técnica dentro da categoria (ex.: "Volume inglês")';
comment on column vip.photos.category is 'cilios | sobrancelha | labios | pele | outro';
comment on column vip.photos.media_type is 'image | video';

create index if not exists photos_catalog_idx on vip.photos (status, category, lash_style, sort_order, created_at desc);

create index if not exists photos_gallery_idx on vip.photos (status, created_at desc);

-- o bucket aceita o original: foto até 50 MB, vídeo até 200 MB.
-- (No plano Free do Supabase o teto global por arquivo é 50 MB.)
update storage.buckets
set file_size_limit = 209715200,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'video/mp4', 'video/webm', 'video/quicktime']
where id = 'tayssa-fotos';

-- o PostgREST precisa enxergar as colunas novas
notify pgrst, 'reload schema';
