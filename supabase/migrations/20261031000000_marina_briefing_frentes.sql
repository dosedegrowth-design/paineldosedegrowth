-- Marina Saleme · briefing: as duas frentes, por arquivo.
--
-- A Bia separou "últimas peças" e "novas estampas" escrevendo o rótulo à mão
-- no nome da peça. Isso vira coluna de verdade, e no ARQUIVO e não no anúncio:
-- ela cadastrou foto de estampa nova dentro de anúncio de última peça (a foto
-- da saia Tijolo entrou no Moletom Iguana), então a frente é de cada imagem.
--
-- `fora` é a gaveta: a imagem sai das duas listas sem sumir do banco nem do
-- Storage, e dá para devolver. É onde vai o que não é criativo (print de tela,
-- arquivo repetido, foto com marca d'água).

alter table marina_saleme.briefing_arquivos
  add column if not exists frente text,
  add column if not exists fora boolean not null default false;

-- herda do rótulo que a Bia escreveu no nome da peça
update marina_saleme.briefing_arquivos f
set frente = case
  when a.peca ilike '%novas estampas%' then 'novas'
  else 'ultimas'
end
from marina_saleme.briefing_anuncios a
where a.id = f.anuncio_id and f.frente is null;

update marina_saleme.briefing_arquivos set frente = 'ultimas' where frente is null;

alter table marina_saleme.briefing_arquivos
  alter column frente set default 'ultimas',
  alter column frente set not null;

alter table marina_saleme.briefing_arquivos
  drop constraint if exists briefing_arquivos_frente_ck;
alter table marina_saleme.briefing_arquivos
  add constraint briefing_arquivos_frente_ck check (frente in ('ultimas', 'novas'));

create index if not exists briefing_arquivos_frente_idx
  on marina_saleme.briefing_arquivos (frente, fora);
