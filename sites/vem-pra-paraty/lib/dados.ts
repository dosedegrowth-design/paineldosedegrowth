import vpp from "@/dados/vpp.json";

/**
 * Fonte única de verdade da LP.
 *
 * REGRA DE OURO: a página não fala de valores. Nenhum preço — nem o nosso, nem
 * o de concorrente, nem conta por pessoa, nem "a partir de". Preço só no
 * WhatsApp. Os números vivem em blocos `_interno_*` do JSON, como contexto de
 * estratégia; se algum aparecer renderizado, é bug.
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

export const ROTULO: Record<string, string> = {
  "18-pes": "18 pés",
  "24-pes": "24 pés",
  "33-pes": "33 pés",
};

/**
 * Link de conversa já com a lancha no texto, pra o marinheiro saber de qual
 * página veio o lead sem precisar perguntar.
 */
export function linkWhatsApp(slug: string): string {
  const texto = `Oi! Vim pelo site e queria saber sobre a lancha de ${
    ROTULO[slug] ?? slug
  }.`;
  return `https://wa.me/${dados.marca.whatsapp}?text=${encodeURIComponent(texto)}`;
}
