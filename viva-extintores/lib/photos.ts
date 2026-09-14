/**
 * Fotografia — manifesto de slots.
 *
 * Duas procedências, e a diferença importa:
 *
 * - **Foto real da VIVA** (`01-combate`, `04-laudos`, parte da `05` e as
 *   institucionais): vieram do acervo do site atual da VIVA. Legenda
 *   descreve o que a foto mostra de fato — nada de atribuir a foto de um
 *   cliente a outro.
 * - **Imagem ilustrativa** (`02-alarme`, `03-spda` e parte da `05`):
 *   gerada para a apresentação porque a VIVA ainda não mandou foto dessas
 *   áreas. Marcada com `ilustrativa: true`, o que faz o componente exibir
 *   a etiqueta — ninguém pode confundir com obra executada pela VIVA.
 *   **Trocar pelas fotos reais assim que chegarem.**
 *
 * Trocar a foto = trocar o arquivo, mantendo o nome. Nenhum componente muda.
 */

export type FotoSlot = {
  /** caminho sem sufixo nem extensão: `/img/01-combate/card` */
  base: string;
  alt: string;
  /** proporção largura/altura — vale para o layout e para o vazio */
  ratio: number;
  /** legenda curta, exibida sobre a foto */
  legenda?: string;
  /** true = imagem ilustrativa, não é obra executada pela VIVA */
  ilustrativa?: true;
};

/**
 * Os recortes que `scripts/grade.mjs` gera para cada foto. Dois tamanhos
 * de cada, para o celular não baixar imagem de desktop.
 */
export type Corte = "w" | "p" | "q";

const MENOR: Record<Corte, string> = { w: "ws", p: "ps", q: "qs" };
const LARGURA: Record<Corte, [number, number]> = { w: [1100, 1800], p: [700, 1120], q: [560, 900] };

export function arquivo(foto: FotoSlot, corte: Corte, pequeno = false) {
  return `${foto.base}-${pequeno ? MENOR[corte] : corte}.webp`;
}

export function conjunto(foto: FotoSlot, corte: Corte) {
  const [a, b] = LARGURA[corte];
  return `${arquivo(foto, corte, true)} ${a}w, ${arquivo(foto, corte)} ${b}w`;
}

const lote =
  (pasta: string, ilustrativa?: true) =>
  (nome: string, alt: string, ratio: number, legenda?: string): FotoSlot => ({
    base: `/img/${pasta}/${nome}`,
    alt,
    ratio,
    legenda,
    ...(ilustrativa ? { ilustrativa } : {}),
  });

const site = lote("00-site");
const f01 = lote("01-combate");
const f02 = lote("02-alarme", true);
const f03 = lote("03-spda", true);
const f04 = lote("04-laudos");
const f05 = lote("05-relatorio");
const f05i = lote("05-relatorio", true);

