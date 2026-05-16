"use client";

import {
  DollarSign,
  TrendingUp,
  Target,
  ShoppingCart,
  MousePointerClick,
  Sparkles,
  TrendingDown,
  MessageSquare,
  Users,
  Percent,
} from "lucide-react";
import Image from "next/image";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { KPICard } from "@/components/dashboard/kpi-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { PlatformBadge } from "@/components/dashboard/platform-badge";
import { DDGAreaChart } from "@/components/charts/area-chart";
import { DDGBarChart } from "@/components/charts/bar-chart";
import { DDGDonutChart } from "@/components/charts/donut-chart";
import { DDGFunnelChart } from "@/components/charts/funnel-chart";

import { cn, formatCompact, formatCurrency } from "@/lib/utils";
import { useCliente } from "@/components/cliente-provider";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  getKPIsGerais,
  getSerieDiaria,
  getCampanhasAgregadas,
  getTopAds,
  getVendasManuaisAgregadas,
  listarAnomalias,
  type KPIsGerais,
  type SeriePonto,
  type CampanhaAgregada,
  type AdResumo,
  type VendasManuaisAgregado,
  type AnomaliaReal,
} from "@/lib/actions/dados-campanhas";

type FiltroPlataforma = "todas" | "meta" | "google";

export default function DashboardPage() {
  const { cliente } = useCliente();
  const isLeadWpp = cliente.tipo_negocio === "lead_whatsapp";

  // Estado dos dados reais carregados
  const [kpis, setKpis] = useState<KPIsGerais | null>(null);
  const [serie, setSerie] = useState<SeriePonto[]>([]);
  const [campanhasReais, setCampanhasReais] = useState<CampanhaAgregada[]>([]);
  const [topAds, setTopAds] = useState<AdResumo[]>([]);
  const [vendas, setVendas] = useState<VendasManuaisAgregado | null>(null);
  const [anomalias, setAnomalias] = useState<AnomaliaReal[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [plataforma, setPlataforma] = useState<FiltroPlataforma>("todas");

  useEffect(() => {
    if (!cliente.id) return; // aguarda cliente carregar
    let cancelado = false;
    setCarregando(true);
    const plat = plataforma === "todas" ? undefined : plataforma;
    (async () => {
      const [k, s, c, t, v, a] = await Promise.all([
        getKPIsGerais(cliente.id, 30, plat),
        getSerieDiaria(cliente.id, 30, plat),
        getCampanhasAgregadas(cliente.id, 30),
        getTopAds(cliente.id, 30, 5),
        getVendasManuaisAgregadas(cliente.id, 30),
        listarAnomalias(cliente.id, { somenteAbertas: true, limit: 5 }),
      ]);
      if (cancelado) return;
      setKpis(k);
      setSerie(s);
      setCampanhasReais(c);
      setTopAds(t);
      setVendas(v);
      setAnomalias(a);
      setCarregando(false);
    })();
    return () => {
      cancelado = true;
    };
  }, [cliente.id, plataforma]);

  const temDadosReais = !!kpis && kpis.investimento > 0;

  // Status real do sync — usa o timestamp do banco em vez de "tem dado?"
  const sincronizouRecente =
    !!cliente.ultima_sync_meta &&
    Date.now() - new Date(cliente.ultima_sync_meta).getTime() < 24 * 3600 * 1000;
  const conectouAlguma =
    cliente.status_meta === "conectado" || cliente.status_google === "conectado";

  type StatusBadge = "carregando" | "sincronizado" | "sem_entrega" | "aguardando";
  const statusBadge: StatusBadge = carregando
    ? "carregando"
    : temDadosReais
      ? "sincronizado"
      : sincronizouRecente && conectouAlguma
        ? "sem_entrega"
        : "aguardando";

  // KPIs principais (reais ou zerados)
  const totalInvestimento = kpis?.investimento ?? 0;
  const totalCliques = kpis?.cliques ?? 0;
  const totalImpressoes = kpis?.impressoes ?? 0;
  const ctrMedio = kpis?.ctr ?? 0;

  const totalLeads = kpis?.conversoes ?? 0; // para lead_whatsapp = leads
  const cplMedio = kpis?.cpl ?? 0;

  const totalConversoes = kpis?.conversoes ?? 0;
  const totalReceita = kpis?.receita ?? 0;
  const cpaMedio = kpis?.cpa ?? 0;
  const roasMedio = kpis?.roas ?? 0;

  // Vendas manuais reais (banco) — só existem quando o time preenche em /vendas-manuais
  const temVendas = !!vendas && vendas.periodos_registrados > 0;
  const totalLeadsFechados = vendas?.leads_fechados ?? 0;
  const totalFaturamento = vendas?.faturamento ?? 0;
  const taxaFechamento = vendas?.taxa_fechamento ?? 0;
  const cacReal = vendas?.cac_real ?? 0;
  const ticketMedioReal = vendas?.ticket_medio ?? 0;
  const roasReal = vendas?.roas_real ?? 0;

  // Add to cart / checkout só Meta (campos no raw_jsonb que ainda não temos extraindo)
  const totalAtc = 0;
  const totalCheckout = 0;

  const investMeta = kpis?.investimento_meta ?? 0;
  const investGoogle = kpis?.investimento_google ?? 0;
  const platformData = [
    { name: "Meta Ads", value: investMeta, color: "#a855f7" },
    { name: "Google Ads", value: investGoogle, color: "#3b82f6" },
  ].filter((p) => p.value > 0);

  const topCampanhas = useMemo(() => {
    return [...campanhasReais]
      .sort((a, b) =>
        isLeadWpp ? b.conversoes - a.conversoes : b.receita - a.receita
      )
      .slice(0, 5)
      .map((c) => ({
        name:
          c.campanha_nome.length > 22
            ? c.campanha_nome.substring(0, 22) + "..."
            : c.campanha_nome,
        value: isLeadWpp ? c.conversoes : c.receita,
        color: c.plataforma === "google" ? "#3b82f6" : "#a855f7",
      }));
  }, [campanhasReais, isLeadWpp]);

  const funilSteps = isLeadWpp
    ? [
        { label: "Impressões", value: totalImpressoes },
        { label: "Cliques", value: totalCliques, rate: totalCliques / Math.max(1, totalImpressoes) },
        { label: "Leads/Conversas", value: totalLeads, rate: totalLeads / Math.max(1, totalCliques) },
        { label: "Leads Fechados", value: totalLeadsFechados, rate: totalLeadsFechados / Math.max(1, totalLeads) },
      ]
    : [
        { label: "Impressões", value: totalImpressoes },
        { label: "Cliques", value: totalCliques, rate: totalCliques / Math.max(1, totalImpressoes) },
        { label: "Add to Cart", value: totalAtc, rate: totalAtc / Math.max(1, totalCliques) },
        { label: "Iniciou Checkout", value: totalCheckout, rate: totalCheckout / Math.max(1, totalAtc) },
        { label: "Compras", value: totalConversoes, rate: totalConversoes / Math.max(1, totalCheckout) },
      ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Visão Geral"
        description={`${cliente.nome} · ${isLeadWpp ? "Modelo Lead/WhatsApp" : "Modelo E-commerce"} · Últimos 30 dias`}
        actions={
          <div className="flex items-center gap-3">
            {/* Filtro Meta/Google */}
            <div className="inline-flex items-center rounded-md border border-border p-0.5 bg-card">
              {(["todas", "meta", "google"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPlataforma(p)}
                  className={cn(
                    "px-3 h-7 text-xs font-medium rounded transition-colors",
                    plataforma === p
                      ? "bg-[var(--ddg-orange)] text-white"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {p === "todas" ? "Todas" : p === "meta" ? "Meta" : "Google"}
                </button>
              ))}
            </div>
            {/* Status badge — fala a verdade sobre o sync */}
            {statusBadge === "carregando" && (
              <Badge variant="secondary" className="gap-1.5">
                <span className="size-1.5 rounded-full bg-muted-foreground animate-pulse" />
                Carregando...
              </Badge>
            )}
            {statusBadge === "sincronizado" && (
              <Badge variant="success" className="gap-1.5">
                <span className="size-1.5 rounded-full bg-emerald-500 pulse-ring" />
                Sincronizado
              </Badge>
            )}
            {statusBadge === "sem_entrega" && (
              <Badge
                variant="secondary"
                className="gap-1.5"
                title="Sincronizou com sucesso mas as campanhas não tiveram entrega no período (sem investimento). Pode ser conta nova, campanhas pausadas ou só posts boostados."
              >
                <span className="size-1.5 rounded-full bg-sky-500" />
                Sincronizado · sem entrega
              </Badge>
            )}
            {statusBadge === "aguardando" && (
              <Badge variant="warning" className="gap-1.5">
                <span className="size-1.5 rounded-full bg-amber-500" />
                Aguardando sync
              </Badge>
            )}
          </div>
        }
      />

      {isLeadWpp ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPICard label="Investimento" value={totalInvestimento} format="currency" icon={DollarSign} metricKey="investimento" highlight />
            <KPICard label="Leads gerados" value={totalLeads} icon={MessageSquare} metricKey="leads" subtitle="Meta + Google" />
            <KPICard label="Custo por Lead" value={cplMedio} format="currency" icon={Target} metricKey="cpl" decimals={2} />
            <KPICard
              label="Leads fechados"
              value={totalLeadsFechados}
              icon={Users}
              empty={!temVendas}
              emptyHint="Preencher em Vendas Manuais"
              subtitle={temVendas ? `${taxaFechamento.toFixed(1)}% conv.` : undefined}
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPICard
              label="Faturamento real"
              value={totalFaturamento}
              format="currency"
              icon={TrendingUp}
              metricKey="receita"
              empty={!temVendas}
              emptyHint="Preencher em Vendas Manuais"
            />
            <KPICard
              label="CAC real"
              value={cacReal}
              format="currency"
              icon={Target}
              metricKey="cpa"
              decimals={2}
              empty={!temVendas}
              emptyHint="Depende de Vendas Manuais"
            />
            <KPICard
              label="Ticket médio"
              value={ticketMedioReal}
              format="currency"
              decimals={2}
              empty={!temVendas}
              emptyHint="Depende de Vendas Manuais"
            />
            <KPICard
              label="ROAS real"
              value={roasReal}
              decimals={2}
              icon={Percent}
              empty={!temVendas}
              emptyHint="Depende de Vendas Manuais"
              subtitle={temVendas ? "venda manual" : undefined}
            />
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPICard label="Investimento" value={totalInvestimento} format="currency" icon={DollarSign} metricKey="investimento" highlight />
            <KPICard label="Conversões" value={totalConversoes} icon={ShoppingCart} metricKey="conversoes" />
            <KPICard label="Receita" value={totalReceita} format="currency" icon={TrendingUp} metricKey="receita" />
            <KPICard label="ROAS" value={roasMedio} icon={Target} metricKey="roas" decimals={2} subtitle="média ponderada" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPICard label="CPA" value={cpaMedio} format="currency" icon={Target} metricKey="cpa" decimals={2} />
            <KPICard
              label="Add to Cart"
              value={totalAtc}
              icon={ShoppingCart}
              empty={totalAtc === 0}
              emptyHint="Requer Pixel/Tag instalado"
            />
            <KPICard
              label="Iniciaram Checkout"
              value={totalCheckout}
              icon={ShoppingCart}
              empty={totalCheckout === 0}
              emptyHint="Requer Pixel/Tag instalado"
            />
            <KPICard label="CTR" value={ctrMedio} format="percent" icon={MousePointerClick} metricKey="ctr" decimals={2} />
          </div>
        </>
      )}

      {/* CTA Vendas Manuais quando lead_whatsapp sem dados */}
      {isLeadWpp && !temVendas && !carregando && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <TrendingUp className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Faltam dados de vendas reais</p>
                <p className="text-xs text-muted-foreground">
                  Faturamento, CAC, ticket médio e ROAS dependem do time preencher
                  quais leads efetivamente fecharam no WhatsApp.
                </p>
              </div>
            </div>
            <Link
              href="/vendas-manuais"
              className="inline-flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-md bg-[var(--ddg-orange)] text-white hover:brightness-110 transition"
            >
              Preencher vendas
            </Link>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Evolução de performance</CardTitle>
            <CardDescription>
              Últimos 30 dias · {isLeadWpp ? "Investimento vs Leads" : "Receita vs Investimento"}
            </CardDescription>
          </div>
          <Tabs defaultValue="main" className="w-auto">
            <TabsList>
              <TabsTrigger value="main">{isLeadWpp ? "Leads" : "Receita"}</TabsTrigger>
              <TabsTrigger value="cost">{isLeadWpp ? "CPL" : "CPA"}</TabsTrigger>
              <TabsTrigger value="vol">Cliques</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {isLeadWpp ? (
            <DDGAreaChart
              data={serie}
              xKey="data"
              series={[
                { key: "leads", label: "Leads", color: "#F15839" },
                { key: "investimento", label: "Investimento", color: "#E3D4A6", format: "currency" },
              ]}
              height={320}
            />
          ) : (
            <DDGAreaChart
              data={serie}
              xKey="data"
              series={[
                { key: "receita", label: "Receita", color: "#F15839", format: "currency" },
                { key: "investimento", label: "Investimento", color: "#E3D4A6", format: "currency" },
              ]}
              height={320}
            />
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{isLeadWpp ? "Funil de aquisição & fechamento" : "Funil de aquisição e checkout"}</CardTitle>
            <CardDescription>
              {isLeadWpp ? "Da impressão até o lead fechado no WhatsApp" : "Da impressão até a compra"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DDGFunnelChart steps={funilSteps} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Investimento por plataforma</CardTitle>
            <CardDescription>Distribuição do orçamento</CardDescription>
          </CardHeader>
          <CardContent>
            <DDGDonutChart data={platformData} centerLabel="Total" centerValue={formatCurrency(totalInvestimento)} format="currency" />
            <div className="mt-4 space-y-2">
              {platformData.map((p) => (
                <div key={p.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full" style={{ background: p.color }} />
                    <span>{p.name}</span>
                  </div>
                  <span className="tabular-nums font-medium">{formatCurrency(p.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top 5 campanhas por {isLeadWpp ? "leads" : "receita"}</CardTitle>
            <CardDescription>Período: últimos 30 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <DDGBarChart data={topCampanhas} format={isLeadWpp ? "number" : "currency"} height={280} vertical />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="size-4 text-[var(--ddg-orange)]" />
                Insights IA
              </CardTitle>
              <CardDescription>Anomalias detectadas hoje</CardDescription>
            </div>
            <Badge variant="ddg">{anomalias.length}</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {anomalias.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-4 text-center">
                <Sparkles className="size-5 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-xs text-muted-foreground">
                  {carregando ? "Carregando..." : "Nenhuma anomalia aberta. Tudo nos eixos."}
                </p>
              </div>
            ) : (
              anomalias.slice(0, 3).map((a) => (
                <div
                  key={a.id}
                  className="rounded-lg border border-border bg-card/50 p-3 hover:border-[var(--ddg-orange)]/30 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-2">
                    {a.desvio_percentual > 0 ? (
                      <TrendingUp
                        className={`size-4 mt-0.5 shrink-0 ${
                          a.severidade === "critica" || a.severidade === "alta"
                            ? "text-red-400"
                            : "text-amber-400"
                        }`}
                      />
                    ) : (
                      <TrendingDown className="size-4 mt-0.5 shrink-0 text-amber-400" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium leading-tight">{a.descricao}</p>
                      {a.narrativa_ia && (
                        <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">
                          {a.narrativa_ia}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            <Link href="/alertas">
              <Button variant="outline" size="sm" className="w-full">
                Ver todas
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top criativos performando</CardTitle>
          <CardDescription>
            Ranqueado por {isLeadWpp ? "CPL" : "ROAS"} · {cliente.nome} · últimos 30 dias
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {topAds.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-muted-foreground">
              {carregando ? "Carregando criativos..." : "Nenhum anúncio com investimento no período."}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {topAds.map((ad, idx) => (
                <div key={ad.ad_id} className="flex items-center gap-4 px-6 py-3 hover:bg-accent/50 transition-colors">
                  <span className="text-xs font-bold text-muted-foreground w-5 tabular-nums">#{idx + 1}</span>
                  <div className="size-12 rounded-lg overflow-hidden bg-muted shrink-0 relative">
                    {ad.thumbnail_url ? (
                      <Image src={ad.thumbnail_url} alt={ad.ad_nome} fill sizes="48px" className="object-cover" unoptimized />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-[10px]">
                        sem img
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <PlatformBadge platform={ad.plataforma} />
                      <span className="text-xs text-muted-foreground truncate">
                        {ad.headline ?? ad.ad_nome}
                      </span>
                    </div>
                    <p className="text-sm font-medium truncate">{ad.ad_nome}</p>
                  </div>
                  <div className="hidden md:grid grid-cols-4 gap-6 text-right text-xs tabular-nums shrink-0">
                    <div>
                      <p className="text-muted-foreground">Investido</p>
                      <p className="font-medium">{formatCompact(ad.investimento)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{isLeadWpp ? "Leads" : "Conv."}</p>
                      <p className="font-medium">{ad.conversoes}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">CTR</p>
                      <p className="font-medium">{ad.ctr.toFixed(2)}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{isLeadWpp ? "CPL" : "ROAS"}</p>
                      <p className="font-medium text-emerald-400">
                        {isLeadWpp
                          ? ad.cpl > 0 ? formatCurrency(ad.cpl) : "—"
                          : ad.roas > 0 ? `${ad.roas.toFixed(2)}x` : "—"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
