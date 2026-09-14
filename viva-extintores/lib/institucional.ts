/**
 * Conteúdo das páginas do site fora do portfólio.
 *
 * Regra que vale aqui como em todo o resto: nada de fato inventado. Onde
 * a VIVA precisa preencher (história, endereço, certificações), o campo
 * fica marcado e a página mostra o espaço — não inventa.
 */

import { ROUTES } from "@/lib/config";

/* ---------------- Início ---------------- */

export const HOME = {
  // A abertura segue a referência aprovada: eyebrow curto, título de três
  // linhas fechado com o ponto vermelho, uma frase e o CTA. Nada de
  // número aqui — eles entram lá embaixo, dentro da narrativa.
  hero: {
    eyebrow: "VIVA Extintores",
    titulo: ["Soluções completas", "em segurança", "contra incêndio"],
    texto:
      "Projetos, instalações, laudos, manutenções e treinamentos com qualidade, responsabilidade e resultados reais.",
    aside: ["Segurança é", "o que nos move."],
  },
  areas: {
    titulo: "Cinco frentes | um responsável só",
    texto:
      "Escolha uma área e conheça nossos projetos, diferenciais e casos reais.",
  },
  sobre: {
    eyebrow: "Sobre a VIVA",
    titulo: ["Pegamos o problema", "e resolvemos."],
    texto:
      "A VIVA atua desde o diagnóstico e o projeto até a execução, a regularização e a manutenção dos sistemas de segurança contra incêndio. Engenharia, obra e documentação na mesma casa — para o síndico, o gestor e o empresário tratarem com um responsável só.",
  },
  faixa: {
    titulo: ["Mais que obras.", "Tranquilidade."],
    texto: "Fale com a nossa equipe e encontre a solução ideal para o seu imóvel ou empresa.",
  },
  fecho: "VIVA Extintores. Protegendo pessoas, patrimônios e o seu futuro.",
} as const;

/* ---------------- Sobre nós ---------------- */

export const SOBRE = {
  hero: {
    sublinha: "Quem faz",
    titulo: ["Engenharia de", "segurança contra incêndio."],
    texto:
      "Uma equipe que projeta, executa, regulariza e mantém — do diagnóstico à aprovação no Corpo de Bombeiros.",
    aside: ["Obra real.", "Responsabilidade", "técnica."],
  },
  pilares: [
    {
      titulo: "Engenheiro especialista",
      texto:
        "Engenheiro e bombeiro especialistas em obra, não só em papel. Quem assina o projeto é quem acompanha a execução.",
    },
    {
      titulo: "Equipe técnica própria",
      texto:
        "A mesma equipe do diagnóstico à entrega, com equipamentos próprios. Sem terceirizar o que é responsabilidade nossa.",
    },
    {
      titulo: "Conformidade com as normas",
      texto:
        "Projeto, execução e documentação dentro das normas técnicas e das exigências do Corpo de Bombeiros.",
    },
    {
      titulo: "Soluções para todos os portes",
      texto:
        "Do comércio de esquina ao condomínio antigo e à planta industrial. Inclusive nos casos que ninguém quis pegar.",
    },
  ],
  historia: {
    titulo: ["O que já", "entregamos."],
    texto:
      "Mais de 15 anos executando obras de combate a incêndio, detecção, SPDA e regularização. Obra executada, documentação aprovada e cliente atendido — é essa a conta que importa.",
  },
} as const;

/* ---------------- Serviços ---------------- */

export type Servico = {
  titulo: string;
  texto: string;
  /** quando existe página no portfólio, o card leva para lá */
  href?: string;
  icone:
    | "bomba"
    | "alarme"
    | "raio"
    | "documento"
    | "extintor"
    | "prancheta"
    | "pessoas";
};

export const SERVICOS: Servico[] = [
  {
    titulo: "Sistemas de combate a incêndio",
    texto:
      "Bombas de incêndio, redes de hidrantes, SPK, painéis de comando e ligações trifásicas.",
    href: ROUTES.combate,
    icone: "bomba",
  },
  {
    titulo: "Alarme e detecção de incêndio",
    texto:
      "Centrais, detectores, sirenes, botoeiras, infraestrutura e cabeamento.",
    href: ROUTES.alarme,
    icone: "alarme",
  },
  {
    titulo: "SPDA / para-raios",
    texto:
      "Projeto, execução, aterramento, medição e laudo conforme a NBR 5419.",
    href: ROUTES.spda,
    icone: "raio",
  },
  {
    titulo: "Laudos, CLCB e AVCB",
    texto:
      "Regularização de comércios, condomínios e empresas junto ao Corpo de Bombeiros.",
    href: ROUTES.laudos,
    icone: "documento",
  },
  {
    titulo: "Relatório Tecno-Fotográfico e manutenção",
    texto:
      "Mais de 20 itens verificados e documentados — e a execução das correções.",
    href: ROUTES.relatorio,
    icone: "prancheta",
  },
  {
    titulo: "Extintores, recarga e produtos",
    texto:
      "Venda, recarga, substituição e manutenção dos equipamentos de combate a incêndio, com validade em dia.",
    icone: "extintor",
  },
  {
    titulo: "Treinamento de brigada de incêndio",
    texto:
      "Formação e reciclagem da brigada da sua edificação, conforme a norma aplicável.",
    icone: "pessoas",
  },
];

export const SERVICOS_PAGINA = {
  hero: {
    sublinha: "O que a VIVA faz",
    titulo: ["Serviços de ponta", "a ponta."],
    texto:
      "Do projeto executivo às obras corretivas e preventivas do seu edifício — com a documentação que o Corpo de Bombeiros exige.",
    aside: ["Uma equipe.", "Um responsável."],
  },
  nota:
    "Quer ver o trabalho executado, e não só a descrição? O portfólio traz as obras reais de cada área.",
} as const;

/* ---------------- Clientes ---------------- */

export const CLIENTES_PAGINA = {
  hero: {
    sublinha: "Quem confia na VIVA",
    titulo: ["Clientes que", "dormem tranquilos."],
    texto:
      "Condomínios, comércios, indústrias e empresas atendidas do diagnóstico à aprovação.",
    aside: ["Obra entregue.", "Documento", "aprovado."],
  },
} as const;

/* ---------------- Contato ---------------- */

export const CONTATO_PAGINA = {
  hero: {
    sublinha: "Fale com a gente",
    titulo: ["Conte o seu", "problema."],
    texto:
      "A gente avalia a sua edificação e devolve um caminho técnico claro: o que precisa ser feito, em que ordem e por quê.",
    aside: ["Resposta", "de quem executa."],
  },
  passos: [
    { n: "01", titulo: "Você conta a situação", texto: "Pelo WhatsApp ou telefone, em linguagem normal." },
    { n: "02", titulo: "A gente avalia", texto: "Visita técnica quando o caso pede." },
    { n: "03", titulo: "Você recebe o caminho", texto: "Escopo, prioridades e orçamento por escrito." },
  ],
} as const;
