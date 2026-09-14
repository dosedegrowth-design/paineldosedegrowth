import type { Metadata, Viewport } from "next";
import "@fontsource/barlow/400.css";
import "@fontsource/barlow/500.css";
import "@fontsource/barlow/600.css";
import "@fontsource/barlow-condensed/500.css";
import "@fontsource/barlow-condensed/600.css";
import "@fontsource/barlow-condensed/700.css";
import "./base.css";
import "./viva.css";
import { MARCA, PUBLIC_ORIGIN } from "@/lib/config";
import { disponibilidadeDeFotos } from "@/lib/photos-server";
import { DisponibilidadeProvider } from "@/components/ui/disponibilidade";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { WhatsappFlutuante } from "@/components/layout/whatsapp-float";

const TITULO = "VIVA Extintores — Engenharia, prevenção e combate a incêndio";
const DESCRICAO =
  "Portfólio da VIVA Extintores: projetos, obras, regularização e manutenção de sistemas de segurança contra incêndio — combate, detecção, SPDA, CLCB/AVCB e relatório tecno-fotográfico.";

export const metadata: Metadata = {
  metadataBase: new URL(PUBLIC_ORIGIN),
  title: { default: TITULO, template: `%s · ${MARCA.nome}` },
  description: DESCRICAO,
  applicationName: MARCA.nome,
  openGraph: {
    title: TITULO,
    description: DESCRICAO,
    type: "website",
    locale: "pt_BR",
    siteName: MARCA.nome,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#070c13",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const fotos = disponibilidadeDeFotos();

  return (
    <html lang="pt-BR">
      <body>
        <DisponibilidadeProvider value={fotos}>
          <Header />
          <main>{children}</main>
          <Footer />
          <WhatsappFlutuante />
        </DisponibilidadeProvider>
      </body>
    </html>
  );
}
