import { NextRequest, NextResponse } from "next/server";
import { trocarCodeGoogle } from "@/lib/actions/oauth-google";
import { createClient } from "@/lib/supabase/server";
import { renderPopupResponse } from "@/lib/oauth-popup-response";

/**
 * Callback do OAuth Google.
 * Google redireciona pra cá com ?code=... &state=cliente_id.origem.modo.nonce
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");

  const partes = state?.split(".") ?? [];
  const modoFromState =
    partes.length === 4 && (partes[2] === "popup" || partes[2] === "redirect")
      ? partes[2]
      : "redirect";

  if (error) {
    const msg = errorDescription ?? error;
    if (modoFromState === "popup") {
      return renderPopupResponse({
        ok: false,
        provider: "google",
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
        provider: "google",
        error: "Parâmetros inválidos",
        origin: url.origin,
      });
    }
    return NextResponse.redirect(
      new URL("/clientes?oauth_error=Parâmetros inválidos", url.origin)
    );
  }

  const result = await trocarCodeGoogle({ code, state });

  if (!result.ok) {
    if (modoFromState === "popup") {
      return renderPopupResponse({
        ok: false,
        provider: "google",
        error: result.error ?? "Erro Google OAuth",
        origin: url.origin,
      });
    }
    return NextResponse.redirect(
      new URL(
        `/clientes?oauth_error=${encodeURIComponent(result.error ?? "Erro Google OAuth")}`,
        url.origin
      )
    );
  }

  const clienteId = result.clienteId!;
  const origem = result.origem ?? "configuracoes";
  const modo = result.modo ?? modoFromState;

  if (modo === "popup") {
    return renderPopupResponse({
      ok: true,
      provider: "google",
      clienteId,
      origin: url.origin,
    });
  }

  if (origem === "wizard") {
    return NextResponse.redirect(
      new URL(
        `/clientes?wizard=resume&clienteId=${clienteId}&google_ok=1`,
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
      new URL(`/clientes/${cliente.slug}?google_ok=1`, url.origin)
    );
  }

  return NextResponse.redirect(new URL("/clientes?google_ok=1", url.origin));
}
