"use client";

import { useMemo } from "react";
import { ShoppingCart, ShoppingBag, RotateCw, TrendingUp } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { PageHeader } from "@/components/dashboard/page-header";
import { KPICard } from "@/components/dashboard/kpi-card";
import { DDGAreaChart } from "@/components/charts/area-chart";
import { DDGFunnelChart } from "@/components/charts/funnel-chart";
import { useCliente } from "@/components/cliente-provider";
import { gerarCarrinhosAbandonados } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

export default function CarrinhoAbandonadoPage() {
  const { cliente } = useCliente();
  const dados = useMemo(() => gerarCarrinhosAbandonados(), []);

  if (cliente.tipo_negocio === "lead_whatsapp") {
    return (
      <div className="space-y-6">
        <PageHeader title="Carrinho Abandonado" />
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Esta página é exclusiva para clientes do modelo{" "}
              <Badge variant="info">E-commerce</Badge>.<br />
              Cliente atual ({cliente.nome}) é <Badge variant="ddg">Lead/WhatsApp</Badge>.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Totais
  const totalCarrinhos = dados.reduce((s, d) => s + d.total_carrinhos, 0);
  const totalCheckout = dados.reduce((s, d) => s + d.total_iniciado_checkout, 0);
  const totalFinalizado = dados.reduce((s, d) => s + d.total_finalizado, 0);
  const valorTotal = dados.reduce((s, d) => s + d.valor_total_carrinhos, 0);
  const valorRecuperado = dados.reduce((s, d) => s + d.valor_recuperado, 0);
  const taxaRecuperacao = (valorRecuperado / Math.max(1, valorTotal)) * 100;
  const taxaConversao = (totalFinalizado / Math.max(1, totalCarrinhos)) * 100;

  const funilSteps = [
    { label: "Carrinhos criados", value: totalCarrinhos },
    { label: "Iniciaram checkout", value: totalCheckout, rate: totalCheckout / Math.max(1, totalCarrinhos) },
    { label: "Finalizaram compra", value: totalFinalizado, rate: totalFinalizado / Math.max(1, totalCheckout) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Carrinho Abandonado"
        description={`${cliente.nome} · Análise de recuperação · Últimos 14 dias`}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard label="Carrinhos abandonados" value={totalCarrinhos - totalFinalizado} icon={ShoppingCart} highlight />
        <KPICard label="Valor abandonado" value={valorTotal - valorRecuperado} format="currency" icon={ShoppingBag} />
        <KPICard label="Recuperado" value={valorRecuperado} format="currency" icon={RotateCw} subtitle={`${taxaRecuperacao.toFixed(1)}%`} />
        <KPICard label="Taxa conv. final" value={taxaConversao} format="percent" decimals={2} icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Evolução de carrinhos vs checkouts</CardTitle>
            <CardDescription>Últimos 14 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <DDGAreaChart
              data={dados}
              xKey="data"
              series={[
                { key: "total_carrinhos", label: "Carrinhos", color: "#F15839" },
                { key: "total_iniciado_checkout", label: "Iniciou Checkout", color: "#E3D4A6" },
                { key: "total_finalizado", label: "Finalizou", color: "#10b981" },
              ]}
              height={300}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Funil de checkout</CardTitle>
            <CardDescription>Conversão até a compra</CardDescription>
          </CardHeader>
          <CardContent>
            <DDGFunnelChart steps={funilSteps} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhe diário</CardTitle>
          <CardDescription>Performance por dia</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left border-b border-border">
                  <th className="px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Data</th>
                  <th className="px-4 py-3 text-right text-xs uppercase tracking-wider text-muted-foreground">Carrinhos</th>
                  <th className="px-4 py-3 text-right text-xs uppercase tracking-wider text-muted-foreground">Checkout</th>
                  <th className="px-4 py-3 text-right text-xs uppercase tracking-wider text-muted-foreground">Finalizou</th>
                  <th className="px-4 py-3 text-right text-xs uppercase tracking-wider text-muted-foreground">Valor abandonado</th>
                  <th className="px-4 py-3 text-right text-xs uppercase tracking-wider text-muted-foreground">Recuperado</th>
                  <th className="px-4 py-3 text-right text-xs uppercase tracking-wider text-muted-foreground">Taxa rec.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[...dados].reverse().map((d) => {
                  const abandonado = d.valor_total_carrinhos - d.valor_recuperado;
                  return (
                    <tr key={d.data} className="hover:bg-accent/30">
                      <td className="px-4 py-3 font-medium">{new Date(d.data).toLocaleDateString("pt-BR")}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{d.total_carrinhos}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{d.total_iniciado_checkout}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-emerald-400">{d.total_finalizado}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(abandonado)}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-emerald-400">{formatCurrency(d.valor_recuperado)}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{d.taxa_recuperacao.toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
