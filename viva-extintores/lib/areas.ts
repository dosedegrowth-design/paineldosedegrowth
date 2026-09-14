/**
 * As cinco áreas de atuação (§6 do briefing).
 *
 * A página inicial é o índice; cada área abre a sua própria página. O que
 * muda entre elas mora aqui; o que é igual mora no <PaginaServico>. Cada
 * página mantém a personalidade dela através dos blocos extras e das
 * próprias fotos (§7: implementar com fidelidade, não reinterpretar).
 */

import { ROUTES } from "@/lib/config";
import { FOTOS, type FotoSlot } from "@/lib/photos";

export type AreaSlug =
  | "combate-a-incendio"
  | "alarme-e-deteccao"
  | "spda-para-raios"
  | "laudos-clcb-avcb"
  | "relatorio-tecno-fotografico";

export type Area = {
  slug: AreaSlug;
  href: string;
  /** "01" … "05" */
  numero: string;
  /** rótulo curto da barra de áreas, em duas linhas */
  aba: [string, string];

  /** card da página inicial */
  cardTitulo: [string, string?];
  cardResumo: string;
  cardFoto: FotoSlot;

  /** abertura da página da área */
  heroSublinha: string;
  heroTitulo: [string, string?];
  heroAside: [string, string?];
  heroTexto: string;
  heroFoto: FotoSlot;

  /** bloco de competência */
  blocoTitulo: [string, string?];
  blocoIntro?: string;
  itens: string[];
  ctaRotulo: string;
  ctaMensagem: string;
  selos: string[];
  destaque: FotoSlot;
  galeria: [FotoSlot, FotoSlot, FotoSlot, FotoSlot];

  /** fechamento */
  faixaTitulo: [string, string?];
  faixaTexto: string;
  faixaCta: string;
  fraseFecho: string;

  seo: { titulo: string; descricao: string };
};

