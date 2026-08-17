import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { SyncInsightsButton } from "./sync-insights-button";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Row {
  waba_id: string;
  phone_number_display: string | null;
  conta_display_name: string | null;
  periodo: string;
  enviadas: number;
  entregues: number;
  volume_cobravel: number;
  custo_estimado_brl: number;
}

interface Agg {
  waba_id: string;
  nome: string;
  telefone: string | null;
  enviadas: number;
  entregues: number;
  volume: number;
  custo: number;
  de: string;
  ate: string;
}

function brl(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function dt(d: string) {
  const [y, m, dd] = d.split("-");
  return `${dd}/${m}/${y.slice(2)}`;
}

export default async function InsightsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .schema("disparador" as never)
    .from("insights_numero")
    .select("*")
    .order("periodo", { ascending: false });
  const rows = (data as Row[] | null) ?? [];

  const map = new Map<string, Agg>();
  for (const r of rows) {
    const cur = map.get(r.waba_id) ?? {
      waba_id: r.waba_id,
      nome: r.conta_display_name ?? "—",
      telefone: r.phone_number_display,
      enviadas: 0, entregues: 0, volume: 0, custo: 0,
      de: r.periodo, ate: r.periodo,
    };
    cur.enviadas += r.enviadas;
    cur.entregues += r.entregues;
    cur.volume += r.volume_cobravel;
    cur.custo += Number(r.custo_estimado_brl);
    if (r.periodo < cur.de) cur.de = r.periodo;
    if (r.periodo > cur.ate) cur.ate = r.periodo;
    map.set(r.waba_id, cur);
  }
  const numeros = [...map.values()].sort((a, b) => b.enviadas - a.enviadas);
  const totalCusto = numeros.reduce((s, n) => s + n.custo, 0);
  const totalEnv = numeros.reduce((s, n) => s + n.enviadas, 0);
  const totalEntr = numeros.reduce((s, n) => s + n.entregues, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Insights (Meta)"
        description="Enviadas, entregues e custo REAIS puxados da Meta por número. Reconcilia com o painel."
        actions={<SyncInsightsButton />}
      />

      {numeros.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Nenhum insight ainda. Clique em <strong>Atualizar da Meta</strong> pra puxar os dados dos números ativos.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card><CardContent className="py-4">
              <div className="text-xs text-muted-foreground">Enviadas (Meta)</div>
              <div className="text-2xl font-bold tabular-nums">{totalEnv.toLocaleString("pt-BR")}</div>
            </CardContent></Card>
            <Card><CardContent className="py-4">
              <div className="text-xs text-muted-foreground">Entregues (Meta)</div>
              <div className="text-2xl font-bold tabular-nums text-primary">{totalEntr.toLocaleString("pt-BR")}</div>
            </CardContent></Card>
            <Card><CardContent className="py-4">
              <div className="text-xs text-muted-foreground">Custo estimado</div>
              <div className="text-2xl font-bold tabular-nums">{brl(totalCusto)}</div>
            </CardContent></Card>
          </div>

          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="p-3 font-medium">Número</th>
                    <th className="p-3 font-medium text-right">Enviadas</th>
                    <th className="p-3 font-medium text-right">Entregues</th>
                    <th className="p-3 font-medium text-right">Entrega %</th>
                    <th className="p-3 font-medium text-right">Custo est.</th>
                    <th className="p-3 font-medium text-right">Período</th>
                  </tr>
                </thead>
                <tbody>
                  {numeros.map((n) => {
                    const taxa = n.enviadas > 0 ? ((n.entregues / n.enviadas) * 100).toFixed(1) : "—";
                    return (
                      <tr key={n.waba_id} className="border-b border-border/50">
                        <td className="p-3">
                          <div className="font-medium">{n.nome}</div>
                          <div className="text-xs text-muted-foreground font-mono">{n.telefone ?? n.waba_id}</div>
                        </td>
                        <td className="p-3 text-right tabular-nums">{n.enviadas.toLocaleString("pt-BR")}</td>
                        <td className="p-3 text-right tabular-nums">{n.entregues.toLocaleString("pt-BR")}</td>
                        <td className="p-3 text-right tabular-nums">{taxa}%</td>
                        <td className="p-3 text-right tabular-nums">{brl(n.custo)}</td>
                        <td className="p-3 text-right text-xs text-muted-foreground whitespace-nowrap">{dt(n.de)} a {dt(n.ate)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground">
            Custo é estimado (volume cobrável × tarifa), porque a Meta não expõe o valor via API pra contas cobradas por parceiro. Ajuste a tarifa na edge function se precisar bater exato com a fatura.
          </p>
        </>
      )}
    </div>
  );
}
