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

## CONFIRMADO NO GTM (06/ago) — nenhuma das 5 tem tag de conversão publicada

| Unidade | Container | Versão publicada | Vazia? | Tag conversão GAds |
|---|---|---|---|---|
| Vila Leopoldina | GTM-NR4K222M | v1 "Empty Container" — 12/05/2025 | **SIM** | só rascunho (v6, 07/07/26) |
| Barueri | GTM-P8X84PGW | v3 "qwe" — 24/11/2025 | não (1 tag WA/N8N) | só rascunho (v6) |
| Butantã | GTM-T3JSV3XB | v3 "qwe" — 24/11/2025 | não (1 tag WA/N8N) | só rascunho (v6) |
| Morumbi | GTM-P9HLDQTF | v4 "qwe" — 24/11/2025 | não (1 tag WA/N8N) | só rascunho (v9 — **5 versões empilhadas**) |
| Osasco | GTM-MK9F2Z7N ("supervisao.com") | v2 — 06/05/2026 | **SIM** | **nunca foi criada** |

**Gargalo estrutural:** `midiagruposuper@gmail.com` (quem montou as tags) tem **Aprovação em todos os 5, nunca Publicação**.
Publicadores: `supervisao.matrizbr@gmail.com` (ativo nos 5) e **`luisbyluis@gmail.com`** (ativo em Barueri/Butantã/Morumbi; em Osasco o convite está **pendente**, nunca aceito).
Outros usuários: raphael.alvares@goidea.com.br (Aprovação), victor@goidea.com.br (Edição).

⚠️ **Containers duplicados** — existe um grupo paralelo "SPV ..." (GTM-NGZ7H6T4 Barueri, GTM-5TDXMVSP Butantã, GTM-PBGTCVCG Leopoldina, GTM-5CM56RTX Morumbi). Se o site carregar o snippet "SPV" em vez do "Unidade", publicar o rascunho não resolve nada.

⚠️ Osasco usa o container **matriz do site inteiro** (supervisao.com) — publicar nele afeta todo o site, não só a unidade.

## ETAPA 2 — o que carrega no site (06/ago)

URLs reais (via `/unidade-sitemap.xml`, 195 unidades):
- Leopoldina `/unidade/super-visao-vila-leopoldina/`
- Barueri `/unidade/super-visao-alphaville-barueri/` ⚠️ **não** é `super-visao-barueri`
- Butantã `/unidade/super-visao-butanta/`
- Morumbi `/unidade/super-visao-morumbi/`
- Osasco — **são DUAS unidades**: `/super-visao-sp-osasco-centro/` e `/super-visao-sp-osasco-autonomistas/`

**Achados:**
1. Os 5 containers de unidade carregam em TODAS as páginas — segmentação é por gatilho (Page Path), não por instalação. Frágil: mudança de slug quebra medição em silêncio.
2. 🔴 **Barueri: o gatilho publicado aponta para `/unidade/super-visao-barueri/`, que dá 404.** A URL real tem "alphaville" no meio. A única tag publicada dela nunca dispara. Butantã e Morumbi têm filtros corretos.
3. 🔴 **34 containers GTM na mesma página** — performance e risco de dupla contagem. Limpeza à parte.
4. Os containers duplicados "SPV ..." **não carregam em lugar nenhum** — órfãos, podem ser arquivados.
5. As AW de unidade que aparecem na página vêm de outro container (tag base/remarketing) — **não significam medição de conversão**. O evento continua não publicado nas 5.
6. 🔴 **Barueri e Osasco não têm AW de unidade na página.** AWs presentes: Leopoldina AW-11167321050 · Butantã AW-11199591511 · Morumbi AW-11199566478. Comuns a todas: AW-857805648, AW-16477318402, AW-10977219450, AW-795781580.

## Por que não gastam — CONFIRMADO: não é orçamento, é Ad Rank

**Butantã** — perde **>90% das impressões por classificação** e só **1,66% por orçamento**. Ou seja, o R$ 40/dia fica intocado porque a campanha não ganha leilão. Ninguém mexeu nos grupos (histórico de 60 dias: zero alterações) — a queda de 75% foi o algoritmo. 10 keywords só (5 frase + 5 exata, nenhuma ampla), grupo "Certicar" com anúncio e **zero keywords**, local em "Presença" (mais restrito). Anúncios todos Qualificados com força Excelente.

**Osasco** — perde **81% por classificação**, 13% por orçamento. E ficou **impedida de veicular até 27/jul** por pendência de identidade do cliente + aceite de T&C (4 registros no histórico, 27/jul 12h23-12h29) — passou 20 dos 30 dias sem poder rodar. 10 keywords todas em ampla, 2 com "raramente exibido (baixo índice de qualidade)", **1 único RSA na conta**, CPC R$ 3,93 (média do grupo R$ 1,27). Meta = padrão da conta (Contatos), diferente da Butantã que usa meta personalizada.

### O ciclo vicioso (a explicação de tudo)
Campanha em Maximizar conversões → meta aponta pra ação que nunca recebe sinal (tag não publicada) → Smart Bidding sem sinal derruba os lances → Ad Rank despenca → perde 80-90% das impressões por classificação → não gasta e não converte → o algoritmo continua sem sinal. **Não gastar e não converter são o mesmo problema.**

Nota: as 41 conversões de Leopoldina vêm de ações nativas do Google (Conversation started 36 + Calls from ads 7), não da tag de WhatsApp do GTM — não contradiz o diagnóstico.

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
