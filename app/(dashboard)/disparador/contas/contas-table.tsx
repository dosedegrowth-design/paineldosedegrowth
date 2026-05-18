"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Search, ToggleLeft, ToggleRight } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Conta {
  id: string;
  waba_id: string;
  phone_number_id: string;
  display_name: string;
  waba_name: string | null;
  phone_number_display: string | null;
  ativo: boolean;
}

export function ContasTable({ contas }: { contas: Conta[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

  const filtered = useMemo(() => {
    let arr = contas;
    if (filter === "active") arr = arr.filter((c) => c.ativo);
    if (filter === "inactive") arr = arr.filter((c) => !c.ativo);
    if (search) {
      const s = search.toLowerCase();
      arr = arr.filter(
        (c) =>
          c.display_name.toLowerCase().includes(s) ||
          c.waba_name?.toLowerCase().includes(s) ||
          c.phone_number_display?.toLowerCase().includes(s),
      );
    }
    return arr;
  }, [contas, search, filter]);

  async function toggle(conta: Conta) {
    try {
      const res = await fetch(`/api/dispatcher/contas/${conta.id}/toggle`, { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast.success(conta.ativo ? `${conta.display_name} ocultada` : `${conta.display_name} ativada`);
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 p-3 border-b border-border">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
          <Input
            placeholder="Buscar nome ou número"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-7 h-8"
          />
        </div>
        <div className="flex gap-1 text-xs">
          {(["all", "active", "inactive"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                filter === f ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"
              }`}
            >
              {f === "all" ? "Todos" : f === "active" ? "Ativos" : "Ocultos"}
            </button>
          ))}
        </div>
        <span className="text-xs text-muted-foreground tabular-nums ml-auto">
          {filtered.length} de {contas.length}
        </span>
      </div>

      <div className="max-h-[600px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-card border-b border-border">
            <tr className="text-left text-xs text-muted-foreground">
              <th className="px-4 py-2 w-10"></th>
              <th className="px-4 py-2">Nome</th>
              <th className="px-4 py-2">Número</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((c) => (
              <tr key={c.id} className={`hover:bg-muted/30 ${!c.ativo ? "opacity-50" : ""}`}>
                <td className="px-4 py-2">
                  <button
                    type="button"
                    onClick={() => toggle(c)}
                    className="text-muted-foreground hover:text-foreground"
                    title={c.ativo ? "Ocultar" : "Ativar"}
                  >
                    {c.ativo ? <ToggleRight className="h-5 w-5 text-primary" /> : <ToggleLeft className="h-5 w-5" />}
                  </button>
                </td>
                <td className="px-4 py-2">
                  <div className="font-medium">{c.display_name}</div>
                  {c.waba_name && c.waba_name !== c.display_name && (
                    <div className="text-xs text-muted-foreground">{c.waba_name}</div>
                  )}
                </td>
                <td className="px-4 py-2 font-mono text-xs">{c.phone_number_display ?? "—"}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">Nenhuma conta encontrada.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
