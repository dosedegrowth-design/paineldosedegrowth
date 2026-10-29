/**
 * Tipos das linhas do schema `vip` + rótulos em pt-BR para a interface.
 * Nomes técnicos ficam em inglês; a cliente nunca vê um status cru.
 */

export type UserRole = "client" | "admin";
export type UserStatus = "pending" | "active" | "inactive" | "suspended" | "rejected";
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
  /** 'self' = pediu acesso pelo site; 'admin' = a Tayssa cadastrou */
  signup_source: "admin" | "self";
  signup_message: string | null;
  requested_at: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  review_note: string | null;
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
  /** valor que a Tayssa quer mostrar (vazio = não mostra) */
  preco?: number | null;
  /** minutos que ocupa na agenda (vazio = duração padrão da agenda) */
  duration_min?: number | null;
  /** valor da manutenção deste volume (vazio = sem manutenção própria) */
  preco_manutencao?: number | null;
  /** foto de capa escolhida no painel (vazio = a primeira foto do serviço) */
  capa_photo_id?: string | null;
  /** enquadramento da capa: centro em % e zoom */
  capa_x?: number;
  capa_y?: number;
  capa_zoom?: number;
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

export type LoyaltyCardRow = {
  id: string;
  client_id: string;
  cycle_number: number;
  card_size: number;
  opened_at: string;
  completed_at: string | null;
  client_benefit_id: string | null;
};

export type LoyaltyStampRow = {
  id: string;
  card_id: string;
  client_id: string;
  position: number;
  client_service_id: string | null;
  service_name: string;
  points: number;
  stamped_at: string;
  revealed_at: string | null;
};

/** Carimbo como a interface precisa dele (server -> client). */
export type CardStamp = {
  id: string;
  position: number;
  serviceName: string;
  points: number;
  revealed: boolean;
  /** data do atendimento que gerou o carimbo */
  date: string;
};

/** Foto da biblioteca central: um upload, vários consumidores. */
export type CategoriaMidia = "cilios" | "sobrancelha" | "labios" | "pele" | "outro";

export type PhotoRow = {
  id: string;
  storage_path: string;
  public_url: string;
  /** produto/técnica dentro da categoria (ex.: "Volume inglês") */
  lash_style: string;
  /** cilios | sobrancelha | labios | pele | outro */
  category: CategoriaMidia;
  media_type: "image" | "video";
  caption: string | null;
  alt: string;
  width: number | null;
  height: number | null;
  /** enquadramento escolhido ao publicar: centro em % e zoom (1–3) */
  focus_x: number;
  focus_y: number;
  zoom: number;
  /** o arquivo como chegou (para baixar igual) */
  original_name: string | null;
  bytes: number | null;
  mime: string | null;
  published_at: string | null;
  /** gallery = guardado na galeria, ainda fora do site */
  status: "gallery" | "active" | "archived";
  featured: boolean;
  sort_order: number;
  /** a publicação dela no Instagram (portfólio do site); vazio = vai ao perfil */
  instagram_url?: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type AppointmentStatus = "requested" | "confirmed" | "done" | "cancelled" | "no_show";

export type AppointmentRow = {
  id: string;
  client_id: string;
  service_id: string | null;
  service_name: string;
  scheduled_date: string; // YYYY-MM-DD
  scheduled_time: string; // HH:MM:SS
  duration_min: number;
  status: AppointmentStatus;
  client_note: string | null;
  admin_note: string | null;
  client_service_id: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};

export const APPOINTMENT_STATUS_LABEL: Record<AppointmentStatus, string> = {
  requested: "Aguardando confirmação",
  confirmed: "Confirmado",
  done: "Realizado",
  cancelled: "Cancelado",
  no_show: "Não compareceu",
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
  | { ok: false; error: string; field?: string; code?: string };

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
  pending: "Aguardando aprovação",
  active: "Ativa",
  inactive: "Inativa",
  suspended: "Suspensa",
  rejected: "Recusada",
};
