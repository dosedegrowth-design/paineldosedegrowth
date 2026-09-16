import { z } from "zod";
import { MIN_PASSWORD_LENGTH } from "@/lib/tayssa/config";
import { normalizeBrPhone } from "@/lib/tayssa/phone";

/** Schemas Zod das entradas de todas as server actions. */

const trimmed = (max = 200) => z.string().trim().min(1, "Campo obrigatório").max(max);

export const phoneField = z
  .string()
  .trim()
  .min(8, "Informe um telefone com DDD")
  .transform((v, ctx) => {
    const n = normalizeBrPhone(v);
    if (!n) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Telefone inválido. Use DDD + número." });
      return z.NEVER;
    }
    return n;
  });

export const optionalPhoneField = z
  .string()
  .trim()
  .optional()
  .transform((v, ctx) => {
    if (!v) return null;
    const n = normalizeBrPhone(v);
    if (!n) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Telefone inválido. Use DDD + número." });
      return z.NEVER;
    }
    return n;
  });

export const emailField = z.string().trim().toLowerCase().email("E-mail inválido").max(200);

export const passwordField = z
  .string()
  .min(MIN_PASSWORD_LENGTH, `Use pelo menos ${MIN_PASSWORD_LENGTH} caracteres`)
  .max(200);

export const isoDateField = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida")
  .refine((v) => !Number.isNaN(new Date(`${v}T00:00:00`).getTime()), "Data inválida");

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Informe sua senha").max(200),
});

export const setPasswordSchema = z
  .object({
    token: z.string().min(10).max(200),
    password: passwordField,
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    message: "As senhas não conferem",
    path: ["confirm"],
  });

export const changePasswordSchema = z
  .object({
    current: z.string().min(1, "Informe sua senha atual"),
    password: passwordField,
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    message: "As senhas não conferem",
    path: ["confirm"],
  });

export const publicReferralSchema = z.object({
  referrer_name: trimmed(120),
  referrer_phone: phoneField,
  referred_name: trimmed(120),
  referred_phone: phoneField,
  note: z.string().trim().max(500).optional().transform((v) => v || null),
});

export const vipReferralSchema = z.object({
  referred_name: trimmed(120),
  referred_phone: phoneField,
  note: z.string().trim().max(500).optional().transform((v) => v || null),
});

export const serviceSubmissionSchema = z.object({
  service_id: z.string().uuid("Escolha um serviço"),
  service_date: isoDateField,
  amount: z
    .string()
    .trim()
    .optional()
    .transform((v) => {
      if (!v) return null;
      const n = Number(v.replace(/\./g, "").replace(",", "."));
      return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : null;
    }),
  notes: z.string().trim().max(500).optional().transform((v) => v || null),
});

export const profileUpdateSchema = z.object({
  nickname: z.string().trim().max(60).optional().transform((v) => v || null),
  phone: optionalPhoneField,
});

// ---------------- Admin ----------------

/** Pedido de acesso feito pela própria cliente, no site. */
export const signupSchema = z
  .object({
    name: z.string().trim().min(2, "Conte seu nome").max(120),
    email: emailField,
    phone: phoneField,
    password: passwordField,
    confirm: z.string(),
    birthday: z
      .string()
      .trim()
      .optional()
      .transform((v) => v || null)
      .refine((v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v), "Data inválida"),
    message: z.string().trim().max(300).optional().transform((v) => v || null),
  })
  .refine((v) => v.password === v.confirm, { message: "As senhas não conferem", path: ["confirm"] });

export const reviewSignupSchema = z.object({
  id: z.string().uuid(),
  decision: z.enum(["approve", "reject"]),
  note: z.string().trim().max(300).optional().transform((v) => v || null),
  vip: z.boolean().optional(),
});

/** Metadados de uma foto da biblioteca. */
export const photoMetaSchema = z.object({
  lash_style: z.string().trim().min(2, "Diga o volume ou estilo").max(80),
  caption: z.string().trim().max(120).optional().transform((v) => v || null),
  alt: z.string().trim().max(200).optional().transform((v) => v || null),
  featured: z.boolean().optional(),
});

export const adminClientSchema = z.object({
  name: trimmed(120),
  email: emailField,
  nickname: z.string().trim().max(60).optional().transform((v) => v || null),
  phone: optionalPhoneField,
  birthday: z
    .string()
    .trim()
    .optional()
    .transform((v) => v || null)
    .pipe(isoDateField.nullable()),
  notes: z.string().trim().max(2000).optional().transform((v) => v || null),
  vip: z.boolean().optional(),
});

export const adminServiceEntrySchema = z.object({
  client_id: z.string().uuid(),
  service_id: z.string().uuid("Escolha um serviço"),
  service_date: isoDateField,
  amount: serviceSubmissionSchema.shape.amount,
  points_override: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? Number(v) : null))
    .refine((v) => v === null || (Number.isInteger(v) && v >= 0), "Pontos inválidos"),
  notes: z.string().trim().max(500).optional().transform((v) => v || null),
});

