/**
 * Fotografia real — manifesto de slots.
 *
 * As fotos chegam da VIVA em cinco lotes, um por área, e é assim que os
 * arquivos ficam organizados em `public/photos/`. Enquanto o arquivo não
 * existir, o <FotoReal> desenha um campo tonal com a descrição — nunca
 * stock, nunca ilustração, nunca imagem sintética.
 *
 * As fotos já aprovadas são as que entram. Nenhum gerador substitui uma
 * foto de obra real por banco de imagem.
 *
 * Trocar a foto = trocar o arquivo. Nenhum componente muda.
 */

export type FotoSlot = {
  src: string;
  alt: string;
  /** proporção largura/altura — vale para o layout e para o campo tonal */
  ratio: number;
  /** legenda curta; some junto com a foto quando o arquivo não existe */
  legenda?: string;
};

/** lote = a pasta que a VIVA entrega. */
const lote = (pasta: string) =>
  (nome: string, alt: string, ratio: number, legenda?: string): FotoSlot => ({
    src: `/photos/${pasta}/${nome}.jpg`,
    alt,
    ratio,
    legenda,
  });

const site = lote("00-site");
const f01 = lote("01-combate");
const f02 = lote("02-alarme");
const f03 = lote("03-spda");
const f04 = lote("04-laudos");
const f05 = lote("05-relatorio");

