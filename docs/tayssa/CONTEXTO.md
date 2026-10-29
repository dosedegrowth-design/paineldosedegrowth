# TAYSSA LASH — contexto completo do projeto

> **Para que serve este arquivo:** entregar a um chat novo (ou a outro dev)
> tudo que existe hoje, sem depender de histórico de conversa. Levantado e
> conferido em **15/out/2026** lendo o repositório, o banco de produção e a
> página no ar — não de memória.
>
> Tudo aqui é **estado**, não plano. O que é opinião ou pendência está
> marcado como tal.
>
> **Confiança:** depois de escrito, o documento passou por 7 conferidores
> em paralelo — um por bloco de seções — cada um checando afirmação por
> afirmação contra o código, o banco e o `git log`, e cada achado passou
> por um verificador adversarial instruído a refutá-lo. **17 erros meus
> foram encontrados e corrigidos**, incluindo dois que invertiam o
> diagnóstico de um incidente. Onde uma versão anterior deste arquivo
> dizia outra coisa, a correção está marcada no próprio lugar com
> "⚠️ Correção a uma versão anterior deste documento".

---

## 1. Quem é quem

| | |
|---|---|
| **Dose de Growth (DDG)** | Agência de automação e IA. Conta: `dosedegrowth@gmail.com` |
| **Lucas Cassiano** | Dono da DDG, dev principal. É quem dá as ordens no projeto |
| **Tayssa** | A cliente final. Profissional de cílios e embelezamento do olhar. Instagram `@1.tayssa`. WhatsApp `+55 11 99982-7606` |
| **O produto** | "Tayssa Lash — Private Beauty Experience": site institucional + clube privado das clientes + painel de operação da Tayssa |

O projeto **mora dentro de outro projeto**: o repositório é o painel de
tráfego da DDG (`paineldosedegrowth`), um SaaS multi-tenant de gestão de
anúncios. O Tayssa é um produto separado hospedado no mesmo repo, sob
`/tayssa`. Isso é intencional e está documentado — mas gera confusão, e é
a principal fonte de ruído para quem chega agora. **Ver seção 18.**

---

## 2. Endereços

| Recurso | Onde |
|---|---|
| Repositório | `github.com/dosedegrowth-design/paineldosedegrowth` |
| Branch de verdade | `main` |
| Branch desta sessão | `claude/amazing-lovelace-tlgo5c` (já mesclado na `main`) |
| **Produção (ao vivo)** | **`https://painel.dosedegrowth.com/tayssa`** |
| Subdomínio previsto | `https://tayssa.dosedegrowth.com` — **ainda não aponta** (ver §15) |
| Projeto Vercel | `dose-de-growths-projects/paineldosedegrowth` |
| Supabase | projeto `hkjukobqpjezhpxzplpj` (sa-east-1), schema **`vip`** |
| Storage | bucket **`tayssa-fotos`** (público) |
| Mirror standalone | pasta `tayssa-lash/` no mesmo repo — **desatualizado**, ver §15 |

### Estado exato de produção neste momento

```
commit no ar      ad5826f8eadacdbe05fb2c9da3408b4c16cb8d39
deploy Vercel     dpl_EQ2VqcFWK1NNkj33xT42SwE1deEL   state: READY   target: production
main == origin/main == claude/amazing-lovelace-tlgo5c == ad5826f
working tree      limpo (git status vazio)
npx tsc --noEmit  0 erros
```

Verificado buscando a página de verdade em 15/out:
- A foto do MoveCar (`b94703d0-…`) aparece **0 vezes** no HTML.
- A página serve `hero.jpg`, `work-01.jpg`, `work-02.jpg`, `work-03.jpg`.
- Seções presentes: `#trabalho`, `#servicos`, `#vip`, `#indicar`, `#instagram`.
- `<title>`: `Tayssa Lash — Private Beauty Experience · Tráfego DDG`.

---

## 3. ACESSOS

### 3.1 Contas no banco (schema `vip`, tabela `users`)

Existem **exatamente duas** contas:

| id | role | email | nome | status | tem senha? |
|---|---|---|---|---|---|
| `0ddf9fbc-c0f8-43aa-91d8-aacf8930565b` | `admin` | `admin@tayssa.vip` | Tayssa | active | **NÃO** |
| `79529e4d-e690-4729-b3cc-78b758278f37` | `client` | `demo@tayssa.vip` | Cliente Demonstração (apelido "Demo") | active | **NÃO** |

> ⚠️ **Nenhuma das duas tem senha definida** (`password_hash` é null).
> **Para estas duas contas, login por e-mail + senha não funciona** — a
> porta é link de acesso (§3.3). Isso é um fato sobre *estas* contas, não
> sobre o produto: cliente que se cadastrar por `/cadastro` escolhe a
> senha no próprio cadastro e entra normalmente (§12).
>
> ⚠️ O `CLAUDE.md` do repositório diz que a cliente demo é
> `cliente01@demo.tayssa` — **está errado**, o banco diz `demo@tayssa.vip`.
> Corrigir o CLAUDE.md é pendência.

### 3.2 Links de acesso válidos agora

`vip.password_tokens` tem 9 linhas. Os que ainda valem:

| purpose | conta | vence em | reusável? |
|---|---|---|---|
| `demo` | `admin@tayssa.vip` | 31/dez/2026 23:59 | sim, ilimitado |
| `demo` | `demo@tayssa.vip` | 31/dez/2026 23:59 | sim, ilimitado |
| `demo` | `admin@tayssa.vip` | 14/dez/2026 | sim, ilimitado |
| `demo` | ambas | 16/out/2026 | sim, até vencer |

O **token em claro não existe em lugar nenhum** — o banco guarda só
`sha256(token)`. Quem tem o link, tem; quem não tem, gera outro (§3.4).
O link ativo que o Lucas usa está na conversa do chat que o gerou.

### 3.3 Como funciona a entrada por link

Rota: `app/tayssa/entrar/link/route.ts` → `GET /tayssa/entrar/link?t=<token>`

Dois tipos, na coluna `purpose`:

- **`magic`** — convite de uso único, queimado (`used_at`) *antes* de abrir
  a sessão. Existe na rota e no CHECK da tabela, mas **nenhuma tela gera
  `magic` hoje**: o único `insert` em `password_tokens` no repositório é
  `issueAccessLink()` (`lib/tayssa/actions/clients.ts:21`), que só grava
  `setup` ou `reset`. Os 3 `magic` do banco são do seed de 16/set/2026,
  todos queimados e vencidos em 23/set. Para emitir um hoje, só na mão
  (§3.4, trocando `'demo'` por `'magic'`).
- **`demo`** — link de teste. Abre quantas vezes quiser, em quantos
  aparelhos quiser, até vencer. Cada aparelho ganha a própria sessão.
  **É a única entrada sem senha que funciona hoje** — e os `demo` válidos
  foram inseridos à mão (nenhum tem `created_by`).

Link inválido/vencido/queimado → redireciona para `/tayssa/entrar?link=expirado`
sem contar história. Admin cai em `/tayssa/admin`, cliente em `/tayssa/vip`.

### 3.4 Receita para gerar um link novo (SQL)

Gere um token aleatório fora do banco, guarde só o hash:

```sql
-- 1) escolha um token aleatório, ex.: openssl rand -hex 16  →  <TOKEN>
-- 2) grave o hash
insert into vip.password_tokens (user_id, token_hash, purpose, expires_at)
select id, encode(digest('<TOKEN>', 'sha256'), 'hex'), 'demo',
       timestamptz '2026-12-31 23:59:00+00'
from vip.users where email = 'admin@tayssa.vip';
-- 3) o link é:
--    https://painel.dosedegrowth.com/tayssa/entrar/link?t=<TOKEN>
```

`hashToken()` em `lib/tayssa/auth/session.ts` é sha256 hex — confira ali se
mudar. Revogar = apagar a linha (sessões já abertas continuam; para cortar
essas, apague de `vip.sessions`).

⚠️ **O que a interface gera NÃO é link de entrada direta.**
`/tayssa/admin/clientes/novo` e o botão "Gerar link de acesso" na ficha
(`adminIssueAccessLinkAction`) emitem `setup` — ou `reset`, se a conta já
tem senha — válidos 7 dias (`PASSWORD_TOKEN_DAYS`), apontando para
`/tayssa/entrar/definir-senha?token=…`. **Essa tela pede a senha**; a
sessão só abre depois que a senha é gravada. E `/tayssa/entrar/link`
recusa `setup`/`reset` (filtra só `magic`/`demo`). Nenhuma senha aparece
em tela em nenhum fluxo.

### 3.5 Segredos de infraestrutura

**Regra da casa: chave de banco não se cola em chat nem em arquivo do
repo.** Onde cada coisa vive:

| Segredo | Onde está | Observação |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel env (production) | `https://hkjukobqpjezhpxzplpj.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel env (production) | **é a chave que o Tayssa usa**; bypassa RLS |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel env (production) | — |
| `NEXT_PUBLIC_TAYSSA_ORIGIN` | opcional | default `https://tayssa.dosedegrowth.com` |

O Tayssa usa **apenas** essas envs do Supabase. Todas as outras do repo
(`META_APP_ID`, `GOOGLE_ADS_*`, `SHOPIFY_*`, `ANTHROPIC_API_KEY`,
`WEBHOOK_HMAC_SECRET`…) pertencem ao painel de tráfego da DDG e não têm
nada a ver com o Tayssa.

