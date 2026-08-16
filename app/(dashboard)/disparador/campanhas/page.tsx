import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "secondary",
  scheduled: "outline",
  running: "default",
  paused: "outline",
  done: "default",
  cancelled: "destructive",
  error: "destructive",
};

interface Campanha {
  id: string;
  nome: string;
  status: string;
  total_contatos: number;
  total_enviados: number;
  total_entregues: number;
  total_lidos: number;
  total_falhados: number;
  pacing_per_sec: number;
  custo_estimado_brl: number | null;
  criado_em: string;
  conta: { display_name: string } | null;
  template: { name: string } | null;
}

export default async function CampanhasPage() {
  const supabase = await createClient();
  const { data: campanhas } = await supabase
    .schema("disparador" as never)
    .from("campanhas")
    .select(`*, conta:contas(display_name), template:templates(name)`)
    .order("criado_em", { ascending: false })
    .limit(200);

  const list = (campanhas as Campanha[] | null) ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campanhas"
        description="Disparos criados, em andamento e concluídos."
        actions={
          <Button asChild>
            <Link href="/disparador/campanhas/nova">
              <Plus className="mr-2 h-4 w-4" />
              Nova campanha
            </Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="p-0">
          {list.length === 0 ? (
            <p className="text-sm text-muted-foreground py-12 text-center">Nenhuma campanha ainda.</p>
          ) : (
            <div className="divide-y divide-border">
              {list.map((c) => {
                const progress = c.total_contatos > 0 ? (c.total_enviados / c.total_contatos) * 100 : 0;
                return (
                  <Link
                    key={c.id}
                    href={`/disparador/campanhas/${c.id}`}
                    className="block p-4 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="min-w-0">
                        <div className="font-medium truncate">{c.nome}</div>
                        <div className="text-xs text-muted-foreground">
                          {c.conta?.display_name} · template <span className="font-mono">{c.template?.name}</span> · {c.pacing_per_sec} msg/s
                        </div>
                      </div>
                      <Badge variant={STATUS_VARIANT[c.status] ?? "secondary"}>{c.status}</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-primary h-full transition-all"
                          style={{ width: `${Math.min(100, progress)}%` }}
                        />
                      </div>
                      <span className="text-muted-foreground tabular-nums whitespace-nowrap">
                        {c.total_enviados}/{c.total_contatos} · {c.total_falhados} falhas
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
