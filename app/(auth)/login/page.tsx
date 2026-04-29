"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("admin@ddg.com");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: substituir por Supabase Auth na Fase 1.5
    await new Promise((r) => setTimeout(r, 800));
    toast.success("Bem-vindo de volta, ADM Geral!");
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 ddg-gradient-subtle opacity-50" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--ddg-orange)]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--ddg-gold-dark)]/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-md px-6"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <Image src="/brand/logo-icon.svg" alt="DDG" width={48} height={48} />
            <div className="text-left leading-tight">
              <h1 className="text-2xl font-bold">Tráfego DDG</h1>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">
                Dose de Growth
              </p>
            </div>
          </div>
          <h2 className="text-3xl font-bold mt-6 mb-1">
            Bem-vindo <span className="gradient-text">de volta</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Entre com sua conta ADM Geral
          </p>
        </div>

        <Card className="border-border/50 backdrop-blur-xl bg-card/80">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Email
                </label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ddg.com"
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Senha
                </label>
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
              <Button
                type="submit"
                variant="ddg"
                className="w-full"
                disabled={loading}
              >
                {loading && <Loader2 className="size-4 animate-spin" />}
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
            <p className="text-[10px] text-muted-foreground text-center mt-6 leading-relaxed">
              Acesso restrito · Fase 0/1: apenas ADM_GERAL
              <br />
              Auth Supabase será integrado na Fase 1.5
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
