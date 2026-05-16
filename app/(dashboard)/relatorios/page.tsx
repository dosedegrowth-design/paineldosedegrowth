"use client";

import { useEffect, useState, useTransition } from "react";
import {
  FileText,
  Send,
  Sparkles,
  Calendar,
  MessageSquare,
  Mail,
  Loader2,
  Copy,
  AlertCircle,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/dashboard/page-header";
import { useCliente } from "@/components/cliente-provider";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  listarRelatorios,
  gerarRelatorioIA,
  type RelatorioReal,
} from "@/lib/actions/relatorios";
import { formatDateTime } from "@/lib/utils";

export default function RelatoriosPage() {
  const { cliente } = useCliente();
  const [tipo, setTipo] = useState<"pdf" | "whatsapp" | "email">("whatsapp");
  const [periodo, setPeriodo] = useState("7d");
  const [promptExtra, setPromptExtra] = useState("");
  const [historico, setHistorico] = useState<RelatorioReal[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [gerando, startGerar] = useTransition();
  const [conteudoGerado, setConteudoGerado] = useState<string | null>(null);

  const carregar = async () => {
    if (!cliente.id) return;
    setCarregando(true);
    const data = await listarRelatorios(cliente.id, 20);
    setHistorico(data);
    setCarregando(false);
  };

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cliente.id]);

  const periodToDates = (p: string): { ini: string; fim: string } => {
    const fim = new Date();
    const ini = new Date();
    if (p === "ontem") ini.setDate(ini.getDate() - 1);
    else if (p === "7d") ini.setDate(ini.getDate() - 7);
    else if (p === "14d") ini.setDate(ini.getDate() - 14);
    else if (p === "30d") ini.setDate(ini.getDate() - 30);
    else if (p === "mtd") ini.setDate(1);
    return {
      ini: ini.toISOString().split("T")[0],
      fim: fim.toISOString().split("T")[0],
    };
  };

  const gerar = () => {
    startGerar(async () => {
      const { ini, fim } = periodToDates(periodo);
      toast.loading("Gerando com Claude Haiku 4.5...", { id: "rel" });
      const res = await gerarRelatorioIA({
        cliente_id: cliente.id,
        tipo,
        periodo_inicio: ini,
        periodo_fim: fim,
        prompt_extra: promptExtra || undefined,
      });
      if (!res.ok) {
        toast.error("Erro ao gerar", { id: "rel", description: res.error });
        return;
      }
      toast.success(`Relatório gerado · ${res.tokens} tokens`, { id: "rel" });
      setConteudoGerado(res.conteudo);
      await carregar();
    });
  };

  const copiar = (texto: string) => {
    navigator.clipboard.writeText(texto);
    toast.success("Copiado pra área de transferência");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Relatórios"
        description={`${cliente.nome} · Geração via Claude Haiku 4.5`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Configurador */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Gerar novo relatório</CardTitle>
            <CardDescription>
              Personalize tipo, período e prompt — IA gera narrativa baseada nas
              métricas reais do banco
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground uppercase tracking-widest">
                Formato
              </label>
              <Tabs value={tipo} onValueChange={(v) => setTipo(v as typeof tipo)}>
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="whatsapp">
                    <MessageSquare className="size-3.5 mr-2" />
                    WhatsApp
                  </TabsTrigger>
                  <TabsTrigger value="email">
                    <Mail className="size-3.5 mr-2" />
                    Email
                  </TabsTrigger>
                  <TabsTrigger value="pdf">
                    <FileText className="size-3.5 mr-2" />
                    PDF
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground uppercase tracking-widest">
                Período
              </label>
              <Select value={periodo} onValueChange={setPeriodo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ontem">Ontem</SelectItem>
                  <SelectItem value="7d">Últimos 7 dias</SelectItem>
                  <SelectItem value="14d">Últimos 14 dias</SelectItem>
                  <SelectItem value="30d">Últimos 30 dias</SelectItem>
                  <SelectItem value="mtd">Mês até agora</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground uppercase tracking-widest">
                Instruções extras (opcional)
              </label>
              <textarea
                rows={3}
                value={promptExtra}
                onChange={(e) => setPromptExtra(e.target.value)}
                placeholder="Ex: focar em campanhas de remarketing, sugerir 3 ações, comparar com semana anterior..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              />
            </div>

            <Button
              onClick={gerar}
              disabled={gerando}
              variant="ddg"
              className="w-full gap-2"
            >
              {gerando ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              {gerando ? "Gerando..." : "Gerar com IA"}
            </Button>

            {/* Preview do conteúdo */}
            {conteudoGerado && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="rounded-md border border-[var(--ddg-orange)]/30 bg-[var(--ddg-orange)]/5 p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs uppercase tracking-widest text-[var(--ddg-orange)] font-bold">
                    Conteúdo gerado
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copiar(conteudoGerado)}
                    className="gap-2 h-7"
                  >
                    <Copy className="size-3" />
                    Copiar
                  </Button>
                </div>
                <pre className="text-xs whitespace-pre-wrap font-sans leading-relaxed">
                  {conteudoGerado}
                </pre>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sobre a IA</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Modelo</p>
              <Badge variant="ddg">Claude Haiku 4.5</Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Custo médio</p>
              <p className="text-sm font-medium">~R$ 0,01 por relatório</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Histórico</p>
              <p className="text-2xl font-bold tabular-nums">{historico.length}</p>
              <p className="text-[10px] text-muted-foreground">relatórios gerados</p>
            </div>
            {historico.length > 0 && (
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground mb-0.5">Total tokens</p>
                <p className="text-sm font-medium tabular-nums">
                  {historico
                    .reduce((s, r) => s + (r.tokens_usados ?? 0), 0)
                    .toLocaleString("pt-BR")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Histórico */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de relatórios</CardTitle>
          <CardDescription>
            Últimos relatórios gerados para {cliente.nome}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {carregando && (
            <div className="p-8 text-center">
              <Loader2 className="size-6 animate-spin mx-auto text-muted-foreground" />
            </div>
          )}

          {!carregando && historico.length === 0 && (
            <div className="p-12 text-center space-y-2">
              <AlertCircle className="size-8 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">
                Nenhum relatório gerado ainda.
              </p>
            </div>
          )}

          {!carregando && historico.length > 0 && (
            <div className="divide-y divide-border">
              {historico.map((r, idx) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.04 }}
                  className="p-4 hover:bg-accent/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="size-10 rounded-lg bg-[var(--ddg-orange)]/10 text-[var(--ddg-orange)] flex items-center justify-center shrink-0">
                      {r.tipo === "pdf" && <FileText className="size-4" />}
                      {r.tipo === "whatsapp" && <MessageSquare className="size-4" />}
                      {r.tipo === "email" && <Mail className="size-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant="outline" className="text-[10px]">
                          {r.tipo}
                        </Badge>
                        <span className="font-medium text-sm">
                          {r.periodo_inicio} → {r.periodo_fim}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(r.gerado_em)}
                        </span>
                        {r.tokens_usados && (
                          <Badge variant="secondary" className="text-[10px]">
                            {r.tokens_usados} tokens
                          </Badge>
                        )}
                      </div>
                      {r.conteudo && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {r.conteudo.slice(0, 200)}...
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8"
                        onClick={() => r.conteudo && copiar(r.conteudo)}
                        title="Copiar"
                      >
                        <Copy className="size-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8"
                        title="Reenviar (em breve)"
                      >
                        <Send className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
