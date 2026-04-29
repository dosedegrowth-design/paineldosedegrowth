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

import {
  getCampanhasPorCliente,
  gerarSerie30Dias,
  TOP_ADS_PETDERMA,
  TOP_ADS_MARINA,
  ANOMALIAS,
  VENDAS_MANUAIS,
} from "@/lib/mock-data";
import { formatCompact, formatCurrency } from "@/lib/utils";
import { useCliente } from "@/components/cliente-provider";
import { useMemo } from "react";

export default function DashboardPage() {
  const { cliente } = useCliente();
  const isLeadWpp = cliente.tipo_negocio === "lead_whatsapp";

  const campanhas = useMemo(() => getCampanhasPorCliente(cliente.slug), [cliente.slug]);
  const serie = useMemo(() => gerarSerie30Dias(cliente.tipo_negocio), [cliente.tipo_negocio]);
  const topAds = isLeadWpp ? TOP_ADS_PETDERMA : TOP_ADS_MARINA;

  const totalInvestimento = campanhas.reduce((s, c) => s + c.investimento, 0);
  const totalCliques = campanhas.reduce((s, c) => s + c.cliques, 0);
  const totalImpressoes = campanhas.reduce((s, c) => s + c.impressoes, 0);
  const ctrMedio = (totalCliques / Math.max(1, totalImpressoes)) * 100;

  const totalLeads = campanhas.reduce((s, c) => s + c.leads, 0);
  const cplMedio = totalInvestimento / Math.max(1, totalLeads);

  const vendasCliente = VENDAS_MANUAIS.filter((v) => v.cliente_id === cliente.slug);
  const totalLeadsFechados = vendasCliente.reduce((s, v) => s + v.leads_fechados, 0);
  const totalFaturamento = vendasCliente.reduce((s, v) => s + v.faturamento, 0);
  const totalLeadsRecebidos = vendasCliente.reduce((s, v) => s + v.total_leads_recebidos, 0);
  const totalInvestVendas = vendasCliente.reduce((s, v) => s + v.total_investimento, 0);
  const taxaFechamento = (totalLeadsFechados / Math.max(1, totalLeadsRecebidos)) * 100;
  const cacReal = totalInvestVendas / Math.max(1, totalLeadsFechados);
  const ticketMedioReal = totalFaturamento / Math.max(1, totalLeadsFechados);
  const roasReal = totalFaturamento / Math.max(1, totalInvestVendas);

  const totalConversoes = campanhas.reduce((s, c) => s + c.conversoes, 0);
  const totalReceita = campanhas.reduce((s, c) => s + c.receita, 0);
  const totalAtc = campanhas.reduce((s, c) => s + (c.add_to_cart ?? 0), 0);
  const totalCheckout = campanhas.reduce((s, c) => s + (c.initiate_checkout ?? 0), 0);
  const cpaMedio = totalInvestimento / Math.max(1, totalConversoes);
  const roasMedio = totalReceita / Math.max(1, totalInvestimento);

  const investGoogle = campanhas.filter((c) => c.plataforma === "google").reduce((s, c) => s + c.investimento, 0);
  const investMeta = campanhas.filter((c) => c.plataforma === "meta").reduce((s, c) => s + c.investimento, 0);
  const platformData = [
    { name: "Meta Ads", value: investMeta, color: "#a855f7" },
    { name: "Google Ads", value: investGoogle, color: "#3b82f6" },
  ];

  const topCampanhas = useMemo(() => {
    return [...campanhas]
      .sort((a, b) => (isLeadWpp ? b.leads - a.leads : b.receita - a.receita))
      .slice(0, 5)
      .map((c) => ({
        name: c.campanha_nome.length > 22 ? c.campanha_nome.substring(0, 22) + "..." : c.campanha_nome,
        value: isLeadWpp ? c.leads : c.receita,
        color: c.plataforma === "google" ? "#3b82f6" : "#a855f7",
      }));
  }, [campanhas, isLeadWpp]);

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
          <Badge variant="ddg" className="gap-1.5">
            <span className="size-1.5 rounded-full bg-[var(--ddg-orange)] pulse-ring" />
            Sincronizado
          </Badge>
        }
      />

      {isLeadWpp ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPICard label="Investimento" value={totalInvestimento} previousValue={totalInvestimento * 0.84} format="currency" icon={DollarSign} metricKey="investimento" highlight />
            <KPICard label="Leads gerados" value={totalLeads} previousValue={totalLeads * 0.78} icon={MessageSquare} metricKey="leads" />
            <KPICard label="Custo por Lead" value={cplMedio} previousValue={cplMedio * 1.15} format="currency" icon={Target} metricKey="cpl" decimals={2} />
            <KPICard label="Leads fechados" value={totalLeadsFechados} previousValue={totalLeadsFechados * 0.82} icon={Users} subtitle={`${taxaFechamento.toFixed(1)}% conv.`} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPICard label="Faturamento real" value={totalFaturamento} previousValue={totalFaturamento * 0.78} format="currency" icon={TrendingUp} metricKey="receita" />
            <KPICard label="CAC real" value={cacReal} previousValue={cacReal * 1.08} format="currency" icon={Target} metricKey="cpa" decimals={2} />
            <KPICard label="Ticket médio" value={ticketMedioReal} previousValue={ticketMedioReal * 0.95} format="currency" decimals={2} />
            <KPICard label="ROAS real" value={roasReal} previousValue={roasReal * 0.92} decimals={2} icon={Percent} subtitle="venda manual" />
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPICard label="Investimento" value={totalInvestimento} previousValue={totalInvestimento * 0.84} format="currency" icon={DollarSign} metricKey="investimento" highlight />
            <KPICard label="Conversões" value={totalConversoes} previousValue={totalConversoes * 0.76} icon={ShoppingCart} metricKey="conversoes" />
            <KPICard label="Receita" value={totalReceita} previousValue={totalReceita * 0.81} format="currency" icon={TrendingUp} metricKey="receita" />
            <KPICard label="ROAS" value={roasMedio} previousValue={roasMedio * 0.92} icon={Target} metricKey="roas" decimals={2} subtitle="média ponderada" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPICard label="CPA" value={cpaMedio} previousValue={cpaMedio * 1.12} format="currency" icon={Target} metricKey="cpa" decimals={2} />
            <KPICard label="Add to Cart" value={totalAtc} previousValue={totalAtc * 0.88} icon={ShoppingCart} />
            <KPICard label="Iniciaram Checkout" value={totalCheckout} previousValue={totalCheckout * 0.89} icon={ShoppingCart} />
            <KPICard label="CTR" value={ctrMedio} previousValue={ctrMedio * 0.96} format="percent" icon={MousePointerClick} metricKey="ctr" decimals={2} />
          </div>
        </>
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
            <Badge variant="ddg">{ANOMALIAS.filter((a) => !a.resolvida).length}</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {ANOMALIAS.slice(0, 3).map((a) => (
              <div key={a.id} className="rounded-lg border border-border bg-card/50 p-3 hover:border-[var(--ddg-orange)]/30 transition-colors cursor-pointer">
                <div className="flex items-start gap-2">
                  {a.desvio_percentual > 0 ? (
                    <TrendingUp className={`size-4 mt-0.5 shrink-0 ${a.severidade === "critica" || a.severidade === "alta" ? "text-red-400" : "text-amber-400"}`} />
                  ) : (
                    <TrendingDown className="size-4 mt-0.5 shrink-0 text-amber-400" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium leading-tight">{a.descricao}</p>
                    <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{a.narrativa_ia}</p>
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full">Ver todas</Button>
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
          <div className="divide-y divide-border">
            {topAds.map((ad, idx) => (
              <div key={ad.id} className="flex items-center gap-4 px-6 py-3 hover:bg-accent/50 transition-colors">
                <span className="text-xs font-bold text-muted-foreground w-5 tabular-nums">#{idx + 1}</span>
                <div className="size-12 rounded-lg overflow-hidden bg-muted shrink-0 relative">
                  <Image src={ad.thumbnail} alt={ad.headline} fill sizes="48px" className="object-cover" unoptimized />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <PlatformBadge platform={ad.plataforma} />
                    <span className="text-xs text-muted-foreground truncate">{ad.campanha}</span>
                  </div>
                  <p className="text-sm font-medium truncate">{ad.headline}</p>
                </div>
                <div className="hidden md:grid grid-cols-4 gap-6 text-right text-xs tabular-nums shrink-0">
                  <div>
                    <p className="text-muted-foreground">Investido</p>
                    <p className="font-medium">{formatCompact(ad.investimento)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{isLeadWpp ? "Leads" : "Conv."}</p>
                    <p className="font-medium">{isLeadWpp ? ad.leads : ad.conversoes}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">CTR</p>
                    <p className="font-medium">{ad.ctr.toFixed(2)}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{isLeadWpp ? "CPL" : "ROAS"}</p>
                    <p className="font-medium text-emerald-400">
                      {isLeadWpp ? formatCurrency(ad.cpl ?? 0) : `${ad.roas?.toFixed(2)}x`}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