Para puxar localmente: `npx vercel env pull .env.local --environment production`.

> A API da Vercel recusou listar as envs nesta sessão (403 — a credencial
> do agente não tem permissão de leitura de env var). Os nomes acima vêm do
> `CLAUDE.md` do repo, que é a fonte mantida pelo Lucas.

### 3.6 Como o Tayssa fala com o banco

`lib/tayssa/db.ts` → cliente Supabase com **service role**, `.schema("vip")`.
RLS está **ligado sem policies**: só service role entra. Nenhuma chamada do
navegador toca o Supabase direto — tudo passa por Server Action ou Server
Component.

⚠️ Gotcha: o schema `vip` precisa estar em **Exposed schemas** do PostgREST.
Foi adicionado via `alter role authenticator set pgrst.db_schemas = '…, vip'`
+ `notify pgrst, 'reload config'`. Se alguém salvar a lista pelo dashboard
(Settings → API), confira se `vip` continua lá.

### 3.7 Sessão da cliente

Cookie próprio **`tayssa_vip_session`** (não usa Supabase Auth), 30 dias,
hash em `vip.sessions`. Senha com **scrypt** (`lib/tayssa/auth/password.ts`).
Rate limit de login: 8 tentativas / 15 min. Senha mínima 8 caracteres.
Hoje há **14 sessões** registradas.

---

## 4. As três experiências (o briefing do produto)

O contrato está em `docs/tayssa/DIRECAO.md` (out/2026) e
`docs/tayssa/DESIGN.md` (set/2026). Resumo executivo:

| | Site público | App da cliente (VIP) | Painel da Tayssa |
|---|---|---|---|
| Função | criar desejo | recompensar a relação | operar o dia |
| É o quê | **o produto principal**, peça editorial | relacionamento | ferramenta |
| Luz | marfim, claro, aberto | noite quente, íntimo | casco escuro + tela clara |
| Prioridade | celular **e** desktop com composições próprias | **celular primeiro** | desktop primeiro |
| Dourado | quase nunca | permitido (cartão, carimbo, benefício) | só o que já está nas mãos da cliente |

**Regra que o Lucas repetiu mais de uma vez: os três NÃO podem parecer três
versões do mesmo dashboard.**

### Referência de design

Referência principal, inspecionada no navegador em 15/out: **neutomni.com**.
O que foi extraído dela (e adotado):

1. **Duas cores e ponto.** Uma cor de marca saturada sobre fundo
   quase-branco. Sem gradiente decorativo, sem sombra, sem card flutuante.
   Bloco de cor é chapado.
2. **A palavra é a imagem.** A marca ocupa a largura inteira da tela, as
   pontas tocando as bordas. Tipografia como elemento gráfico, não rótulo
   em cima de foto.
3. **Sans neutra + itálico serifado dentro da frase.** A frase corre em
   sans; a palavra que carrega emoção vira itálico serifado.
4. **Mono como ficha técnica.** Rótulo, contador, hora, estado, categoria
   em monoespaçada caixa-alta pequena e bem espaçada.
5. **Peso 400 em quase tudo.** Hierarquia por corpo, cor e estilo — não
   por negrito.
6. **Assimetria com ar.** Blocos desalinhados de propósito, muito branco.

O que **não** foi copiado: o vermelho dela, o humor de agência, o volume
de movimento.

> Premium = **restrição, hierarquia, atmosfera, materialidade**. Não é
> "mais dourado".

### Tokens (em `app/tayssa/tayssa.css`)

```css
--t-ivory: #f4efe8   /* fundo público          */
--t-bone:  #e8e0d5   /* superfícies, faixas    */
--t-sand:  #cdbfb0   /* linhas, molduras       */
--t-umber: #6b5a4e   /* texto secundário       */
--t-ink:   #1a1512   /* texto / fundo privado  */
--t-noir:  #100d0b   /* fundo mais profundo    */
--t-cassis:      #6e2f45   /* ACENTO ÚNICO (ameixa fumê) */
--t-cassis-soft: #a5647a   /* acento sobre escuro        */
--t-ok: #4f7a5f   --t-wait: #9a7b3f
--tyvi-gold: #8a6334 / #c9a36c   /* só no VIP */
```

Tipografia:
- **Montserrat** 200/300/400/500/600 — display e corpo. **Escolha explícita
  do Lucas em 14/set ("fonte limpa, igual ao painel"). Não trocar.**
- **Bodoni Moda itálico** — só dentro de `<em>`, em título ou frase.
- **JetBrains Mono** — só rótulo/contador/estado.

Movimento: `--t-micro: 200ms` · `--t-ui: 420ms` · `--t-content: 820ms` ·
`--t-section: 1050ms` · `--t-cine: 1450ms`, easing
`cubic-bezier(.16,1,.3,1)`. Só `transform`, `opacity`, `clip-path` — nada
de animar layout. `prefers-reduced-motion` desliga tudo **e a tela
continua correta**.

### Primitivos CSS da casa

`.ty-wordmark` (corpo sai de `--ty-letras`, cabe em qualquer tela) ·
`.ty-mono` · `.ty-rail` · `.ty-block` (`--ink`, `--bone`) · `.ty-oval` ·
`.ty-figure` · `.ty-split` (`--wide-left`, `--wide-right`, `--offset`) ·
`.ty-measure` · `.ty-index` · `.ty-rule`.

Tamanho do CSS: `tayssa.css` 2627 linhas · `admin/admin.css` 2435 ·
`vip/vip.css` 1440 · `entrar/entrar.css` 280.

---

## 5. Stack

- **Next.js 16.2.4** · App Router · Turbopack
- **TypeScript estrito** (`npx tsc --noEmit` deve dar 0)
- **CSS puro** no Tayssa (sem Tailwind; o resto do repo usa Tailwind v4)
- framer-motion · Lenis (smooth scroll)
- Supabase (Postgres, service role, schema `vip`) + Storage
- Vercel

> ⚠️ **`AGENTS.md`: "This is NOT the Next.js you know."** Esta versão tem
> breaking changes em relação ao training data da maioria dos modelos.
> **Leia o guia em `node_modules/next/dist/docs/` antes de escrever código
> Next.** Não confie em memória.

Scripts: `npm run dev` · `npm run build` · `npm run start` · `npm run lint`.

---

## 6. Mapa de rotas

Tudo vive em `app/tayssa/`. **35 arquivos.**

### Público
| Rota | Arquivo | Renderização |
|---|---|---|
| `/tayssa` | `page.tsx` | **○ Static (prerender)** — ver gotcha §13.1 |
| `/tayssa/indicar` | `indicar/page.tsx` | **○ Static** |
| `/tayssa/cadastro` | `cadastro/page.tsx` | — |
| `/tayssa/aguardando` | `aguardando/page.tsx` | — |
| `/tayssa/entrar` | `entrar/page.tsx` | — |
| `/tayssa/entrar/definir-senha` | `entrar/definir-senha/page.tsx` | — |
| `/tayssa/entrar/link` | `entrar/link/route.ts` | `force-dynamic` |
| `/tayssa/acesso` | `acesso/page.tsx` | 403 desenhado |

### App da cliente (VIP) — mobile primeiro
`/tayssa/vip` · `/vip/cartao` · `/vip/agendar` · `/vip/beneficios` ·
`/vip/perfil` + `layout.tsx`, `loading.tsx`, `error.tsx`.
Nav fixa inferior em `components/tayssa/vip/bottom-nav.tsx`.

### Painel da Tayssa
`/tayssa/admin` (visão geral) · `/admin/agenda` · `/admin/atendimentos` ·
`/admin/clientes` · `/admin/clientes/novo` · `/admin/clientes/[id]` ·
`/admin/indicacoes` · `/admin/beneficios` · `/admin/aniversarios` ·
`/admin/fotos` · `/admin/configuracoes` + `layout`, `loading`, `error`.

Agrupamento da lateral (em `components/tayssa/admin/sidebar.tsx`), com
contador de "quantos esperam resposta" no próprio item:

- **Atendimento** → Visão geral · Agenda · Atendimentos · Clientes
- **Relacionamento** → Indicações · Benefícios · Aniversários
- **Marca** → Fotos
- **Ajustes** → Configurações

A lateral recolhe para faixa de ícones; a escolha fica em `localStorage`
(`tayssa_painel_lateral`), não no banco. Ícones são **SVG próprio**
(`components/tayssa/admin/icons.tsx`) — não usa lucide, porque o espelho
`tayssa-lash/` não tem a dependência.

### Middleware (`middleware.ts`, raiz do repo)
- Host `tayssa.*` → reescreve **todo** path para `/tayssa/...` (URL fica
  limpa: `/vip` em vez de `/tayssa/vip`).
- `/tayssa/vip*` e `/tayssa/admin*` sem cookie → `/tayssa/entrar`.
- A validação de verdade (sessão viva, conta ativa) é no servidor, em
  `lib/tayssa/auth/guards.ts`. O middleware é só a primeira barreira.

---

## 7. Mapa de arquivos

### `components/tayssa/` — 51 arquivos

**`public/` — o site institucional.** Ordem narrativa real, definida em
`experience.tsx`:

