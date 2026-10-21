---
name: siteflow-core
description: Skill completa do projeto SiteFlow DDG — sistema automatizado de prospecção fria + criação e entrega de sites one-page para PMEs em SP (barbearias, salões de beleza, estéticas). Cobre arquitetura end-to-end (raspagem Google Places → WhatsApp Meta Cloud API → agentes Claude → briefing → geração com templates Next.js → deploy Vercel → cobrança Asaas → registro de domínio Registro.br no CPF/CNPJ do cliente). Use quando trabalhar com qualquer parte do SiteFlow. Trigger - 'siteflow', 'site as a service', 'prospecção barbearia', 'site automatizado', 'painel siteflow', 'agente Vera', 'agente Bruna', 'template barbearia', 'template salão', 'briefing automatizado', 'raspagem google maps sem site'.
---

# SiteFlow — Site as a Service automatizado DDG

## Contexto

Projeto **SiteFlow** é um sistema end-to-end que prospecta empresas em SP sem site no Google Maps, aborda via WhatsApp, qualifica via IA, coleta briefing, gera site one-page com template + Claude, faz deploy na Vercel e cobra após aprovação.

- **Owner**: Lucas Cassiano (DDG)
- **Localização**: `/Users/lucascassiano/Antigravity/siteflow`
- **Doc mestre**: `PLANO_SITEFLOW.md`
- **Status**: Fase 0 (validação manual)

## Decisões Commitadas (v1.1)

| Tema | Decisão |
|---|---|
| Foco | SP capital |
| Nichos piloto | Barbearia (R$700) + Salão Beleza/Estética (R$900) |
| Entrega | One-page Next.js + Tailwind v4 + shadcn/ui. Time DDG cria com Claude Opus 4.6/4.7 + brief do Wizard |
| Wizard | HTML standalone premium em `wizard/index.html` — 7 perguntas (nicho, vibe, paleta, fonte, seções, infos, contato) |
| Demos visuais | 3 HTMLs em `demos/barbearia/` (classico, industrial, moderno) — referências linkadas dentro do Wizard |
| WhatsApp | Meta Cloud API oficial (sistema DDG já lida com escala) |
| Pagamento | Asaas PIX/Boleto, cobrança SÓ APÓS APROVAÇÃO do site, antes do go-live no domínio próprio. Vence 24h |
| Ajustes | 3 inclusos + R$50 cada extra |
| Manutenção | NÃO há pacote mensal. Cliente vira lead pra upsell DDG (tráfego, GMB) |
| Domínio | Registro.br no CPF/CNPJ do cliente, 1º ano embutido (R$40 absorvido) |
| Hospedagem | Vercel (1 projeto por cliente, deploy isolado) |
| Raspagem | Google Places API + filtro `website is null`, cron n8n |
| Conversa | Chatwoot account novo + Claude API (agentes Vera + Bruna) |
| Painel | Next.js, auth nominal por papel (admin/criador/financeiro) |
| Tracking | NÃO incluído. GA/Tag Manager vira upsell |

## Arquitetura (8 camadas, v1.1)

1. **Raspagem**: cron n8n → Google Places → filtra `website is null` → `siteflow.leads`
2. **Disparo**: painel libera batch → Meta Cloud API template → Chatwoot
3. **Qualificação IA**: Vera qualifica + apresenta proposta (NÃO cobra ainda)
4. **Wizard**: cliente recebe link único, preenche 7 perguntas, output → Supabase
5. **Criação humana+IA**: time DDG abre Claude Opus + brief Wizard → Vercel preview
6. **Aprovação**: Bruna envia preview → 3 revisões inclusas → cliente aprova
7. **Pagamento**: SÓ AGORA Bruna gera Asaas → cliente paga → status pago
8. **Go-live**: compra domínio Registro.br → DNS → SSL → migra preview pro domínio do cliente

**Premissa central**: cliente só paga se gostar (risco zero). Pagamento é o último passo antes do go-live no domínio dele.

## Schema Supabase (`siteflow`)

Tabelas principais:
- `leads` — empresas raspadas (place_id, nome, telefone, instagram, nicho, status)
- `conversas` — vinculação com Chatwoot, agente atual
- `clientes` — dados contratuais coletados pós "sim"
- `briefings` — info estruturada para gerar o site
- `sites` — preview, prod, vercel project, github repo, status, rounds_ajuste
- `templates` — catálogo (3 por nicho)
- `cobrancas` — Asaas charge, status, vencimento
- `eventos` — auditoria

