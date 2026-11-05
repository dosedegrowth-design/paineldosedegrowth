-- Comprovante do sinal (Lucas, 05/11/2026, no modelo do Reflexo do Santo):
-- a cliente paga o sinal pelo "Pix copia e cola" com o valor embutido e
-- anexa o comprovante no site; aparece o botão do WhatsApp para avisar a
-- Tayssa, e o painel mostra quem anexou e quem ainda não anexou.

alter table vip.appointments
  add column if not exists comprovante_path text,
  add column if not exists comprovante_tipo text,
  add column if not exists comprovante_em timestamptz;

comment on column vip.appointments.comprovante_path is
  'Arquivo do comprovante do sinal no bucket privado tayssa-comprovantes (<cliente>/<pedido>/<hora>.<ext>).';
comment on column vip.appointments.comprovante_em is
  'Quando a cliente anexou o comprovante. Pedido com comprovante não cai sozinho no prazo do sinal.';

-- Storage PRIVADO: comprovante é documento financeiro. Só o servidor
-- (service role) lê; o painel abre pelo próprio servidor, nunca por
-- endereço público. 8 MB, imagem ou PDF.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'tayssa-comprovantes',
  'tayssa-comprovantes',
  false,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'application/pdf']
)
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Pedido com comprovante não cai sozinho: a cliente já pagou, a Tayssa
-- confere e confirma. O job do banco passa a derrubar só quem não anexou
-- (o mesmo vale para expirarPedidosSemSinal() no servidor do site).
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule(
      'tayssa_pedidos_sem_sinal',
      '*/10 * * * *',
      $job$
  update vip.appointments
     set status = 'cancelled',
         admin_note = 'Sem o sinal em ' || coalesce((select (value->>'sinal_horas')::int from vip.settings where key = 'booking'), 24) || 'h, o horário voltou para a agenda.',
         reviewed_at = now()
   where status = 'requested'
     and comprovante_em is null
     and created_at < now() - make_interval(hours => coalesce((select (value->>'sinal_horas')::int from vip.settings where key = 'booking'), 24));
  $job$
    );
  end if;
end $$;