```
IntroLoader → PublicNav → Hero → WorkSequence → Services
            → Details → VipIntro → ReferralCta → Closing → PublicFooter
```

| Arquivo | O que é |
|---|---|
| `intro-loader.tsx` | abertura; "TAYSSA" surge por máscara, cortina sobe |
| `nav.tsx` | some ao descer, volta compacto ao subir |
| `hero.tsx` | o nome gigante cortado pelas bordas + eyebrow mono + frase de 3 linhas + CTA WhatsApp + foto real |
| `work-sequence.tsx` | as 3 técnicas (Fio a fio · Volume · Manutenção). Desktop: coluna grudada com nome grande + frase com `<em>` serifado + contador + índice que acende; coluna da direita corre. Celular: pilha. **Se sustenta só em tipografia — foto é bônus** |
| `services.tsx` | lista de serviços em corpo grande; foto segue o cursor no desktop, mora na linha no toque |
| `details.tsx` | trilho horizontal de detalhes/prints |
| `vip-intro.tsx` | a luz abaixa; os benefícios como tipografia + linhas, não cards |
| `referral-cta.tsx` / `referral-form.tsx` | indicação pública |
| `closing.tsx` | fechamento com os 3 CTAs |
| `footer.tsx` | assinatura. **Sem ano** — ver gotcha §13.1 |

**`ui/` — primitivos compartilhados**

| Arquivo | O que é |
|---|---|
| `reveal.tsx` | `Reveal`, `MaskedLines`, `MaskedPhoto`. Todos marcam `data-reveal=""` |
| `real-photo.tsx` | foto que existe → `<Image>`; não existe → campo tonal. **Nunca imagem sintética** |
| `photo-availability.tsx` | provider que diz quais arquivos estáticos existem |
| `brand.tsx` · `button.tsx` · `field.tsx` · `magnetic.tsx` · `smooth-scroll.tsx` · `transition.tsx` · `use-media.ts` | — |
| `form-preservado.ts` | `useFormPreservado()` — ver gotcha §13.3 |
| `status.tsx` | **morto no tronco**; o espelho ainda usa. Apagar só depois de sincronizar o espelho |

**`vip/` — app da cliente.** `loyalty-card.tsx` (cartão físico: frente com
fotos + chip + nome, giro 3D, verso com as posições) · `scratch-sheet.tsx`
(raspadinha canvas) · `booking-flow.tsx` · `timeline.tsx` ·
`progress-ring.tsx` · `milestone-moment.tsx` · `ranking-list.tsx` ·
`benefit-item.tsx` · `appointment-list.tsx` · `bottom-nav.tsx` ·
`count-up.tsx` · `page-enter.tsx` · `forms.tsx`.

**`admin/` — painel.** `shell.tsx` · `sidebar.tsx` · `topbar.tsx` (vidro,
busca de página e ação, ⌘K) · `icons.tsx` · `clients-table.tsx` ·
`controls.tsx` · `forms.tsx` · `settings-forms.tsx` · `signup-review.tsx` ·
`photo-upload.tsx` · `photo-library.tsx`.

**`auth/`** `login-experience.tsx` · `set-password-form.tsx` ·
`signup-experience.tsx`.

### `lib/tayssa/` — 41 arquivos

| Arquivo | O que é |
|---|---|
| `config.ts` | `ROUTES`, constantes de sessão/foto, **`DEFAULT_SETTINGS`** (fallback se o banco não responder), `publicUrl()` |
| `db.ts` | cliente Supabase service role, schema `vip`, `isDbConfigured()`, `logServerError()` |
| `types.ts` | tipos de linha do banco |
| `rules.ts` | **puro e testado.** `loyaltyProgress`, `referralProgress`, chaves de ciclo, `birthdayInfo`, `activeBlackout`, `isInactive`, `bookableDays`, `slotIsBookable`, `benefitExpiry`, utilitários de data |
| `engine.ts` | elegibilidade: `syncLoyaltyEligibility`, `syncReferralEligibility`, `stampVisit`, `getCardState`, `expireStaleBenefits`, `getClientBenefits` |
| `visits.ts` | registra visita confirmada → pontos + carimbo |
| `timeline.ts` | jornada da cliente (puro, testado) |
| `photos.ts` | **manifesto de 18 slots** + `assignPhotos()` — ver §11 |
| `photos-server.ts` | quais arquivos estáticos existem de fato no disco |
| `format.ts` | **`nowInBusinessTz()`** — o servidor roda em UTC, use isto para qualquer "hoje". Também `cicloLegivel()` |
| `settings.ts` | lê `vip.settings` com fallback nos defaults |
| `validation.ts` | schemas Zod, mensagens em português |
| `whatsapp.ts` | `renderTemplate()` + **`whatsappUrl()`** — use sempre esta, ver gotcha §13.4 |
| `phone.ts` · `codes.ts` · `image-size.ts` | utilitários |
| `audit.ts` / `audit-labels.ts` | `logAudit()` → `vip.audit_log` |
| `auth/session.ts` | cookie + `vip.sessions` + `hashToken()` |
| `auth/password.ts` | scrypt |
| `auth/guards.ts` | `assertClient()`, `assertAdmin()` |
| `queries/` | `admin.ts` · `catalog.ts` · `client.ts` · `photos.ts` · `vip.ts` |
| `actions/` | 13 arquivos: 12 de Server Actions + `_helpers.ts` (apoio) — tabela abaixo |
| `rules.test.ts` · `timeline.test.ts` | testes puros |

### Server Actions — 12 arquivos com `"use server"` e auditoria via `logAudit()`; Zod em quase todas

> `_helpers.ts` **não é Server Action.** Usa `import "server-only"`, não
> `"use server"`, e exporta `runAction` (try/catch → `ActionResult`), a
> classe `BusinessError` e os leitores de FormData `str`/`bool`/`list`.
> Esses exports são síncronos ou classe — ilegais num arquivo
> `"use server"`, onde todo export tem de ser função async. **Não cole
> `"use server"` nele: quebra o build.** Ele só *captura* `ZodError` e
> converte em `{ ok: false, error }`; não aplica schema nenhum.

| Arquivo | Ações |
|---|---|
| `auth.ts` | `loginAction` `logoutAction` `setPasswordAction` `changePasswordAction` |
| `signup.ts` | `signupAction` |
| `clients.ts` | `adminCreateClientAction` `adminUpdateClientAction` `adminSetVipAction` `adminSetClientStatusAction` `adminReviewSignupAction` `adminIssueAccessLinkAction` `adminRevokeSessionsAction` |
| `services.ts` | `submitServiceAction` `adminAddServiceAction` `adminReviewServiceAction` |
| `benefits.ts` | `requestBenefitAction` `adminValidateBenefitAction` `adminApproveBenefitRequestAction` `adminRedeemBenefitAction` `adminRejectBenefitAction` `adminReleaseBirthdayAction` `adminGrantCustomBenefitAction` |
| `referrals.ts` | `submitPublicReferralAction` `submitVipReferralAction` `adminSetReferralStatusAction` |
| `booking.ts` | `createAppointmentAction` `cancelAppointmentAction` |
| `appointments.ts` | `adminConfirmAppointmentAction` `adminCancelAppointmentAction` `adminCompleteAppointmentAction` `adminNoShowAppointmentAction` |
| `card.ts` | `revealStampAction` — **sem Zod**: recebe só `{ id }`; a garantia é de propriedade (`stamp.client_id === me.id`), não de schema |
| `photos.ts` | `adminAddPhotoAction` `adminUpdatePhotoAction` `adminArchivePhotoAction` `adminDeletePhotoAction` |
| `profile.ts` | `updateProfileAction` |
| `settings.ts` | `updateBusinessSettingsAction` `updateRulesSettingsAction` `updateBirthdaySettingsAction` `updateWhatsappTemplatesAction` `updateBookingSettingsAction` `updateLoyaltySettingsAction` `updateSignupSettingsAction` `upsertCatalogServiceAction` `updateBenefitConfigAction` `addBlackoutAction` `toggleBlackoutAction` |

Convenção: toda action retorna
`{ ok: true, ... } | { ok: false, error: string }` — **menos
`logoutAction`**, que é `Promise<void>` e termina em `redirect()`, sem
passar por `runAction`. Quem escrever cliente esperando `{ ok }` de toda
action trata essa errado.

---

## 8. Banco — schema `vip`

Migrations aplicadas, em ordem (`supabase/migrations/`):

```
20260914000000_vip_init.sql
20260914120000_vip_card_booking.sql
20260916000000_vip_signup_photos_agenda.sql
20260916033527_vip_magic_link.sql
20260916034246_vip_demo_link.sql
```

RLS ligado, **sem policies** → só service role. Não há enums: os estados
são `text` com CHECK constraint.

### Tabelas e colunas

**`users`** — `id` · `role` · `email` · `name` · `nickname` · `phone` ·
`password_hash` · `status` · `last_login_at` · `created_by` ·
`created_at` · `updated_at` · `signup_source` · `signup_message` ·
`requested_at` · `reviewed_at` · `reviewed_by` · `review_note`
- `role ∈ {client, admin}`
- `status ∈ {pending, active, inactive, suspended, rejected}`
- `signup_source ∈ {admin, self}`

