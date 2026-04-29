import { NextRequest, NextResponse } from "next/server";
import { trocarCodeMeta } from "@/lib/actions/oauth-meta";
import { createClient } from "@/lib/supabase/server";
import { renderPopupResponse } from "@/lib/oauth-popup-response";

/**
 * Callback do OAuth Meta.
 * Facebook redireciona pra cá com ?code=... &state=cliente_id.origem.modo.nonce
 *
 * Modo decide tipo de retorno:
 * - "popup"    → renderiza HTML que faz postMessage no opener e fecha
 * - "redirect" → redireciona normalmente (default/legado)
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");

  // Detecta modo a partir do state ANTES de processar
  // (state pode ser cliente_id.origem.modo.nonce ou legado)
  const partes = state?.split(".") ?? [];
  const modoFromState =
    partes.length === 4 && (partes[2] === "popup" || partes[2] === "redirect")
      ? partes[2]
      : "redirect";

  // Erro vindo do Facebook (usuário cancelou, etc.)
  if (error) {
    const msg = errorDescription ?? error;
    if (modoFromState === "popup") {
      return renderPopupResponse({
        ok: false,
        provider: "meta",
        error: msg,
        origin: url.origin,
      });
    }
    return NextResponse.redirect(
      new URL(`/clientes?oauth_error=${encodeURIComponent(msg)}`, url.origin)
    );
  }

  if (!code || !state) {
    if (modoFromState === "popup") {
      return renderPopupResponse({
        ok: false,
        provider: "meta",
        error: "Parâmetros inválidos",
        origin: url.origin,
      });
    }
    return NextResponse.redirect(
      new URL("/clientes?oauth_error=Parâmetros inválidos", url.origin)
    );
  }

  const result = await trocarCodeMeta({ code, state });

  if (!result.ok) {
    if (modoFromState === "popup") {
      return renderPopupResponse({
        ok: false,
        provider: "meta",
        error: result.error ?? "Erro",
        origin: url.origin,
      });
    }
    return NextResponse.redirect(
      new URL(
        `/clientes?oauth_error=${encodeURIComponent(result.error ?? "Erro")}`,
        url.origin
      )
    );
  }

  const clienteId = result.clienteId!;
  const origem = result.origem ?? "configuracoes";
  const modo = result.modo ?? modoFromState;

  // Modo popup: renderiza HTML que faz postMessage e fecha popup
  if (modo === "popup") {
    return renderPopupResponse({
      ok: true,
      provider: "meta",
      clienteId,
      origin: url.origin,
    });
  }

  // Modo redirect (legado): comportamento anterior
  if (origem === "wizard") {
    return NextResponse.redirect(
      new URL(
        `/clientes?wizard=resume&clienteId=${clienteId}&meta_ok=1`,
        url.origin
      )
    );
  }

  const supabase = await createClient();
  const { data: cliente } = await supabase
    .schema("trafego_ddg")
    .from("clientes")
    .select("slug")
    .eq("id", clienteId)
    .single();

  if (cliente?.slug) {
    return NextResponse.redirect(
      new URL(`/clientes/${cliente.slug}?meta_ok=1`, url.origin)
    );
  }

  return NextResponse.redirect(new URL("/clientes?meta_ok=1", url.origin));
}
