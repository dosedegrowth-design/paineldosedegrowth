/**
 * Tayssa VIP — configuração central.
 *
 * Tudo que é regra de negócio editável vive no banco (`vip.settings`,
 * `vip.benefits`, `vip.services`). Aqui ficam só os defaults (usados se o
 * banco não responder), as rotas e as constantes técnicas.
 */

export const ROUTES = {
  home: "/tayssa",
  refer: "/tayssa/indicar",
  login: "/tayssa/entrar",
  setPassword: "/tayssa/entrar/definir-senha",
  restricted: "/tayssa/acesso",
  vip: "/tayssa/vip",
  vipJourney: "/tayssa/vip/jornada",
  vipReferrals: "/tayssa/vip/indicacoes",
  vipBenefits: "/tayssa/vip/beneficios",
  vipBirthday: "/tayssa/vip/aniversario",
  vipHistory: "/tayssa/vip/historico",
  vipProfile: "/tayssa/vip/perfil",
  admin: "/tayssa/admin",
  adminClients: "/tayssa/admin/clientes",
  adminClientNew: "/tayssa/admin/clientes/novo",
  adminClient: (id: string) => `/tayssa/admin/clientes/${id}`,
  adminServices: "/tayssa/admin/atendimentos",
  adminReferrals: "/tayssa/admin/indicacoes",
  adminBenefits: "/tayssa/admin/beneficios",
  adminBirthdays: "/tayssa/admin/aniversarios",
  adminSettings: "/tayssa/admin/configuracoes",
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

/**
 * URL absoluta de uma rota interna. No subdomínio `tayssa.*` o middleware
 * reescreve `/x` -> `/tayssa/x`, então o prefixo sai do link público.
 */
export function publicUrl(path: string): string {
  const origin = PUBLIC_ORIGIN.replace(/\/$/, "");
  const host = origin.replace(/^https?:\/\//, "");
  const p = host.startsWith("tayssa.") ? path.replace(/^\/tayssa(?=\/|$)/, "") || "/" : path;
  return `${origin}${p}`;
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

export type Settings = {
  business: BusinessSettings;
  rules: RulesSettings;
  birthday: BirthdaySettings;
  whatsapp: WhatsappTemplates;
};

export const DEFAULT_SETTINGS: Settings = {
  business: {
    name: "Tayssa",
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
};