**`client_profiles`** — `user_id` (PK) · `birthday` · `vip_status` ·
`vip_since` · `vip_level` · `referral_code` · `notes` · `updated_at`
- `vip_status ∈ {none, active, suspended}`

**`services`** (catálogo) — `id` · `slug` · `name` · `description` ·
`point_value` · `active` · `sort_order` · timestamps

**`client_services`** (atendimentos) — `id` · `client_id` · `service_id` ·
`service_name` · `service_date` · `amount` · `points` · `status` ·
`notes` · `submitted_by` · `submitted_at` · `reviewed_by` ·
`reviewed_at` · `review_note` · timestamps
- `status ∈ {pending, approved, rejected}` · `submitted_by ∈ {client, admin}`

**`benefits`** (catálogo) — `id` · `key` · `name` · `description` ·
`type` · `threshold` · `threshold_unit` · `validity_days` ·
`requires_approval` · `active` · `sort_order` · `config` (jsonb)
- `type ∈ {loyalty, referral, birthday, custom}`
- `threshold_unit ∈ {points, referrals, services}`

**`client_benefits`** — `id` · `client_id` · `benefit_id` · `cycle_key` ·
`status` · `title` · `description` · `eligible_at` · `available_at` ·
`requested_at` · `approved_at` · `redeemed_at` · `rejected_at` ·
`expires_at` · `client_note` · `admin_note` · `created_by` · timestamps
- `status ∈ {pending_validation, available, requested, approved, redeemed, expired, rejected}`

**`referrals`** — `id` · `referrer_user_id` · `referrer_name` ·
`referrer_phone` · `referred_name` · `referred_phone` · `note` ·
`source` · `status` · `status_note` · `completed_at` · `approved_at` ·
`reviewed_by` · timestamps
- `source ∈ {public, vip}`
- `status ∈ {pending, contacted, scheduled, completed, approved, rejected}`

**`loyalty_cards`** — `id` · `client_id` · `cycle_number` · `card_size`
(4–12) · `opened_at` · `completed_at` · `client_benefit_id`

**`loyalty_stamps`** — `id` · `card_id` · `client_id` · `position` ·
`client_service_id` · `service_name` · `points` · `stamped_at` ·
**`revealed_at`**

**`appointments`** — `id` · `client_id` · `service_id` · `service_name` ·
`scheduled_date` · `scheduled_time` · `duration_min` (15–480) · `status` ·
`client_note` · `admin_note` · `client_service_id` · `reviewed_by` ·
`reviewed_at` · timestamps
- `status ∈ {requested, confirmed, done, cancelled, no_show}`

**`photos`** — `id` · `storage_path` · `public_url` · **`lash_style`** ·
`caption` · `alt` · `width` · `height` · `status` · `featured` ·
`sort_order` · `created_by` · timestamps
- `status ∈ {active, archived}`

**`blackout_periods`** — `id` · `name` · `starts_on` · `ends_on` ·
`benefit_types` (text[], default `{birthday}`) · `active` · `created_at`

**`password_tokens`** — `id` · `user_id` · `token_hash` · `purpose` ·
`expires_at` · `used_at` · `created_by` · `created_at`
- `purpose ∈ {setup, reset, magic, demo}`

**`sessions`** — `id` · `user_id` · `token_hash` · `user_agent` · `ip` ·
`created_at` · `last_seen_at` · `expires_at` · `revoked_at`

**`settings`** — `key` (PK) · `value` (jsonb) · `updated_by` · `updated_at`

**`audit_log`** — `id` (bigint) · `actor_user_id` · `actor_role` ·
`action` · `entity_type` · `entity_id` · `meta` (jsonb) · `created_at`

---

## 9. Dados reais no banco agora (15/out/2026)

| Tabela | Linhas |
|---|---|
| `users` | **2** (1 admin, 1 client) |
| `client_profiles` | 1 |
| `client_services` | 8 |
| `client_benefits` | 1 |
| `loyalty_cards` | 1 |
| `loyalty_stamps` | 8 |
| `appointments` | 1 |
| `referrals` | **0** |
| `services` (catálogo) | 6 |
| `benefits` (catálogo) | 5 |
| **`photos`** | **1 — e está `archived`. Fotos ativas: 0** |
| `password_tokens` | 9 |
| `sessions` | 14 |
| `blackout_periods` | 0 |
| `settings` | 7 |
| `audit_log` | 21 |

Ou seja: **o banco está praticamente vazio.** O que existe é o rastro da
cliente de demonstração. Nada em produção é dado real de cliente da Tayssa.

### Catálogo de serviços (`vip.services`)

| slug | nome | pontos |
|---|---|---|
| `aplicacao-cilios` | Aplicação de cílios | 40 |
| `manutencao-cilios` | Manutenção de cílios | 25 |
| `design-sobrancelhas` | Design de sobrancelhas | 15 |
| `lip-spa` | Lip spa | 15 |
| `limpeza-de-pele` | Limpeza de pele | 30 |
| `outro` | Outro atendimento | 10 |

### Catálogo de benefícios (`vip.benefits`)

| key | nome | tipo | gatilho | validade |
|---|---|---|---|---|
| `card_complete` | Cartão completo | loyalty | 8 **services** (`config: per_card`) | 60d |
| `loyalty_100` | Primeiro marco | loyalty | 100 **points** | 60d |
| `loyalty_250` | Cliente de casa | loyalty | 250 **points** | 60d |
| `referral_reward` | Indicação confirmada | referral | 3 **referrals** (`config: percent 10`) | 60d |
| `birthday` | Experiência de aniversário | birthday | janela de data | 14d |

> O `referral_reward` é literalmente **"10% de desconto no seu próximo
> atendimento"**. Isso importa: o site **não pode** dizer que o clube "não
> é clube de desconto" — o catálogo contradiz na letra. Essa frase foi
> removida em `6e9c42e`.

### `vip.settings` (7 chaves)

- **`business`** — `name: "Tayssa Lash"` · `tagline: "Private Beauty
  Experience"` · `specialty: "Cílios e embelezamento do olhar"` ·
  `whatsapp: "5511999827606"` · `instagram_url` · `instagram_handle: "@1.tayssa"`
- **`rules`** — `vip_pontos: 1000` · `vip_meses: 3` (critério do VIP: pontos
  e meses seguidos com atendimento; a Tayssa confirma) · `inactivity_days: 30` ·
  `benefit_validity_days: 60`
- **`loyalty`** — `card_size: 8` · `card_reward_title: "Cartão completo"` ·
  `card_reward_description`
- **`booking`** — `weekdays: [1,2,3,4,5,6]` · `slots: 09:00 10:30 12:00
  13:30 15:00 16:30 18:00` · `lead_hours: 12` · `horizon_days: 30` ·
  `default_duration_min: 90` · `max_open_per_client: 2`
- **`birthday`** — janela 3 dias antes / 3 depois · `once_per_year: true` ·
  8 regras em texto
- **`signup`** — `open: true` · `welcome_template` (precisa conter `{url}`)
- **`whatsapp`** — 8 templates: `public_schedule` `public_vip_info`
  `public_refer` `vip_support` `vip_refer` `benefit_request`
  `birthday_request` `inactive_outreach`. Marcas: `{name}` em
  `vip_support`, `benefit_request`, `birthday_request` e
  `inactive_outreach`; `{benefit}` só em `benefit_request`; os outros
  quatro não têm variável. ⚠️ **`{url}` NÃO é variável de template de
  WhatsApp** — pertence só a `signup.welcome_template`, o único call site
  que passa `url` (`actions/clients.ts`). Marca sem valor vira string
  vazia **sem erro** (`renderTemplate` em `lib/tayssa/whatsapp.ts`), e
  `updateWhatsappTemplatesAction` não valida marcas — diferente de
  `updateSignupSettingsAction`, que exige `{url}`. Pôr `{url}` num
  template de WhatsApp gera mensagem com buraco silencioso.

Tudo editável em `/tayssa/admin/configuracoes`. `DEFAULT_SETTINGS` em
`lib/tayssa/config.ts` é o fallback se o banco cair.

---

## 10. REGRAS DE NEGÓCIO QUE NÃO PODEM QUEBRAR

Estas são o produto. Quebrar qualquer uma é quebrar a confiança da Tayssa
com as clientes dela.

1. **Nenhum benefício é concedido automaticamente.** O sistema cria
   `client_benefits` em `pending_validation`; **só o admin** muda para
   `available`. O sistema propõe, a Tayssa confirma.
2. Atendimento registrado **pela cliente** nasce `pending`. Só soma pontos
   depois que o admin confirma.
3. **Indicação só conta em `approved`.** A mesma pessoa (telefone) conta
   uma vez só. Auto-indicação e cliente antiga são inválidas. Ciclos de 3.
4. **Cliente nunca acessa dado de outra cliente.** Tudo é derivado da
   sessão (`assertClient()`), **sem ID na URL**.
5. **Raspar o carimbo não cria nada.** O carimbo e os pontos já existem
   desde a confirmação da Tayssa. Raspar só marca `revealed_at`.
6. O **ranking** mostra só o primeiro nome e a vizinhança de posições.
   Nunca contato, e-mail ou histórico de outra cliente.
7. Cartão cheio (8/8) → benefício `card_complete` em `pending_validation`,
   não liberado.
