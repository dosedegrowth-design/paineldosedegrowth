/**
 * Tayssa VIP — configuração central.
 *
 * Tudo que é regra de negócio editável vive no banco (`vip.settings`,
 * `vip.benefits`, `vip.services`). Aqui ficam só os defaults (usados se o
 * banco não responder), as rotas e as constantes técnicas.
 */

export const ROUTES = {
  home: "/",
  refer: "/indicar",
  login: "/entrar",
  setPassword: "/entrar/definir-senha",
  restricted: "/acesso",
  vip: "/vip",
  vipCard: "/vip/cartao",
  vipBook: "/vip/agendar",
  vipBenefits: "/vip/beneficios",
  vipProfile: "/vip/perfil",
  admin: "/admin",
  adminClients: "/admin/clientes",
  adminClientNew: "/admin/clientes/novo",
  adminClient: (id: string) => `/admin/clientes/${id}`,
  adminServices: "/admin/atendimentos",
  adminReferrals: "/admin/indicacoes",
  adminBenefits: "/admin/beneficios",
  adminBirthdays: "/admin/aniversarios",
  adminSettings: "/admin/configuracoes",
} as const;

/** Nome do cookie de sessão (próprio, não usa Supabase Auth). */
export const SESSION_COOKIE = "tayssa_vip_session";
export const SESSION_DAYS = 30;
export const PASSWORD_TOKEN_DAYS = 7;
export const LOGIN_MAX_ATTEMPTS = 8;
export const LOGIN_WINDOW_MINUTES = 15;
export const MIN_PASSWORD_LENGTH = 8;

/** URL pública canônica (subdomínio). Caminhos internos continuam /tayssa/... */
export const PUBLIC_ORIGIN =
  process.env.NEXT_PUBLIC_TAYSSA_ORIGIN ?? "https://tayssa.dosedegrowth.com";

/** URL absoluta de uma rota interna. */
export function publicUrl(path: string): string {
  return `${PUBLIC_ORIGIN.replace(/\/$/, "")}${path}`;
}

// ------------------------------------------------------------
// Settings (espelham `vip.settings`)
// ------------------------------------------------------------

export type BusinessSettings = {
  name: string;
  tagline: string;
  specialty: string;
  whatsapp: string; // dígitos E.164 sem '+'
  instagram_url: string;
  instagram_handle: string;
};

export type RulesSettings = {
  /** Atendimentos aprovados sugeridos para a Tayssa liberar o VIP. */
  vip_min_services: number;
  /** Dias sem atendimento aprovado para marcar cliente como inativa. */
  inactivity_days: number;
  /** Validade padrão de um benefício liberado (dias). */
  benefit_validity_days: number;
};

export type BirthdaySettings = {
  window_days_before: number;
  window_days_after: number;
  once_per_year: boolean;
  rules: string[];
};

export type WhatsappTemplates = {
  public_schedule: string;
  public_vip_info: string;
  public_refer: string;
  vip_support: string;
  vip_refer: string;
  benefit_request: string;
  birthday_request: string;
  inactive_outreach: string;
};

export type LoyaltySettings = {
  /** posições do cartão (uma por visita confirmada) */
  card_size: number;
  card_reward_title: string;
  card_reward_description: string;
};

export type BookingSettings = {
  /** 0 = domingo … 6 = sábado */
  weekdays: number[];
  /** horários "HH:MM" oferecidos em cada dia */
  slots: string[];
  /** antecedência mínima para marcar */
  lead_hours: number;
  /** até quantos dias à frente a cliente enxerga */
  horizon_days: number;
  default_duration_min: number;
  /** quantos horários futuros uma cliente pode ter ao mesmo tempo */
  max_open_per_client: number;
};

export type Settings = {
  business: BusinessSettings;
  rules: RulesSettings;
  birthday: BirthdaySettings;
  whatsapp: WhatsappTemplates;
  loyalty: LoyaltySettings;
  booking: BookingSettings;
};

export const DEFAULT_SETTINGS: Settings = {
  business: {
    name: "Tayssa Lash",
    tagline: "Private Beauty Experience",
    specialty: "Cílios e embelezamento do olhar",
    whatsapp: "5511999827606",
    instagram_url: "https://www.instagram.com/1.tayssa/",
    instagram_handle: "@1.tayssa",
  },
  rules: {
    vip_min_services: 4,
    inactivity_days: 30,
    benefit_validity_days: 60,
  },
  birthday: {
    window_days_before: 3,
    window_days_after: 3,
    once_per_year: true,
    rules: [
      "Exclusivo para clientes com acesso VIP ativo.",
      "Pode ser usado uma vez por ano, na semana do seu aniversário.",
      "Precisa de agendamento e depende da disponibilidade da agenda.",
      "É pessoal e intransferível.",
      "Não vira dinheiro, desconto ou crédito.",
      "Não acumula com outras condições especiais.",
      "Em dezembro a agenda pode ter restrições.",
      "A Tayssa confirma cada benefício.",
    ],
  },
  whatsapp: {
    public_schedule: "Oi, Tayssa! Vi seu site e quero agendar um atendimento.",
    public_vip_info: "Oi, Tayssa! Quero saber mais sobre a experiência VIP.",
    public_refer: "Oi, Tayssa! Quero indicar alguém pra conhecer seu trabalho.",
    vip_support: "Oi, Tayssa! Aqui é {name}, do VIP.",
    vip_refer: "Oi, Tayssa! Quero indicar uma nova cliente pelo meu acesso VIP.",
    benefit_request:
      "Oi, Tayssa! Aqui é {name}. Quero agendar meu benefício: {benefit}.",
    birthday_request:
      "Oi, Tayssa! Aqui é {name} e quero agendar meu benefício de aniversário.",
    inactive_outreach:
      "Oi, {name}! Faz um tempinho que não te vejo por aqui. Que tal marcarmos sua próxima manutenção?",
  },
  loyalty: {
    card_size: 8,
    card_reward_title: "Cartão completo",
    card_reward_description:
      "Um presente escolhido pela Tayssa por completar as 8 visitas do seu cartão.",
  },
  booking: {
    weekdays: [1, 2, 3, 4, 5, 6],
    slots: ["09:00", "10:30", "12:00", "13:30", "15:00", "16:30", "18:00"],
    lead_hours: 12,
    horizon_days: 30,
    default_duration_min: 90,
    max_open_per_client: 2,
  },
};
