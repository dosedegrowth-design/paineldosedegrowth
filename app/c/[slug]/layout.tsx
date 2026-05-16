import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getClienteBySlug } from "@/lib/actions/clientes";

export default async function ClienteFinalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cliente = await getClienteBySlug(slug);
  if (!cliente) notFound();

  const cor = cliente.cor_primaria || "#F15839";

  return (
    <div
      className="min-h-screen flex flex-col bg-background"
      style={
        {
          "--brand-color": cor,
        } as React.CSSProperties
      }
    >
      {/* Header whitelabel */}
      <header className="border-b border-border bg-card/40 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href={`/c/${slug}`} className="flex items-center gap-3">
            <div
              className="size-9 rounded-lg flex items-center justify-center"
              style={{ background: `${cor}20`, color: cor }}
            >
              <Image
                src="/brand/logo-icon.svg"
                alt={cliente.nome}
                width={28}
                height={28}
                priority
              />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold">{cliente.nome}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                Performance · Tráfego DDG
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <span
              className="inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-1 rounded-md border"
              style={{
                background: `${cor}10`,
                color: cor,
                borderColor: `${cor}40`,
              }}
            >
              <span
                className="size-1.5 rounded-full"
                style={{ background: cor }}
              />
              Tempo real
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
        {children}
      </main>

      <footer className="border-t border-border bg-card/40 mt-8">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between text-xs text-muted-foreground">
          <p>
            Powered by{" "}
            <span className="font-semibold text-foreground">Tráfego DDG</span>{" "}
            — Dose de Growth
          </p>
          <p>
            Atualizado a cada 6 horas · dados Meta + Google Ads
          </p>
        </div>
      </footer>
    </div>
  );
}
