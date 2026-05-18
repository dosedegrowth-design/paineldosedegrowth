import { NextResponse } from "next/server";
import { createClient as createSbClient } from "@supabase/supabase-js";
import { WhatsappClient } from "@/lib/whatsapp/client";

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

  // Pega conta + token via business (schema novo: token fica em businesses, nao em contas)
  const { data: contaRow } = await supabase
    .schema("disparador" as never)
    .from("contas")
    .select("waba_id, phone_number_id, business:businesses(token_vault_key)")
    .eq("id", e.campanha.conta_id)
    .single();
  if (!contaRow) return NextResponse.json({ error: "conta nao encontrada" }, { status: 500 });
  const conta = contaRow as unknown as {
    waba_id: string;
    phone_number_id: string;
    business: { token_vault_key: string } | { token_vault_key: string }[] | null;
  };
  const businessObj = Array.isArray(conta.business) ? conta.business[0] : conta.business;
  if (!businessObj?.token_vault_key) {
    return NextResponse.json({ error: "conta sem business/token" }, { status: 500 });
  }

  // Le token via RPC (Vault nao e acessivel via REST)
  const { data: tokenResp, error: tokenErr } = await supabase
    .schema("disparador" as never)
    .rpc("get_token", { secret_name: businessObj.token_vault_key });
  if (tokenErr || !tokenResp) {
    return NextResponse.json({ error: `get_token: ${tokenErr?.message ?? "vazio"}` }, { status: 500 });
  }
  const token = tokenResp as unknown as string;

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
