# Tayssa Lash — Private Beauty Experience

Clube privado das clientes da Tayssa: site público editorial, área VIP
autenticada (cartão de fidelidade com raspadinha, agenda, benefícios) e
o painel da Tayssa.

- **Produção:** https://tayssa.dosedegrowth.com
- **Banco:** Supabase DDG (`hkjukobqpjezhpxzplpj`), schema **`vip`**
- **Deploy:** Vercel · projeto `tayssa-lash` (Dose de Growth)

## Rodar aqui

```bash
npm install
cp .env.example .env.local   # preencha SUPABASE_SERVICE_ROLE_KEY
npm run dev
```

```bash
npm run typecheck   # 0 erros
npm run lint
npm run test        # regras puras
npm run build
```

## Mapa

| Pasta | O que tem |
|---|---|
| `app/` | rotas: público (`/`, `/indicar`, `/entrar`, `/acesso`), cliente (`/vip/*`), admin (`/admin/*`) |
| `components/` | `public/`, `auth/`, `vip/`, `admin/`, `ui/` |
| `lib/` | `auth/` (scrypt + sessão), `actions/` (server actions), `queries/`, `rules.ts` (puro, testado), `engine.ts` (elegibilidade) |
| `supabase/migrations/` | schema `vip` em ordem de aplicação |
| `public/photos/` | fotos reais (sem arquivo, o slot mostra campo tonal — nunca imagem sintética) |

## Env

| Var | Para quê |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | projeto Supabase da DDG |
| `SUPABASE_SERVICE_ROLE_KEY` | o schema `vip` tem RLS sem policies: só service role lê |
| `NEXT_PUBLIC_TAYSSA_ORIGIN` | origem pública, para links absolutos (default `https://tayssa.dosedegrowth.com`) |
