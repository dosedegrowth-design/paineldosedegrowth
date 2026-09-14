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

    heroSublinha: "Projetos entregues: bombas de incêndio, SPK e hidrantes",
    heroTitulo: ["Sistemas de", "combate a incêndio"],
    heroAside: ["Segurança é", "infraestrutura", "que funciona."],
    heroTexto:
      "Projetos, instalações e adequações de sistemas de bombeamento, redes de hidrantes e SPK, com qualidade, segurança e conformidade com as normas técnicas.",
    heroFoto: FOTOS.combate.hero,

    blocoTitulo: ["Obras reais em", "clientes satisfeitos!"],
    blocoIntro:
      "Projetos, adequações e instalações completas de sistemas de bombeamento, redes de hidrantes e SPK, atendendo às exigências do Corpo de Bombeiros e às normas técnicas vigentes.",
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

    faixaTitulo: ["Soluções em", "prevenção de incêndio."],
    faixaTexto:
      "Fale com a nossa equipe e veja como podemos desenvolver a solução ideal para o seu edifício.",
    fraseFecho: "Obras reais, segurança em cada detalhe.",

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

    heroSublinha: "Obras de alarme e detecção de incêndio",
    heroTitulo: ["Alarmes e", "detecção de incêndio"],
    heroAside: ["Detecção", "que salva vidas."],
    heroTexto:
      "Projetos, instalações e adequações de sistemas de alarme e detecção de incêndio, com tecnologia, confiabilidade e conformidade com as normas técnicas.",
    heroFoto: FOTOS.alarme.hero,

    blocoTitulo: ["Obras de alarme", "e detecção de incêndio"],
    blocoIntro:
      "Projetos, instalações e adequações completas de sistemas de alarme e detecção de incêndio, com equipamentos certificados e atendimento às normas técnicas vigentes.",
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

    faixaTitulo: ["Sistemas inteligentes", "para mais segurança."],
    faixaTexto:
      "Fale com a nossa equipe e veja como podemos desenvolver a solução ideal para o seu edifício.",
    fraseFecho: "Tecnologia e segurança para o seu dia a dia.",

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

    heroSublinha: "Obras de SPDA — para-raios",
    heroTitulo: ["SPDA", "para-raios"],
    heroAside: ["Mais segurança", "para o seu", "patrimônio."],
    heroTexto:
      "Projetos, instalações e adequações de Sistemas de Proteção contra Descargas Atmosféricas (SPDA), com segurança, tecnologia e conformidade com as normas técnicas.",
    heroFoto: FOTOS.spda.hero,

    blocoTitulo: ["Obras de SPDA", "e para-raios"],
    blocoIntro:
      "Instalação e manutenção de sistemas de para-raios, com equipe especializada, equipamentos certificados e total conformidade com as normas vigentes (NBR 5419).",
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
    galeria: [
      FOTOS.spda.g1,
      FOTOS.spda.g2,
      FOTOS.spda.g3,
      FOTOS.spda.g4,
      FOTOS.spda.g5,
    ],

    faixaTitulo: ["Proteção contra", "descargas atmosféricas."],
    faixaTexto:
      "Fale com a nossa equipe e veja como podemos desenvolver a solução ideal para o seu edifício.",
    fraseFecho: "Segurança para hoje. Tranquilidade sempre.",

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

    heroSublinha: "Entrega de laudos, CLCB e AVCB",
    heroTitulo: ["Do projeto", "à aprovação."],
    heroAside: ["Regularização", "que valoriza", "o seu imóvel."],
    heroTexto:
      "Regularização de edificações comerciais, condomínios e empresas junto ao Corpo de Bombeiros, com projetos, obras e toda a documentação técnica.",
    heroFoto: FOTOS.laudos.hero,

    blocoTitulo: ["AVCB e CLCB em comércios,", "condomínios e empresas"],
    blocoIntro:
      "Elaboração de projetos, execução de obras e entrega de laudos completos para obtenção do CLCB e AVCB, garantindo a segurança, a conformidade legal e a tranquilidade do seu negócio.",
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
    galeria: [FOTOS.laudos.o1, FOTOS.laudos.o2, FOTOS.laudos.o3, FOTOS.laudos.o4],

    faixaTitulo: ["Segurança, regularização", "e valorização para o seu imóvel."],
    faixaTexto:
      "Conte com a nossa equipe e garanta a aprovação do seu AVCB ou CLCB com agilidade e segurança.",
    fraseFecho: "Obras reais. Documentação aprovada. Clientes satisfeitos.",

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
      "Mais de 20 itens de segurança contra incêndio verificados, registrados e documentados. O Relatório Tecno-Fotográfico apresenta ao síndico e ao empresário o cenário real dos sistemas de combate a incêndio da edificação, identificando equipamentos em conformidade, necessidades de manutenção e pontos que exigem correção — ajudando a manter o AVCB e a segurança em dia.",
    heroFoto: FOTOS.relatorio.hero,

    blocoTitulo: ["Do diagnóstico à solução.", "Mais controle, menos riscos."],
    blocoIntro:
      "O relatório avalia visualmente e tecnicamente os principais itens do sistema de segurança contra incêndio, com fotos, status e recomendações, permitindo decisões assertivas e planejamento de manutenções.",
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
    galeria: [
      FOTOS.relatorio.m1,
      FOTOS.relatorio.m2,
      FOTOS.relatorio.m3,
      FOTOS.relatorio.m4,
      FOTOS.relatorio.m5,
    ],

    faixaTitulo: ["Segurança é gestão.", "Prevenção é inteligência."],
    faixaTexto:
      "Equipe técnica especializada. Relatórios claros. Soluções completas.",
    fraseFecho: "Segurança não é apenas ter AVCB. É manter o sistema funcionando.",

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
