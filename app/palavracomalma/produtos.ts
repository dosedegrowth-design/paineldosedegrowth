// Produtos reais da loja (www.palavracomalma.com.br), lidos da API pública da
// vitrine da Tray em 14/out/2026. Servem só de exemplo visual nesta página:
// nada aqui é sincronizado com a loja.

export type Categoria = "Cadernos" | "Baralhos" | "Magias" | "Facas" | "Variedades 3D";

export type Produto = {
  id: number;
  nome: string;
  categoria: Categoria;
  preco: number;
  promo?: number;
  disponivel: boolean;
  img: string;
  img2?: string;
};

const P = (id: number, segunda = false) => ({
  img: `/palavracomalma/p/${id}.jpg`,
  img2: segunda ? `/palavracomalma/p/${id}-2.jpg` : undefined,
});

export const CATEGORIAS: Categoria[] = ["Cadernos", "Baralhos", "Magias", "Facas", "Variedades 3D"];

export const PRODUTOS: Produto[] = [
  { id: 203, nome: "Caderno Oxóssi · Coleção Orixás", categoria: "Cadernos", preco: 102.77, promo: 92.49, disponivel: true, ...P(203, true) },
  { id: 219, nome: "Caderno da Sombra · A5", categoria: "Cadernos", preco: 117.77, promo: 77.77, disponivel: false, ...P(219, true) },
  { id: 227, nome: "Caderno Portal da Kalunga", categoria: "Cadernos", preco: 67.0, promo: 60.3, disponivel: true, ...P(227, true) },
  { id: 235, nome: "O Mago · Coleção Tarot", categoria: "Cadernos", preco: 47.77, promo: 42.99, disponivel: true, ...P(235, true) },
  { id: 241, nome: "Girassol · Coleção Frases", categoria: "Cadernos", preco: 47.77, promo: 42.99, disponivel: true, ...P(241, true) },
  { id: 267, nome: "Planejador Duplo Mensal e Semanal", categoria: "Cadernos", preco: 97.77, promo: 87.99, disponivel: true, ...P(267, true) },
  { id: 231, nome: "Caderno Véu das Rosas", categoria: "Cadernos", preco: 117.77, promo: 77.77, disponivel: false, ...P(231, true) },
  { id: 259, nome: "Deck Grande Realista · Capa Caveira", categoria: "Baralhos", preco: 87.9, promo: 79.11, disponivel: true, ...P(259, true) },
  { id: 261, nome: "Deck Grande Realista · Capa Rosas", categoria: "Baralhos", preco: 87.9, promo: 79.11, disponivel: true, ...P(261, true) },
  { id: 263, nome: "Deck Grande Pomba Gira", categoria: "Baralhos", preco: 87.9, promo: 79.11, disponivel: true, ...P(263, true) },
  { id: 189, nome: "Magia no Espelho", categoria: "Magias", preco: 399.99, promo: 359.99, disponivel: true, ...P(189) },
  { id: 199, nome: "Cabaça Simples", categoria: "Magias", preco: 59.99, promo: 53.99, disponivel: true, ...P(199) },
  { id: 197, nome: "Cabaça Personalizada", categoria: "Magias", preco: 129.99, promo: 116.99, disponivel: true, ...P(197) },
  { id: 193, nome: "Óleos · Tranquilidade e Sono", categoria: "Magias", preco: 57.77, promo: 51.99, disponivel: true, ...P(193) },
  { id: 251, nome: "Faca Cabo Caveira Justiceiro", categoria: "Facas", preco: 149.9, promo: 134.91, disponivel: true, ...P(251) },
  { id: 247, nome: "Faca Cabo Chifre de Cervo", categoria: "Facas", preco: 149.9, promo: 134.91, disponivel: true, ...P(247) },
  { id: 269, nome: "Cabeça de Bode 3D · Grande", categoria: "Variedades 3D", preco: 69.9, promo: 62.91, disponivel: true, ...P(269, true) },
  { id: 281, nome: "Mão Caveira · Enfeite", categoria: "Variedades 3D", preco: 39.9, promo: 35.91, disponivel: true, ...P(281, true) },
  { id: 297, nome: "Caveira Flor da Sombra", categoria: "Variedades 3D", preco: 15.0, promo: 13.5, disponivel: true, ...P(297, true) },
  { id: 291, nome: "Chaveiro Pomba Gira 3D", categoria: "Variedades 3D", preco: 10.9, promo: 9.81, disponivel: true, ...P(291, true) },
];

export const porId = (id: number) => {
  const p = PRODUTOS.find((x) => x.id === id);
  if (!p) throw new Error(`Produto ${id} não está na lista de exemplos`);
  return p;
};

export const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
