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
import {
  conectarShopify,
  desconectarShopify,
  dispararSyncShopify,
} from "@/lib/actions/shopify";
import type { ClienteCompleto } from "@/lib/actions/clientes";
import { formatRelativeTime } from "@/lib/utils";

interface Props {
  cliente: ClienteCompleto;
  onUpdate: () => void;
}

export function ConexaoShopify({ cliente, onUpdate }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [syncing, setSyncing] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [domain, setDomain] = useState(cliente.shopify_shop_domain ?? "");
  const [token, setToken] = useState("");

  const isConnected = cliente.status_shopify === "conectado";
  const hasError = cliente.status_shopify === "erro";

  const handleConectar = () => {
    if (!domain.trim() || !token.trim()) {
      toast.error("Preencha domínio e token");
      return;
    }
    startTransition(async () => {
      const res = await conectarShopify({
        cliente_id: cliente.id,
        shop_domain: domain,
        access_token: token,
      });
      if (!res.ok) {
        toast.error("Erro ao conectar", { description: res.error });
        return;
      }
      toast.success("Shopify conectado!", {
        description: "Iniciando primeira sincronização...",
      });
      setOpen(false);
      onUpdate();
      // Dispara sync inicial em seguida
      setSyncing(true);
      const sync = await dispararSyncShopify(cliente.id, 60);
      setSyncing(false);
      if (sync.ok) {
        toast.success("Loja sincronizada", {
          description: "Pedidos, produtos e carrinhos já no painel",
        });
        onUpdate();
      } else {
        toast.error("Sync falhou", { description: sync.error });
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
            {/* Logo */}
            <div className="size-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-600/20 flex items-center justify-center shrink-0">
              <ShoppingBag className="size-6 text-emerald-500" />
            </div>

            {/* Conteúdo */}
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

              {/* Banner de erro */}
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

              {/* Ações */}
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
              Conectar Shopify (Custom App)
            </DialogTitle>
            <DialogDescription>
              Custom App é a forma mais simples — você cria 1 vez no admin Shopify, copia o
              Access Token e cola aqui.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Passo a passo */}
            <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-xs space-y-2">
              <p className="font-semibold text-amber-300">
                Como criar o Custom App no admin Shopify:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Admin Shopify → Settings → Apps and sales channels</li>
                <li>Develop apps → Create an app</li>
                <li>
                  Configure Admin API scopes →{" "}
                  <span className="text-foreground">
                    read_orders, read_products, read_customers, read_checkouts
                  </span>
                </li>
                <li>Install app → Reveal token once → copie e cole abaixo</li>
              </ol>
              <a
                href="https://help.shopify.com/en/manual/apps/app-types/custom-apps"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:underline inline-flex items-center gap-1"
              >
                Documentação oficial <ExternalLink className="size-3" />
              </a>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground uppercase tracking-widest">
                Domínio da loja
              </label>
              <Input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="marina-saleme.myshopify.com"
                className="font-mono text-sm"
              />
              <p className="text-[10px] text-muted-foreground">
                Aceita só o nome também: <code>marina-saleme</code>
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground uppercase tracking-widest">
                Access Token (Admin API)
              </label>
              <div className="relative">
                <Input
                  value={token}
                  type={showToken ? "text" : "password"}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
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
              <p className="text-[10px] text-muted-foreground">
                Começa com <code>shpat_</code>. Aparece UMA vez na criação do app — guarde.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
              Cancelar
            </Button>
            <Button
              variant="ddg"
              onClick={handleConectar}
              disabled={pending || !domain.trim() || !token.trim()}
              className="gap-2"
            >
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CheckCircle2 className="size-4" />
              )}
              {pending ? "Validando..." : "Conectar e sincronizar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
