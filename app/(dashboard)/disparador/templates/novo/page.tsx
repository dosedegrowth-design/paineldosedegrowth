import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/dashboard/page-header";
import { NovoTemplateForm } from "./novo-template-form";

export default async function NovoTemplatePage({
  searchParams,
}: {
  searchParams: Promise<{ conta_id?: string; return_to?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: contas } = await supabase
    .schema("disparador" as never)
    .from("contas")
    .select("id, display_name, phone_number_display")
    .eq("ativo", true)
    .order("display_name");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Novo template"
        description="Template enviado pra Meta aprovar. Aprovação varia minutos a 24h. Use {{1}}, {{2}} no corpo pra variáveis."
      />
      <NovoTemplateForm
        contas={
          (contas as Array<{ id: string; display_name: string; phone_number_display: string | null }> | null) ?? []
        }
        initialContaId={params.conta_id}
        returnTo={params.return_to}
      />
    </div>
  );
}
