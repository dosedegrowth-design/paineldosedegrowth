import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { WhatsappClient } from "@/lib/whatsapp/client";

/**
 * POST /api/dispatcher/upload
 *
 * Recebe FormData:
 *  - file (CSV ou XLSX)
 *  - conta_id (uuid)
 *  - column_mapping (JSON string): { telefone: "phone", "1": "nome", "2": "valor" }
 *
 * Faz parsing client-side antes (papaparse / xlsx) e envia ja em JSON:
 *  - rows: array de objetos { telefone, "1": ..., "2": ... }
 *
 * Aqui validamos telefones, gravamos upload + envios pending.
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const body = await req.json();

  const {
    conta_id,
    filename_original,
    rows,
    column_mapping,
  } = body as {
    conta_id: string;
    filename_original: string;
    rows: Array<Record<string, string>>;
    column_mapping: Record<string, string>;
  };

  if (!conta_id || !rows || !Array.isArray(rows)) {
    return NextResponse.json({ error: "conta_id e rows[] obrigatorios" }, { status: 400 });
  }
  if (rows.length === 0) {
    return NextResponse.json({ error: "Upload vazio" }, { status: 400 });
  }
  if (rows.length > 50000) {
    return NextResponse.json({ error: "Limite de 50000 linhas por upload" }, { status: 400 });
  }

  // ─── Validacao linha a linha ──────────────────────────────
  const validos: Array<{ telefone: string; telefone_raw: string; variables: Record<string, string> }> = [];
  const invalidos: Array<{ linha: number; telefone: string; erro: string }> = [];
  const vistos = new Set<string>();

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const raw = r.telefone ?? r.phone ?? r.celular ?? "";
    const norm = WhatsappClient.normalizePhone(raw);
    if (!norm) {
      invalidos.push({ linha: i + 1, telefone: raw, erro: "telefone invalido" });
      continue;
    }
    if (vistos.has(norm)) {
      invalidos.push({ linha: i + 1, telefone: raw, erro: "duplicado" });
      continue;
    }
    vistos.add(norm);

    // Extrai variables (todas as chaves numericas)
    const variables: Record<string, string> = {};
    for (const k of Object.keys(r)) {
      if (/^\d+$/.test(k)) variables[k] = r[k] ?? "";
    }

    validos.push({ telefone: norm, telefone_raw: raw, variables });
  }

  // ─── Grava upload ─────────────────────────────────────────
  const { data: upload, error: upErr } = await supabase
    .schema("disparador" as never)
    .from("uploads")
    .insert({
      conta_id,
      storage_path: `pending/${Date.now()}-${filename_original}`,
      filename_original,
      total_linhas: rows.length,
      total_validos: validos.length,
      total_invalidos: invalidos.length,
      column_mapping,
      validacao_errors: invalidos.slice(0, 200),
    })
    .select()
    .single();

  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  return NextResponse.json({
    upload,
    validos: validos.length,
    invalidos: invalidos.length,
    invalidos_amostra: invalidos.slice(0, 20),
    contatos_validados: validos,
  });
}
