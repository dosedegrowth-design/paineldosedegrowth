import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

type CookieSet = { name: string; value: string; options?: CookieOptions };

/**
 * Middleware de auth.
 * Skeleton — quando Supabase Auth estiver configurado em produção,
 * descomentar a verificação de sessão.
 */
export async function middleware(request: NextRequest) {
  // Skip auth pra rotas públicas
  const publicPaths = [
    "/login",
    "/_next",
    "/brand",
    "/favicon.ico",
    // Páginas legais públicas (Meta + LGPD)
    "/privacidade",
    "/termos",
    "/excluir-dados",
    // Webhook receiver
    "/api/webhooks",
    // OAuth callback
    "/api/oauth",
    // Facebook Data Deletion callback
    "/api/data-deletion",
  ];
  if (publicPaths.some((p) => request.nextUrl.pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Quando Supabase estiver configurado:
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    let supabaseResponse = NextResponse.next({ request });
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet: CookieSet[]) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Se não logado, redireciona pro login
    if (!user && !request.nextUrl.pathname.startsWith("/login")) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     * - public assets
     */
    "/((?!_next/static|_next/image|favicon.ico|brand|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
