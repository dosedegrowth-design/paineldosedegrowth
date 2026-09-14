/**
 * Conteúdo exclusivo da página 04 — Laudos, CLCB e AVCB (§11).
 *
 * Dois caminhos de regularização, para o visitante se reconhecer num
 * deles antes de falar com a gente.
 */

export const DOCUMENTOS = [
  {
    sigla: "CLCB",
    nome: "Certificado de Licença do Corpo de Bombeiros",
    para: "Comércios e serviços de menor porte e risco",
    texto:
      "Licenciamento simplificado para a edificação que se enquadra nos critérios do Corpo de Bombeiros, com vistoria e emissão pelo processo eletrônico.",
  },
  {
    sigla: "AVCB",
    nome: "Auto de Vistoria do Corpo de Bombeiros",
    para: "Condomínios, empresas e edificações de maior porte",
    texto:
      "Projeto técnico, ART, execução das adequações e acompanhamento da vistoria até a emissão do auto — inclusive em edificação antiga ou com ocupação complexa.",
  },
] as const;

/** Etapas — o caminho que o cliente percorre com a VIVA. */
export const ETAPAS = [
  { n: "01", titulo: "Diagnóstico", texto: "Visita técnica, levantamento da edificação e o que falta para regularizar." },
  { n: "02", titulo: "Projeto e ART", texto: "Projeto técnico de segurança contra incêndio e responsabilidade técnica." },
  { n: "03", titulo: "Obra", texto: "Execução das adequações: combate, detecção, sinalização, saídas e SPDA." },
  { n: "04", titulo: "Aprovação", texto: "Acompanhamento junto ao Corpo de Bombeiros até a entrega do CLCB ou AVCB." },
];
