# Grupo SUPER (unidades Marcela) — diagnóstico 06/ago/2026

MCC Grupo SUPER **682-303-1080** · login `midiagruposuper@gmail.com` (Marcela Alvares) · senha midiasuper2026
Período analisado: 08/jul a 06/ago/2026 (30 dias). Leitura apenas.

**Gatilho:** Luiz (Lucas Cunhado) relatou "tem unidade que não tá gastando nada" e "tem conta que não contabiliza conversão", pedindo análise e relatório detalhado.

## Quadro geral

| Unidade | ID | Gasto 30d | Saldo | Conversões | Problema |
|---|---|---|---|---|---|
| Vila Leopoldina | 475-998-0447 | R$ 1.498 | **R$ 0,44** 🔴 | 41 (CPA R$ 36,54) | vai parar por saldo |
| Morumbi | 319-985-0748 | R$ 1.626 | R$ 1.337 | **0** | meta aponta p/ ações mortas |
| Barueri | 488-303-4947 | R$ 1.278 | R$ 514 | **0** | metas em 0 de 2 campanhas |
| Butantã | 788-031-3574 | R$ 711 (-60%) | R$ 314 | **0** | Search limitada, sem pagamento desde 15/jun |
| SPV Osasco | 159-174-7788 | R$ 527 | R$ 1.220 | **0** | site sem tag do Google; só ligou fim de jul |

**73% do investimento do grupo (R$ 4.142 de R$ 5.640) não registrou nenhuma conversão.**

## Causa raiz: medição, não mídia

- **"Clique WhatsApp" quebrado nas 4** — Requer atenção (Leopoldina, Barueri, Butantã) ou Inativo (Morumbi). Nunca receberam dado.
- Ações `compra-<unidade>` **Removidas** em Leopoldina, Butantã e Morumbi.
- **Morumbi:** campanhas usam meta personalizada "Conversoes SPV Morumbi" com 1 ação de origem Site — e as únicas ações Site são Clique WhatsApp (Inativo) e compra-morumbi (Removido). A conta registra 449 "other engagements", 86 rotas, 22 calls — nada entra na métrica.
- **Barueri:** metas "Visita à loja" e "Lead telefônico" aplicadas a **0 de 2 campanhas**.
- **Osasco:** as 2 ações (Contato e Contato (1)) estão **Inativas**; campanha marcada "site sem tag do Google".
- **Leopoldina:** PMax com "seu site não tem uma tag do Google"; meta Visualização de página com configuração incorreta.

**Hipótese principal (a confirmar no GTM):** as versões dos containers com as tags de conversão foram criadas mas **nunca publicadas** — o login da Marcela tem permissão de *Aprovação*, não de *Publicação*. Quem publica: `supervisao.matrizbr@gmail.com` ou `luisbyluis@gmail.com`.

Containers: Leopoldina GTM-NR4K222M · Barueri GTM-P8X84PGW · Butantã GTM-T3JSV3XB · Morumbi GTM-P9HLDQTF · Osasco GTM-MK9F2Z7N (container matriz do supervisao.com).

## Por que não gastam

| Unidade | Motivo |
|---|---|
| Butantã | Search "limitada — segmentando menos pesquisas"; grupos Cautelar -76% e Transferência -75%; 1.243 impressões no mês; sem pagamento desde 15/jun |
| Osasco | veiculação zerada até ~28/jul; configuração incorreta (sem tag + keywords insuficientes); CPC R$ 3,93 (o mais caro do grupo) |
| Barueri | Search limitada, ~20% do orçamento ocioso |
| Leopoldina | gastou normal, mas saldo R$ 0,44 — para em horas |

## Falta de padrão entre as contas

- Nomenclatura inconsistente: "SPV Butante", "SPV - OSASCO", "SPV Morumbi - Pesquisa leads - Pmax - 03-04-2026", e legados sem padrão em Morumbi ([Search] Morumbi - AT, [DOMICILIO][MORUMBI], FRANQUEADORA | SEARCH...).
- Orçamentos diferentes: Leopoldina R$ 50/dia (10+40) · Barueri/Butantã/Morumbi R$ 53/dia (13+40) · Osasco R$ 40/dia (1 campanha só, sem PMax).
- Osasco não tem campanha PMax/GMN — as outras 4 têm.
- Osasco não aparece no seletor de contas do MCC (só pela tabela) — verificar vínculo.
- Sitelinks reprovados em Butantã e Morumbi.

## Ações prioritárias

1. 🔴 **Recarregar Vila Leopoldina** (R$ 0,44, única que converte)
2. 🔴 **Publicar os GTMs** das 5 unidades (destrava a medição de todas)
3. 🟡 Morumbi: refazer a meta personalizada apontando pras ações certas
4. 🟡 Barueri: aplicar as metas nas 2 campanhas
5. 🟡 Osasco: instalar tag do Google + ampliar keywords + criar PMax/GMN pra padronizar
6. 🟡 Butantã: destravar a Search (segmentação) + recarga
7. ⚪ Padronizar nomenclatura, orçamentos e estrutura nas 5
