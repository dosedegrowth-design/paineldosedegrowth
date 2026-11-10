/**
 * Tayssa VIP — configuração central.
 *
 * Tudo que é regra de negócio editável vive no banco (`vip.settings`,
 * `vip.benefits`, `vip.services`). Aqui ficam só os defaults (usados se o
 * banco não responder), as rotas e as constantes técnicas.
 */

import { origemDaTayssa, semPrefixo } from "./dominio.ts";
import type { CriteriosVip } from "./rules.ts";

/**
 * Endereço público do site (links do WhatsApp, metadados, avisos). Desde
 * 09/11/2026 o site mora no domínio dela, tayssafarias.com.br (o
 * painel.dosedegrowth.com/tayssa leva para lá). A variável troca o endereço:
 * no teste local ela aponta para o localhost (.env.local), e o site volta a
 * morar em /tayssa.
 */
export const PUBLIC_ORIGIN =
  process.env.NEXT_PUBLIC_TAYSSA_ORIGIN || "https://tayssafarias.com.br";

/**
 * O site mora na raiz de um domínio da Tayssa (tayssafarias.com.br): os
 * endereços saem sem o `/tayssa` (o middleware reescreve para app/tayssa) e
 * o painel.dosedegrowth.com/tayssa passa a levar para lá. Decidido no build
 * pela origem pública, igual no servidor e no navegador.
 */
export const SITE_NA_RAIZ = origemDaTayssa(PUBLIC_ORIGIN);
const B = SITE_NA_RAIZ ? "" : "/tayssa";

export const ROUTES = {
  home: B || "/",
  refer: `${B}/indicar`,
  login: `${B}/entrar`,
  signup: `${B}/cadastro`,
  pending: `${B}/aguardando`,
  setPassword: `${B}/entrar/definir-senha`,
  restricted: `${B}/acesso`,
  vip: `${B}/vip`,
  vipCard: `${B}/vip/cartao`,
  // endereços da conta sem "vip" (Lucas, 05/11/2026): o middleware reescreve
  // para app/tayssa/vip/agendar e app/tayssa/vip/perfil, e manda os antigos para cá
  vipBook: `${B}/meus-horarios`,
  vipBenefits: `${B}/vip/beneficios`,
  vipProfile: `${B}/minha-conta`,
  vipJourney: `${B}/vip/jornada`,
  /** o "folder" do horário: o link que vai no WhatsApp (público, sem nome nem contato) */
  horario: (id: string) => `${B}/horario/${id}`,
  /** o mesmo horário como foto em pé (1080×1350): vai no WhatsApp como imagem, não como link */
  cartaoDoHorario: (id: string) => `${B}/horario/${id}/cartao`,
  admin: `${B}/admin`,
  adminClients: `${B}/admin/clientes`,
  adminClientNew: `${B}/admin/clientes/novo`,
  adminClient: (id: string) => `${B}/admin/clientes/${id}`,
  adminServices: `${B}/admin/atendimentos`,
  adminReferrals: `${B}/admin/indicacoes`,
  adminBenefits: `${B}/admin/beneficios`,
  adminBirthdays: `${B}/admin/aniversarios`,
  adminSettings: `${B}/admin/configuracoes`,
  adminPhotos: `${B}/admin/fotos`,
  adminAgenda: `${B}/admin/agenda`,
  /** o comprovante do sinal (só a Tayssa logada abre) */
  adminComprovante: (id: string) => `${B}/admin/comprovante/${id}`,
} as const;

/**
 * Para onde voltar depois de entrar: só um caminho deste site (nunca
 * `//outro-site` nem `/\outro-site`), e no painel só o que é do Tayssa.
 */
export function caminhoDeVolta(next: string | null | undefined): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return null;
  return SITE_NA_RAIZ || next.startsWith("/tayssa/") ? next : null;
}

/** Nome do cookie de sessão (próprio, não usa Supabase Auth). */
export const SESSION_COOKIE = "tayssa_vip_session";
export const SESSION_DAYS = 30;
export const PASSWORD_TOKEN_DAYS = 7;
export const LOGIN_MAX_ATTEMPTS = 8;
export const LOGIN_WINDOW_MINUTES = 15;
export const MIN_PASSWORD_LENGTH = 8;

/**
 * Comprovantes do sinal (Supabase Storage, bucket PRIVADO): documento
 * financeiro, só o servidor lê. O painel abre por /tayssa/admin/comprovante/<id>.
 */
