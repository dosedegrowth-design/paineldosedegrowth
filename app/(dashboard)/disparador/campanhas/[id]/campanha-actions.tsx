"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Play, Pause, Loader2, RotateCw, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  campanha: { id: string; status: string };
  pendentes: number;
  falhados: number;
}

export function CampanhaActions({ campanha, pendentes, falhados }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<"start" | "pause" | "retomar" | "falhados" | null>(null);

  async function startCampanha() {
    setLoading("start");
    try {
      const res = await fetch("/api/dispatcher/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campanha_id: campanha.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Disparo iniciado.");
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(null);
    }
  }

  async function pauseCampanha() {
    setLoading("pause");
    try {
      const res = await fetch(`/api/dispatcher/campanhas/${campanha.id}/pause`, { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast.success("Campanha pausada.");
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(null);
    }
  }

  async function resend(mode: "retomar" | "falhados") {
    setLoading(mode);
    const tid = toast.loading(mode === "retomar" ? "Retomando envios pendentes…" : "Reenviando as falhas…");
    try {
      const res = await fetch(`/api/dispatcher/campanhas/${campanha.id}/resend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const n = data.pendentes ?? 0;
      toast.success(
        mode === "retomar"
          ? `Processando ${n} envio(s) pendente(s). Acompanhe a tabela abaixo.`
          : `${data.resetados ?? 0} falha(s) devolvida(s) pra fila. Reenviando ${n}.`,
        { id: tid },
      );
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message, { id: tid });
    } finally {
      setLoading(null);
    }
  }

  const busy = loading !== null;

  return (
    <div className="flex items-center gap-2">
      {(campanha.status === "draft" || campanha.status === "scheduled" || campanha.status === "paused") && (
        <Button onClick={startCampanha} disabled={busy}>
          {loading === "start" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
          {campanha.status === "paused" ? "Retomar" : "Iniciar disparo"}
        </Button>
      )}

      {campanha.status === "running" && (
        <Button variant="outline" onClick={pauseCampanha} disabled={busy}>
          {loading === "pause" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Pause className="mr-2 h-4 w-4" />}
          Pausar
        </Button>
      )}

      {/* Destrava disparo que ficou com envios parados no meio */}
      {pendentes > 0 && (
        <Button variant="secondary" onClick={() => resend("retomar")} disabled={busy}>
          {loading === "retomar" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCw className="mr-2 h-4 w-4" />}
          Retomar pendentes ({pendentes.toLocaleString("pt-BR")})
        </Button>
      )}

      {/* Reenvia os que deram erro */}
      {falhados > 0 && (
        <Button variant="outline" onClick={() => resend("falhados")} disabled={busy}>
          {loading === "falhados" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
          Reenviar falhas ({falhados.toLocaleString("pt-BR")})
        </Button>
      )}
    </div>
  );
}
