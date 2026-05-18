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
    setLoading(true);
    try {
      const res = await fetch("/api/dispatcher/sync-wabas", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao sincronizar");
      const result = data.results?.[0];
      const msg = result
        ? `${result.wabas} WABAs · ${result.inserted} novos · ${result.updated} atualizados`
        : "Sincronizado";
      toast.success(msg);
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={handleSync} disabled={loading} variant="default">
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
      Sincronizar do app
    </Button>
  );
}
