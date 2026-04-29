# REGRAS E LÓGICA · Tráfego DDG

> Regras de negócio detalhadas. Atualizar a cada mudança importante.
> Última atualização: 2026-04-28

---

## 1. ESTRUTURA DE ACESSO

### Roles
- **adm_geral** — acesso total a todos os clientes. Único role da Fase 0/1 (Lucas).
- **gestor_ddg** — operação completa em clientes atribuídos. Pode pausar/editar.
- **viewer_cliente** — read-only do próprio cliente. Cliente final.

### Multi-cliente desde o dia 1
Toda query passa por `cliente_id`. RLS aplicado em todas as tabelas.
ADM Geral consegue ver tudo via função `user_is_adm_geral()`.

---

## 2. KANBAN DE STATUS DE CAMPANHA

| Status | Origem | Ação ao detectar |
|---|---|---|
| `active` | Plataforma | Continuar tracking |
| `paused` | Plataforma ou DDG | Manter no histórico, parar de alertar |
| `removed` | Plataforma | Soft archive (mantém histórico) |

---

## 3. SYNC DE DADOS

### Frequência
- Cron 4x/dia: 06h, 12h, 18h, 23h (BRT)
- Sync manual via botão (rate-limit 1x/min)

### Estratégia de upsert
- **Snapshots imutáveis**: `*_snapshot` é append-only por (cliente_id, plataforma, entity_id, data)
- Se sync rodar 2x no mesmo dia, o ON CONFLICT atualiza valores
- `raw_jsonb` mantém payload bruto da API pra debug futuro

### O que sincronizar
| Entidade | Google Ads | Meta Ads |
|---|---|---|
| Campanhas | ✅ | ✅ |
| Adsets/AdGroups | ✅ | ✅ |
| Ads + criativos | ✅ | ✅ thumbnails cacheados |
| Keywords | ✅ | — |
| Search Terms | ✅ últimos 14d | — |
| Insights diários | ✅ últimos 30d | ✅ últimos 30d |

---

## 4. ANOMALY DETECTION

### Métricas-chave monitoradas
1. Investimento (gasto)
2. Conversões
3. CPA
4. ROAS
5. CTR

### Algoritmo
Para cada cliente ativo, diariamente às 7h:
```
baseline_7d = média (D-7 a D-1)
baseline_14d = média (D-14 a D-1)
desvio = ((D - baseline) / baseline) * 100

severidade =
  |desvio| < 20% → não cria anomalia
  20% ≤ |desvio| < 30% → baixa
  30% ≤ |desvio| < 40% → media
  40% ≤ |desvio| < 60% → alta
  |desvio| ≥ 60% → critica
```

### Threshold customizável por cliente
Em `config_alertas` é possível overridar `threshold_warn` e `threshold_critical` por métrica.

### Notificações
- **Crítica** → WhatsApp imediato pro gestor (Evolution)
- **Alta/Média/Baixa** → aparece no /alertas + resumo matinal

### Narrativa IA
Claude Haiku (custo baixo) gera 2-3 frases explicando possível causa + 1 recomendação.

---

## 5. CHANGE TRACKER

### Quando registra
- Toda ação inline no painel (pausar, editar budget, negativar termo, etc.)
- Mudança detectada na sync que não foi feita pelo painel (ex: cliente alterou direto na plataforma)

### Lock de 20%
Mudança de budget acima de 20% requer confirmação extra. Regra do Google Ads pra não resetar learning.

### Medição de impacto
Cron diário às 8h:
- Mudanças de 7 dias: snapshot `metricas_apos_7d_jsonb`
- Mudanças de 14 dias: snapshot `metricas_apos_14d_jsonb`
- Mudanças de 21 dias: snapshot final + narrativa IA + veredicto

### Veredicto final (aos 21d)
- **positiva**: melhorou métrica primária da entidade
- **negativa**: piorou
- **neutra**: variação dentro do baseline natural

---

## 6. SEARCH TERMS

### Heurística "alto gasto, baixo retorno"
Termo é flagged se nos últimos 14d:
- Gasto ≥ R$ 50 E zero conversões, OU
- CPA do termo > 2x o CPA médio da campanha

### Negativação
- **Por campanha**: Negative keyword direto na campanha
- **Lista compartilhada**: usar shared negative list (configurável)
- Match type default: PHRASE

---

## 7. OTIMIZAÇÕES PRIORIZADAS

### Regras hardcoded (Fase 3)
| Regra | Prioridade |
|---|---|
| Conta sem prospecting (100% remarketing/conversion) | alta |
| Keyword com QS<5 e gasto >R$100 | alta |
| Campanha com ROAS<1.5 e gasto >R$500 | alta |
| Adset em learning há +14d | média |
| Ad com CTR <50% da média do adset | média |
| Search term com gasto >R$200 e zero conv | média (auto-flag p/ negativar) |
| Audiências com >25% overlap | baixa |

