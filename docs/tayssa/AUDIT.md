# Tayssa Lash — auditoria completa (16/set/2026)

Feita antes de qualquer mudança, lendo cada rota, action, query, tabela
e fluxo. Classificação: **KEEP · IMPROVE · REBUILD · INTEGRATE · ADD**.

## O que é REAL hoje (persistido e ligado ponta a ponta)

| Área | Estado | Evidência |
|---|---|---|
| Auth própria (scrypt, sessão em cookie + `vip.sessions`, guards de página/action, middleware) | REAL | `lib/auth/*`, `middleware.ts` |
| Primeiro acesso por link único (7 dias), troca/definição de senha | REAL | `password_tokens`, `actions/auth.ts` |
| Admin cria/edita cliente, VIP on/off, pausa conta, gera link, revoga sessões | REAL | `actions/clients.ts` |
| Atendimentos: cliente registra → `pending`; Tayssa confirma → pontos | REAL | `client_services` |
| Cartão: visita confirmada → carimbo oculto; cliente raspa; 8/8 → presente `pending_validation` | REAL | `loyalty_cards/stamps`, `engine.stampVisit` |
| Benefícios: `pending_validation → available → requested → approved → redeemed` | REAL | `actions/benefits.ts` |
| Indicações: público + VIP → pipeline no admin → só `approved` conta | REAL | `referrals`, ciclos de 3 |
| Aniversário: elegível (VIP + data + janela) → Tayssa libera → cliente usa | REAL, estados implícitos | `adminReleaseBirthdayAction` |
| Agenda da cliente (serviço → dia → hora → pedido `requested`, cancelar) | REAL só do lado da cliente | `appointments`, `actions/booking.ts` |
| Ranking por pontos confirmados (só primeiro nome) | REAL | `queries/vip.getRanking` |
| Configurações (negócio, regras, aniversário, WhatsApp, serviços, benefícios, blackouts) | REAL | `/admin/configuracoes` |
| Fuso da casa (`nowInBusinessTz`) | REAL | `lib/format.ts` |

## O que está SIMULADO / PARCIAL / AUSENTE

| Área | Estado | Motivo |
|---|---|---|
| **Cadastro da cliente + aprovação** | AUSENTE | `users.status` só tem `active/inactive/suspended`; não existe `/cadastro`; a Tayssa cria tudo à mão |
| **Fotos** | AUSENTE | 18 slots estáticos em `public/tayssa/photos/` (todos vazios); nada no admin; nada no banco; sem bucket |
| **Cartão físico 3D** | PARCIAL | o cartão é um retângulo creme plano com raspadinha; não gira, não tem frente/verso nem fotos |
| Agenda no admin | AUSENTE | a Tayssa não vê nem confirma pedidos; disponibilidade só editável no banco |
| Linha do tempo / progresso visual | AUSENTE | a home mostra números e listas, sem trajetória nem anel de progresso |
| Estados de carregamento | AUSENTE | nenhum `loading.tsx`; troca de aba no app é seca |
| Aniversário elegível × liberado × usado | PARCIAL | a distinção existe no dado, não na interface (nem admin nem cliente) |
| Configs de fidelidade (`loyalty`) e agenda (`booking`) | PARCIAL | lidas do banco, sem formulário no admin |
| Pendentes de cadastro na visão geral | AUSENTE | depende do cadastro |

## Mapa de implementação

### KEEP
- Modelo de dados e regras (nada de benefício automático; só a Tayssa libera).
- Auth/DAL/segurança; `rules.ts` puro e testado; auditoria (`audit_log`).
- A raspadinha (canvas, vibração, "a festa é da última raspada").
- App da cliente mobile-first (nav inferior, alvos ≥ 44px, uma coluna).
- Marca `<TyBrand />`, tokens em `tayssa.css`, curtain transition do site público.
- **Tipografia: Montserrat fica.** Foi escolha explícita do Lucas em 14/set ("fonte limpa, igual ao painel") e é a família da casa DDG. O salto de qualidade vem de escala, contraste de peso (200/600), tracking e composição — não de trocar a fonte de novo.

### IMPROVE
- Visão geral do admin (pendentes de cadastro, agenda do dia).
- Detalhe da cliente (aprovar/recusar, agenda dela, estados de aniversário explícitos).
- Home VIP (timeline, anel de progresso, contadores) sem virar painel de cards.
- Estados desenhados: loading/empty/erro/pendente/recusada.
- Transições dentro do app (entrada de página coreografada, momento de marco).

### REBUILD
- **Cartão de fidelidade**: objeto físico com perspectiva, luz e material; frente com identidade + nome + sequência cinematográfica de fotos; giro 3D real; verso com as 8 posições integradas e a raspadinha.

### INTEGRATE
- Agenda ↔ admin (confirmar/cancelar/realizado; disponibilidade editável).
- Fotos ↔ site público, cartão e futuros consumidores (uma biblioteca, um upload).
- Aniversário ↔ timeline e estados na cliente.

### ADD
- Cadastro público em passos + tela "aguardando" + aprovação no admin + boas-vindas.
- Sistema de imagens: bucket, `vip.photos` (estilo/volume, legenda, alt, ordem, status), admin "Adicionar foto" + biblioteca.
- `/admin/agenda` + editor de disponibilidade.
- Formulários de `loyalty` e `booking` nas configurações.
- `loading.tsx` no app e no admin.

## Ordem de execução
A cadastro/aprovação → B imagens → C cartão 3D → D dashboard → E admin agenda/pendentes → F motion/estados → G quality gates + sync `tayssa-lash/` + deploy.

## Fora de alcance nesta sessão (declarado, não fingido)
- Fotos reais só entram quando a Tayssa subir pelo admin (ou o Lucas colocar arquivos): o sistema nasce pronto e vazio, com fallback tonal honesto.
- Notificações (WhatsApp automático, push) não existem: o admin gera a mensagem e o link, o envio é manual.
