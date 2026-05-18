import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/dashboard/page-header";

export const dynamic = "force-dynamic";
export const revalidate = 0;

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SyncWabasButton } from "./sync-wabas-button";
import { ContasTable } from "./contas-table";

interface Conta {
  id: string;
  business_id: string;
  waba_id: string;
  phone_number_id: string;
  display_name: string;
  waba_name: string | null;
  phone_number_display: string | null;
  tier: string;
  quality_rating: string;
  origem: "OWNED" | "CLIENT";
  ativo: boolean;
  ultima_sync_meta: string | null;
  business: { display_name: string; meta_business_id: string } | null;
}

export default async function ContasPage() {
  const supabase = await createClient();

  const [{ data: contas }, { data: businesses }] = await Promise.all([
    supabase
      .schema("disparador" as never)
      .from("contas")
      .select("*, business:businesses(display_name, meta_business_id)")
      .order("ativo", { ascending: false })
      .order("waba_name"),
    supabase
      .schema("disparador" as never)
      .from("businesses")
      .select("id, display_name, meta_business_id, ultima_sync_meta")
      .eq("ativo", true),
  ]);

  const list = (contas as Conta[] | null) ?? [];
  const bms = (businesses as Array<{ id: string; display_name: string; meta_business_id: string; ultima_sync_meta: string | null }> | null) ?? [];

  const ativas = list.filter((c) => c.ativo);
  const inativas = list.filter((c) => !c.ativo);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Números WhatsApp"
        description="Números WhatsApp Business sincronizados automaticamente do Meta Business Manager. Ative só os que vão ser usados pra disparo."
        actions={<SyncWabasButton />}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Contas Meta conectadas</CardDescription>
            <CardTitle className="text-2xl">{bms.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground space-y-1">
              {bms.map((b) => (
                <div key={b.id} className="flex items-center justify-between">
                  <span className="font-medium">{b.display_name}</span>
                  <span className="font-mono text-[10px] opacity-60">{b.meta_business_id}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Números ativos</CardDescription>
            <CardTitle className="text-2xl text-primary">{ativas.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Aparecem no wizard de campanha</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Números disponíveis</CardDescription>
            <CardTitle className="text-2xl">{list.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{inativas.length} ocultos</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Números disponíveis</CardTitle>
          <CardDescription>
            Toggle pra ativar/ocultar. Apenas números ativos aparecem nos disparos.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ContasTable contas={list} />
        </CardContent>
      </Card>
    </div>
  );
}
