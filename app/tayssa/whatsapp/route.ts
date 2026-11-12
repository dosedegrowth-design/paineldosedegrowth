import { NextResponse } from "next/server";
import { publicUrl, ROUTES } from "@/lib/tayssa/config";
import { enderecoDoAtalho } from "@/lib/tayssa/analytics";

/** tayssafarias.com.br/whatsapp: o link das conversas e do status, com a origem marcada para o Analytics. */
export function GET() {
  return NextResponse.redirect(enderecoDoAtalho(publicUrl(ROUTES.home), "whatsapp"), 307);
}
