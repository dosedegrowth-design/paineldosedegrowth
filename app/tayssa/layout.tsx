import type { Metadata, Viewport } from "next";
// cartaz: caixa-alta condensada — o grito da página (títulos do site)
import "@fontsource/league-gothic/index.css";
// o acento: itálico macio, a palavra pequena que liga o cartaz ("cílios que combinam")
import "@fontsource-variable/fraunces/soft-italic.css";
// corpo, rótulos e o app: grotesca humanista, arredondada
import "@fontsource-variable/dm-sans/index.css";
import "lenis/dist/lenis.css";
import "./tayssa.css";
import "./flora.css";
import "./casa.css";
import "./linguagem.css";
import { PUBLIC_ORIGIN } from "@/lib/tayssa/config";
import { SmoothScroll } from "@/components/tayssa/ui/smooth-scroll";
import { TransitionProvider } from "@/components/tayssa/ui/transition";
import { EstruturaProvider } from "@/components/tayssa/ui/estrutura";

const TITLE = "Tayssa Lash — Private Beauty Experience";
const DESCRIPTION =
  "Cílios e embelezamento do olhar, com uma experiência privada para clientes selecionadas: fidelidade, indicação e aniversário.";

export const metadata: Metadata = {
  metadataBase: new URL(PUBLIC_ORIGIN),
  title: { default: TITLE, template: "%s · Tayssa Lash" },
  description: DESCRIPTION,
  applicationName: "Tayssa Lash",
  icons: { icon: "/tayssa/favicon.svg" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    locale: "pt_BR",
    siteName: "Tayssa Lash",
  },
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
      <div className="ty-grain" aria-hidden />
      <SmoothScroll />
      <TransitionProvider>
        <EstruturaProvider>{children}</EstruturaProvider>
      </TransitionProvider>
    </div>
  );
}
