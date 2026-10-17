-- Tayssa VIP — catálogo de mídia por categoria e produto (out/2026)
-- Cada foto ou vídeo da biblioteca ganha a categoria (cílios, sobrancelha,
-- boca, pele…) e o produto/técnica (ex.: "Volume inglês", que já morava em
-- lash_style). O site monta os rolos de cada produto a partir daqui: a
-- Tayssa sobe no painel e o site se alimenta sozinho.

alter table vip.photos
  add column if not exists category text not null default 'cilios',
  add column if not exists media_type text not null default 'image';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'photos_category_check') then
    alter table vip.photos
      add constraint photos_category_check check (category in ('cilios', 'sobrancelha', 'labios', 'pele', 'outro'));
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

-- o bucket aceita vídeo curto além de foto (limite por arquivo: 60 MB)
update storage.buckets
set file_size_limit = 62914560,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'video/mp4', 'video/webm', 'video/quicktime']
where id = 'tayssa-fotos';

-- o PostgREST precisa enxergar as colunas novas
notify pgrst, 'reload schema';
