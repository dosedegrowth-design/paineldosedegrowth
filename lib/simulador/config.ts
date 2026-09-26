/**
 * Simulador de benefício — configuração central.
 *
 * Tudo que muda de um cliente pra outro (marca, número do WhatsApp, textos,
 * faixa da estimativa, tempo do processamento) vive AQUI e só aqui. Os
 * componentes leem daqui; nada disso é espalhado pelo código.
 *
 * A aplicação é 100% cliente: não há backend, banco, API nem consulta a
 * qualquer sistema. O resultado é uma estimativa fictícia de demonstração.
 */

/* ---------- marca (fictícia, sem nenhuma identidade governamental) ---------- */

export const BRAND = {
  /** Nome exibido no cabeçalho, no rodapé e no título da aba. */
  name: "Revisa",
  /** Descritor curto ao lado do nome. */
  tagline: "Simulador de benefício",
  /** Cor da barra do navegador no celular (mesma cor da faixa escura). */
  themeColor: "#0e1a16",
  /** Protótipo interno: não indexar em buscadores. */
  indexable: false,
} as const;

/* ---------- WhatsApp ---------- */

/**
 * Número que recebe a conversa, só dígitos, no formato internacional:
 * DDI + DDD + número (ex.: 55 11 99999-9999 → "5511999999999").
 */
export const WHATSAPP_NUMBER = "5511999999999";

/**
 * Mensagem que já chega preenchida no WhatsApp.
 * Placeholders disponíveis: {nome} (nome informado) e {valor} (estimativa).
 * O CPF nunca entra na mensagem.
 */
export const WHATSAPP_MESSAGE =
  "Olá! Fiz uma simulação e gostaria de saber mais sobre a análise. Meu nome é {nome} e a estimativa foi de {valor}.";

/* ---------- estimativa ---------- */

/** Faixa (em reais, inteiros) de onde sai o valor sorteado a cada simulação. */
export const ESTIMATE = {
  minBRL: 870,
  maxBRL: 1400,
} as const;

/* ---------- processamento (tela de "analisando") ---------- */

export const PROCESSING = {
  /** Duração total da animação de processamento, em milissegundos (3–5 s). */
  durationMs: 4200,
  /** Pausa em 100% antes de mostrar o resultado (o "Finalizando" fica marcado). */
  settleMs: 450,
  title: "Analisando seus dados...",
  hint: "Isso leva só alguns segundos.",
  /** Etapas mostradas progressivamente; `at` é a fração do progresso em que entram. */
  steps: [
    { label: "Validando informações...", at: 0 },
    { label: "Processando simulação...", at: 0.28 },
    { label: "Calculando estimativa...", at: 0.56 },
    { label: "Finalizando...", at: 0.84 },
  ],
} as const;

/* ---------- textos ---------- */

export const COPY = {
  header: {
    pill: "Simulação gratuita",
  },
  hero: {
    eyebrow: "Simulador de benefício",
    title: "Descubra quanto seu benefício pode aumentar",
    subtitle: "Simulação gratuita. Leva menos de 1 minuto.",
  },
  form: {
    heading: "Preencha para simular",
    name: {
      label: "Nome completo",
      placeholder: "Digite seu nome completo",
      error: "Digite seu nome completo",
    },
    cpf: {
      label: "CPF",
      placeholder: "000.000.000-00",
      error: "Digite um CPF válido",
    },
    submit: "Consultar agora",
    /** Lido por leitores de tela quando o envio falha na validação. */
    invalidSummary: "Corrija os campos destacados para continuar.",
    trust: ["Sem custo", "Leva 1 minuto", "Nada é salvo"],
  },
  howItWorks: {
    title: "Como funciona",
    steps: [
      {
        title: "Informe seus dados",
        text: "Nome e CPF, só isso. Nada é enviado nem armazenado.",
      },
      {
        title: "Simulação na hora",
        text: "Em segundos você vê uma estimativa de aumento.",
      },
      {
        title: "Continue pelo WhatsApp",
        text: "Fale com a equipe e entenda os próximos passos.",
      },
    ],
  },
  result: {
    eyebrow: "Simulação concluída",
    greeting: "Olá, {nome}",
    lead: "Aqui está o resultado da sua simulação.",
    cardLabel: "Estimativa de aumento",
    rangeLabel: "Faixa da simulação",
    disclaimer:
      "Resultado estimativo para fins de simulação. Não representa aprovação ou concessão de benefício.",
    ctaPrimary: "Quero continuar",
    ctaPrimaryHint: "Falar no WhatsApp",
    ctaRedirecting: "Abrindo WhatsApp...",
    ctaSecondary: "Entender como funciona",
    restart: "Fazer nova simulação",
    explainer: {
      title: "Como funciona a análise",
      items: [
        "A simulação usa uma faixa de referência para gerar uma estimativa ilustrativa, calculada aqui no seu aparelho.",
        "A análise de verdade é feita pela equipe, com você, pelo WhatsApp.",
        "Nenhum dado é consultado em sistemas externos, enviado a órgãos públicos ou armazenado nesta página.",
      ],
    },
  },
  footer: {
    line1: "{marca} é uma ferramenta de simulação para fins demonstrativos.",
    line2: "Sem vínculo com órgãos públicos. Nenhum dado é enviado ou armazenado.",
  },
} as const;

/* ---------- metadados da página ---------- */

export const SEO = {
  title: `${BRAND.name} — ${BRAND.tagline}`,
  description:
    "Simule em menos de 1 minuto uma estimativa de aumento do seu benefício. Gratuito, sem cadastro e sem armazenar dados.",
} as const;
