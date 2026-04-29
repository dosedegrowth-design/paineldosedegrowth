/**
 * Webhook receiver: Painel Comercial DDG → Tráfego DDG.
 *
 * Validação HMAC obrigatória.
 * Salva evento em trafego_ddg.eventos_offline pra ser pushed para Google/Meta.
 *
 * Payload esperado:
 * {
 *   "cliente_slug": "petderma",
 *   "lead_id": "abc123",
 *   "tipo_evento": "fechamento",
 *   "valor": 280,
 *   "ocorrido_em": "2026-04-28T14:30:00Z",
 *   "match_keys": {
 *     "email": "lead@example.com",
 *     "telefone": "+5511999999999",
 *     "gclid": "Cj0KC...",
 *     "fbclid": "IwAR..."
 *   }
 * }
 */
import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const Schema = z.object({
  cliente_slug: z.string(),
  lead_id: z.string(),
  tipo_evento: z.enum(["lead_qualificado", "venda", "reuniao", "fechamento"]),
  valor: z.number().nonnegative().default(0),
  moeda: z.string().default("BRL"),
  ocorrido_em: z.string(),
  match_keys: z.object({
    email: z.string().optional(),
    telefone: z.string().optional(),
    gclid: z.string().optional(),
    fbclid: z.string().optional(),
    fbp: z.string().optional(),
    click_id_ddg: z.string().optional(),
  }),
});

function sha256(s: string): string {
  return crypto.createHash("sha256").update(s.trim().toLowerCase()).digest("hex");
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  // Validate HMAC
  const signature = req.headers.get("x-ddg-signature");
  const cliente_slug_header = req.headers.get("x-ddg-cliente-slug");
  if (!signature || !cliente_slug_header) {
    return NextResponse.json({ error: "missing signature" }, { status: 401 });
  }

  // Skeleton: na Fase 4, buscar painel_comercial_webhook_secret do cliente
  // const expectedSig = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  // if (signature !== expectedSig) return NextResponse.json({error:"invalid sig"}, {status:401});

  let parsed;
  try {
    parsed = Schema.parse(JSON.parse(rawBody));
  } catch (err) {
    return NextResponse.json(
      { error: "invalid payload", details: String(err) },
      { status: 400 }
    );
  }

  // Hash de email/telefone (LGPD + boa prática)
  const emailHash = parsed.match_keys.email ? sha256(parsed.match_keys.email) : null;
  const telefoneHash = parsed.match_keys.telefone ? sha256(parsed.match_keys.telefone) : null;

  try {
    const supabase = createAdminClient();

    // Buscar cliente_id pelo slug
    const { data: cliente, error: clienteError } = await supabase
      .schema("trafego_ddg")
      .from("clientes")
      .select("id")
      .eq("slug", parsed.cliente_slug)
      .single();

    if (clienteError || !cliente) {
      return NextResponse.json({ error: "cliente not found" }, { status: 404 });
    }

    const { data: evento, error: insertError } = await supabase
      .schema("trafego_ddg")
      .from("eventos_offline")
      .insert({
        cliente_id: cliente.id,
        origem: `painel_comercial_${parsed.cliente_slug}`,
        origem_lead_id: parsed.lead_id,
        tipo_evento: parsed.tipo_evento,
        valor: parsed.valor,
        moeda: parsed.moeda,
        email_hash: emailHash,
        telefone_hash: telefoneHash,
        gclid: parsed.match_keys.gclid,
        fbclid: parsed.match_keys.fbclid,
        fbp: parsed.match_keys.fbp,
        click_id_ddg: parsed.match_keys.click_id_ddg,
        ocorrido_em: parsed.ocorrido_em,
        raw_payload_jsonb: parsed,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      status: "queued",
      evento_id: evento.id,
      message: "Evento será enviado para Google/Meta no próximo ciclo (até 30min)",
    });
  } catch (err) {
    return NextResponse.json(
      { error: "internal", details: String(err) },
      { status: 500 }
    );
  }
}
