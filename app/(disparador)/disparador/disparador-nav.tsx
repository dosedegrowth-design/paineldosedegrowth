"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, LayoutGrid, Send, Users2 } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/disparador", label: "Visão Geral", icon: LayoutGrid, exact: true },
  { href: "/disparador/campanhas", label: "Campanhas", icon: Send },
  { href: "/disparador/templates", label: "Templates", icon: FileText },
  { href: "/disparador/contas", label: "Números", icon: Users2 },
];

export function DisparadorNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegação do disparador"
      className="ml-4 flex min-w-0 flex-1 items-center justify-end gap-1 overflow-x-auto sm:ml-8 sm:justify-start"
    >
      {ITEMS.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors",
              active
                ? "bg-[var(--ddg-orange)]/10 text-[var(--ddg-orange)]"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            <span className="hidden md:inline">{item.label}</span>
            {active && (
              <span className="absolute inset-x-3 -bottom-3 h-0.5 rounded-full bg-[var(--ddg-orange)]" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
