/**
 * WhatsApp Cloud API Client (Meta Graph API)
 * Docs: https://developers.facebook.com/docs/whatsapp/cloud-api
 *
 * Use 1 instancia por conta WABA (cada uma com seu access_token + phone_number_id).
 */

const API_VERSION = process.env.META_API_VERSION || "v25.0";
const BASE_URL = `https://graph.facebook.com/${API_VERSION}`;

export interface WabaCredentials {
  accessToken: string;       // System User long-lived token
  wabaId: string;            // WhatsApp Business Account ID
  phoneNumberId: string;     // Phone Number ID
}

export interface TemplateComponent {
  type: "HEADER" | "BODY" | "FOOTER" | "BUTTONS";
  format?: "TEXT" | "IMAGE" | "VIDEO" | "DOCUMENT";
  text?: string;
  example?: { header_text?: string[]; body_text?: string[][] };
  buttons?: Array<{
    type: "QUICK_REPLY" | "URL" | "PHONE_NUMBER";
    text: string;
    url?: string;
    phone_number?: string;
  }>;
}

export interface MetaTemplate {
  id?: string;
  name: string;
  language: string;          // ex: "pt_BR"
  category: "MARKETING" | "UTILITY" | "AUTHENTICATION";
  status?: "PENDING" | "APPROVED" | "REJECTED" | "DISABLED" | "PAUSED";
  components: TemplateComponent[];
  rejected_reason?: string;
  quality_score?: { score?: string };
}

export interface SendTemplatePayload {
  to: string;                                  // E.164 sem "+": 5511999999999
  templateName: string;
  language: string;
  bodyVariables?: string[];                    // posicional: ["Joao", "R$ 500"]
  headerVariables?: string[];                  // pra header TEXT com {{1}}
  headerMedia?: {                              // pra header IMAGE/VIDEO/DOCUMENT
    type: "image" | "video" | "document";
    link: string;                              // URL publica
    filename?: string;                         // so pra DOCUMENT
  };
  buttonVariables?: Array<{ index: number; text: string }>;
}

export interface SendResult {
  messages: Array<{ id: string }>;             // wamid
  contacts: Array<{ input: string; wa_id: string }>;
}

export class MetaApiError extends Error {
  constructor(
    public status: number,
    public code: number | undefined,
    public type: string | undefined,
    message: string,
    public raw: unknown,
  ) {
    super(message);
    this.name = "MetaApiError";
  }
}

export class WhatsappClient {
  constructor(private creds: WabaCredentials) {}

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;
    const res = await fetch(url, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.creds.accessToken}`,
        "Content-Type": "application/json",
        ...(init?.headers || {}),
      },
    });
    const text = await res.text();
    let json: unknown;
    try {
      json = text ? JSON.parse(text) : {};
    } catch {
      json = { raw: text };
    }
    if (!res.ok) {
      const err = (json as { error?: { message?: string; code?: number; type?: string } }).error;
      throw new MetaApiError(
        res.status,
        err?.code,
        err?.type,
        err?.message || `Meta API ${path} failed (${res.status})`,
        json,
      );
    }
    return json as T;
  }

  // ─── PHONE NUMBER INFO ────────────────────────────────────

  async getPhoneNumberInfo() {
    return this.request<{
      verified_name: string;
      display_phone_number: string;
      quality_rating: "GREEN" | "YELLOW" | "RED" | "UNKNOWN";
      messaging_limit_tier?: string;
    }>(
      `/${this.creds.phoneNumberId}?fields=verified_name,display_phone_number,quality_rating,messaging_limit_tier`,
    );
  }

  // ─── TEMPLATES ────────────────────────────────────────────

  async listTemplates(limit = 200) {
    return this.request<{ data: MetaTemplate[]; paging?: unknown }>(
      `/${this.creds.wabaId}/message_templates?limit=${limit}`,
    );
  }

  async createTemplate(t: Omit<MetaTemplate, "id" | "status">) {
    return this.request<{ id: string; status: string; category: string }>(
      `/${this.creds.wabaId}/message_templates`,
      {
        method: "POST",
        body: JSON.stringify(t),
      },
    );
  }

  async deleteTemplate(name: string) {
    return this.request(
      `/${this.creds.wabaId}/message_templates?name=${encodeURIComponent(name)}`,
      { method: "DELETE" },
    );
  }

  // ─── SEND MESSAGE ─────────────────────────────────────────

  async sendTemplate(p: SendTemplatePayload): Promise<SendResult> {
    const components: Array<Record<string, unknown>> = [];

    // HEADER com MEDIA (IMAGE/VIDEO/DOCUMENT)
    if (p.headerMedia) {
      const mediaPayload: Record<string, string> = { link: p.headerMedia.link };
      if (p.headerMedia.type === "document" && p.headerMedia.filename) {
        mediaPayload.filename = p.headerMedia.filename;
      }
      components.push({
        type: "header",
        parameters: [
          { type: p.headerMedia.type, [p.headerMedia.type]: mediaPayload },
        ],
      });
    } else if (p.headerVariables?.length) {
      // HEADER TEXT com variaveis
      components.push({
        type: "header",
        parameters: p.headerVariables.map((v) => ({ type: "text", text: v })),
      });
    }

    if (p.bodyVariables?.length) {
      components.push({
        type: "body",
        parameters: p.bodyVariables.map((v) => ({ type: "text", text: v })),
      });
    }
    if (p.buttonVariables?.length) {
      for (const b of p.buttonVariables) {
        components.push({
          type: "button",
          sub_type: "url",
          index: b.index,
          parameters: [{ type: "text", text: b.text }],
        });
      }
    }

    return this.request<SendResult>(`/${this.creds.phoneNumberId}/messages`, {
      method: "POST",
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: p.to,
        type: "template",
        template: {
          name: p.templateName,
          language: { code: p.language },
          ...(components.length > 0 ? { components } : {}),
        },
      }),
    });
  }

  // ─── HELPERS ──────────────────────────────────────────────

  static normalizePhone(raw: string): string | null {
    const digits = raw.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 15) return null;
    // BR: prefixa 55 se vier sem
    if (digits.length === 10 || digits.length === 11) {
      return `55${digits}`;
    }
    return digits;
  }

  /** Conta quantas {{N}} aparecem no body do template (pra UI mapear colunas) */
  static countBodyVariables(components: TemplateComponent[]): number {
    const body = components.find((c) => c.type === "BODY");
    if (!body?.text) return 0;
    const matches = body.text.match(/\{\{\d+\}\}/g);
    if (!matches) return 0;
    const nums = matches.map((m) => parseInt(m.replace(/[^\d]/g, ""), 10));
    return Math.max(...nums);
  }
}
