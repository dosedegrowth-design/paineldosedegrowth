import { NextRequest, NextResponse } from "next/server";
import { trocarCodeMeta } from "@/lib/actions/oauth-meta";
import { createClient } from "@/lib/supabase/server";

/**
 * Callback do OAuth Meta.
 * Facebook redireciona pra cá com ?code=... &state=cliente_id.hex
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");

  // Erro vindo do Facebook (usuário cancelou, etc.)
  if (error) {
    return NextResponse.redirect(
      new URL(
        `/clientes?oauth_error=${encodeURIComponent(errorDescription ?? error)}`,
        url.origin
      )
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/clientes?oauth_error=Parâmetros inválidos", url.origin)
    );
  }

  const result = await trocarCodeMeta({ code, state });

  if (!result.ok) {
    return NextResponse.redirect(
      new URL(
        `/clientes?oauth_error=${encodeURIComponent(result.error ?? "Erro")}`,
        url.origin
      )
    );
  }

  // Buscar slug do cliente pra redirecionar pra página dele
  const supabase = await createClient();
  const { data: cliente } = await supabase
    .schema("trafego_ddg")
    .from("clientes")
    .select("slug")
    .eq("id", result.clienteId!)
    .single();

  if (cliente?.slug) {
    return NextResponse.redirect(
      new URL(`/clientes/${cliente.slug}?meta_ok=1`, url.origin)
    );
  }

  return NextResponse.redirect(new URL("/clientes?meta_ok=1", url.origin));
}
