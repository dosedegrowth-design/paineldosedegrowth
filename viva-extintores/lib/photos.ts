/**
 * Fotografia real — manifesto de slots (§20 do briefing).
 *
 * Prioridade: obra real > equipamento real > equipe real > documentação
 * real > imagem genérica. Enquanto o arquivo não existir em
 * `public/photos/`, o <FotoReal> desenha um campo tonal com a legenda —
 * nunca stock, nunca ilustração, nunca imagem sintética (§13, §24).
 *
 * Trocar a foto = trocar o arquivo. Nenhum componente precisa mudar.
 */

export type FotoSlot = {
  src: string;
  alt: string;
  /** proporção largura/altura — vale para o layout e para o campo tonal */
  ratio: number;
  /** legenda curta; some junto com a foto quando o arquivo não existe */
  legenda?: string;
};

const b = "/photos";

const foto = (
  nome: string,
  alt: string,
  ratio: number,
  legenda?: string,
): FotoSlot => ({ src: `${b}/${nome}.jpg`, alt, ratio, legenda });

export const FOTOS = {
  // ---------------------------------------------------------------
  // Página 0 — portfólio
  // ---------------------------------------------------------------
  home: {
    hero: foto(
      "home-hero",
      "Equipe VIVA em obra de segurança contra incêndio",
      16 / 9,
    ),
  },

  // ---------------------------------------------------------------
  // 01 — Sistemas de combate a incêndio
  // ---------------------------------------------------------------
  combate: {
    hero: foto("combate-hero", "Casa de bombas de incêndio executada pela VIVA", 16 / 9),
    card: foto("combate-card", "Conjunto de bombas de incêndio", 4 / 3),
    destaque: foto("combate-destaque", "Rede de SPK instalada pela VIVA", 4 / 3, "Rede de SPK — instalação"),
    g1: foto("combate-01", "Tubulação da rede de SPK", 1, "Tubulação para rede de SPK"),
    g2: foto("combate-02", "Válvula de hidrante", 1, "Válvula para hidrantes"),
    g3: foto("combate-03", "Casa de bombas durante a instalação", 1, "Casa de bombas — instalação"),
    g4: foto("combate-04", "Abrigo de hidrante instalado", 1, "Abrigo de hidrante"),
  },

  // ---------------------------------------------------------------
  // 02 — Alarme e detecção
  // ---------------------------------------------------------------
  alarme: {
    hero: foto("alarme-hero", "Obra de sistema de alarme e detecção de incêndio", 16 / 9),
    card: foto("alarme-card", "Detector de fumaça instalado", 4 / 3),
    destaque: foto("alarme-destaque", "Central de alarme de incêndio em instalação", 4 / 3, "Central de alarme — instalação · obra real"),
    g1: foto("alarme-01", "Acionador manual e sinalização de alarme", 1, "Acionador e sinalização — obra real"),
    g2: foto("alarme-02", "Botoeira de alarme durante a instalação", 1, "Botoeira de alarme — instalação"),
    g3: foto("alarme-03", "Sirene audiovisual instalada", 1, "Sirene audiovisual — obra real"),
    g4: foto("alarme-04", "Detector de fumaça durante a instalação", 1, "Detector de fumaça — instalação"),
  },

  // ---------------------------------------------------------------
  // 03 — SPDA / para-raios
  // ---------------------------------------------------------------
  spda: {
    hero: foto("spda-hero", "Sistema de SPDA executado em cobertura", 16 / 9),
    card: foto("spda-card", "Mastro de para-raios em cobertura", 4 / 3),
    destaque: foto("spda-destaque", "Captor tipo Franklin com sinalização", 4 / 3, "Captor tipo Franklin com sinalização — obra real"),
    g1: foto("spda-01", "Instalação de condutor de descida", 1, "Instalação de condutor — obra real"),
    g2: foto("spda-02", "Torre de para-raios", 1, "Torre de para-raios — obra real"),
    g3: foto("spda-03", "Sistema de SPDA em cobertura", 1, "Sistema de SPDA em cobertura"),
    g4: foto("spda-04", "Detalhe do captor instalado", 1, "Detalhe do captor — obra real"),
  },

  // ---------------------------------------------------------------
  // 04 — Laudos, CLCB e AVCB
  // ---------------------------------------------------------------
  laudos: {
    hero: foto(
      "laudos-hero",
      "Profissional da VIVA com a documentação aprovada em frente à edificação",
      16 / 9,
    ),
    card: foto("laudos-card", "Vistoria técnica com documentação", 4 / 3),
    clcb: foto("laudos-clcb", "CLCB emitido", 3 / 4, "CLCB entregue"),
    avcb: foto("laudos-avcb", "AVCB emitido", 3 / 4, "AVCB aprovado"),
    // Legendas com nome de cliente: ⚠️ confirmar com a VIVA antes de publicar.
    o1: foto("laudos-obra-01", "Obra de regularização executada pela VIVA", 1, "Cury — regularização"),
    o2: foto("laudos-obra-02", "Obra de regularização executada pela VIVA", 1, "Padaria Piemonte — CLCB entregue"),
    o3: foto("laudos-obra-03", "Obra de adequação executada pela VIVA", 1, "Metrô Tamanduateí — adequação e obra"),
    o4: foto("laudos-obra-04", "Edificação com AVCB aprovado pela VIVA", 1, "Edifício Araken — AVCB aprovado"),
  },

  // ---------------------------------------------------------------
  // 05 — Relatório Tecno-Fotográfico + manutenção
  // ---------------------------------------------------------------
  relatorio: {
    hero: foto(
      "relatorio-hero",
      "Profissional da VIVA em inspeção técnica, de costas, com prancheta",
      16 / 9,
    ),
    card: foto("relatorio-card", "Inspeção técnica com registro fotográfico", 4 / 3),
    conforme: foto("relatorio-conforme", "Equipamento em conformidade registrado na inspeção", 4 / 3, "Em conformidade"),
    falha: foto("relatorio-falha", "Irregularidade registrada na inspeção", 4 / 3, "Falha identificada"),
    m1: foto("relatorio-manut-01", "Inspeção em empresa", 1, "Inspeção — empresa"),
    m2: foto("relatorio-manut-02", "Página do relatório com registro fotográfico", 1, "Registro fotográfico do laudo"),
    m3: foto("relatorio-manut-03", "Plano de manutenção entregue ao cliente", 1, "Plano de ação — entrega"),
  },
} as const;

/** Todos os slots, em lista — usado pela checagem de arquivos do servidor. */
export const TODOS_OS_SLOTS: FotoSlot[] = Object.values(FOTOS).flatMap(
  (grupo) => Object.values(grupo) as FotoSlot[],
);
