"use client";

import { useEffect, useState, useTransition } from "react";
import { CheckCircle2, Loader2, AlertCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AccountCombobox, type ComboboxOption } from "@/components/clientes/account-combobox";
import {
  getGoogleRecursosDisponiveis,
  selecionarRecursoGoogle,
  type GoogleRecursosDisponiveis,
} from "@/lib/actions/oauth-google";

interface Props {
  clienteId: string | null;
  clienteNome?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function SelecionarContaGoogleModal({
  clienteId,
  clienteNome,
  open,
  onOpenChange,
  onSuccess,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [loadingRecursos, setLoadingRecursos] = useState(false);
  const [recursos, setRecursos] = useState<GoogleRecursosDisponiveis | null>(null);
  const [customerId, setCustomerId] = useState("");

  useEffect(() => {
    if (!open || !clienteId) return;
    setLoadingRecursos(true);
    setRecursos(null);
    getGoogleRecursosDisponiveis(clienteId)
      .then((data) => {
        if (!data) {
          toast.error("Recursos Google não encontrados", {
            description: "Reconecte o Google Ads pra atualizar a lista.",
          });
          onOpenChange(false);
          return;
        }
        setRecursos(data);
        // Pré-seleciona se só tem 1 conta-cliente (não-MCC)
        const clientes = data.customers.filter((c) => !c.manager);
        if (clientes.length === 1) setCustomerId(clientes[0].id);
      })
      .finally(() => setLoadingRecursos(false));
  }, [open, clienteId, onOpenChange]);

  // Filtra MCCs (manager=true) — usuário não vai trackear conta gerencial
  const customerOptions = (recursos?.customers ?? [])
    .filter((c) => !c.manager)
    .map(
      (c): ComboboxOption => ({
        id: c.id,
        name: c.name,
        subId: formatCustomerId(c.id),
        status:
          c.status === "ENABLED"
            ? "ativa"
            : c.status === "CANCELED" || c.status === "SUSPENDED"
              ? "inativa"
              : c.test_account
                ? "teste"
                : "ativa",
        badges: [
          ...(c.currency ? [c.currency] : []),
          ...(c.time_zone ? [c.time_zone.split("/")[1] ?? c.time_zone] : []),
        ],
      })
    );

  const customerSelecionado = recursos?.customers.find((c) => c.id === customerId);
  const totalMCCs = (recursos?.customers ?? []).filter((c) => c.manager).length;

  const handleSalvar = () => {
    if (!clienteId || !customerId) {
      toast.error("Selecione uma conta Google Ads");
      return;
    }
    startTransition(async () => {
      const res = await selecionarRecursoGoogle({ clienteId, customerId });
      if (!res.ok) {
        toast.error("Erro ao salvar seleção", { description: res.error });
        return;
      }
      toast.success("Google Ads conectado!", {
        description: "Conta selecionada. Sync começa após aprovação Basic Access.",
      });
      onSuccess();
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-5 text-blue-400" />
            Selecione a conta Google Ads
          </DialogTitle>
          <DialogDescription>
            Escolha qual Customer ID do Google Ads usar
            {clienteNome ? ` para ${clienteNome}` : ""}.
          </DialogDescription>
        </DialogHeader>

        {loadingRecursos && (
          <div className="py-12 text-center">
            <Loader2 className="size-6 animate-spin mx-auto text-[var(--ddg-orange)]" />
            <p className="text-sm text-muted-foreground mt-3">
              Buscando contas acessíveis na MCC DDG...
            </p>
          </div>
        )}

        {!loadingRecursos && recursos && (
          <div className="space-y-4 py-2">
            {/* Customer ID */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold flex items-center gap-1.5">
                Conta Google Ads <span className="text-[var(--ddg-orange)]">*</span>
              </label>
              {customerOptions.length === 0 ? (
                <div className="rounded-md bg-amber-500/5 border border-amber-500/30 p-3 text-xs">
                  <p className="font-semibold flex items-center gap-1.5 text-amber-400">
                    <AlertCircle className="size-3.5" />
                    Nenhuma conta-cliente encontrada
                  </p>
                  <p className="text-muted-foreground mt-1">
                    {totalMCCs > 0
                      ? `Encontramos ${totalMCCs} conta gerencial (MCC), mas nenhuma conta-cliente. Vincule a conta do cliente à MCC DDG primeiro.`
                      : "Sua conta Google Ads não tem nenhuma conta-cliente acessível."}
                  </p>
                </div>
              ) : (
                <AccountCombobox
                  options={customerOptions}
                  value={customerId}
                  onChange={setCustomerId}
                  placeholder="Selecione a conta Google Ads..."
                  sugestaoMatch={clienteNome}
                  disabled={pending}
                  emptyText="Nenhuma conta encontrada (MCCs estão filtradas)"
                />
              )}
              {totalMCCs > 0 && (
                <p className="text-[10px] text-muted-foreground">
                  {totalMCCs} MCC{totalMCCs > 1 ? "s" : ""} ocultadas (não trackeáveis)
                </p>
              )}
            </div>

            {/* Aviso Basic Access */}
            <div className="rounded-md bg-amber-500/5 border border-amber-500/30 p-3 text-xs space-y-1">
              <p className="font-semibold flex items-center gap-1.5 text-amber-400">
                <AlertCircle className="size-3.5" />
                Sync real só após aprovação Basic Access
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Token salvo, mas o developer token DDG ainda está em &ldquo;Acesso às Análises&rdquo;.
                A sincronização de campanhas começará automaticamente quando o Google aprovar (3-7 dias).
              </p>
            </div>

            {/* Resumo */}
            {customerId && customerSelecionado && (
              <div className="rounded-md bg-emerald-500/5 border border-emerald-500/30 p-3">
                <p className="text-xs font-semibold flex items-center gap-1.5 text-emerald-400 mb-2">
                  <CheckCircle2 className="size-3.5" />
                  Pronto pra conectar
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline" className="text-[10px]">
                    {customerSelecionado.name}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {formatCustomerId(customerSelecionado.id)}
                  </Badge>
                  {customerSelecionado.currency && (
                    <Badge variant="outline" className="text-[10px]">
                      {customerSelecionado.currency}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            Cancelar
          </Button>
          <Button
            variant="ddg"
            size="sm"
            onClick={handleSalvar}
            disabled={!customerId || pending || loadingRecursos}
            className="gap-2"
          >
            {pending && <Loader2 className="size-4 animate-spin" />}
            {pending ? "Salvando..." : "Confirmar e conectar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function formatCustomerId(id: string): string {
  // 1234567890 → 123-456-7890
  if (id.length === 10) {
    return `${id.slice(0, 3)}-${id.slice(3, 6)}-${id.slice(6)}`;
  }
  return id;
}
