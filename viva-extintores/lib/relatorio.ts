/**
 * Conteúdo exclusivo da página 05 — Relatório Tecno-Fotográfico (§12, §14).
 *
 * Esta é a área diferenciadora da VIVA. Não é "manutenção de extintores":
 * é diagnóstico documentado do sistema de incêndio da edificação, que
 * naturalmente leva à capacidade da VIVA de executar a correção.
 */

export const PROVOCACAO = {
  titulo: "Seu AVCB está em dia. Mas o seu sistema de incêndio também está?",
  texto:
    "O AVCB comprova que a edificação foi regularizada. O Relatório Tecno-Fotográfico mostra a realidade de hoje: o que está funcionando, o que falhou e o que precisa de manutenção antes de virar problema.",
} as const;

export const ESTADOS = [
  {
    chave: "conforme" as const,
    rotulo: "Em conformidade",
    texto: "Equipamento em perfeito estado, dentro da validade e da norma.",
  },
  {
    chave: "falha" as const,
    rotulo: "Falha identificada",
    texto: "Irregularidade registrada e documentada para correção.",
  },
];

/** §12 — "mais de 20 itens verificados, registrados e documentados". */
export const ITENS_AVALIADOS = [
  "Extintores: validade, carga e lacre",
  "Mangueiras e testes hidrostáticos",
  "Hidrantes, abrigos e acessórios",
  "Pressão e vazão da rede",
  "Bomba de incêndio e casa de bombas",
  "Chuveiros automáticos (SPK)",
  "Central de alarme e detecção",
  "Detectores de fumaça e temperatura",
  "Acionadores manuais e sirenes",
  "Iluminação de emergência",
  "Sinalização de emergência",
  "Portas corta-fogo",
  "Rotas de fuga e saídas de emergência",
  "Escadas e antecâmaras",
  "SPDA e aterramento",
  "Quadros elétricos e proteções",
  "Documentação e validade do AVCB",
];

/** Frase que fecha a lista sem inflar número (§ "parar de acrescentar muito"). */
export const ITENS_NOTA = "E os demais itens exigidos para a sua edificação.";

/** §14 — a VIVA identifica o problema e também executa a solução. */
export const MANUTENCAO = [
  "Recarga e substituição de extintores",
  "Mangueiras: teste hidrostático e troca",
  "Iluminação de emergência",
  "Sinalização de emergência",
  "Hidrantes, abrigos e acessórios",
  "Equipamentos de combate a incêndio",
  "Portas corta-fogo",
  "Demais itens de segurança contra incêndio",
];

/** Extintores, recarga e produtos — fecha o ciclo do diagnóstico. */
export const PRODUTOS = {
  titulo: "Extintores, recarga e produtos",
  texto:
    "A VIVA identifica o problema no relatório e também executa a solução: venda, recarga, substituição e manutenção dos equipamentos de combate a incêndio, com os registros e a validade em dia.",
  itens: [
    "Venda de extintores novos",
    "Recarga e manutenção de extintores",
    "Substituição de equipamento vencido ou condenado",
    "Mangueiras, esguichos e acessórios de hidrante",
    "Luminárias e placas de sinalização de emergência",
    "Reposição programada, com controle de validade",
  ],
} as const;
