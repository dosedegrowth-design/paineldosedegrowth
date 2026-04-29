"use client";

import { useState } from "react";
import { FileText, Download, Send, Sparkles, Calendar, MessageSquare, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/dashboard/page-header";
import { CLIENTES } from "@/lib/mock-data";
import { toast } from "sonner";
import { motion } from "framer-motion";

const RELATORIOS_RECENTES = [
  { id: "r1", tipo: "PDF", periodo: "01/04 - 28/04", gerado_em: "Hoje, 09:12", enviado_para: "Petderma Marketing" },
  { id: "r2", tipo: "WhatsApp", periodo: "Semana 17", gerado_em: "21/04, 08:00", enviado_para: "+55 11 99999-9999" },
  { id: "r3", tipo: "Email", periodo: "Mês de Março", gerado_em: "01/04, 07:30", enviado_para: "marketing@petderma.com.br" },
];

export default function RelatoriosPage() {
  const [generating, setGenerating] = useState(false);
  const [tipo, setTipo] = useState("pdf");
  const [periodo, setPeriodo] = useState("7d");

  const gerar = async () => {
    setGenerating(true);
    toast.loading("Gerando relatório com IA...", { id: "rel" });
    await new Promise((r) => setTimeout(r, 2200));
    setGenerating(false);
    toast.success("Relatório gerado", {
      id: "rel",
      description: "Pronto para download ou envio.",
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Relatórios"
        description="Geração automática com narrativa IA · PDF / WhatsApp / Email"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Configurador */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Gerar novo relatório</CardTitle>
            <CardDescription>
              Personalize o tipo, período e prompt da IA
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Cliente</label>
                <Select defaultValue={CLIENTES[0]?.id}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CLIENTES.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Período</label>
                <Select value={periodo} onValueChange={setPeriodo}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ontem">Ontem</SelectItem>
                    <SelectItem value="7d">Últimos 7 dias</SelectItem>
                    <SelectItem value="14d">Últimos 14 dias</SelectItem>
                    <SelectItem value="30d">Últimos 30 dias</SelectItem>
                    <SelectItem value="mtd">Mês até a data</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Formato</label>
              <Tabs value={tipo} onValueChange={setTipo}>
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="pdf"><FileText className="size-3.5 mr-2"/>PDF</TabsTrigger>
                  <TabsTrigger value="whatsapp"><MessageSquare className="size-3.5 mr-2"/>WhatsApp</TabsTrigger>
                  <TabsTrigger value="email"><Mail className="size-3.5 mr-2"/>Email</TabsTrigger>
                </TabsList>

                <TabsContent value="pdf">
                  <Card className="bg-muted/30">
                    <CardContent className="p-4 text-xs text-muted-foreground">
                      PDF branded com cores Petderma · gráficos · narrativa IA · até 4 páginas
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="whatsapp">
                  <Card className="bg-muted/30">
                    <CardContent className="p-4 text-xs text-muted-foreground">
                      Mensagem otimizada para WPP · emojis · links curtos · enviado via Evolution
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="email">
                  <Card className="bg-muted/30">
                    <CardContent className="p-4 text-xs text-muted-foreground">
                      Email HTML responsivo · resumo executivo + dashboard inline + link p/ painel
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Prompt customizado (opcional)
              </label>
              <textarea
                rows={4}
                placeholder="Ex: focar em ROAS por campanha, comparar com semana anterior, sugerir 3 ações..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              />
              <p className="text-[10px] text-muted-foreground">
                Salvo automaticamente como prompt padrão deste cliente
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={gerar}
                disabled={generating}
                variant="ddg"
                className="flex-1 gap-2"
              >
                <Sparkles className="size-4" />
                {generating ? "Gerando..." : "Gerar com IA"}
              </Button>
              <Button variant="outline">
                <Calendar className="size-4 mr-2" />
                Agendar recorrente
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview/Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Estatísticas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Relatórios este mês</p>
              <p className="text-2xl font-bold tabular-nums">12</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Tokens consumidos (Claude)</p>
              <p className="text-2xl font-bold tabular-nums">~48k</p>
              <p className="text-[10px] text-muted-foreground">≈ R$ 1,80</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Modelo padrão</p>
              <Badge variant="ddg">Claude Haiku 4.5</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Histórico */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de relatórios</CardTitle>
          <CardDescription>Últimos relatórios gerados para Petderma</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {RELATORIOS_RECENTES.map((r, idx) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center gap-4 px-6 py-3 hover:bg-accent/30 transition-colors"
              >
                <div className="size-10 rounded-lg bg-[var(--ddg-orange)]/10 text-[var(--ddg-orange)] flex items-center justify-center">
                  {r.tipo === "PDF" && <FileText className="size-4" />}
                  {r.tipo === "WhatsApp" && <MessageSquare className="size-4" />}
                  {r.tipo === "Email" && <Mail className="size-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">
                      {r.tipo}
                    </Badge>
                    <span className="font-medium text-sm">{r.periodo}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {r.gerado_em} · enviado para {r.enviado_para}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="size-8" title="Baixar">
                    <Download className="size-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="size-8" title="Reenviar">
                    <Send className="size-3.5" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
