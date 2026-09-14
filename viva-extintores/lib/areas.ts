/**
 * As cinco áreas do portfólio.
 *
 * A lista é fechada e veio da especificação do cliente: são CINCO, nesta
 * ordem e com estes nomes. Não vira seis. Treinamento de Brigada não
 * entra aqui (vive em /servicos). Relatório Tecno-Fotográfico e
 * Manutenção são UMA página, não duas. Não existe página genérica de
 * "Projetos e Laudos" por fora da 04.
 */

import { ROUTES } from "@/lib/config";
import { FOTOS, type FotoSlot } from "@/lib/photos";

export type AreaSlug =
  | "combate-a-incendio"
  | "alarme-e-deteccao"
  | "spda-para-raios"
  | "laudos-clcb-avcb"
  | "relatorio-tecno-fotografico";

/** Ícone da barra de áreas — desenhado em components/ui/icones.tsx. */
export type AreaIcone = "bomba" | "alarme" | "raio" | "documento" | "extintor";

export type Area = {
  slug: AreaSlug;
  href: string;
  /** "01" … "05" */
  numero: string;
  icone: AreaIcone;
  /** rótulo da barra de áreas, em duas linhas */
  aba: [string, string];
  /** nome canônico da área */
  nome: string;

  /** card da página-mãe */
  cardTitulo: [string, string?];
  cardResumo: string;
  cardFoto: FotoSlot;

  /** abertura da página */
  heroSublinha: string;
  heroTitulo: [string, string?];
  heroAside: [string, string?, string?];
  heroTexto: string;
  heroFoto: FotoSlot;

  /** bloco de competência */
  blocoTitulo: [string, string?];
  blocoIntro: string;
  itens: string[];
  ctaRotulo: string;
  ctaMensagem: string;
  destaque: FotoSlot;
  galeria: FotoSlot[];

  /** fechamento */
  faixaTitulo: [string, string?];
  faixaTexto: string;
  fraseFecho: string;

  seo: { titulo: string; descricao: string };
};

