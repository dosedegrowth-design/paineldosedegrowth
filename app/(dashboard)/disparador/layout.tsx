import Link from "next/link";
import { Send, LayoutGrid, Users2, FileText, Inbox } from "lucide-react";

const TABS = [
  { href: "/disparador", label: "Visão Geral", icon: LayoutGrid },
  { href: "/disparador/campanhas", label: "Campanhas", icon: Send },
  { href: "/disparador/templates", label: "Templates", icon: FileText },
  { href: "/disparador/contas", label: "Números WhatsApp", icon: Users2 },
];

export default function DisparadorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Inbox className="h-4 w-4" />
        <span>Disparador WhatsApp</span>
        <span className="text-xs opacity-60">/ Cloud API oficial</span>
      </div>
      <nav className="flex gap-1 border-b border-border pb-1 overflow-x-auto">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <Link
              key={t.href}
              href={t.href}
              className="px-3 py-2 text-sm font-medium rounded-t-lg hover:bg-muted transition-colors flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </Link>
          );
        })}
      </nav>
      {children}
    </div>
  );
}
