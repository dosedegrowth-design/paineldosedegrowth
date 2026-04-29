"use client";

import { useEffect, useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Loader2, UserPlus, Trash2, Shield, AlertCircle, Mail } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CodeBlock } from "@/components/ui/copy-button";

import {
  listarUsuariosDoCliente,
  convidarUsuario,
  removerUsuarioDoCliente,
  alterarRoleUsuario,
  type UsuarioCliente,
  type Role,
} from "@/lib/actions/usuarios";
import type { ClienteCompleto } from "@/lib/actions/clientes";
import { formatRelativeTime } from "@/lib/utils";

interface Props {
  cliente: ClienteCompleto;
  open: boolean;
  onClose: () => void;
}

const ROLE_LABEL: Record<Role, { label: string; color: string; desc: string }> = {
  adm_geral: {
    label: "ADM Geral",
    color: "bg-[var(--ddg-orange)]/15 text-[var(--ddg-orange)] border-[var(--ddg-orange)]/40",
    desc: "Acesso total a todos os clientes",
  },
  gestor_ddg: {
    label: "Gestor DDG",
    color: "bg-blue-500/15 text-blue-400 border-blue-500/40",
    desc: "Operação completa neste cliente",
  },
  viewer_cliente: {
    label: "Cliente (read-only)",
    color: "bg-violet-500/15 text-violet-400 border-violet-500/40",
    desc: "Cliente final - apenas visualizar",
  },
};

export function GerenciarUsuariosModal({ cliente, open, onClose }: Props) {
  const [usuarios, setUsuarios] = useState<UsuarioCliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();

  const [showInvite, setShowInvite] = useState(false);
  const [email, setEmail] = useState("");
  const [nome, setNome] = useState("");
  const [role, setRole] = useState<Role>("gestor_ddg");
  const [senhaTemp, setSenhaTemp] = useState<string | null>(null);
  const [emailCriado, setEmailCriado] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const data = await listarUsuariosDoCliente(cliente.id);
    setUsuarios(data);
    setLoading(false);
  };

  useEffect(() => {
    if (open) load();
  }, [open, cliente.id]);

  const handleInvite = () => {
    startTransition(async () => {
      const res = await convidarUsuario({
        cliente_id: cliente.id,
        email,
        nome: nome || undefined,
        role,
      });
      if (!res.ok) {
        toast.error("Erro ao convidar", { description: res.error });
        return;
      }
      if (res.senha_temporaria) {
        setSenhaTemp(res.senha_temporaria);
        setEmailCriado(email);
        toast.success("Usuário criado", {
          description: "Copie a senha temporária — não será exibida novamente",
        });
      } else {
        toast.success("Usuário vinculado", {
          description: "Usuário já existia, role atualizada.",
        });
      }
      setEmail("");
      setNome("");
      setShowInvite(false);
      load();
    });
  };

  const handleRemove = (userId: string, userEmail: string) => {
    if (!confirm(`Remover ${userEmail} do cliente ${cliente.nome}?`)) return;
    startTransition(async () => {
      const res = await removerUsuarioDoCliente(cliente.id, userId);
      if (!res.ok) {
        toast.error("Erro", { description: res.error });
        return;
      }
      toast.success("Usuário removido");
      load();
    });
  };

  const handleRoleChange = (userId: string, novoRole: Role) => {
    startTransition(async () => {
      const res = await alterarRoleUsuario(cliente.id, userId, novoRole);
      if (!res.ok) {
        toast.error("Erro", { description: res.error });
        return;
      }
      toast.success("Role atualizada");
      load();
    });
  };

  const handleClose = () => {
    setShowInvite(false);
    setSenhaTemp(null);
    setEmailCriado(null);
    setEmail("");
    setNome("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="size-5" />
            Usuários — {cliente.nome}
          </DialogTitle>
          <DialogDescription>
            Gerencie quem tem acesso a este cliente e qual nível de permissão
          </DialogDescription>
        </DialogHeader>

        {/* Senha temporária */}
        {senhaTemp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-4 space-y-3"
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="size-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-sm">Usuário criado!</p>
                <p className="text-xs text-muted-foreground mt-0.5 mb-2">
                  Envie estes dados pro novo usuário (a senha não será exibida novamente)
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Email</label>
                <CodeBlock value={emailCriado ?? ""} />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Senha temporária</label>
                <CodeBlock value={senhaTemp} />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground">URL de login</label>
                <CodeBlock value="https://paineldosedegrowth.vercel.app/login" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Form de convite */}
        {showInvite && !senhaTemp && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-lg border border-[var(--ddg-orange)]/30 bg-[var(--ddg-orange)]/5 p-4 space-y-3"
          >
            <p className="text-xs uppercase tracking-widest text-[var(--ddg-orange)] font-bold flex items-center gap-2">
              <UserPlus className="size-3.5" />
              Convidar novo usuário
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs">Email *</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@empresa.com"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs">Nome (opcional)</label>
                <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="João Silva" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs">Permissão</label>
              <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="adm_geral">
                    <div>
                      <p className="font-medium">ADM Geral</p>
                      <p className="text-[10px] text-muted-foreground">Acesso total · DDG</p>
                    </div>
                  </SelectItem>
                  <SelectItem value="gestor_ddg">
                    <div>
                      <p className="font-medium">Gestor DDG</p>
                      <p className="text-[10px] text-muted-foreground">Operação completa neste cliente</p>
                    </div>
                  </SelectItem>
                  <SelectItem value="viewer_cliente">
                    <div>
                      <p className="font-medium">Cliente (read-only)</p>
                      <p className="text-[10px] text-muted-foreground">Cliente final · só visualiza</p>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant="ddg"
                size="sm"
                onClick={handleInvite}
                disabled={pending || !email}
                className="gap-2"
              >
                {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Mail className="size-3.5" />}
                Convidar
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowInvite(false)}>
                Cancelar
              </Button>
            </div>
          </motion.div>
        )}

        {/* Lista de usuários */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Usuários vinculados ({usuarios.length})
            </p>
            {!showInvite && !senhaTemp && (
              <Button
                variant="ddg"
                size="sm"
                onClick={() => setShowInvite(true)}
                className="gap-2"
              >
                <UserPlus className="size-3.5" />
                Convidar
              </Button>
            )}
          </div>

          {loading ? (
            <div className="py-8 text-center">
              <Loader2 className="size-5 animate-spin mx-auto text-[var(--ddg-orange)]" />
            </div>
          ) : usuarios.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground border border-dashed border-border rounded-lg">
              Nenhum usuário vinculado
            </div>
          ) : (
            <div className="space-y-2">
              {usuarios.map((u) => {
                const cfg = ROLE_LABEL[u.role];
                const initials = (u.nome ?? u.email)
                  .split(/[\s@.]/)
                  .map((p) => p[0])
                  .filter(Boolean)
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();
                return (
                  <div
                    key={u.user_id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/30 transition-colors"
                  >
                    <Avatar className="size-9 shrink-0">
                      <AvatarFallback className="bg-[var(--ddg-orange)]/20 text-[var(--ddg-orange)] text-xs font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {u.nome ?? u.email}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    </div>
                    <Select
                      value={u.role}
                      onValueChange={(v) => handleRoleChange(u.user_id, v as Role)}
                    >
                      <SelectTrigger className="w-[160px] h-8">
                        <Badge className={cfg.color}>{cfg.label}</Badge>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="adm_geral">ADM Geral</SelectItem>
                        <SelectItem value="gestor_ddg">Gestor DDG</SelectItem>
                        <SelectItem value="viewer_cliente">Cliente</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleRemove(u.user_id, u.email)}
                      className="size-8 text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
