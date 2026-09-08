import vpp from "@/dados/vpp.json";

/**
 * Fonte única de verdade da LP. Nenhum número de preço, lotação ou roteiro
 * deve ser escrito direto no JSX — tudo sai daqui, pra a página nunca
 * discordar dos criativos de anúncio.
 */
export const dados = vpp;

export type Lancha = (typeof vpp.frota)[number];
export type Roteiro = (typeof vpp.roteiros)[number];

export const SLUGS = vpp.frota.map((l) => l.id);

export function getLancha(slug: string): Lancha | undefined {
  return vpp.frota.find((l) => l.id === slug);
}

/** Um campo está pendente quando ainda não veio resposta do cliente. */
export function pendente(valor: unknown): boolean {
  return typeof valor === "string" && valor.startsWith("PENDENTE");
}

/** Rótulo curto de cada lancha pro seletor do topo. */
export const ROTULO: Record<string, string> = {
  "18-pes": "18 pés",
  "24-pes": "24 pés",
  "33-pes": "33 pés",
};

export const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});
