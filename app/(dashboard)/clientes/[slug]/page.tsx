"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Building2,
  ShoppingBag,
  MessageSquare,
  Layers,
  Loader2,
  CheckCircle2,
  AlertCircle,
  XCircle,
  MoreVertical,
  Pencil,
  Trash2,
  Users,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { PageHeader } from "@/components/dashboard/page-header";
import { ConexaoMeta } from "@/components/clientes/conexao-meta";
import { ConexaoGoogle } from "@/components/clientes/conexao-google";
import { ConexaoShopify } from "@/components/clientes/conexao-shopify";
import { ConexaoPainel } from "@/components/clientes/conexao-painel";
import { EditarClienteModal } from "@/components/clientes/editar-cliente-modal";
import { GerenciarUsuariosModal } from "@/components/clientes/gerenciar-usuarios-modal";
import { getClienteBySlug, deleteCliente, type ClienteCompleto, type TipoNegocio } from "@/lib/actions/clientes";
import { cn, formatCurrency, formatRelativeTime } from "@/lib/utils";

const TIPO_LABEL: Record<TipoNegocio, { label: string; icon: typeof Building2; color: string }> = {
  lead_whatsapp: { label: "Lead/WhatsApp", icon: MessageSquare, color: "text-violet-400 bg-violet-500/10 border-violet-500/30" },
  ecommerce: { label: "E-commerce", icon: ShoppingBag, color: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
  hibrido: { label: "Híbrido", icon: Layers, color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ClienteDetalhePage({ params }: PageProps) {
  const { slug } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [cliente, setCliente] = useState<ClienteCompleto | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [usersOpen, setUsersOpen] = useState(false);

  const handleDelete = async () => {
    if (!cliente) return;
    const confirmed = confirm(
      `Tem certeza que quer ARQUIVAR o cliente "${cliente.nome}"?\n\n` +
        `Os dados não serão excluídos, apenas o cliente sai da lista ativa.\n` +
        `Você pode reativar depois pelo Supabase se precisar.`
    );
    if (!confirmed) return;
    const res = await deleteCliente(cliente.id);
    if (!res.ok) {
      toast.error("Erro ao arquivar", { description: res.error });
      return;
    }
    toast.success("Cliente arquivado");
    router.push("/clientes");
  };

  const load = async () => {
    setLoading(true);
    const c = await getClienteBySlug(slug);
    setCliente(c);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [slug]);

  // Feedback de OAuth no retorno
  useEffect(() => {
    const metaOk = searchParams.get("meta_ok");
    const oauthError = searchParams.get("oauth_error");
    if (metaOk === "1") {
      toast.success("Meta Ads conectado!", {
        description: "Token long-lived salvo. Você pode testar a conexão agora.",
      });
      router.replace(`/clientes/${slug}`);
    }
    if (oauthError) {
      toast.error("Falha ao conectar Meta", { description: oauthError });
      router.replace(`/clientes/${slug}`);
    }
  }, [searchParams, router, slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-[var(--ddg-orange)]" />
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="space-y-6">
        <PageHeader title="Cliente não encontrado" />
        <Card>
          <CardContent className="p-12 text-center text-sm text-muted-foreground">
            <p>Não encontramos um cliente com o slug &ldquo;{slug}&rdquo;.</p>
            <Button asChild variant="ddg" className="mt-4">
              <Link href="/clientes">
                <ArrowLeft className="size-4" />
                Voltar para Clientes
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tipoCfg = TIPO_LABEL[cliente.tipo_negocio];
  const TipoIcon = tipoCfg.icon;

  // Progress
  const passos = [
    { label: "Cliente cadastrado", done: true },
    { label: "Meta Ads conectado", done: cliente.status_meta === "conectado" },
    { label: "Google Ads conectado", done: cliente.status_google === "conectado" },
    {
      label: "Painel comercial (webhook)",
      done: cliente.status_painel_comercial === "conectado" || cliente.status_painel_comercial === "pendente",
    },
  ];
  const progressDone = passos.filter((p) => p.done).length;
  const progressPct = (progressDone / passos.length) * 100;

  return (
    <div className="space-y-6">
      {/* Voltar */}
      <Link href="/clientes" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="size-3" />
        Voltar para Clientes
      </Link>

      {/* Header customizado */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-4">
              <div
                className="size-16 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${cliente.cor_primaria}20`, color: cliente.cor_primaria }}
              >
                <Building2 className="size-8" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold">{cliente.nome}</h1>
                  <Badge className={cn("gap-1", tipoCfg.color)}>
                    <TipoIcon className="size-3" />
                    {tipoCfg.label}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  /{cliente.slug} · Criado {formatRelativeTime(cliente.criado_em)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex flex-wrap gap-4 text-sm">
                {cliente.cac_maximo && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">CAC máx</p>
                    <p className="font-semibold tabular-nums">{formatCurrency(cliente.cac_maximo)}</p>
                  </div>
                )}
                {cliente.ticket_medio && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Ticket médio</p>
                    <p className="font-semibold tabular-nums">{formatCurrency(cliente.ticket_medio)}</p>
                  </div>
                )}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreVertical className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem onClick={() => setEditOpen(true)}>
                    <Pencil className="size-3.5" />
                    Editar cliente
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setUsersOpen(true)}>
                    <Users className="size-3.5" />
                    Gerenciar usuários
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                    Arquivar cliente
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Progress de setup */}
          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Progresso de configuração
              </p>
              <span className="text-xs tabular-nums">
                {progressDone}/{passos.length} ({progressPct.toFixed(0)}%)
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden mb-4">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-[var(--ddg-orange)] to-[var(--ddg-gold-light)]"
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {passos.map((p, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex items-center gap-2 text-xs px-3 py-2 rounded-md border",
                    p.done
                      ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400"
                      : "border-border text-muted-foreground"
                  )}
                >
                  {p.done ? (
                    <CheckCircle2 className="size-3.5 shrink-0" />
                  ) : (
                    <XCircle className="size-3.5 shrink-0" />
                  )}
                  <span className="truncate">{p.label}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conexões */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-1">Conexões</h2>
          <p className="text-sm text-muted-foreground">
            Configure as integrações para começar a sincronizar dados e enviar conversões
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ConexaoMeta cliente={cliente} onUpdate={load} />
          <ConexaoGoogle cliente={cliente} onUpdate={load} />
          <ConexaoPainel cliente={cliente} onUpdate={load} />
        </div>

        {/* Shopify só pra ecommerce ou hibrido */}
        {(cliente.tipo_negocio === "ecommerce" ||
          cliente.tipo_negocio === "hibrido") && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ConexaoShopify cliente={cliente} onUpdate={load} />
          </div>
        )}
      </div>

      {/* Configurações específicas por tipo */}
      {cliente.tipo_negocio !== "ecommerce" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="size-4" />
              Configurações Lead/WhatsApp
            </CardTitle>
            <CardDescription>Específicas pro modelo de negócio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <ConfigItem
                label="Frequência vendas manuais"
                value={cliente.frequencia_vendas_manuais ?? "—"}
              />
              <ConfigItem
                label="Painel comercial"
                value={cliente.painel_comercial_tipo ?? "—"}
              />
              <ConfigItem
                label="Setup concluído"
                value={cliente.setup_concluido ? "Sim" : "Não"}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {cliente.tipo_negocio !== "lead_whatsapp" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShoppingBag className="size-4" />
              Configurações E-commerce
            </CardTitle>
            <CardDescription>Específicas pro modelo de negócio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <ConfigItem
                label="Plataforma"
                value={cliente.plataforma_ecom ?? "—"}
              />
              <ConfigItem
                label="Domínio"
                value={cliente.dominio_site ?? "—"}
              />
              <ConfigItem
                label="Setup concluído"
                value={cliente.setup_concluido ? "Sim" : "Não"}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Avisos */}
      {progressPct < 100 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-5 flex items-start gap-3">
            <AlertCircle className="size-5 text-amber-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-sm mb-1">Setup incompleto</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Sem completar todas as conexões, esse cliente vai operar com dados mock.
                Para sincronização real, conecte Meta Ads, Google Ads e configure o
                webhook do Painel Comercial.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modais */}
      <EditarClienteModal
        cliente={cliente}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onUpdated={load}
      />
      <GerenciarUsuariosModal
        cliente={cliente}
        open={usersOpen}
        onClose={() => setUsersOpen(false)}
      />
    </div>
  );
}

function ConfigItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
