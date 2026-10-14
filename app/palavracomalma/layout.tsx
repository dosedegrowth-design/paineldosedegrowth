import type { Metadata, Viewport } from "next";
import "@fontsource-variable/fraunces/full.css";
import "@fontsource-variable/fraunces/full-italic.css";
import "@fontsource-variable/hanken-grotesk";
import "@fontsource-variable/bodoni-moda";
import "@fontsource/cinzel/400.css";
import "@fontsource/cinzel/600.css";
import "@fontsource/pinyon-script/400.css";
import "./pca.css";

const TITULO = "Palavra com Alma · O site novo, feito do zero";
const DESCRICAO =
  "Guia visual do que dá (e do que não dá) para criar no site novo da Palavra com Alma dentro da Tray: cores, letras, formatos, movimento, vídeo, catálogo e blog.";

export const metadata: Metadata = {
  // absolute: sem o sufixo "· Tráfego DDG" do template da raiz, que é do painel interno
  title: { absolute: TITULO },
  description: DESCRICAO,
  robots: { index: false, follow: false },
  icons: { icon: "/palavracomalma/icone.png" },
  // Prévia do link no WhatsApp
  openGraph: {
    title: TITULO,
    description: DESCRICAO,
    images: [{ url: "https://painel.dosedegrowth.com/palavracomalma/capa.jpg", width: 1200, height: 630 }],
    locale: "pt_BR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0E0809",
  width: "device-width",
  initialScale: 1,
};

export default function PalavraComAlmaLayout({ children }: { children: React.ReactNode }) {
  return <div className="pa-root">{children}</div>;
}
