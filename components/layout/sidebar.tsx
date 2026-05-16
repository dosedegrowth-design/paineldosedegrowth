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
  MessageSquare,
  ShoppingBag,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useCliente } from "@/components/cliente-provider";
import type { TipoNegocio } from "@/lib/mock-data";

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: number;
  // se undefined, aparece pra todos. Se array, só para os tipos listados.
  tipos?: TipoNegocio[];
  section?: "main" | "intelligence" | "specific" | "admin";
  /** Mostrar como "Em breve" — disable link + tooltip. */
  emBreve?: boolean;
}

const NAV: NavItem[] = [
  // === Funcional / com dados reais ===
  { href: "/dashboard", label: "Visão Geral", icon: LayoutDashboard, section: "main" },
  { href: "/campanhas", label: "Campanhas", icon: Megaphone, section: "main" },

  // === Específico por tipo (parcial, salva em memória ainda) ===
  { href: "/vendas-manuais", label: "Vendas Manuais", icon: MessageSquare, tipos: ["lead_whatsapp", "hibrido"], section: "specific" },

  // === Search Terms funcional (Google Ads) ===
  { href: "/search-terms", label: "Search Terms", icon: Search, section: "main" },

  // === Em breve (Fase 2/3) — usuário vê mas sabe que não tá pronto ===
  { href: "/carrinho-abandonado", label: "Carrinho Abandonado", icon: ShoppingBag, tipos: ["ecommerce", "hibrido"], section: "specific" },
  { href: "/alertas", label: "Alertas IA", icon: AlertTriangle, section: "intelligence" },
  { href: "/mudancas", label: "Mudanças", icon: GitBranch, section: "intelligence" },
  { href: "/otimizacoes", label: "Otimizações", icon: Sparkles, section: "intelligence", emBreve: true },
  { href: "/relatorios", label: "Relatórios", icon: FileText, section: "intelligence" },
  { href: "/conversoes-offline", label: "Offline Conv.", icon: RadioTower, section: "intelligence" },

  // === Admin ===
  { href: "/clientes", label: "Clientes", icon: Building2, section: "admin" },
  { href: "/configuracoes", label: "Configurações", icon: Settings, section: "admin" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { cliente } = useCliente();

  const visibleNav = NAV.filter(
    (item) => !item.tipos || item.tipos.includes(cliente.tipo_negocio)
  );

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
        {visibleNav.map((item, idx) => {
          // separador entre seções
          const prevItem = idx > 0 ? visibleNav[idx - 1] : null;
          const showSeparator =
            prevItem && prevItem.section !== item.section && !collapsed;
          const Icon = item.icon;
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <div key={item.href}>
              {showSeparator && (
                <div className="px-3 pt-3 pb-1.5 text-[10px] uppercase tracking-widest text-muted-foreground/60">
                  {item.section === "specific" && "Modelo de Negócio"}
                  {item.section === "intelligence" && "Inteligência"}
                  {item.section === "admin" && "Administração"}
                </div>
              )}
            <Link
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                active
                  ? "bg-[var(--ddg-orange)]/10 text-[var(--ddg-orange)]"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
                item.emBreve && "opacity-60"
              )}
              title={item.emBreve ? "Em breve · em desenvolvimento" : undefined}
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
                  {item.emBreve && (
                    <span className="shrink-0 inline-flex items-center text-[9px] font-medium rounded-full px-1.5 py-0.5 bg-amber-500/15 text-amber-400 border border-amber-500/30 uppercase tracking-wider">
                      Soon
                    </span>
                  )}
                  {!item.emBreve && item.badge !== undefined && (
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
            </div>
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