export const AREAS: Area[] = [
  // ===============================================================
  {
    slug: "combate-a-incendio",
    href: ROUTES.combate,
    numero: "01",
    aba: ["Bombas e", "hidrantes"],

    cardTitulo: ["Sistemas de", "combate a incêndio"],
    cardResumo:
      "Bombas de incêndio, redes de hidrantes, SPK, painéis de comando e ligações trifásicas.",
    cardFoto: FOTOS.combate.card,

    heroSublinha: "Obras entregues: bombas de incêndio, hidrantes e SPK",
    heroTitulo: ["Sistemas de", "combate a incêndio"],
    heroAside: ["Segurança é", "o que nos move."],
    heroTexto:
      "Projetos, instalações e adequações de sistemas de bombeamento, redes de hidrantes e SPK, com qualidade, segurança e conformidade com as normas técnicas.",
    heroFoto: FOTOS.combate.hero,

    blocoTitulo: ["Sistemas de", "combate a incêndio"],
    blocoIntro:
      "Da casa de bombas à última saída de hidrante: projeto, execução, comissionamento e documentação — com a mesma equipe do começo ao fim.",
    itens: [
      "Casas de bombas e conjuntos completos",
      "Redes de hidrantes e mangotinhos",
      "Redes de chuveiros automáticos (SPK)",
      "Painéis de comando e ligações trifásicas",
      "Adequações e modernização de sistemas existentes",
      "Testes, comissionamento e documentação técnica",
    ],
    ctaRotulo: "Solicite uma análise técnica",
    ctaMensagem:
      "Olá! Vi o portfólio da VIVA e quero falar sobre sistemas de combate a incêndio (bombas, hidrantes ou SPK).",
    selos: ["Projeto e execução própria", "Conformidade com as normas", "Equipe técnica especializada"],
    destaque: FOTOS.combate.destaque,
    galeria: [FOTOS.combate.g1, FOTOS.combate.g2, FOTOS.combate.g3, FOTOS.combate.g4],

    faixaTitulo: ["Soluções em", "prevenção de incêndio."],
    faixaTexto:
      "Fale com a nossa equipe e veja como podemos desenvolver e executar a solução ideal para o seu edifício.",
    faixaCta: "Entre em contato",
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
    aba: ["Alarme e", "detecção"],

    cardTitulo: ["Alarme e", "detecção de incêndio"],
    cardResumo:
      "Centrais, detectores, sirenes, acionadores, infraestrutura e cabeamento — sistema completo, instalado e testado.",
    cardFoto: FOTOS.alarme.card,

    heroSublinha: "Obras de alarme e detecção de incêndio",
    heroTitulo: ["Alarme e", "detecção de incêndio"],
    heroAside: ["Tecnologia que", "avisa a tempo."],
    heroTexto:
      "Projetos, instalações e adequações de sistemas de alarme e detecção de incêndio, com tecnologia, confiabilidade e conformidade com as normas técnicas.",
    heroFoto: FOTOS.alarme.hero,

    blocoTitulo: ["Obras de alarme", "e detecção de incêndio"],
    blocoIntro:
      "Projetar e executar sistemas de detecção e alarme sem improviso: da central ao último detector, com cabeamento próprio e teste ponto a ponto.",
    itens: [
      "Centrais de alarme e detecção",
      "Instalação de dispositivos: detectores, sirenes e acionadores manuais",
      "Infraestrutura e cabeamento do sistema",
      "Adequações e modernização de sistemas existentes",
      "Integração com outros sistemas (iluminação de emergência, pressurização)",
      "Testes, comissionamento e documentação técnica",
    ],
    ctaRotulo: "Solicite uma análise técnica",
    ctaMensagem:
      "Olá! Vi o portfólio da VIVA e quero falar sobre sistema de alarme e detecção de incêndio.",
    selos: ["Sistema testado ponto a ponto", "Conformidade com as normas", "Suporte após a entrega"],
    destaque: FOTOS.alarme.destaque,
    galeria: [FOTOS.alarme.g1, FOTOS.alarme.g2, FOTOS.alarme.g3, FOTOS.alarme.g4],

    faixaTitulo: ["Sistemas inteligentes", "para mais segurança."],
    faixaTexto:
      "Fale com a nossa equipe e veja como podemos projetar e instalar a detecção certa para a sua edificação.",
    faixaCta: "Entre em contato",
    fraseFecho: "Tecnologia e segurança para o seu dia a dia.",

    seo: {
      titulo: "Alarme e detecção de incêndio",
      descricao:
        "Centrais, detectores, sirenes, acionadores, infraestrutura e cabeamento: projeto, instalação e adequação de sistemas de alarme pela VIVA Extintores.",
    },
  },

  // ===============================================================
  {
    slug: "spda-para-raios",
    href: ROUTES.spda,
    numero: "03",
    aba: ["SPDA", "para-raios"],

    cardTitulo: ["SPDA", "(para-raios)"],
    cardResumo:
      "Projeto, execução e medição de sistemas de proteção contra descargas atmosféricas.",
    cardFoto: FOTOS.spda.card,

    heroSublinha: "Obras de SPDA — para-raios",
    heroTitulo: ["SPDA", "para-raios"],
    heroAside: ["Mais segurança para", "o seu patrimônio."],
    heroTexto:
      "Projetos, instalação e adequação de Sistemas de Proteção contra Descargas Atmosféricas (SPDA), com engenharia, execução própria e conformidade com as normas técnicas.",
    heroFoto: FOTOS.spda.hero,

    blocoTitulo: ["Obras de SPDA", "e para-raios"],
    blocoIntro:
      "Não vendemos para-raios: executamos sistemas de SPDA. Dimensionamento, obra na cobertura, aterramento, medição e laudo — com equipe e equipamentos próprios.",
    itens: [
      "Dimensionamento e projeto de SPDA",
      "Captores, mastros, malhas e condutores de descida",
      "Aterramento e equalização de potenciais",
      "Medição com terrômetro e laudo técnico (NBR 5419)",
      "Adequação de sistemas em edificações existentes",
      "Sinalização, identificação e documentação da obra",
      "Equipe especializada e equipamentos próprios",
    ],
    ctaRotulo: "Solicite uma análise técnica",
    ctaMensagem:
      "Olá! Vi o portfólio da VIVA e quero falar sobre SPDA / para-raios.",
    selos: ["Medição com terrômetro", "Laudo técnico NBR 5419", "Equipe e equipamentos próprios"],
    destaque: FOTOS.spda.destaque,
    galeria: [FOTOS.spda.g1, FOTOS.spda.g2, FOTOS.spda.g3, FOTOS.spda.g4],

    faixaTitulo: ["Proteção contra", "descargas atmosféricas."],
    faixaTexto:
      "Fale com a nossa equipe e entenda o que o seu edifício precisa para ficar protegido e regular.",
    faixaCta: "Entre em contato",
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
    aba: ["Laudos, CLCB", "e AVCB"],

    cardTitulo: ["Laudos, CLCB", "e AVCB"],
    cardResumo:
      "Regularização de edificações comerciais, condomínios e empresas junto ao Corpo de Bombeiros.",
    cardFoto: FOTOS.laudos.card,

    heroSublinha: "Projetos, regularização, CLCB e AVCB",
    heroTitulo: ["Do projeto", "à aprovação"],
    heroAside: ["Regularização que", "valoriza o seu imóvel."],
    heroTexto:
      "Regularização de edificações comerciais, condomínios e empresas junto ao Corpo de Bombeiros, com projeto, obra e toda a documentação necessária até a aprovação.",
    heroFoto: FOTOS.laudos.hero,

    blocoTitulo: ["AVCB e CLCB em comércios,", "condomínios e empresas"],
    blocoIntro:
      "Da análise e do projeto à execução e à aprovação. Inclusive em edificação antiga, ocupação complexa e obra que já começou torta.",
    itens: [
      "Levantamento técnico e diagnóstico da edificação",
      "Elaboração de projetos e ART",
      "Adequações e obras de combate a incêndio",
      "Acompanhamento do processo junto ao Corpo de Bombeiros",
      "Entrega do CLCB ou do AVCB",
      "Regularização de edificações existentes e antigas",
      "Atendimento personalizado e suporte especializado",
    ],
    ctaRotulo: "Solicite uma análise técnica",
    ctaMensagem:
      "Olá! Vi o portfólio da VIVA e quero regularizar minha edificação (CLCB / AVCB).",
    selos: ["Projeto e obra na mesma casa", "Acompanhamento até a aprovação", "Edificações antigas e complexas"],
    destaque: FOTOS.laudos.avcb,
    galeria: [FOTOS.laudos.o1, FOTOS.laudos.o2, FOTOS.laudos.o3, FOTOS.laudos.o4],

    faixaTitulo: ["Segurança, regularização e", "valorização para o seu imóvel."],
    faixaTexto:
      "Fale com a nossa equipe, receba o diagnóstico da sua edificação e um caminho claro até a aprovação.",
    faixaCta: "Entre em contato",
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
    aba: ["Relatório e", "manutenção"],

    cardTitulo: ["Relatório tecno-fotográfico", "e manutenção"],
    cardResumo:
      "Inspeção técnica, registro fotográfico, diagnóstico e plano de manutenção do seu sistema de incêndio.",
    cardFoto: FOTOS.relatorio.card,

    heroSublinha: "Relatório Tecno-Fotográfico",
    heroTitulo: ["A real situação do seu", "sistema de incêndio"],
    heroAside: ["Inspeção técnica real,", "sem surpresa depois."],
    heroTexto:
      "Mais de 20 itens de segurança contra incêndio verificados, registrados e documentados. O Relatório Tecno-Fotográfico mostra ao síndico, ao gestor e ao empresário o cenário real dos sistemas de combate e proteção da edificação — o que está em conformidade, o que falhou e o que precisa de correção.",
    heroFoto: FOTOS.relatorio.hero,

    blocoTitulo: ["Do diagnóstico à solução.", "Mais controle, menos riscos."],
    blocoIntro:
      "A inspeção percorre a edificação item por item e registra tudo em foto. No fim, o responsável recebe um documento que dá para ler, entender e usar para decidir.",
    itens: [
      "Inspeção técnica presencial, item por item",
      "Registro fotográfico de cada ponto verificado",
      "Identificação do que está em conformidade",
      "Identificação de falhas, pendências e pontos críticos",
      "Plano de manutenção com prioridades",
      "Documento pronto para prestação de contas em assembleia",
    ],
    ctaRotulo: "Solicite uma inspeção técnica",
    ctaMensagem:
      "Olá! Quero solicitar uma inspeção técnica e o Relatório Tecno-Fotográfico do meu prédio.",
    selos: ["+20 itens verificados", "Registro fotográfico de tudo", "Plano de ação com prioridades"],
    destaque: FOTOS.relatorio.conforme,
    galeria: [
      FOTOS.relatorio.m1,
      FOTOS.relatorio.m2,
      FOTOS.relatorio.m3,
      FOTOS.relatorio.falha,
    ],

    faixaTitulo: ["Segurança e gestão,", "prevenção e inteligência."],
    faixaTexto:
      "Agende a inspeção e receba o retrato real do sistema de incêndio da sua edificação.",
    faixaCta: "Solicite uma inspeção técnica",
    fraseFecho: "Segurança não é apenas ter AVCB. É manter o sistema funcionando.",

    seo: {
      titulo: "Relatório Tecno-Fotográfico e manutenção",
      descricao:
        "Mais de 20 itens de segurança contra incêndio verificados, registrados em foto e documentados — com plano de manutenção e execução das correções.",
    },
  },
];

export const AREAS_POR_SLUG: Record<AreaSlug, Area> = Object.fromEntries(
  AREAS.map((a) => [a.slug, a]),
) as Record<AreaSlug, Area>;

export function area(slug: AreaSlug): Area {
  return AREAS_POR_SLUG[slug];
}
