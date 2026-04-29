"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { PageHeader } from "@/components/dashboard/page-header";
import { ANOMALIAS, type Anomalia } from "@/lib/mock-data";
import { cn, formatRelativeTime } from "@/lib/utils";
import { toast } from "sonner";

const SEVERIDADE_CONFIG = {
  critica: {
    label: "Crítica",
    badge: "danger" as const,
    border: "border-red-500/40",
    bg: "bg-red-500/5",
  },
  alta: {
    label: "Alta",
    badge: "danger" as const,
    border: "border-red-500/30",
    bg: "bg-red-500/5",
  },
  media: {
    label: "Média",
    badge: "warning" as const,
    border: "border-amber-500/30",
    bg: "bg-amber-500/5",
  },
  baixa: {
    label: "Baixa",
    badge: "info" as const,
    border: "border-blue-500/30",
    bg: "bg-blue-500/5",
  },
};

export default function AlertasPage() {
  const [filter, setFilter] = useState<"all" | "open" | "resolved">("open");
  const [items, setItems] = useState<Anomalia[]>(ANOMALIAS);

  const filtered = items.filter((a) =>
    filter === "all"
      ? true
      : filter === "open"
      ? !a.resolvida
      : a.resolvida
  );

  const counts = {
    critica: items.filter((a) => a.severidade === "critica" && !a.resolvida).length,
    alta: items.filter((a) => a.severidade === "alta" && !a.resolvida).length,
    media: items.filter((a) => a.severidade === "media" && !a.resolvida).length,
    baixa: items.filter((a) => a.severidade === "baixa" && !a.resolvida).length,
  };

  const resolve = (id: string) => {
    setItems((prev) =>
      prev.map((a) => (a.id === id ? { ...a, resolvida: true } : a))
    );
    toast.success("Alerta marcado como resolvido");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alertas & Anomalias"
        description="Detectados automaticamente toda manhã às 7h · narrativa por IA"
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
          {filtered.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="size-12 text-emerald-400 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Nenhum alerta nesta categoria.
                </p>
              </CardContent>
            </Card>
          )}
          {filtered.map((a, idx) => {
            const cfg = SEVERIDADE_CONFIG[a.severidade];
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.04 }}
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
                          {a.campanha && (
                            <Badge variant="outline" className="text-[10px]">
                              {a.campanha}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(a.detectada_em)}
                          </span>
                        </div>
                        <h3 className="font-semibold leading-tight mb-2">
                          {a.descricao}
                        </h3>
                        <div className="flex items-center gap-4 text-xs mb-3">
                          <div>
                            <span className="text-muted-foreground">{a.metrica}: </span>
                            <span className="font-medium tabular-nums">
                              {a.valor_atual.toLocaleString("pt-BR", {
                                maximumFractionDigits: 2,
                              })}
                            </span>
                            <span className="text-muted-foreground">
                              {" "}vs baseline {a.baseline.toLocaleString("pt-BR", {
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                          <span
                            className={cn(
                              "font-bold tabular-nums",
                              a.desvio_percentual > 0 ? "text-red-400" : "text-emerald-400"
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
                      {!a.resolvida && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => resolve(a.id)}
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
