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
    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/dispatcher-sync-templates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao sincronizar");

      const totalTemplates = (data.results ?? []).reduce(
        (acc: number, r: { templates?: number }) => acc + (r.templates ?? 0),
        0,
      );
      toast.success(`${totalTemplates} template(s) sincronizado(s) da Meta`);
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={handleSync} disabled={loading} variant="outline">
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
      Atualizar
    </Button>
  );
}
