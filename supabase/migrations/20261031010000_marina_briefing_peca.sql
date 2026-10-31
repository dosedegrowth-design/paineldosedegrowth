-- Marina Saleme · briefing: o nome do produto em cada foto.
--
-- O padrão da marca é peça + estampa num nome só ("CAMISA ANA PARAÍSO BLUE"),
-- como está na loja. O formulário tinha dois campos separados (peça e
-- estampa), e nas estampas novas a Bia cadastrou várias peças dentro do mesmo
-- anúncio, agrupando por estampa. Então o nome do produto é de cada FOTO,
-- não do anúncio: uma foto é a Saia Envelope, a outra é o Caftan.
--
-- `peca` vazio continua herdando o nome do anúncio.
-- `produto_url` é o endereço real na loja (nunca o shopifypreview, que vence).

alter table marina_saleme.briefing_arquivos
  add column if not exists peca text,
  add column if not exists produto_url text;
