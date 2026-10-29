import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "lenis/dist/lenis.css";
import "./tayssa.css";
import "./flora.css";
import "./casa.css";
import "./linguagem.css";
import "./identidade.css";
import "./agendar.css";
import "./vitrine.css";
import "./centro.css";
import "./celular.css";
import { PUBLIC_ORIGIN } from "@/lib/tayssa/config";
import { SmoothScroll } from "@/components/tayssa/ui/smooth-scroll";
import { PausaForaDaTela } from "@/components/tayssa/ui/pausa-fora";
import { TransitionProvider } from "@/components/tayssa/ui/transition";
import { MovimentoDoAparelho } from "@/components/tayssa/ui/movimento";
import { EstruturaProvider } from "@/components/tayssa/ui/estrutura";

/**
 * Uma família sem serifa: a do sistema Apple; Inter nos outros aparelhos.
 * Pelo next/font a Inter vem pré-carregada com a página e com uma reserva
 * de medidas ajustadas: no Android o texto não nasce numa fonte e pula
 * para outra (era o "fica se arrumando" ao abrir no celular).
 */
const inter = localFont({
  src: [
    { path: "../../node_modules/@fontsource/inter/files/inter-latin-300-normal.woff2", weight: "300", style: "normal" },
    { path: "../../node_modules/@fontsource/inter/files/inter-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../node_modules/@fontsource/inter/files/inter-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../../node_modules/@fontsource/inter/files/inter-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../../node_modules/@fontsource/inter/files/inter-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  display: "swap",
  adjustFontFallback: "Arial",
});

const TITLE = "Tayssa Lash — Private Beauty Experience";
const DESCRIPTION =
  "Cílios e embelezamento do olhar, com uma experiência privada para clientes selecionadas: fidelidade, indicação e aniversário.";

export const metadata: Metadata = {
  metadataBase: new URL(PUBLIC_ORIGIN),
  // absolute: o título da Tayssa não herda o "· Tráfego DDG" do painel
  title: { absolute: TITLE, template: "%s · Tayssa Lash" },
  description: DESCRIPTION,
  applicationName: "Tayssa Lash",
  // com `icons` declarado, o apple-icon.tsx não entra sozinho no <head>
  icons: { icon: "/tayssa/favicon.svg", apple: "/tayssa/apple-icon" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    locale: "pt_BR",
    siteName: "Tayssa Lash",
  },
  // a imagem vem de opengraph-image.tsx; no X/Twitter, cartão grande
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#fbf7f6",
  width: "device-width",
  initialScale: 1,
};

export default function TayssaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="ty-scope" data-theme="day">
      {/* a Inter (e a reserva ajustada) num token da raiz: vale também no que
          abre em portal fora do .ty-scope, como o visor dos rolos */}
      <style href="ty-fonte" precedence="default">{`:root{--t-font-inter:${inter.style.fontFamily};}`}</style>
      <div className="ty-grain" aria-hidden />
      <SmoothScroll />
      <PausaForaDaTela />
      <MovimentoDoAparelho>
        <TransitionProvider>
          <EstruturaProvider>{children}</EstruturaProvider>
        </TransitionProvider>
      </MovimentoDoAparelho>
    </div>
  );
}
