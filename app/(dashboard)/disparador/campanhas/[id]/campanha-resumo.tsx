"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  nome: string;
  conta: string | null;
  telefone: string | null;
  template: string | null;
  total: number;
  enviados: number;
  falhados: number;
  pendentes: number;
  status: string;
  startedAt: string | null;
  finishedAt: string | null;
}

function fmtData(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

export function CampanhaResumo(p: Props) {
  const [copiado, setCopiado] = useState(false);

  const taxa = p.total > 0 ? ((p.enviados / p.total) * 100).toFixed(1) : "0";

  const texto = [
    `📊 RESUMO DO DISPARO`,
    `${p.nome}`,
    ``,
    `📱 Número: ${p.conta ?? "—"}${p.telefone ? ` (${p.telefone})` : ""}`,
    `📄 Modelo: ${p.template ?? "—"}`,
    `👥 Base: ${p.total.toLocaleString("pt-BR")} contatos`,
    ``,
    `✅ Enviados: ${p.enviados.toLocaleString("pt-BR")} (${taxa}%)`,
    `❌ Falhas: ${p.falhados.toLocaleString("pt-BR")}`,
    `⏳ Pendentes: ${p.pendentes.toLocaleString("pt-BR")}`,
    ``,
    `🕐 Início: ${fmtData(p.startedAt)}`,
    `🏁 Fim: ${fmtData(p.finishedAt)}`,
    `📌 Status: ${p.status}`,
  ].join("\n");

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      toast.success("Resumo copiado. Pode colar onde quiser.");
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      toast.error("Não consegui copiar. Selecione o texto e copie manual.");
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Resumo do disparo</CardTitle>
        <Button size="sm" variant="outline" onClick={copiar}>
          {copiado ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
          {copiado ? "Copiado" : "Copiar"}
        </Button>
      </CardHeader>
      <CardContent>
        <pre className="text-sm whitespace-pre-wrap font-mono bg-muted/40 rounded-md p-3 leading-relaxed">
          {texto}
        </pre>
      </CardContent>
    </Card>
  );
}
