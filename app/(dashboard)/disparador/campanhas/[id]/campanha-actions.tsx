"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Play, Pause, Square, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  campanha: { id: string; status: string };
}

export function CampanhaActions({ campanha }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<"start" | "pause" | "cancel" | null>(null);

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

  if (campanha.status === "draft" || campanha.status === "scheduled" || campanha.status === "paused") {
    return (
      <Button onClick={startCampanha} disabled={loading !== null}>
        {loading === "start" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
        {campanha.status === "paused" ? "Retomar" : "Iniciar disparo"}
      </Button>
    );
  }

  if (campanha.status === "running") {
    return (
      <Button variant="outline" onClick={pauseCampanha} disabled={loading !== null}>
        {loading === "pause" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Pause className="mr-2 h-4 w-4" />}
        Pausar
      </Button>
    );
  }

  return null;
}
