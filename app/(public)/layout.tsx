import Image from "next/image";
import Link from "next/link";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/40 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/brand/logo-icon.svg" alt="DDG" width={32} height={32} priority />
            <div className="leading-tight">
              <p className="text-sm font-bold">Tráfego DDG</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                Dose de Growth
              </p>
            </div>
          </Link>
          <nav className="flex items-center gap-4 text-xs">
            <Link href="/privacidade" className="text-muted-foreground hover:text-foreground">
              Privacidade
            </Link>
            <Link href="/termos" className="text-muted-foreground hover:text-foreground">
              Termos
            </Link>
            <Link href="/excluir-dados" className="text-muted-foreground hover:text-foreground">
              Excluir Dados
            </Link>
          </nav>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 lg:py-16">
        <div className="prose prose-invert prose-sm max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-h1:text-3xl prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-3 prose-h3:text-base prose-h3:mt-6 prose-p:leading-relaxed prose-p:text-muted-foreground prose-a:text-[var(--ddg-orange)] prose-strong:text-foreground prose-li:text-muted-foreground prose-li:leading-relaxed prose-ul:my-3 prose-ol:my-3">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/40 mt-12">
        <div className="max-w-4xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Dose de Growth. Todos os direitos reservados.</p>
          <p>
            CNPJ:{" "}
            <span className="font-mono text-foreground">DD Growth · Empresa verificada Meta</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
