"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Building2,
  ShoppingBag,
  MessageSquare,
  Layers,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Loader2,
  Settings,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { PageHeader } from "@/components/dashboard/page-header";
import { ClienteWizard } from "@/components/clientes/wizard";
import { listClientes, type ClienteCompleto, type StatusConexao, type TipoNegocio } from "@/lib/actions/clientes";
import { cn, formatCurrency, formatRelativeTime } from "@/lib/utils";

const TIPO_LABEL: Record<TipoNegocio, { label: string; icon: typeof Building2; color: string }> = {
  lead_whatsapp: { label: "Lead/WhatsApp", icon: MessageSquare, color: "text-violet-400 bg-violet-500/10 border-violet-500/30" },
  ecommerce: { label: "E-commerce", icon: ShoppingBag, color: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
  hibrido: { label: "Híbrido", icon: Layers, color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
};

export default function ClientesPage() {
  const [clientes, setClientes] = useState<ClienteCompleto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);

  const loadClientes = async () => {
    setLoading(true);
    const data = await listClientes();
    setClientes(data);
    setLoading(false);
  };

  useEffect(() => {
    loadClientes();
  }, []);

  const handleWizardClose = () => {
    setShowWizard(false);
    loadClientes();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        description="Cadastre clientes da DDG e configure conexões Meta + Google + Painel Comercial"
        actions={
          !showWizard && (
            <Button variant="ddg" onClick={() => setShowWizard(true)} className="gap-2">
              <Plus className="size-4" />
              Novo cliente
            </Button>
          )
        }
      />

      <AnimatePresence>
        {showWizard && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <ClienteWizard onClose={handleWizardClose} />
          </motion.div>
        )}
      </AnimatePresence>

      {!showWizard && !loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <SummaryCounter label="Total clientes" value={clientes.length} />
          <SummaryCounter label="Lead/WhatsApp" value={clientes.filter((c) => c.tipo_negocio === "lead_whatsapp").length} />
          <SummaryCounter label="E-commerce" value={clientes.filter((c) => c.tipo_negocio === "ecommerce").length} />
          <SummaryCounter label="Setup completo" value={clientes.filter((c) => c.setup_concluido).length} highlight />
        </div>
      )}

      {loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <Loader2 className="size-6 animate-spin mx-auto text-[var(--ddg-orange)]" />
          </CardContent>
        </Card>
      )}

      {!loading && !showWizard && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clientes.length === 0 && (
            <Card className="md:col-span-3">
              <CardContent className="p-12 text-center text-sm text-muted-foreground">
                Nenhum cliente cadastrado ainda.
                <br />
                Clique em &ldquo;Novo cliente&rdquo; pra começar.
              </CardContent>
            </Card>
          )}
          {clientes.map((c, idx) => {
            const tipoCfg = TIPO_LABEL[c.tipo_negocio];
            const Icon = tipoCfg.icon;
            const conexoesPendentes = [
              c.status_meta !== "conectado",
              c.status_google !== "conectado",
            ].filter(Boolean).length;

            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
              >
                <Card className="hover:border-[var(--ddg-orange)]/40 transition-colors h-full">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div
                        className="size-12 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: `${c.cor_primaria}20`, color: c.cor_primaria }}
                      >
                        <Building2 className="size-6" />
                      </div>
                      <Badge className={cn("gap-1", tipoCfg.color)}>
                        <Icon className="size-3" />
                        {tipoCfg.label}
                      </Badge>
                    </div>

                    <div>
                      <h3 className="font-bold text-lg">{c.nome}</h3>
                      <p className="text-xs text-muted-foreground">/{c.slug}</p>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-border">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        Conexões
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        <ConexaoBadge label="Meta" status={c.status_meta} />
                        <ConexaoBadge label="Google" status={c.status_google} />
                        <ConexaoBadge label="Painel" status={c.status_painel_comercial} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-muted-foreground">CAC máx</p>
                        <p className="font-medium tabular-nums">
                          {c.cac_maximo ? formatCurrency(c.cac_maximo) : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Ticket médio</p>
                        <p className="font-medium tabular-nums">
                          {c.ticket_medio ? formatCurrency(c.ticket_medio) : "—"}
                        </p>
                      </div>
                    </div>

                    {conexoesPendentes > 0 && (
                      <Button variant="outline" size="sm" className="w-full gap-2">
                        <Settings className="size-3.5" />
                        Configurar conexões ({conexoesPendentes})
                      </Button>
                    )}

                    <div className="text-[10px] text-muted-foreground pt-2 border-t border-border flex justify-between">
                      <span>Criado {formatRelativeTime(c.criado_em)}</span>
                      {c.setup_concluido && (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="size-3" />
                          Setup OK
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SummaryCounter({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <Card className={cn(highlight && "border-[var(--ddg-orange)]/30 ddg-gradient-subtle")}>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold tabular-nums mt-0.5">{value}</p>
      </CardContent>
    </Card>
  );
}

function ConexaoBadge({ label, status }: { label: string; status: StatusConexao }) {
  const cfg = {
    conectado: { variant: "success" as const, icon: CheckCircle2 },
    pendente: { variant: "warning" as const, icon: AlertCircle },
    erro: { variant: "danger" as const, icon: XCircle },
    nao_conectado: { variant: "secondary" as const, icon: XCircle },
  }[status];
  const Icon = cfg.icon;
  return (
    <Badge variant={cfg.variant} className="text-[10px] gap-1">
      <Icon className="size-2.5" />
      {label}
    </Badge>
  );
}
