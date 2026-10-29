// Catálogo real da Palavra com Alma, lido da API pública da vitrine da Tray
// (web_api/products, /variants e /categories/tree) em 27/out/2026.
// É um retrato: o site experimental não fala com a loja ao vivo.
import dados from "./dados.json";

export const BASE = "/palavracomalma/site";

export type Opcao = { tipo: string; valor: string };
export type Variacao = {
  id: number;
  opcoes: Opcao[];
  preco: number;
  promo: number | null;
  disponivel: boolean;
  img?: string | null;
};
export type Produto = {
  id: number;
  nome: string;
  slug: string;
  cat_id: number;
  cats: number[];
  cat: string;
  preco: number;
  promo: number | null;
  disponivel: boolean;
  destaque: boolean;
  lancamento: boolean;
  aviso: string;
  prazo: string;
  imgs: string[];
  desc: string;
  resumo: string;
  variacoes: Variacao[];
  /** Parcelamento real que a Tray mostra hoje (cartão pela Vindi). */
  parcela: { n: number; valor: number; juros: boolean; cartao: string } | null;
};
export type Categoria = {
  id: number;
  nome: string;
  slug: string;
  pai: number | null;
  ativo: boolean;
  descricao: string;
};

const CATS = dados.categorias as Categoria[];
const porIdCat = new Map(CATS.map((c) => [c.id, c]));

export function raiz(catId: number): Categoria | undefined {
  let c = porIdCat.get(catId);
  while (c && c.pai) c = porIdCat.get(c.pai);
  return c;
}

// Fotos retrabalhadas para o site: nos baralhos, recorte só das cartas (sem o panfleto com telefone);
// nos cadernos, sem a etiqueta de contato. As originais continuam na galeria do produto.
const F = "/palavracomalma/site/fotos";
const EDITADAS: Record<number, { trocar?: boolean; fotos: string[] }> = {
  11: { fotos: [`${F}/11-0.jpg`, `${F}/11-1.jpg`] },
  13: { fotos: [`${F}/13-0.jpg`, `${F}/13-1.jpg`] },
  15: { fotos: [`${F}/15-0.jpg`, `${F}/15-1.jpg`] },
  9: { fotos: [`${F}/9-0.jpg`, `${F}/9-1.jpg`] },
  7: { fotos: [`${F}/7-0.jpg`, `${F}/7-1.jpg`] },
  143: { fotos: [`${F}/143-1.jpg`, `${F}/143-0.jpg`] },
  21: { trocar: true, fotos: [`${F}/21-0.jpg`, `${F}/21-1.jpg`] },
};

/** Produtos que aparecem na loja: fora das categorias desativadas (Toalhas, Pronta Entrega). */
export const PRODUTOS: Produto[] = (dados.produtos as Produto[])
  .filter((p) => raiz(p.cat_id)?.ativo !== false)
  .map((p) => {
    const e = EDITADAS[p.id];
    return e ? { ...p, imgs: e.trocar ? e.fotos : [...e.fotos, ...p.imgs] } : p;
  });

export const porId = (id: number) => PRODUTOS.find((p) => p.id === id);

/** O produto está na categoria (direto, por categoria relacionada ou por uma filha dela)? */
export function pertence(p: Produto, catId: number) {
  return p.cats.some((c) => {
    let x = porIdCat.get(c);
    while (x) {
      if (x.id === catId) return true;
      x = x.pai ? porIdCat.get(x.pai) : undefined;
    }
    return false;
  });
}
export const daCategoria = (catId: number) => PRODUTOS.filter((p) => pertence(p, catId));

/** Ordem do menu de hoje da loja, só com o que tem produto. */
const ORDEM_MENU = [7, 9, 27, 31, 47, 51, 53, 61];
export const MENU = ORDEM_MENU.map((id) => porIdCat.get(id)!)
  .filter(Boolean)
  .map((c) => ({
    ...c,
    nome: c.id === 47 ? "Facas" : c.nome,
    filhas: CATS.filter((f) => f.pai === c.id && f.ativo && PRODUTOS.some((p) => pertence(p, f.id))),
    total: PRODUTOS.filter((p) => pertence(p, c.id)).length,
  }))
  .filter((c) => c.total > 0);

export const categoriaPorId = (id: number) => porIdCat.get(id);
export const categoriaPorSlug = (slug?: string) => CATS.find((c) => c.slug === slug);
export const doProduto = (p: Produto) => porIdCat.get(p.cat_id);

/** Nome mais limpo para cartões (o nome completo continua na página do produto). */
export function nomeCurto(nome: string) {
  return nome
    .replace(/\s*-\s*Personalizado ou Padrão/i, "")
    .replace(/\s*\|\s*Impressão 3D/i, "")
    .replace(/\s*\|\s*/g, " · ")
    .replace(/\s+-\s+/g, " · ")
    .replace(/\s+:\s+/g, " · ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export const precoFinal = (p: { preco: number; promo: number | null }) => p.promo ?? p.preco;
export const desconto = (p: { preco: number; promo: number | null }) =>
  p.promo ? Math.round((1 - p.promo / p.preco) * 100) : 0;
export const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/** "Disponível em 2 dias úteis" vira "Envio em 2 dias úteis"; "Imediata" vira "Pronta entrega". */
export function prazoLegivel(p: Produto) {
  if (!p.prazo) return "";
  if (/imediat/i.test(p.prazo)) return "Pronta entrega";
  return p.prazo.replace(/^Disponível em/i, "Postagem em");
}

/** Parcelamento real do produto, escalado para o preço de uma variação. */
export function parcelamento(p: Pick<Produto, "parcela" | "preco" | "promo">, valor = precoFinal(p)) {
  if (!p.parcela || p.parcela.n < 2) return null;
  const fator = (p.parcela.n * p.parcela.valor) / precoFinal(p);
  return { n: p.parcela.n, valor: (valor * fator) / p.parcela.n, juros: p.parcela.juros, fator };
}

export const personalizavel = (p: Produto) =>
  /personaliz/i.test(p.nome) || /arte/i.test(p.aviso) || raiz(p.cat_id)?.id === 31;

export const WHATSAPP = "5511945278301";
export const waLink = (texto: string) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`;
export const INSTAGRAM = "https://www.instagram.com/loja.palavracomalma/";
export const EMAIL = "lojapalavracomalma@gmail.com";

/** Cartão leve para listas (sem descrição), para não mandar o catálogo inteiro ao navegador. */
export type Cartao = Pick<Produto, "id" | "nome" | "preco" | "promo" | "disponivel" | "destaque" | "lancamento"> & {
  img: string;
  img2?: string;
  cat: number;
  catNome: string;
  temVariacao: boolean;
  fator: number;
};
export function cartao(p: Produto): Cartao {
  const r = raiz(p.cat_id);
  return {
    id: p.id,
    nome: nomeCurto(p.nome),
    preco: p.preco,
    promo: p.promo,
    disponivel: p.disponivel,
    destaque: p.destaque,
    lancamento: p.lancamento,
    img: p.imgs[0] ?? "",
    img2: p.imgs[1],
    cat: r?.id ?? 0,
    catNome: r?.nome ?? "",
    temVariacao: p.variacoes.length > 0,
    fator: parcelamento(p)?.fator ?? 1,
  };
}
