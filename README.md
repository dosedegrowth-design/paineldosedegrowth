# Tráfego DDG

> Dashboard inteligente de tráfego pago da Dose de Growth.
> Multi-cliente, multi-plataforma (Google Ads + Meta Ads), com IA acionável.

[![Stack](https://img.shields.io/badge/stack-Next.js%2016%20%2B%20Supabase-orange)]()
[![Status](https://img.shields.io/badge/status-Fase%201-yellow)]()

---

## 📌 Sobre

Plataforma proprietária da DDG que substitui ferramentas SaaS de tráfego (TripleWhale, Funnelytics, etc.) e adiciona o que ninguém oferece: **integração com painéis comerciais DDG para enviar conversões offline (server-side) ao Google e Meta**.

### Funcionalidades
- Sync automático Google Ads + Meta Ads (4x/dia)
- Anomaly detection com narrativa por IA
- Change tracker (mede impacto de mudanças após 7/14/21d)
- Chatbot contextual sobre cada conta
- Otimizações priorizadas
- Relatório IA (PDF + WhatsApp via Evolution)
- ⭐ **Server-side conversions** (Painel Comercial → Google/Meta offline events)
- Whitelabel por cliente

---

## 🏗️ Stack

- **Frontend**: Next.js 16 (App Router) + TypeScript + Tailwind v4 + shadcn/ui
- **Charts**: Recharts + Framer Motion
- **Backend**: Next.js API Routes + Supabase Edge Functions
- **Database**: Supabase Postgres (schema `trafego_ddg`)
- **Auth**: Supabase Auth
- **AI**: Anthropic Claude (Sonnet + Haiku)
- **Hosting**: Vercel

---

## 🚀 Setup

```bash
npm install
cp .env.example .env.local
# preencher credenciais
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

### Variáveis de ambiente necessárias

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Anthropic
ANTHROPIC_API_KEY=

# Google Ads
GOOGLE_ADS_DEVELOPER_TOKEN=
GOOGLE_ADS_CLIENT_ID=
GOOGLE_ADS_CLIENT_SECRET=

# Meta Ads
META_APP_ID=
META_APP_SECRET=

# Evolution (WhatsApp)
EVOLUTION_API_URL=
EVOLUTION_API_KEY=
```

---

## 📂 Estrutura

```
trafego-ddg/
├── app/                       # Next.js App Router
│   ├── (auth)/login/          # Login page
│   ├── (dashboard)/           # Layout autenticado
│   │   ├── dashboard/         # Visão Geral
│   │   ├── campanhas/         # Tabela de campanhas
│   │   ├── search-terms/      # Auditoria de termos
│   │   ├── alertas/           # Anomalias
│   │   ├── mudancas/          # Change tracker
│   │   ├── otimizacoes/       # Sugestões priorizadas
│   │   └── relatorios/        # Geração de reports
│   └── api/                   # API routes
├── components/
│   ├── ui/                    # shadcn primitives
│   ├── charts/                # Recharts customizados DDG
│   ├── kpi-card.tsx           # KPI animado
│   └── ...
├── lib/
│   ├── supabase/              # Clients (browser, server, admin)
│   ├── google-ads/            # API client
│   ├── meta-ads/              # API client
│   ├── anthropic/             # Claude client
│   └── mock-data.ts           # Dados mock pra desenvolvimento
├── public/brand/              # Logos DDG
└── supabase/
    ├── migrations/            # Schema versionado
    └── functions/             # Edge Functions
```

---

## 📖 Documentação

| Documento | Conteúdo |
|---|---|
| [PLANO_TRAFEGO_DDG.md](./PLANO_TRAFEGO_DDG.md) | Documento mestre |
| [IDENTIDADE_VISUAL.md](./IDENTIDADE_VISUAL.md) | Brand DDG aplicado |
| [REGRAS_E_LOGICA.md](./REGRAS_E_LOGICA.md) | Regras de negócio |

---

## 📝 Licença

Privado — Dose de Growth ©2026
