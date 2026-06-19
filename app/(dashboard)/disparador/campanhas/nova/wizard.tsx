"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowLeft, ArrowRight, Upload, Check, Plus, Search, Calendar, ClipboardPaste } from "lucide-react";

interface Conta {
  id: string;
  waba_id: string;
  display_name: string;
  phone_number_display: string | null;
  tier?: string;
  quality_rating?: string;
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

  const [contaId, setContaId] = useState("");
  const [searchConta, setSearchConta] = useState("");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templateId, setTemplateId] = useState("");
  const [campanhaNome, setCampanhaNome] = useState("");
  const [pacing, setPacing] = useState(3);
  const [scheduledAt, setScheduledAt] = useState<string>("");

  const [csvMode, setCsvMode] = useState<"upload" | "paste">("upload");
  const [pasteText, setPasteText] = useState("");
  const [fileName, setFileName] = useState<string>("");
  // rows completos ficam em ref pra evitar re-render React com 50k+ items
  const rowsRef = useRef<ParsedRow[]>([]);
  // sampleRows e totalRows sao apenas pra UI (preview + contador)
  const [sampleRows, setSampleRows] = useState<ParsedRow[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [columns, setColumns] = useState<string[]>([]);
  const [parsing, setParsing] = useState(false);
  const [parseProgress, setParseProgress] = useState(0);

  // mapping: posicao da variavel ({{1}}, {{2}}...) -> nome da coluna no CSV
  // "telefone" tambem mapeia uma coluna
  const [phoneColumn, setPhoneColumn] = useState<string>("");
  const [varMap, setVarMap] = useState<Record<string, string>>({});

  const contasFiltradas = useMemo(() => {
    if (!searchConta) return contas;
    const s = searchConta.toLowerCase();
    return contas.filter(
      (c) =>
        c.display_name.toLowerCase().includes(s) ||
        c.phone_number_display?.toLowerCase().includes(s),
    );
  }, [contas, searchConta]);

  // Carrega templates da WABA da conta selecionada
  useEffect(() => {
    if (!contaId) return;
    const conta = contas.find((c) => c.id === contaId);
    if (!conta?.waba_id) return;
    fetch(`/api/dispatcher/templates?waba_id=${conta.waba_id}`)
      .then((r) => r.json())
      .then((d) => setTemplates((d.templates ?? []) as Template[]))
      .catch(() => toast.error("Falha ao carregar templates"));
  }, [contaId, contas]);

  const template = templates.find((t) => t.id === templateId);
  const conta = contas.find((c) => c.id === contaId);

  const bodyText = useMemo(() => {
    if (!template) return "";
    return template.components.find((c) => c.type === "BODY")?.text ?? "";
  }, [template]);

  const previewBody = useMemo(() => {
    if (!bodyText || sampleRows.length === 0) return bodyText;
    let txt = bodyText;
    const sample = sampleRows[0];
    for (const [varNum, col] of Object.entries(varMap)) {
      if (col && sample[col]) {
        txt = txt.replace(new RegExp(`\\{\\{${varNum}\\}\\}`, "g"), sample[col]);
      }
    }
    return txt;
  }, [bodyText, sampleRows, varMap]);

  async function handleFile(f: File) {
    setParsing(true);
    setParseProgress(0);
    setFileName(f.name);
    rowsRef.current = [];
    try {
      const isCsv = f.name.toLowerCase().endsWith(".csv");

      // Validacao de tamanho ANTES de tentar parsear (evita crash de memoria)
      const MB = f.size / 1024 / 1024;
      if (!isCsv && MB > 20) {
        throw new Error(
          `XLSX de ${MB.toFixed(1)}MB e muito grande pro navegador. Salve como CSV no Excel (Arquivo > Salvar como > CSV UTF-8) e tente de novo. CSV suporta ate 100MB.`,
        );
      }
      if (isCsv && MB > 100) {
        throw new Error(`CSV de ${MB.toFixed(1)}MB excede limite de 100MB.`);
      }

      let parsed: ParsedRow[] = [];
      let cols: string[] = [];

      if (isCsv) {
        // CSV: stream sem worker (lazy import — worker:true em dynamic import quebra bundling)
        const Papa = (await import("papaparse")).default;
        parsed = await new Promise<ParsedRow[]>((resolve, reject) => {
          const acc: ParsedRow[] = [];
          Papa.parse<ParsedRow>(f, {
            header: true,
            skipEmptyLines: true,
            chunkSize: 1024 * 1024,
            chunk: (results) => {
              for (const r of results.data) {
                if (Object.values(r).some(Boolean)) acc.push(r);
              }
              if (!cols.length && results.meta.fields) cols = results.meta.fields;
              setParseProgress(acc.length);
            },
            complete: () => resolve(acc),
            error: (err) => reject(err),
          });
        });
      } else {
        // XLSX: lazy import (xlsx ~870KB — so carrega quando usuario sobe planilha)
        const XLSX = await import("xlsx");
        const buf = await f.arrayBuffer();
        await new Promise((r) => setTimeout(r, 0));
        let wb;
        try {
          wb = XLSX.read(buf, {
            type: "array",
            cellDates: false,
            cellNF: false,
            cellText: false,
            cellFormula: false,
            cellHTML: false,
            cellStyles: false,
            dense: true,
          });
        } catch {
          throw new Error(
            "XLSX corrompido ou muito complexo. Salve como CSV no Excel (Arquivo > Salvar como > CSV UTF-8) e tente de novo.",
          );
        }
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const ref = sheet["!ref"];
        if (!ref) throw new Error("XLSX sem dados");
        const range = XLSX.utils.decode_range(ref);
        const CHUNK = 2000;

        for (let startRow = range.s.r; startRow <= range.e.r; startRow += CHUNK) {
          const endRow = Math.min(startRow + CHUNK - 1, range.e.r);
          const opts: import("xlsx").Sheet2JSONOpts = { defval: "" };
          if (startRow > range.s.r) {
            opts.range = `${XLSX.utils.encode_cell({ r: startRow, c: range.s.c })}:${XLSX.utils.encode_cell({ r: endRow, c: range.e.c })}`;
            opts.header = cols.length ? cols : 1;
          }
          const partial = XLSX.utils.sheet_to_json<ParsedRow>(sheet, startRow > range.s.r ? opts : { defval: "" });
          const filtered = (partial as ParsedRow[]).filter((r) => Object.values(r).some(Boolean));
          if (!cols.length && filtered.length > 0) cols = Object.keys(filtered[0]);
          parsed.push(...filtered);
          setParseProgress(parsed.length);
          await new Promise((r) => setTimeout(r, 0));
        }
      }

      if (parsed.length === 0) throw new Error("Arquivo sem linhas");
      if (parsed.length > 200000) throw new Error(`Arquivo com ${parsed.length} linhas excede limite de 200000`);

      // Armazena rows em ref (nao causa re-render) + amostra de 10 no state
      rowsRef.current = parsed;
      setSampleRows(parsed.slice(0, 10));
      setTotalRows(parsed.length);
      setColumns(cols);
      const auto = cols.find((c) => /telefone|phone|celular|whatsapp/i.test(c));
      if (auto) setPhoneColumn(auto);
      setStep(4);
    } catch (e) {
      toast.error(`Falha ao ler arquivo: ${(e as Error).message}`);
    } finally {
      setParsing(false);
      setParseProgress(0);
    }
  }

  async function handlePaste() {
    if (!pasteText.trim()) {
      toast.error("Cole conteúdo CSV primeiro");
      return;
    }
    setParsing(true);
    try {
      const Papa = (await import("papaparse")).default;
      const firstLine = pasteText.split("\n")[0] ?? "";
      const sep = firstLine.includes(";") ? ";" : firstLine.includes("\t") ? "\t" : ",";
      const result = Papa.parse<ParsedRow>(pasteText, {
        header: true,
        skipEmptyLines: true,
        delimiter: sep,
      });
      const parsed = (result.data as ParsedRow[]).filter((r) => Object.values(r).some(Boolean));
      const cols = result.meta.fields ?? [];
      if (parsed.length === 0) throw new Error("CSV sem linhas");
      if (parsed.length > 200000) throw new Error(`CSV com ${parsed.length} linhas excede limite de 200000`);
      rowsRef.current = parsed;
      setSampleRows(parsed.slice(0, 10));
      setTotalRows(parsed.length);
      setColumns(cols);
      setFileName(`colado (${parsed.length} linhas)`);
      const auto = cols.find((c) => /telefone|phone|celular|whatsapp/i.test(c));
      if (auto) setPhoneColumn(auto);
      setStep(4);
    } catch (e) {
      toast.error(`Falha ao processar CSV: ${(e as Error).message}`);
    } finally {
      setParsing(false);
    }
  }

  async function handleSubmit() {
    const rows = rowsRef.current;
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
          scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
        }),
      });
      const campData = await campRes.json();
      if (!campRes.ok) throw new Error(campData.error);

      if (scheduledAt) {
        toast.success(`Campanha "${campanhaNome}" agendada para ${new Date(scheduledAt).toLocaleString("pt-BR")}.`);
      } else {
        toast.success(`Campanha "${campanhaNome}" criada com ${contatos.length} contatos.`);
      }
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
            <CardTitle>1. Escolha o número de WhatsApp</CardTitle>
            <CardDescription>Quem vai ser o remetente dessa campanha.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {contas.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum número ativo. <a href="/disparador/contas" className="underline">Ative um primeiro</a>.
              </p>
            ) : (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={`Buscar entre ${contas.length} números`}
                    value={searchConta}
                    onChange={(e) => setSearchConta(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="max-h-[420px] overflow-y-auto space-y-2 pr-1">
                  {contasFiltradas.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setContaId(c.id)}
                      className={`w-full text-left p-3 border rounded-lg transition-colors ${
                        contaId === c.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"
                      }`}
                    >
                      <div className="font-medium">{c.display_name}</div>
                      <div className="text-xs text-muted-foreground font-mono">{c.phone_number_display}</div>
                    </button>
                  ))}
                  {contasFiltradas.length === 0 && (
                    <p className="text-xs text-muted-foreground py-4 text-center">Nenhum número encontrado.</p>
                  )}
                </div>
              </>
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
            <CardDescription>
              Templates vinculados ao número <span className="font-medium">{conta?.display_name}</span>. Só APPROVED podem disparar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {templates.filter((t) => t.status === "APPROVED").length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-3 border-2 border-dashed border-border rounded-lg">
                <div className="text-sm">
                  Nenhum template aprovado pra <span className="font-medium">{conta?.display_name}</span>.
                </div>
                {templates.some((t) => t.status === "PENDING") && (
                  <div className="text-xs text-muted-foreground">
                    {templates.filter((t) => t.status === "PENDING").length} template(s) aguardando aprovação Meta…
                  </div>
                )}
                <Button asChild>
                  <a href={`/disparador/templates/novo?conta_id=${contaId}&return_to=/disparador/campanhas/nova`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar primeiro template pra essa conta
                  </a>
                </Button>
              </div>
            ) : (
              <>
                {templates
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
                  ))}

                <Button asChild variant="outline" className="w-full border-dashed">
                  <a href={`/disparador/templates/novo?conta_id=${contaId}&return_to=/disparador/campanhas/nova`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar outro template pra esse número
                  </a>
                </Button>
              </>
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
            <CardTitle>3. Adicione a base de contatos</CardTitle>
            <CardDescription>CSV/XLSX (upload) ou cole o conteúdo. Precisa ter uma coluna de telefone.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-1 border-b border-border pb-1">
              <button
                type="button"
                onClick={() => setCsvMode("upload")}
                className={`px-3 py-2 text-sm rounded-t-md transition-colors flex items-center gap-2 ${
                  csvMode === "upload" ? "bg-muted font-medium" : "text-muted-foreground hover:bg-muted/40"
                }`}
              >
                <Upload className="h-4 w-4" /> Upload arquivo
              </button>
              <button
                type="button"
                onClick={() => setCsvMode("paste")}
                className={`px-3 py-2 text-sm rounded-t-md transition-colors flex items-center gap-2 ${
                  csvMode === "paste" ? "bg-muted font-medium" : "text-muted-foreground hover:bg-muted/40"
                }`}
              >
                <ClipboardPaste className="h-4 w-4" /> Colar CSV
              </button>
            </div>

            {csvMode === "upload" ? (
              <label className="block">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:bg-muted/30 transition-colors">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium">Clique para fazer upload</p>
                  <p className="text-xs text-muted-foreground mt-1">CSV ou XLSX, até 200k linhas. CSV processa mais rápido.</p>
                </div>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
              </label>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Cole CSV separado por vírgula, ponto-e-vírgula ou tab. <strong>Primeira linha</strong> deve ser o cabeçalho.
                </p>
                <textarea
                  className="w-full min-h-[180px] rounded-md border border-input bg-transparent px-3 py-2 text-sm font-mono"
                  placeholder={"telefone,nome\n5511960725070,Lucas\n5511981812630,Marina"}
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                />
                <Button onClick={handlePaste} disabled={parsing} className="w-full">
                  {parsing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Processar CSV colado
                </Button>
              </div>
            )}

            {parsing && csvMode === "upload" && (
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                {parseProgress > 0
                  ? `Processando arquivo... ${parseProgress.toLocaleString("pt-BR")} linhas`
                  : "Processando arquivo..."}
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
              {totalRows.toLocaleString("pt-BR")} linhas detectadas em <span className="font-mono">{fileName}</span>.
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
                Recomendado começar com 3-5.
              </p>
            </div>

            <div>
              <label className="text-xs font-medium flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Agendar para (opcional)
              </label>
              <Input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Deixe vazio pra disparar agora (manual). Preencha pra disparo automático no horário marcado.
              </p>
            </div>

            <div className="bg-muted/40 rounded p-3 space-y-1 text-sm">
              <div className="flex justify-between"><span>Número</span><span className="font-medium">{conta?.display_name}</span></div>
              <div className="flex justify-between"><span>Template</span><span className="font-mono text-xs">{template?.name}</span></div>
              <div className="flex justify-between"><span>Contatos</span><span className="font-medium">{totalRows.toLocaleString("pt-BR")}</span></div>
              <div className="flex justify-between"><span>Custo estimado</span><span className="font-medium">R$ {(totalRows * 0.4).toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Tempo estimado</span><span className="font-medium">{Math.ceil(totalRows / pacing / 60)} min</span></div>
              {scheduledAt && (
                <div className="flex justify-between"><span>Início</span><span className="font-medium">{new Date(scheduledAt).toLocaleString("pt-BR")}</span></div>
              )}
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
