"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";

export function SyncTemplatesButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSync() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      toast.error("Supabase não configurado");
      return;
    }
    setLoading(true);
    const tid = toast.loading("Atualizando templates e status na Meta…");
    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/dispatcher-sync-templates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({}),
        signal: AbortSignal.timeout(180_000),
      });

      if (res.ok) {
        const data = await res.json();
        const totalTemplates = (data.results ?? []).reduce(
          (acc: number, r: { templates?: number }) => acc + (r.templates ?? 0),
          0,
        );
        toast.success(`${totalTemplates} template(s) atualizado(s) da Meta`, { id: tid });
      } else {
        toast.success("Atualização em andamento. O status aparece em instantes.", { id: tid });
      }
    } catch (e) {
      const err = e as Error;
      if (err.name === "TimeoutError" || err.name === "AbortError") {
        toast.success("Ainda atualizando no servidor. Atualize a página em ~1 min.", { id: tid });
      } else {
        toast.error(err.message, { id: tid });
      }
    } finally {
      setLoading(false);
      // Reflete novos templates E status atrasado (aprovado/rejeitado) na tela
      router.refresh();
    }
  }

  return (
    <Button onClick={handleSync} disabled={loading} variant="outline">
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
      {loading ? "Atualizando…" : "Atualizar"}
    </Button>
  );
}