export const COMPROVANTE_BUCKET = "tayssa-comprovantes";
export const COMPROVANTE_MAX_BYTES = 8 * 1024 * 1024;
export const COMPROVANTE_TIPOS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
  "application/pdf": "pdf",
};

/** Biblioteca de fotos (Supabase Storage, bucket público). */
export const PHOTO_BUCKET = "tayssa-fotos";
/** o original, sem compressão: a galeria guarda o arquivo como chegou */
export const PHOTO_MAX_BYTES = 50 * 1024 * 1024;
export const PHOTO_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};
/** Vídeo do trabalho, original (vai direto do aparelho para o Storage). */
export const VIDEO_MAX_BYTES = 200 * 1024 * 1024;
export const VIDEO_TYPES: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

/**
 * URL absoluta de uma rota interna. No domínio do painel o caminho fica como
 * está (`/tayssa/...`); no domínio da Tayssa o site mora na raiz, e um
 * caminho antigo com `/tayssa` perde o prefixo.
 */
export function publicUrl(path: string): string {
  const origin = PUBLIC_ORIGIN.replace(/\/$/, "");
  return `${origin}${SITE_NA_RAIZ ? semPrefixo(path) : path}`;
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

/**
 * O que o VIP dá além do presente de aniversário (regra da Tayssa,
 * 29/10/2026), em minúscula para entrar no meio da frase. No painel, os
 * pedidos de horário de quem é VIP vêm primeiro (`vipPrimeiro`).
 */
export const PRIORIDADE_VIP = "prioridade na agenda, principalmente em dezembro";

export type RulesSettings = {
  /**
   * O programa VIP aberto para as clientes (cartão, pontos, benefícios,
   * jornada). Fechado, a área da cliente é só a agenda: marcar, ver e
   * desmarcar os horários (05/11/2026: o VIP ainda não abriu).
   */
  vip_aberto: boolean;
  /**
   * O caminho até o VIP (Lucas, 09/11/2026): `vip_visitas` atendimentos feitos
   * em até `vip_janela_dias` dias, de `vip_intervalo_min` a `vip_intervalo_max`
   * dias entre um e outro (4, 70, 15 e 20). Quem completa aparece em "Prontas
   * para VIP" e a Tayssa confirma (`progressoVip` em rules.ts).
   */
  vip_visitas: number;
  vip_janela_dias: number;
  vip_intervalo_min: number;
  vip_intervalo_max: number;
  /** Dias sem atendimento aprovado para marcar cliente como inativa. */
  inactivity_days: number;
  /** Validade padrão de um benefício liberado (dias). */
  benefit_validity_days: number;
};

/** O critério do VIP como a regra pura (`progressoVip`) recebe. */
export function criteriosVip(r: RulesSettings): CriteriosVip {
  return { visitas: r.vip_visitas, janelaDias: r.vip_janela_dias, intervaloMin: r.vip_intervalo_min, intervaloMax: r.vip_intervalo_max };
}

export type BirthdaySettings = {
  /** o presente vale o mês inteiro do aniversário (a regra da Tayssa); desligado, valem os dias em volta da data */
  mes_inteiro: boolean;
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
  /** horários "HH:MM" de quem não tem lista própria em `slots_por_dia` */
  slots: string[];
  /**
   * Os horários de início de cada dia da semana ("1" = segunda): a segunda
   * pode começar e terminar diferente do sábado. Dia sem lista usa `slots`.
   */
  slots_por_dia: Record<string, string[]>;
  /** de quanto em quanto tempo sai um horário (o painel monta a grade com ele) */
  intervalo_min: number;
  /** antecedência mínima para marcar */
  lead_hours: number;
  /** até quantos dias à frente a cliente enxerga */
  horizon_days: number;
  default_duration_min: number;
  /** quantos horários futuros uma cliente pode ter ao mesmo tempo */
  max_open_per_client: number;
  /** sinal pedido no Pix para garantir o horário marcado pelo site, em reais */
  deposit_reais: number;
  /**
   * Horas que o pedido segura o horário esperando o sinal. A Tayssa pede o
   * Pix no WhatsApp e confirma quando ele cai; sem confirmação nesse prazo,
   * o pedido cai sozinho e o horário volta para a agenda.
   */
  sinal_horas: number;
  /** minutos de tolerância para atraso: passando disso, a cliente perde o sinal (Lucas, 05/11/2026: 10 min) */
  tolerancia_min: number;
  /**
   * O Pix do sinal (modelo Reflexo do Santo, 05/11/2026): com a chave
   * cadastrada, o site mostra o "Pix copia e cola" com o valor do sinal e a
   * cliente anexa o comprovante. Vazia, ela pede a chave no WhatsApp.
   */
  pix_chave: string;
  /** em nome de quem a conta está (aparece para a cliente e vai no código) */
  pix_nome: string;
  /** cidade da conta (vai no código; não impede o pagamento) */
  pix_cidade: string;
  /** banco, só para a cliente conferir */
  pix_banco: string;
  /**
   * Prioridade VIP (Lucas e Tayssa, 09/11/2026: "a agenda de fim de ano abre primeiro para as
   * VIPs"): ligada, os dias a partir de `desde` ("AAAA-MM-DD") ficam só para VIP até `abre_em`
   * ("AAAA-MM-DDTHH:MM", horário de Brasília); vazio = só VIP até a Tayssa marcar o dia de abrir
   * para todas. Quem não é VIP vê o aviso de quando abre. Regra em `diaSoVip()` (lib/tayssa/agendar.ts).
   */
  prioridade_vip: { ativa: boolean; desde: string; abre_em: string };
};

export type SignupSettings = {
  /** cadastro pelo site aberto? (a aprovação continua sendo da Tayssa) */
  open: boolean;
  /** mensagem de boas-vindas ao aprovar — {name}, {url} */
  welcome_template: string;
};

/** Um número do quadro do site ("2,16 mi" · "Visualizações" · "96% de quem não te segue"). */
export type NumeroSite = { valor: string; rotulo: string; detalhe: string };

export type NumerosSettings = {
  /** o período que os números cobrem ("Últimos 30 dias") */
  periodo: string;
  /** de onde vêm ("Instagram Insights") */
  fonte: string;
  /** até 6; o primeiro é o destaque do celular. Vazio = o quadro não aparece */
  itens: NumeroSite[];
  /** % das visualizações que vêm de quem ainda não segue (barra do celular) */
  nao_seguidores: number | null;
};

export type Settings = {
  business: BusinessSettings;
  rules: RulesSettings;
  birthday: BirthdaySettings;
  whatsapp: WhatsappTemplates;
  loyalty: LoyaltySettings;
  booking: BookingSettings;
  signup: SignupSettings;
  numeros: NumerosSettings;
};

const HORAS_TER_SEX = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];

