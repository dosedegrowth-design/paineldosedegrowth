"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Clock,
  RadioTower,
  ArrowUpRight,
  Hash,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/page-header";
import { KPICard } from "@/components/dashboard/kpi-card";
import { useCliente } from "@/components/cliente-provider";
import {
  listarEventosOffline,
  statsEventosOffline,
  type EventoOffline,
  type EventoOfflineStats,
} from "@/lib/actions/dados-campanhas";
import { cn, formatCurrency, formatRelativeTime } from "@/lib/utils";

const STATUS_CONFIG = {
  enviado: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  success: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  falha: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/10" },
  erro: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/10" },
  pendente: { icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10" },
  null: { icon: Clock, color: "text-muted-foreground", bg: "bg-muted/40" },
} as const;

function StatusIcon({ status }: { status: string | null }) {
  const cfg =
    STATUS_CONFIG[(status ?? "null") as keyof typeof STATUS_CONFIG] ??
    STATUS_CONFIG.null;
  const Icon = cfg.icon;
  return <Icon className={cn("size-3", cfg.color)} />;
}

export default function ConversoesOfflinePage() {
  const { cliente } = useCliente();
  const [eventos, setEventos] = useState<EventoOffline[]>([]);
  const [stats, setStats] = useState<EventoOfflineStats | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!cliente.id) return;
    let cancelado = false;
    setCarregando(true);
    (async () => {
      const [evs, st] = await Promise.all([
        listarEventosOffline(cliente.id, 50),
        statsEventosOffline(cliente.id, 30),
      ]);
      if (cancelado) return;
      setEventos(evs);
      setStats(st);
      setCarregando(false);
    })();
    return () => {
      cancelado = true;
    };
  }, [cliente.id]);

  const semEventos = !carregando && eventos.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Server-Side Conversions"
        description={`${cliente.nome} · Eventos do Painel Comercial enviados para Meta/Google · diferencial DDG`}
        actions={
          <Badge variant="ddg" className="gap-1.5">
            <RadioTower className="size-3" />
            {semEventos ? "Aguardando webhook" : "Ativo"}
          </Badge>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          label="Eventos (30d)"
          value={stats?.total ?? 0}
          empty={!stats || stats.total === 0}
          emptyHint="Configure webhook em Configurações"
          highlight
        />
        <KPICard
          label="Recebidos 24h"
          value={stats?.enviados_24h ?? 0}
          empty={!stats || stats.enviados_24h === 0}
          emptyHint="Sem eventos recentes"
        />
        <KPICard
          label="Receita atribuída"
          value={stats?.receita_atribuida ?? 0}
          format="currency"
          empty={!stats || stats.receita_atribuida === 0}
          emptyHint="Depende de webhook"
        />
        <KPICard
          label="Falhas de envio"
          value={stats?.falhas ?? 0}
          metricKey="cpa"
          subtitle={stats?.falhas ? "Verificar logs" : undefined}
        />
      </div>

      {/* Taxa de match */}
      {stats && stats.total > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Taxa de match Meta
                </p>
                <p className="font-bold text-2xl tabular-nums">
                  {stats.taxa_match_meta.toFixed(1)}%
                </p>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.taxa_match_meta}%` }}
                  className="h-full bg-violet-500"
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">
                Eventos com match no Meta CAPI (gclid/fbclid/hash)
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Taxa de match Google
                </p>
                <p className="font-bold text-2xl tabular-nums">
                  {stats.taxa_match_google.toFixed(1)}%
                </p>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.taxa_match_google}%` }}
                  className="h-full bg-blue-500"
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">
                Eventos com match no Google Enhanced Conversions
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Loading */}
      {carregando && (
        <Card>
          <CardContent className="p-12 text-center">
            <Loader2 className="size-6 animate-spin mx-auto text-muted-foreground" />
          </CardContent>
        </Card>
      )}

      {/* Stream de eventos */}
      {!carregando && eventos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Stream de eventos</CardTitle>
            <CardDescription>
              Tempo real · webhook do Painel Comercial {cliente.nome}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {eventos.map((e, idx) => (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.04 }}
                  className="flex items-center gap-4 px-6 py-3 hover:bg-accent/30 transition-colors"
                >
                  <div className="size-9 rounded-lg bg-[var(--ddg-orange)]/10 text-[var(--ddg-orange)] flex items-center justify-center shrink-0">
                    <RadioTower className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <Badge variant="outline" className="text-[10px]">
                        {e.tipo_evento}
                      </Badge>
                      {e.origem_lead_id && (
                        <span className="text-xs font-mono font-medium">
                          {e.origem_lead_id}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(e.ocorrido_em)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                      <span>{e.origem}</span>
                      {e.valor > 0 && (
                        <>
                          <span>·</span>
                          <span className="font-medium text-foreground">
                            {formatCurrency(e.valor)}
                          </span>
                        </>
                      )}
                      {e.match_keys.length > 0 && (
                        <>
                          <span>·</span>
                          <span className="inline-flex items-center gap-1">
                            <Hash className="size-2.5" />
                            {e.match_keys.join(", ")}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div
                      className={cn(
                        "flex items-center gap-1.5 text-xs px-2 py-1 rounded-md bg-blue-500/10"
                      )}
                      title={`Google Ads: ${e.enviado_google_status ?? "pendente"}`}
                    >
                      <StatusIcon status={e.enviado_google_status} />
                      <span className="text-blue-400 font-medium">Google</span>
                    </div>
                    <div
                      className={cn(
                        "flex items-center gap-1.5 text-xs px-2 py-1 rounded-md bg-violet-500/10"
                      )}
                      title={`Meta CAPI: ${e.enviado_meta_status ?? "pendente"}`}
                    >
                      <StatusIcon status={e.enviado_meta_status} />
                      <span className="text-violet-400 font-medium">Meta</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vazio */}
      {semEventos && (
        <Card className="border-[var(--ddg-orange)]/30 ddg-gradient-subtle">
          <CardContent className="p-8 text-center space-y-3">
            <AlertCircle className="size-8 text-[var(--ddg-orange)] mx-auto" />
            <p className="text-base font-medium">
              Nenhum evento recebido ainda
            </p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Quando o Painel Comercial enviar fechamentos via webhook autenticado, eles
              aparecem aqui em tempo real e são enviados pra Meta CAPI + Google
              Enhanced Conversions.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button asChild variant="outline" size="sm" className="gap-2">
                <Link href={`/clientes/${cliente.slug}`}>
                  Configurar webhook
                </Link>
              </Button>
              <Button asChild variant="ddg" size="sm" className="gap-2">
                <Link
                  href="/configuracoes"
                  className="inline-flex items-center gap-2"
                >
                  Documentação
                  <ArrowUpRight className="size-3" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-[var(--ddg-orange)]/30 ddg-gradient-subtle">
        <CardContent className="p-6 flex items-start gap-4">
          <div className="size-12 rounded-lg bg-[var(--ddg-orange)]/20 text-[var(--ddg-orange)] flex items-center justify-center shrink-0">
            <RadioTower className="size-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1">Como funciona</h3>
            <p className="text-sm text-muted-foreground">
              Cada cliente DDG tem um <strong>webhook secret HMAC</strong> em
              <code className="mx-1 px-1 rounded bg-card text-xs">/clientes/{cliente.slug}</code>.
              O Painel Comercial dele envia fechamentos pra esse webhook → nosso
              backend hasheia email/telefone (SHA-256) e dispara pro
              <strong> Meta CAPI</strong> e <strong>Google Enhanced Conversions</strong>.
              O algoritmo aprende com quem <strong>realmente fecha</strong>, não
              quem só clica.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
