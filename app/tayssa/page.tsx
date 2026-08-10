import type { Metadata } from "next";
import { Instagram } from "lucide-react";

const INSTAGRAM_URL = "https://www.instagram.com/1.tayssa/";

export const metadata: Metadata = {
  title: { absolute: "Tayssa · @1.tayssa" },
  description:
    "Página oficial de Tayssa. Acompanhe conteúdos, novidades e atendimento direto pelo Instagram @1.tayssa.",
  openGraph: {
    title: "Tayssa · @1.tayssa",
    description:
      "Página oficial de Tayssa. Acompanhe conteúdos, novidades e atendimento direto pelo Instagram @1.tayssa.",
    url: "https://painel.dosedegrowth.com/tayssa",
    type: "website",
  },
};

export default function TayssaPage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#0a0a0f] px-6">
      {/* Glows de fundo nas cores do Instagram */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[#833AB4]/25 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[#FD1D1D]/20 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-72 w-72 rounded-full bg-[#F77737]/10 blur-[100px]"
      />

      <main className="relative z-10 flex flex-col items-center text-center max-w-md w-full">
        {/* Avatar */}
        <div className="p-[3px] rounded-full bg-gradient-to-tr from-[#F77737] via-[#FD1D1D] to-[#833AB4]">
          <div className="h-24 w-24 rounded-full bg-[#0a0a0f] flex items-center justify-center">
            <span className="text-4xl font-bold bg-gradient-to-tr from-[#F77737] via-[#FD1D1D] to-[#833AB4] bg-clip-text text-transparent">
              T
            </span>
          </div>
        </div>

        <h1 className="mt-6 text-3xl font-bold tracking-tight text-white">
          Tayssa
        </h1>
        <p className="mt-1 text-sm font-medium text-white/50">@1.tayssa</p>

        <p className="mt-5 text-base leading-relaxed text-white/70">
          Conteúdos, novidades e atendimento direto pelo Instagram. Clique
          abaixo para acessar o perfil oficial.
        </p>

        {/* CTA */}
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-8 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] px-8 py-4 text-base font-semibold text-white shadow-lg shadow-[#FD1D1D]/25 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Instagram className="h-5 w-5 transition-transform duration-200 group-hover:-rotate-6" />
          Acessar Instagram
        </a>

        <p className="mt-4 text-xs text-white/40">instagram.com/1.tayssa</p>
      </main>

      <footer className="relative z-10 mt-16 pb-8 text-center">
        <p className="text-xs text-white/30">
          © {new Date().getFullYear()} Tayssa. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}
