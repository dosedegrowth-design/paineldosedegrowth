/**
 * Testes do catálogo de mídia. Rodar:
 *   node --experimental-strip-types --test lib/tayssa/catalogo.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { categoriaDoServico, itensDaCategoria, montarCatalogo, produtoParecido, rolosDosServicos } from "./catalogo.ts";

const linha = (o: Partial<Parameters<typeof montarCatalogo>[0][number]> & { id: string }) => ({
  public_url: `https://x/${o.id}.jpg`,
  lash_style: "Volume inglês",
  category: "cilios" as const,
  media_type: "image" as const,
  caption: null,
  alt: "alt",
  width: 800,
  height: 1000,
  featured: false,
  status: "active" as const,
  ...o,
});

test("agrupa por categoria e produto, sem diferença de caixa ou acento", () => {
  const cat = montarCatalogo([
    linha({ id: "a", lash_style: "Volume inglês" }),
    linha({ id: "b", lash_style: "volume ingles" }),
    linha({ id: "c", lash_style: "Volume Inglês" }),
    linha({ id: "d", lash_style: "Fio a fio" }),
    linha({ id: "e", lash_style: "Henna", category: "sobrancelha" }),
  ]);
  assert.equal(cat.length, 2);
  const cilios = cat[0];
  assert.equal(cilios.slug, "cilios");
  assert.equal(cilios.total, 4);
  // o produto com mais material vem primeiro
  assert.equal(cilios.produtos[0].itens.length, 3);
  // as três grafias viram um produto só, com o nome mais usado
  assert.equal(cilios.produtos[0].nome, "Volume inglês");
  assert.ok(cilios.produtos[0].itens.every((i) => i.produto === "Volume inglês"));
  assert.equal(cat[1].slug, "sobrancelha");
});

test("arquivada não entra; categoria vazia some; destaque abre o rolo", () => {
  const cat = montarCatalogo([
    linha({ id: "a" }),
    linha({ id: "b", featured: true }),
    linha({ id: "c", status: "archived" }),
    linha({ id: "d", category: "pele", status: "archived" }),
  ]);
  assert.equal(cat.length, 1);
  assert.deepEqual(cat[0].produtos[0].itens.map((i) => i.id), ["b", "a"]);
});

test("vídeo é vídeo e sem medida vira vertical 4:5", () => {
  const [c] = montarCatalogo([linha({ id: "v", media_type: "video", width: null, height: null })]);
  assert.equal(c.produtos[0].itens[0].tipo, "video");
  assert.equal(c.produtos[0].itens[0].ratio, 4 / 5);
});

test("serviço encontra a categoria pela slug ou pelo nome", () => {
  assert.equal(categoriaDoServico("manutencao-cilios"), "cilios");
  assert.equal(categoriaDoServico("lip-spa"), "labios");
  assert.equal(categoriaDoServico("novo", "Brow lamination"), "sobrancelha");
  assert.equal(categoriaDoServico("novo", "Peeling facial"), "pele");
  assert.equal(categoriaDoServico("novo", "Massagem"), "outro");
  const cat = montarCatalogo([linha({ id: "a" }), linha({ id: "b", lash_style: "Fio a fio" })]);
  assert.equal(itensDaCategoria(cat, "cilios").length, 2);
  assert.equal(itensDaCategoria(cat, "pele").length, 0);
});

test("produto parecido: mesma grafia sem acento ou com erro de digitação", () => {
  const existentes = ["Volume inglês", "Volume brasileiro", "Fio a fio"];
  assert.equal(produtoParecido("volume ingles", existentes), "Volume inglês");
  assert.equal(produtoParecido("Volume inglêz", existentes), "Volume inglês");
  assert.equal(produtoParecido("volume  brasileiro", existentes), "Volume brasileiro");
  // outro produto de verdade não é confundido
  assert.equal(produtoParecido("Volume russo", existentes), null);
  assert.equal(produtoParecido("Fox eyes", existentes), null);
});

test("enquadramento vai junto e tem padrão no centro", () => {
  const [c] = montarCatalogo([linha({ id: "a", focus_x: 30, focus_y: 70, zoom: 1.6 }), linha({ id: "b" })]);
  assert.deepEqual(c.produtos[0].itens[0].foco, { x: 30, y: 70, zoom: 1.6 });
  assert.deepEqual(c.produtos[0].itens[1].foco, { x: 50, y: 50, zoom: 1 });
});

test("cada serviço leva o rolo do seu produto, sem repetir a categoria inteira", () => {
  const cat = montarCatalogo([
    linha({ id: "a", lash_style: "Volume brasileiro" }),
    linha({ id: "b", lash_style: "Fox eyes" }),
    linha({ id: "c", lash_style: "Manutenção" }),
    linha({ id: "d", lash_style: "Volume" }),
    linha({ id: "e", lash_style: "Mega brasileiro" }),
    linha({ id: "f", lash_style: "Brow Lamination", category: "sobrancelha" }),
  ]);
  const servicos = [
    { slug: "volume-brasileiro", name: "Volume brasileiro" },
    { slug: "volume-ingles", name: "Volume inglês" },
    { slug: "volume-fox-eyes", name: "Volume Fox eyes" },
    { slug: "manutencao-cilios", name: "Manutenção de cílios" },
    { slug: "brow-lamination", name: "Brow Lamination" },
    { slug: "design-sobrancelhas", name: "Design de sobrancelhas" },
  ];
  const rolos = rolosDosServicos(cat, servicos);
  const ids = (slug: string) => (rolos[slug] ?? []).map((i) => i.id).sort().join(",");
  // o seu, mais o que não é de um serviço só ("Volume", "Mega brasileiro")
  assert.equal(ids("volume-brasileiro"), "a,d,e");
  assert.equal(ids("volume-ingles"), "");
  assert.equal(ids("volume-fox-eyes"), "b");
  assert.equal(ids("manutencao-cilios"), "c");
  assert.equal(ids("brow-lamination"), "f");
  assert.equal(ids("design-sobrancelhas"), "");
  // nenhuma foto aparece em dois serviços
  const todos = Object.values(rolos).flat().map((i) => i.id);
  assert.equal(new Set(todos).size, todos.length);
});

test("serviços novos caem na categoria certa", () => {
  assert.equal(categoriaDoServico("remocao-extensao-x1", "Remoção da extensão"), "cilios");
  assert.equal(categoriaDoServico("volume-fox-eyes-x1", "Volume Fox eyes"), "cilios");
  assert.equal(categoriaDoServico("hidragloss-x1", "Hidragloss"), "labios");
  assert.equal(categoriaDoServico("brow-x1", "Brow Lamination"), "sobrancelha");
});