8. **Datas:** o servidor roda em UTC. Use **`nowInBusinessTz()`**
   (`lib/tayssa/format.ts`) em qualquer lógica de "hoje". **Nunca
   `new Date()` cru.**
9. **Não inventar conteúdo.** Nada de anos de experiência, número de
   clientes, prêmio, certificação, depoimento ou preço. O que não existe
   no banco ou nos ativos da marca **não vai para a tela**.
10. **Nunca usar foto de banco de imagens, nem de outra marca, como se
    fosse trabalho dela.** Sem foto → campo tonal honesto.
11. Nenhuma tela pode **depender** de foto para ter composição. Se a
    biblioteca estiver vazia, a seção se sustenta na tipografia.

---

## 11. SISTEMA DE FOTOS — leia inteiro

É o assunto mais sensível do projeto e onde este chat falhou. Entenda o
desenho antes de tocar.

### 11.1 Duas fontes, um destino

| Fonte | Onde | Quem alimenta |
|---|---|---|
| **Arquivos estáticos** | `public/tayssa/photos/<nome>.jpg` | dev, por commit |
| **Biblioteca** | `vip.photos` + Storage `tayssa-fotos` | **a Tayssa, por `/tayssa/admin/fotos`** |

Os dois convergem em `assignPhotos()` (`lib/tayssa/photos.ts`), que
distribui pelos lugares do site. Depois, `app/tayssa/page.tsx` **filtra**:
só passa adiante foto que existe de verdade (URL do Storage, ou arquivo
presente no disco). Sem isso o site mostraria caixote vazio.

### 11.2 Os 18 slots declarados

```
hero                                      herói
work01  work02  work03                    sequência das 3 técnicas
serviceLash  serviceMaintenance
serviceBrow  serviceLip  serviceFacial    hover dos serviços
detail01 … detail06                       trilho horizontal
studio                                    reservado
entrance                                  tela de entrar
vip                                       reservado (boas-vindas VIP)
```

Proporções e tamanhos mínimos estão em `public/tayssa/photos/README.md`.

### 11.3 Arquivos que existem no disco hoje

```
public/tayssa/photos/hero.jpg          153 KB
public/tayssa/photos/work-01.jpg       152 KB
public/tayssa/photos/work-02.jpg        79 KB
public/tayssa/photos/work-03.jpg       125 KB
public/tayssa/photos/service-lash.jpg  135 KB
```

**Origem destes 5:** são recortes de um **vídeo** que a Tayssa publicou no
`@1.tayssa` e que o Lucas passou por caminho de arquivo. O vídeo tem uma
legenda queimada ("POV: Cílios impecáveis, qualidade nos detalhes!") numa
caixa branca que ocupa **y≈181–228 de um quadro 720×1280** (medido com
`ffprobe`, duas linhas de texto: y 181–199 e 215–228). Qualquer corte
precisa começar em **y ≥ 229**; num 4:5 que use a largura cheia dos 720px
(altura 900), o início fica em y ≤ 380 — ou seja, a janela útil de um 4:5
de largura total é **y ∈ [229, 380]**. Cortes mais estreitos podem descer
mais. Progressão: largo → médio → arco → macro → serviço. Nenhum é foto
nova: são 5 escalas do mesmo close.

> 🔴 **PROBLEMA DE QUALIDADE, não resolvido:** a fonte tem **720px de
> largura** e os cinco recortes foram **ampliados** —
> `hero.jpg` 1200×1500 (1,67×), `work-01/02.jpg` 1100×1375,
> `work-03.jpg` 1040×1300, `service-lash.jpg` 1050×1400. Todos são mais
> largos que o material de origem. O próprio
> `public/tayssa/photos/README.md` pede ≥2000px no lado maior para o
> herói e ≥1600px para a sequência, então **nenhum dos cinco atende ao
> requisito da própria casa**. Não existe master melhor para recortar de
> novo: para ter foto em resolução de verdade, precisa de arquivo
> original da Tayssa.

> ⚠️ **`service-lash.jpg` está no disco mas o site não usa.** `byService`
> dentro de `assignPhotos()` é montado **só** a partir da biblioteca do
> banco (`ordered.find(...)`), nunca dos estáticos. Com a biblioteca vazia,
> a seção de serviços fica sem foto e esse arquivo é peso morto. **Decidir:
> ou `assignPhotos()` cai para os estáticos `service*`, ou o arquivo sai.**
> Hoje a página no ar referencia apenas `hero` + `work-01/02/03`.

### 11.4 `assignPhotos()` — como a foto acha o lugar

```ts
// 1. ordena a biblioteca: destaques primeiro
// 2. hero  = o retrato da seção "A Tayssa" (a mesma foto; pedido dela em 29/10/2026)
// 3. work  = POR TÉCNICA, não por ordem:
const WORK_KEYWORDS = [
  ["fio a fio", "fio-a-fio", "fio", "clássico", "classico"],  // slot 01
  ["volume", "russo", "brasileiro", "egípcio", "egipcio"],    // slot 02
  ["manuten"],                                                 // slot 03
];
// cada técnica recebe a 1ª foto cujo lash_style contém uma dessas palavras
// 4. details = próximas da fila
// 5. byService = por palavra-chave (SÓ da biblioteca):
const SERVICE_KEYWORDS = {
  "manutencao-cilios":   ["manuten"],
  "design-sobrancelhas": ["sobrancelh", "brow"],
  "lip-spa":             ["lip", "lábio", "labio"],
  "limpeza-de-pele":     ["limpeza", "pele", "skin"],
  "aplicacao-cilios":    ["volume", "fio", "cílio", "cilio", "lash"],
};
// 6. card = as 6 primeiras (frente do cartão de fidelidade)
```

O casamento por técnica foi introduzido em `6e9c42e`: antes o site pegava
a 2ª, 3ª e 4ª foto por ordem de destaque, então bastava subir uma foto de
sobrancelha para o site chamar aquilo de "fio a fio".

### 11.5 Como a Tayssa sobe foto (o único caminho real)

1. Entra pelo link de acesso de admin (§3.3/§3.4) → `/tayssa/admin/fotos`.
2. Escolhe o arquivo (jpg/png/webp/avif, até 10 MB).
3. Preenche **"Volume / estilo"** (`lash_style`) — **é este campo que
   decide o lugar da foto.** Escrever `fio`, `volume` ou `manutenção` faz
   a foto cair no slot da técnica certa.
4. Legenda (`caption`) e texto alternativo (`alt`) opcionais. **A legenda
   só pode afirmar o que a própria foto declara** — não o nome da técnica,
   não a origem do arquivo.
5. Marcar **destaque** (`featured`) empurra para o começo da fila → vira
   o herói.
6. Arquivar tira do site sem apagar. Apagar remove do Storage também.

### 11.6 Estado da biblioteca hoje

Uma linha, arquivada:

```
id           c207c32c-78fe-4efb-bab0-0772e1416c08
storage_path 2026/b94703d0-c688-43ab-a9bc-7e09fa52c2b3.png
lash_style   "Volume Brasileito"   caption "kahgdukajnbdhewjs"
alt          "bdujiwndbhwijndwikndwikoeijdnw"
1254×1254    status: archived      featured: false
```

Era o **logo da MoveCar**, subido num teste. Foi arquivado. O arquivo
continua no bucket (1 objeto em `tayssa-fotos`). Fotos ativas: **0**.

> **O episódio que gerou a treta:** a foto do MoveCar continuou aparecendo
> em produção depois de arquivada porque `/tayssa` é **prerender estático**
> — produção servia um build anterior ao arquivamento. Só saiu com deploy
> novo. Hoje está confirmado: **0 ocorrências** no HTML em produção.

### 11.7 Fotos que o Lucas mandou e NÃO chegaram

Ao longo da sessão o Lucas anexou **cerca de 16 fotos** (close-ups de
cílios, retrato de modelo, atendimento em andamento, um certificado da
"LINDA LUZ ACADEMY", e uma foto dela mesma contra parede rosa segurando
pinça).

**Nenhuma chegou ao disco desta sessão.** Verificado em três lugares:
diretório de uploads, varredura de arquivos recentes no filesystem, e o
JSONL do transcript procurando blocos `image` de papel user → **zero**.
O único anexo que materializou foi o `.mp4`, porque ele veio por **caminho
de arquivo**, não por anexo.

```
/root/.claude/uploads/a94ed643-.../f69c2673-1.tayssa_1741348201_…mp4   1.9 MB
```

**Consequência prática:** um chat novo também não vai receber as fotos por
anexo. Os caminhos que funcionam são dois:

- **A Tayssa (ou o Lucas) sobe em `/tayssa/admin/fotos`** — é o caminho
  desenhado, e entra direto na biblioteca sem commit nem deploy… **exceto**
  que `/tayssa` é estático e precisa de rebuild para refletir (§13.1).
- **Lucas coloca os arquivos em `public/tayssa/photos/` com os nomes do
  manifesto** e commita.

---

## 12. Autenticação — resumo do fluxo

