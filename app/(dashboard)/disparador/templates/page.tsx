import Link from "next/link";
import { Plus, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TemplatesFilters } from "./templates-filters";

interface Template {
  id: string;
  conta_id: string;
  name: string;
  language: string;
  category: string;
  status: string;
  variables_count: number;
  rejection_reason: string | null;
  ultima_sync_meta: string | null;
  conta: { display_name: string } | null;
}

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  APPROVED: "default",
  PENDING: "outline",
  REJECTED: "destructive",
  DISABLED: "secondary",
  PAUSED: "secondary",
};

export default async function TemplatesPage({
  searchParams,
}: {
  searchParams: Promise<{ conta_id?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const { data: contas } = await supabase
    .schema("disparador" as never)
    .from("contas")
    .select("id, display_name")
    .eq("ativo", true)
    .order("display_name");

  let query = supabase
    .schema("disparador" as never)
    .from("templates")
    .select("*, conta:contas(display_name)")
    .order("name");
  if (params.conta_id) query = query.eq("conta_id", params.conta_id);

  const { data: templates } = await query;
  const list = (templates as Template[] | null) ?? [];
  const contasList = (contas as { id: string; display_name: string }[] | null) ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Templates"
        description="Templates Meta sincronizados. Aprovação leva de minutos a 24h. Só APPROVED pode ser usado em campanhas."
        actions={
          <div className="flex gap-2">
            <TemplatesFilters contas={contasList} />
            <Button asChild>
              <Link href="/disparador/templates/novo">
                <Plus className="mr-2 h-4 w-4" />
                Novo template
              </Link>
            </Button>
          </div>
        }
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {list.length} template{list.length !== 1 ? "s" : ""}
          </CardTitle>
          <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
            <RefreshCw className="h-3 w-3" />
            Sync automático diário
          </span>
        </CardHeader>
        <CardContent>
          {list.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Nenhum template ainda. Crie um ou aguarde sync com a Meta.
            </p>
          ) : (
            <div className="space-y-2">
              {list.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="min-w-0">
                    <div className="font-medium font-mono text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {t.conta?.display_name} · {t.language} · {t.category} · {t.variables_count} variável(eis)
                    </div>
                    {t.rejection_reason && (
                      <div className="text-xs text-destructive mt-1">Rejeitado: {t.rejection_reason}</div>
                    )}
                  </div>
                  <Badge variant={STATUS_VARIANT[t.status] ?? "secondary"}>{t.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
