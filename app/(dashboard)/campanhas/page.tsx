"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpDown,
  Pause,
  Play,
  Pencil,
  ExternalLink,
  Filter,
  Download,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { PageHeader } from "@/components/dashboard/page-header";
import { PlatformBadge } from "@/components/dashboard/platform-badge";
import { CAMPANHAS, type Campanha } from "@/lib/mock-data";
import { cn, formatCurrency, formatNumber, formatPercent } from "@/lib/utils";
import { toast } from "sonner";

type SortKey = keyof Pick<
  Campanha,
  "investimento" | "conversoes" | "cpa" | "roas" | "ctr" | "receita" | "cliques" | "impressoes"
>;
type SortDir = "asc" | "desc";

export default function CampanhasPage() {
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState<"all" | "google" | "meta">("all");
  const [status, setStatus] = useState<"all" | "active" | "paused">("all");
  const [sortKey, setSortKey] = useState<SortKey>("roas");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [campanhas, setCampanhas] = useState(CAMPANHAS);

  const data = useMemo(() => {
    let result = campanhas;
    if (search)
      result = result.filter((c) =>
        c.campanha_nome.toLowerCase().includes(search.toLowerCase())
      );
    if (platform !== "all")
      result = result.filter((c) => c.plataforma === platform);
    if (status !== "all") result = result.filter((c) => c.status === status);
    return [...result].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      return sortDir === "asc" ? av - bv : bv - av;
    });
  }, [campanhas, search, platform, status, sortKey, sortDir]);

  const totals = useMemo(
    () => ({
      investimento: data.reduce((s, c) => s + c.investimento, 0),
      conversoes: data.reduce((s, c) => s + c.conversoes, 0),
      receita: data.reduce((s, c) => s + c.receita, 0),
      cliques: data.reduce((s, c) => s + c.cliques, 0),
      impressoes: data.reduce((s, c) => s + c.impressoes, 0),
    }),
    [data]
  );

  const cpaTotal = totals.investimento / Math.max(1, totals.conversoes);
  const roasTotal = totals.receita / Math.max(1, totals.investimento);
  const ctrTotal = (totals.cliques / Math.max(1, totals.impressoes)) * 100;

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const togglePause = (id: string) => {
    setCampanhas((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: c.status === "active" ? "paused" : "active" }
          : c
      )
    );
    const c = campanhas.find((x) => x.id === id);
    toast.success(
      c?.status === "active" ? "Campanha pausada" : "Campanha ativada",
      { description: c?.campanha_nome }
    );
  };

  // Heatmap-style coloring by metric thresholds
  const cpaClass = (v: number) =>
    v < 40 ? "text-emerald-400" : v < 70 ? "text-amber-400" : "text-red-400";
  const roasClass = (v: number) =>
    v >= 5 ? "text-emerald-400" : v >= 3 ? "text-amber-400" : "text-red-400";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campanhas"
        description="Google Ads + Meta Ads unificados"
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="size-4" />
              Exportar CSV
            </Button>
          </>
        }
      />

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Input
              placeholder="Buscar campanha..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs h-9"
            />
            <Select value={platform} onValueChange={(v) => setPlatform(v as typeof platform)}>
              <SelectTrigger className="w-[160px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas plataformas</SelectItem>
                <SelectItem value="google">Apenas Google</SelectItem>
                <SelectItem value="meta">Apenas Meta</SelectItem>
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos status</SelectItem>
                <SelectItem value="active">Ativas</SelectItem>
                <SelectItem value="paused">Pausadas</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex-1" />
            <Badge variant="outline" className="gap-1.5">
              <Filter className="size-3" />
              {data.length} campanhas
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 sticky top-0 z-10">
              <tr className="text-left border-b border-border">
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider w-10"></th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Campanha
                </th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <SortableTh
                  label="Investimento"
                  active={sortKey === "investimento"}
                  dir={sortDir}
                  onClick={() => toggleSort("investimento")}
                />
                <SortableTh
                  label="Impressões"
                  active={sortKey === "impressoes"}
                  dir={sortDir}
                  onClick={() => toggleSort("impressoes")}
                />
                <SortableTh
                  label="Cliques"
                  active={sortKey === "cliques"}
                  dir={sortDir}
                  onClick={() => toggleSort("cliques")}
                />
                <SortableTh
                  label="CTR"
                  active={sortKey === "ctr"}
                  dir={sortDir}
                  onClick={() => toggleSort("ctr")}
                />
                <SortableTh
                  label="Conv."
                  active={sortKey === "conversoes"}
                  dir={sortDir}
                  onClick={() => toggleSort("conversoes")}
                />
                <SortableTh
                  label="CPA"
                  active={sortKey === "cpa"}
                  dir={sortDir}
                  onClick={() => toggleSort("cpa")}
                />
                <SortableTh
                  label="Receita"
                  active={sortKey === "receita"}
                  dir={sortDir}
                  onClick={() => toggleSort("receita")}
                />
                <SortableTh
                  label="ROAS"
                  active={sortKey === "roas"}
                  dir={sortDir}
                  onClick={() => toggleSort("roas")}
                />
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider w-32 text-right">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <AnimatePresence mode="popLayout">
                {data.map((c) => (
                  <motion.tr
                    key={c.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      "hover:bg-accent/30 transition-colors",
                      c.status === "paused" && "opacity-60"
                    )}
                  >
                    <td className="px-4 py-3">
                      <PlatformBadge platform={c.plataforma} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium">{c.campanha_nome}</span>
                        <span className="text-xs text-muted-foreground">
                          {c.objetivo} · ID {c.campanha_id}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={c.status === "active" ? "success" : "secondary"}
                        className="text-[10px]"
                      >
                        {c.status === "active" ? "Ativa" : "Pausada"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatCurrency(c.investimento)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                      {formatNumber(c.impressoes)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                      {formatNumber(c.cliques)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatPercent(c.ctr, 2)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium">
                      {c.conversoes}
                    </td>
                    <td className={cn("px-4 py-3 text-right tabular-nums font-medium", cpaClass(c.cpa))}>
                      {formatCurrency(c.cpa)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatCurrency(c.receita)}
                    </td>
                    <td className={cn("px-4 py-3 text-right tabular-nums font-bold", roasClass(c.roas))}>
                      {c.roas.toFixed(2)}x
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-7"
                          onClick={() => togglePause(c.id)}
                          title={c.status === "active" ? "Pausar" : "Ativar"}
                        >
                          {c.status === "active" ? (
                            <Pause className="size-3.5" />
                          ) : (
                            <Play className="size-3.5" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-7"
                          title="Editar budget"
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-7"
                          title="Abrir no painel original"
                        >
                          <ExternalLink className="size-3.5" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
            {/* Footer com totais */}
            <tfoot className="bg-card border-t-2 border-[var(--ddg-orange)]/30">
              <tr className="font-medium">
                <td colSpan={3} className="px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">
                  Total ({data.length} campanhas)
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {formatCurrency(totals.investimento)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {formatNumber(totals.impressoes)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {formatNumber(totals.cliques)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {formatPercent(ctrTotal, 2)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {totals.conversoes}
                </td>
                <td className={cn("px-4 py-3 text-right tabular-nums", cpaClass(cpaTotal))}>
                  {formatCurrency(cpaTotal)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {formatCurrency(totals.receita)}
                </td>
                <td className={cn("px-4 py-3 text-right tabular-nums font-bold", roasClass(roasTotal))}>
                  {roasTotal.toFixed(2)}x
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
}

function SortableTh({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
}) {
  return (
    <th className="px-4 py-3 text-right">
      <button
        onClick={onClick}
        className={cn(
          "inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wider hover:text-foreground transition-colors",
          active ? "text-[var(--ddg-orange)]" : "text-muted-foreground"
        )}
      >
        {label}
        <ArrowUpDown
          className={cn(
            "size-3 transition-transform",
            active && dir === "asc" && "rotate-180"
          )}
        />
      </button>
    </th>
  );
}
