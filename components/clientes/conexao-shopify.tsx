"use client";

import { useState, useTransition } from "react";
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  Loader2,
  ExternalLink,
  Power,
  RefreshCw,
  ShoppingBag,
  Eye,
  EyeOff,
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  conectarShopify,
  desconectarShopify,
  dispararSyncShopify,
} from "@/lib/actions/shopify";
import { iniciarOAuthShopify } from "@/lib/actions/oauth-shopify";
import type { ClienteCompleto } from "@/lib/actions/clientes";
import { formatRelativeTime } from "@/lib/utils";
import { useOAuthPopup, type OAuthCompleteEvent } from "@/hooks/use-oauth-popup";

interface Props {
  cliente: ClienteCompleto;
  onUpdate: () => void;
}

export function ConexaoShopify({ cliente, onUpdate }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [syncing, setSyncing] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [oauthDomain, setOauthDomain] = useState(cliente.shopify_shop_domain ?? "");
  const [manualDomain, setManualDomain] = useState(cliente.shopify_shop_domain ?? "");
  const [manualToken, setManualToken] = useState("");

  const isConnected = cliente.status_shopify === "conectado";
  const hasError = cliente.status_shopify === "erro";

  const handleOAuthComplete = (event: OAuthCompleteEvent) => {
    if (event.provider !== "shopify") return;
    if (event.ok) {
      toast.success("Shopify conectado!", {
        description: "Sincronização iniciada — dados aparecem em instantes",
      });
      setOpen(false);
      onUpdate();
    } else {
      toast.error("OAuth Shopify falhou", { description: event.error ?? "Erro" });
    }
  };

  const { abrirPopup } = useOAuthPopup({ onComplete: handleOAuthComplete });

  const handleOAuth = () => {
    if (!oauthDomain.trim()) {
      toast.error("Informe o domínio da loja antes");
      return;
    }
    startTransition(async () => {
      const res = await iniciarOAuthShopify(
        cliente.id,
        oauthDomain,
        "configuracoes",
        "popup"
      );
      if (!res.ok || !res.url) {
        toast.error("Erro ao iniciar OAuth", { description: res.error });
        return;
      }
      abrirPopup(res.url, "shopify");
    });
  };

  const handleManual = () => {
    if (!manualDomain.trim() || !manualToken.trim()) {
      toast.error("Preencha domínio e token");
      return;
    }
    startTransition(async () => {
      const res = await conectarShopify({
        cliente_id: cliente.id,
        shop_domain: manualDomain,
        access_token: manualToken,
      });
      if (!res.ok) {
        toast.error("Erro ao conectar", { description: res.error });
        return;
      }
      toast.success("Shopify conectado!", { description: "Iniciando sync..." });
      setOpen(false);
      onUpdate();
      setSyncing(true);
      const sync = await dispararSyncShopify(cliente.id, 60);
      setSyncing(false);
      if (sync.ok) {
        toast.success("Loja sincronizada");
        onUpdate();
      }
    });
  };

  const handleSync = () => {
    setSyncing(true);
    startTransition(async () => {
      const res = await dispararSyncShopify(cliente.id, 60);
      setSyncing(false);
      if (!res.ok) {
        toast.error("Sync falhou", { description: res.error });
        return;
      }
      toast.success("Loja sincronizada");
      onUpdate();
    });
  };

  const handleDesconectar = () => {
    if (!confirm("Desconectar Shopify? Os dados ficam no painel, mas param de atualizar.")) {
      return;
    }
    startTransition(async () => {
      await desconectarShopify(cliente.id);
      toast.success("Shopify desconectado");
      onUpdate();
    });
  };

  return (
    <>
      <Card className="overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="size-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-600/20 flex items-center justify-center shrink-0">
              <ShoppingBag className="size-6 text-emerald-500" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold">Shopify</h3>
                {isConnected && (
                  <Badge variant="success" className="gap-1">
                    <CheckCircle2 className="size-3" />
                    Conectado
                  </Badge>
                )}
                {hasError && (
                  <Badge variant="destructive" className="gap-1">
                    <XCircle className="size-3" />
                    Erro
                  </Badge>
                )}
                {!isConnected && !hasError && (
                  <Badge variant="secondary" className="gap-1">
                    <AlertCircle className="size-3" />
                    Não conectado
                  </Badge>
                )}
              </div>

              <p className="text-xs text-muted-foreground mb-2">
                {isConnected
                  ? `${cliente.shopify_shop_domain} · Sincronizado ${
                      cliente.ultima_sync_shopify
                        ? formatRelativeTime(cliente.ultima_sync_shopify)
                        : "—"
                    }`
                  : "Conecte a loja pra puxar pedidos, produtos, carrinhos e clientes em tempo real."}
              </p>

              {cliente.shopify_ultimo_erro && (
                <div className="mt-2 rounded-md border border-red-500/40 bg-red-500/5 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wider text-red-400 font-semibold mb-0.5">
                    Último erro
                  </p>
                  <p className="text-xs text-red-200 break-words">
                    {cliente.shopify_ultimo_erro.slice(0, 200)}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 mt-3">
                {!isConnected ? (
                  <Button
                    size="sm"
                    variant="ddg"
                    onClick={() => setOpen(true)}
                    disabled={pending}
                  >
                    Conectar Shopify
                  </Button>
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleSync}
                      disabled={pending || syncing}
                      className="gap-1.5"
                    >
                      {syncing ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <RefreshCw className="size-3.5" />
                      )}
                      {syncing ? "Sincronizando..." : "Sincronizar agora"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setOpen(true)}
                      disabled={pending}
                    >
                      Editar credenciais
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleDesconectar}
                      disabled={pending}
                      className="text-red-400 hover:text-red-300 gap-1.5"
                    >
                      <Power className="size-3.5" />
                      Desconectar
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingBag className="size-5 text-emerald-500" />
              Conectar Shopify
            </DialogTitle>
            <DialogDescription>
              OAuth é o caminho recomendado — Marina autoriza uma vez no Shopify e tá conectado.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="oauth" className="mt-2">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="oauth" className="gap-2">
                <Zap className="size-3.5" />
                OAuth (recomendado)
              </TabsTrigger>
              <TabsTrigger value="manual">Token manual</TabsTrigger>
            </TabsList>

            {/* OAuth tab */}
            <TabsContent value="oauth" className="space-y-4 py-2">
              <div className="rounded-md border border-emerald-500/30 bg-emerald-500/5 p-3 text-xs space-y-1">
                <p className="font-semibold text-emerald-300">Como funciona:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Você digita o domínio da loja</li>
                  <li>Abre popup do Shopify pedindo autorização</li>
                  <li>Cliente clica &quot;Install&quot; → fim</li>
                  <li>Token é salvo automaticamente e sync dispara</li>
                </ol>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted-foreground uppercase tracking-widest">
                  Domínio da loja
                </label>
                <Input
                  value={oauthDomain}
                  onChange={(e) => setOauthDomain(e.target.value)}
                  placeholder="marinasaleme-estamparia.myshopify.com"
                  className="font-mono text-sm"
                />
                <p className="text-[10px] text-muted-foreground">
                  Aceita só o nome também: <code>marinasaleme-estamparia</code>
                </p>
              </div>

              <Button
                variant="ddg"
                onClick={handleOAuth}
                disabled={pending || !oauthDomain.trim()}
                className="w-full gap-2"
              >
                {pending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ExternalLink className="size-4" />
                )}
                Autorizar via Shopify
              </Button>
            </TabsContent>

            {/* Manual tab (fallback pra Custom App legacy) */}
            <TabsContent value="manual" className="space-y-4 py-2">
              <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-xs space-y-1">
                <p className="font-semibold text-amber-300">
                  Use só se já tiver um Access Token <code>shpat_</code> pronto.
                </p>
                <p className="text-muted-foreground">
                  Se ainda não tem, use a aba OAuth — é o caminho oficial.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted-foreground uppercase tracking-widest">
                  Domínio
                </label>
                <Input
                  value={manualDomain}
                  onChange={(e) => setManualDomain(e.target.value)}
                  placeholder="loja.myshopify.com"
                  className="font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted-foreground uppercase tracking-widest">
                  Access Token
                </label>
                <div className="relative">
                  <Input
                    value={manualToken}
                    type={showToken ? "text" : "password"}
                    onChange={(e) => setManualToken(e.target.value)}
                    placeholder="shpat_xxxxxxxxxxxxxxxx"
                    className="font-mono text-sm pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showToken ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={handleManual}
                disabled={pending || !manualDomain.trim() || !manualToken.trim()}
                className="w-full gap-2"
              >
                {pending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="size-4" />
                )}
                Conectar com token manual
              </Button>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
