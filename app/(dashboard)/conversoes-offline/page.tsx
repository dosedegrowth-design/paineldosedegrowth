"use client";

import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Clock, RadioTower, ArrowUpRight, Hash } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/page-header";
import { KPICard } from "@/components/dashboard/kpi-card";
import { DDGAreaChart } from "@/components/charts/area-chart";
import { cn, formatCurrency, formatRelativeTime } from "@/lib/utils";

interface Evento {
  id: string;
  origem: string;
  lead_id: string;
  tipo: string;
  valor: number;
  ocorrido_em: string;
  google_status: "enviado" | "falha" | "pendente";
  meta_status: "enviado" | "falha" | "pendente";
  match_keys: string[];
}

const EVENTOS: Evento[] = [
  { id: "e1", origem: "Petderma CRM", lead_id: "lead_4821", tipo: "Fechamento", valor: 280, ocorrido_em: new Date(Date.now() - 1000 * 60 * 12).toISOString(), google_status: "enviado", meta_status: "enviado", match_keys: ["gclid", "email"] },
  { id: "e2", origem: "Petderma CRM", lead_id: "lead_4820", tipo: "Fechamento", valor: 450, ocorrido_em: new Date(Date.now() - 1000 * 60 * 38).toISOString(), google_status: "enviado", meta_status: "enviado", match_keys: ["fbclid", "email", "phone"] },
  { id: "e3", origem: "Petderma CRM", lead_id: "lead_4819", tipo: "Lead Qualificado", valor: 0, ocorrido_em: new Date(Date.now() - 1000 * 60 * 65).toISOString(), google_status: "pendente", meta_status: "enviado", match_keys: ["fbclid"] },
  { id: "e4", origem: "Petderma CRM", lead_id: "lead_4818", tipo: "Fechamento", valor: 320, ocorrido_em: new Date(Date.now() - 1000 * 60 * 90).toISOString(), google_status: "enviado", meta_status: "falha", match_keys: ["email"] },
  { id: "e5", origem: "Petderma CRM", lead_id: "lead_4817", tipo: "Fechamento", valor: 180, ocorrido_em: new Date(Date.now() - 1000 * 60 * 145).toISOString(), google_status: "enviado", meta_status: "enviado", match_keys: ["gclid", "fbclid", "email"] },
];

const SERIE_DIAS = Array.from({ length: 14 }).map((_, i) => {
  const data = new Date();
  data.setDate(data.getDate() - (13 - i));
  return {
    data: data.toISOString().split("T")[0],
    enviados_google: 12 + Math.floor(Math.random() * 18),
    enviados_meta: 14 + Math.floor(Math.random() * 22),
    falhas: Math.floor(Math.random() * 3),
  };
});

const STATUS_CONFIG = {
  enviado: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  falha: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/10" },
  pendente: { icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10" },
};

export default function ConversoesOfflinePage() {
  const totalEnviados = EVENTOS.filter((e) => e.google_status === "enviado" || e.meta_status === "enviado").length;
  const taxaMatch = 87; // %
  const totalReceita = EVENTOS.reduce((s, e) => s + e.valor, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Server-Side Conversions"
        description="Eventos do Painel Comercial → Google/Meta · diferencial DDG"
        actions={
          <Badge variant="ddg" className="gap-1.5">
            <RadioTower className="size-3" />
            Ativo
          </Badge>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard label="Eventos enviados (24h)" value={totalEnviados * 8} previousValue={totalEnviados * 7} highlight />
        <KPICard label="Taxa de match" value={taxaMatch} format="percent" decimals={0} previousValue={taxaMatch * 0.92} subtitle="qualidade UTMs" />
        <KPICard label="Receita atribuída" value={totalReceita} format="currency" previousValue={totalReceita * 0.78} />
        <KPICard label="Falhas de envio" value={3} previousValue={8} metricKey="cpa" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Eventos enviados nos últimos 14 dias</CardTitle>
          <CardDescription>Google Ads vs Meta CAPI</CardDescription>
        </CardHeader>
        <CardContent>
          <DDGAreaChart
            data={SERIE_DIAS}
            xKey="data"
            series={[
              { key: "enviados_meta", label: "Meta CAPI", color: "#a855f7" },
              { key: "enviados_google", label: "Google Ads", color: "#3b82f6" },
            ]}
            height={260}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Stream de eventos</CardTitle>
          <CardDescription>
            Tempo real · webhook do Painel Comercial Petderma
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {EVENTOS.map((e, idx) => {
              const G = STATUS_CONFIG[e.google_status];
              const M = STATUS_CONFIG[e.meta_status];
              const GIcon = G.icon;
              const MIcon = M.icon;
              return (
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
                    <div className="flex items-center gap-2 mb-0.5">
                      <Badge variant="outline" className="text-[10px]">
                        {e.tipo}
                      </Badge>
                      <span className="text-xs font-medium font-mono">
                        {e.lead_id}
                      </span>
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
                      <span>·</span>
                      <span className="inline-flex items-center gap-1">
                        <Hash className="size-2.5" />
                        {e.match_keys.join(", ")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div
                      className={cn(
                        "flex items-center gap-1.5 text-xs px-2 py-1 rounded-md",
                        G.bg
                      )}
                      title={`Google Ads: ${e.google_status}`}
                    >
                      <GIcon className={cn("size-3", G.color)} />
                      <span className="text-blue-400 font-medium">Google</span>
                    </div>
                    <div
                      className={cn(
                        "flex items-center gap-1.5 text-xs px-2 py-1 rounded-md",
                        M.bg
                      )}
                      title={`Meta CAPI: ${e.meta_status}`}
                    >
                      <MIcon className={cn("size-3", M.color)} />
                      <span className="text-violet-400 font-medium">Meta</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-[var(--ddg-orange)]/30 ddg-gradient-subtle">
        <CardContent className="p-6 flex items-start gap-4">
          <div className="size-12 rounded-lg bg-[var(--ddg-orange)]/20 text-[var(--ddg-orange)] flex items-center justify-center shrink-0">
            <RadioTower className="size-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1">Como configurar a integração</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Use o SDK <code className="px-1.5 py-0.5 rounded bg-card text-xs">@ddg/trafego-sdk</code> no seu painel comercial para
              enviar fechamentos automaticamente. Diferencial: o algoritmo do Google/Meta otimiza pelos clientes que <span className="font-bold">realmente fecham</span>, não só quem vira lead.
            </p>
            <Button variant="outline" size="sm" className="gap-2">
              Ver documentação
              <ArrowUpRight className="size-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
