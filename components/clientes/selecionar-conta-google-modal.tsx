"use client";

import { useEffect, useState, useTransition } from "react";
import { CheckCircle2, Loader2, AlertCircle, Sparkles, KeyRound, Info } from "lucide-react";
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
import { Input } from "@/components/ui/input";
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
  const [incluirMCC, setIncluirMCC] = useState(false);
  const [modoManual, setModoManual] = useState(false);
  const [customerIdManual, setCustomerIdManual] = useState("");

  useEffect(() => {
    if (!open || !clienteId) return;
    setLoadingRecursos(true);
    setRecursos(null);
    setCustomerId("");
    setCustomerIdManual("");
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
        const clientes = data.customers.filter((c) => !c.manager);
        if (clientes.length === 1) setCustomerId(clientes[0].id);
        // Se não tem clientes mas tem MCCs, sugere mostrar MCCs
        if (clientes.length === 0 && data.customers.length > 0) {
          setIncluirMCC(true);
        }
        // Se não tem nenhum customer (lista vazia), abre modo manual
        if (data.customers.length === 0) {
          setModoManual(true);
        }
      })
      .finally(() => setLoadingRecursos(false));
  }, [open, clienteId, onOpenChange]);

  // Filtra opções: contas-cliente sempre + MCCs se incluirMCC=true
  const customerOptions = (recursos?.customers ?? [])
    .filter((c) => incluirMCC || !c.manager)
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
          ...(c.manager ? ["MCC"] : []),
          ...(c.currency ? [c.currency] : []),
          ...(c.time_zone ? [c.time_zone.split("/")[1] ?? c.time_zone] : []),
        ],
      })
    );

  const customerSelecionado = recursos?.customers.find((c) => c.id === customerId);
  const totalMCCs = (recursos?.customers ?? []).filter((c) => c.manager).length;
  const totalClientes = (recursos?.customers ?? []).filter((c) => !c.manager).length;
  const semContas = (recursos?.customers ?? []).length === 0;
  const apiError = recursos?.listError;

  const handleSalvar = () => {
    const idFinal = modoManual ? customerIdManual.replace(/\D/g, "") : customerId;
    if (!clienteId || !idFinal) {
      toast.error("Selecione ou digite uma conta Google Ads");
      return;
    }
    if (modoManual && idFinal.length !== 10) {
      toast.error("Customer ID inválido", {
        description: "Deve ter 10 dígitos. Ex: 123-456-7890",
      });
      return;
    }
    startTransition(async () => {
      const res = await selecionarRecursoGoogle({ clienteId, customerId: idFinal });
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
            {/* Erro da API (se houver) */}
            {apiError && (
              <div className="rounded-md bg-red-500/5 border border-red-500/30 p-3 text-xs space-y-1">
                <p className="font-semibold flex items-center gap-1.5 text-red-400">
                  <AlertCircle className="size-3.5" />
                  API Google Ads retornou erro
                </p>
                <p className="text-muted-foreground leading-relaxed font-mono break-all">
                  {apiError}
                </p>
                <p className="text-muted-foreground leading-relaxed mt-2">
                  Provável causa: developer token ainda em &ldquo;Acesso às Análises&rdquo; (test mode).
                  Use o input manual abaixo pra continuar.
                </p>
              </div>
            )}

            {/* Aviso se nenhuma conta apareceu */}
            {semContas && !apiError && (
              <div className="rounded-md bg-amber-500/5 border border-amber-500/30 p-3 text-xs space-y-1">
                <p className="font-semibold flex items-center gap-1.5 text-amber-400">
                  <AlertCircle className="size-3.5" />
                  Nenhuma conta Google Ads acessível
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  A API retornou lista vazia. Pode ser:
                  <br />
                  • Developer token ainda em &ldquo;Acesso às Análises&rdquo; (test mode — Basic Access pendente)
                  <br />
                  • A conta Google que autorizou o OAuth não tem acesso ao Google Ads
                  <br />
                  • Você logou com conta diferente da MCC DDG
                </p>
                <p className="text-muted-foreground leading-relaxed mt-2">
                  Use o modo manual abaixo pra digitar o Customer ID direto.
                </p>
              </div>
            )}

            {/* Toggle modo combobox vs manual */}
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => setModoManual(false)}
                className={`px-3 py-1.5 rounded-md border transition-colors ${
                  !modoManual
                    ? "border-[var(--ddg-orange)] bg-[var(--ddg-orange)]/10 text-[var(--ddg-orange)]"
                    : "border-border hover:border-[var(--ddg-orange)]/40"
                }`}
              >
                Lista de contas
              </button>
              <button
                type="button"
                onClick={() => setModoManual(true)}
                className={`px-3 py-1.5 rounded-md border transition-colors flex items-center gap-1.5 ${
                  modoManual
                    ? "border-[var(--ddg-orange)] bg-[var(--ddg-orange)]/10 text-[var(--ddg-orange)]"
                    : "border-border hover:border-[var(--ddg-orange)]/40"
                }`}
              >
                <KeyRound className="size-3" />
                Inserir Customer ID
              </button>
            </div>

            {/* Modo combobox */}
            {!modoManual && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold flex items-center gap-1.5">
                  Conta Google Ads <span className="text-[var(--ddg-orange)]">*</span>
                </label>

                {customerOptions.length === 0 ? (
                  <div className="rounded-md bg-muted/40 p-3 text-xs text-muted-foreground">
                    {totalMCCs > 0 && !incluirMCC ? (
                      <>
                        Encontramos {totalMCCs} MCC{totalMCCs > 1 ? "s" : ""} (gerenciais), mas
                        nenhuma conta-cliente.{" "}
                        <button
                          type="button"
                          onClick={() => setIncluirMCC(true)}
                          className="text-[var(--ddg-orange)] hover:underline font-medium"
                        >
                          Mostrar MCCs também
                        </button>
                      </>
                    ) : (
                      "Nenhuma opção disponível. Use o modo manual."
                    )}
                  </div>
                ) : (
                  <AccountCombobox
                    options={customerOptions}
                    value={customerId}
                    onChange={setCustomerId}
                    placeholder="Selecione a conta Google Ads..."
                    sugestaoMatch={clienteNome}
                    disabled={pending}
                    emptyText="Nenhuma conta encontrada"
                  />
                )}

                {totalMCCs > 0 && !incluirMCC && totalClientes > 0 && (
                  <button
                    type="button"
                    onClick={() => setIncluirMCC(true)}
                    className="text-[10px] text-muted-foreground hover:text-foreground"
                  >
                    + Mostrar {totalMCCs} MCC{totalMCCs > 1 ? "s" : ""} também
                  </button>
                )}
                {totalMCCs > 0 && incluirMCC && (
                  <button
                    type="button"
                    onClick={() => setIncluirMCC(false)}
                    className="text-[10px] text-muted-foreground hover:text-foreground"
                  >
                    − Ocultar MCC{totalMCCs > 1 ? "s" : ""}
                  </button>
                )}
              </div>
            )}

            {/* Modo manual */}
            {modoManual && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold flex items-center gap-1.5">
                  Customer ID Google Ads <span className="text-[var(--ddg-orange)]">*</span>
                </label>
                <Input
                  value={customerIdManual}
                  onChange={(e) => setCustomerIdManual(e.target.value)}
                  placeholder="123-456-7890"
                  className="font-mono"
                  disabled={pending}
                />
                <div className="rounded-md bg-blue-500/5 border border-blue-500/20 p-2.5 text-[11px] text-muted-foreground space-y-1">
                  <p className="flex items-center gap-1.5 text-blue-400 font-semibold">
                    <Info className="size-3" />
                    Como achar o Customer ID
                  </p>
                  <ol className="list-decimal list-inside space-y-0.5 leading-relaxed">
                    <li>Acessa <a href="https://ads.google.com" target="_blank" rel="noopener" className="text-[var(--ddg-orange)] hover:underline">ads.google.com</a></li>
                    <li>Seleciona a conta da Petderma no seletor superior</li>
                    <li>O Customer ID aparece ao lado do nome (formato 123-456-7890)</li>
                  </ol>
                </div>
              </div>
            )}

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
            {!modoManual && customerId && customerSelecionado && (
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
                  {customerSelecionado.manager && (
                    <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-400 border-blue-500/30">
                      MCC
                    </Badge>
                  )}
                  {customerSelecionado.currency && (
                    <Badge variant="outline" className="text-[10px]">
                      {customerSelecionado.currency}
                    </Badge>
                  )}
                </div>
              </div>
            )}
            {modoManual && customerIdManual.replace(/\D/g, "").length === 10 && (
              <div className="rounded-md bg-emerald-500/5 border border-emerald-500/30 p-3">
                <p className="text-xs font-semibold flex items-center gap-1.5 text-emerald-400 mb-1">
                  <CheckCircle2 className="size-3.5" />
                  Customer ID válido
                </p>
                <Badge variant="outline" className="text-[10px] font-mono">
                  {formatCustomerId(customerIdManual.replace(/\D/g, ""))}
                </Badge>
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
            disabled={
              (modoManual ? customerIdManual.replace(/\D/g, "").length !== 10 : !customerId) ||
              pending ||
              loadingRecursos
            }
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
  if (id.length === 10) {
    return `${id.slice(0, 3)}-${id.slice(3, 6)}-${id.slice(6)}`;
  }
  return id;
}
