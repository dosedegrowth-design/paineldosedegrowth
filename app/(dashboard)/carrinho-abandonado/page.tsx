"use client";

import { useEffect, useState } from "react";
import {
  ShoppingCart,
  ShoppingBag,
  RotateCw,
  TrendingUp,
  Mail,
  ExternalLink,
  AlertCircle,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { PageHeader } from "@/components/dashboard/page-header";
import { KPICard } from "@/components/dashboard/kpi-card";
import { useCliente } from "@/components/cliente-provider";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import {
  listarCarrinhosAbandonados,
  statsLojaShopify,
  type CarrinhoAbandonadoShopify,
  type StatsLojaShopify,
} from "@/lib/actions/shopify";

export default function CarrinhoAbandonadoPage() {
  const { cliente } = useCliente();
  const [carrinhos, setCarrinhos] = useState<CarrinhoAbandonadoShopify[]>([]);
  const [stats, setStats] = useState<StatsLojaShopify | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState<"abertos" | "todos">("abertos");

  const isEcomOuHibrido =
    cliente.tipo_negocio === "ecommerce" || cliente.tipo_negocio === "hibrido";
  const conectado = cliente.status_shopify === "conectado";

  useEffect(() => {
    if (!cliente.id || !conectado) {
      setCarregando(false);
      return;
    }
    let cancelado = false;
    setCarregando(true);
    (async () => {
      const [c, s] = await Promise.all([
        listarCarrinhosAbandonados(cliente.id, filtro === "abertos", 100),
        statsLojaShopify(cliente.id, 30),
      ]);
      if (cancelado) return;
      setCarrinhos(c);
      setStats(s);
      setCarregando(false);
    })();
    return () => {
      cancelado = true;
    };
  }, [cliente.id, conectado, filtro]);

  // ECOM/Hibrido only
  if (!isEcomOuHibrido) {
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

  // Não conectou Shopify ainda
  if (!conectado) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Carrinho Abandonado"
          description={`${cliente.nome} · Análise de recuperação`}
        />
        <Card className="border-dashed">
          <CardContent className="p-10 text-center space-y-3">
            <ShoppingCart className="size-10 text-muted-foreground mx-auto" />
            <div>
              <p className="text-base font-medium">Conecte a Shopify pra ver carrinhos abandonados</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                Esta página puxa dados direto da loja em tempo real — pedidos, valor abandonado, taxa
                de recuperação e UTMs de origem.
              </p>
            </div>
            <Button variant="ddg" asChild>
              <a href={`/clientes/${cliente.slug}`}>Configurar Shopify</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Carrinho Abandonado"
        description={`${cliente.nome} · Dados Shopify · Últimos 30 dias`}
        actions={
          <div className="inline-flex items-center rounded-md border border-border p-0.5 bg-card">
            {(["abertos", "todos"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className={`px-3 h-7 text-xs font-medium rounded transition-colors ${
                  filtro === f
                    ? "bg-[var(--ddg-orange)] text-white"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f === "abertos" ? "Não recuperados" : "Todos"}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          label="Carrinhos abandonados"
          value={stats?.carrinhos_abandonados ?? 0}
          icon={ShoppingCart}
          highlight
        />
        <KPICard
          label="Valor abandonado"
          value={stats?.valor_carrinhos_abandonados ?? 0}
          format="currency"
          icon={ShoppingBag}
        />
        <KPICard
          label="Taxa de abandono"
          value={stats?.taxa_abandono ?? 0}
          format="percent"
          decimals={1}
          icon={TrendingUp}
        />
        <KPICard
          label="Pedidos pagos no período"
          value={stats?.pedidos_pagos ?? 0}
          icon={RotateCw}
          subtitle={`Ticket médio ${formatCurrency(stats?.ticket_medio ?? 0)}`}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Carrinhos {filtro === "abertos" ? "abandonados" : "todos"}</CardTitle>
          <CardDescription>
            Stream direto da Shopify · ordenado por data
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {carregando ? (
            <div className="p-10 text-center text-sm text-muted-foreground">Carregando...</div>
          ) : carrinhos.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <AlertCircle className="size-8 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">
                Nenhum carrinho {filtro === "abertos" ? "abandonado em aberto" : "no período"}.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {carrinhos.map((c) => (
                <div
                  key={c.id}
                  className="px-5 py-4 hover:bg-accent/30 transition-colors flex items-start gap-4"
                >
                  <div className="size-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                    <ShoppingCart className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="text-sm font-medium truncate">
                        {c.email ?? "Sem email"}
                      </p>
                      {c.recovered && (
                        <Badge variant="success" className="text-[10px]">
                          Recuperado
                        </Badge>
                      )}
                      {c.utm_source && (
                        <Badge variant="outline" className="text-[10px]">
                          {c.utm_source}
                          {c.utm_campaign ? ` · ${c.utm_campaign}` : ""}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span>{c.line_items_count} item{c.line_items_count !== 1 ? "s" : ""}</span>
                      <span>·</span>
                      <span>{formatRelativeTime(c.carrinho_criado_em)}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold tabular-nums">
                      {formatCurrency(c.total_price)}
                    </p>
                    {c.abandoned_checkout_url && (
                      <a
                        href={c.abandoned_checkout_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-emerald-400 hover:underline inline-flex items-center gap-1 mt-1"
                      >
                        Checkout <ExternalLink className="size-2.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardContent className="p-5 flex items-start gap-3">
          <Mail className="size-5 text-muted-foreground shrink-0 mt-0.5" />
          <div className="space-y-1 flex-1">
            <p className="text-sm font-medium">Próximo passo: automação de recuperação</p>
            <p className="text-xs text-muted-foreground">
              Esta lista alimenta a automação de email/WhatsApp pra recuperar pedidos. Integração
              em construção — por enquanto o checkout URL aparece em cada linha pra recuperação
              manual.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
