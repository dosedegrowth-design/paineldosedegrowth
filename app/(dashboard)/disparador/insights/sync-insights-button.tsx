"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";

export function SyncInsightsButton() {
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
    const tid = toast.loading("Puxando insights da Meta (90 dias)… pode levar 1 min.");
    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/dispatcher-sync-insights`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${supabaseKey}` },
        body: JSON.stringify({ days: 90 }),
        signal: AbortSignal.timeout(180_000),
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(`Insights atualizados de ${data.numeros ?? 0} número(s).`, { id: tid });
      } else {
        toast.success("Atualização em andamento. Os dados aparecem em instantes.", { id: tid });
      }
    } catch (e) {
      const err = e as Error;
      if (err.name === "TimeoutError" || err.name === "AbortError") {
        toast.success("Ainda puxando no servidor. Atualize a página em ~1 min.", { id: tid });
      } else {
        toast.error(err.message, { id: tid });
      }
    } finally {
      setLoading(false);
      router.refresh();
    }
  }

  return (
    <Button onClick={handleSync} disabled={loading} variant="default">
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
      {loading ? "Puxando…" : "Atualizar da Meta"}
    </Button>
  );
}
