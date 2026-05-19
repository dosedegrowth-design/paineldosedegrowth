"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Trash2, Image as ImageIcon, Video, FileText, Type, Upload, Check } from "lucide-react";

interface Props {
  contas: { id: string; display_name: string; phone_number_display: string | null }[];
  initialContaId?: string;
  returnTo?: string;
}

type HeaderFormat = "NONE" | "TEXT" | "IMAGE" | "VIDEO" | "DOCUMENT";

interface ButtonRow {
  type: "QUICK_REPLY" | "URL" | "PHONE_NUMBER";
  text: string;
  url?: string;
  phone_number?: string;
}

export function NovoTemplateForm({ contas, initialContaId, returnTo }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    conta_id: initialContaId ?? contas[0]?.id ?? "",
    name: "",
    language: "pt_BR",
    category: "MARKETING" as "MARKETING" | "UTILITY" | "AUTHENTICATION",
    header_format: "NONE" as HeaderFormat,
    header_text: "",
    header_media_handle: "",
    header_media_filename: "",
    header_media_preview: "",
    body_text: "",
    footer_text: "",
  });
  const [buttons, setButtons] = useState<ButtonRow[]>([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  const bodyVarCount = useMemo(() => {
    const m = form.body_text.match(/\{\{\d+\}\}/g);
    if (!m) return 0;
    return Math.max(...m.map((s) => parseInt(s.replace(/\D/g, ""), 10)));
  }, [form.body_text]);

  function addButton(type: ButtonRow["type"]) {
    if (buttons.length >= 3) {
      toast.error("Máximo 3 botões por template");
      return;
    }
    setButtons([...buttons, { type, text: "" }]);
  }

  function updateButton(idx: number, patch: Partial<ButtonRow>) {
    setButtons(buttons.map((b, i) => (i === idx ? { ...b, ...patch } : b)));
  }

  function removeButton(idx: number) {
    setButtons(buttons.filter((_, i) => i !== idx));
  }

  async function handleMediaUpload(file: File) {
    if (!form.conta_id) {
      toast.error("Selecione um número primeiro.");
      return;
    }
    const max = form.header_format === "IMAGE" ? 5 * 1024 * 1024
      : form.header_format === "VIDEO" ? 16 * 1024 * 1024
      : 100 * 1024 * 1024;
    if (file.size > max) {
      toast.error(`Arquivo muito grande. Máx ${Math.round(max / 1024 / 1024)}MB.`);
      return;
    }

    setUploadingMedia(true);
    try {
      const previewUrl = URL.createObjectURL(file);
      const fd = new FormData();
      fd.append("file", file);
      fd.append("conta_id", form.conta_id);

      const res = await fetch("/api/dispatcher/templates/upload-media", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.handle) throw new Error(data.error ?? "Falha no upload");

      setForm({
        ...form,
        header_media_handle: data.handle,
        header_media_filename: file.name,
        header_media_preview: previewUrl,
      });
      toast.success(`Upload concluído: ${file.name}`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploadingMedia(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.conta_id) {
      toast.error("Selecione um número primeiro.");
      return;
    }
    setLoading(true);

    const components: Array<Record<string, unknown>> = [];

    // HEADER
    if (form.header_format === "TEXT" && form.header_text) {
      components.push({ type: "HEADER", format: "TEXT", text: form.header_text });
    } else if (form.header_format !== "NONE" && form.header_format !== "TEXT" && form.header_media_handle) {
      components.push({
        type: "HEADER",
        format: form.header_format,
        example: { header_handle: [form.header_media_handle] },
      });
    }

    // BODY (obrigatório)
    components.push({
      type: "BODY",
      text: form.body_text,
      ...(bodyVarCount > 0
        ? { example: { body_text: [Array.from({ length: bodyVarCount }, (_, i) => `exemplo${i + 1}`)] } }
        : {}),
    });

    // FOOTER
    if (form.footer_text) {
      components.push({ type: "FOOTER", text: form.footer_text });
    }

    // BUTTONS
    if (buttons.length > 0) {
      const validButtons = buttons.filter((b) => b.text);
      if (validButtons.length > 0) {
        components.push({
          type: "BUTTONS",
          buttons: validButtons.map((b) => {
            if (b.type === "URL") {
              return { type: "URL", text: b.text, url: b.url ?? "" };
            }
            if (b.type === "PHONE_NUMBER") {
              return { type: "PHONE_NUMBER", text: b.text, phone_number: b.phone_number ?? "" };
            }
            return { type: "QUICK_REPLY", text: b.text };
          }),
        });
      }
    }

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
        <CardContent className="space-y-4">
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
                <SelectItem value="UTILITY">Utility (aprova mais rápido)</SelectItem>
                <SelectItem value="AUTHENTICATION">Authentication</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* HEADER */}
          <div className="border border-border rounded-lg p-3 space-y-2">
            <label className="text-xs font-medium">Header (opcional)</label>
            <div className="grid grid-cols-5 gap-1">
              {(["NONE", "TEXT", "IMAGE", "VIDEO", "DOCUMENT"] as HeaderFormat[]).map((fmt) => {
                const Icon = fmt === "NONE" ? Type : fmt === "TEXT" ? Type : fmt === "IMAGE" ? ImageIcon : fmt === "VIDEO" ? Video : FileText;
                return (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setForm({ ...form, header_format: fmt })}
                    className={`px-2 py-2 text-xs rounded transition-colors flex flex-col items-center gap-1 ${
                      form.header_format === fmt ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                    {fmt === "NONE" ? "Sem" : fmt === "TEXT" ? "Texto" : fmt === "IMAGE" ? "Imagem" : fmt === "VIDEO" ? "Vídeo" : "Doc"}
                  </button>
                );
              })}
            </div>
            {form.header_format === "TEXT" && (
              <Input
                placeholder="Texto do cabeçalho"
                value={form.header_text}
                onChange={(e) => setForm({ ...form, header_text: e.target.value })}
                maxLength={60}
              />
            )}
            {(form.header_format === "IMAGE" || form.header_format === "VIDEO" || form.header_format === "DOCUMENT") && (
              <>
                {form.header_media_handle ? (
                  <div className="flex items-center justify-between gap-2 p-2 border border-border rounded">
                    <div className="flex items-center gap-2 min-w-0">
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                      <span className="text-xs truncate">{form.header_media_filename}</span>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setForm({ ...form, header_media_handle: "", header_media_filename: "", header_media_preview: "" })}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <label className="block">
                    <div className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:bg-muted/30 transition-colors">
                      {uploadingMedia ? (
                        <Loader2 className="h-5 w-5 mx-auto mb-1 animate-spin text-muted-foreground" />
                      ) : (
                        <Upload className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                      )}
                      <p className="text-xs font-medium">
                        {uploadingMedia ? "Enviando pra Meta..." : "Clique para fazer upload"}
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept={
                        form.header_format === "IMAGE" ? "image/jpeg,image/png" :
                        form.header_format === "VIDEO" ? "video/mp4,video/3gpp" :
                        "application/pdf"
                      }
                      onChange={(e) => e.target.files?.[0] && handleMediaUpload(e.target.files[0])}
                      disabled={uploadingMedia}
                    />
                  </label>
                )}
                <p className="text-[10px] text-muted-foreground">
                  {form.header_format === "IMAGE" && "JPG ou PNG, máx 5MB."}
                  {form.header_format === "VIDEO" && "MP4 ou 3GPP, máx 16MB."}
                  {form.header_format === "DOCUMENT" && "PDF, máx 100MB (limite Vercel pode reduzir)."}
                  {" "}Arquivo vai ser enviado pra Meta como exemplo.
                </p>
              </>
            )}
          </div>

          {/* BODY */}
          <div>
            <label className="text-xs font-medium">Body (obrigatório)</label>
            <textarea
              required
              className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              placeholder="Olá {{1}}! Temos uma oferta especial pra você: {{2}}"
              value={form.body_text}
              onChange={(e) => setForm({ ...form, body_text: e.target.value })}
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              {bodyVarCount} variável(eis) detectada(s)
            </p>
          </div>

          {/* FOOTER */}
          <div>
            <label className="text-xs font-medium">Footer (opcional)</label>
            <Input
              placeholder="DDG · Resposta automática"
              value={form.footer_text}
              onChange={(e) => setForm({ ...form, footer_text: e.target.value })}
              maxLength={60}
            />
          </div>

          {/* BUTTONS */}
          <div className="border border-border rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium">Botões (opcional · máx 3)</label>
              <div className="flex gap-1">
                <Button type="button" size="sm" variant="outline" onClick={() => addButton("QUICK_REPLY")} disabled={buttons.length >= 3}>
                  <Plus className="h-3 w-3 mr-1" /> Resposta rápida
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => addButton("URL")} disabled={buttons.length >= 3}>
                  <Plus className="h-3 w-3 mr-1" /> URL
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => addButton("PHONE_NUMBER")} disabled={buttons.length >= 3}>
                  <Plus className="h-3 w-3 mr-1" /> Telefone
                </Button>
              </div>
            </div>
            {buttons.map((b, i) => (
              <div key={i} className="flex gap-2 items-start">
                <div className="flex-1 grid grid-cols-1 gap-1">
                  <div className="flex gap-1 items-center">
                    <span className="text-[10px] text-muted-foreground font-medium px-2 py-1 bg-muted rounded">
                      {b.type === "QUICK_REPLY" ? "Resposta rápida" : b.type === "URL" ? "URL" : "Ligar"}
                    </span>
                    <Input
                      placeholder="Texto do botão"
                      value={b.text}
                      onChange={(e) => updateButton(i, { text: e.target.value })}
                      maxLength={25}
                      className="flex-1"
                    />
                  </div>
                  {b.type === "URL" && (
                    <Input
                      placeholder="https://exemplo.com/{{1}}"
                      value={b.url ?? ""}
                      onChange={(e) => updateButton(i, { url: e.target.value })}
                    />
                  )}
                  {b.type === "PHONE_NUMBER" && (
                    <Input
                      placeholder="+5511999999999"
                      value={b.phone_number ?? ""}
                      onChange={(e) => updateButton(i, { phone_number: e.target.value })}
                    />
                  )}
                </div>
                <Button type="button" size="sm" variant="ghost" onClick={() => removeButton(i)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
            {buttons.length === 0 && (
              <p className="text-[10px] text-muted-foreground text-center py-2">Nenhum botão. Adicione até 3 acima.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* PREVIEW */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>Como vai aparecer no WhatsApp.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-[#e5ddd5] dark:bg-zinc-800 p-3">
            <div className="rounded-lg bg-white dark:bg-zinc-700 p-3 max-w-[280px] space-y-2 shadow-sm">
              {form.header_format === "TEXT" && form.header_text && (
                <div className="font-bold text-sm">{form.header_text}</div>
              )}
              {form.header_format === "IMAGE" && (
                <div className="bg-muted aspect-video rounded flex items-center justify-center overflow-hidden">
                  {form.header_media_preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.header_media_preview} alt="header" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
              )}
              {form.header_format === "VIDEO" && (
                <div className="bg-muted aspect-video rounded flex items-center justify-center overflow-hidden">
                  {form.header_media_preview ? (
                    <video src={form.header_media_preview} className="w-full h-full" controls />
                  ) : (
                    <Video className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
              )}
              {form.header_format === "DOCUMENT" && (
                <div className="bg-muted rounded p-3 flex items-center gap-2">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground truncate">
                    {form.header_media_filename || "Documento anexo"}
                  </span>
                </div>
              )}
              <div className="text-sm whitespace-pre-wrap">{form.body_text || "(corpo vazio)"}</div>
              {form.footer_text && (
                <div className="text-xs text-muted-foreground border-t pt-1 mt-1">{form.footer_text}</div>
              )}
              {buttons.filter((b) => b.text).length > 0 && (
                <div className="border-t pt-2 mt-2 space-y-1">
                  {buttons.filter((b) => b.text).map((b, i) => (
                    <div key={i} className="text-xs text-blue-500 text-center py-1.5 border border-blue-500/30 rounded hover:bg-blue-500/5 cursor-pointer">
                      {b.text}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full mt-4">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enviar para aprovação Meta
          </Button>

          <p className="text-[10px] text-muted-foreground mt-3 leading-relaxed">
            💡 <strong>Dica</strong>: UTILITY aprova mais rápido (alguns minutos). MARKETING pode levar até 24h.
            Templates com botões e mídia são revisados manualmente pela Meta.
          </p>
        </CardContent>
      </Card>
    </form>
  );
}
