"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface Props {
  contas: { id: string; display_name: string; phone_number_display: string | null }[];
  initialContaId?: string;
  returnTo?: string;
}

export function NovoTemplateForm({ contas, initialContaId, returnTo }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    conta_id: initialContaId ?? contas[0]?.id ?? "",
    name: "",
    language: "pt_BR",
    category: "MARKETING" as "MARKETING" | "UTILITY" | "AUTHENTICATION",
    header_text: "",
    body_text: "",
    footer_text: "",
  });

  const bodyVarCount = useMemo(() => {
    const m = form.body_text.match(/\{\{\d+\}\}/g);
    if (!m) return 0;
    return Math.max(...m.map((s) => parseInt(s.replace(/\D/g, ""), 10)));
  }, [form.body_text]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.conta_id) {
      toast.error("Selecione um número primeiro.");
      return;
    }
    setLoading(true);

    const components: Array<Record<string, unknown>> = [];
    if (form.header_text) components.push({ type: "HEADER", format: "TEXT", text: form.header_text });
    components.push({
      type: "BODY",
      text: form.body_text,
      ...(bodyVarCount > 0
        ? { example: { body_text: [Array.from({ length: bodyVarCount }, (_, i) => `exemplo${i + 1}`)] } }
        : {}),
    });
    if (form.footer_text) components.push({ type: "FOOTER", text: form.footer_text });

    try {
      const res = await fetch("/api/dispatcher/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conta_id: form.conta_id,
          name: form.name,
          language: form.language,
          category: form.category,
          components,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao criar");
      toast.success(`Template "${form.name}" enviado pra Meta. Aguarde aprovação.`);
      router.push(returnTo ?? "/disparador/templates");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_400px]">
      <Card>
        <CardHeader>
          <CardTitle>Conteúdo do template</CardTitle>
          <CardDescription>Use {`{{1}}, {{2}}, {{3}}`} no corpo para variáveis.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-xs font-medium">Número WhatsApp</label>
            <Select value={form.conta_id} onValueChange={(v) => setForm({ ...form, conta_id: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {contas.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.display_name} {c.phone_number_display ? `· ${c.phone_number_display}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium">Nome (único)</label>
              <Input
                required
                pattern="[a-z0-9_]+"
                placeholder="oferta_outubro_2026"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value.toLowerCase() })}
              />
              <p className="text-[10px] text-muted-foreground mt-1">só minúsculas, números e _</p>
            </div>
            <div>
              <label className="text-xs font-medium">Idioma</label>
              <Select value={form.language} onValueChange={(v) => setForm({ ...form, language: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt_BR">Português (BR)</SelectItem>
                  <SelectItem value="en_US">Inglês (US)</SelectItem>
                  <SelectItem value="es_ES">Espanhol</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium">Categoria</label>
            <Select
              value={form.category}
              onValueChange={(v) => setForm({ ...form, category: v as typeof form.category })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MARKETING">Marketing</SelectItem>
                <SelectItem value="UTILITY">Utility</SelectItem>
                <SelectItem value="AUTHENTICATION">Authentication</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium">Header (opcional)</label>
            <Input
              placeholder="Olá!"
              value={form.header_text}
              onChange={(e) => setForm({ ...form, header_text: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-medium">Body (obrigatório)</label>
            <textarea
              required
              className="w-full min-h-[120px] rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              placeholder="Olá {{1}}! Temos uma oferta especial pra você: {{2}}"
              value={form.body_text}
              onChange={(e) => setForm({ ...form, body_text: e.target.value })}
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              {bodyVarCount} variável(eis) detectada(s)
            </p>
          </div>
          <div>
            <label className="text-xs font-medium">Footer (opcional)</label>
            <Input
              placeholder="DDG · Resposta automática"
              value={form.footer_text}
              onChange={(e) => setForm({ ...form, footer_text: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>Como vai aparecer no WhatsApp.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-[#e5ddd5] dark:bg-zinc-800 p-3">
            <div className="rounded-lg bg-white dark:bg-zinc-700 p-3 max-w-[280px] space-y-2 shadow-sm">
              {form.header_text && <div className="font-bold text-sm">{form.header_text}</div>}
              <div className="text-sm whitespace-pre-wrap">{form.body_text || "(corpo vazio)"}</div>
              {form.footer_text && (
                <div className="text-xs text-muted-foreground border-t pt-1 mt-1">{form.footer_text}</div>
              )}
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full mt-4">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enviar para aprovação Meta
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
