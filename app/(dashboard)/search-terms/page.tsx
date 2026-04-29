"use client";

import { useState, useMemo } from "react";
import { Plus, ShieldOff, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/dashboard/page-header";
import { cn, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

interface SearchTerm {
  id: string;
  termo: string;
  campanha: string;
  gasto: number;
  cliques: number;
  conversoes: number;
  ctr: number;
  selecionada: boolean;
}

const TERMOS: SearchTerm[] = [
  { id: "1", termo: "petderma como usar", campanha: "[Search] Genérico", gasto: 245.8, cliques: 142, conversoes: 0, ctr: 1.2, selecionada: false },
  { id: "2", termo: "shampoo dermatológico cachorro free", campanha: "[Search] Genérico", gasto: 189.4, cliques: 98, conversoes: 0, ctr: 0.9, selecionada: false },
  { id: "3", termo: "petderma reclame aqui", campanha: "[Search] Marca", gasto: 156.2, cliques: 87, conversoes: 1, ctr: 2.1, selecionada: false },
  { id: "4", termo: "petderma é seguro para gatos filhotes", campanha: "[Search] Genérico", gasto: 132.5, cliques: 64, conversoes: 0, ctr: 1.8, selecionada: false },
  { id: "5", termo: "remedio pulga grátis", campanha: "[Search] Genérico", gasto: 98.7, cliques: 52, conversoes: 0, ctr: 0.7, selecionada: false },
  { id: "6", termo: "petderma genérico mais barato", campanha: "[Search] Marca", gasto: 87.2, cliques: 48, conversoes: 0, ctr: 1.4, selecionada: false },
  { id: "7", termo: "como fazer shampoo caseiro pet", campanha: "[Search] Genérico", gasto: 65.4, cliques: 38, conversoes: 0, ctr: 0.6, selecionada: false },
];

export default function SearchTermsPage() {
  const [search, setSearch] = useState("");
  const [terms, setTerms] = useState(TERMOS);

  const filtered = useMemo(
    () =>
      terms.filter((t) =>
        t.termo.toLowerCase().includes(search.toLowerCase())
      ),
    [terms, search]
  );

  const selectedCount = terms.filter((t) => t.selecionada).length;
  const selectedSpend = terms
    .filter((t) => t.selecionada)
    .reduce((s, t) => s + t.gasto, 0);

  const toggle = (id: string) =>
    setTerms((prev) =>
      prev.map((t) => (t.id === id ? { ...t, selecionada: !t.selecionada } : t))
    );
  const toggleAll = (v: boolean) =>
    setTerms((prev) => prev.map((t) => ({ ...t, selecionada: v })));

  const negativar = () => {
    toast.success(`${selectedCount} termos enviados para negativação`, {
      description: "As negativadas serão aplicadas via API do Google Ads.",
    });
    setTerms((prev) => prev.filter((t) => !t.selecionada));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Auditoria de Search Terms"
        description="Termos com alto gasto e baixo retorno · Google Ads"
      />

      <Card>
        <CardContent className="p-4 flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar termo..."
              className="pl-9 h-9"
            />
          </div>
          <Badge variant="outline">{filtered.length} termos suspeitos</Badge>
          <Badge variant="danger">
            Gasto: {formatCurrency(filtered.reduce((s, t) => s + t.gasto, 0))}
          </Badge>
          <div className="flex-1" />
          {selectedCount > 0 && (
            <Button onClick={negativar} variant="destructive" size="sm" className="gap-2">
              <ShieldOff className="size-4" />
              Negativar {selectedCount} ({formatCurrency(selectedSpend)})
            </Button>
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left border-b border-border">
              <th className="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  className="size-4 rounded accent-[var(--ddg-orange)]"
                  checked={selectedCount === terms.length && terms.length > 0}
                  onChange={(e) => toggleAll(e.target.checked)}
                />
              </th>
              <th className="px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">
                Termo de pesquisa
              </th>
              <th className="px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">
                Campanha
              </th>
              <th className="px-4 py-3 text-right text-xs uppercase tracking-wider text-muted-foreground">
                Gasto
              </th>
              <th className="px-4 py-3 text-right text-xs uppercase tracking-wider text-muted-foreground">
                Cliques
              </th>
              <th className="px-4 py-3 text-right text-xs uppercase tracking-wider text-muted-foreground">
                CTR
              </th>
              <th className="px-4 py-3 text-right text-xs uppercase tracking-wider text-muted-foreground">
                Conv.
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((t) => (
              <tr
                key={t.id}
                className={cn(
                  "hover:bg-accent/30 cursor-pointer transition-colors",
                  t.selecionada && "bg-[var(--ddg-orange)]/5"
                )}
                onClick={() => toggle(t.id)}
              >
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={t.selecionada}
                    onChange={() => toggle(t.id)}
                    className="size-4 rounded accent-[var(--ddg-orange)]"
                  />
                </td>
                <td className="px-4 py-3 font-medium">{t.termo}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {t.campanha}
                </td>
                <td className="px-4 py-3 text-right tabular-nums font-medium">
                  {formatCurrency(t.gasto)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{t.cliques}</td>
                <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                  {t.ctr.toFixed(2)}%
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {t.conversoes === 0 ? (
                    <span className="text-red-400 font-medium">0</span>
                  ) : (
                    t.conversoes
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
