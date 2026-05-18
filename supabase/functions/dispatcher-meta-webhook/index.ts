// Supabase Edge Function: dispatcher-meta-webhook
// Recebe callbacks de status do WhatsApp Cloud API
// - sent / delivered / read / failed
// - GET com hub.challenge para verificacao Meta
//
// Configure em Meta Business Manager -> WhatsApp Manager -> Webhooks:
//   URL:        https://<project>.supabase.co/functions/v1/dispatcher-meta-webhook
//   Verify:     META_WEBHOOK_VERIFY_TOKEN (env)
//   Subscribe:  messages, message_template_status_update

import { createClient } from "jsr:@supabase/supabase-js@2";

const VERIFY_TOKEN = Deno.env.get("META_WEBHOOK_VERIFY_TOKEN") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false },
});

interface MetaStatus {
  id: string;
  status: "sent" | "delivered" | "read" | "failed";
  timestamp: string;
  recipient_id: string;
  errors?: Array<{ code: number; title: string; message?: string }>;
}

interface MetaTemplateStatus {
  message_template_id: string;
  message_template_name: string;
  message_template_language: string;
  event: "APPROVED" | "REJECTED" | "PENDING" | "FLAGGED" | "PAUSED";
  reason?: string;
}

interface WebhookPayload {
  entry?: Array<{
    id: string;
    changes?: Array<{
      field: string;
      value: {
        messaging_product?: string;
        statuses?: MetaStatus[];
        message_template_id?: string;
        message_template_name?: string;
        message_template_language?: string;
        event?: string;
        reason?: string;
      };
    }>;
  }>;
}

Deno.serve(async (req) => {
  // ─── Verify (GET) ─────────────────────────────────────────
  if (req.method === "GET") {
    const url = new URL(req.url);
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");
    if (mode === "subscribe" && token === VERIFY_TOKEN && challenge) {
      return new Response(challenge, { status: 200 });
    }
    return new Response("Forbidden", { status: 403 });
  }

  // ─── Receive (POST) ──────────────────────────────────────
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let payload: WebhookPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response("Bad JSON", { status: 400 });
  }

  const results: Array<{ type: string; ok: boolean; detail?: string }> = [];

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      // STATUS DE MENSAGEM
      if (change.field === "messages" && change.value.statuses) {
        for (const s of change.value.statuses) {
          const r = await handleMessageStatus(s);
          results.push({ type: "message_status", ok: r.ok, detail: r.detail });
        }
      }

      // STATUS DE TEMPLATE
      if (change.field === "message_template_status_update") {
        const r = await handleTemplateStatus({
          message_template_id: change.value.message_template_id!,
          message_template_name: change.value.message_template_name!,
          message_template_language: change.value.message_template_language!,
          event: (change.value.event ?? "PENDING") as MetaTemplateStatus["event"],
          reason: change.value.reason,
        });
        results.push({ type: "template_status", ok: r.ok, detail: r.detail });
      }
    }
  }

  return new Response(JSON.stringify({ received: true, results }), {
    headers: { "Content-Type": "application/json" },
  });
});

async function handleMessageStatus(s: MetaStatus): Promise<{ ok: boolean; detail?: string }> {
  // Mapeia status Meta -> nosso enum
  const status = s.status; // ja bate

  const update: Record<string, unknown> = { status };
  if (s.status === "sent") update.sent_at = new Date(parseInt(s.timestamp) * 1000).toISOString();
  if (s.status === "delivered") update.delivered_at = new Date(parseInt(s.timestamp) * 1000).toISOString();
  if (s.status === "read") update.read_at = new Date(parseInt(s.timestamp) * 1000).toISOString();
  if (s.status === "failed") {
    update.failed_at = new Date(parseInt(s.timestamp) * 1000).toISOString();
    update.error_code = s.errors?.[0]?.code?.toString();
    update.error_message = s.errors?.[0]?.message ?? s.errors?.[0]?.title;
  }

  const { error } = await supabase
    .schema("disparador")
    .from("envios")
    .update(update)
    .eq("message_id", s.id);

  if (error) return { ok: false, detail: error.message };
  return { ok: true };
}

async function handleTemplateStatus(t: MetaTemplateStatus): Promise<{ ok: boolean; detail?: string }> {
  // Mapeia event Meta -> nosso enum status
  const statusMap: Record<string, string> = {
    APPROVED: "APPROVED",
    REJECTED: "REJECTED",
    PENDING: "PENDING",
    FLAGGED: "PAUSED",
    PAUSED: "PAUSED",
  };
  const status = statusMap[t.event] ?? "PENDING";

  const { error } = await supabase
    .schema("disparador")
    .from("templates")
    .update({
      status,
      meta_id: t.message_template_id,
      rejection_reason: t.event === "REJECTED" ? (t.reason ?? null) : null,
      ultima_sync_meta: new Date().toISOString(),
    })
    .eq("name", t.message_template_name)
    .eq("language", t.message_template_language);

  if (error) return { ok: false, detail: error.message };
  return { ok: true };
}
