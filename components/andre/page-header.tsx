import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Chapter } from "./chapter";

/* Cabeçalho padrão das páginas internas do site institucional:
   breadcrumb + capítulo + título grande no padrão editorial. */

export function PageHeader({
  n,
  kicker,
  title,
  highlight,
  sub,
  crumb,
}: {
  n: string;
  kicker: string;
  title: string;
  /** parte do título com gradiente (renderizada após `title`) */
  highlight?: string;
  sub?: string;
  crumb: string;
}) {
  return (
    <section className="relative overflow-hidden pt-32 lg:pt-40 pb-12 lg:pb-16">
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{
          background:
            "radial-gradient(80% 60% at 50% 0%, rgba(34, 211, 238, 0.07), transparent 70%)",
        }}
      />
      <div className="relative max-w-6xl mx-auto px-5 lg:px-8">
        <nav
          aria-label="breadcrumb"
          className="flex items-center gap-1.5 font-tech text-[10px] uppercase tracking-[0.24em] text-slate-500"
        >
          <Link
            href="/andre"
            className="hover:text-slate-300 transition-colors"
          >
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-[var(--andre-primary)]">{crumb}</span>
        </nav>

        <div className="mt-6">
          <Chapter n={n} label={kicker} />
        </div>
        <h1 className="mt-4 text-4xl sm:text-5xl lg:text-[3.8rem] andre-display leading-[1.02] text-white max-w-3xl">
          {title}
          {highlight ? (
            <>
              {" "}
              <span className="andre-gradient-text">{highlight}</span>
            </>
          ) : null}
        </h1>
        {sub ? (
          <p className="mt-5 text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl">
            {sub}
          </p>
        ) : null}
      </div>
    </section>
  );
}
