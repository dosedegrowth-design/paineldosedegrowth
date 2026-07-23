# Feel King — Consolidação nas conta única (Vila Olímpia)

**Decisão:** migrar as 5 unidades pra conta única **Vila Olímpia 769-675-7131** (conta-mãe, maior histórico). Aprovada pelo cliente (Marcelo) em jul/2026. As outras 4 contas ficam pausadas como arquivo (nunca excluir).

## Estado da migração (22/jul/2026)

- [x] Colheita de vencedores nas 5 contas (passe rápido itens 1,2,4,5,6,9) — concluída
- [x] Operação antiga 100% pausada nas 5 contas
- [x] **Fase A** — 12 conversões + 6 metas criadas na VO ✅
- [ ] **Fase B** — vincular 5 fichas GMN na VO (Robert, manual)
- [ ] **Fase C** — GTM triggers+tags em rascunho (extensão) → **publicar versão "Consolidacao Feel King v1" (Robert)**
- [x] **Fase D** — 9 listas de negativas (A-I) criadas na biblioteca da VO (A-G reconstruídas do transcript; nunca existiram como listas compartilhadas)
- [ ] **Fase E** — 11 campanhas PAUSADAS — em andamento:
  - [x] DD - Pesquisa - Convencional 4km - Vila Olimpia V2 · ID 24062859784
  - [x] DD - Pesquisa - Convencional 4km - Jardins · ID 24058251107
  - [x] DD - Pesquisa - Convencional 4km - Itaim V2 · ID 24063865099
  - [ ] Oscar Freire · Moema · Visagismo Rede (extensão criando)
  - [ ] 5× PMax GMN (aguardam fichas vinculadas)

**Decisões de plataforma (Smart Bidding / Maximizar conversões):** ajuste % por dispositivo e por dia/horário NÃO existem nessa estratégia (só -100%). Decisão: sem ajustes — Smart Bidding otimiza sozinho com o sinal das conversões novas. A janela 08:00-21:00 vale. Extensões reduzidas a 2 sitelinks por campanha (polimento pós-ativação); os 5 sitelinks de nível conta seguem elegíveis (não remover).
- [ ] Atualizar cartão da VO (alerta "nova forma de pagamento exigida")
- [ ] Validar conversões no Tag Assistant → ativar Pesquisas
- [ ] Ativar PMax só após dias de dado nas conversões (lição: PMax da VO queimou R$72 sem sinal)
- [ ] Após ~01/08: cobranças finais (~R$6.491) liquidadas nos cartões → aí remover cartões das 4 antigas

## Conversões criadas (Fase A) — AW-622647713

Todas: categoria Contato · contagem Uma · janela 30d · Primária · fonte Site.

| Ação | Label |
|---|---|
| Contato WPP - Vila Olimpia | `mucZCIzJ7NQcEKGz86gC` |
| Ligacao - Vila Olimpia | `DKCjCI_J7NQcEKGz86gC` |
| Contato WPP - Jardins | `9GSICJLJ7NQcEKGz86gC` |
| Ligacao - Jardins | `hzcRCJXJ7NQcEKGz86gC` |
| Contato WPP - Itaim | `WERoCJjJ7NQcEKGz86gC` |
| Ligacao - Itaim | `_UKsCJvJ7NQcEKGz86gC` |
| Contato WPP - Oscar Freire | `3Jo0CLif8dQcEKGz86gC` |
| Ligacao - Oscar Freire | `zxxJCLuf8dQcEKGz86gC` |
| Contato WPP - Moema | `p9TdCL6f8dQcEKGz86gC` |
| Ligacao - Moema | `MBR8CLmg8dQcEKGz86gC` |
| Contato WPP - Visagismo | `-LoICLyg8dQcEKGz86gC` |
| Ligacao - Visagismo | `MiWzCL-g8dQcEKGz86gC` |

Metas personalizadas (par WPP+Ligação da unidade): Conversoes VO · Conversoes Jardins · Conversoes Itaim · Conversoes Oscar Freire · Conversoes Moema · Conversoes Visagismo.

## GTM (container GTM-5HMHHJL) — triggers da Fase C

WhatsApp central das 5 unidades: 551138490563 → separação por Page Path. Ligação por telefone da unidade.

⚠️ Page Path SEM barra inicial (as URLs reais são /unidade-feel-king-<bairro>/ — "contém /moema/" não casaria).

| Trigger | Condição |
|---|---|
| CLK-WPP-VO | Click URL contém 551138490563 E NÃO contém tel: E Page Path contém villa-olimpia |
| CLK-WPP-Jardins | idem, contém jardins |
| CLK-WPP-Itaim | idem, contém itaim-bibi |
| CLK-WPP-OF | idem, contém oscar-freire |
| CLK-WPP-Moema | idem, contém moema |
| CLK-WPP-Visagismo | idem, contém consultoria-visagista |
| CLK-Tel-VO | tel: contém 1138490563 |
| CLK-Tel-Jardins | tel: contém 1130635563 |
| CLK-Tel-Itaim | tel: contém 1131677953 |
| CLK-Tel-OF | tel: contém 1130887022 |
| CLK-Tel-Moema | tel: contém 1150558631 |
| CLK-Tel-Visagismo | tel: e Page Path contém consultoria-visagista |

Tags antigas dos outros AWs: **não tocar** (contas antigas pausadas; limpeza depois da virada).

## Estrutura v3 — 11 campanhas · R$ 550/dia

Padrão: Maximizar conversões · Presença · Search Partners OFF · AI Max OFF · desktop -30% (Jardins -50%) · 8h-21h · listas negativas A-I.

**Por unidade (5×):** DD - Pesquisa - Convencional 4km - [Unidade] R$ 35/dia (AG1 Genérico + AG2 Marca+Bairro, negativa cruzada dos bairros das outras unidades) + DD - PMax - GMN - [Unidade] R$ 30/dia (ficha da unidade).

**Rede (1×):** DD - Pesquisa - Visagismo Premium - Rede R$ 225/dia · /consultoria-visagista/ · geo bairros nobres + Consolação (nº1 em demanda em todas as contas) + Vila Mariana.

Keywords vencedoras (colheita 10/05–22/07): "barba e cabelo masculino" · "visagismo são paulo" · "consultoria visagismo masculino" · "melhor barbearia de sp" · barbearia visagismo (ampla, 114 conv na VO) · "barbearia luxo sp" · [barbearia itaim bibi] · marca+bairro por unidade.

Ajustes por unidade: Moema sábado -30% · OF segunda -30% · VO segunda -20%.

Negativas novas: **H - Fora de área** (zona leste, santo andré, são bernardo, alphaville, guarulhos, osasco, abc, tatuapé, ibirapuera shopping) · **I - Concorrentes/intenção** (corleone, site de barbearia, vaga, franquia barbearia).

## Números de referência (pré-consolidação, 10/05–13/07)

Moema R$9,85 CPA · OF R$11,44 (PMax R$1,88-2,78) · Itaim R$21,69 (faminta) · Jardins R$22,97 (limitada por orçamento, desktop R$44) · VO R$33,27 (tracking removido — cega). GMN R$7,37/contato · Visagismo R$20,14 · Convencional R$20,86. Quota de impressão 10-14% nas 5. Meta da conta única: bater esses números.
