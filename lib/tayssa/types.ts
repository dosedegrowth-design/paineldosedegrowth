/**
 * Tipos das linhas do schema `vip` + rótulos em pt-BR para a interface.
 * Nomes técnicos ficam em inglês; a cliente nunca vê um status cru.
 */

export type UserRole = "client" | "admin";
export type UserStatus = "active" | "inactive" | "suspended";
export type VipStatus = "none" | "active" | "suspended";
export type ServiceStatus = "pending" | "approved" | "rejected";
export type ReferralStatus =
  | "pending"
  | "contacted"
  | "scheduled"
  | "completed"
  | "approved"
  | "rejected";
export type BenefitType = "loyalty" | "referral" | "birthday" | "custom";
export type ThresholdUnit = "points" | "referrals" | "services";
export type ClientBenefitStatus =
  | "pending_validation"
  | "available"
  | "requested"
  | "approved"
  | "redeemed"
  | "expired"
  | "rejected";

export type UserRow = {
  id: string;
  role: UserRole;
  email: string;
  name: string;
  nickname: string | null;
  phone: string | null;
  password_hash: string | null;
  status: UserStatus;
  last_login_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ClientProfileRow = {
  user_id: string;
  birthday: string | null; // YYYY-MM-DD
  vip_status: VipStatus;
  vip_since: string | null;
  vip_level: string;
  referral_code: string | null;
  notes: string | null;
  updated_at: string;
};

export type ServiceRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  point_value: number;
  active: boolean;
  sort_order: number;
};

export type ClientServiceRow = {
  id: string;
  client_id: string;
  service_id: string | null;
  service_name: string;
  service_date: string;
  amount: number | null;
  points: number;
  status: ServiceStatus;
  notes: string | null;
  submitted_by: "client" | "admin";
  submitted_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_note: string | null;
};

export type ReferralRow = {
  id: string;
  referrer_user_id: string | null;
  referrer_name: string | null;
  referrer_phone: string | null;
  referred_name: string;
  referred_phone: string;
  note: string | null;
  source: "public" | "vip";
  status: ReferralStatus;
  status_note: string | null;
  completed_at: string | null;
  approved_at: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
};

export type BenefitRow = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  type: BenefitType;
  threshold: number | null;
  threshold_unit: ThresholdUnit | null;
  validity_days: number | null;
  requires_approval: boolean;
  active: boolean;
  sort_order: number;
  config: Record<string, unknown>;
};

export type ClientBenefitRow = {
  id: string;
  client_id: string;
  benefit_id: string;
  cycle_key: string;
  status: ClientBenefitStatus;
  title: string;
  description: string | null;
  eligible_at: string;
  available_at: string | null;
  requested_at: string | null;
  approved_at: string | null;
  redeemed_at: string | null;
  rejected_at: string | null;
  expires_at: string | null;
  client_note: string | null;
  admin_note: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type BlackoutRow = {
  id: string;
  name: string;
  starts_on: string;
  ends_on: string;
  benefit_types: string[];
  active: boolean;
};

export type AuditRow = {
  id: number;
  actor_user_id: string | null;
  actor_role: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  meta: Record<string, unknown>;
  created_at: string;
};

/** Resultado padrão das server actions. */
export type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? { data?: undefined } : { data: T }))
  | { ok: false; error: string; field?: string };

// ------------------------------------------------------------
// Rótulos (linguagem humana, sem jargão técnico)
// ------------------------------------------------------------

export const SERVICE_STATUS_LABEL: Record<ServiceStatus, string> = {
  pending: "Aguardando confirmação",
  approved: "Confirmado",
  rejected: "Não confirmado",
};

export const REFERRAL_STATUS_LABEL: Record<ReferralStatus, string> = {
  pending: "Em análise",
  contacted: "Contato feito",
  scheduled: "Atendimento agendado",
  completed: "Atendimento realizado",
  approved: "Confirmada",
  rejected: "Não confirmada",
};

export const REFERRAL_STATUS_ORDER: ReferralStatus[] = [
  "pending",
  "contacted",
  "scheduled",
  "completed",
  "approved",
  "rejected",
];

export const BENEFIT_STATUS_LABEL: Record<ClientBenefitStatus, string> = {
  pending_validation: "Em validação",
  available: "Desbloqueado",
  requested: "Solicitado",
  approved: "Confirmado",
  redeemed: "Utilizado",
  expired: "Expirado",
  rejected: "Não liberado",
};

export const BENEFIT_TYPE_LABEL: Record<BenefitType, string> = {
  loyalty: "Fidelidade",
  referral: "Indicação",
  birthday: "Aniversário",
  custom: "Especial",
};

export const VIP_STATUS_LABEL: Record<VipStatus, string> = {
  none: "Cliente",
  active: "VIP ativo",
  suspended: "VIP suspenso",
};

export const USER_STATUS_LABEL: Record<UserStatus, string> = {
  active: "Ativa",
  inactive: "Inativa",
  suspended: "Suspensa",
};
