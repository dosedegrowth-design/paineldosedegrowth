"use client";

import { useState, useTransition, useEffect } from "react";
import { CheckCircle2, AlertCircle, XCircle, Loader2, Webhook, RotateCw, Code2 } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CodeBlock, CopyButton } from "@/components/ui/copy-button";
import { gerarSecretWebhook, getWebhookConfig } from "@/lib/actions/conexoes";
import type { ClienteCompleto } from "@/lib/actions/clientes";

interface Props {
  cliente: ClienteCompleto;
  onUpdate: () => void;
}

export function ConexaoPainel({ cliente, onUpdate }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [webhookUrl, setWebhookUrl] = useState("");
  const [secret, setSecret] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState<string | null>(null);

  const isConnected = cliente.status_painel_comercial === "conectado";
  const isPending = cliente.status_painel_comercial === "pendente";

  useEffect(() => {
    if (open) {
      getWebhookConfig(cliente.id).then((res) => {
        setWebhookUrl(res.webhookUrl);
        setSecret(res.secret);
      });
    }
  }, [open, cliente.id]);

  const handleGerarSecret = () => {
    startTransition(async () => {
      const res = await gerarSecretWebhook(cliente.id);
      if (!res.ok) {
        toast.error("Erro ao gerar secret", { description: res.error });
        return;
      }
      setShowSecret(res.secret ?? null);
      setSecret(res.secret ?? null);
      setWebhookUrl(res.webhookUrl ?? "");
      toast.success("Webhook configurado", {
        description: "COPIE O SECRET AGORA — ele não será exibido novamente.",
      });
      onUpdate();
    });
  };

  const exemploPayload = `POST ${webhookUrl}
Content-Type: application/json
x-ddg-signature: <hmac_sha256_do_body_com_secret>
x-ddg-cliente-slug: ${cliente.slug}

{
  "cliente_slug": "${cliente.slug}",
  "lead_id": "abc123",
  "tipo_evento": "fechamento",
  "valor": 280.00,
  "moeda": "BRL",
  "ocorrido_em": "2026-04-29T14:30:00Z",
  "match_keys": {
    "email": "lead@example.com",
    "telefone": "+5511999999999",
    "gclid": "Cj0KC...",
    "fbclid": "IwAR..."
  }
}`;

  const exemploCodigo = `// SDK JS recomendado
import crypto from 'node:crypto';

async function enviarFechamento(lead) {
  const body = JSON.stringify({
    cliente_slug: '${cliente.slug}',
    lead_id: lead.id,
    tipo_evento: 'fechamento',
    valor: lead.valor,
    moeda: 'BRL',
    ocorrido_em: new Date().toISOString(),
    match_keys: {
      email: lead.email,
      telefone: lead.telefone,
      gclid: lead.gclid,
      fbclid: lead.fbclid,
    },
  });

  const signature = crypto
    .createHmac('sha256', process.env.DDG_WEBHOOK_SECRET)
    .update(body)
    .digest('hex');

  await fetch('${webhookUrl}', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-ddg-signature': signature,
      'x-ddg-cliente-slug': '${cliente.slug}',
    },
    body,
  });
}`;

  return (
    <>
      <Card
        className={
          isConnected
            ? "border-emerald-500/40 bg-emerald-500/5"
            : isPending
              ? "border-amber-500/40 bg-amber-500/5"
              : ""
        }
      >
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="size-12 rounded-lg bg-[var(--ddg-orange)]/15 text-[var(--ddg-orange)] flex items-center justify-center shrink-0">
              <Webhook className="size-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-semibold">Painel Comercial (Webhook)</h3>
                <StatusBadge status={cliente.status_painel_comercial} />
                <Badge variant="ddg" className="text-[10px]">⭐ Diferencial DDG</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {cliente.painel_comercial_tipo
                  ? `Configurado: ${cliente.painel_comercial_tipo}`
                  : "Recebe fechamentos do CRM e envia pra Meta/Google"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
            <Button variant={isConnected ? "outline" : "ddg"} size="sm" onClick={() => setOpen(true)} className="gap-2">
              <Webhook className="size-3.5" />
              {isConnected || isPending ? "Ver configuração" : "Configurar webhook"}
            </Button>
          </div>

          <div className="mt-3 rounded-md bg-muted/40 p-3 text-xs">
            <p className="text-muted-foreground leading-relaxed">
              Quando o time DDG (ou cliente) marca um lead como &ldquo;fechado&rdquo; no CRM/painel comercial, o sistema envia um webhook pra cá. Nós cuidamos de transformar isso em <strong>Server-Side Conversion</strong> pro Meta CAPI e Google Enhanced Conversions.
            </p>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Webhook className="size-5 text-[var(--ddg-orange)]" />
              Webhook Painel Comercial — {cliente.nome}
            </DialogTitle>
            <DialogDescription>
              Configure o painel comercial pra mandar fechamentos pra cá. Os eventos viram conversões no Meta/Google.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            {/* URL */}
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Endpoint URL
              </label>
              <CodeBlock value={webhookUrl} />
              <p className="text-[10px] text-muted-foreground">Único pra todos os clientes (diferenciação por slug)</p>
            </div>

            {/* Secret */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Secret HMAC
                </label>
                <Button variant="outline" size="sm" onClick={handleGerarSecret} disabled={pending} className="gap-2">
                  {pending ? <Loader2 className="size-3.5 animate-spin" /> : <RotateCw className="size-3.5" />}
                  {secret ? "Regenerar secret" : "Gerar secret"}
                </Button>
              </div>
              {showSecret ? (
                <div className="space-y-2">
                  <div className="rounded-md border border-amber-500/40 bg-amber-500/5 p-3 text-xs">
                    <p className="font-bold text-amber-400 mb-1">⚠️ COPIE AGORA — Não será exibido novamente!</p>
                  </div>
                  <CodeBlock value={showSecret} />
                </div>
              ) : secret ? (
                <div className="rounded-md border border-emerald-500/30 bg-emerald-500/5 p-3 text-xs flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-400" />
                  Secret configurado. Use &ldquo;Regenerar secret&rdquo; se precisar de novo.
                </div>
              ) : (
                <div className="rounded-md border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
                  Nenhum secret gerado ainda. Clique em &ldquo;Gerar secret&rdquo; pra criar um.
                </div>
              )}
            </div>

            {/* Headers obrigatórios */}
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Headers obrigatórios
              </label>
              <div className="rounded-md border border-border bg-muted/40 p-3 space-y-2 text-xs font-mono">
                <div className="flex flex-wrap items-center gap-2">
                  <code className="text-[var(--ddg-orange)]">x-ddg-signature:</code>
                  <span className="text-muted-foreground">HMAC-SHA256 do body com o secret</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <code className="text-[var(--ddg-orange)]">x-ddg-cliente-slug:</code>
                  <code>{cliente.slug}</code>
                </div>
              </div>
            </div>

            {/* Payload exemplo */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Exemplo de payload
                </label>
                <CopyButton value={exemploPayload} />
              </div>
              <pre className="rounded-md border border-border bg-muted/40 p-3 text-xs overflow-x-auto font-mono">
                {exemploPayload}
              </pre>
            </div>

            {/* Código exemplo */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <Code2 className="size-3" />
                  Exemplo Node.js
                </label>
                <CopyButton value={exemploCodigo} />
              </div>
              <pre className="rounded-md border border-border bg-muted/40 p-3 text-xs overflow-x-auto font-mono leading-relaxed">
                {exemploCodigo}
              </pre>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Fechar
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
        Webhook gerado
      </Badge>
    );
  return (
    <Badge variant="secondary" className="gap-1">
      <XCircle className="size-3" />
      Não conectado
    </Badge>
  );
}
