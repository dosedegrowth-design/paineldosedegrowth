"use client";

import { motion } from "framer-motion";
import { Sparkles, Zap, TrendingUp, ArrowRight, Pause, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/dashboard/page-header";
import { cn, formatCurrency } from "@/lib/utils";

interface Otimizacao {
  id: string;
  prioridade: "alta" | "media" | "baixa";
  tipo: "expansao" | "limpeza" | "estrutura" | "criativo";
  titulo: string;
  diagnostico: string;
  recomendacao: string;
  impacto_estimado?: string;
  acao_label?: string;
  campanha?: string;
}

const OTIMIZACOES: Otimizacao[] = [
  {
    id: "1",
    prioridade: "alta",
    tipo: "estrutura",
    titulo: "Conta sem prospecting ativo",
    diagnostico:
      "100% do orçamento Meta está em remarketing/conversão. Sem aquisição de novos públicos, a base satura em 60-90 dias.",
    recomendacao:
      "Criar campanha Advantage+ Audience com 30% do budget atual ou ABO Cold com Lookalike 1% de compradores 90d.",
    impacto_estimado: "+25% volume em 30d",
    acao_label: "Criar campanha",
  },
  {
    id: "2",
    prioridade: "alta",
    tipo: "limpeza",
    titulo: "12 keywords com Quality Score baixo",
    diagnostico:
      "Keywords com QS<5 estão consumindo R$ 1.240 nos últimos 30 dias com CPC 2x acima da média.",
    recomendacao:
      "Pausar 8 keywords irrelevantes, mover 4 para campanha dedicada com landing específica.",
    impacto_estimado: "-R$ 850/mês desperdiçado",
    acao_label: "Revisar keywords",
    campanha: "[Search] Genérico",
  },
  {
    id: "3",
    prioridade: "media",
    tipo: "criativo",
    titulo: "Criativo campeão pode escalar",
    diagnostico:
      "Ad 'Shampoo Hipoalergênico' tem CTR 3.42% (90% acima da média do adset) e CPA R$ 33,95.",
    recomendacao:
      "Replicar em 2-3 variações novas (mudar copy do hook) e aumentar 20% do budget do adset.",
    impacto_estimado: "+50 conversões/mês potencial",
    acao_label: "Sugerir variações",
  },
  {
    id: "4",
    prioridade: "media",
    tipo: "estrutura",
    titulo: "Adset em learning phase há 18 dias",
    diagnostico:
      "Lookalike 1% não saiu de learning. Volume insuficiente (12 conv/semana vs 50 ideal).",
    recomendacao:
      "Aumentar budget para R$ 200/dia OU consolidar com adset similar para acumular eventos mais rápido.",
    acao_label: "Aumentar budget",
    campanha: "Lookalike 1% - Compradores 90d",
  },
  {
    id: "5",
    prioridade: "media",
    tipo: "criativo",
    titulo: "5 ads com CTR muito baixo",
    diagnostico:
      "Ads com CTR <50% da média do adset estão prejudicando entrega.",
    recomendacao: "Pausar e substituir por variações dos top performers.",
    acao_label: "Pausar ads",
  },
  {
    id: "6",
    prioridade: "baixa",
    tipo: "expansao",
    titulo: "Considerar TikTok Ads",
    diagnostico:
      "Público da Petderma (donos de pet, 25-45) tem alta presença em TikTok com CPM 60% menor que Meta.",
    recomendacao: "Testar com R$ 1.500 inicial em campanha de tráfego para o site.",
    acao_label: "Saiba mais",
  },
  {
    id: "7",
    prioridade: "baixa",
    tipo: "limpeza",
    titulo: "Audiências sobrepostas Meta",
    diagnostico:
      "ABO Cães e Lookalike 1% têm 28% de overlap. Adsets competindo entre si.",
    recomendacao: "Excluir audiência de compradores 90d do Lookalike.",
    acao_label: "Ajustar exclusões",
  },
];

const PRIORIDADE_CONFIG = {
  alta: { label: "Alta", color: "border-red-500/30 bg-red-500/5", badge: "danger" as const },
  media: { label: "Média", color: "border-amber-500/30 bg-amber-500/5", badge: "warning" as const },
  baixa: { label: "Baixa", color: "border-blue-500/30 bg-blue-500/5", badge: "info" as const },
};

const TIPO_CONFIG = {
  expansao: { label: "Expansão", icon: TrendingUp },
  limpeza: { label: "Limpeza", icon: Pause },
  estrutura: { label: "Estrutura", icon: Plus },
  criativo: { label: "Criativo", icon: Sparkles },
};

export default function OtimizacoesPage() {
  const counts = {
    alta: OTIMIZACOES.filter((o) => o.prioridade === "alta").length,
    media: OTIMIZACOES.filter((o) => o.prioridade === "media").length,
    baixa: OTIMIZACOES.filter((o) => o.prioridade === "baixa").length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Otimizações Priorizadas"
        description="Sugestões baseadas em regras + análise contextual via Claude IA"
        actions={
          <Button variant="ddg" size="sm" className="gap-2">
            <Sparkles className="size-4" />
            Re-analisar conta
          </Button>
        }
      />

      <div className="grid grid-cols-3 gap-4">
        {(["alta", "media", "baixa"] as const).map((p) => (
          <Card key={p} className={cn(PRIORIDADE_CONFIG[p].color)}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Prioridade {PRIORIDADE_CONFIG[p].label}
                </p>
                <p className="text-2xl font-bold tabular-nums mt-0.5">
                  {counts[p]}
                </p>
              </div>
              <Zap
                className={cn(
                  "size-6",
                  p === "alta"
                    ? "text-red-400"
                    : p === "media"
                    ? "text-amber-400"
                    : "text-blue-400"
                )}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-3">
        {OTIMIZACOES.map((o, idx) => {
          const cfg = PRIORIDADE_CONFIG[o.prioridade];
          const TipoIcon = TIPO_CONFIG[o.tipo].icon;
          return (
            <motion.div
              key={o.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.04 }}
            >
              <Card className={cn(cfg.color, "border")}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="size-10 rounded-lg bg-card flex items-center justify-center shrink-0 border border-border">
                      <TipoIcon className="size-5 text-[var(--ddg-orange)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <Badge variant={cfg.badge}>{cfg.label}</Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {TIPO_CONFIG[o.tipo].label}
                        </Badge>
                        {o.campanha && (
                          <Badge variant="secondary" className="text-[10px]">
                            {o.campanha}
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold mb-1.5">{o.titulo}</h3>
                      <p className="text-xs text-muted-foreground mb-2 leading-relaxed">
                        {o.diagnostico}
                      </p>
                      <div className="flex items-start gap-2 p-3 rounded-md bg-card/50 border border-border">
                        <Sparkles className="size-3.5 text-[var(--ddg-orange)] mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">
                            Recomendação IA
                          </p>
                          <p className="text-xs leading-relaxed">
                            {o.recomendacao}
                          </p>
                          {o.impacto_estimado && (
                            <p className="text-xs text-emerald-400 mt-1.5 font-medium">
                              {o.impacto_estimado}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    {o.acao_label && (
                      <Button variant="outline" size="sm" className="shrink-0 gap-1">
                        {o.acao_label}
                        <ArrowRight className="size-3" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
