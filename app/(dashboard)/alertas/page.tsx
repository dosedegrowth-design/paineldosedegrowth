"use client";

import { useEffect, useState, useTransition } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  Sparkles,
  Loader2,
  RefreshCw,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { PageHeader } from "@/components/dashboard/page-header";
import { useCliente } from "@/components/cliente-provider";
import {
  listarAnomalias,
  resolverAnomalia,
  dispararDetectAnomalias,
  type AnomaliaReal,
  type AnomaliaSeveridade,
} from "@/lib/actions/dados-campanhas";
import { cn, formatRelativeTime } from "@/lib/utils";
import { toast } from "sonner";

const SEVERIDADE_CONFIG: Record<
  AnomaliaSeveridade,
  { label: string; badge: "danger" | "warning" | "info"; border: string; bg: string }
> = {
  critica: {
    label: "Crítica",
    badge: "danger",
    border: "border-red-500/40",
    bg: "bg-red-500/5",
  },
  alta: {
    label: "Alta",
    badge: "danger",
    border: "border-red-500/30",
    bg: "bg-red-500/5",
  },
  media: {
    label: "Média",
    badge: "warning",
    border: "border-amber-500/30",
    bg: "bg-amber-500/5",
  },
  baixa: {
    label: "Baixa",
    badge: "info",
    border: "border-blue-500/30",
    bg: "bg-blue-500/5",
  },
};

export default function AlertasPage() {
  const { cliente } = useCliente();
  const [filter, setFilter] = useState<"open" | "resolved" | "all">("open");
  const [items, setItems] = useState<AnomaliaReal[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [rodando, startRodar] = useTransition();

  const carregar = async () => {
    if (!cliente.id) return;
    setCarregando(true);
    const data = await listarAnomalias(cliente.id, {
      somenteAbertas: filter === "open",
      limit: 200,
    });
    const finalData =
      filter === "resolved" ? data.filter((a) => a.resolvida_em) : data;
    setItems(finalData);
    setCarregando(false);
  };

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cliente.id, filter]);

  const counts = {
    critica: items.filter((a) => a.severidade === "critica" && !a.resolvida_em).length,
    alta: items.filter((a) => a.severidade === "alta" && !a.resolvida_em).length,
    media: items.filter((a) => a.severidade === "media" && !a.resolvida_em).length,
    baixa: items.filter((a) => a.severidade === "baixa" && !a.resolvida_em).length,
  };

  const resolver = async (id: string) => {
    const res = await resolverAnomalia(id);
    if (!res.ok) {
      toast.error("Erro", { description: res.error });
      return;
    }
    toast.success("Alerta marcado como resolvido");
    await carregar();
  };

  const rodarAnalise = () => {
    startRodar(async () => {
      toast.info("Analisando...", { id: "anom" });
      const res = await dispararDetectAnomalias(cliente.id);
      if (!res.ok) {
        toast.error("Erro na análise", { id: "anom", description: res.error });
        return;
      }
      toast.success(`Análise concluída — ${res.total_anomalias ?? 0} anomalias`, {
        id: "anom",
      });
      await carregar();
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alertas & Anomalias"
        description={`${cliente.nome} · Comparação automática do último dia vs média 7d`}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={rodarAnalise}
            disabled={rodando}
            className="gap-2"
          >
            {rodando ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            Rodar análise
          </Button>
        }
      />

      {/* Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(["critica", "alta", "media", "baixa"] as const).map((sev) => {
          const cfg = SEVERIDADE_CONFIG[sev];
          return (
            <Card key={sev} className={cn(cfg.border, "border")}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    {cfg.label}
                  </p>
                  <p className="text-2xl font-bold mt-0.5 tabular-nums">
                    {counts[sev]}
                  </p>
                </div>
                <AlertTriangle
                  className={cn(
                    "size-6",
                    sev === "critica" || sev === "alta"
                      ? "text-red-400"
                      : sev === "media"
                        ? "text-amber-400"
                        : "text-blue-400"
                  )}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <TabsList>
          <TabsTrigger value="open">Em aberto</TabsTrigger>
          <TabsTrigger value="resolved">Resolvidos</TabsTrigger>
          <TabsTrigger value="all">Todos</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="space-y-3">
          {carregando && (
            <Card>
              <CardContent className="py-12 text-center">
                <Loader2 className="size-6 animate-spin mx-auto text-muted-foreground" />
              </CardContent>
            </Card>
          )}

          {!carregando && items.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center space-y-3">
                <CheckCircle2 className="size-12 text-emerald-400 mx-auto" />
                <p className="text-sm text-muted-foreground">
                  {filter === "open"
                    ? "Nenhum alerta aberto. Tudo dentro do esperado."
                    : filter === "resolved"
                      ? "Nenhum alerta resolvido ainda."
                      : "Nenhum alerta registrado."}
                </p>
                {filter === "open" && (
                  <p className="text-xs text-muted-foreground">
                    Clique em &ldquo;Rodar análise&rdquo; pra forçar nova verificação.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {!carregando &&
            items.map((a, idx) => {
              const cfg = SEVERIDADE_CONFIG[a.severidade];
              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: idx * 0.03 }}
                >
                  <Card className={cn(cfg.border, cfg.bg, "border")}>
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div
                          className={cn(
                            "size-10 rounded-lg flex items-center justify-center shrink-0",
                            a.desvio_percentual > 0
                              ? a.severidade === "baixa"
                                ? "bg-emerald-500/15 text-emerald-400"
                                : "bg-red-500/15 text-red-400"
                              : "bg-amber-500/15 text-amber-400"
                          )}
                        >
                          {a.desvio_percentual > 0 ? (
                            <TrendingUp className="size-5" />
                          ) : (
                            <TrendingDown className="size-5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <Badge variant={cfg.badge}>{cfg.label}</Badge>
                            {a.entidade_nome && (
                              <Badge variant="outline" className="text-[10px]">
                                {a.entidade_nome}
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {formatRelativeTime(a.detectada_em)}
                            </span>
                            {a.resolvida_em && (
                              <Badge variant="success" className="text-[10px]">
                                Resolvido
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-semibold leading-tight mb-2">
                            {a.descricao}
                          </h3>
                          <div className="flex items-center gap-4 text-xs mb-3">
                            <div>
                              <span className="text-muted-foreground">
                                {a.metrica}:{" "}
                              </span>
                              <span className="font-medium tabular-nums">
                                {a.valor_atual.toLocaleString("pt-BR", {
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                              {a.baseline_7d !== null && (
                                <span className="text-muted-foreground">
                                  {" "}vs baseline{" "}
                                  {a.baseline_7d.toLocaleString("pt-BR", {
                                    maximumFractionDigits: 2,
                                  })}
                                </span>
                              )}
                            </div>
                            <span
                              className={cn(
                                "font-bold tabular-nums",
                                a.desvio_percentual > 0
                                  ? "text-red-400"
                                  : "text-emerald-400"
                              )}
                            >
                              {a.desvio_percentual > 0 ? "+" : ""}
                              {a.desvio_percentual.toFixed(1)}%
                            </span>
                          </div>
                          <div className="rounded-md bg-card/50 border border-border p-3">
                            <div className="flex items-start gap-2">
                              <Sparkles className="size-3.5 text-[var(--ddg-orange)] mt-0.5 shrink-0" />
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {a.narrativa_ia}
                              </p>
                            </div>
                          </div>
                        </div>
                        {!a.resolvida_em && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => resolver(a.id)}
                            className="shrink-0"
                          >
                            <CheckCircle2 className="size-4" />
                            Resolver
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
        </TabsContent>
      </Tabs>
    </div>
  );
}
