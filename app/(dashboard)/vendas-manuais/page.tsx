"use client";

import { useEffect, useState, useTransition } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Plus,
  TrendingUp,
  Users,
  Calendar,
  RadioTower,
  Sparkles,
  Save,
  Loader2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import { PageHeader } from "@/components/dashboard/page-header";
import { KPICard } from "@/components/dashboard/kpi-card";
import { useCliente } from "@/components/cliente-provider";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  listarVendasManuais,
  criarVendaManual,
  deletarVendaManual,
  type VendaManual,
} from "@/lib/actions/vendas-manuais";

export default function VendasManuaisPage() {
  const { cliente } = useCliente();
  const [vendas, setVendas] = useState<VendaManual[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [salvando, startSalvar] = useTransition();

  // Form state
  const [periodoInicio, setPeriodoInicio] = useState("");
  const [periodoFim, setPeriodoFim] = useState("");
  const [leadsRecebidos, setLeadsRecebidos] = useState("");
  const [investimento, setInvestimento] = useState("");
  const [leadsFechados, setLeadsFechados] = useState("");
  const [faturamento, setFaturamento] = useState("");
  const [percMeta, setPercMeta] = useState("");
  const [percGoogle, setPercGoogle] = useState("");
  const [observacoes, setObservacoes] = useState("");

  // Carrega do banco
  useEffect(() => {
    if (!cliente.id) return;
    let cancelado = false;
    setCarregando(true);
    listarVendasManuais(cliente.id).then((data) => {
      if (cancelado) return;
      setVendas(data);
      setCarregando(false);
    });
    return () => {
      cancelado = true;
    };
  }, [cliente.id]);

  const carregar = async () => {
    const data = await listarVendasManuais(cliente.id);
    setVendas(data);
  };

  if (cliente.tipo_negocio === "ecommerce") {
    return (
      <div className="space-y-6">
        <PageHeader title="Vendas Manuais" />
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Esta página é exclusiva para clientes do modelo{" "}
              <Badge variant="ddg">Lead/WhatsApp</Badge>.<br />
              Cliente atual ({cliente.nome}) é <Badge variant="info">E-commerce</Badge>.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startSalvar(async () => {
      const res = await criarVendaManual({
        cliente_id: cliente.id,
        periodo_inicio: periodoInicio,
        periodo_fim: periodoFim,
        total_leads_recebidos: parseInt(leadsRecebidos) || 0,
        total_investimento: parseFloat(investimento) || 0,
        leads_fechados: parseInt(leadsFechados) || 0,
        faturamento: parseFloat(faturamento) || 0,
        perc_origem_meta: percMeta ? parseFloat(percMeta) : null,
        perc_origem_google: percGoogle ? parseFloat(percGoogle) : null,
        observacoes: observacoes || null,
      });

      if (!res.ok) {
        toast.error("Erro ao salvar", { description: res.error });
        return;
      }

      toast.success("Venda manual registrada", {
        description: "Dashboard atualizado. Server-side conversions serão enviados em breve.",
      });
      await carregar();
      setShowForm(false);
      // Reset
      setPeriodoInicio("");
      setPeriodoFim("");
      setLeadsRecebidos("");
      setInvestimento("");
      setLeadsFechados("");
      setFaturamento("");
      setPercMeta("");
      setPercGoogle("");
      setObservacoes("");
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que quer deletar essa venda manual?")) return;
    const res = await deletarVendaManual(id);
    if (!res.ok) {
      toast.error("Erro ao deletar", { description: res.error });
      return;
    }
    toast.success("Venda removida");
    await carregar();
  };

  // KPIs do total
  const totalLeads = vendas.reduce((s, v) => s + v.total_leads_recebidos, 0);
  const totalFechados = vendas.reduce((s, v) => s + v.leads_fechados, 0);
  const totalFaturamento = vendas.reduce((s, v) => s + v.faturamento, 0);
  const totalInvest = vendas.reduce((s, v) => s + v.total_investimento, 0);
  const taxa = (totalFechados / Math.max(1, totalLeads)) * 100;
  const cac = totalInvest / Math.max(1, totalFechados);
  const ticket = totalFaturamento / Math.max(1, totalFechados);
  const roas = totalFaturamento / Math.max(1, totalInvest);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendas Manuais"
        description={`${cliente.nome} · Time DDG preenche fechamentos do WhatsApp pra alimentar Meta/Google`}
        actions={
          <Button variant="ddg" onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus className="size-4" />
            Nova venda
          </Button>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard label="Leads recebidos" value={totalLeads} icon={MessageSquare} />
        <KPICard label="Fechados" value={totalFechados} icon={Users} subtitle={`${taxa.toFixed(1)}% conv.`} highlight />
        <KPICard label="Faturamento" value={totalFaturamento} format="currency" icon={TrendingUp} />
        <KPICard label="Ticket médio" value={ticket} format="currency" decimals={2} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard label="Investimento total" value={totalInvest} format="currency" />
        <KPICard label="CAC real" value={cac} format="currency" decimals={2} />
        <KPICard label="ROAS real" value={roas} decimals={2} subtitle="venda manual" />
        <KPICard label="Períodos registrados" value={vendas.length} />
      </div>

      {/* Form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          <Card className="border-[var(--ddg-orange)]/40 ddg-gradient-subtle">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="size-4 text-[var(--ddg-orange)]" />
                Registrar nova venda manual
              </CardTitle>
              <CardDescription>
                Preencha os fechamentos da semana. Os dados alimentam o algoritmo
                do Meta e Google via Server-Side Conversions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Início do período</label>
                    <Input type="date" required value={periodoInicio} onChange={(e) => setPeriodoInicio(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Fim do período</label>
                    <Input type="date" required value={periodoFim} onChange={(e) => setPeriodoFim(e.target.value)} />
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground mb-2 uppercase tracking-widest">
                    Dados automáticos (puxados do Meta + Google)
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs">Leads recebidos no período</label>
                      <Input type="number" required value={leadsRecebidos} onChange={(e) => setLeadsRecebidos(e.target.value)} placeholder="245" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs">Investimento total</label>
                      <Input type="number" step="0.01" required value={investimento} onChange={(e) => setInvestimento(e.target.value)} placeholder="12480.50" />
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-[var(--ddg-orange)]/40 bg-[var(--ddg-orange)]/5 p-3">
                  <p className="text-xs text-[var(--ddg-orange)] mb-2 uppercase tracking-widest font-bold">
                    📝 Preenchimento manual
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs">Leads que fecharam</label>
                      <Input type="number" required value={leadsFechados} onChange={(e) => setLeadsFechados(e.target.value)} placeholder="42" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs">Faturamento total (R$)</label>
                      <Input type="number" step="0.01" required value={faturamento} onChange={(e) => setFaturamento(e.target.value)} placeholder="10500.00" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="space-y-1.5">
                      <label className="text-xs">% Origem Meta (opcional)</label>
                      <Input type="number" min="0" max="100" value={percMeta} onChange={(e) => setPercMeta(e.target.value)} placeholder="65" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs">% Origem Google (opcional)</label>
                      <Input type="number" min="0" max="100" value={percGoogle} onChange={(e) => setPercGoogle(e.target.value)} placeholder="35" />
                    </div>
                  </div>

                  <div className="space-y-1.5 mt-3">
                    <label className="text-xs">Observações (opcional)</label>
                    <textarea
                      rows={2}
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                      placeholder="Comportamento da semana, eventos especiais, etc."
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" variant="ddg" disabled={salvando} className="gap-2">
                    {salvando ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Save className="size-4" />
                    )}
                    {salvando ? "Salvando..." : "Salvar venda"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Histórico */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de vendas registradas</CardTitle>
          <CardDescription>
            Cada registro dispara eventos de conversão para Meta CAPI e Google Enhanced Conversions
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {vendas.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Nenhuma venda registrada ainda. Clique em &quot;Nova venda&quot; pra começar.
              </div>
            )}
            {vendas.map((v, idx) => {
              const taxaItem = (v.leads_fechados / Math.max(1, v.total_leads_recebidos)) * 100;
              const cacItem = v.total_investimento / Math.max(1, v.leads_fechados);
              const ticketItem = v.faturamento / Math.max(1, v.leads_fechados);
              return (
                <motion.div
                  key={v.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-5 hover:bg-accent/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="size-3.5 text-muted-foreground" />
                        <span className="font-semibold text-sm">
                          {formatDate(v.periodo_inicio)} → {formatDate(v.periodo_fim)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Registrado {formatDate(v.preenchido_em)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="success" className="gap-1.5">
                        <Save className="size-3" />
                        Salvo
                      </Badge>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-7 text-destructive"
                        onClick={() => handleDelete(v.id)}
                        title="Deletar"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-sm">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Leads</p>
                      <p className="font-medium tabular-nums">{v.total_leads_recebidos}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Fechados</p>
                      <p className="font-medium tabular-nums text-emerald-400">{v.leads_fechados}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Conv.</p>
                      <p className="font-medium tabular-nums">{taxaItem.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Faturamento</p>
                      <p className="font-medium tabular-nums">{formatCurrency(v.faturamento)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">CAC real</p>
                      <p className="font-medium tabular-nums">{formatCurrency(cacItem)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Ticket</p>
                      <p className="font-medium tabular-nums">{formatCurrency(ticketItem)}</p>
                    </div>
                  </div>

                  {(v.perc_origem_meta || v.perc_origem_google) && (
                    <div className="flex gap-3 mt-3 pt-3 border-t border-border">
                      {v.perc_origem_meta !== undefined && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="size-2 rounded-full bg-violet-500" />
                          <span className="text-muted-foreground">Meta:</span>
                          <span className="font-medium">{v.perc_origem_meta}%</span>
                        </div>
                      )}
                      {v.perc_origem_google !== undefined && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="size-2 rounded-full bg-blue-500" />
                          <span className="text-muted-foreground">Google:</span>
                          <span className="font-medium">{v.perc_origem_google}%</span>
                        </div>
                      )}
                    </div>
                  )}

                  {v.observacoes && (
                    <p className="text-xs text-muted-foreground mt-2 italic">
                      &ldquo;{v.observacoes}&rdquo;
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-[var(--ddg-orange)]/30 ddg-gradient-subtle">
        <CardContent className="p-6 flex items-start gap-4">
          <div className="size-12 rounded-lg bg-[var(--ddg-orange)]/20 text-[var(--ddg-orange)] flex items-center justify-center shrink-0">
            <Sparkles className="size-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1">Como funciona o Server-Side Conversions</h3>
            <p className="text-sm text-muted-foreground">
              Cada venda registrada aqui dispara eventos para o <strong>Meta CAPI</strong> e
              <strong> Google Enhanced Conversions for Leads</strong> usando os identificadores
              (gclid/fbclid/email hash) capturados no formulário inicial. O algoritmo do Meta/Google
              aprende a otimizar pelos perfis que <strong>realmente fecham</strong> no WhatsApp,
              não só pelos que clicam.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
