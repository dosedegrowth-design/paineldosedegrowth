"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";

export function SyncWabasButton() {
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
    const tid = toast.loading("Buscando números na Meta… leva 1-2 min, pode deixar aberto.");
    try {
      // Chama Edge Function direto (evita timeout 10s do Serverless do Next).
      // A sync de 200+ números leva ~137s; damos margem no client.
      const res = await fetch(`${supabaseUrl}/functions/v1/dispatcher-sync-wabas`, {
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
        const result = data.results?.[0];
        const msg = result
          ? `${result.wabas} números · ${result.inserted} novos · ${result.updated} atualizados`
          : "Números sincronizados";
        toast.success(msg, { id: tid });
      } else {
        // 504/IDLE_TIMEOUT: a Edge costuma terminar o trabalho mesmo assim
        toast.success("Sincronização em andamento. Os números novos aparecem em instantes.", { id: tid });
      }
    } catch (e) {
      const err = e as Error;
      if (err.name === "TimeoutError" || err.name === "AbortError") {
        toast.success("Ainda sincronizando no servidor. Atualize a página em ~1 min.", { id: tid });
      } else {
        toast.error(err.message, { id: tid });
      }
    } finally {
      setLoading(false);
      // Mostra o que já entrou no banco, mesmo se a resposta demorou/falhou
      router.refresh();
    }
  }

  return (
    <Button onClick={handleSync} disabled={loading} variant="default">
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
      {loading ? "Sincronizando…" : "Sincronizar números"}
    </Button>
  );
}
