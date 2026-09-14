import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, ROUTES } from "@/lib/config";

/**
 * Barreira de entrada: sem cookie de sessão, /vip e /admin voltam para a
 * tela de entrada. A autorização de verdade acontece de novo em cada
 * página e action (lib/auth/guards.ts) — aqui é só o desvio.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPrivate = pathname.startsWith(ROUTES.vip) || pathname.startsWith(ROUTES.admin);
  if (!isPrivate) return NextResponse.next();
  if (request.cookies.get(SESSION_COOKIE)?.value) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = ROUTES.login;
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/vip/:path*", "/admin/:path*"],
};
