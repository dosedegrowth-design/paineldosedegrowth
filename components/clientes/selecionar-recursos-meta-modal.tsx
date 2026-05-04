"use client";

import { useEffect, useState, useTransition } from "react";
import { CheckCircle2, Loader2, AlertCircle, Facebook } from "lucide-react";
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
  getMetaRecursosDisponiveis,
  selecionarRecursosMeta,
  type MetaRecursosDisponiveis,
} from "@/lib/actions/oauth-meta";

interface Props {
  clienteId: string | null;
  /** Nome do cliente — usado pra destacar opções "sugeridas" */
  clienteNome?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function SelecionarRecursosMetaModal({
  clienteId,
  clienteNome,
  open,
  onOpenChange,
  onSuccess,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [loadingRecursos, setLoadingRecursos] = useState(false);
  const [recursos, setRecursos] = useState<MetaRecursosDisponiveis | null>(null);

  const [adAccountId, setAdAccountId] = useState("");
  const [pixelId, setPixelId] = useState("");
  const [pageId, setPageId] = useState("");

  // Carrega recursos quando modal abre
  useEffect(() => {
    if (!open || !clienteId) return;
    setLoadingRecursos(true);
    setRecursos(null);
    getMetaRecursosDisponiveis(clienteId)
      .then((data) => {
        if (!data) {
          toast.error("Recursos não encontrados", {
            description: "Reconecte o Meta pra atualizar a lista.",
          });
          onOpenChange(false);
          return;
        }
        setRecursos(data);
        // Pré-seleciona se só tem 1 opção
        const ativas = data.ad_accounts.filter((a) => a.account_status === 1);
        if (ativas.length === 1) setAdAccountId(ativas[0].id);
        else if (data.ad_accounts.length === 1) setAdAccountId(data.ad_accounts[0].id);
        if (data.pixels.length === 1) setPixelId(data.pixels[0].id);
        if (data.pages.length === 1) setPageId(data.pages[0].id);
      })
      .finally(() => setLoadingRecursos(false));
  }, [open, clienteId, onOpenChange]);

  // Mapeia ad accounts pro formato do AccountCombobox
  const adAccountOptions = (recursos?.ad_accounts ?? []).map(
    (a): ComboboxOption => ({
      id: a.id,
      name: a.name,
      subId: a.id.replace("act_", ""),
      status: a.account_status === 1 ? "ativa" : "inativa",
      badges: [
        ...(a.currency ? [a.currency] : []),
        ...(a.business ? [a.business.name] : []),
      ],
      searchExtra: a.business?.name,
    })
  );

  // Filtra pixels da ad account selecionada e mapeia
  const pixelOptions = (recursos?.pixels ?? [])
    .filter((p) => !adAccountId || p.ad_account_id === adAccountId)
    .map(
      (p): ComboboxOption => ({
        id: p.id,
        name: p.name,
        subId: p.id,
        status: "ativa",
      })
    );

  // Pages
  const pageOptions = (recursos?.pages ?? []).map(
    (p): ComboboxOption => ({
      id: p.id,
      name: p.name,
      subId: p.id,
      status: "ativa",
      badges: [
        ...(p.category ? [p.category] : []),
        ...(p.instagram_business_account ? ["+ Instagram"] : []),
      ],
    })
  );

  // Resumo
  const adAccountSelecionada = recursos?.ad_accounts.find((a) => a.id === adAccountId);
  const businessId = adAccountSelecionada?.business?.id ?? null;

  const handleSalvar = () => {
    if (!clienteId || !adAccountId) {
      toast.error("Selecione ao menos uma Ad Account");
      return;
    }
    startTransition(async () => {
      const res = await selecionarRecursosMeta({
        clienteId,
        adAccountId,
        pixelId: pixelId || null,
        pageId: pageId || null,
        businessId,
      });
      if (!res.ok) {
        toast.error("Erro ao salvar seleção", { description: res.error });
        return;
      }
      toast.success("Meta Ads conectado!", {
        description: "Recursos salvos. Pronto pra sincronizar.",
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
            <Facebook className="size-5 text-[#0866ff]" />
            Selecione os recursos Meta
          </DialogTitle>
          <DialogDescription>
            Escolha qual Ad Account, Pixel e Página do Facebook usar
            {clienteNome ? ` para ${clienteNome}` : ""}.
          </DialogDescription>
        </DialogHeader>

        {loadingRecursos && (
          <div className="py-12 text-center">
            <Loader2 className="size-6 animate-spin mx-auto text-[var(--ddg-orange)]" />
            <p className="text-sm text-muted-foreground mt-3">
              Buscando recursos do seu Business Manager...
            </p>
          </div>
        )}

        {!loadingRecursos && recursos && (
          <div className="space-y-4 py-2">
            {/* Ad Account */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold flex items-center gap-1.5">
                Ad Account <span className="text-[var(--ddg-orange)]">*</span>
              </label>
              {adAccountOptions.length === 0 ? (
                <div className="rounded-md bg-amber-500/5 border border-amber-500/30 p-3 text-xs">
                  <p className="font-semibold flex items-center gap-1.5 text-amber-400">
                    <AlertCircle className="size-3.5" />
                    Nenhuma Ad Account encontrada
                  </p>
                  <p className="text-muted-foreground mt-1">
                    Você precisa ter acesso a pelo menos uma conta de anúncios no Business Manager.
                  </p>
                </div>
              ) : (
                <AccountCombobox
                  options={adAccountOptions}
                  value={adAccountId}
                  onChange={(id) => {
                    setAdAccountId(id);
                    setPixelId(""); // reset pixel quando troca account
                  }}
                  placeholder="Selecione a Ad Account..."
                  sugestaoMatch={clienteNome}
                  disabled={pending}
                />
              )}
            </div>

            {/* Pixel */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold flex items-center gap-1.5">
                Pixel <span className="text-[10px] text-muted-foreground font-normal">(opcional — necessário pra CAPI)</span>
              </label>
              {pixelOptions.length === 0 ? (
                <div className="rounded-md bg-muted/40 p-2.5 text-xs text-muted-foreground">
                  {adAccountId
                    ? "Nenhum pixel encontrado nessa ad account. Você pode configurar depois."
                    : "Selecione uma Ad Account primeiro pra ver pixels disponíveis."}
                </div>
              ) : (
                <AccountCombobox
                  options={pixelOptions}
                  value={pixelId}
                  onChange={setPixelId}
                  placeholder="Sem pixel (configurar depois)"
                  sugestaoMatch={clienteNome}
                  clearable
                  disabled={pending}
                />
              )}
            </div>

            {/* Página */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold flex items-center gap-1.5">
                Página do Facebook <span className="text-[10px] text-muted-foreground font-normal">(opcional — Lead Ads/Messenger)</span>
              </label>
              {pageOptions.length === 0 ? (
                <div className="rounded-md bg-muted/40 p-2.5 text-xs text-muted-foreground">
                  Nenhuma página encontrada.
                </div>
              ) : (
                <AccountCombobox
                  options={pageOptions}
                  value={pageId}
                  onChange={setPageId}
                  placeholder="Sem página (configurar depois)"
                  sugestaoMatch={clienteNome}
                  clearable
                  disabled={pending}
                />
              )}
            </div>

            {/* Resumo */}
            {adAccountId && (
              <div className="rounded-md bg-emerald-500/5 border border-emerald-500/30 p-3">
                <p className="text-xs font-semibold flex items-center gap-1.5 text-emerald-400 mb-2">
                  <CheckCircle2 className="size-3.5" />
                  Pronto pra conectar
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline" className="text-[10px]">
                    Ad: {adAccountSelecionada?.name}
                  </Badge>
                  {pixelId && (
                    <Badge variant="outline" className="text-[10px]">
                      Pixel ✓
                    </Badge>
                  )}
                  {pageId && (
                    <Badge variant="outline" className="text-[10px]">
                      Página ✓
                    </Badge>
                  )}
                  {businessId && (
                    <Badge variant="outline" className="text-[10px]">
                      BM: {adAccountSelecionada?.business?.name}
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
            disabled={!adAccountId || pending || loadingRecursos}
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
