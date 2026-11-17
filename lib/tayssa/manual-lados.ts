/**
 * De onde é a explicação (pedido do Lucas, 17/11/2026: "cards pra
 * diferenciar se é do painel ou da cliente, pra ela ter certeza ao tirar
 * dúvidas"): o que a Tayssa faz no painel, o que a cliente vê no site, ou
 * as duas pontas da mesma coisa.
 */
export type LadoDoManual = "painel" | "cliente" | "ambos";

export const LADOS: Record<LadoDoManual, { nome: string; resumo: string }> = {
  painel: { nome: "No seu painel", resumo: "o que você faz e vê aqui no painel" },
  cliente: { nome: "No site da cliente", resumo: "o que a cliente vê e faz no site" },
  ambos: { nome: "No site e no painel", resumo: "o que a cliente faz e o que chega para você" },
};