export const FOTOS = {
  // ---------------------------------------------------------------
  // 00 — institucional e página-mãe
  // ---------------------------------------------------------------
  site: {
    hero: site("hero", "Equipe VIVA em obra de segurança contra incêndio", 16 / 9),
    portfolio: site(
      "portfolio-hero",
      "Obra de combate a incêndio executada pela VIVA",
      16 / 9,
    ),
    equipe: site("equipe", "Equipe técnica da VIVA em campo", 4 / 3),
    sobre: site("sobre", "Engenheiro da VIVA em vistoria técnica", 4 / 3),
    servicos: site("servicos-hero", "Sistemas de segurança contra incêndio", 16 / 9),
    contato: site("contato-hero", "Equipe VIVA atendendo um cliente", 16 / 9),
  },

  // ---------------------------------------------------------------
  // 01 — Combate a incêndio (bombas, hidrantes, SPK, painéis)
  // ---------------------------------------------------------------
  combate: {
    hero: f01("hero", "Casa de bombas de incêndio executada pela VIVA", 16 / 9),
    card: f01("card", "Conjunto de bombas de incêndio", 4 / 3),
    destaque: f01("destaque", "Rede de SPK instalada pela VIVA", 4 / 3, "Rede de SPK – instalação"),
    g1: f01("01", "Tubulações para rede de hidrantes", 1, "Tubulações para rede de hidrantes"),
    g2: f01("02", "Válvula para hidrantes", 1, "Válvula para hidrantes"),
    g3: f01("03", "Casa de bombas durante a instalação", 1, "Casa de bombas – instalação"),
    g4: f01("04", "Abrigo de hidrante instalado", 1, "Abrigo de hidrante"),
  },

  // ---------------------------------------------------------------
  // 02 — Alarme e detecção
  // A versão que vale é a que substituiu a foto do fio pela obra de
  // detecção. Não voltar a usar o cabo como imagem principal.
  // ---------------------------------------------------------------
  alarme: {
    hero: f02("hero", "Botoeira de alarme de incêndio instalada", 16 / 9),
    card: f02("card", "Detector de fumaça instalado", 4 / 3),
    destaque: f02(
      "destaque",
      "Central de alarme de incêndio instalada pela VIVA",
      4 / 3,
      "Central de alarme de incêndio – obra real",
    ),
    g1: f02("01", "Infraestrutura e cabeamento do sistema de alarme", 1, "Infraestrutura e cabeamento de alarme – obra real"),
    g2: f02("02", "Botoeira de alarme durante a instalação", 1, "Botoeira de alarme – instalação"),
    g3: f02("03", "Sirene audiovisual instalada", 1, "Sirene audiovisual – obra real"),
    g4: f02("04", "Detector de fumaça durante a instalação", 1, "Detector de fumaça – instalação"),
  },

  // ---------------------------------------------------------------
  // 03 — SPDA / para-raios
  // ---------------------------------------------------------------
  spda: {
    hero: f03("hero", "Técnico da VIVA em obra de SPDA na cobertura", 16 / 9),
    card: f03("card", "Mastro de para-raios em cobertura", 4 / 3),
    destaque: f03(
      "destaque",
      "Captor tipo Franklin com sinalização",
      4 / 3,
      "Captor tipo Franklin com sinalização – obra real",
    ),
    g1: f03("01", "Instalação de condutor de descida", 1, "Instalação de condutor – obra real"),
    g2: f03("02", "Torre de para-raios", 1, "Torre de para-raios – obra real"),
    g3: f03("03", "Sistema de SPDA em cobertura", 1, "Sistema de SPDA em cobertura"),
    g4: f03("04", "Medição de aterramento com terrômetro", 1, "Medição de aterramento – obra real"),
    g5: f03("05", "Detalhe do captor instalado", 1, "Detalhe do captor – obra real"),
  },

  // ---------------------------------------------------------------
  // 04 — Laudos, CLCB e AVCB
  // Legendas com nome de cliente: confirmar com a VIVA antes de publicar.
  // A foto da Cury é a versão com a fachada ampliada.
  // ---------------------------------------------------------------
  laudos: {
    hero: f04(
      "hero",
      "Profissional da VIVA de frente com a documentação aprovada, no Ed. Araken de Moraes",
      16 / 9,
    ),
    card: f04("card", "Entrega de documentação aprovada", 4 / 3),
    clcb: f04("clcb", "CLCB entregue ao cliente", 4 / 3, "Banana's Outlet — CLCB entregue"),
    avcb: f04("avcb", "AVCB entregue ao cliente", 4 / 3, "Ed. Araken de Moraes — AVCB entregue"),
    o1: f04("01", "Fachada da Cury", 1, "Cury — projeto e regularização"),
    o2: f04("02", "Entrega de CLCB na Padaria Marabá", 1, "Padaria Marabá — CLCB entregue"),
    o3: f04("03", "Adequações e obras no Metrô Tamanduateí", 1, "Metrô Tamanduateí — adequações e obras"),
    o4: f04("04", "Studio Rock Rock regularizado", 1, "Studio Rock Rock — regularizado"),
  },

  // ---------------------------------------------------------------
  // 05 — Relatório Tecno-Fotográfico + manutenção
  // A foto do profissional de costas, com prancheta, é a imagem central
  // do conceito. Não substituir por ícone nem ilustração.
  // ---------------------------------------------------------------
  relatorio: {
    hero: f05(
      "hero",
      "Profissional da VIVA em inspeção técnica, de costas, com prancheta",
      16 / 9,
    ),
    card: f05("card", "Inspeção técnica com registro fotográfico", 4 / 3),
    conforme: f05("conforme", "Extintor em conformidade registrado na inspeção", 4 / 3, "Em conformidade"),
    falha: f05("falha", "Extintor com irregularidade registrada na inspeção", 4 / 3, "Falha identificada"),
    solucao: f05("solucao", "Manutenção de extintor pela equipe VIVA", 4 / 3, "Solução VIVA"),
    m1: f05("01", "Inspeção em empresa e indústria", 1, "Inspeção em empresas e indústrias"),
    m2: f05("02", "Identificação de riscos durante a inspeção", 1, "Identificação de riscos"),
    m3: f05("03", "Detector de fumaça verificado na inspeção", 1, "Detectores de fumaça"),
    m4: f05("04", "Porta corta-fogo verificada na inspeção", 1, "Compartimentação"),
    m5: f05("05", "Documentação e plano de ação entregues", 1, "Documentação e plano de ação"),
  },
} as const;

/** Todos os slots, em lista — usado pela checagem de arquivos do servidor. */
export const TODOS_OS_SLOTS: FotoSlot[] = Object.values(FOTOS).flatMap(
  (grupo) => Object.values(grupo) as FotoSlot[],
);
