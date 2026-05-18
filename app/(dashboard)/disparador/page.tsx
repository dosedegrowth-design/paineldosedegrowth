import Link from "next/link";
import { Plus, Send, FileText, Users2, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Campanha {
  id: string;
  nome: string;
  status: string;
  total_contatos: number;
  total_enviados: number;
  total_entregues: number;
  total_falhados: number;
  criado_em: string;
}

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "secondary",
  scheduled: "outline",
  running: "default",
  paused: "outline",
  done: "default",
  cancelled: "destructive",
  error: "destructive",
};

export default async function DisparadorOverviewPage() {
  const supabase = await createClient();
  const [{ data: campanhas }, { count: contasCount }, { count: templatesCount }] = await Promise.all([
    supabase.schema("disparador" as never).from("campanhas").select("*").order("criado_em", { ascending: false }).limit(10),
    supabase.schema("disparador" as never).from("contas").select("*", { count: "exact", head: true }).eq("ativo", true),
    supabase.schema("disparador" as never).from("templates").select("*", { count: "exact", head: true }).eq("status", "APPROVED"),
  ]);

  const list = (campanhas as Campanha[] | null) ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Disparador WhatsApp"
        description="Disparos em massa via Meta Cloud API oficial. Templates aprovados + base CSV/XLSX + pacing controlado."
        actions={
          <Button asChild>
            <Link href="/disparador/campanhas/nova">
              <Plus className="mr-2 h-4 w-4" />
              Nova campanha
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Números WhatsApp</CardTitle>
            <Users2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contasCount ?? 0}</div>
            <p className="text-xs text-muted-foreground">ativas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Templates aprovados</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templatesCount ?? 0}</div>
            <p className="text-xs text-muted-foreground">prontos para disparo</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Campanhas (90d)</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{list.length}</div>
            <p className="text-xs text-muted-foreground">últimas 10 listadas abaixo</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Últimas campanhas</CardTitle>
          <CardDescription>Clique pra abrir o detalhe e acompanhar.</CardDescription>
        </CardHeader>
        <CardContent>
          {list.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertTriangle className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Nenhuma campanha ainda.</p>
              <Button asChild className="mt-4" variant="outline">
                <Link href="/disparador/campanhas/nova">Criar a primeira</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {list.map((c) => (
                <Link
                  key={c.id}
                  href={`/disparador/campanhas/${c.id}`}
                  className="flex items-center justify-between py-3 hover:bg-muted/40 px-2 rounded transition-colors"
                >
                  <div>
                    <div className="font-medium">{c.nome}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(c.criado_em).toLocaleString("pt-BR")} · {c.total_contatos} contatos
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right text-xs">
                      <div className="font-medium">{c.total_enviados}/{c.total_contatos}</div>
                      <div className="text-muted-foreground">enviados</div>
                    </div>
                    <Badge variant={STATUS_VARIANT[c.status] ?? "secondary"}>{c.status}</Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
