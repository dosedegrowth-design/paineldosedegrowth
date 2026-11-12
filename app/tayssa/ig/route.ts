import { NextResponse } from "next/server";
import { publicUrl, ROUTES } from "@/lib/tayssa/config";
import { enderecoDoAtalho } from "@/lib/tayssa/analytics";

/** tayssafarias.com.br/ig: o link da bio do Instagram, com a origem marcada para o Analytics. */
export function GET() {
  return NextResponse.redirect(enderecoDoAtalho(publicUrl(ROUTES.home), "ig"), 307);
}
