"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function ContaForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [form, setForm] = useState({
    display_name: "",
    waba_id: "",
    phone_number_id: "",
    access_token: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/dispatcher/contas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao cadastrar");
      toast.success(`Conta ${form.display_name} cadastrada.`);
      setForm({ display_name: "", waba_id: "", phone_number_id: "", access_token: "" });
      router.refresh();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors w-full text-center"
      >
        Tenho os IDs manualmente — abrir formulário
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="text-xs font-medium">Nome de exibição</label>
        <Input
          required
          placeholder="SuperVisão Matriz"
          value={form.display_name}
          onChange={(e) => setForm({ ...form, display_name: e.target.value })}
        />
      </div>
      <div>
        <label className="text-xs font-medium">WABA ID</label>
        <Input
          required
          placeholder="123456789012345"
          value={form.waba_id}
          onChange={(e) => setForm({ ...form, waba_id: e.target.value })}
        />
      </div>
      <div>
        <label className="text-xs font-medium">Phone Number ID</label>
        <Input
          required
          placeholder="987654321012345"
          value={form.phone_number_id}
          onChange={(e) => setForm({ ...form, phone_number_id: e.target.value })}
        />
      </div>
      <div>
        <label className="text-xs font-medium">Access Token (System User)</label>
        <Input
          required
          type="password"
          placeholder="EAAxxx..."
          value={form.access_token}
          onChange={(e) => setForm({ ...form, access_token: e.target.value })}
        />
        <p className="text-[10px] text-muted-foreground mt-1">
          Será criptografado no Vault.
        </p>
      </div>
      <Button type="submit" disabled={loading} className="w-full" variant="secondary">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Cadastrar manual
      </Button>
    </form>
  );
}
