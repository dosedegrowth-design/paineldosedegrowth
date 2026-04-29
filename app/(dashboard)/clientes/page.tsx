"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Building2,
  ShoppingBag,
  MessageSquare,
  Layers,
  CheckCircle2,
  Save,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import { PageHeader } from "@/components/dashboard/page-header";
import { CLIENTES, type TipoNegocio, type Cliente } from "@/lib/mock-data";
import { cn, formatCurrency } from "@/lib/utils";

const TIPOS: {
  value: TipoNegocio;
  label: string;
  icon: typeof Building2;
  desc: string;
  color: string;
}[] = [
  {
    value: "lead_whatsapp",
    label: "Lead/WhatsApp",
    icon: MessageSquare,
    desc: "Campanhas direcionam pra WhatsApp. Foco em CPL, CTWA, vendas manuais.",
    color: "text-violet-400 bg-violet-500/10 border-violet-500/30",
  },
  {
    value: "ecommerce",
    label: "E-commerce",
    icon: ShoppingBag,
    desc: "Venda no checkout. Foco em ROAS, Receita, Carrinho Abandonado.",
    color: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  },
  {
    value: "hibrido",
    label: "Híbrido",
    icon: Layers,
    desc: "Vende via site E via WhatsApp. Ambos os funis no painel.",
    color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  },
];

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>(CLIENTES);
  const [showForm, setShowForm] = useState(false);

  // Form
  const [nome, setNome] = useState("");
  const [slug, setSlug] = useState("");
  const [tipo, setTipo] = useState<TipoNegocio>("lead_whatsapp");
  const [cacMaximo, setCacMaximo] = useState("");
  const [ticketMedio, setTicketMedio] = useState("");
  const [corPrimaria, setCorPrimaria] = useState("#F15839");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const novo: Cliente = {
      id: slug,
      slug,
      nome,
      tipo_negocio: tipo,
      cor_primaria: corPrimaria,
      logo_url: "/brand/logo-icon.svg",
      cac_maximo: parseFloat(cacMaximo) || 0,
      ticket_medio: parseFloat(ticketMedio) || 0,
      ativo: true,
    };
    setClientes([...clientes, novo]);
    toast.success("Cliente criado", {
      description: `${nome} foi cadastrado como ${tipo}.`,
    });
    setShowForm(false);
    setNome("");
    setSlug("");
    setCacMaximo("");
    setTicketMedio("");
  };

  const slugify = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        description="Cadastre os clientes da DDG e configure o tipo de negócio"
        actions={
          <Button variant="ddg" onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus className="size-4" />
            Novo cliente
          </Button>
        }
      />

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-[var(--ddg-orange)]/40 ddg-gradient-subtle">
            <CardHeader>
              <CardTitle>Cadastrar novo cliente</CardTitle>
              <CardDescription>O tipo de negócio define quais painéis serão exibidos</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Nome do cliente</label>
                    <Input
                      required
                      value={nome}
                      onChange={(e) => {
                        setNome(e.target.value);
                        if (!slug) setSlug(slugify(e.target.value));
                      }}
                      placeholder="Marina Saleme"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Slug (URL)</label>
                    <Input required value={slug} onChange={(e) => setSlug(slugify(e.target.value))} placeholder="marina-saleme" />
                  </div>
                </div>

                {/* Tipo de Negócio */}
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground uppercase tracking-widest">
                    Tipo de Negócio (define o painel)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {TIPOS.map((t) => {
                      const Icon = t.icon;
                      const selected = tipo === t.value;
                      return (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => setTipo(t.value)}
                          className={cn(
                            "relative text-left p-4 rounded-lg border transition-all",
                            selected
                              ? `${t.color} ring-2 ring-[var(--ddg-orange)]`
                              : "border-border hover:border-[var(--ddg-orange)]/40 bg-card"
                          )}
                        >
                          {selected && (
                            <CheckCircle2 className="absolute top-2 right-2 size-4 text-[var(--ddg-orange)]" />
                          )}
                          <Icon className="size-6 mb-2" />
                          <p className="font-semibold text-sm">{t.label}</p>
                          <p className="text-xs text-muted-foreground mt-1 leading-snug">{t.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">CAC máximo (R$)</label>
                    <Input type="number" step="0.01" value={cacMaximo} onChange={(e) => setCacMaximo(e.target.value)} placeholder="80" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Ticket médio (R$)</label>
                    <Input type="number" step="0.01" value={ticketMedio} onChange={(e) => setTicketMedio(e.target.value)} placeholder="250" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Cor primária</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={corPrimaria}
                        onChange={(e) => setCorPrimaria(e.target.value)}
                        className="h-9 w-12 rounded-md border border-input cursor-pointer"
                      />
                      <Input value={corPrimaria} onChange={(e) => setCorPrimaria(e.target.value)} className="flex-1" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" variant="ddg" className="gap-2">
                    <Save className="size-4" />
                    Cadastrar cliente
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

      {/* Lista */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clientes.map((c, idx) => {
          const tipoCfg = TIPOS.find((t) => t.value === c.tipo_negocio)!;
          const Icon = tipoCfg.icon;
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="hover:border-[var(--ddg-orange)]/40 transition-colors cursor-pointer h-full">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div
                      className="size-12 rounded-lg flex items-center justify-center"
                      style={{
                        background: `${c.cor_primaria}20`,
                        color: c.cor_primaria,
                      }}
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
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border text-xs">
                    <div>
                      <p className="text-muted-foreground">CAC máx</p>
                      <p className="font-medium tabular-nums">{formatCurrency(c.cac_maximo)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Ticket médio</p>
                      <p className="font-medium tabular-nums">{formatCurrency(c.ticket_medio)}</p>
                    </div>
                  </div>
                  <Badge variant={c.ativo ? "success" : "secondary"} className="text-[10px]">
                    {c.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
