import { NextRequest, NextResponse } from "next/server";
import { trocarCodeGoogle } from "@/lib/actions/oauth-google";
import { createClient } from "@/lib/supabase/server";

/**
 * Callback do OAuth Google.
 * Google redireciona pra cá com ?code=... &state=cliente_id.origem.nonce
 *
 * Origem decide pra onde redireciona:
 * - "wizard"        → /clientes?wizard=resume&clienteId=X&google_ok=1
 * - "configuracoes" → /clientes/[slug]?google_ok=1
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");

  // Erro vindo do Google (usuário cancelou, escopo negado, etc.)
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

  const result = await trocarCodeGoogle({ code, state });

  if (!result.ok) {
    return NextResponse.redirect(
      new URL(
        `/clientes?oauth_error=${encodeURIComponent(result.error ?? "Erro Google OAuth")}`,
        url.origin
      )
    );
  }

  const clienteId = result.clienteId!;
  const origem = result.origem ?? "configuracoes";

  // Wizard: volta pra /clientes?wizard=resume e passo 5 (Específico)
  if (origem === "wizard") {
    return NextResponse.redirect(
      new URL(
        `/clientes?wizard=resume&clienteId=${clienteId}&google_ok=1`,
        url.origin
      )
    );
  }

  // Configurações: volta pra página do cliente
  const supabase = await createClient();
  const { data: cliente } = await supabase
    .schema("trafego_ddg")
    .from("clientes")
    .select("slug")
    .eq("id", clienteId)
    .single();

  if (cliente?.slug) {
    return NextResponse.redirect(
      new URL(`/clientes/${cliente.slug}?google_ok=1`, url.origin)
    );
  }

  return NextResponse.redirect(new URL("/clientes?google_ok=1", url.origin));
}
