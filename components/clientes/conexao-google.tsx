"use client";

import { useState, useTransition } from "react";
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  Loader2,
  ExternalLink,
  Save,
  Power,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { configurarGoogle, testarConexaoGoogle, desconectarGoogle } from "@/lib/actions/conexoes";
import { iniciarOAuthGoogle } from "@/lib/actions/oauth-google";
import type { ClienteCompleto } from "@/lib/actions/clientes";
import { formatRelativeTime } from "@/lib/utils";
import { useOAuthPopup, type OAuthCompleteEvent } from "@/hooks/use-oauth-popup";
import { SelecionarContaGoogleModal } from "@/components/clientes/selecionar-conta-google-modal";
import { createClient } from "@/lib/supabase/client";

interface Props {
  cliente: ClienteCompleto;
  onUpdate: () => void;
}

export function ConexaoGoogle({ cliente, onUpdate }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const [customerId, setCustomerId] = useState(cliente.google_customer_id ?? "");
  const [loginCustomerId, setLoginCustomerId] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const [conversionActionId, setConversionActionId] = useState("");

  const isConnected = cliente.status_google === "conectado";
  const isPending = cliente.status_google === "pendente";
  const hasError = cliente.status_google === "erro";

  const handleSalvar = () => {
    startTransition(async () => {
      const res = await configurarGoogle({
        cliente_id: cliente.id,
        customer_id: customerId,
        login_customer_id: loginCustomerId || null,
        oauth_refresh_token: refreshToken || null,
        conversion_action_id: conversionActionId || null,
      });

      if (!res.ok) {
        toast.error("Erro ao salvar", { description: res.error });
        return;
      }
      toast.success("Configuração salva", {
        description: "Use 'Testar conexão' pra validar.",
      });
      setOpen(false);
      onUpdate();
    });
  };

  const handleTestar = () => {
    startTransition(async () => {
      const res = await testarConexaoGoogle(cliente.id);
      if (!res.ok) {
        toast.error("Falha no teste", { description: res.error });
        return;
      }
      toast.success("Conexão validada!", { description: res.mensagem });
      onUpdate();
    });
  };

  const handleDesconectar = () => {
    if (!confirm(`Desconectar Google Ads de ${cliente.nome}?`)) return;
    startTransition(async () => {
      const res = await desconectarGoogle(cliente.id);
      if (!res.ok) {
        toast.error("Erro", { description: res.error });
        return;
      }
      toast.success("Google Ads desconectado");
      onUpdate();
    });
  };

  // Modal de seleção de conta Google (abre se OAuth retornou múltiplas opções)
  const [showSelecaoGoogle, setShowSelecaoGoogle] = useState(false);

  // OAuth popup handler
  const handleOAuthComplete = async (event: OAuthCompleteEvent) => {
    if (event.provider !== "google") return;
    if (!event.ok) {
      toast.error("Falha ao conectar Google", {
        description: event.error ?? "Erro desconhecido",
      });
      return;
    }
    // Verifica status_google no Supabase pra decidir se abre modal
    const sb = createClient();
    const { data } = await sb
      .schema("trafego_ddg")
      .from("clientes_acessos")
      .select("status_google")
      .eq("cliente_id", cliente.id)
      .single();

    if (data?.status_google === "aguardando_selecao") {
      toast.success("Autorização recebida", {
        description: "Selecione qual conta Google Ads usar.",
      });
      setShowSelecaoGoogle(true);
    } else {
      toast.success("Google Ads conectado!", {
        description: "Conta detectada automaticamente.",
      });
      onUpdate();
    }
  };

  const handleSelecaoGoogleSuccess = () => {
    onUpdate();
  };

  const { abrirPopup } = useOAuthPopup({ onComplete: handleOAuthComplete });

  const handleOAuthConnect = () => {
    startTransition(async () => {
      const res = await iniciarOAuthGoogle(cliente.id, "configuracoes", "popup");
      if (!res.ok || !res.url) {
        toast.error("OAuth indisponível", { description: res.error });
        return;
      }
      const opened = abrirPopup(res.url, "google");
      if (!opened) {
        toast.info("Popup bloqueado", {
          description: "Redirecionando direto pro Google...",
        });
      }
    });
  };

  return (
    <>
      <Card
        className={
          isConnected
            ? "border-emerald-500/40 bg-emerald-500/5"
            : hasError
              ? "border-red-500/40 bg-red-500/5"
              : isPending
                ? "border-amber-500/40 bg-amber-500/5"
                : ""
        }
      >
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="size-12 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
              <GoogleIcon />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-semibold">Google Ads</h3>
                <StatusBadge status={cliente.status_google} />
              </div>
              {cliente.google_customer_id ? (
                <p className="text-xs text-muted-foreground">
                  Customer ID: <code className="font-mono">{formatCustomerId(cliente.google_customer_id)}</code>
                  {cliente.ultima_sync_google && (
                    <> · Última sync {formatRelativeTime(cliente.ultima_sync_google)}</>
                  )}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">Não configurado ainda</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
            {!isConnected && (
              <Button
                variant="ddg"
                size="sm"
                onClick={handleOAuthConnect}
                disabled={pending}
                className="gap-2"
              >
                {pending ? <Loader2 className="size-3.5 animate-spin" /> : <ExternalLink className="size-3.5" />}
                Conectar via Google
              </Button>
            )}
            <Button
              variant={isConnected ? "outline" : "outline"}
              size="sm"
              onClick={() => setOpen(true)}
              className="gap-2"
            >
              {isConnected ? "Editar" : "Configurar manualmente"}
            </Button>
            {(isPending || isConnected) && cliente.google_customer_id && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestar}
                disabled={pending}
                className="gap-2"
              >
                {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Zap className="size-3.5" />}
                Testar conexão
              </Button>
            )}
            {(isConnected || isPending) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDesconectar}
                disabled={pending}
                className="gap-2 text-destructive"
              >
                <Power className="size-3.5" />
                Desconectar
              </Button>
            )}
          </div>

          <div className="mt-3 rounded-md bg-muted/40 p-3 space-y-1 text-xs">
            <p className="font-semibold flex items-center gap-1.5">
              <AlertCircle className="size-3.5 text-amber-400" />
              Como configurar
            </p>
            <ol className="text-muted-foreground space-y-0.5 list-decimal list-inside">
              <li>Acesse o <a href="https://ads.google.com" target="_blank" rel="noopener" className="text-[var(--ddg-orange)] hover:underline inline-flex items-center gap-0.5">Google Ads <ExternalLink className="size-2.5" /></a> e copie o Customer ID</li>
              <li>Conta MCC DDG já tem acesso? Use Login Customer ID</li>
              <li>OAuth refresh token será gerado pelo botão de Conectar (Fase 1)</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GoogleIcon />
              Configurar Google Ads — {cliente.nome}
            </DialogTitle>
            <DialogDescription>
              Insira o Customer ID e (opcionalmente) o refresh token do OAuth.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Customer ID *</label>
              <Input
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                placeholder="123-456-7890"
                className="font-mono"
              />
              <p className="text-[10px] text-muted-foreground">
                Aparece no canto superior direito do Google Ads (com ou sem hífens)
              </p>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Login Customer ID (MCC, opcional)</label>
              <Input
                value={loginCustomerId}
                onChange={(e) => setLoginCustomerId(e.target.value)}
                placeholder="987-654-3210"
                className="font-mono"
              />
              <p className="text-[10px] text-muted-foreground">
                Se a conta do cliente está sob a MCC DDG
              </p>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">OAuth Refresh Token</label>
              <Input
                type="password"
                value={refreshToken}
                onChange={(e) => setRefreshToken(e.target.value)}
                placeholder="1//..."
                className="font-mono"
              />
              <p className="text-[10px] text-muted-foreground">
                Será preenchido automaticamente após Conectar via OAuth (Fase 1)
              </p>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Conversion Action ID (opcional)</label>
              <Input
                value={conversionActionId}
                onChange={(e) => setConversionActionId(e.target.value)}
                placeholder="123456789"
                className="font-mono"
              />
              <p className="text-[10px] text-muted-foreground">
                Para Enhanced Conversions for Leads (server-side)
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button variant="ddg" onClick={handleSalvar} disabled={pending} className="gap-2">
              {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de seleção pós-OAuth */}
      <SelecionarContaGoogleModal
        clienteId={cliente.id}
        clienteNome={cliente.nome}
        open={showSelecaoGoogle}
        onOpenChange={setShowSelecaoGoogle}
        onSuccess={handleSelecaoGoogleSuccess}
      />
    </>
  );
}

function formatCustomerId(id: string): string {
  const clean = id.replace(/\D/g, "");
  if (clean.length === 10)
    return `${clean.slice(0, 3)}-${clean.slice(3, 6)}-${clean.slice(6)}`;
  return id;
}

function StatusBadge({ status }: { status: string }) {
  if (status === "conectado")
    return (
      <Badge variant="success" className="gap-1">
        <CheckCircle2 className="size-3" />
        Conectado
      </Badge>
    );
  if (status === "pendente")
    return (
      <Badge variant="warning" className="gap-1">
        <AlertCircle className="size-3" />
        Pendente teste
      </Badge>
    );
  if (status === "erro")
    return (
      <Badge variant="danger" className="gap-1">
        <XCircle className="size-3" />
        Erro
      </Badge>
    );
  return (
    <Badge variant="secondary" className="gap-1">
      <XCircle className="size-3" />
      Não conectado
    </Badge>
  );
}

function GoogleIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09 0-.73.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}
