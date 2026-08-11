/**
 * Parser da "forma" de um template WhatsApp a partir dos components da Meta.
 *
 * Um template pode ter:
 *  - HEADER: TEXT (com {{1}}), ou IMAGE/VIDEO/DOCUMENT (mídia fixa)
 *  - BODY: variáveis posicionais {{1}}, {{2}} OU nomeadas {{customer_name}}
 *  - BUTTONS: botão URL com sufixo dinâmico {{1}}
 *
 * Este módulo é COMPARTILHADO entre o wizard (coleta os valores) e a rota de
 * envio (monta o payload). Assim os dois enxergam a mesma estrutura e não
 * divergem.
 *
 * Convenção de chaves em envios.variables (jsonb):
 *  - Body posicional {{n}}   -> chave "n"                (ex: "1", "2") — legado
 *  - Body nomeado {{nome}}    -> chave "body:nome"        (ex: "body:customer_name")
 *  - Header TEXT {{n}}        -> chave "header:n"         (ex: "header:1")
 *  - Botão URL (índice i)     -> chave "button:i"         (ex: "button:0")
 *  - Header mídia (imagem)    -> NÃO fica em variables; vem de templates.header_media_url
 */

export interface TemplateComponentLike {
  type: string; // "HEADER" | "BODY" | "FOOTER" | "BUTTONS"
  format?: string; // "TEXT" | "IMAGE" | "VIDEO" | "DOCUMENT"
  text?: string;
  buttons?: Array<{ type: string; text?: string; url?: string }>;
}

export interface TemplateField {
  /** chave usada em variables (ex: "1", "body:customer_name", "button:0", "header:1") */
  key: string;
  /** rótulo amigável pra UI (ex: "{{customer_name}}", "Botão: Consultar Pontos") */
  label: string;
  /** onde a variável aparece */
  scope: "header" | "body" | "button";
}

export interface TemplateShape {
  /** mídia fixa no header, se houver (image/video/document) */
  headerMedia: null | { type: "image" | "video" | "document" };
  /** campos que precisam de valor por contato (body/header-text/botão) */
  fields: TemplateField[];
}

function extractPlaceholders(text: string): string[] {
  const matches = text.match(/\{\{\s*([^}]+?)\s*\}\}/g);
  if (!matches) return [];
  return matches.map((m) => m.replace(/\{\{\s*|\s*\}\}/g, "").trim());
}

/** True se todos os placeholders são numéricos ({{1}}, {{2}}) */
function isPositional(names: string[]): boolean {
  return names.length > 0 && names.every((n) => /^\d+$/.test(n));
}

export function parseTemplateShape(components: TemplateComponentLike[]): TemplateShape {
  const shape: TemplateShape = { headerMedia: null, fields: [] };

  const header = components.find((c) => c.type === "HEADER");
  const body = components.find((c) => c.type === "BODY");
  const buttonsComp = components.find((c) => c.type === "BUTTONS");

  // HEADER
  if (header) {
    const fmt = (header.format ?? "TEXT").toUpperCase();
    if (fmt === "IMAGE" || fmt === "VIDEO" || fmt === "DOCUMENT") {
      shape.headerMedia = { type: fmt.toLowerCase() as "image" | "video" | "document" };
    } else if (header.text) {
      // header TEXT com {{n}}
      const ph = extractPlaceholders(header.text);
      const nums = ph.filter((n) => /^\d+$/.test(n)).map(Number);
      const count = nums.length ? Math.max(...nums) : 0;
      for (let i = 1; i <= count; i++) {
        shape.fields.push({ key: `header:${i}`, label: `Cabeçalho {{${i}}}`, scope: "header" });
      }
    }
  }

  // BODY
  if (body?.text) {
    const ph = extractPlaceholders(body.text);
    if (isPositional(ph)) {
      const count = Math.max(...ph.map(Number));
      for (let i = 1; i <= count; i++) {
        shape.fields.push({ key: `${i}`, label: `{{${i}}}`, scope: "body" });
      }
    } else {
      // nomeadas — dedup preservando ordem
      const seen = new Set<string>();
      for (const name of ph) {
        if (seen.has(name)) continue;
        seen.add(name);
        shape.fields.push({ key: `body:${name}`, label: `{{${name}}}`, scope: "body" });
      }
    }
  }

  // BUTTONS — só URL com {{1}} precisa de valor
  if (buttonsComp?.buttons) {
    buttonsComp.buttons.forEach((btn, idx) => {
      if (btn.type === "URL" && btn.url && /\{\{\s*\d+\s*\}\}/.test(btn.url)) {
        shape.fields.push({
          key: `button:${idx}`,
          label: `Botão "${btn.text ?? "link"}" (link dinâmico)`,
          scope: "button",
        });
      }
    });
  }

  return shape;
}

/** Nome do parâmetro nomeado a partir da chave "body:customer_name" -> "customer_name" */
export function namedParamFromKey(key: string): string | null {
  return key.startsWith("body:") ? key.slice("body:".length) : null;
}
