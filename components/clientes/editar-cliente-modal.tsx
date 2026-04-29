"use client";

import { useState, useTransition } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateCliente, type ClienteCompleto, type TipoNegocio } from "@/lib/actions/clientes";

interface Props {
  cliente: ClienteCompleto;
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export function EditarClienteModal({ cliente, open, onClose, onUpdated }: Props) {
  const [pending, startTransition] = useTransition();

  const [nome, setNome] = useState(cliente.nome);
  const [tipo, setTipo] = useState<TipoNegocio>(cliente.tipo_negocio);
  const [corPrimaria, setCorPrimaria] = useState(cliente.cor_primaria);
  const [cacMaximo, setCacMaximo] = useState(cliente.cac_maximo?.toString() ?? "");
  const [ticketMedio, setTicketMedio] = useState(cliente.ticket_medio?.toString() ?? "");

  const handleSave = () => {
    startTransition(async () => {
      const res = await updateCliente({
        cliente_id: cliente.id,
        nome,
        tipo_negocio: tipo,
        cor_primaria: corPrimaria,
        cac_maximo: cacMaximo ? parseFloat(cacMaximo) : null,
        ticket_medio: ticketMedio ? parseFloat(ticketMedio) : null,
      });

      if (!res.ok) {
        toast.error("Erro ao salvar", { description: res.error });
        return;
      }
      toast.success("Cliente atualizado");
      onUpdated();
      onClose();
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Editar cliente</DialogTitle>
          <DialogDescription>
            Slug não pode ser alterado depois de criado (afeta URLs e webhooks).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Nome</label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium">Slug (não editável)</label>
            <Input value={cliente.slug} disabled className="font-mono text-muted-foreground" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium">Tipo de negócio</label>
            <Select value={tipo} onValueChange={(v) => setTipo(v as TipoNegocio)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lead_whatsapp">Lead/WhatsApp</SelectItem>
                <SelectItem value="ecommerce">E-commerce</SelectItem>
                <SelectItem value="hibrido">Híbrido</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground">
              Mudar o tipo recarrega painéis e KPIs visíveis pra esse cliente
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">CAC máximo (R$)</label>
              <Input
                type="number"
                step="0.01"
                value={cacMaximo}
                onChange={(e) => setCacMaximo(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Ticket médio (R$)</label>
              <Input
                type="number"
                step="0.01"
                value={ticketMedio}
                onChange={(e) => setTicketMedio(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium">Cor primária</label>
            <div className="flex gap-2 max-w-xs">
              <input
                type="color"
                value={corPrimaria}
                onChange={(e) => setCorPrimaria(e.target.value)}
                className="h-9 w-12 rounded-md border border-input cursor-pointer"
              />
              <Input
                value={corPrimaria}
                onChange={(e) => setCorPrimaria(e.target.value)}
                className="flex-1 font-mono"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={pending}>
            Cancelar
          </Button>
          <Button variant="ddg" onClick={handleSave} disabled={pending} className="gap-2">
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Salvar alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
