import type { Metadata, Viewport } from "next";
import "@fontsource-variable/bodoni-moda/standard.css";
import "@fontsource-variable/bodoni-moda/standard-italic.css";
import "@fontsource-variable/hanken-grotesk/index.css";
import "@fontsource-variable/hanken-grotesk/wght-italic.css";
import "lenis/dist/lenis.css";
import "./tayssa.css";
import { PUBLIC_ORIGIN } from "@/lib/tayssa/config";
import { SmoothScroll } from "@/components/tayssa/ui/smooth-scroll";
import { TransitionProvider } from "@/components/tayssa/ui/transition";

const TITLE = "Tayssa — Private Beauty Experience";
const DESCRIPTION =
  "Cílios e embelezamento do olhar, com uma experiência privada para clientes selecionadas: fidelidade, indicação e aniversário.";

export const metadata: Metadata = {
  metadataBase: new URL(PUBLIC_ORIGIN),
  title: { default: TITLE, template: "%s · Tayssa" },
  description: DESCRIPTION,
  applicationName: "Tayssa VIP",
  icons: { icon: "/tayssa/favicon.svg" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    locale: "pt_BR",
    siteName: "Tayssa",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#f4efe8",
  width: "device-width",
  initialScale: 1,
};

export default function TayssaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="ty-scope" data-theme="day">
      <div className="ty-grain" aria-hidden />
      <SmoothScroll />
      <TransitionProvider>{children}</TransitionProvider>
    </div>
  );
}
