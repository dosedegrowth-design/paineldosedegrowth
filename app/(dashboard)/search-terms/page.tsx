"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { ShieldOff, Search, RefreshCw, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/dashboard/page-header";
import { cn, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { useCliente } from "@/components/cliente-provider";
import {
  listarSearchTerms,
  marcarSearchTermsNegativacao,
  dispararSyncGoogle,
  type SearchTermRow,
} from "@/lib/actions/dados-campanhas";

export default function SearchTermsPage() {
  const { cliente } = useCliente();
  const [search, setSearch] = useState("");
  const [terms, setTerms] = useState<SearchTermRow[]>([]);
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [carregando, setCarregando] = useState(true);
  const [sincronizando, setSincronizando] = useState(false);
  const [negativando, startNeg] = useTransition();
  const [filtro, setFiltro] = useState<"todos" | "alvo">("alvo");

  const carregar = async () => {
    if (!cliente.id) return;
    setCarregando(true);
    const data = await listarSearchTerms(cliente.id, {
      somenteAtivos: filtro === "alvo",
      alvoNegativacao: filtro === "alvo",
      limit: 500,
    });
    setTerms(data);
    setSelecionados(new Set());
    setCarregando(false);
  };

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cliente.id, filtro]);

  const filtered = useMemo(
    () =>
      terms.filter((t) =>
        t.termo.toLowerCase().includes(search.toLowerCase())
      ),
    [terms, search]
  );

  const selectedCount = selecionados.size;
  const selectedSpend = filtered
    .filter((t) => selecionados.has(t.id))
    .reduce((s, t) => s + t.gasto_total, 0);

  const toggle = (id: string) => {
    setSelecionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const toggleAll = (v: boolean) => {
    if (v) setSelecionados(new Set(filtered.map((t) => t.id)));
    else setSelecionados(new Set());
  };

  const sincronizar = async () => {
    setSincronizando(true);
    toast.info("Sincronizando Google Ads...", { id: "sync" });
    const res = await dispararSyncGoogle(cliente.id);
    if (!res.ok) {
      toast.error("Erro na sync Google", { id: "sync", description: res.error });
    } else {
      toast.success("Sync Google concluída", { id: "sync" });
      await carregar();
    }
    setSincronizando(false);
  };

  const negativar = () => {
    startNeg(async () => {
      const ids = Array.from(selecionados);
      const res = await marcarSearchTermsNegativacao(cliente.id, ids);
      if (!res.ok) {
        toast.error("Erro ao negativar", { description: res.error });
        return;
      }
      toast.success(`${res.afetados} termos marcados para negativação`, {
        description:
          "Status mudou para 'negativada_pendente'. Próxima sync Google envia via API.",
      });
      await carregar();
    });
  };

  const totalGasto = filtered.reduce((s, t) => s + t.gasto_total, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Auditoria de Search Terms"
        description={`Google Ads · ${cliente.nome} · Termos que estão acionando seus anúncios`}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={sincronizar}
            disabled={sincronizando}
            className="gap-2"
          >
            {sincronizando ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            Sync Google
          </Button>
        }
      />

      {/* Toolbar */}
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

          {/* Filtro */}
          <div className="inline-flex items-center rounded-md border border-border p-0.5 bg-card">
            <button
              onClick={() => setFiltro("alvo")}
              className={cn(
                "px-3 h-7 text-xs font-medium rounded transition-colors",
                filtro === "alvo"
                  ? "bg-[var(--ddg-orange)] text-white"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Alvos para negativar
            </button>
            <button
              onClick={() => setFiltro("todos")}
              className={cn(
                "px-3 h-7 text-xs font-medium rounded transition-colors",
                filtro === "todos"
                  ? "bg-[var(--ddg-orange)] text-white"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Todos
            </button>
          </div>

          <Badge variant="outline">{filtered.length} termos</Badge>
          {totalGasto > 0 && (
            <Badge variant="danger">Gasto total: {formatCurrency(totalGasto)}</Badge>
          )}
          <div className="flex-1" />
          {selectedCount > 0 && (
            <Button
              onClick={negativar}
              disabled={negativando}
              variant="destructive"
              size="sm"
              className="gap-2"
            >
              {negativando ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ShieldOff className="size-4" />
              )}
              Negativar {selectedCount} ({formatCurrency(selectedSpend)})
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Estado: carregando */}
      {carregando && (
        <Card>
          <CardContent className="p-12 text-center">
            <Loader2 className="size-6 animate-spin mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground mt-3">
              Carregando termos...
            </p>
          </CardContent>
        </Card>
      )}

      {/* Estado: vazio */}
      {!carregando && filtered.length === 0 && (
        <Card>
          <CardContent className="p-10 text-center space-y-3">
            <AlertCircle className="size-8 text-muted-foreground mx-auto" />
            <p className="text-base font-medium">Nenhum search term sincronizado</p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {filtro === "alvo"
                ? "Nenhum termo com alto gasto e zero conversão encontrado. Tente o filtro 'Todos' ou sincronize Google Ads."
                : "Clique em 'Sync Google' acima para puxar os search terms dos últimos 30 dias da sua conta Google Ads."}
            </p>
            <Button onClick={sincronizar} disabled={sincronizando} variant="ddg" className="gap-2">
              {sincronizando ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <RefreshCw className="size-4" />
              )}
              Sync Google Agora
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tabela */}
      {!carregando && filtered.length > 0 && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left border-b border-border">
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      className="size-4 rounded accent-[var(--ddg-orange)]"
                      checked={
                        selectedCount > 0 && selectedCount === filtered.length
                      }
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
                    Conv.
                  </th>
                  <th className="px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((t) => (
                  <tr
                    key={t.id}
                    className={cn(
                      "hover:bg-accent/30 cursor-pointer transition-colors",
                      selecionados.has(t.id) && "bg-[var(--ddg-orange)]/5",
                      t.status !== "ativo" && "opacity-60"
                    )}
                    onClick={() => t.status === "ativo" && toggle(t.id)}
                  >
                    <td
                      className="px-4 py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={selecionados.has(t.id)}
                        onChange={() => toggle(t.id)}
                        disabled={t.status !== "ativo"}
                        className="size-4 rounded accent-[var(--ddg-orange)]"
                      />
                    </td>
                    <td className="px-4 py-3 font-medium">{t.termo}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
                      {t.campanha_id ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium">
                      {formatCurrency(t.gasto_total)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {t.cliques_total}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {t.conversoes_total === 0 ? (
                        <span className="text-red-400 font-medium">0</span>
                      ) : (
                        t.conversoes_total
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {t.status === "ativo" && (
                        <Badge variant="secondary" className="text-[10px]">
                          Ativo
                        </Badge>
                      )}
                      {t.status === "negativada_pendente" && (
                        <Badge variant="warning" className="text-[10px]">
                          Pendente
                        </Badge>
                      )}
                      {t.status === "negativada" && (
                        <Badge variant="danger" className="text-[10px]">
                          Negativada
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
