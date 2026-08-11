import { NextResponse } from "next/server";
import { createClient as createSbClient } from "@supabase/supabase-js";
import { WhatsappClient } from "@/lib/whatsapp/client";
import { parseTemplateShape, namedParamFromKey, type TemplateComponentLike } from "@/lib/whatsapp/template-shape";

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
        template:templates ( name, language, components, header_media_url, header_media_type )
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
      template: {
        name: string;
        language: string;
        components?: unknown;
        header_media_url?: string | null;
        header_media_type?: "IMAGE" | "VIDEO" | "DOCUMENT" | null;
      };
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

  // Monta os componentes a partir da FORMA real do template (header/body/botão),
  // puxando cada valor de e.variables pela chave definida no template-shape.
  const tmpl = e.campanha.template;
  const shape = parseTemplateShape((tmpl.components as TemplateComponentLike[]) ?? []);
  const vars = e.variables ?? {};

  const bodyVariables: string[] = [];
  const bodyNamedParams: Array<{ name: string; text: string }> = [];
  const headerVariables: string[] = [];
  const buttonVariables: Array<{ index: number; text: string }> = [];

  for (const f of shape.fields) {
    const val = String(vars[f.key] ?? "");
    if (f.scope === "body") {
      const named = namedParamFromKey(f.key);
      if (named) bodyNamedParams.push({ name: named, text: val });
      else bodyVariables.push(val);
    } else if (f.scope === "header") {
      headerVariables.push(val);
    } else if (f.scope === "button") {
      const idx = Number(f.key.split(":")[1]);
      buttonVariables.push({ index: idx, text: val });
    }
  }

  // Header com mídia (IMAGE/VIDEO/DOCUMENT) — a imagem é fixa do template,
  // re-hospedada no Storage pelo sync. Sem ela, o envio falharia na Meta.
  let headerMedia: { type: "image" | "video" | "document"; link: string; filename?: string } | undefined;
  if (shape.headerMedia) {
    const mediaUrl = tmpl.header_media_url;
    if (!mediaUrl) {
      await supabase
        .schema("disparador" as never)
        .from("envios")
        .update({
          status: "failed",
          error_message: "Template tem mídia no cabeçalho mas ela não foi sincronizada. Clique em 'Atualizar' na tela de templates e tente de novo.",
          failed_at: new Date().toISOString(),
        })
        .eq("id", envio_id);
      return NextResponse.json({ ok: false, error: "header_media_url ausente" }, { status: 422 });
    }
    headerMedia = { type: shape.headerMedia.type, link: mediaUrl };
  }

  try {
    const r = await client.sendTemplate({
      to: e.telefone,
      templateName: tmpl.name,
      language: tmpl.language,
      bodyVariables: bodyVariables.length > 0 ? bodyVariables : undefined,
      bodyNamedParams: bodyNamedParams.length > 0 ? bodyNamedParams : undefined,
      headerVariables: headerVariables.length > 0 ? headerVariables : undefined,
      buttonVariables: buttonVariables.length > 0 ? buttonVariables : undefined,
      headerMedia,
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
