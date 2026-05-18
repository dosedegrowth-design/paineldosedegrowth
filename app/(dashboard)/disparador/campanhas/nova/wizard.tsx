"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowLeft, ArrowRight, Upload, Check } from "lucide-react";

interface Conta {
  id: string;
  display_name: string;
  phone_number_display: string | null;
  tier: string;
  quality_rating: string;
}

interface Template {
  id: string;
  name: string;
  language: string;
  category: string;
  status: string;
  variables_count: number;
  components: Array<{ type: string; text?: string }>;
}

interface ParsedRow {
  [key: string]: string;
}

type Step = 1 | 2 | 3 | 4 | 5;

export function NovaCampanhaWizard({ contas }: { contas: Conta[] }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);

  const [contaId, setContaId] = useState(contas[0]?.id ?? "");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templateId, setTemplateId] = useState("");
  const [campanhaNome, setCampanhaNome] = useState("");
  const [pacing, setPacing] = useState(3);

  const [fileName, setFileName] = useState<string>("");
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [parsing, setParsing] = useState(false);

  // mapping: posicao da variavel ({{1}}, {{2}}...) -> nome da coluna no CSV
  // "telefone" tambem mapeia uma coluna
  const [phoneColumn, setPhoneColumn] = useState<string>("");
  const [varMap, setVarMap] = useState<Record<string, string>>({});

  // Carrega templates da conta
  useEffect(() => {
    if (!contaId) return;
    fetch(`/api/dispatcher/templates?conta_id=${contaId}`)
      .then((r) => r.json())
      .then((d) => setTemplates((d.templates ?? []) as Template[]))
      .catch(() => toast.error("Falha ao carregar templates"));
  }, [contaId]);

  const template = templates.find((t) => t.id === templateId);
  const conta = contas.find((c) => c.id === contaId);

  const bodyText = useMemo(() => {
    if (!template) return "";
    return template.components.find((c) => c.type === "BODY")?.text ?? "";
  }, [template]);

  const previewBody = useMemo(() => {
    if (!bodyText || rows.length === 0) return bodyText;
    let txt = bodyText;
    const sample = rows[0];
    for (const [varNum, col] of Object.entries(varMap)) {
      if (col && sample[col]) {
        txt = txt.replace(new RegExp(`\\{\\{${varNum}\\}\\}`, "g"), sample[col]);
      }
    }
    return txt;
  }, [bodyText, rows, varMap]);

  async function handleFile(f: File) {
    setParsing(true);
    setFileName(f.name);
    try {
      let parsed: ParsedRow[] = [];
      let cols: string[] = [];
      if (f.name.toLowerCase().endsWith(".csv")) {
        const text = await f.text();
        const result = Papa.parse<ParsedRow>(text, { header: true, skipEmptyLines: true });
        parsed = (result.data as ParsedRow[]).filter((r) => Object.values(r).some(Boolean));
        cols = result.meta.fields ?? [];
      } else {
        const buf = await f.arrayBuffer();
        const wb = XLSX.read(buf, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        parsed = XLSX.utils.sheet_to_json<ParsedRow>(sheet, { defval: "" });
        cols = parsed.length > 0 ? Object.keys(parsed[0]) : [];
      }
      if (parsed.length === 0) throw new Error("Arquivo sem linhas");
      setRows(parsed);
      setColumns(cols);
      // auto-detecta coluna de telefone
      const auto = cols.find((c) => /telefone|phone|celular|whatsapp/i.test(c));
      if (auto) setPhoneColumn(auto);
      setStep(4);
    } catch (e) {
      toast.error(`Falha ao ler arquivo: ${(e as Error).message}`);
    } finally {
      setParsing(false);
    }
  }

  async function handleSubmit() {
    if (!contaId || !templateId || !phoneColumn || !campanhaNome || rows.length === 0) {
      toast.error("Faltam campos obrigatorios");
      return;
    }
    setSubmitting(true);
    try {
      // Monta contatos com variables mapeadas
      const contatos = rows
        .map((r) => {
          const raw = String(r[phoneColumn] ?? "");
          if (!raw) return null;
          const variables: Record<string, string> = {};
          for (const [varNum, col] of Object.entries(varMap)) {
            if (col) variables[varNum] = String(r[col] ?? "");
          }
          return { telefone: normalize(raw), telefone_raw: raw, variables };
        })
        .filter((c): c is NonNullable<typeof c> => c !== null && c.telefone !== null);

      if (contatos.length === 0) throw new Error("Nenhum contato com telefone valido");

      // Sobe upload primeiro
      const upRes = await fetch("/api/dispatcher/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conta_id: contaId,
          filename_original: fileName,
          rows: contatos.map((c) => ({ telefone: c.telefone, ...c.variables })),
          column_mapping: { telefone: phoneColumn, ...varMap },
        }),
      });
      const upData = await upRes.json();
      if (!upRes.ok) throw new Error(upData.error);

      // Cria campanha
      const campRes = await fetch("/api/dispatcher/campanhas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conta_id: contaId,
          template_id: templateId,
          upload_id: upData.upload?.id,
          nome: campanhaNome,
          pacing_per_sec: pacing,
          contatos,
        }),
      });
      const campData = await campRes.json();
      if (!campRes.ok) throw new Error(campData.error);

      toast.success(`Campanha "${campanhaNome}" criada com ${contatos.length} contatos.`);
      router.push(`/disparador/campanhas/${campData.campanha.id}`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <Stepper step={step} />

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>1. Escolha a conta WABA</CardTitle>
            <CardDescription>Quem vai ser o remetente dessa campanha.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {contas.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma conta cadastrada. <a href="/disparador/contas" className="underline">Cadastre uma primeiro</a>.
              </p>
            ) : (
              contas.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setContaId(c.id)}
                  className={`w-full text-left p-3 border rounded-lg transition-colors ${
                    contaId === c.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{c.display_name}</div>
                      <div className="text-xs text-muted-foreground font-mono">{c.phone_number_display}</div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">{c.tier}</Badge>
                      <Badge variant={c.quality_rating === "GREEN" ? "default" : "outline"}>{c.quality_rating}</Badge>
                    </div>
                  </div>
                </button>
              ))
            )}
            <NavRow
              onNext={() => contaId && setStep(2)}
              nextDisabled={!contaId}
            />
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>2. Escolha o template</CardTitle>
            <CardDescription>Só templates APPROVED podem disparar.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {templates.filter((t) => t.status === "APPROVED").length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum template aprovado pra essa conta.{" "}
                <a href="/disparador/templates/novo" className="underline">Criar um</a>.
              </p>
            ) : (
              templates
                .filter((t) => t.status === "APPROVED")
                .map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTemplateId(t.id)}
                    className={`w-full text-left p-3 border rounded-lg transition-colors ${
                      templateId === t.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="font-mono text-sm font-medium">{t.name}</div>
                        <div className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {t.components.find((c) => c.type === "BODY")?.text}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Badge variant="outline">{t.language}</Badge>
                        <Badge variant="secondary">{t.variables_count} vars</Badge>
                      </div>
                    </div>
                  </button>
                ))
            )}
            <NavRow
              onBack={() => setStep(1)}
              onNext={() => templateId && setStep(3)}
              nextDisabled={!templateId}
            />
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>3. Upload da base</CardTitle>
            <CardDescription>CSV ou XLSX. Precisa ter uma coluna de telefone.</CardDescription>
          </CardHeader>
          <CardContent>
            <label className="block">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:bg-muted/30 transition-colors">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">Clique para fazer upload</p>
                <p className="text-xs text-muted-foreground mt-1">CSV ou XLSX, até 50k linhas</p>
              </div>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </label>
            {parsing && (
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" /> Processando arquivo...
              </p>
            )}
            <NavRow onBack={() => setStep(2)} />
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>4. Mapear colunas</CardTitle>
            <CardDescription>
              {rows.length} linhas detectadas em <span className="font-mono">{fileName}</span>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs font-medium">Coluna do telefone</label>
              <Select value={phoneColumn} onValueChange={setPhoneColumn}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {template && template.variables_count > 0 && (
              <>
                <div className="text-xs font-medium pt-2">Variáveis do template</div>
                {Array.from({ length: template.variables_count }, (_, i) => i + 1).map((n) => (
                  <div key={n}>
                    <label className="text-xs text-muted-foreground">{`{{${n}}}`} →</label>
                    <Select
                      value={varMap[String(n)] ?? ""}
                      onValueChange={(v) => setVarMap({ ...varMap, [String(n)]: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma coluna" />
                      </SelectTrigger>
                      <SelectContent>
                        {columns.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </>
            )}

            <div className="bg-muted/40 rounded p-3 mt-3">
              <div className="text-xs font-medium mb-1">Preview da primeira linha:</div>
              <div className="text-sm whitespace-pre-wrap">{previewBody}</div>
            </div>

            <NavRow
              onBack={() => setStep(3)}
              onNext={() => phoneColumn && setStep(5)}
              nextDisabled={!phoneColumn}
            />
          </CardContent>
        </Card>
      )}

      {step === 5 && (
        <Card>
          <CardHeader>
            <CardTitle>5. Revisar e disparar</CardTitle>
            <CardDescription>Última verificação antes de criar a campanha.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs font-medium">Nome da campanha</label>
              <Input
                placeholder="Reativação base outubro"
                value={campanhaNome}
                onChange={(e) => setCampanhaNome(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium">Pacing (mensagens por segundo)</label>
              <Input
                type="number"
                min={1}
                max={80}
                value={pacing}
                onChange={(e) => setPacing(Number(e.target.value))}
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Recomendado começar com 3-5. Aumente só depois de verificar quality rating.
              </p>
            </div>

            <div className="bg-muted/40 rounded p-3 space-y-1 text-sm">
              <div className="flex justify-between"><span>Conta</span><span className="font-medium">{conta?.display_name}</span></div>
              <div className="flex justify-between"><span>Template</span><span className="font-mono text-xs">{template?.name}</span></div>
              <div className="flex justify-between"><span>Contatos</span><span className="font-medium">{rows.length}</span></div>
              <div className="flex justify-between"><span>Custo estimado</span><span className="font-medium">R$ {(rows.length * 0.4).toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Tempo estimado</span><span className="font-medium">{Math.ceil(rows.length / pacing / 60)} min</span></div>
            </div>

            <NavRow
              onBack={() => setStep(4)}
              onSubmit={handleSubmit}
              submitting={submitting}
              submitDisabled={!campanhaNome}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Stepper({ step }: { step: Step }) {
  const steps = ["Conta", "Template", "Upload", "Mapear", "Revisar"];
  return (
    <div className="flex items-center gap-2 text-xs">
      {steps.map((label, i) => {
        const n = (i + 1) as Step;
        const active = n === step;
        const done = n < step;
        return (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-medium ${
              active ? "bg-primary text-primary-foreground" : done ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
            }`}>
              {done ? <Check className="h-3 w-3" /> : n}
            </div>
            <span className={active ? "font-medium" : "text-muted-foreground"}>{label}</span>
            {i < steps.length - 1 && <span className="text-muted-foreground/40 mx-1">·</span>}
          </div>
        );
      })}
    </div>
  );
}

function NavRow({
  onBack,
  onNext,
  onSubmit,
  nextDisabled,
  submitDisabled,
  submitting,
}: {
  onBack?: () => void;
  onNext?: () => void;
  onSubmit?: () => void;
  nextDisabled?: boolean;
  submitDisabled?: boolean;
  submitting?: boolean;
}) {
  return (
    <div className="flex justify-between pt-4">
      {onBack ? (
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
      ) : <div />}
      {onSubmit ? (
        <Button type="button" onClick={onSubmit} disabled={submitDisabled || submitting}>
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Criar campanha
        </Button>
      ) : onNext ? (
        <Button type="button" onClick={onNext} disabled={nextDisabled}>
          Próximo <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      ) : null}
    </div>
  );
}

function normalize(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  return digits;
}
