"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Megaphone,
  Search,
  AlertTriangle,
  GitBranch,
  Sparkles,
  FileText,
  Settings,
  RadioTower,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const NAV = [
  { href: "/dashboard", label: "Visão Geral", icon: LayoutDashboard },
  { href: "/campanhas", label: "Campanhas", icon: Megaphone },
  { href: "/search-terms", label: "Search Terms", icon: Search },
  { href: "/alertas", label: "Alertas", icon: AlertTriangle, badge: 3 },
  { href: "/mudancas", label: "Mudanças", icon: GitBranch },
  { href: "/otimizacoes", label: "Otimizações", icon: Sparkles, badge: 7 },
  { href: "/relatorios", label: "Relatórios", icon: FileText },
  { href: "/conversoes-offline", label: "Offline Conv.", icon: RadioTower },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="relative shrink-0 h-screen sticky top-0 border-r border-border bg-card/40 backdrop-blur-xl flex flex-col"
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center bg-[var(--ddg-orange)]/10">
            <Image
              src="/brand/logo-icon.svg"
              alt="DDG"
              width={28}
              height={28}
              priority
            />
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col leading-tight"
            >
              <span className="text-sm font-bold tracking-tight">Tráfego DDG</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                Dose de Growth
              </span>
            </motion.div>
          )}
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                active
                  ? "bg-[var(--ddg-orange)]/10 text-[var(--ddg-orange)]"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-[var(--ddg-orange)]"
                />
              )}
              <Icon className="size-4 shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={cn(
                        "shrink-0 inline-flex items-center justify-center text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px]",
                        active
                          ? "bg-[var(--ddg-orange)] text-white"
                          : "bg-muted text-foreground"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse */}
      <div className="p-3 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronLeft
            className={cn(
              "size-4 transition-transform duration-200",
              collapsed && "rotate-180"
            )}
          />
          {!collapsed && <span className="text-xs">Recolher</span>}
        </Button>
      </div>
    </motion.aside>
  );
}
