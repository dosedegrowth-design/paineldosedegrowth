@AGENTS.md

# Tayssa Lash — Private Beauty Experience

> Leia este arquivo inteiro antes de mexer no projeto.

## O que é

Clube privado das clientes da Tayssa (cílios e embelezamento do olhar).
Três produtos numa base só:

1. **Site público** — editorial, mobile primeiro, com indicação aberta e
   pedido de acesso (`/cadastro` → a Tayssa aprova).
2. **App da cliente** (`/vip`) — cartão de fidelidade físico (frente com
   fotos, giro 3D, verso com raspadinha), agenda, benefícios, ranking,
   jornada e perfil.
3. **Painel da Tayssa** (`/admin`) — ela valida tudo: pedidos de acesso,
   agenda (`/admin/agenda`), atendimentos, indicações, benefícios,
   aniversários, fotos (`/admin/fotos`), clientes e configurações.

Saiu de dentro do `paineldosedegrowth` para ter repositório, deploy e
domínio próprios.

## Endereços

| Recurso | Onde |
|---|---|
| Repo | `dosedegrowth-design/tayssa-lash` |
| Branch | `main` (é a verdade; sem feature branch de longa duração) |
| Produção | `https://tayssa.dosedegrowth.com` |
| Vercel | projeto `tayssa-lash` (time Dose de Growth) |
| Supabase | `hkjukobqpjezhpxzplpj` · schema **`vip`** |
| WhatsApp | +55 11 99982-7606 · Instagram `@1.tayssa` |

## Stack

Next.js 16 (App Router, Turbopack) · TypeScript estrito · **CSS puro**
(sem Tailwind; tokens em `app/tayssa.css`) · Montserrat · framer-motion ·
Lenis · Supabase (service role, schema `vip`) · Vercel.

## Regras que NÃO podem quebrar

- **Nenhum benefício é concedido automaticamente.** O sistema detecta a
  elegibilidade e cria `client_benefits` em `pending_validation`; só a
  Tayssa muda para `available`.
- Atendimento registrado pela cliente fica `pending` até ela confirmar;
  só então soma pontos.
- Indicação só conta em `approved`; a mesma pessoa (telefone) conta uma
  vez; auto-indicação e cliente antiga são inválidas.
- Cliente nunca acessa dado de outra: tudo deriva da sessão
  (`assertClient()`), sem ID na URL.
- Raspar o carimbo não cria nada: o carimbo (e os pontos) já existem
  desde a confirmação da Tayssa. Revelar só marca `revealed_at`.
- O ranking mostra só o primeiro nome e a vizinhança de posições.
- Nada de foto sintética ou depoimento inventado: sem o arquivo em
  `public/photos/`, o slot mostra um campo tonal.

## Como as peças conversam

```
Tayssa confirma o atendimento (admin)
        ▼
client_services.status = approved
        ▼  stampVisit()
loyalty_stamps (carimbo oculto)  →  a cliente raspa (revealStampAction)
        ▼  8 posições cheias
client_benefits (pending_validation)  →  a Tayssa libera em Benefícios
```

- Cartão: `vip.loyalty_cards` + `vip.loyalty_stamps`. `getCardState()`
  mostra o cartão mais antigo que ainda tem carimbo por raspar — dourado
  nunca fica para trás quando o cartão seguinte abre.
- Agenda: `vip.appointments`. Regras em `settings.booking` (editáveis em
  Configurações → Agenda). O pedido nasce `requested`; a Tayssa confirma,
  recusa ou cancela em `/admin/agenda`; "Realizado" registra a visita
  confirmada (`lib/visits.ts` → pontos + carimbo).
- Fotos: `vip.photos` + Storage `tayssa-fotos` (público). Sobem em
  `/admin/fotos`; `assignPhotos()` (`lib/photos.ts`) distribui para o site
  e para a frente do cartão. Sem foto → campo tonal.
- Cadastro: `/cadastro` cria `users.status = pending`; a Tayssa aprova na
  ficha e manda as boas-vindas (`settings.signup`).
- Elegibilidade e ciclos: `lib/engine.ts` + `lib/rules.ts` (puro e
  testado em `lib/rules.test.ts`); jornada em `lib/timeline.ts`
  (`lib/timeline.test.ts`).

## Datas

O servidor roda em UTC. Use `nowInBusinessTz()` (`lib/format.ts`) em
qualquer lógica de "hoje" — nunca `new Date()` cru, senão à noite o
Brasil já está no dia seguinte para o sistema.

## Gotchas

- O schema `vip` precisa estar em **Exposed schemas** do PostgREST
  (`pgrst.db_schemas`). Se alguém salvar a lista pelo dashboard do
  Supabase, confira se `vip` continua lá.
- PostgREST recusa embed ambíguo: tabelas com dois FKs para `users`
  (`client_benefits`, `client_services`, `password_tokens`, `referrals`)
  exigem a constraint no select — ex.: `users!password_tokens_user_id_fkey`.
- O reset de botão usa `:where(.ty-scope) button` (especificidade zero).
  Se virar `.ty-scope button`, todo botão sólido perde fundo e borda.
- Fotos: a biblioteca (`vip.photos`) manda; os arquivos em
  `public/photos/` são só o fallback estático.
- Cartão 3D: as faces ficam `translateZ(1px)` à frente do corpo, cada uma
  do seu lado — coplanares, o Chromium perde o hit-test perto de 180°.
- Este projeto é espelho mecânico de `paineldosedegrowth/app|components|lib/tayssa`
  enquanto o repo próprio não existe: não edite aqui à mão, edite no painel
  e re-espelhe.

## Operação

- A Tayssa cria a cliente em `/admin/clientes/novo` → sai um link único
  de primeiro acesso (7 dias) → ela manda por WhatsApp. Nenhuma senha
  aparece na tela.
- Para gerar outro link: `insert into vip.password_tokens (user_id,
  token_hash, purpose, expires_at)` com `token_hash = sha256(token)`.
- Cliente de demonstração: `cliente01@demo.tayssa`.

## Git

- Commit direto na `main`, `git add` arquivo por arquivo.
- `npm run typecheck && npm run lint && npm run build` antes de subir.
- A Vercel publica sozinha a cada push na `main`.
