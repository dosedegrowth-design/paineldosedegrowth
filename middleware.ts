import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { ehHostDaTayssa, origemDaTayssa, semPrefixo } from "@/lib/tayssa/dominio";

type CookieSet = { name: string; value: string; options?: CookieOptions };

const TAYSSA_SESSION_COOKIE = "tayssa_vip_session";

/**
 * Domínio da Tayssa (09/11/2026): com a origem pública no domínio dela
 * (NEXT_PUBLIC_TAYSSA_ORIGIN = https://tayssafarias.com.br), o site mora na
 * raiz de lá e o /tayssa do painel leva para o mesmo endereço no domínio
 * dela. Sem a variável, nada muda: o site segue em painel.../tayssa.
 * Espelha SITE_NA_RAIZ em lib/tayssa/config.ts.
 */
const ORIGEM_DA_TAYSSA = process.env.NEXT_PUBLIC_TAYSSA_ORIGIN || "https://painel.dosedegrowth.com";
const SITE_NA_RAIZ = origemDaTayssa(ORIGEM_DA_TAYSSA);

/** a pessoa abrindo a página no navegador (não a busca do roteador, uma ação ou um arquivo) */
function ehAberturaDePagina(request: NextRequest): boolean {
  if (request.method !== "GET" && request.method !== "HEAD") return false;
  const h = request.headers;
  if (h.has("rsc") || h.has("next-action") || h.has("next-router-prefetch")) return false;
  const destino = h.get("sec-fetch-dest");
  if (destino) return destino === "document";
  return (h.get("accept") ?? "").includes("text/html");
}

/** arquivo (o último pedaço tem extensão: service worker, manifesto, vídeo): nunca muda de endereço */
const ehArquivo = (p: string) => /\.[a-z0-9]+$/i.test(p.slice(p.lastIndexOf("/") + 1));

/**
 * Endereços da conta da cliente sem "vip" (Lucas, 05/11/2026: com o VIP
 * fechado é só a área de agendamento). O apelido é reescrito para a página
 * de verdade (app/tayssa/vip/...) e o endereço antigo leva ao apelido.
 * Espelha ROUTES.vipBook / ROUTES.vipProfile em lib/tayssa/config.ts.
 */
