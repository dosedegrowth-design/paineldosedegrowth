"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
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
  ArrowRight,
  FileEdit,
  Eye,
  EyeOff,
  Trash2,
  MoreVertical,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { PageHeader } from "@/components/dashboard/page-header";
import { ClienteWizard } from "@/components/clientes/wizard";
import {
  listClientes,
  deleteCliente,
  cancelarRascunhoCliente,
  type ClienteCompleto,
  type StatusConexao,
  type TipoNegocio,
} from "@/lib/actions/clientes";
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
  const [mostrarRascunhos, setMostrarRascunhos] = useState(false);

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

  const handleApagarCliente = async (
    e: React.MouseEvent,
    cliente: ClienteCompleto
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const isRascunho = !cliente.setup_concluido;
    const titulo = isRascunho
      ? `Apagar rascunho "${cliente.nome}"?`
      : `Apagar cliente "${cliente.nome}"?`;
    const aviso = isRascunho
      ? "O rascunho será removido permanentemente."
      : `Isso vai arquivar o cliente (soft delete — pode ser restaurado depois). Todos os dados de campanhas, conexões e histórico ficarão intactos.\n\nDigite "${cliente.nome}" pra confirmar.`;

    if (!isRascunho) {
      const resposta = prompt(titulo + "\n\n" + aviso);
      if (resposta !== cliente.nome) {
        if (resposta !== null) toast.error("Nome não confere — cancelado");
        return;
      }
    } else {
      if (!confirm(titulo + "\n\n" + aviso)) return;
    }

    const fn = isRascunho ? cancelarRascunhoCliente : deleteCliente;
    const res = await fn(cliente.id);
    if (!res.ok) {
      toast.error("Erro ao apagar", { description: res.error });
      return;
    }
    toast.success(isRascunho ? "Rascunho apagado" : "Cliente arquivado");
    loadClientes();
  };

  const clientesFinalizados = clientes.filter((c) => c.setup_concluido);
  const clientesRascunho = clientes.filter((c) => !c.setup_concluido);
  const clientesVisiveis = mostrarRascunhos ? clientes : clientesFinalizados;

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
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <SummaryCounter label="Total ativos" value={clientesFinalizados.length} />
            <SummaryCounter label="Lead/WhatsApp" value={clientesFinalizados.filter((c) => c.tipo_negocio === "lead_whatsapp").length} />
            <SummaryCounter label="E-commerce" value={clientesFinalizados.filter((c) => c.tipo_negocio === "ecommerce").length} />
            <SummaryCounter label="Rascunhos" value={clientesRascunho.length} />
          </div>

          {clientesRascunho.length > 0 && (
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => setMostrarRascunhos((v) => !v)}
                className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {mostrarRascunhos ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                {mostrarRascunhos
                  ? "Ocultar rascunhos"
                  : `Ver rascunhos (${clientesRascunho.length})`}
              </button>
            </div>
          )}
        </>
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
          {clientesVisiveis.length === 0 && (
            <Card className="md:col-span-3">
              <CardContent className="p-12 text-center text-sm text-muted-foreground">
                {clientes.length === 0 ? (
                  <>
                    Nenhum cliente cadastrado ainda.
                    <br />
                    Clique em &ldquo;Novo cliente&rdquo; pra começar.
                  </>
                ) : (
                  <>
                    Nenhum cliente finalizado ainda.
                    <br />
                    {clientesRascunho.length > 0 &&
                      `Você tem ${clientesRascunho.length} rascunho(s) — clique em "Ver rascunhos" pra finalizar.`}
                  </>
                )}
              </CardContent>
            </Card>
          )}
          {clientesVisiveis.map((c, idx) => {
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
                className="relative group"
              >
                {/* Botão Apagar (canto superior direito, aparece no hover) */}
                <button
                  type="button"
                  onClick={(e) => handleApagarCliente(e, c)}
                  className="absolute top-2 right-2 z-10 size-7 rounded-md bg-background/80 backdrop-blur border border-border opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all flex items-center justify-center"
                  title="Apagar cliente"
                  aria-label="Apagar cliente"
                >
                  <Trash2 className="size-3.5" />
                </button>
                <Link href={`/clientes/${c.slug}`}>
                <Card
                  className={cn(
                    "transition-all h-full cursor-pointer hover:scale-[1.01]",
                    c.setup_concluido
                      ? "hover:border-[var(--ddg-orange)]/40"
                      : "border-dashed border-amber-500/30 bg-amber-500/[0.02] hover:border-amber-500/50"
                  )}
                >
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div
                        className="size-12 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: `${c.cor_primaria}20`, color: c.cor_primaria }}
                      >
                        <Building2 className="size-6" />
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <Badge className={cn("gap-1", tipoCfg.color)}>
                          <Icon className="size-3" />
                          {tipoCfg.label}
                        </Badge>
                        {!c.setup_concluido && (
                          <Badge variant="warning" className="gap-1 text-[10px]">
                            <FileEdit className="size-2.5" />
                            Rascunho
                          </Badge>
                        )}
                      </div>
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

                    {conexoesPendentes > 0 ? (
                      <div className="w-full inline-flex items-center justify-center gap-2 text-xs font-medium px-3 py-2 rounded-md border border-border hover:border-[var(--ddg-orange)]/40 transition-colors">
                        <Settings className="size-3.5" />
                        Configurar conexões ({conexoesPendentes})
                        <ArrowRight className="size-3.5" />
                      </div>
                    ) : (
                      <div className="w-full inline-flex items-center justify-center gap-2 text-xs font-medium px-3 py-2 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="size-3.5" />
                        Tudo configurado
                      </div>
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
                </Link>
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
    aguardando_selecao: { variant: "warning" as const, icon: AlertCircle },
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
