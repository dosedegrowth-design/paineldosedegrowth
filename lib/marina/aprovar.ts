/**
 * Os dois links de aprovação da Marina Saleme.
 *
 * "no-ar"  → o que está rodando hoje na conta Marina Saleme - 02. Manter / Tirar.
 * "novos"  → os anúncios montados com as fotos do Drive. Fica / Sai.
 *
 * A resposta é por item e a última vale. Sem login: o link é o segredo,
 * como no briefing da Bia.
 */

export const LINKS = ["no-ar", "novos"] as const;
export type Link = (typeof LINKS)[number];

/** 'sim' = Manter/Fica · 'nao' = Tirar/Sai · null = ainda não respondeu. */
export type Resposta = "sim" | "nao";

export const ROTULOS: Record<Link, { sim: string; nao: string }> = {
  "no-ar": { sim: "Manter", nao: "Tirar" },
  novos: { sim: "Fica", nao: "Sai" },
};

export const LIMITE_COMENTARIO = 500;

export type RespostaSalva = {
  itemId: string;
  resposta: Resposta | null;
  comentario: string;
  atualizadoEm: string;
};

export type Resultado<T = undefined> =
  | ({ ok: true } & (T extends undefined ? { data?: undefined } : { data: T }))
  | { ok: false; error: string };

/** A peça de mídia de um anúncio, do jeito que ela aparece no celular. */
export type Midia =
  | { tipo: "imagem"; src: string; proporcao: string }
  | { tipo: "video"; src: string; capa: string; proporcao: string }
  | { tipo: "carrossel"; cards: { src: string; nome: string; descricao?: string }[] };

export type AnuncioNoAr = {
  id: string;
  nome: string;
  campanha: string;
  conjunto: string;
  formato: string;
  texto: string;
  titulo: string;
  botao: string;
  gasto: string;
  impressoes: string;
  midia: Midia;
};

export type AnuncioNovo = {
  id: string;
  peca: string;
  tipo: "camisa" | "vestido" | "outro";
  texto: string;
  titulo: string;
  botao: string;
  feed: string;
  reels: string;
};

export type CarrosselNovo = {
  id: string;
  nome: string;
  texto: string;
  titulo: string;
  botao: string;
  cards: { src: string; nome: string }[];
};

/** O resumo que o botão "Copiar respostas" manda para o WhatsApp. */
export function resumoWhatsApp(
  titulo: string,
  link: Link,
  itens: { id: string; nome: string }[],
  respostas: Map<string, RespostaSalva>,
): string {
  const r = ROTULOS[link];
  const linhas: string[] = [titulo, ""];
  const marcar = (alvo: Resposta | null) =>
    itens.filter((i) => (respostas.get(i.id)?.resposta ?? null) === alvo);

  const sim = marcar("sim");
  const nao = marcar("nao");
  const falta = marcar(null);

  if (sim.length) {
    linhas.push(`${r.sim.toUpperCase()} (${sim.length}):`);
    for (const i of sim) linhas.push(`- ${i.nome}`);
    linhas.push("");
  }
  if (nao.length) {
    linhas.push(`${r.nao.toUpperCase()} (${nao.length}):`);
    for (const i of nao) linhas.push(`- ${i.nome}`);
    linhas.push("");
  }

  const comentados = itens
    .map((i) => ({ i, c: (respostas.get(i.id)?.comentario ?? "").trim() }))
    .filter((x) => x.c.length > 0);
  if (comentados.length) {
    linhas.push("COMENTÁRIOS:");
    for (const { i, c } of comentados) linhas.push(`- ${i.nome}: ${c}`);
    linhas.push("");
  }

  if (falta.length) linhas.push(`Ainda sem resposta: ${falta.length} de ${itens.length}.`);
  else linhas.push(`Tudo respondido: ${itens.length} de ${itens.length}.`);

  return linhas.join("\n").trim();
}