**Status do lead**: `nao_abordado | abordagem_enviada | sem_resposta | qualificando | interessado | em_briefing | em_construcao | aguardando_aprovacao | aprovado | aguardando_pagto | pago | live | perdido`

## Agentes

### Vera (qualificação)
- Trigger: cliente responde abordagem Meta inicial
- Objetivo: levar até "sim eu quero"
- Tom: amigável, direto, não vendedor agressivo
- Apresenta DDG 1x na primeira resposta
- Trata objeções comuns: preço, "Instagram já basta", "vou pensar"
- Output: cliente movido para `interessado`

### Bruna (briefing)
- Trigger: lead movido para `interessado` (botão mágico)
- Coleta dados contratuais primeiro (CPF/CNPJ, email, endereço)
- Depois briefing: empresa, cores, logo, fotos, textos, serviços, depoimentos, contatos, redes, domínio
- Apresenta 3 layouts → cliente escolhe
- Output: briefing JSON + layout escolhido

## Math do Negócio

- 220 sites/mês (10/dia × 22 dias) × R$800 médio = **R$176k receita/mês**
- Custo variável/site: ~R$42 (domínio + APIs)
- Custos fixos: ~R$240/mês + ~R$4.500 WhatsApp prospecção
- **Margem bruta ~92%**
- Volume diário: 500 disparos WhatsApp pra 10 conversões (assumindo 2% — validar Fase 0)

## Botões Mágicos do Painel

1. `[Iniciar abordagem]` → template Meta aprovado
2. `[Cliente disse SIM]` → coleta dados contratuais
3. `[Briefing completo]` → mostra 3 layouts
4. `[Layout escolhido]` → gera site
5. `[Cliente aprovou]` → cria cobrança Asaas
6. `[Pagamento confirmado]` → compra domínio + DNS + SSL
7. `[Site no ar]` → mensagem boas-vindas

## Roadmap

- **Fase 0**: validação manual (100 leads, 100 disparos, 3-5 sites manuais) — DECISÃO GO/NO-GO
- **Fase 1 MVP**: 5 sites/dia assistido (painel + Meta + n8n + 6 templates + Asaas)
- **Fase 2 Escala**: 10-20 sites/dia automático (Registro.br API, DNS auto, A/B copy)
- **Fase 3 Expansão**: self-service web, mais nichos, RJ/BH, upsell automatizado

## Riscos Críticos

1. **Conversão real WhatsApp B2B** — esperado 0,3-0,8%, otimista 2%. **Validar Fase 0**.
2. **Meta pode reprovar templates de venda fria** — usar 3 variações + tom de "oportunidade local"
3. **Cliente recusa dar CPF/CNPJ** — Plano B: subdomínio `ddgsites.com.br/cliente`
4. **Qualidade IA do site** — templates excelentes + Claude apenas preenche conteúdo, não inventa estrutura

## Stack DDG Reusável

- Supabase, Chatwoot, n8n, Vercel, Claude API, Asaas → tudo já dominado pela DDG
- Sistema interno DDG já lida com Meta Cloud API e escalabilidade
- Padrões de fluxo n8n: usar `bodyParameters` + `$fromAI()` em httpRequestTool, NUNCA `specifyBody: "json"` (vide spv-core)

## Quando ativar esta skill

- Trabalhar em qualquer camada do SiteFlow
- Discutir arquitetura, decisões, modelo de dados
- Implementar painel, agentes, templates
- Configurar n8n workflows do projeto
- Debugar pipeline de geração ou deploy
- Atualizar PLANO_SITEFLOW.md com novas decisões

## Referências externas relacionadas

- `chatwoot-api` skill — padrões Chatwoot DDG
- `spv-core` skill — padrões compartilhados de fluxos n8n DDG (httpRequestTool, $fromAI())
- `n8n-workflow-patterns` skill — patterns gerais n8n
- `nextjs-best-practices` — App Router patterns
- `tailwind-patterns` — Tailwind v4
- `stripe-integration` — referência de checkout (apesar de usar Asaas)

## Gotchas DDG aplicáveis

- Vercel deploy via API: cada cliente = 1 projeto novo (Vercel Pro permite centenas de projetos)
- Registro.br DNS: ao ativar Modo Avançado, lock de ~1h impede publicação. Aguardar timer
- Registro A na raiz: campo NOME vazio (Registro.br não aceita `@`)
- CNAME sempre com FQDN (ponto final): `xxx.vercel-dns-017.com.`
- Plano B nameservers Vercel: `ns1.vercel-dns.com` / `ns2.vercel-dns.com`
- Telefones do Meta vêm com `p:` (strip no sync)
- Supabase schema customizado precisa ser exposto: `pgrst.db_schemas`