```
/cadastro (3 passos)  →  users.status = 'pending'  →  /aguardando
                          ↓
            Tayssa aprova/recusa na ficha da cliente
            (adminReviewSignupAction, VIP opcional)
                          ↓
            gera link wa.me com a mensagem de boas-vindas pré-preenchida
            (settings.signup.welcome_template, precisa conter {url} —
            exigido em actions/settings.ts) — ENVIO MANUAL
                          ↓
            {url} = a TELA DE ENTRADA (publicUrl(ROUTES.login) =
            /tayssa/entrar). A aprovação NÃO emite token: não existe
            insert em vip.password_tokens em adminReviewSignupAction
                          ↓
            cliente entra com e-mail + a senha que ELA MESMA escolheu no
            /cadastro (signupAction já grava password_hash na conta
            'pending')  →  loginAction  →  createSession  →  /vip
```

> ⚠️ **Não confundir com a entrada por link de §3.3.** Lá (`magic`/`demo`,
> rota `/tayssa/entrar/link?t=`) abrir o link realmente abre a sessão.
> Aqui, o `{url}` da mensagem de boas-vindas é só a tela de entrada.
>
> ⚠️ **E não confundir com §3.1.** Lá é verdade que nenhuma das duas contas
> existentes tem senha — mas uma cliente que se cadastrar por `/cadastro`
> **escolhe a senha no próprio cadastro**, e `signupAction` já grava o
> hash na conta `pending`. Para ela, login por e-mail e senha funciona
> assim que a Tayssa aprovar.

- Cadastro aberto/fechado em Configurações → Cadastro (`settings.signup.open`).
  Hoje: **aberto**.
- Login diz "seu pedido está com a Tayssa" quando a conta está `pending`.
- Sessão de cliente tentando `/admin` → `/tayssa/acesso` (403 desenhado).
- **Não existe notificação automática.** Nem WhatsApp, nem push, nem
  e-mail. O painel gera a mensagem e o link; o envio é a Tayssa, na mão.

---

## 13. GOTCHAS TÉCNICOS MEDIDOS

Cada um destes custou tempo e foi confirmado por medição, não por
suposição. Não refazer o diagnóstico.

### 13.1 `/tayssa` e `/tayssa/indicar` são `○ (Static)` prerenderizadas
Sem `force-dynamic` e **sem ISR por tempo**: nenhuma rota do Tayssa exporta
`revalidate`. Os únicos `force-dynamic` do produto estão em
`entrar/link/route.ts`, `admin/layout.tsx` e `vip/layout.tsx`. Logo, **nada
se atualiza por decurso de prazo** — um ano calculado no servidor
envelheceria até o próximo deploy, e é por isso que o rodapé **não tem
ano** (corrigir no navegador custava divergência de hidratação só para
isso).

**A atualização da página depende das Server Actions — e as de foto já
revalidam.** `revalidatePhotos()` (`lib/tayssa/actions/photos.ts:14`) faz
`revalidatePath("/tayssa")` mais os layouts de `/admin` e `/vip`, e roda
nas quatro: adicionar (`:87`), editar (`:118`), arquivar (`:139`) e apagar
(`:157`). Está assim desde `b8d7802` (16/set), o commit que criou a
biblioteca. **Foto que a Tayssa subir ou arquivar pelo painel limpa o
prerender na hora — não espera deploy.**

> 🔴 **Mas mudança feita por SQL direto não revalida nada — e foi isso que
> causou o incidente do MoveCar.** O `status` daquela foto foi trocado para
> `archived` por query em 15/out 03:36, fora da action. O `vip.audit_log`
> prova: só existe `photo_added` de 16/set, **nenhum `photo_archived`**.
> Sem a action, sem `revalidatePath()`; sem revalidação, produção seguiu
> servindo o prerender antigo até o deploy de `ad5826f`. A causa não era
> "página estática" em abstrato: era ter contornado o caminho que já
> funcionava. **Mexeu em `vip.photos` por SQL? Rebuilde, ou chame a
> action.**
>
Cobertura de revalidação da home pública, auditada arquivo por arquivo:
**só duas actions revalidam `ROUTES.home`** — `photos.ts:16`
(`revalidatePath("/tayssa")`) e `settings.ts:24`
(`revalidatePath("/tayssa", "layout")`, que cobre negócio, regras,
aniversário, WhatsApp, agenda, cartão, cadastro, catálogo de serviços,
config de benefício e blackouts). As outras onze revalidam apenas
`/tayssa/vip` e `/tayssa/admin`, o que está certo: nada do que elas mexem
aparece na home. **Pela interface, a home está coberta.** O furo é só o
que entra por fora: SQL direto, Storage na mão, ou seed.

### 13.2 `clip-path` esconde o elemento do IntersectionObserver
Medido no Chromium, em página isolada: um elemento com `clip-path`
**desaparece do IntersectionObserver quando o threshold é maior que zero**.
`inset(100% 0 0 0)` e `inset(50% 50% 50% 50%)` **nunca** disparam a `0.2`
e **sempre** disparam a `0`.

`MaskedPhoto` pedia `amount: 0.2` → a máscara nunca abria → **a foto ficava
invisível para sempre**, nas variantes `bottom` e `center`. Corrigido em
`559c585`: quem observa agora é o **invólucro sem recorte**
(`<div ref={alvo}>` com `useInView`), e a máscara anda por `animate`.

### 13.3 React 19 reseta `<form action>` depois da mutação
Campos não controlados voltam ao vazio em **qualquer** resultado, e o
`useActionState` não repõe nada. Quem preenchia 7 campos e recebia "já
existe uma conta com esse e-mail" perdia os 7.

O reset da fase de mutação chega como um **evento `reset` cancelável** →
`onReset` + `e.preventDefault()` barra esse e deixa passar a limpeza do
sucesso. Hook compartilhado: `components/tayssa/ui/form-preservado.ts`
(`useFormPreservado`). Aplicado nos 3 formulários da cliente e nos do
painel.

### 13.4 `wa.me` não decodifica `+` como espaço
Reserializar a query trocando `%20` por `+` quebra a mensagem.
**Use sempre `whatsappUrl()`** de `lib/tayssa/whatsapp.ts`, nunca monte a
URL à mão.

### 13.5 `useReducedMotion()` é `null` no servidor
O estado escondido nascia no servidor, e **nem o React de produção nem o
mount do framer-motion limpam o inline depois**. Com o scroll restaurado
abaixo do elemento, ele nunca intersectava e o conteúdo **sumia para
sempre**. Solução: todo elemento de revelação carrega `data-reveal=""` e o
CSS neutraliza sob `prefers-reduced-motion`, sem depender de JS:

```css
@media (prefers-reduced-motion: reduce) {
  .ty-scope [data-reveal] {
    opacity: 1 !important;
    transform: none !important;
    clip-path: none !important;
  }
}
```

### 13.6 Reset de botão com especificidade zero
O reset usa `:where(.ty-scope) button`. **Se voltar a ser
`.ty-scope button`, todo botão sólido perde fundo e borda.**

### 13.7 Cartão 3D: hit-test perto de 180°
As duas faces ficam `translateZ(1px)` à frente do corpo, cada uma do seu
lado. Coplanares, o Chromium perde o hit-test perto de 180° (o dourado não
abre). O giro é uma **mola presa a [0, 180]**.

### 13.8 Dev server (Turbopack) com hidratação quebrada
Nesta sessão o `next dev` deu página preta com loader travado
(`sessionStorage` null, 1 fiber de 393, falhando até numa página-sonda
mínima dentro e fora do layout do Tayssa). **Não era o código** — era o
Turbopack em dev. Contorno: `next build` + `next start`.

### 13.9 Matar o dev server mata o próprio shell
`pkill -f "next dev -p 3013"` mata o shell que roda o comando, porque a
linha de comando casa com o padrão (exit 144). Use
`pkill -f 'next.dev.-p.301[3]'`.

### 13.10 Previews da Vercel estão atrás de SSO
Toda URL de preview redireciona para `vercel.com/login`. **Não serve para
mostrar nada ao cliente.** Só produção é visível. *(Foi exatamente isso
que fez o Lucas achar que nada tinha sido feito — ver §17.)*

### 13.11 Outros
- `trafego_ddg` **não está** em `pgrst.db_schemas`, então as queries
  `.schema("trafego_ddg")` falham na REST com PGRST106. Fora do escopo do
  Tayssa, não mexido.
- `tayssa-lash/` é espelho mecânico. **Nunca editar à mão** (§15).
- Playwright: use `playwright-core`, Chromium em `/opt/pw-browsers/chromium`,
  `--no-sandbox`; sites externos precisam de `proxy: { server: process.env.HTTPS_PROXY }`.

---

## 14. O que foi feito nesta sessão (6 commits, todos na `main`)

### `6f7537a` — o site vira o produto: direção editorial e as primeiras fotos reais
O site deixa de ser moldura de dashboard e passa a ser a peça principal.
Tipografia como imagem: Montserrat no corpo, Bodoni Moda itálico só dentro
da frase, JetBrains Mono nos micro-rótulos. O herói nasce do próprio nome
— "TAYSSA LASH" cortado pelas bordas da tela — e não de uma foto que
talvez não exista. Direção escrita em `docs/tayssa/DIRECAO.md`. Regra que
sustenta tudo: **foto só entra se existir** — `page.tsx` filtra a
biblioteca e os estáticos antes de passar adiante. Entram as 5 primeiras
fotos reais recortadas do vídeo.

