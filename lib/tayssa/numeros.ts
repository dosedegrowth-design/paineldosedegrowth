/**
 * Números que sobem na tela: "2,16 mi", "+5 mil", "1.240", "98%". O texto
 * é o que a Tayssa escreveu; daqui sai a parte numérica (no jeito
 * brasileiro: ponto separa milhar, vírgula separa decimal), o que vem
 * antes e o que vem depois. Puro, para ser testado.
 */
export type PartesNumero = { prefixo: string; alvo: number; decimais: number; sufixo: string };

export function partesDoNumero(valor: string): PartesNumero | null {
  const m = valor.match(/^(\D*?)(\d[\d.]*(?:,\d+)?)(.*)$/);
  if (!m) return null;
  const [, prefixo, numero, sufixo] = m;
  const [inteiro, fracao = ""] = numero.split(",");
  const alvo = Number(`${inteiro.replace(/\./g, "")}${fracao ? `.${fracao}` : ""}`);
  if (!Number.isFinite(alvo)) return null;
  return { prefixo, alvo, decimais: fracao.length, sufixo };
}

/** O número no meio do caminho, com as casas e o milhar do original. */
export function formatarNumero(p: PartesNumero, atual: number): string {
  const [int, dec] = Math.max(0, atual).toFixed(p.decimais).split(".");
  const milhar = int.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${p.prefixo}${milhar}${dec ? `,${dec}` : ""}${p.sufixo}`;
}
