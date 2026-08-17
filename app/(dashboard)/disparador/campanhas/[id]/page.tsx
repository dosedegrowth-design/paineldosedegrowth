import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CampanhaActions } from "./campanha-actions";
import { CampanhaResumo } from "./campanha-resumo";
import { EnviosTable } from "./envios-table";

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
  paused_reason: string | null;
  started_at: string | null;
  finished_at: string | null;
  criado_em: string;
  conta: { display_name: string; phone_number_display: string | null } | null;
  template: { name: string; language: string } | null;
}

export default async function CampanhaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .schema("disparador" as never)
    .from("campanhas")
    .select(`*, conta:contas(display_name, phone_number_display), template:templates(name, language)`)
    .eq("id", id)
    .single();

  if (!data) notFound();
  const c = data as Campanha;

  // Contagem REAL por status (vinda dos envios, não do campo agregado).
  // Ciclo: pending -> sent (aceito/wamid) -> delivered -> read | failed (+motivo)
  async function contar(status: string) {
    const { count } = await supabase
      .schema("disparador" as never)
      .from("envios")
      .select("id", { count: "exact", head: true })
      .eq("campanha_id", id)
      .eq("status", status);
    return count ?? 0;
  }
  const [pendentes, aceitos, entregues, lidos, falhados] = await Promise.all([
    contar("pending"),
    contar("sent"), // aceito pela Meta, aguardando confirmação de entrega
    contar("delivered"),
    contar("read"),
    contar("failed"),
  ]);
  const entreguesTotal = entregues + lidos;
  // "Enviados" = tudo que a Meta aceitou (tem wamid): sent + delivered + read
  const enviadosTotal = aceitos + entreguesTotal;

  const progress = c.total_contatos > 0 ? (enviadosTotal / c.total_contatos) * 100 : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={c.nome}
        description={`${c.conta?.display_name} · template ${c.template?.name} · ${c.pacing_per_sec} msg/s`}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant={STATUS_VARIANT[c.status] ?? "secondary"}>{c.status}</Badge>
            <CampanhaActions
              campanha={c}
              pendentes={pendentes}
              falhados={falhados}
            />
          </div>
        }
      />

      {c.paused_reason && (
        <Card className="border-yellow-500/40 bg-yellow-500/5">
          <CardContent className="py-3 text-sm">
            <strong>Pausada:</strong> {c.paused_reason}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-5">
        <StatCard label="Total" value={c.total_contatos} />
        <StatCard label="Enviados" value={enviadosTotal} accent="primary" />
        <StatCard label="Entregues" value={entreguesTotal} />
        <StatCard label="Falhas" value={falhados} accent={falhados > 0 ? "destructive" : undefined} />
        <StatCard label="Pendentes" value={pendentes} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Progresso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
              <div className="bg-primary h-full transition-all" style={{ width: `${Math.min(100, progress)}%` }} />
            </div>
            <span className="text-sm font-medium tabular-nums">{progress.toFixed(1)}%</span>
          </div>
        </CardContent>
      </Card>

      <CampanhaResumo
        nome={c.nome}
        conta={c.conta?.display_name ?? null}
        telefone={c.conta?.phone_number_display ?? null}
        template={c.template?.name ?? null}
        total={c.total_contatos}
        enviados={enviadosTotal}
        entregues={entreguesTotal}
        falhados={falhados}
        pendentes={pendentes}
        status={c.status}
        startedAt={c.started_at}
        finishedAt={c.finished_at}
      />

      <EnviosTable campanhaId={c.id} />
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: "primary" | "destructive" }) {
  const color = accent === "primary" ? "text-primary" : accent === "destructive" ? "text-destructive" : "";
  return (
    <Card>
      <CardContent className="py-4">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className={`text-2xl font-bold tabular-nums ${color}`}>{value.toLocaleString("pt-BR")}</div>
      </CardContent>
    </Card>
  );
}
