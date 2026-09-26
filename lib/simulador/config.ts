/**
 * Simulador de benefício — configuração central.
 *
 * Tudo que muda de um cliente pra outro (marca, número do WhatsApp, textos,
 * faixa da estimativa, tempo do processamento) vive AQUI e só aqui. Os
 * componentes leem daqui; nada disso é espalhado pelo código.
 *
 * A aplicação é 100% cliente: não há backend, banco, API nem consulta a
 * qualquer sistema. O resultado é uma estimativa fictícia de demonstração.
 *
 * Identidade: plataforma independente, com linguagem visual institucional
 * (branco, verde, azul e amarelo). Não é, e não pode parecer ser, um órgão
 * público — por isso o descritor do cabeçalho e as declarações do rodapé.
 */

/* ---------- marca (própria, sem vínculo com órgão público) ---------- */

export const BRAND = {
  /** Nome exibido no cabeçalho, no rodapé e no título da aba. */
  name: "Revisa",
  /** Identificação ao lado do logo: deixa claro que é a própria plataforma. */
  descriptor: "Plataforma independente de simulação de benefício",
  /** Cor da barra do navegador no celular (cabeçalho branco). */
  themeColor: "#ffffff",
  /** Protótipo interno: não indexar em buscadores. */
  indexable: false,
} as const;

/** Menu do cabeçalho: poucos itens, todos âncoras da própria página. */
export const MENU = [
  { label: "Início", href: "#inicio" },
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Ajuda", href: "#ajuda" },
] as const;

/** Etapas do serviço, na ordem do fluxo (indicador de progresso). */
export const STEPS = ["Identificação", "Análise", "Resultado"] as const;

/* ---------- WhatsApp ---------- */

/**
 * Número que recebe a conversa, só dígitos, no formato internacional:
 * DDI + DDD + número (ex.: 55 11 99999-9999 → "5511999999999").
 */
export const WHATSAPP_NUMBER = "5516982525280";

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
  hint: "Aguarde. Isso leva só alguns segundos.",
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
  skipLink: "Ir para o conteúdo",
  header: {
    menu: "Menu",
    closeMenu: "Fechar",
    navLabel: "Navegação principal",
  },
  hero: {
    eyebrow: "Serviço de simulação",
    title: "Simulação de aumento de benefício",
    subtitle: "Informe nome e CPF para gerar uma estimativa gratuita em menos de um minuto.",
  },
  form: {
    heading: "Dados para a simulação",
    intro: "Preencha os dois campos e clique em Consultar agora.",
    name: {
      label: "Nome completo",
      placeholder: "Digite seu nome completo",
      hint: "Como está no seu documento.",
      error: "Digite seu nome completo",
    },
    cpf: {
      label: "CPF",
      placeholder: "000.000.000-00",
      hint: "Somente números.",
      error: "Digite um CPF válido",
    },
    submit: "Consultar agora",
    /** Lido por leitores de tela quando o envio falha na validação. */
    invalidSummary: "Corrija os campos destacados para continuar.",
  },
  howItWorks: {
    title: "Como funciona",
    intro: "Três passos, sem cadastro e sem custo.",
    steps: [
      {
        title: "Informe seus dados",
        text: "Nome completo e CPF, só isso.",
      },
      {
        title: "Simulação na hora",
        text: "Em alguns segundos você recebe uma estimativa de aumento.",
      },
      {
        title: "Atendimento pelo WhatsApp",
        text: "Se quiser continuar, a equipe explica os próximos passos.",
      },
    ],
  },
  help: {
    title: "Ajuda",
    text: "Ficou com dúvida sobre a simulação ou sobre os próximos passos? A equipe responde pelo WhatsApp.",
    contact: {
      label: "Falar com a equipe pelo WhatsApp",
      message: "Olá! Tenho uma dúvida sobre a simulação de benefício.",
    },
  },
  result: {
    eyebrow: "Simulação concluída",
    greeting: "Olá, {nome}",
    lead: "Veja abaixo o resultado da sua simulação.",
    panelTitle: "Resultado da simulação",
    cardLabel: "Estimativa de aumento",
    rangeLabel: "Faixa da simulação",
    attention: "Atenção",
    disclaimer:
      "Resultado estimativo para fins de simulação. Não representa aprovação ou concessão de benefício.",
    ctaPrimary: "Quero continuar",
    ctaPrimaryHint: "Atendimento pelo WhatsApp",
    ctaRedirecting: "Abrindo WhatsApp...",
    ctaSecondary: "Entender como funciona",
    restart: "Fazer nova simulação",
    explainer: {
      title: "Como funciona a análise",
      items: [
        "A simulação apresenta uma estimativa inicial de aumento.",
        "A análise completa é feita pela equipe, com você, pelo WhatsApp, a partir dos seus documentos.",
        "O valor final depende dessa análise.",
      ],
    },
  },
  footer: {
    /** Identificação obrigatória: plataforma própria, sem vínculo com órgão público. */
    statement:
      "{marca} é uma plataforma independente de simulação de benefício, sem vínculo com o Governo Federal, o INSS ou qualquer órgão público.",
    navLabel: "Navegação do rodapé",
  },
} as const;

/* ---------- metadados da página ---------- */

export const SEO = {
  title: `${BRAND.name} — Simulação de benefício`,
  description:
    "Simule em menos de um minuto uma estimativa de aumento do seu benefício. Plataforma independente, gratuita, sem cadastro e sem armazenar dados.",
} as const;
