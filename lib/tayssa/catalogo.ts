import type { CSSProperties } from "react";
import type { CategoriaMidia, PhotoRow } from "@/lib/tayssa/types";

/**
 * O catálogo de mídia do site: cada foto ou vídeo que a Tayssa sobe no
 * painel tem categoria (cílios, sobrancelha…) e produto ("Volume inglês").
 * Daqui saem os rolos de cada produto, em vários pontos do site. Puro —
 * sem banco, sem React — para ser testado e usado dos dois lados.
 */
export const CATEGORIAS: { slug: CategoriaMidia; label: string; servicos: string[] }[] = [
  { slug: "cilios", label: "Cílios", servicos: ["aplicacao-cilios", "manutencao-cilios"] },
  { slug: "sobrancelha", label: "Sobrancelha", servicos: ["design-sobrancelhas"] },
  { slug: "labios", label: "Boca e lábios", servicos: ["lip-spa"] },
  { slug: "pele", label: "Pele", servicos: ["limpeza-de-pele"] },
  { slug: "outro", label: "Outros", servicos: [] },
];

/** Categoria de um serviço do catálogo (pela slug; serviço novo cai pelo nome). */
export function categoriaDoServico(slug: string, nome = ""): CategoriaMidia {
  const achou = CATEGORIAS.find((c) => c.servicos.includes(slug));
  if (achou) return achou.slug;
  const n = `${slug} ${nome}`.toLowerCase();
  if (/c[ií]lio|lash|volume|fio/.test(n)) return "cilios";
  if (/sobrancelh|brow/.test(n)) return "sobrancelha";
  if (/l[aá]bio|lip|boca/.test(n)) return "labios";
  if (/pele|facial|limpeza|skin/.test(n)) return "pele";
  return "outro";
}

export type MidiaCatalogo = {
  id: string;
  url: string;
  tipo: "image" | "video";
  produto: string;
  legenda: string | null;
  alt: string;
  /** largura/altura; vertical 4:5 quando não se sabe */
  ratio: number;
  /** enquadramento escolhido ao publicar: centro (%) e zoom */
  foco: { x: number; y: number; zoom: number };
};
export type ProdutoCatalogo = {
  nome: string;
  itens: MidiaCatalogo[];
  /** valor que a Tayssa deu ao produto (vazio = não mostra) */
  preco?: number | null;
};
export type CategoriaCatalogo = {
  slug: CategoriaMidia;
  label: string;
  produtos: ProdutoCatalogo[];
  total: number;
};

type Linha = Pick<
  PhotoRow,
  "id" | "public_url" | "lash_style" | "category" | "media_type" | "caption" | "alt" | "width" | "height" | "featured" | "status"
> &
  Partial<Pick<PhotoRow, "focus_x" | "focus_y" | "zoom">>;

export const chave = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

/**
 * Agrupa a biblioteca: categoria → produto → itens. Destaques primeiro;
 * produtos com mais material primeiro; "Volume Inglês" e "volume inglês"
 * são o mesmo produto (vale o nome mais usado). Categoria sem nada some.
 */
export function montarCatalogo(linhas: Linha[]): CategoriaCatalogo[] {
  const ativas = linhas.filter((l) => l.status === "active");
  return CATEGORIAS.map((cat) => {
    const daCategoria = ativas
      .filter((l) => (l.category ?? "cilios") === cat.slug)
      .sort((a, b) => Number(b.featured) - Number(a.featured));
    const grupos = new Map<string, { nomes: Map<string, number>; itens: MidiaCatalogo[] }>();
    for (const l of daCategoria) {
      const k = chave(l.lash_style);
      const g = grupos.get(k) ?? { nomes: new Map<string, number>(), itens: [] as MidiaCatalogo[] };
      g.nomes.set(l.lash_style.trim(), (g.nomes.get(l.lash_style.trim()) ?? 0) + 1);
      g.itens.push({
        id: l.id,
        url: l.public_url,
        tipo: l.media_type === "video" ? ("video" as const) : ("image" as const),
        produto: l.lash_style.trim(),
        legenda: l.caption,
        alt: l.alt,
        ratio: l.width && l.height ? l.width / l.height : 4 / 5,
        foco: { x: Number(l.focus_x ?? 50), y: Number(l.focus_y ?? 50), zoom: Number(l.zoom ?? 1) },
      });
      grupos.set(k, g);
    }
    const produtos = [...grupos.values()]
      .map((g) => {
        const nome = [...g.nomes.entries()].sort((a, b) => b[1] - a[1])[0][0];
        return { nome, itens: g.itens.map((i) => ({ ...i, produto: nome })) };
      })
      .sort((a, b) => b.itens.length - a.itens.length);
    return { slug: cat.slug, label: cat.label, produtos, total: daCategoria.length };
  }).filter((c) => c.total > 0);
}

/** Os itens de uma categoria, todos os produtos juntos (para os rolos curtos). */
export function itensDaCategoria(catalogo: CategoriaCatalogo[], slug: CategoriaMidia): MidiaCatalogo[] {
  return catalogo.find((c) => c.slug === slug)?.produtos.flatMap((p) => p.itens) ?? [];
}

/** Distância de edição entre duas palavras (quantas letras trocar). */
function distancia(a: string, b: string): number {
  const linha = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let anterior = linha[0];
    linha[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const guardado = linha[j];
      linha[j] = Math.min(linha[j] + 1, linha[j - 1] + 1, anterior + (a[i - 1] === b[j - 1] ? 0 : 1));
      anterior = guardado;
    }
  }
  return linha[b.length];
}

/**
 * O produto novo que ela digitou já existe com outra grafia? Devolve o nome
 * existente quando é o mesmo sem acento/caixa ou está a um erro de digitação
 * (até 2 letras em nomes de 6+). "volume ingles" → "Volume inglês". Assim o
 * rolo de Volume inglês não se divide em dois — e Volume brasileiro, que é
 * outra palavra, segue separado.
 */
export function produtoParecido(nome: string, existentes: string[]): string | null {
  const k = chave(nome);
  if (k.length < 2) return null;
  let melhor: { nome: string; d: number } | null = null;
  for (const e of existentes) {
    const ke = chave(e);
    if (ke === k) return e;
    const limite = Math.min(k.length, ke.length) >= 6 ? 2 : 1;
    const d = distancia(k, ke);
    if (d <= limite && (!melhor || d < melhor.d)) melhor = { nome: e, d };
  }
  return melhor?.nome ?? null;
}

/** O enquadramento vira estilo igual no painel e no site: cobre, centro e zoom no ponto escolhido. */
export function estiloFoco(f: { x: number; y: number; zoom: number }): CSSProperties {
  return {
    objectFit: "cover",
    objectPosition: `${f.x}% ${f.y}%`,
    transform: f.zoom > 1 ? `scale(${f.zoom})` : undefined,
    transformOrigin: `${f.x}% ${f.y}%`,
  };
}

/** Chave do valor de um produto: categoria + nome normalizado (igual ao agrupamento). */
export function chavePreco(categoria: string, nome: string): string {
  return `${categoria}:${chave(nome)}`;
}

/** Põe em cada produto do catálogo o valor que a Tayssa cadastrou. */
export function comPrecos(catalogo: CategoriaCatalogo[], precos: Record<string, number>): CategoriaCatalogo[] {
  return catalogo.map((c) => ({
    ...c,
    produtos: c.produtos.map((p) => ({ ...p, preco: precos[chavePreco(c.slug, p.nome)] ?? null })),
  }));
}