export const DEFAULT_SETTINGS: Settings = {
  business: {
    name: "Tayssa Farias",
    tagline: "Private Beauty Experience",
    specialty: "Cílios e embelezamento do olhar",
    whatsapp: "5511999827606",
    instagram_url: "https://www.instagram.com/1.tayssa/",
    instagram_handle: "@1.tayssa",
  },
  // o VIP é de quem volta com constância: pontos de uma vez só não bastam
  rules: {
    vip_aberto: false,
    vip_visitas: 4,
    vip_janela_dias: 70,
    vip_intervalo_min: 15,
    vip_intervalo_max: 20,
    inactivity_days: 30,
    benefit_validity_days: 60,
  },
  birthday: {
    mes_inteiro: true,
    window_days_before: 3,
    window_days_after: 3,
    once_per_year: true,
    rules: [
      "Exclusivo para clientes com acesso VIP ativo.",
      "Pode ser usado uma vez por ano, no mês do seu aniversário.",
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
  // os horários que a Tayssa passou: o último de cada dia é o último início
  booking: {
    weekdays: [1, 2, 3, 4, 5, 6],
    slots: HORAS_TER_SEX,
    slots_por_dia: {
      "1": ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"],
      "2": HORAS_TER_SEX,
      "3": HORAS_TER_SEX,
      "4": HORAS_TER_SEX,
      "5": HORAS_TER_SEX,
      "6": ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00"],
    },
    intervalo_min: 60,
    lead_hours: 4,
    horizon_days: 30,
    default_duration_min: 90,
    max_open_per_client: 2,
    deposit_reais: 50,
    sinal_horas: 24,
    tolerancia_min: 10,
    pix_chave: "",
    pix_nome: "",
    pix_cidade: "São Paulo",
    pix_banco: "",
    prioridade_vip: { ativa: false, desde: "", abre_em: "" },
  },
  signup: {
    open: true,
    welcome_template:
      "Oi, {name}! Seu acesso ao site da Tayssa Farias foi liberado. Entre por aqui: {url}",
  },
  // números só da Tayssa: nada inventado — vazio, o quadro não aparece
  numeros: {
    periodo: "Últimos 30 dias",
    fonte: "Instagram Insights",
    itens: [],
    nao_seguidores: null,
  },
};
