-- Dois tipos de link de entrada:
--   magic = convite de uso único (a Tayssa manda para uma cliente)
--   demo  = link de teste, abre em vários aparelhos até expirar
alter table vip.password_tokens drop constraint if exists password_tokens_purpose_check;
alter table vip.password_tokens add constraint password_tokens_purpose_check
  check (purpose = any (array['setup'::text, 'reset'::text, 'magic'::text, 'demo'::text]));
