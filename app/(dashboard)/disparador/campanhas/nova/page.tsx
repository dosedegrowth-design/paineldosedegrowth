import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/dashboard/page-header";
import { NovaCampanhaWizard } from "./wizard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function NovaCampanhaPage() {
  const supabase = await createClient();
  const { data: contas } = await supabase
    .schema("disparador" as never)
    .from("contas")
    .select("id, waba_id, display_name, phone_number_display, tier, quality_rating")
    .eq("ativo", true)
    .order("display_name");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nova campanha"
        description="Wizard de 5 passos: número → template → upload → mapeamento → revisar."
      />
      <NovaCampanhaWizard
        contas={
          (contas as Array<{
            id: string;
            waba_id: string;
            display_name: string;
            phone_number_display: string | null;
            tier: string;
            quality_rating: string;
          }> | null) ?? []
        }
      />
    </div>
  );
}
