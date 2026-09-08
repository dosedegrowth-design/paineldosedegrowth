import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vem Pra Paraty — lancha privativa na Baía de Paraty",
  description:
    "Feche a lancha com seu grupo e escolha o roteiro. Saída do cais de Paraty.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      {/* As três famílias são as mesmas das artes de anúncio. Enquanto não
          entram via next/font, os fallbacks de tokens.css seguram a página. */}
      <body>{children}</body>
    </html>
  );
}
