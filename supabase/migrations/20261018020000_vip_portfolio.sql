-- Portfólio do site: cada mídia publicada pode apontar para a publicação
-- dela no Instagram. O site abre o vídeo/foto dentro dele e, de lá, o botão
-- "Ver no Instagram" vai para o post (sem link, vai para o perfil).
alter table vip.photos
  add column if not exists instagram_url text
  check (instagram_url is null or instagram_url ~ '^https://(www\.)?instagram\.com/');

notify pgrst, 'reload schema';
