import { NextRequest, NextResponse } from "next/server";
import { trocarCodeShopify } from "@/lib/actions/oauth-shopify";
import { createClient } from "@/lib/supabase/server";
import { renderPopupResponse } from "@/lib/oauth-popup-response";

/**
 * Callback do OAuth Shopify.
 * Shopify redireciona pra cá com:
 *   ?code=...&state=cliente_id.origem.modo.nonce&shop=xxx.myshopify.com&hmac=...&timestamp=...
 *
 * Mesmo padrão de popup/redirect do Meta.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const shop = url.searchParams.get("shop");
  const hmac = url.searchParams.get("hmac");
  const error = url.searchParams.get("error");

  const partes = state?.split(".") ?? [];
  const modoFromState =
    partes.length === 4 && (partes[2] === "popup" || partes[2] === "redirect")
      ? partes[2]
      : "redirect";

  if (error) {
    if (modoFromState === "popup") {
      return renderPopupResponse({
        ok: false,
        provider: "shopify",
        error,
        origin: url.origin,
      });
    }
    return NextResponse.redirect(
      new URL(`/clientes?oauth_error=${encodeURIComponent(error)}`, url.origin)
    );
  }

  if (!code || !state || !shop || !hmac) {
    const msg = "Parâmetros inválidos (faltou code/state/shop/hmac)";
    if (modoFromState === "popup") {
      return renderPopupResponse({
        ok: false,
        provider: "shopify",
        error: msg,
        origin: url.origin,
      });
    }
    return NextResponse.redirect(
      new URL(`/clientes?oauth_error=${encodeURIComponent(msg)}`, url.origin)
    );
  }

  const result = await trocarCodeShopify({
    code,
    state,
    shop,
    hmac,
    rawUrl: req.url,
  });

  if (!result.ok) {
    if (modoFromState === "popup") {
      return renderPopupResponse({
        ok: false,
        provider: "shopify",
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

  if (modo === "popup") {
    return renderPopupResponse({
      ok: true,
      provider: "shopify",
      clienteId,
      origin: url.origin,
    });
  }

  if (origem === "wizard") {
    return NextResponse.redirect(
      new URL(
        `/clientes?wizard=resume&clienteId=${clienteId}&shopify_ok=1`,
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
      new URL(`/clientes/${cliente.slug}?shopify_ok=1`, url.origin)
    );
  }

  return NextResponse.redirect(new URL("/clientes?shopify_ok=1", url.origin));
}
