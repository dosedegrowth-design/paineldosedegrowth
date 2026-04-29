"use client";

import {
  DollarSign,
  TrendingUp,
  Target,
  ShoppingCart,
  MousePointerClick,
  Eye,
  Sparkles,
  TrendingDown,
} from "lucide-react";
import Image from "next/image";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

import { KPICard } from "@/components/dashboard/kpi-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { PlatformBadge } from "@/components/dashboard/platform-badge";
import { DDGAreaChart } from "@/components/charts/area-chart";
import { DDGBarChart } from "@/components/charts/bar-chart";
import { DDGDonutChart } from "@/components/charts/donut-chart";
import { DDGFunnelChart } from "@/components/charts/funnel-chart";

import { CAMPANHAS, gerarSerie30Dias, TOP_ADS, ANOMALIAS } from "@/lib/mock-data";
import { formatCompact, formatCurrency } from "@/lib/utils";

export default function DashboardPage() {
  const serie = gerarSerie30Dias();

  // Totais agregados
  const totalInvestimento = CAMPANHAS.reduce((s, c) => s + c.investimento, 0);
  const totalConversoes = CAMPANHAS.reduce((s, c) => s + c.conversoes, 0);
  const totalReceita = CAMPANHAS.reduce((s, c) => s + c.receita, 0);
  const totalCliques = CAMPANHAS.reduce((s, c) => s + c.cliques, 0);
  const totalImpressoes = CAMPANHAS.reduce((s, c) => s + c.impressoes, 0);
  const cpaMedio = totalInvestimento / totalConversoes;
  const roasMedio = totalReceita / totalInvestimento;
  const ctrMedio = (totalCliques / totalImpressoes) * 100;

  // Por plataforma
  const googleData = CAMPANHAS.filter((c) => c.plataforma === "google");
  const metaData = CAMPANHAS.filter((c) => c.plataforma === "meta");
  const investGoogle = googleData.reduce((s, c) => s + c.investimento, 0);
  const investMeta = metaData.reduce((s, c) => s + c.investimento, 0);

  // Donut: investimento por plataforma
  const platformData = [
    { name: "Meta Ads", value: investMeta, color: "#a855f7" },
    { name: "Google Ads", value: investGoogle, color: "#3b82f6" },
  ];

  // Bar: top 5 campanhas por receita
  const topCampanhas = [...CAMPANHAS]
    .sort((a, b) => b.receita - a.receita)
    .slice(0, 5)
    .map((c) => ({
      name:
        c.campanha_nome.length > 22
          ? c.campanha_nome.substring(0, 22) + "..."
          : c.campanha_nome,
      value: c.receita,
      color: c.plataforma === "google" ? "#3b82f6" : "#a855f7",
    }));

  // Funil
  const funilSteps = [
    { label: "Impressões", value: totalImpressoes },
    {
      label: "Cliques",
      value: totalCliques,
      rate: totalCliques / totalImpressoes,
    },
    {
      label: "Page Views",
      value: Math.round(totalCliques * 0.86),
      rate: 0.86,
    },
    {
      label: "Add to Cart",
      value: Math.round(totalCliques * 0.18),
      rate: 0.21,
    },
    {
      label: "Checkout",
      value: Math.round(totalCliques * 0.07),
      rate: 0.39,
    },
    {
      label: "Conversões",
      value: totalConversoes,
      rate: totalConversoes / Math.round(totalCliques * 0.07),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Visão Geral"
        description="Petderma · Últimos 30 dias"
        actions={
          <>
            <Badge variant="ddg" className="gap-1.5">
              <span className="size-1.5 rounded-full bg-[var(--ddg-orange)] pulse-ring" />
              Sincronizado
            </Badge>
          </>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          label="Investimento"
          value={totalInvestimento}
          previousValue={totalInvestimento * 0.84}
          format="currency"
          icon={DollarSign}
          metricKey="investimento"
          highlight
        />
        <KPICard
          label="Conversões"
          value={totalConversoes}
          previousValue={totalConversoes * 0.76}
          icon={ShoppingCart}
          metricKey="conversoes"
        />
        <KPICard
          label="Receita"
          value={totalReceita}
          previousValue={totalReceita * 0.81}
          format="currency"
          icon={TrendingUp}
          metricKey="receita"
        />
        <KPICard
          label="ROAS"
          value={roasMedio}
          previousValue={roasMedio * 0.92}
          icon={Target}
          metricKey="roas"
          decimals={2}
          subtitle="média ponderada"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          label="CPA"
          value={cpaMedio}
          previousValue={cpaMedio * 1.12}
          format="currency"
          icon={Target}
          metricKey="cpa"
        />
        <KPICard
          label="CTR"
          value={ctrMedio}
          previousValue={ctrMedio * 0.96}
          format="percent"
          icon={MousePointerClick}
          metricKey="ctr"
          decimals={2}
        />
        <KPICard
          label="Cliques"
          value={totalCliques}
          previousValue={totalCliques * 0.88}
          icon={MousePointerClick}
          metricKey="cliques"
        />
        <KPICard
          label="Impressões"
          value={totalImpressoes}
          previousValue={totalImpressoes * 0.91}
          icon={Eye}
          metricKey="impressoes"
        />
      </div>

      {/* Evolução temporal */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Evolução de performance</CardTitle>
            <CardDescription>
              Últimos 30 dias · Receita vs Investimento
            </CardDescription>
          </div>
          <Tabs defaultValue="receita" className="w-auto">
            <TabsList>
              <TabsTrigger value="receita">Receita/Invest.</TabsTrigger>
              <TabsTrigger value="conv">Conversões</TabsTrigger>
              <TabsTrigger value="roas">ROAS</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <DDGAreaChart
            data={serie}
            xKey="data"
            series={[
              {
                key: "receita",
                label: "Receita",
                color: "#F15839",
                format: "currency",
              },
              {
                key: "investimento",
                label: "Investimento",
                color: "#E3D4A6",
                format: "currency",
              },
            ]}
            height={320}
          />
        </CardContent>
      </Card>

      {/* Funil + Plataformas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Funil de aquisição</CardTitle>
            <CardDescription>
              Cross-tracked · da impressão à conversão
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
            <DDGDonutChart
              data={platformData}
              centerLabel="Total"
              centerValue={formatCurrency(totalInvestimento)}
              format="currency"
            />
            <div className="mt-4 space-y-2">
              {platformData.map((p) => (
                <div
                  key={p.name}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="size-2 rounded-full"
                      style={{ background: p.color }}
                    />
                    <span>{p.name}</span>
                  </div>
                  <span className="tabular-nums font-medium">
                    {formatCurrency(p.value)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top campanhas + Top ads + Anomalias */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top 5 campanhas por receita</CardTitle>
            <CardDescription>Período: últimos 30 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <DDGBarChart
              data={topCampanhas}
              format="currency"
              height={280}
              vertical
            />
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
                    <p className="text-xs font-medium leading-tight">
                      {a.descricao}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">
                      {a.narrativa_ia}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full">
              Ver todas as anomalias
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Top Ads */}
      <Card>
        <CardHeader>
          <CardTitle>Top criativos performando</CardTitle>
          <CardDescription>
            Ranqueado por ROAS · Petderma últimos 30 dias
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {TOP_ADS.map((ad, idx) => (
              <div
                key={ad.id}
                className="flex items-center gap-4 px-6 py-3 hover:bg-accent/50 transition-colors"
              >
                <span className="text-xs font-bold text-muted-foreground w-5 tabular-nums">
                  #{idx + 1}
                </span>
                <div className="size-12 rounded-lg overflow-hidden bg-muted shrink-0 relative">
                  <Image
                    src={ad.thumbnail}
                    alt={ad.headline}
                    fill
                    sizes="48px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <PlatformBadge platform={ad.plataforma} />
                    <span className="text-xs text-muted-foreground truncate">
                      {ad.campanha}
                    </span>
                  </div>
                  <p className="text-sm font-medium truncate">{ad.headline}</p>
                </div>
                <div className="hidden md:grid grid-cols-4 gap-6 text-right text-xs tabular-nums shrink-0">
                  <div>
                    <p className="text-muted-foreground">Investido</p>
                    <p className="font-medium">{formatCompact(ad.investimento)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Conv.</p>
                    <p className="font-medium">{ad.conversoes}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">CPA</p>
                    <p className="font-medium">{formatCurrency(ad.cpa)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">ROAS</p>
                    <p className="font-medium text-emerald-400">
                      {ad.roas.toFixed(2)}x
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
