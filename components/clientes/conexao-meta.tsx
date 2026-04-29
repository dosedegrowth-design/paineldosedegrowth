"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, XCircle, Loader2, ExternalLink, Save, Power, Zap } from "lucide-react";
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
import { configurarMeta, testarConexaoMeta, desconectarMeta } from "@/lib/actions/conexoes";
import { iniciarOAuthMeta } from "@/lib/actions/oauth-meta";
import type { ClienteCompleto } from "@/lib/actions/clientes";
import { formatRelativeTime } from "@/lib/utils";

interface Props {
  cliente: ClienteCompleto;
  onUpdate: () => void;
}

export function ConexaoMeta({ cliente, onUpdate }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const [adAccountId, setAdAccountId] = useState(cliente.meta_ad_account_id ?? "");
  const [pixelId, setPixelId] = useState("");
  const [businessId, setBusinessId] = useState("");
  const [token, setToken] = useState("");
  const [conversionActionId, setConversionActionId] = useState("");

  const isConnected = cliente.status_meta === "conectado";
  const isPending = cliente.status_meta === "pendente";
  const hasError = cliente.status_meta === "erro";

  const handleSalvar = () => {
    startTransition(async () => {
      const res = await configurarMeta({
        cliente_id: cliente.id,
        ad_account_id: adAccountId,
        pixel_id: pixelId,
        business_id: businessId || null,
        long_lived_token: token || null,
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
      const res = await testarConexaoMeta(cliente.id);
      if (!res.ok) {
        toast.error("Falha no teste", { description: res.error });
        return;
      }
      toast.success("Conexão validada!", { description: res.mensagem });
      onUpdate();
    });
  };

  const handleDesconectar = () => {
    if (!confirm(`Desconectar Meta Ads de ${cliente.nome}?`)) return;
    startTransition(async () => {
      const res = await desconectarMeta(cliente.id);
      if (!res.ok) {
        toast.error("Erro", { description: res.error });
        return;
      }
      toast.success("Meta Ads desconectado");
      onUpdate();
    });
  };

  const handleOAuthConnect = () => {
    startTransition(async () => {
      const res = await iniciarOAuthMeta(cliente.id);
      if (!res.ok) {
        toast.error("OAuth indisponível", { description: res.error });
        return;
      }
      // Redireciona pro Facebook
      window.location.href = res.url!;
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
            <div className="size-12 rounded-lg bg-violet-500/15 text-violet-400 flex items-center justify-center shrink-0">
              <MetaIcon />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-semibold">Meta Ads</h3>
                <StatusBadge status={cliente.status_meta} />
              </div>
              {cliente.meta_ad_account_id ? (
                <p className="text-xs text-muted-foreground">
                  Ad Account: <code className="font-mono">{cliente.meta_ad_account_id}</code>
                  {cliente.ultima_sync_meta && (
                    <> · Última sync {formatRelativeTime(cliente.ultima_sync_meta)}</>
                  )}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">Não configurado ainda</p>
              )}
            </div>
          </div>

          {/* Ações */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
            {!isConnected && (
              <Button
                variant="ddg"
                size="sm"
                onClick={handleOAuthConnect}
                disabled={pending}
                className="gap-2"
              >
                {pending ? <Loader2 className="size-3.5 animate-spin" /> : <MetaIcon />}
                Conectar via Facebook
              </Button>
            )}
            <Button
              variant={isConnected ? "outline" : "outline"}
              size="sm"
              onClick={() => setOpen(true)}
              className="gap-2"
            >
              {isConnected ? "Editar" : "Configurar manual"}
            </Button>
            {(isPending || isConnected) && cliente.meta_ad_account_id && (
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

          {/* Help */}
          <div className="mt-3 rounded-md bg-muted/40 p-3 space-y-1 text-xs">
            <p className="font-semibold flex items-center gap-1.5">
              <AlertCircle className="size-3.5 text-amber-400" />
              Como configurar
            </p>
            <ol className="text-muted-foreground space-y-0.5 list-decimal list-inside">
              <li>Acesse o <a href="https://business.facebook.com" target="_blank" rel="noopener" className="text-[var(--ddg-orange)] hover:underline inline-flex items-center gap-0.5">Business Manager <ExternalLink className="size-2.5" /></a></li>
              <li>Crie um System User e gere um token long-lived (60d)</li>
              <li>Cole abaixo: Ad Account ID, Pixel ID e o Token</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MetaIcon />
              Configurar Meta Ads — {cliente.nome}
            </DialogTitle>
            <DialogDescription>
              Insira as credenciais do Business Manager. Os dados ficam criptografados no Supabase Vault.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Ad Account ID *</label>
                <Input
                  value={adAccountId}
                  onChange={(e) => setAdAccountId(e.target.value)}
                  placeholder="act_123456789"
                  className="font-mono"
                />
                <p className="text-[10px] text-muted-foreground">Formato: act_XXXXX</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Pixel ID *</label>
                <Input
                  value={pixelId}
                  onChange={(e) => setPixelId(e.target.value)}
                  placeholder="123456789012345"
                  className="font-mono"
                />
                <p className="text-[10px] text-muted-foreground">Pra envio CAPI</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Business ID (opcional)</label>
              <Input
                value={businessId}
                onChange={(e) => setBusinessId(e.target.value)}
                placeholder="123456789012345"
                className="font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Long-lived Access Token</label>
              <Input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="EAAxxxxxx..."
                className="font-mono"
              />
              <p className="text-[10px] text-muted-foreground">
                System User Token (60 dias) do Business Manager
              </p>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Conversion Action ID (opcional)</label>
              <Input
                value={conversionActionId}
                onChange={(e) => setConversionActionId(e.target.value)}
                placeholder="purchase_event_id"
                className="font-mono"
              />
              <p className="text-[10px] text-muted-foreground">
                Para envio Server-Side Conversions via CAPI
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
    </>
  );
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

function MetaIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.001 2C6.5 2 2 6.5 2 12.001c0 4.91 3.583 8.984 8.276 9.86v-6.97H7.832v-2.89h2.444V9.872c0-2.418 1.42-3.74 3.604-3.74.97 0 2.06.062 2.06.062v2.27h-1.16c-1.144 0-1.5.71-1.5 1.439v1.726h2.553l-.408 2.89h-2.145v6.97C18.417 20.985 22 16.91 22 12 22 6.5 17.501 2 12.001 2z" />
    </svg>
  );
}
