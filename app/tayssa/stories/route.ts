import { NextResponse } from "next/server";
import { publicUrl, ROUTES } from "@/lib/tayssa/config";
import { enderecoDoAtalho } from "@/lib/tayssa/analytics";

/** tayssafarias.com.br/stories: o link dos stories, com a origem marcada para o Analytics. */
export function GET() {
  return NextResponse.redirect(enderecoDoAtalho(publicUrl(ROUTES.home), "stories"), 307);
}
