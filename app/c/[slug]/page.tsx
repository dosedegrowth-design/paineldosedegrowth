import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign,
  TrendingUp,
  Target,
  MousePointerClick,
  MessageSquare,
  ShoppingCart,
  Percent,
  Users,
} from "lucide-react";
import { getClienteBySlug } from "@/lib/actions/clientes";
import {
  getKPIsGerais,
  getSerieDiaria,
  getCampanhasAgregadas,
  getVendasManuaisAgregadas,
} from "@/lib/actions/dados-campanhas";
import { formatCompact, formatCurrency, formatPercent } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ClienteFinalPage({ params }: PageProps) {
  const { slug } = await params;
  const cliente = await getClienteBySlug(slug);
  if (!cliente) notFound();

  const isLeadWpp = cliente.tipo_negocio === "lead_whatsapp";
  const cor = cliente.cor_primaria || "#F15839";

  const [kpis, serie, campanhas, vendas] = await Promise.all([
    getKPIsGerais(cliente.id, 30),
    getSerieDiaria(cliente.id, 30),
    getCampanhasAgregadas(cliente.id, 30),
    getVendasManuaisAgregadas(cliente.id, 30),
  ]);

  const ultimosDias = serie.slice(-7);
  const investUltimos7 = ultimosDias.reduce((s, d) => s + d.investimento, 0);
  const convUltimos7 = ultimosDias.reduce((s, d) => s + d.conversoes, 0);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Performance dos seus anúncios</h1>
        <p className="text-sm text-muted-foreground">
          Últimos 30 dias · Atualização automática a cada 6h
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card style={{ borderColor: `${cor}30` }}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Investimento
              </p>
              <div
                className="size-8 rounded-lg flex items-center justify-center"
                style={{ background: `${cor}20`, color: cor }}
              >
                <DollarSign className="size-4" />
              </div>
            </div>
            <p className="text-2xl font-bold tabular-nums">
              {formatCurrency(kpis.investimento)}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">
              Últimos 7 dias: {formatCurrency(investUltimos7)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                {isLeadWpp ? "Leads gerados" : "Conversões"}
              </p>
              <div className="size-8 rounded-lg flex items-center justify-center bg-muted text-muted-foreground">
                {isLeadWpp ? (
                  <MessageSquare className="size-4" />
                ) : (
                  <ShoppingCart className="size-4" />
                )}
              </div>
            </div>
            <p className="text-2xl font-bold tabular-nums">{kpis.conversoes}</p>
            <p className="text-[10px] text-muted-foreground mt-1">
              Últimos 7 dias: {convUltimos7}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                {isLeadWpp ? "Custo por Lead" : "CPA"}
              </p>
              <div className="size-8 rounded-lg flex items-center justify-center bg-muted text-muted-foreground">
                <Target className="size-4" />
              </div>
            </div>
            <p className="text-2xl font-bold tabular-nums">
              {kpis.conversoes > 0 ? formatCurrency(kpis.cpa) : "—"}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">Média 30d</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                {isLeadWpp ? "Leads fechados" : "ROAS"}
              </p>
              <div className="size-8 rounded-lg flex items-center justify-center bg-muted text-muted-foreground">
                {isLeadWpp ? (
                  <Users className="size-4" />
                ) : (
                  <Percent className="size-4" />
                )}
              </div>
            </div>
            {isLeadWpp ? (
              <>
                <p className="text-2xl font-bold tabular-nums">
                  {vendas.leads_fechados > 0 ? vendas.leads_fechados : "—"}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {vendas.taxa_fechamento > 0
                    ? `${vendas.taxa_fechamento.toFixed(1)}% conversão`
                    : "Aguardando registros"}
                </p>
              </>
            ) : (
              <>
                <p className="text-2xl font-bold tabular-nums">
                  {kpis.investimento > 0 ? `${kpis.roas.toFixed(2)}x` : "—"}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">Média ponderada</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Faturamento real (só lead_whatsapp) */}
      {isLeadWpp && vendas.faturamento > 0 && (
        <Card style={{ borderColor: `${cor}30`, background: `${cor}05` }}>
          <CardContent className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                  Faturamento real
                </p>
                <p className="text-2xl font-bold tabular-nums">
                  {formatCurrency(vendas.faturamento)}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  De {vendas.periodos_registrados} períodos registrados
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                  Ticket médio
                </p>
                <p className="text-2xl font-bold tabular-nums">
                  {formatCurrency(vendas.ticket_medio)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                  ROAS real
                </p>
                <p className="text-2xl font-bold tabular-nums" style={{ color: cor }}>
                  {vendas.roas_real.toFixed(2)}x
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  CAC real {formatCurrency(vendas.cac_real)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top campanhas */}
      {campanhas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top campanhas (30 dias)</CardTitle>
            <CardDescription>
              Ranqueado por {isLeadWpp ? "leads" : "investimento"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {campanhas
                .sort((a, b) =>
                  isLeadWpp
                    ? b.conversoes - a.conversoes
                    : b.investimento - a.investimento
                )
                .slice(0, 8)
                .map((c, idx) => (
                  <div
                    key={c.campanha_id}
                    className="px-5 py-3 flex items-center gap-4 hover:bg-accent/30"
                  >
                    <span className="text-xs font-bold text-muted-foreground w-5 tabular-nums">
                      #{idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {c.campanha_nome}
                      </p>
                      <p className="text-[10px] text-muted-foreground capitalize">
                        {c.plataforma} · {c.objetivo ?? "—"}
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-6 text-right text-xs tabular-nums shrink-0">
                      <div>
                        <p className="text-muted-foreground">Investido</p>
                        <p className="font-medium">
                          {formatCompact(c.investimento)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">
                          {isLeadWpp ? "Leads" : "Conv."}
                        </p>
                        <p className="font-medium">{c.conversoes}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">
                          {isLeadWpp ? "CPL" : "ROAS"}
                        </p>
                        <p className="font-medium" style={{ color: cor }}>
                          {isLeadWpp
                            ? c.conversoes > 0
                              ? formatCurrency(c.cpa)
                              : "—"
                            : c.investimento > 0
                              ? `${c.roas.toFixed(2)}x`
                              : "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Funil simplificado */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Funil de aquisição</CardTitle>
          <CardDescription>Da impressão até a conversão</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: "Impressões", value: kpis.impressoes },
            {
              label: "Cliques",
              value: kpis.cliques,
              rate: kpis.impressoes ? (kpis.cliques / kpis.impressoes) * 100 : 0,
            },
            {
              label: isLeadWpp ? "Leads" : "Conversões",
              value: kpis.conversoes,
              rate: kpis.cliques ? (kpis.conversoes / kpis.cliques) * 100 : 0,
            },
          ].map((step, idx) => {
            const max = kpis.impressoes || 1;
            const widthPct = (step.value / max) * 100;
            return (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">{step.label}</span>
                  <div className="flex items-center gap-3 tabular-nums">
                    <span className="text-muted-foreground">
                      {formatCompact(step.value)}
                    </span>
                    {step.rate !== undefined && (
                      <span className="text-[10px] text-muted-foreground">
                        {formatPercent(step.rate, 2)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="relative h-8 rounded-md bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-md"
                    style={{
                      width: `${Math.max(widthPct, 5)}%`,
                      background: cor,
                      opacity: 0.85,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Empty state se nada sincronizou */}
      {kpis.investimento === 0 && (
        <Card>
          <CardContent className="p-10 text-center space-y-2">
            <MousePointerClick className="size-8 text-muted-foreground mx-auto" />
            <p className="text-base font-medium">
              Ainda não temos dados sincronizados
            </p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Assim que as primeiras campanhas começarem a rodar, os números aparecem aqui automaticamente.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
