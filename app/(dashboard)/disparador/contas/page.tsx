import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ContaForm } from "./conta-form";
import { ConectarFacebookButton } from "./conectar-facebook-button";

interface Conta {
  id: string;
  display_name: string;
  waba_id: string;
  phone_number_id: string;
  phone_number_display: string | null;
  tier: string;
  quality_rating: string;
  ativo: boolean;
  ultima_sync_meta: string | null;
}

const QUALITY_COLOR: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  GREEN: "default",
  YELLOW: "outline",
  RED: "destructive",
  UNKNOWN: "secondary",
};

export default async function ContasPage() {
  const supabase = await createClient();
  const { data: contas } = await supabase
    .schema("disparador" as never)
    .from("contas")
    .select("*")
    .order("display_name");

  const list = (contas as Conta[] | null) ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contas WABA"
        description="Conecte uma conta WhatsApp Business via Facebook OAuth. O token fica criptografado no Supabase Vault."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <Card>
          <CardHeader>
            <CardTitle>Cadastradas</CardTitle>
          </CardHeader>
          <CardContent>
            {list.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma conta ainda. Conecte uma ao lado.</p>
            ) : (
              <div className="space-y-3">
                {list.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div>
                      <div className="font-medium">{c.display_name}</div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {c.phone_number_display ?? c.phone_number_id} · WABA {c.waba_id}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{c.tier}</Badge>
                      <Badge variant={QUALITY_COLOR[c.quality_rating] ?? "secondary"}>{c.quality_rating}</Badge>
                      {!c.ativo && <Badge variant="destructive">inativa</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conectar conta</CardTitle>
              <CardDescription>
                Clique abaixo, faça login no Facebook, escolha a BM e o número. Os IDs ficam capturados automaticamente.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ConectarFacebookButton />
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">ou cadastro manual</span>
                </div>
              </div>
              <ContaForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