### `157c828` — painel ganha arquitetura de operação com a identidade da casa
Lateral escura fixa agrupando o dia dela (Atendimento · Relacionamento ·
Marca · Ajustes) com contador de espera no próprio item. Topo de vidro com
busca de página e ação (⌘K). Lateral recolhe para faixa de ícones, escolha
no aparelho. Vocabulário `tya-*` em `admin/admin.css`. SVG próprio em
`icons.tsx` (sem lucide, por causa do espelho). `components/tayssa/admin/nav.tsx`
foi apagado.

### `f9addfe` — versiona os dois links de entrada que só existiam no banco
`password_tokens.purpose` já aceitava `magic` e `demo` em produção, mas a
mudança nunca virou arquivo. Sem isso, banco novo nasce sem os dois tipos e
a entrada sem senha quebra. Duas migrations.

### `559c585` — `MaskedPhoto` nunca aparecia
Ver §13.2.

### `6e9c42e` — o site para de afirmar o que não pode garantir
Quatro afirmações falsas + o defeito de movimento reduzido:
1. **A legenda da foto dizia a técnica** sem nenhuma relação com a foto.
   Corrigido com `WORK_KEYWORDS` (§11.4); legenda só repete o que a foto
   diz de si; o perfil de origem saiu (nada no dado garante de onde o
   arquivo veio); os 3 estáticos perderam legenda e nome de técnica.
2. **A seção VIP publicava meta do catálogo.** A ficha de indicação
   imprimia `Hoje: {description} Após {threshold ?? 3} indicações
   confirmadas` — número que a Tayssa muda em Configurações e que o motor
   trata por unidade. A linha saiu: a home não deriva mais meta nenhuma; a
   ficha de cada privilégio mostra só a `description` que ela escreveu no
   catálogo (e, sem benefício ativo do tipo, uma ficha padrão que não
   afirma quantidade). O lookup também ficou explícito —
   `descricaoDoCatalogo()` ordena por `sort_order` antes do `find`.
   > ⚠️ **Correção a uma versão anterior deste documento:** nenhuma versão
   > commitada chegou a imprimir meta de *fidelidade* na home, e a frase
   > "a partir de 100 pontos" não existe em commit nenhum do repositório.
   > A única meta que a seção publicava era a de indicação. A seleção
   > "primeiro `loyalty` por ordem" existia no lookup, mas sem efeito
   > visível.
   >
   > 🔴 **E a regra não valeu para o site inteiro:** `/tayssa/indicar`,
   > que este commit não tocou, **continua publicando meta do catálogo** —
   > "Após 3 indicações confirmadas", vindo do `threshold` de
   > `referral_reward`, em `app/tayssa/indicar/page.tsx:72-76`. Pendência
   > aberta (§15, item 5).
3. Saiu **"não é clube de desconto"** — o catálogo contradiz na letra.
4. **O copyright perdeu o ano** (§13.1).
5. **Movimento reduzido** (§13.5).
+ âncora entre páginas honrada (o rodapé mandava para `/tayssa#vip` e a
pessoa caía no topo); `whatsappUrl()` de volta (§13.4); a máscara parou de
cortar o rabo do itálico serifado.

### `ad5826f` — o painel para de contradizer a própria regra
- **O dourado dizia duas coisas ao mesmo tempo.** `tya-pill--gold`
  (`#f5efdf`) e `tya-pill--warn` (`#f6eedd`) diferiam em 1–2 por canal: na
  ficha, "Desbloqueado" e "Solicitado" apareciam na mesma pastilha bege —
  justamente a distinção central do produto. `.tya-slot[data-tom="warn"]`
  tinha ficado fora do endurecimento e seguia pintando espera de dourado em
  3 telas. **Agora dourado é só o que já está nas mãos dela.**
- **"Pendências" não contava o pedido de acesso.** Ficha e lista somavam as
  *mesmas* duas parcelas (atendimentos `pending` + benefícios
  `pending_validation`), sobre o mesmo objeto do `listClients()` — então
  uma cliente que só tinha pedido de acesso aparecia como "0" na ficha e
  "—" na lista: invisível nas duas e fora do filtro. E um benefício
  `requested` contava como **liberado** (`benefitsAvailable` soma
  `available + requested + approved`) sem contar como pendência, embora
  ainda esperasse decisão dela. Agora o pedido de acesso entra nas duas
  contas, e a ficha conta também os `requested` — descontando-os de
  "Benefícios liberados", para o mesmo benefício não aparecer como
  liberado **e** como pendência.
  > ⚠️ **Correção a uma versão anterior deste documento**, que dizia que
  > "a ficha somava três e a lista só dois" *antes* do commit. Era o
  > contrário: antes as duas contas eram idênticas, e foi este commit que
  > introduziu a terceira parcela. **Resíduo conhecido:** a lista ainda
  > não conta `requested`, então para uma cliente só com benefício
  > `requested` as duas contas continuam divergindo.
- **Formulário perdia o que foi digitado** (§13.3).
- **Texto de máquina em inglês na tela:** "Array must contain at least 1
  element(s)" e "Invalid uuid" chegavam à Tayssa. **6 mensagens em 4
  schemas** de `lib/tayssa/validation.ts`. `cycle_key` cru ("loyalty:loyalty_100") saiu
  da tela de Benefícios — `cicloLegivel()` virou utilitário compartilhado.
- **Celular, medido a 390px:** o cartão "Adicionar foto" ficava 358px numa
  caixa de 282 e o excedente era clipado sem rolagem (raiz: trilha de grade
  com `min-width: auto`); chip de atalho ganhou corte com reticências e
  `text-align: left` (centralizado, o corte comia o **começo** do nome);
  botão "pequeno" estava maior que o normal (42 vs 38) — o normal subiu
  para 44; tabelas de histórico escondiam **100%** da coluna Estado (453px
  de tabela em 240px visíveis) e viraram cartão com rótulo.

---

## 15. PENDÊNCIAS ABERTAS

### Alta

1. **Fotos reais.** Zero fotos ativas no banco; 5 recortes do mesmo vídeo
   no disco. As ~16 fotos do Lucas nunca chegaram (§11.7). **Este é o
   bloqueio número um do produto.**
2. **Não existe ISR por tempo** (§13.1) — nenhuma rota exporta
   `revalidate`. Pela interface a home está coberta (`photos.ts` e
   `settings.ts` revalidam `/tayssa`), então **isto não é bug, é limite
   conhecido**: qualquer mudança que entre por fora da interface (SQL
   direto em `vip.*`, arquivo posto no Storage na mão, seed) **não** limpa
   o prerender e exige rebuild. Decidir se vale ligar
   `export const revalidate` na home como rede de segurança.
3. **`service-lash.jpg` é inalcançável** — `byService` só lê do banco
   (§11.3). Decidir: fallback para os estáticos, ou tirar o arquivo.
4. **As 5 fotos do site estão ampliadas** acima da resolução da fonte e
   abaixo do mínimo que o próprio README pede (§11.3). Só resolve com
   arquivo original da Tayssa.
5. **`/tayssa/indicar` ainda publica meta do catálogo** — "Após 3
   indicações confirmadas", lido do `threshold` de `referral_reward`
   (`app/tayssa/indicar/page.tsx:72-76`). Contradiz a regra que o commit
   `6e9c42e` impôs na home: o site não deriva número do catálogo. A
   página não foi tocada por aquele commit.
6. **`CLAUDE.md` está errado** sobre a conta demo: diz
   `cliente01@demo.tayssa`, o banco diz `demo@tayssa.vip`. E diz "senha
   combinada no chat" quando **nenhuma das duas contas tem senha** (§3.1).

### Média

7. **Espelho `tayssa-lash/` está DUAS sessões atrás.** 141 arquivos; a
   última sincronização é o commit `2493449`, de **16/set/2026** — nada
   tocado desde então (os mtimes uniformes de 08/out são só a hora do
   clone). Faltam **11 commits** do tronco: 4 de 16/set (`0564f61`,
   `3b300fa`, `4df00ee`, `84fca1b`) e 7 de 15/out (`6f7537a`, `157c828`,
   `f9addfe`, `559c585`, `6e9c42e`, `ad5826f`, `fc50aa8`).
   Falta no espelho:
   - de 16/set: **`app/entrar/link/`** — a entrada por link inteira. Sem
     ela o standalone **não tem primeiro acesso sem senha**. E as
     migrations `20260916033527_vip_magic_link.sql` e
     `20260916034246_vip_demo_link.sql` (o espelho só tem 3 das 5).
   - de 15/out: `docs/DIRECAO.md`, `components/admin/icons.tsx`,
     `components/admin/sidebar.tsx`, `components/ui/form-preservado.ts`,
     **as 5 fotos reais**.

   Ainda tem `components/admin/nav.tsx` (apagado no tronco em `157c828`) e
   `components/ui/status.tsx`.
   **Regenerar por script, nunca à mão.** O script
   (`scratchpad/sync-standalone.mjs`) **não existe mais no repo** —
   precisa ser reescrito. A transformação é mecânica:
   ```
   copiar  app|components|lib|public|docs /tayssa  +  migrations *vip*
   trocar  @/lib/tayssa/      → @/lib/
           @/components/tayssa/ → @/components/
           "/tayssa/          → "/
   ```
8. **`components/tayssa/ui/status.tsx`** está morto no tronco mas o espelho
   usa. Apagar **só depois** de sincronizar o espelho.
