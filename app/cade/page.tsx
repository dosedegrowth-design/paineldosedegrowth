import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "CADÊ? KKKK" },
  description: "estou aguardando o link da pagina, CADE? KKKK",
  robots: { index: false, follow: false },
};

export default function CadePage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#0a0a0f] px-6">
      {/* Glows de fundo */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[#F15839]/20 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[#833AB4]/20 blur-[120px]"
      />

      <main className="relative z-10 flex flex-col items-center text-center max-w-xl w-full">
        <span className="text-6xl">🤨</span>
        <h1 className="mt-8 text-3xl sm:text-4xl font-bold tracking-tight text-white leading-snug">
          estou aguardando o link da pagina, CADE? KKKK
        </h1>
      </main>
    </div>
  );
}
