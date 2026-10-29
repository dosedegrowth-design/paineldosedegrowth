import type { CSSProperties } from "react";
import type { CategoriaMidia, PhotoRow, ServiceRow } from "@/lib/tayssa/types";

/**
 * O catálogo de mídia do site: cada foto ou vídeo que a Tayssa sobe no
 * painel tem categoria (cílios, sobrancelha…) e produto ("Volume inglês").
 * Daqui saem os rolos de cada produto, em vários pontos do site. Puro —
 * sem banco, sem React — para ser testado e usado dos dois lados.
 */
export const CATEGORIAS: { slug: CategoriaMidia; label: string; servicos: string[] }[] = [
  {
    slug: "cilios",
    label: "Cílios",
    servicos: [
      "volume-brasileiro",
      "volume-ingles",
      "volume-egipcio",
      "volume-marrom",
      "volume-fox-eyes",
      "manutencao-cilios",
      "lash-lifting",
      "remocao-extensao",
      "aplicacao-cilios",
    ],
  },
  { slug: "sobrancelha", label: "Sobrancelha", servicos: ["brow-lamination", "design-sobrancelhas"] },
  { slug: "labios", label: "Boca e lábios", servicos: ["hidragloss", "lip-spa"] },
  { slug: "pele", label: "Pele", servicos: ["limpeza-de-pele"] },
  { slug: "outro", label: "Outros", servicos: [] },
];

/** Categoria de um serviço do catálogo (pela slug; serviço novo cai pelo nome). */
export function categoriaDoServico(slug: string, nome = ""): CategoriaMidia {
  const achou = CATEGORIAS.find((c) => c.servicos.includes(slug));
  if (achou) return achou.slug;
  const n = `${slug} ${nome}`.toLowerCase();
  if (/c[ií]lio|lash|volume|fio|fox|extens/.test(n)) return "cilios";
  if (/sobrancelh|brow/.test(n)) return "sobrancelha";
  if (/l[aá]bio|lip|boca|gloss/.test(n)) return "labios";
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

/**
 * Um de cada lista por vez: [a1, b1, c1, a2, b2, a3…]. O rolo mostra só o
 * começo da fila; assim cada produto aparece logo, em vez de doze fotos do
 * produto maior e nenhuma dos outros.
 */
export function intercalar<T>(listas: T[][]): T[] {
  const out: T[] = [];
  const maior = Math.max(0, ...listas.map((l) => l.length));
  for (let i = 0; i < maior; i++) for (const l of listas) if (i < l.length) out.push(l[i]);
  return out;
}

/**
 * O rolo de cada serviço da lista do site: as fotos e vídeos do produto
 * que tem o nome dele ("Volume brasileiro", ou "Fox eyes" e "Mega Fox eyes"
 * para "Volume Fox eyes", ou "Manutenção" para "Manutenção de cílios").
 * Produto que não é de um serviço só ("Volume") vai para o primeiro serviço
 * da categoria. Antes cada serviço levava a categoria inteira: com oito
 * serviços de cílios, o mesmo rolo aparecia oito vezes.
 */
export function rolosDosServicos(
  catalogo: CategoriaCatalogo[],
  servicos: { slug: string; name: string }[]
): Record<string, MidiaCatalogo[]> {
  const listas: Record<string, MidiaCatalogo[][]> = {};
  // "Volume inglês", "Mega inglês" e "inglês" são o mesmo volume
  const base = (k: string) => k.replace(/^(volume|mega)\s+/, "");
  for (const cat of catalogo) {
    const daCategoria = servicos.filter((s) => categoriaDoServico(s.slug, s.name) === cat.slug);
    if (!daCategoria.length) continue;
    for (const p of cat.produtos) {
      const kp = chave(p.nome);
      const exatos = daCategoria.filter((s) => chave(s.name) === kp || base(chave(s.name)) === base(kp));
      const contem = daCategoria.filter((s) => chave(s.name).includes(kp) || kp.includes(chave(s.name)));
      const dono = exatos.length === 1 ? exatos[0] : contem.length === 1 ? contem[0] : daCategoria[0];
      (listas[dono.slug] ??= []).push(p.itens);
    }
  }
  // Volume inglês e Mega inglês se alternam no rolo, em vez de um depois do outro
  return Object.fromEntries(Object.entries(listas).map(([slug, ls]) => [slug, intercalar(ls)]));
}

/** Uma foto do banco que pode virar capa: só o que a capa precisa. */
export type FotoDeCapa = Pick<PhotoRow, "id" | "public_url" | "alt"> & { media_type?: "image" | "video" };

export type CapaServico = {
  id: string;
  url: string;
  alt: string;
  foco: { x: number; y: number; zoom: number };
  /** a Tayssa escolheu no painel (senão é a primeira foto do serviço) */
  escolhida: boolean;
};

/**
 * A capa de cada serviço: a foto que a Tayssa escolheu no painel (Mídia →
 * Capas), com o enquadramento dela; sem escolha, a primeira foto do
 * carrossel do próprio serviço, com o enquadramento que ela deu ao
 * publicar. Serviço sem foto fica sem capa: nunca a foto de outro serviço
 * no lugar (a Manutenção mostrava um close qualquer).
 */
export function capasDosServicos(
  servicos: Pick<ServiceRow, "slug" | "capa_photo_id" | "capa_x" | "capa_y" | "capa_zoom">[],
  rolos: Record<string, MidiaCatalogo[]>,
  fotos: Record<string, FotoDeCapa>
): Record<string, CapaServico | null> {
  const capas: Record<string, CapaServico | null> = {};
  for (const s of servicos) {
    const escolhida = s.capa_photo_id ? fotos[s.capa_photo_id] : undefined;
    if (escolhida && escolhida.media_type !== "video") {
      capas[s.slug] = {
        id: escolhida.id,
        url: escolhida.public_url,
        alt: escolhida.alt,
        foco: { x: Number(s.capa_x ?? 50), y: Number(s.capa_y ?? 50), zoom: Number(s.capa_zoom ?? 1) },
        escolhida: true,
      };
      continue;
    }
    const primeira = (rolos[s.slug] ?? []).find((m) => m.tipo === "image");
    capas[s.slug] = primeira
      ? { id: primeira.id, url: primeira.url, alt: primeira.alt, foco: primeira.foco, escolhida: false }
      : null;
  }
  return capas;
}

/**
 * Tudo do serviço com a capa na frente: é o que passa dentro do cartão do
 * carrossel de cima (só as fotos) e o que o visor abre ao tocar nele. A
 * capa vem com o enquadramento dela; se a Tayssa escolheu uma foto que não
 * está no rolo do serviço, ela entra assim mesmo, com o nome do serviço.
 */
export function midiasDoServico(rolo: MidiaCatalogo[], capa: CapaServico | null, nome: string): MidiaCatalogo[] {
  if (!capa) return rolo;
  const noRolo = rolo.find((m) => m.id === capa.id);
  const primeira: MidiaCatalogo = {
    ...(noRolo ?? { id: capa.id, url: capa.url, tipo: "image", produto: nome, legenda: null, alt: capa.alt, ratio: 4 / 5 }),
    foco: capa.foco,
  };
  return [primeira, ...rolo.filter((m) => m.id !== capa.id)];
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
