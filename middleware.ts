import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

type CookieSet = { name: string; value: string; options?: CookieOptions };

const TAYSSA_SESSION_COOKIE = "tayssa_vip_session";

/**
 * Primeira barreira da área privada da Tayssa: sem cookie de sessão, nem
 * chega a renderizar. A verificação de verdade (sessão válida, papel,
 * conta ativa) acontece no servidor, em lib/tayssa/auth/guards.ts.
 *
 * `appPath` é sempre o caminho interno (/tayssa/...); `stripPrefix` é true
 * no subdomínio, onde a URL que a pessoa vê não tem o prefixo.
 */
function tayssaGuard(
  request: NextRequest,
  appPath: string,
  stripPrefix: boolean
): NextResponse | null {
  const isPrivate = appPath.startsWith("/tayssa/vip") || appPath.startsWith("/tayssa/admin");
  if (!isPrivate) return null;
  if (request.cookies.get(TAYSSA_SESSION_COOKIE)?.value) return null;
  const url = request.nextUrl.clone();
  url.pathname = stripPrefix ? "/entrar" : "/tayssa/entrar";
  url.search = "";
  return NextResponse.redirect(url);
}

/**
 * Middleware de auth.
 * Skeleton — quando Supabase Auth estiver configurado em produção,
 * descomentar a verificação de sessão.
 */
export async function middleware(request: NextRequest) {
  // Subdomínio da Tayssa (tayssa.dosedegrowth.com): todo caminho vira
  // /tayssa/<caminho> — a experiência inteira (pública, VIP e admin) vive
  // em app/tayssa. Links internos continuam com o prefixo /tayssa, que
  // também funciona no subdomínio.
  const host = request.headers.get("host") ?? "";
  const { pathname } = request.nextUrl;
  if (host.startsWith("tayssa.")) {
    if (pathname === "/favicon.ico") {
      const url = request.nextUrl.clone();
      url.pathname = "/tayssa/favicon.svg";
      return NextResponse.rewrite(url);
    }
    // No subdomínio a URL é limpa (/vip), mas quem já chegar com /tayssa/vip
    // também funciona — os dois caminhos levam ao mesmo lugar.
    const alreadyPrefixed = pathname === "/tayssa" || pathname.startsWith("/tayssa/");
    const internal = pathname.startsWith("/_next") || pathname.startsWith("/api");
    if (!internal) {
      const appPath = alreadyPrefixed
        ? pathname
        : pathname === "/"
          ? "/tayssa"
          : `/tayssa${pathname}`;
      const guard = tayssaGuard(request, appPath, !alreadyPrefixed);
      if (guard) return guard;
      if (!alreadyPrefixed) {
        const url = request.nextUrl.clone();
        url.pathname = appPath;
        return NextResponse.rewrite(url);
      }
    }
  }
  // Domínio do painel: mesma barreira, com o prefixo /tayssa na URL
  const guarded = tayssaGuard(request, pathname, false);
  if (guarded) return guarded;

  // LP da Carolina Kühn: raiz mostra a LP tanto no subdomínio carol.*
  // quanto no domínio próprio dela (carol*/daybycarol* — ex.:
  // carolinakuhn.com.br, com ou sem www)
  const bareHost = host.replace(/^www\./, "").toLowerCase();
  const hostCarol =
    bareHost.startsWith("carol") || bareHost.startsWith("daybycarol");
  if (hostCarol && request.nextUrl.pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/carol";
    return NextResponse.rewrite(url);
  }
  // No domínio dela, /favicon.ico (que o root layout e os navegadores
  // pedem direto) vira o ícone da Carol, não o do painel
  if (hostCarol && request.nextUrl.pathname === "/favicon.ico") {
    const url = request.nextUrl.clone();
    url.pathname = "/carol/favicon.ico";
    return NextResponse.rewrite(url);
  }

  // Skip auth pra rotas públicas
  const publicPaths = [
    "/login",
    "/_next",
    "/brand",
    "/favicon.ico",
    // Landing pública do André Ar Condicionado
    "/andre",
    // Relatórios públicos compartilháveis (HTML estático em public/relatorios)
    "/relatorios",
    // Apostilas públicas compartilháveis (HTML + PDF estáticos em public/apostilas)
    "/apostilas",
    // Páginas legais públicas (Meta + LGPD)
    "/privacidade",
    "/termos",
    "/excluir-dados",
    // LP pública da Tayssa (verificação de anunciante/BM Meta)
    "/tayssa",
    // LP pública da Carolina Kühn (portfólio UGC)
    "/carol",
    // Página avulsa "cadê o link" (zoeira, sem destino)
    "/cade",
    // Simulador de benefício (protótipo 100% no navegador, marca fictícia)
    "/simulador",
    // Webhook receiver
    "/api/webhooks",
    // OAuth callback
    "/api/oauth",
    // Facebook Data Deletion callback
    "/api/data-deletion",
    // Sync endpoints (autenticados via Bearer token internamente)
    "/api/sync",
    // Disparador endpoints chamados pelo n8n (auth via X-Dispatcher-Secret header)
    "/api/dispatcher/send",
    "/api/dispatcher/pending",
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
     * - public assets
     * (favicon.ico passa pelo middleware de propósito: no domínio da
     *  Carol ele é reescrito pro ícone dela — está em publicPaths)
     */
    "/((?!_next/static|_next/image|brand|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