export const AREAS: Area[] = [
  // ===============================================================
  {
    slug: "combate-a-incendio",
    href: ROUTES.combate,
    numero: "01",
    icone: "bomba",
    aba: ["Bombas e", "hidrantes"],
    nome: "Sistemas de Combate a Incêndio",

    cardTitulo: ["Sistemas de", "combate a incêndio"],
    cardResumo:
      "Bombas de incêndio, redes de hidrantes, SPK, painéis de comando e ligações trifásicas.",
    cardFoto: FOTOS.combate.card,

    heroSublinha: "Bombas de incêndio, hidrantes e SPK",
    heroTitulo: ["Sistemas de", "combate a incêndio"],
    heroAside: ["Segurança é", "infraestrutura", "que funciona."],
    heroTexto:
      "A casa de bombas, a rede de hidrantes e o SPK só aparecem no dia em que falham. A VIVA dimensiona, executa, comissiona e documenta — da tubulação à ligação trifásica.",
    heroFoto: FOTOS.combate.hero,

    blocoTitulo: ["O que entra", "nessa obra"],
    blocoIntro:
      "Sistema de bombeamento, rede de hidrantes e chuveiros automáticos dimensionados para a edificação, executados dentro das normas técnicas e das exigências do Corpo de Bombeiros.",
    itens: [
      "Casas de bombas e conjuntos completos",
      "Redes de hidrantes e mangotinhos",
      "Obras de painéis e ligações trifásicas",
      "Adequações e modernizações",
      "Testes, comissionamento e documentação",
    ],
    ctaRotulo: "Solicite uma análise técnica",
    ctaMensagem:
      "Olá! Vi o site da VIVA e quero falar sobre sistemas de combate a incêndio (bombas, hidrantes ou SPK).",
    destaque: FOTOS.combate.destaque,
    galeria: [FOTOS.combate.g1, FOTOS.combate.g2, FOTOS.combate.g3, FOTOS.combate.g4],

    faixaTitulo: ["O seu sistema aguenta", "o dia em que precisar?"],
    faixaTexto:
      "A gente avalia o que está instalado hoje e devolve por escrito o que falta, em que ordem e por quê.",
    fraseFecho: "Sistema comissionado é sistema que responde na hora.",

    seo: {
      titulo: "Sistemas de combate a incêndio",
      descricao:
        "Bombas de incêndio, redes de hidrantes, SPK, painéis de comando e ligações trifásicas: projeto, execução e adequação pela VIVA Extintores.",
    },
  },

  // ===============================================================
  {
    slug: "alarme-e-deteccao",
    href: ROUTES.alarme,
    numero: "02",
    icone: "alarme",
    aba: ["Alarme e", "detecção"],
    nome: "Alarme e Detecção de Incêndio",

    cardTitulo: ["Alarme e", "detecção de incêndio"],
    cardResumo:
      "Centrais, detectores, sirenes, botoeiras, infraestrutura e cabeamento — sistema completo, instalado e testado.",
    cardFoto: FOTOS.alarme.card,

    heroSublinha: "Centrais, detectores, sirenes e botoeiras",
    heroTitulo: ["Alarmes e", "detecção de incêndio"],
    heroAside: ["Detecção", "que salva vidas."],
    heroTexto:
      "Detectar cedo é o que separa o susto do sinistro. A VIVA instala central, detectores, sirenes, botoeiras e toda a infraestrutura — e testa ponto a ponto antes de entregar.",
    heroFoto: FOTOS.alarme.hero,

    blocoTitulo: ["O que entra", "nessa obra"],
    blocoIntro:
      "Central, dispositivos, infraestrutura e cabeamento de um sistema de alarme e detecção — instalados, comissionados e documentados conforme as normas técnicas.",
    itens: [
      "Centrais de alarme e detecção",
      "Instalação de dispositivos (botoeiras, sirenes e detectores)",
      "Infraestrutura e cabeamento do sistema",
      "Adequações e modernizações",
      "Testes, comissionamento e documentação",
      "Integração com outros sistemas (ex.: luz de emergência)",
    ],
    ctaRotulo: "Solicite uma análise técnica",
    ctaMensagem:
      "Olá! Vi o site da VIVA e quero falar sobre sistema de alarme e detecção de incêndio.",
    destaque: FOTOS.alarme.destaque,
    galeria: [FOTOS.alarme.g1, FOTOS.alarme.g2, FOTOS.alarme.g3, FOTOS.alarme.g4],

    faixaTitulo: ["Detectar cedo", "custa menos."],
    faixaTexto:
      "Fale com a equipe técnica e veja o que a sua edificação precisa para identificar um princípio de incêndio a tempo.",
    fraseFecho: "Alarme bom toca na hora certa — e só na hora certa.",

    seo: {
      titulo: "Alarme e detecção de incêndio",
      descricao:
        "Centrais, detectores, sirenes, botoeiras, infraestrutura e cabeamento: projeto, instalação e adequação de sistemas de alarme pela VIVA Extintores.",
    },
  },

  // ===============================================================
  {
    slug: "spda-para-raios",
    href: ROUTES.spda,
    numero: "03",
    icone: "raio",
    aba: ["SPDA", "para-raios"],
    nome: "SPDA / Para-raios",

    cardTitulo: ["SPDA", "(para-raios)"],
    cardResumo:
      "Projeto, execução, aterramento e medição de sistemas de proteção contra descargas atmosféricas.",
    cardFoto: FOTOS.spda.card,

    heroSublinha: "Captores, descidas, aterramento e medição",
    heroTitulo: ["SPDA", "para-raios"],
    heroAside: ["Mais segurança", "para o seu", "patrimônio."],
    heroTexto:
      "Para-raios não é enfeite de cobertura: é caminho controlado para a descarga. A VIVA dimensiona, executa, mede o aterramento e emite o laudo conforme a NBR 5419.",
    heroFoto: FOTOS.spda.hero,

    blocoTitulo: ["O que entra", "nessa obra"],
    blocoIntro:
      "Dimensionamento, captores, descidas, aterramento e equalização — com medição e laudo conforme a NBR 5419, inclusive em edificação que já está de pé.",
    itens: [
      "Projetos e dimensionamento de SPDA",
      "Instalação de captores, mastros e descidas",
      "Aterramento e equalização",
      "Medição e laudos técnicos (NBR 5419)",
      "Adequações em edificações existentes",
      "Equipe especializada e equipamentos próprios",
    ],
    ctaRotulo: "Solicite uma análise técnica",
    ctaMensagem: "Olá! Vi o site da VIVA e quero falar sobre SPDA / para-raios.",
    destaque: FOTOS.spda.destaque,
    galeria: [FOTOS.spda.g1, FOTOS.spda.g2, FOTOS.spda.g3, FOTOS.spda.g4],

    faixaTitulo: ["A descarga procura", "o caminho mais fácil."],
    faixaTexto:
      "O trabalho da VIVA é garantir que esse caminho seja o SPDA, e não a estrutura do seu prédio.",
    fraseFecho: "Medição feita, laudo na mão, patrimônio protegido.",

    seo: {
      titulo: "SPDA e para-raios",
      descricao:
        "Projeto, execução, aterramento, medição e laudo de SPDA conforme a NBR 5419, com equipe e equipamentos próprios da VIVA Extintores.",
    },
  },

  // ===============================================================
  {
    slug: "laudos-clcb-avcb",
    href: ROUTES.laudos,
    numero: "04",
    icone: "documento",
    aba: ["Laudos, CLCB", "e AVCB"],
    nome: "Laudos, CLCB e AVCB",

    cardTitulo: ["Laudos, CLCB", "e AVCB"],
    cardResumo:
      "Regularização de edificações comerciais, condomínios e empresas junto ao Corpo de Bombeiros.",
    cardFoto: FOTOS.laudos.card,

    heroSublinha: "Regularização junto ao Corpo de Bombeiros",
    heroTitulo: ["Do projeto", "à aprovação."],
    heroAside: ["Regularização", "que valoriza", "o seu imóvel."],
    heroTexto:
      "CLCB e AVCB não saem de um formulário: saem de projeto, obra e documentação batendo com o que está construído. A VIVA faz as três partes e acompanha até a aprovação.",
    heroFoto: FOTOS.laudos.hero,

    blocoTitulo: ["Do levantamento", "à aprovação"],
    blocoIntro:
      "Levantamento técnico, projeto, ART, execução das adequações e acompanhamento junto ao Corpo de Bombeiros até a emissão do CLCB ou do AVCB.",
    itens: [
      "Levantamento técnico e diagnóstico",
      "Elaboração de projetos e ART/RRT",
      "Adequações e obras de combate a incêndio",
      "Acompanhamento junto ao Corpo de Bombeiros",
      "Entrega do CLCB ou AVCB",
      "Regularização de edificações existentes (condomínios antigos)",
      "Atendimento personalizado e equipe especializada",
    ],
    ctaRotulo: "Solicite uma consultoria",
    ctaMensagem:
      "Olá! Vi o site da VIVA e quero regularizar minha edificação (CLCB / AVCB).",
    destaque: FOTOS.laudos.avcb,
    galeria: [FOTOS.laudos.g1, FOTOS.laudos.g2, FOTOS.laudos.g3, FOTOS.laudos.g4],

    faixaTitulo: ["Regularizar é", "destravar o imóvel."],
    faixaTexto:
      "Comércio sem CLCB não abre as portas; condomínio sem AVCB trava seguro e financiamento. Conte a sua situação e receba o caminho por escrito.",
    fraseFecho: "Documentação aprovada é obra que bate com o papel.",

    seo: {
      titulo: "Laudos, CLCB e AVCB",
      descricao:
        "Regularização de condomínios, comércios e empresas junto ao Corpo de Bombeiros: projeto, ART, obra, acompanhamento e entrega do CLCB ou AVCB.",
    },
  },

  // ===============================================================
  {
    slug: "relatorio-tecno-fotografico",
    href: ROUTES.relatorio,
    numero: "05",
    icone: "extintor",
    aba: ["Relatório e", "manutenção"],
    nome: "Relatório Tecno-Fotográfico + Manutenção",

    cardTitulo: ["Relatório tecno-fotográfico", "e manutenção"],
    cardResumo:
      "Diagnóstico da real situação dos sistemas de incêndio da sua edificação — e a execução das correções.",
    cardFoto: FOTOS.relatorio.card,

    heroSublinha: "Relatório Tecno-Fotográfico",
    heroTitulo: ["A real situação do seu", "sistema de incêndio."],
    heroAside: ["Inspeção técnica hoje.", "Mais segurança sempre."],
    heroTexto:
      "Mais de 20 itens do sistema de incêndio verificados em campo, fotografados um a um e classificados: o que está conforme, o que precisa de manutenção e o que exige correção. O síndico e o gestor passam a decidir com o cenário real na mão.",
    heroFoto: FOTOS.relatorio.hero,

    blocoTitulo: ["Do diagnóstico", "à correção"],
    blocoIntro:
      "Cada item é verificado em campo, registrado em foto e classificado. O relatório vira plano de ação com prioridade e custo — e a VIVA executa as correções.",
    itens: [
      "Levantamento em campo",
      "Registro fotográfico de cada item",
      "Relatório detalhado",
      "Conformidades e não conformidades",
      "Plano de ação e orientações",
    ],
    ctaRotulo: "Solicite uma inspeção técnica",
    ctaMensagem:
      "Olá! Quero solicitar uma inspeção técnica e o Relatório Tecno-Fotográfico do meu prédio.",
    destaque: FOTOS.relatorio.conforme,
    galeria: [FOTOS.relatorio.g1, FOTOS.relatorio.g2, FOTOS.relatorio.g3],

    faixaTitulo: ["Ter AVCB não é", "ter sistema funcionando."],
    faixaTexto:
      "Peça a inspeção técnica e veja, item por item, em que estado está o sistema da sua edificação hoje.",
    fraseFecho: "Segurança não é ter o documento. É manter o sistema de pé.",

    seo: {
      titulo: "Relatório Tecno-Fotográfico e manutenção",
      descricao:
        "Mais de 20 itens de segurança contra incêndio verificados, registrados em foto e documentados — com plano de ação e execução das correções.",
    },
  },
];

export const AREAS_POR_SLUG: Record<AreaSlug, Area> = Object.fromEntries(
  AREAS.map((a) => [a.slug, a]),
) as Record<AreaSlug, Area>;

export function area(slug: AreaSlug): Area {
  return AREAS_POR_SLUG[slug];
}
