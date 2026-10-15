-- Entrada por link: a Tayssa manda o link, a cliente entra sem digitar senha.
-- O token vive no banco só como hash; a linha guarda validade e uso.
alter table vip.password_tokens drop constraint if exists password_tokens_purpose_check;
alter table vip.password_tokens add constraint password_tokens_purpose_check
  check (purpose = any (array['setup'::text, 'reset'::text, 'magic'::text]));
