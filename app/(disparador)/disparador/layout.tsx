import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { DisparadorNav } from "./disparador-nav";

export const metadata: Metadata = {
  title: "Disparador WhatsApp",
  description: "Central de campanhas via WhatsApp Cloud API oficial.",
};

export default function DisparadorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center px-4 sm:px-6 lg:px-8">
          <Link href="/disparador" className="flex shrink-0 items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl border border-[var(--ddg-orange)]/20 bg-[var(--ddg-orange)]/10">
              <Image
                src="/brand/logo-icon.svg"
                alt="Dose de Growth"
                width={25}
                height={25}
                priority
              />
            </span>
            <span className="hidden leading-tight sm:block">
              <span className="block text-sm font-bold tracking-tight">Disparador</span>
              <span className="block text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Dose de Growth
              </span>
            </span>
          </Link>

          <DisparadorNav />
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {children}
      </main>
    </div>
  );
}