9. **Repo e projeto Vercel próprios para `tayssa-lash/`.** A plataforma
   barrou a criação pela sessão. Caminho: importar o repo do painel na
   Vercel com **Root Directory `tayssa-lash`** + as 2 envs do Supabase; ou
   criar o repo `tayssa-lash` e dar acesso ao app. Depois apontar
   `tayssa.dosedegrowth.com` e **tirar `/tayssa` do painel**.

### Baixa (achados de revisão, não corrigidos)

10. **Um erro de eslint DENTRO do Tayssa, e é novo.**
    `components/tayssa/admin/sidebar.tsx:61` —
    `react-hooks/set-state-in-effect`: `setMin(...)` é chamado
    sincronamente dentro do `useEffect` que lê o `localStorage`. O arquivo
    nasceu em `157c828`, **nesta sessão**. Mais 3 warnings de import sem
    uso em `components/tayssa/admin/forms.tsx` (`useEffect`, `useRef`,
    `FormEvent`), deixados por `ad5826f` ao mover a lógica para o hook
    `useFormPreservado`.
    Conserto do erro: `useSyncExternalStore` com snapshot de servidor
    `false` (a leitura é browser-only, então o `useState` inicial não
    resolve — daria divergência de hidratação).
    **Não é falha funcional:** a lateral funciona, é aviso de renders em
    cascata. Mas é regressão desta sessão, não erro antigo.
    > ⚠️ O resto dos 57 erros do `npm run lint` é antigo e **fora** do
    > Tayssa (`.claude/skills/*`, `app/(dashboard)/*`, `components/andre/*`,
    > `components/clientes/*`, `components/layout/topbar.tsx`,
    > `components/charts/area-chart.tsx`,
    > `supabase/functions/sync-meta-ads`), de 11/set ou 30/set. **Esses
    > sim, ignore.**
11. **Erros de formulário sem gestão de foco.** Zero `.focus()` e zero
    `aria-live` em `components/tayssa` e `app/tayssa` — ao submeter com
    erro, o foco não vai para o campo inválido nem para um resumo.
    Quanto a `role="alert"`, **27 das 32 renderizações de erro já têm**
    (e `role="alert"` já implica `aria-live="assertive"`). Faltam 5:
    `components/tayssa/ui/field.tsx:35, 68, 96` (`TyInput`, `TyTextarea`,
    `TySelect` — o erro de campo de todo o site público, do login/cadastro
    e do app VIP) e `components/tayssa/admin/forms.tsx:38` (helper
    `Aviso`) e `:274` (erro do botão de gerar link). Bônus: só `TyInput`
    tem `aria-describedby`; `TyTextarea` e `TySelect` têm apenas
    `aria-invalid`, então o texto do erro não é associado ao campo.
    Conserto: 5 linhas de `role="alert"`, 2 de `aria-describedby`, uma
    rotina de foco no submit.
12. Chips sem `aria-pressed`.
13. Gap do `.tya-indice`.
14. `components/tayssa/public/services.tsx:95` — fallback ilustra 5
    serviços quando nenhum está ativo (`const list = (services.length ? services : FALLBACK)`).
15. Duplicação dos helpers `Vazio` / `Atalho`.

---

## 16. Comandos de verificação

```bash
cd /home/user/paineldosedegrowth

npx tsc --noEmit        # tem de dar 0 erros   (último check: 0 ✓)
npx next build          # compila todas as rotas
npm run lint            # 57 erros. 56 antigos e FORA do Tayssa (ignore).
                        # 1 dentro: components/tayssa/admin/sidebar.tsx:61
                        # — novo, desta sessao. Ver §15, item 10.

# testes puros do domínio
node --experimental-strip-types --test \
  lib/tayssa/rules.test.ts lib/tayssa/timeline.test.ts

# deploy: push na main → Vercel auto-deploya em ~1-2 min
git add <arquivo>       # arquivo por arquivo, nunca -A em commit grande
git commit -m "..."
git push origin main
```

Trailers de commit obrigatórios:
```
Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01LJGbtf1bgj2Csww6uiansA
```

**Nunca** colocar identificador de modelo em commit, PR, comentário de
código ou qualquer artefato do repo. **Não abrir PR sem pedido explícito.**

---

## 17. O que deu errado neste chat (para o próximo não repetir)

Registrado porque é a causa raiz da treta, não desabafo.

1. **Trabalhei em branch e mostrei preview.** Os 6 commits ficaram em
   `claude/amazing-lovelace-tlgo5c` durante horas. Produção serve `main`.
   As URLs de preview da Vercel estão atrás de SSO (§13.10), então o Lucas
   não conseguia nem abrir. **Ele passou a sessão inteira olhando produção
   intocada** e concluiu, com razão, que nada havia sido feito.
2. **Pedi autorização em vez de publicar.** Ele já tinha dado a direção:
   "faça decisões autonomamente", "NO VIBE CODING", "não quero saber do
   problema, quero que você resolva". Cada "me diz qual" foi atrito puro.
   **Publique e depois conte.**
3. **A foto do MoveCar.** Ela estava arquivada desde a madrugada, mas eu
   arquivei **por SQL**, não pela action — então `revalidatePath()` nunca
   rodou e produção seguiu servindo o prerender antigo (§13.1). Pior: eu
   atribuí o sintoma a "página estática" em abstrato, quando a causa era
   eu ter contornado o caminho que já funcionava. E expliquei o mecanismo
   em vez de dar o deploy que resolvia.
4. **Fotos dele nunca chegaram ao disco** (§11.7) e eu levei tempo demais
   para estabelecer isso com certeza, o que fez parecer que eu tinha
   ignorado os anexos.
5. **Afirmações falsas que eu já tinha dado como prontas** e que só a
   revisão adversarial pegou: a legenda afirmando técnica em foto
   arbitrária; o VIP publicando a meta de 8 serviços do cartão ao lado de
   prosa sobre marcos de ponto; `%20`→`+` nos links do WhatsApp. **Duas
   "correções" feitas por agentes criaram afirmações falsas novas** —
   corrigidas à mão.

**A lição operacional:** neste projeto, "pronto" significa *em produção e
verificado buscando a página*. Qualquer outra definição gera exatamente a
conversa que gerou.

---

## 18. Contexto do repositório-mãe (o que o próximo chat vai topar)

O repo é o **painel de tráfego da DDG**, e o Tayssa é inquilino dele. Ao
abrir o projeto você vai ver muita coisa que não é Tayssa. Não mexa.

- **Produto:** SaaS multi-tenant de gestão de anúncios (Meta + Google Ads +
  Shopify) para os clientes da DDG, com relatórios por IA e view
  whitelabel pública em `/c/[slug]`.
- **Schema:** `trafego_ddg` (≠ `vip`). Tabelas `clientes`,
  `clientes_acessos`, `campanhas_snapshot`, `anomalias`, `relatorios`, etc.
- **Edge Functions** (Supabase, Deno): `sync-meta-ads`, `sync-google-ads`,
  `sync-shopify`, `detect-anomalies`, `push-offline-conversions`,
  `track-change-impact`. **Só quatro têm cron** (`trafego_ddg_sync_meta`,
  `trafego_ddg_sync_shopify`, `trafego_ddg_detect_anomalies`,
  `trafego_ddg_push_offline_conversions`); `sync-google-ads` e
  `track-change-impact` rodam só sob demanda — o cron do Google é
  pendência do painel. E dois schedules em produção divergem da tabela do
  `CLAUDE.md`: shopify roda `41 * * * *` (não `0 * * * *`) e
  push-offline-conversions roda `9,39 * * * *` (não `*/30 * * * *`).
- **Tailwind v4 + shadcn/ui** no resto do repo. **O Tayssa não usa Tailwind.**
- Cor primária da DDG é `#F15839` (laranja). **Nada a ver com o Tayssa.**
- Outras LPs de cliente convivem no mesmo `app/`: `/carol`, `/marina`,
  `/lydia`, `/palavracomalma`, `/drsamuel`. **O Tayssa não reaproveita
  componente de nenhuma.**
- **Pendências do painel DDG** (independentes do Tayssa): 4 secrets Google
  no Supabase, cron do Google, acesso padrão na Google Ads API, OAuth
  Shopify da Marina, `ANTHROPIC_API_KEY` no Vercel.

O `CLAUDE.md` da raiz cobre o painel inteiro e tem uma seção "Tayssa VIP".
O `tayssa-lash/CLAUDE.md` cobre o espelho standalone. **Este arquivo é o
contexto do produto Tayssa.**

---

## 19. Arranque rápido para o próximo chat

Ordem de leitura:

1. `AGENTS.md` — a regra do Next 16 (não confiar em training data)
2. **este arquivo**
3. `docs/tayssa/DIRECAO.md` — o contrato de design (out/2026)
4. `docs/tayssa/DESIGN.md` — a direção original (set/2026), mais longa
5. `docs/tayssa/AUDIT.md` — a auditoria de 16/set, com o que é real × simulado
6. `CLAUDE.md` seção "Tayssa VIP" — operação, com as correções da §15.4

Para ver o produto: `https://painel.dosedegrowth.com/tayssa`.
Para entrar no painel ou no app: link de acesso (§3.3), ou gere um (§3.4).

Se for mexer em código: `npx tsc --noEmit` antes e depois, e **publique na
`main`** — produção é a única coisa que o Lucas enxerga.
