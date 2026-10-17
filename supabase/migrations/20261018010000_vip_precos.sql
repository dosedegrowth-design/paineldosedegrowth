-- ============================================================
-- Valores: o preço que a Tayssa quiser mostrar.
--
-- services.preco — valor do serviço (vazio = não mostra).
-- vip.produtos   — valor de cada produto da galeria (o "Volume inglês"
--                  de cílios, por exemplo). O produto continua nascendo do
--                  nome que ela dá ao publicar uma mídia; aqui fica só o
--                  que é do produto em si. Vazio = não mostra.
-- ============================================================

alter table vip.services
  add column if not exists preco numeric(10, 2) check (preco is null or preco >= 0);

create table if not exists vip.produtos (
  categoria text not null check (categoria in ('cilios', 'sobrancelha', 'labios', 'pele', 'outro')),
  nome text not null check (length(btrim(nome)) between 1 and 80),
  preco numeric(10, 2) check (preco is null or preco >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (categoria, nome)
);
do $$
begin
  if not exists (
    select 1 from pg_trigger t join pg_class c on c.oid = t.tgrelid join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'vip' and c.relname = 'produtos' and t.tgname = 'produtos_updated_at'
  ) then
    create trigger produtos_updated_at before update on vip.produtos
      for each row execute function vip.set_updated_at();
  end if;
end $$;
alter table vip.produtos enable row level security;

notify pgrst, 'reload schema';
