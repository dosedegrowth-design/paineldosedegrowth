import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/dashboard/page-header";
import { NovoTemplateForm } from "./novo-template-form";

export default async function NovoTemplatePage() {
  const supabase = await createClient();
  const { data: contas } = await supabase
    .schema("disparador" as never)
    .from("contas")
    .select("id, display_name")
    .eq("ativo", true)
    .order("display_name");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Novo template"
        description="O template será enviado pra Meta aprovar. Aprovação varia de minutos a 24h. Use variáveis {{1}}, {{2}}, {{3}}... no corpo."
      />
      <NovoTemplateForm contas={(contas as { id: string; display_name: string }[] | null) ?? []} />
    </div>
  );
}
