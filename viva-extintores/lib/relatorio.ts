/**
 * Conteúdo exclusivo da página 05 — Relatório Tecno-Fotográfico.
 *
 * É a área diferenciadora da VIVA e o chamariz comercial. Não é "uma
 * página de extintores": é o diagnóstico documentado do sistema de
 * incêndio da edificação, que naturalmente leva à capacidade da VIVA de
 * executar a correção. Relatório e manutenção são UMA página.
 */

export const PROVOCACAO = {
  titulo: "Seu AVCB está em dia. Mas o seu sistema de incêndio também está?",
  texto:
    "O AVCB comprova a regularização. O Relatório Tecno-Fotográfico mostra a situação real da edificação no dia a dia.",
} as const;

export const ESTADOS = [
  {
    chave: "conforme" as const,
    rotulo: "Em conformidade",
    texto: "Equipamento em perfeito estado, dentro da norma.",
  },
  {
    chave: "falha" as const,
    rotulo: "Falha identificada",
    texto: "Irregularidades registradas com fotos e descrição técnica.",
  },
  {
    chave: "solucao" as const,
    rotulo: "Solução VIVA",
    texto: "Correção, substituição e manutenção com equipe especializada.",
  },
];

/** Mais de 20 itens verificados, registrados e documentados. */
export const ITENS_AVALIADOS = [
  "Extintores (validade, carga, fixação)",
  "Mangueiras e hidrantes",
  "Iluminação de emergência",
  "Sinalização de emergência",
  "Alarmes e detecção de fumaça",
  "Portas corta-fogo e compartimentação",
  "Casa de bombas e pressurização",
  "SPDA (para-raios)",
  "Rotas de fuga e saídas de emergência",
];

export const ITENS_NOTA = "E muito mais.";

/** A VIVA não apenas identifica: também fornece, substitui e mantém. */
export const MANUTENCAO = [
  { icone: "extintor" as const, titulo: "Extintores", nota: "Recarga e substituição" },
  { icone: "mangueira" as const, titulo: "Mangueiras", nota: "Inspeção e teste" },
  { icone: "luz" as const, titulo: "Iluminação de emergência" },
  { icone: "saida" as const, titulo: "Sinalização", nota: "Fotoluminescente" },
  { icone: "hidrante" as const, titulo: "Hidrantes e acessórios" },
  { icone: "alarme" as const, titulo: "Alarmes e detecção" },
  { icone: "porta" as const, titulo: "Portas corta-fogo" },
  { icone: "prancheta" as const, titulo: "Adequações e obras" },
];

export const MANUTENCAO_TITULO = "Manutenção preventiva completa";
export const MANUTENCAO_TEXTO =
  "A VIVA não apenas identifica as irregularidades. Também fornece, substitui, mantém e regulariza os equipamentos necessários.";
