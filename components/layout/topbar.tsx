"use client";

import {
  RefreshCw,
  Bell,
  Search as SearchIcon,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CLIENTES } from "@/lib/mock-data";
import { formatRelativeTime } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function Topbar() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date>(new Date(Date.now() - 1000 * 60 * 8));
  const [userEmail, setUserEmail] = useState<string>("");
  const [userName, setUserName] = useState<string>("ADM Geral");
  const [period, setPeriod] = useState("7d");
  const [cliente, setCliente] = useState(CLIENTES[0]?.id ?? "");

  useEffect(() => {
    setMounted(true);
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserEmail(data.user.email ?? "");
        const meta = data.user.user_metadata as { name?: string } | null;
        if (meta?.name) setUserName(meta.name);
      }
    });
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Sessão encerrada");
    router.push("/login");
    router.refresh();
  };

  const handleSync = async () => {
    setSyncing(true);
    toast.loading("Sincronizando dados...", { id: "sync" });
    await new Promise((r) => setTimeout(r, 1500));
    setLastSync(new Date());
    setSyncing(false);
    toast.success("Dados sincronizados", {
      id: "sync",
      description: "Google Ads e Meta Ads atualizados.",
    });
  };

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center gap-3 border-b border-border bg-background/80 backdrop-blur-xl px-6">
      {/* Cliente switcher */}
      <Select value={cliente} onValueChange={setCliente}>
        <SelectTrigger className="w-[200px] h-9 bg-card">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-[var(--ddg-orange)] pulse-ring" />
            <SelectValue placeholder="Cliente" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {CLIENTES.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Search */}
      <div className="relative flex-1 max-w-md hidden md:block">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Buscar campanha, ad, keyword..."
          className="pl-9 h-9 bg-card border-border"
        />
      </div>

      <div className="flex-1 md:hidden" />

      {/* Period */}
      <Select value={period} onValueChange={setPeriod}>
        <SelectTrigger className="w-[140px] h-9 bg-card">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="hoje">Hoje</SelectItem>
          <SelectItem value="ontem">Ontem</SelectItem>
          <SelectItem value="7d">Últimos 7 dias</SelectItem>
          <SelectItem value="14d">Últimos 14 dias</SelectItem>
          <SelectItem value="30d">Últimos 30 dias</SelectItem>
          <SelectItem value="mtd">Este mês</SelectItem>
          <SelectItem value="custom">Customizado</SelectItem>
        </SelectContent>
      </Select>

      {/* Sync */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleSync}
        disabled={syncing}
        className="gap-2"
      >
        <motion.span
          animate={syncing ? { rotate: 360 } : { rotate: 0 }}
          transition={
            syncing
              ? { repeat: Infinity, duration: 1, ease: "linear" }
              : { duration: 0.2 }
          }
        >
          <RefreshCw className="size-4" />
        </motion.span>
        <span className="hidden sm:inline text-xs text-muted-foreground">
          {formatRelativeTime(lastSync)}
        </span>
      </Button>

      {/* Notifications */}
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="size-4" />
        <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-[var(--ddg-orange)] pulse-ring" />
      </Button>

      {/* Theme toggle */}
      {mounted && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? (
            <Sun className="size-4" />
          ) : (
            <Moon className="size-4" />
          )}
        </Button>
      )}

      {/* User */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-9 px-2 gap-2">
            <Avatar className="size-7">
              <AvatarFallback className="bg-[var(--ddg-orange)]/20 text-[var(--ddg-orange)] text-xs font-bold">
                {userName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="hidden md:inline text-xs font-medium">
              {userName}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{userName}</span>
              <span className="text-xs text-muted-foreground truncate">
                {userEmail || "ADM Geral"}
              </span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Meu perfil</DropdownMenuItem>
          <DropdownMenuItem>Configurações</DropdownMenuItem>
          <DropdownMenuItem>Logs de auditoria</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