export const FOTOS = {
  // ---------------------------------------------------------------
  // 00 — institucional (acervo real da VIVA)
  // ---------------------------------------------------------------
  site: {
    hero: site("hero", "Galpão industrial atendido pela VIVA", 16 / 9),
    portfolio: site("portfolio-hero", "Conjunto motobomba de incêndio instalado pela VIVA", 16 / 9),
    equipe: site("equipe", "Equipe da VIVA na frente da sede", 4 / 3, "Equipe VIVA"),
    sobre: site("sobre", "Sede da VIVA Extintores", 16 / 9),
    servicos: site("servicos-hero", "Rede de hidrantes externa executada pela VIVA", 16 / 9),
    contato: site("contato-hero", "Sede da VIVA Extintores", 16 / 9),
  },

  // ---------------------------------------------------------------
  // 01 — Combate a incêndio · fotos reais de obra
  // ---------------------------------------------------------------
  combate: {
    hero: f01("hero", "Rede de chuveiros automáticos em galpão, executada pela VIVA", 16 / 9),
    card: f01("card", "Conjunto motobomba de incêndio", 4 / 3),
    destaque: f01("destaque", "Rede de chuveiros automáticos instalada em galpão", 4 / 3, "Rede de SPK – instalação"),
    g1: f01("01", "Tubulação da rede de hidrantes assentada em vala", 1, "Rede de hidrantes – tubulação"),
    g2: f01("02", "Barrilete da casa de bombas com manômetros", 1, "Barrilete – casa de bombas"),
    g3: f01("03", "Conjunto motobomba instalado na casa de bombas", 1, "Casa de bombas – instalação"),
    g4: f01("04", "Hidrante externo alimentado pela rede", 1, "Hidrante externo – obra"),
  },

  // ---------------------------------------------------------------
  // 02 — Alarme e detecção · ILUSTRATIVAS, trocar pelas reais
  // ---------------------------------------------------------------
  alarme: {
    hero: f02("hero", "Instalação de sistema de alarme e detecção de incêndio", 16 / 9),
    card: f02("card", "Detector de fumaça instalado no teto", 4 / 3),
    destaque: f02("destaque", "Central de alarme de incêndio instalada em parede", 4 / 3, "Central de alarme de incêndio"),
    g1: f02("01", "Eletrodutos do sistema de detecção no teto", 1, "Infraestrutura e cabeamento"),
    g2: f02("02", "Acionador manual de alarme na parede", 1, "Acionador manual"),
    g3: f02("03", "Sirene audiovisual instalada", 1, "Sirene audiovisual"),
    g4: f02("04", "Detector de fumaça no teto", 1, "Detector de fumaça"),
  },

  // ---------------------------------------------------------------
  // 03 — SPDA / para-raios · ILUSTRATIVAS, trocar pelas reais
  // ---------------------------------------------------------------
  spda: {
    hero: f03("hero", "Sistema de proteção contra descargas atmosféricas em cobertura", 16 / 9),
    card: f03("card", "Captor tipo Franklin em cobertura", 4 / 3),
    destaque: f03("destaque", "Captor tipo Franklin com sinalização", 4 / 3, "Captor tipo Franklin com sinalização"),
    g1: f03("01", "Condutor de descida fixado na fachada", 1, "Condutor de descida"),
    g2: f03("02", "Técnico instalando malha captora na cobertura", 1, "Malha captora – execução"),
    g3: f03("03", "Cobertura com mastros e malha de SPDA", 1, "SPDA em cobertura"),
    g4: f03("04", "Medição de aterramento com terrômetro", 1, "Medição de aterramento"),
  },

  // ---------------------------------------------------------------
  // 04 — Laudos, CLCB e AVCB · fotos reais de entrega
  // Legenda descreve o tipo de cliente, como no acervo da VIVA. Não
  // atribuir a foto de um cliente ao nome de outro.
  // ---------------------------------------------------------------
  laudos: {
    hero: f04("hero", "Entrega de documentação aprovada a um cliente da VIVA", 16 / 9),
    card: f04("card", "Entrega de documentação a um cliente", 4 / 3),
    clcb: f04("clcb", "Entrega de documentação em comércio", 4 / 3, "Comércio – documentação entregue"),
    avcb: f04("avcb", "Entrega de documentação em transportadora", 4 / 3, "Transportadora – documentação entregue"),
    g1: f04("01", "Entrega de laudo em comércio", 1, "Comércio – laudo entregue"),
    g2: f04("02", "Entrega de laudo em padaria", 1, "Padaria – laudo entregue"),
    g3: f04("03", "Entrega de laudo em transportadora", 1, "Transportadora – laudo entregue"),
    g4: f04("04", "Entrega de equipamentos em estúdio", 1, "Estúdio – equipamentos entregues"),
  },

  // ---------------------------------------------------------------
  // 05 — Relatório Tecno-Fotográfico + manutenção
  // A foto do profissional de costas com prancheta é a imagem central do
  // conceito. Hoje é ilustrativa — é a primeira a trocar quando a VIVA
  // mandar a real.
  // ---------------------------------------------------------------
  relatorio: {
    hero: f05i("hero", "Profissional em inspeção técnica, de costas, com prancheta", 16 / 9),
    card: f05i("card", "Inspeção técnica com registro fotográfico", 4 / 3),
    conforme: f05i("conforme", "Extintor em conformidade, lacre intacto", 4 / 3, "Em conformidade"),
    falha: f05i("falha", "Extintor com irregularidade, lacre rompido e corrosão", 4 / 3, "Falha identificada"),
    solucao: f05i("solucao", "Manutenção de extintor pela equipe", 4 / 3, "Solução VIVA"),
    g1: f05("01", "Equipamentos de combate a incêndio na loja da VIVA", 1, "Equipamentos – loja VIVA"),
    g2: f05("02", "Entrega de equipamentos a um cliente", 1, "Entrega de equipamentos"),
    g3: f05("03", "Treinamento prático com extintor", 1, "Treinamento com extintor"),
  },
} as const;

/** Todos os slots, em lista — usado pela checagem de arquivos do servidor. */
export const TODOS_OS_SLOTS: FotoSlot[] = Object.values(FOTOS).flatMap(
  (grupo) => Object.values(grupo) as FotoSlot[],
);
