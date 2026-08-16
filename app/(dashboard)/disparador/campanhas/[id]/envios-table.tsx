"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, RefreshCw } from "lucide-react";

interface Envio {
  id: string;
  telefone: string;
  telefone_raw: string | null;
  status: string;
  message_id: string | null;
  error_code: string | null;
  error_message: string | null;
  sent_at: string | null;
  delivered_at: string | null;
  read_at: string | null;
}

const STATUS_COLOR: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  sending: "outline",
  sent: "outline",
  delivered: "default",
  read: "default",
  failed: "destructive",
};

export function EnviosTable({ campanhaId }: { campanhaId: string }) {
  const [envios, setEnvios] = useState<Envio[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    const supabase = createClient();
    let q = supabase
      .schema("disparador" as never)
      .from("envios")
      .select("*")
      .eq("campanha_id", campanhaId)
      .order("criado_em", { ascending: true })
      .limit(500);
    if (filter !== "all") q = q.eq("status", filter);
    if (search) q = q.ilike("telefone", `%${search.replace(/\D/g, "")}%`);
    const { data } = await q;
    setEnvios((data as Envio[] | null) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campanhaId, filter, search]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Envios ({envios.length})</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
              <Input
                placeholder="Buscar telefone"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-7 h-8 w-[180px]"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="h-8 px-2 rounded-md border border-input bg-transparent text-sm"
            >
              <option value="all">Todos</option>
              <option value="pending">Pendentes</option>
              <option value="sent">Enviados</option>
              <option value="delivered">Entregues</option>
              <option value="read">Lidos</option>
              <option value="failed">Falhas</option>
            </select>
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[600px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-card border-b border-border">
              <tr className="text-left text-xs text-muted-foreground">
                <th className="px-4 py-2">Telefone</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Enviado</th>
                <th className="px-4 py-2">Entregue</th>
                <th className="px-4 py-2">Lido</th>
                <th className="px-4 py-2">Erro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {envios.map((e) => (
                <tr key={e.id} className="hover:bg-muted/40">
                  <td className="px-4 py-2 font-mono text-xs">{e.telefone}</td>
                  <td className="px-4 py-2">
                    <Badge variant={STATUS_COLOR[e.status] ?? "secondary"}>{e.status}</Badge>
                  </td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{fmt(e.sent_at)}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{fmt(e.delivered_at)}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{fmt(e.read_at)}</td>
                  <td className="px-4 py-2 text-xs text-destructive">{e.error_message ?? ""}</td>
                </tr>
              ))}
              {envios.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    Nenhum envio.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function fmt(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
