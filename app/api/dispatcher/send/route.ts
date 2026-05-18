import { NextResponse } from "next/server";
import { createClient as createSbClient } from "@supabase/supabase-js";
import { WhatsappClient } from "@/lib/whatsapp/client";
import { readVaultSecret } from "@/lib/whatsapp/vault";

/**
 * POST /api/dispatcher/send
 *
 * Endpoint chamado pelo n8n (com X-Dispatcher-Secret header).
 * Recebe 1 envio_id, busca contexto, chama Meta API, atualiza envio.
 *
 * Por que existir? Pra centralizar logica de envio aqui no Next em vez de
 * espalhar no n8n. n8n vira so orquestrador (loop + pacing + retry).
 *
 * Body: { envio_id }
 */
export async function POST(req: Request) {
  // Auth simples por shared secret
  const secret = req.headers.get("x-dispatcher-secret");
  if (!secret || secret !== process.env.N8N_DISPATCHER_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { envio_id } = await req.json();
  if (!envio_id) return NextResponse.json({ error: "envio_id obrigatorio" }, { status: 400 });

  // Service role pra escrever em qualquer schema sem RLS
  const supabase = createSbClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );

  // Lock otimista: so processa se ainda for pending
  const { data: envio, error: lockErr } = await supabase
    .schema("disparador" as never)
    .from("envios")
    .update({ status: "sending" })
    .eq("id", envio_id)
    .eq("status", "pending")
    .select(`
      id, telefone, variables, campanha_id,
      campanha:campanhas (
        conta_id,
        template:templates ( name, language, components )
      )
    `)
    .single();

  if (lockErr || !envio) {
    return NextResponse.json({ error: "envio nao disponivel (ja processado?)", detail: lockErr?.message }, { status: 409 });
  }

  const e = envio as unknown as {
    id: string;
    telefone: string;
    variables: Record<string, string>;
    campanha: {
      conta_id: string;
      template: { name: string; language: string };
    };
  };

  // Pega conta + token
  const { data: contaRow } = await supabase
    .schema("disparador" as never)
    .from("contas")
    .select("waba_id, phone_number_id, token_vault_key")
    .eq("id", e.campanha.conta_id)
    .single();
  if (!contaRow) return NextResponse.json({ error: "conta nao encontrada" }, { status: 500 });
  const conta = contaRow as { waba_id: string; phone_number_id: string; token_vault_key: string };

  const token = await readVaultSecret(conta.token_vault_key);
  const client = new WhatsappClient({
    accessToken: token,
    wabaId: conta.waba_id,
    phoneNumberId: conta.phone_number_id,
  });

  // Monta bodyVariables na ordem ({{1}}, {{2}}, ...)
  const keys = Object.keys(e.variables ?? {}).filter((k) => /^\d+$/.test(k)).sort((a, b) => Number(a) - Number(b));
  const bodyVariables = keys.map((k) => e.variables[k]);

  try {
    const r = await client.sendTemplate({
      to: e.telefone,
      templateName: e.campanha.template.name,
      language: e.campanha.template.language,
      bodyVariables: bodyVariables.length > 0 ? bodyVariables : undefined,
    });
    await supabase
      .schema("disparador" as never)
      .from("envios")
      .update({
        status: "sent",
        message_id: r.messages?.[0]?.id ?? null,
        sent_at: new Date().toISOString(),
      })
      .eq("id", envio_id);
    return NextResponse.json({ ok: true, message_id: r.messages?.[0]?.id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await supabase
      .schema("disparador" as never)
      .from("envios")
      .update({
        status: "failed",
        error_message: msg,
        failed_at: new Date().toISOString(),
      })
      .eq("id", envio_id);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