### Layer Claude Sonnet
Por cima das regras, Claude contextualiza e sugere ação concreta com impacto estimado.

---

## 8. SERVER-SIDE CONVERSIONS ⭐

### Webhook Painel Comercial
Endpoint: `POST /api/webhooks/painel-comercial`

Headers obrigatórios:
- `x-ddg-signature`: HMAC-SHA256 do body com `painel_comercial_webhook_secret`
- `x-ddg-cliente-slug`: slug do cliente

### Match keys (ordem de prioridade)
1. **gclid** (Google Ads click ID) — mais preciso pra Google
2. **fbclid** (Meta click ID) — mais preciso pra Meta
3. **email_hash + telefone_hash** — fallback
4. **click_id_ddg** — eid próprio (cross-tracking custom)

### Hash obrigatório
Email/telefone passam por SHA-256 antes de salvar (LGPD + boa prática Google/Meta).

### Push assíncrono
Cron a cada 30min processa `eventos_offline` pendentes:
1. Tenta Google Ads OfflineDataJobService
2. Tenta Meta CAPI `/{pixel_id}/events`
3. Retry: 3 tentativas com backoff exponencial (1min, 5min, 30min)

### Métricas de qualidade
- Taxa de match >70% = ok
- Taxa de match <70% = problema na captura de gclid/fbclid no form de origem
- Alerta automático se cair abaixo de 50%

---

## 9. RELATÓRIOS

### Tipos
| Tipo | Modelo IA | Caso de uso |
|---|---|---|
| PDF | Haiku | Relatório formal mensal/semanal |
| WhatsApp | Haiku | Resumo diário/semanal direto pro cliente |
| Email | Haiku | Versão mais formal pro cliente |
| CSV | — | Export bruto pra análise externa |

### Prompt customizado
Salvo em `relatorios_prompts` por (cliente_id, tipo). Permite cada cliente ter narrativa diferente.

### Recorrência
- WhatsApp diário: 7h da manhã (configurável)
- Email semanal: segundas 8h
- PDF mensal: 1º dia do mês 9h

---

## 10. AUTH E SESSÃO

### Fase 0/1: ADM_GERAL único
Acesso via login Supabase Auth (email + senha).

### Fase 2+: multi-user
Cada gestor com seu user. ADM Geral atribui clientes via `clientes_users`.

### Fase 5+: viewer_cliente
Convite por magic link. Cliente acessa `/cliente/[slug]` com whitelabel.

### Link público (Fase 5)
`/p/[client_slug]/[token]` sem login. Token expira em 30d.

---

## 11. DESIGN PRINCIPLES

### Dark-first
Theme default = dark. Light mode opcional.

### Cor primária = laranja DDG (#F15839)
Uso estratégico: CTAs, KPIs em destaque, linha principal de gráfico, estado ativo de menu.

### Densidade alta
Dashboards têm muita info. Tabelas com sticky header, color-coding por threshold (verde/amarelo/vermelho).

### Microinterações
- Framer Motion: layoutId em sidebar, slide-in em rows novas
- Recharts: animationDuration 500ms
- KPI Cards: animate count-up de 0 ao valor final em 0.9s

---

## 12. FILOSOFIA DE PRODUTO

### IA é camada operacional, não substituição
Equipe DDG fica mais produtiva. Decisões finais sempre humanas.

### Banco próprio = independência
Não dependemos de SaaS de tráfego. Toda análise customizada possível.

### Multi-cliente desde o dia 1
Estrutura suporta 10/100/1000 clientes. Não monolítico Petderma-only.

### Stack consistente DDG
Manutenção compartilhada com dash-supervisao, painel-hl-models, cardapio-inteligente.

---

## 13. GOTCHAS CONHECIDOS

### Google Ads
- Developer token leva 3-7 dias pra aprovar
- `metrics.cost_micros` é em micros (dividir por 1.000.000)
- Login Customer ID necessário se MCC

### Meta Ads
- Token long-lived expira em 60 dias (renovar via System User token)
- Insights podem demorar 24-72h pra estabilizar (atribuição)
- Thumbnails do creative têm URL temporária — cachear no Storage

### Supabase
- Schema `trafego_ddg` precisa estar exposto: `pgrst.db_schemas`
- Edge Functions Free tier tem limite de Worker — manter batches ≤15
- RLS não funciona com service_role — admin ops devem ser bem isoladas

### Anthropic
- Haiku ~10x mais barato que Sonnet (usar pra massa)
- Rate limit: cuidar de spike de geração de relatórios em batch
- Cache de respostas via `cache_control` em prompts repetitivos

---

## 14. CHANGELOG

| Data | Versão | Mudança |
|---|---|---|
| 2026-04-28 | v0.1 | Documento inicial |