const APELIDOS_DA_CONTA: Record<string, string> = {
  "/tayssa/meus-horarios": "/tayssa/vip/agendar",
  "/tayssa/minha-conta": "/tayssa/vip/perfil",
};
const ENDERECOS_ANTIGOS: Record<string, string> = Object.fromEntries(
  Object.entries(APELIDOS_DA_CONTA).map(([apelido, interno]) => [interno, apelido])
);
const semBarraNoFim = (p: string) => (p.length > 1 ? p.replace(/\/$/, "") : p);

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
  const isPrivate =
    appPath.startsWith("/tayssa/vip") ||
    appPath.startsWith("/tayssa/admin") ||
    semBarraNoFim(appPath) in APELIDOS_DA_CONTA;
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
  // Domínio da Tayssa (tayssafarias.com.br; o antigo tayssa.* também): todo
  // caminho vira /tayssa/<caminho> — a experiência inteira (pública, VIP e
  // admin) vive em app/tayssa. Com SITE_NA_RAIZ os links já saem sem o
  // prefixo; sem ele, os links internos levam /tayssa, que também funciona lá.
  // o host de quem pediu: numa ação que termina em redirect, o Next busca a
  // página de destino por dentro (outro pedido, com o host original só no
  // x-forwarded-host); sem isso o /admin do domínio dela caía no painel da DDG
  const host = (request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "").split(",")[0].trim();
  const { pathname } = request.nextUrl;
  // Preview do Vercel (link *.vercel.app de cada push) não tem banco: lá o
  // login falha sempre e a pessoa fica presa na tela de entrar. Quem abrir o
  // Tayssa por esse link vai para o site de verdade, no mesmo caminho.
  const comPrefixo = pathname === "/tayssa" || pathname.startsWith("/tayssa/");
  if (
    process.env.VERCEL_ENV === "preview" &&
    !(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) &&
    comPrefixo
  ) {
    const destino = new URL(
      (SITE_NA_RAIZ ? semPrefixo(pathname) : pathname) + request.nextUrl.search,
      ORIGEM_DA_TAYSSA
    );
    return NextResponse.redirect(destino);
  }
  if (ehHostDaTayssa(host)) {
    if (pathname === "/favicon.ico") {
      const url = request.nextUrl.clone();
      url.pathname = "/tayssa/favicon.svg";
      return NextResponse.rewrite(url);
    }
    // No domínio dela a URL é limpa (/vip), mas quem já chegar com /tayssa/vip
    // também chega — os dois caminhos levam ao mesmo lugar.
    const internal = pathname.startsWith("/_next") || pathname.startsWith("/api");
    if (!internal) {
      const appPath = comPrefixo ? pathname : pathname === "/" ? "/tayssa" : `/tayssa${pathname}`;
      // a URL que a pessoa vê: sem o /tayssa (com o site na raiz, sempre)
      const limpa = SITE_NA_RAIZ || !comPrefixo;
      const pagina = ehAberturaDePagina(request) && !ehArquivo(pathname);
      // endereço antigo da conta (/vip/agendar) ou, com o site na raiz, um
      // endereço com /tayssa: a página abre no endereço certo
      const antigo = ENDERECOS_ANTIGOS[semBarraNoFim(appPath)];
      if (pagina && (antigo || (SITE_NA_RAIZ && comPrefixo && !pathname.startsWith("/tayssa/api/")))) {
        const url = request.nextUrl.clone();
        const certo = antigo ?? appPath;
        url.pathname = limpa ? semPrefixo(certo) : certo;
        return NextResponse.redirect(url);
      }
      const guard = tayssaGuard(request, appPath, limpa);
      if (guard) return guard;
      const interno = APELIDOS_DA_CONTA[semBarraNoFim(appPath)] ?? appPath;
      if (interno !== pathname) {
        const url = request.nextUrl.clone();
        url.pathname = interno;
        return NextResponse.rewrite(url);
      }
      return NextResponse.next();
    }
  }
  // Com o site no domínio dela, o /tayssa do painel leva ao mesmo endereço lá
  // (links antigos do WhatsApp, favoritos). Arquivo fica: o service worker
  // dos avisos já instalado continua se atualizando daqui.
  if (SITE_NA_RAIZ && comPrefixo && !ehArquivo(pathname) && !pathname.startsWith("/tayssa/api/")) {
    const certo = ENDERECOS_ANTIGOS[semBarraNoFim(pathname)] ?? pathname;
    return NextResponse.redirect(new URL(semPrefixo(certo) + request.nextUrl.search, ORIGEM_DA_TAYSSA));
  }
  // Domínio do painel: mesma barreira, com o prefixo /tayssa na URL
  const guarded = tayssaGuard(request, pathname, false);
  if (guarded) return guarded;
  // conta da cliente: o endereço sem "vip" mostra a página de verdade, e o antigo leva a ele
  const caminho = semBarraNoFim(pathname);
  if (caminho in APELIDOS_DA_CONTA) {
    const url = request.nextUrl.clone();
    url.pathname = APELIDOS_DA_CONTA[caminho];
    return NextResponse.rewrite(url);
  }
  if (caminho in ENDERECOS_ANTIGOS) {
    const url = request.nextUrl.clone();
    url.pathname = ENDERECOS_ANTIGOS[caminho];
    return NextResponse.redirect(url);
  }

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
    // robôs de busca: sem isso o /robots.txt caía no login do painel
    "/robots.txt",
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
    // Funil de conteúdo da Lydia Magalhães (corretora) — página pública pra compartilhar
    "/lidia",
    "/lydia",
    // Estrutura de anúncios do Dr. Samuel Chagas (quiropraxia) — página pública pra compartilhar
    "/drsamuel",
    // Estrutura de anúncios da Marina Saleme — página pública pra mostrar pra cliente
    "/marina",
    // Guia do site novo da Palavra com Alma (Tray) — página pública pra mostrar pra cliente
    "/palavracomalma",
    // Página avulsa "cadê o link" (zoeira, sem destino)
    "/cade",
    // Briefing que a cliente responde pelo link (a chave ?k= é conferida na página)
    "/briefing",
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