export const reviewSchema = z.object({
  id: z.string().uuid(),
  note: z.string().trim().max(500).optional().transform((v) => v || null),
});

export const referralStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["pending", "contacted", "scheduled", "completed", "approved", "rejected"]),
  note: z.string().trim().max(500).optional().transform((v) => v || null),
});

export const benefitDecisionSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().max(120).optional().transform((v) => v || null),
  description: z.string().trim().max(500).optional().transform((v) => v || null),
  note: z.string().trim().max(500).optional().transform((v) => v || null),
  validity_days: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? Number(v) : null))
    .refine((v) => v === null || (Number.isInteger(v) && v > 0 && v <= 365), "Validade inválida"),
});

export const releaseBirthdaySchema = z.object({
  client_id: z.string().uuid(),
  title: trimmed(120),
  description: z.string().trim().max(500).optional().transform((v) => v || null),
  validity_days: benefitDecisionSchema.shape.validity_days,
});

export const customBenefitSchema = z.object({
  client_id: z.string().uuid(),
  benefit_id: z.string().uuid(),
  title: trimmed(120),
  description: z.string().trim().max(500).optional().transform((v) => v || null),
  validity_days: benefitDecisionSchema.shape.validity_days,
});

export const catalogServiceSchema = z.object({
  id: z.string().uuid().optional(),
  name: trimmed(80),
  description: z.string().trim().max(300).optional().transform((v) => v || null),
  point_value: z.coerce.number().int().min(0).max(10000),
  active: z.boolean(),
  sort_order: z.coerce.number().int().min(0).max(999).optional(),
});

export const benefitConfigSchema = z.object({
  id: z.string().uuid(),
  name: trimmed(80),
  description: z.string().trim().max(500).optional().transform((v) => v || null),
  threshold: z.coerce.number().int().min(0).max(100000).nullable(),
  validity_days: z.coerce.number().int().min(1).max(365).nullable(),
  active: z.boolean(),
});

export const blackoutSchema = z.object({
  name: trimmed(80),
  starts_on: isoDateField,
  ends_on: isoDateField,
  benefit_types: z.array(z.enum(["birthday", "loyalty", "referral", "custom", "all"])).min(1),
});

export const businessSettingsSchema = z.object({
  name: trimmed(80),
  tagline: z.string().trim().max(120),
  specialty: z.string().trim().max(120),
  whatsapp: phoneField,
  instagram_url: z.string().trim().url().max(200),
  instagram_handle: z.string().trim().max(60),
});

export const rulesSettingsSchema = z.object({
  vip_min_services: z.coerce.number().int().min(0).max(100),
  inactivity_days: z.coerce.number().int().min(1).max(365),
  benefit_validity_days: z.coerce.number().int().min(1).max(365),
});

export const birthdaySettingsSchema = z.object({
  window_days_before: z.coerce.number().int().min(0).max(30),
  window_days_after: z.coerce.number().int().min(0).max(30),
  once_per_year: z.boolean(),
  rules: z.array(z.string().trim().min(1).max(200)).max(20),
});

export const whatsappTemplatesSchema = z.object({
  public_schedule: z.string().trim().min(1).max(300),
  public_vip_info: z.string().trim().min(1).max(300),
  public_refer: z.string().trim().min(1).max(300),
  vip_support: z.string().trim().min(1).max(300),
  vip_refer: z.string().trim().min(1).max(300),
  benefit_request: z.string().trim().min(1).max(300),
  birthday_request: z.string().trim().min(1).max(300),
  inactive_outreach: z.string().trim().min(1).max(300),
});

// ---------------- Agenda (admin) ----------------

export const appointmentReviewSchema = z.object({
  id: z.string().uuid(),
  note: z.string().trim().max(500).optional().transform((v) => v || null),
});

const hhmmField = z.string().trim().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Horário no formato HH:MM");

export const bookingSettingsSchema = z.object({
  weekdays: z.array(z.coerce.number().int().min(0).max(6)).min(1, "Escolha pelo menos um dia").transform((v) => [...new Set(v)].sort()),
  slots: z.array(hhmmField).min(1, "Informe pelo menos um horário").max(24).transform((v) => [...new Set(v)].sort()),
  lead_hours: z.coerce.number().int().min(0).max(168),
  horizon_days: z.coerce.number().int().min(1).max(120),
  default_duration_min: z.coerce.number().int().min(15).max(480),
  max_open_per_client: z.coerce.number().int().min(1).max(10),
});

export const loyaltySettingsSchema = z.object({
  card_size: z.coerce.number().int().min(2).max(20),
  card_reward_title: trimmed(80),
  card_reward_description: z.string().trim().max(300),
});

export const signupSettingsSchema = z.object({
  open: z.boolean(),
  welcome_template: z.string().trim().min(1).max(400),
});

/** Primeiro erro de um ZodError em linguagem humana. */
export function firstIssue(error: z.ZodError): { message: string; field?: string } {
  const issue = error.issues[0];
  return {
    message: issue?.message ?? "Verifique os campos e tente de novo.",
    field: issue?.path?.[0] != null ? String(issue.path[0]) : undefined,
  };
}
