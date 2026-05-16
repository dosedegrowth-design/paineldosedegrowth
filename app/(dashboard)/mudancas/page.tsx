"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  Minus,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/dashboard/page-header";
import { useCliente } from "@/components/cliente-provider";
import {
  listarMudancas,
  type MudancaReal,
  type Veredicto,
} from "@/lib/actions/dados-campanhas";
import { cn, formatDateTime } from "@/lib/utils";

const VEREDICTO_CONFIG: Record<
  Veredicto,
  { label: string; icon: typeof CheckCircle2; color: string; badge: "success" | "danger" | "warning" | "secondary" }
> = {
  positiva: { label: "Positiva", icon: CheckCircle2, color: "text-emerald-400", badge: "success" },
  negativa: { label: "Negativa", icon: XCircle, color: "text-red-400", badge: "danger" },
  neutra: { label: "Neutra", icon: Minus, color: "text-muted-foreground", badge: "secondary" },
  aguardando: { label: "Aguardando", icon: Clock, color: "text-amber-400", badge: "warning" },
};

export default function MudancasPage() {
  const { cliente } = useCliente();
  const [mudancas, setMudancas] = useState<MudancaReal[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!cliente.id) return;
    let cancelado = false;
    setCarregando(true);
    listarMudancas(cliente.id, 50).then((data) => {
      if (cancelado) return;
      setMudancas(data);
      setCarregando(false);
    });
    return () => {
      cancelado = true;
    };
  }, [cliente.id]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Change Tracker"
        description={`${cliente.nome} · Mudanças manuais com impacto medido 7/14/21d depois`}
      />

      {carregando && (
        <Card>
          <CardContent className="p-12 text-center">
            <Loader2 className="size-6 animate-spin mx-auto text-muted-foreground" />
          </CardContent>
        </Card>
      )}

      {!carregando && mudancas.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center space-y-3">
            <Clock className="size-8 text-muted-foreground mx-auto" />
            <p className="text-base font-medium">Nenhuma mudança registrada ainda</p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Quando você editar budget, pausar campanha ou ajustar lance pelo painel,
              registramos aqui e medimos o impacto após 7, 14 e 21 dias automaticamente.
            </p>
          </CardContent>
        </Card>
      )}

      {!carregando && mudancas.length > 0 && (
        <div className="relative">
          <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />

          <div className="space-y-4">
            {mudancas.map((m, idx) => {
              const cfg = VEREDICTO_CONFIG[m.veredicto] ?? VEREDICTO_CONFIG.aguardando;
              const Icon = cfg.icon;
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.04 }}
                  className="relative pl-12"
                >
                  <div
                    className={cn(
                      "absolute left-0 top-3 size-8 rounded-full border-2 bg-background flex items-center justify-center",
                      m.veredicto === "positiva" && "border-emerald-500/40 text-emerald-400",
                      m.veredicto === "negativa" && "border-red-500/40 text-red-400",
                      m.veredicto === "neutra" && "border-border text-muted-foreground",
                      m.veredicto === "aguardando" && "border-amber-500/40 text-amber-400"
                    )}
                  >
                    <Icon className="size-4" />
                  </div>

                  <Card>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <Badge variant="outline" className="text-[10px]">
                              {m.entidade_tipo}
                            </Badge>
                            <Badge variant="outline" className="text-[10px]">
                              {m.plataforma}
                            </Badge>
                            {m.entidade_nome && (
                              <span className="font-medium text-sm">
                                {m.entidade_nome}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatDateTime(m.feita_em)}
                          </p>
                        </div>
                        <Badge variant={cfg.badge}>{cfg.label}</Badge>
                      </div>

                      <div className="flex items-center gap-3 p-3 rounded-md bg-muted/40 mb-3">
                        <span className="text-xs uppercase tracking-wider text-muted-foreground shrink-0">
                          {m.campo}
                        </span>
                        <code className="text-xs px-2 py-1 rounded bg-red-500/10 text-red-400 line-through">
                          {m.valor_antes ?? "—"}
                        </code>
                        <ArrowRight className="size-3 text-muted-foreground shrink-0" />
                        <code className="text-xs px-2 py-1 rounded bg-emerald-500/10 text-emerald-400">
                          {m.valor_depois ?? "—"}
                        </code>
                      </div>

                      {m.narrativa_ia && (
                        <div className="rounded-md border border-border bg-card/50 p-3">
                          <div className="flex items-start gap-2">
                            <Sparkles className="size-3.5 text-[var(--ddg-orange)] mt-0.5 shrink-0" />
                            <div className="flex-1">
                              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                                Análise IA
                              </p>
                              <p className="text-xs leading-relaxed">{m.narrativa_ia}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
