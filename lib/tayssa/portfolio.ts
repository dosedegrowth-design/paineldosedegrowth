/**
 * O portfólio do site: o trabalho dela dentro de celulares com a cara do
 * Instagram (vídeo vira Reel, foto vira publicação), flutuando na seção do
 * Instagram. Tocar abre o item dentro do site; de lá, "Ver no Instagram"
 * leva ao post (ou ao perfil, enquanto o link do post não foi colado).
 * Puro (sem banco, sem React) para ser testado e usado dos dois lados.
 */
import type { PhotoRow } from "@/lib/tayssa/types";
import type { ReelInstagram } from "@/lib/tayssa/content";
import type { PhotoSlot } from "@/lib/tayssa/photos";

export type ItemPortfolio = {
  id: string;
  tipo: "video" | "foto";
  src: string;
  poster: string | null;
  /** o produto ("Volume inglês") ou a legenda do Reel */
  legenda: string;
  alt: string;
  /** a publicação no Instagram; null = o botão vai para o perfil */
  url: string | null;
  /** enquadramento escolhido ao publicar: centro (%) e zoom */
  foco: { x: number; y: number; zoom: number };
};

type Linha = Pick<PhotoRow, "id" | "public_url" | "media_type" | "lash_style" | "caption" | "alt" | "featured" | "status"> &
  Partial<Pick<PhotoRow, "focus_x" | "focus_y" | "zoom" | "instagram_url">>;

/** Só link de Instagram de verdade vira botão para o post. */
export function linkInstagram(url: string | null | undefined): string | null {
  const u = url?.trim();
  return u && /^https:\/\/(www\.)?instagram\.com\/\S+$/.test(u) ? u : null;
}

/**
 * Monta a fila: os Reels cadastrados no conteúdo primeiro (já são do
 * Instagram), depois a mídia publicada no painel — destaques antes, e
 * vídeo e foto alternando para os celulares não ficarem todos iguais. O
 * primeiro é o do meio, na frente: de preferência um vídeo.
 */
export function montarPortfolio(linhas: Linha[], reels: ReelInstagram[] = [], max = 12): ItemPortfolio[] {
  const doConteudo: ItemPortfolio[] = reels.map((r, i) => ({
    id: `reel-${i}`,
    tipo: "video",
    src: r.video,
    poster: r.poster ?? null,
    legenda: r.legenda ?? "",
    alt: r.legenda ?? "Vídeo do Instagram",
    url: linkInstagram(r.url),
    foco: { x: 50, y: 50, zoom: 1 },
  }));

  const ativas = linhas
    .filter((l) => l.status === "active" && l.public_url)
    .sort((a, b) => Number(b.featured) - Number(a.featured));
  const paraItem = (l: Linha): ItemPortfolio => ({
    id: l.id,
    tipo: l.media_type === "video" ? "video" : "foto",
    src: l.public_url,
    poster: null,
    legenda: l.caption?.trim() || l.lash_style,
    alt: l.alt,
    url: linkInstagram(l.instagram_url),
    foco: { x: Number(l.focus_x ?? 50), y: Number(l.focus_y ?? 50), zoom: Number(l.zoom ?? 1) },
  });
  const videos = ativas.filter((l) => l.media_type === "video").map(paraItem);
  const fotos = ativas.filter((l) => l.media_type !== "video").map(paraItem);
  const alternados: ItemPortfolio[] = [];
  for (let i = 0; i < Math.max(videos.length, fotos.length); i++) {
    if (videos[i]) alternados.push(videos[i]);
    if (fotos[i]) alternados.push(fotos[i]);
  }

  const vistos = new Set<string>();
  return [...doConteudo, ...alternados]
    .filter((it) => (vistos.has(it.src) ? false : (vistos.add(it.src), true)))
    .slice(0, max);
}

/**
 * Enquanto a Mídia do painel tem pouco (ou nada) publicado, o portfólio
 * completa com as fotos reais que o site já mostra — como publicações. Assim
 * os celulares existem desde o primeiro dia; quando ela publicar, o trabalho
 * dela entra na frente.
 */
export function completarComFotos(itens: ItemPortfolio[], fotos: PhotoSlot[], minimo = 5): ItemPortfolio[] {
  if (itens.length >= minimo) return itens;
  const usados = new Set(itens.map((i) => i.src));
  const extras = fotos
    .filter((f) => f.src && !usados.has(f.src))
    .filter((f, i, todas) => todas.findIndex((g) => g.src === f.src) === i)
    .slice(0, minimo - itens.length)
    .map(
      (f, i): ItemPortfolio => ({
        id: `foto-${i}`,
        tipo: "foto",
        src: f.src,
        poster: null,
        legenda: f.caption ?? "",
        alt: f.alt,
        url: null,
        foco: { x: 50, y: 50, zoom: 1 },
      }),
    );
  return [...itens, ...extras];
}
