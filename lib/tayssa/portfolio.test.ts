/**
 * Portfólio do site. Rodar:
 *   node --experimental-strip-types --test lib/tayssa/portfolio.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { linkInstagram, montarPortfolio } from "./portfolio.ts";

const linha = (id: string, media_type: "image" | "video", extra: Record<string, unknown> = {}) => ({
  id,
  public_url: `https://x.supabase.co/${id}`,
  media_type,
  lash_style: "Volume inglês",
  caption: null,
  alt: "trabalho",
  featured: false,
  status: "active" as const,
  ...extra,
});

test("só link de Instagram vira botão para o post", () => {
  assert.equal(linkInstagram("https://www.instagram.com/p/abc/"), "https://www.instagram.com/p/abc/");
  assert.equal(linkInstagram("  https://instagram.com/reel/xyz  "), "https://instagram.com/reel/xyz");
  assert.equal(linkInstagram("https://evil.com/instagram.com/p/abc"), null);
  assert.equal(linkInstagram("javascript:alert(1)"), null);
  assert.equal(linkInstagram(""), null);
  assert.equal(linkInstagram(null), null);
});

test("vídeo e foto alternam, destaque primeiro, vídeo na frente", () => {
  const itens = montarPortfolio([
    linha("f1", "image"),
    linha("v1", "video"),
    linha("f2", "image", { featured: true }),
    linha("v2", "video"),
  ]);
  assert.deepEqual(
    itens.map((i) => i.id),
    ["v1", "f2", "v2", "f1"],
  );
  assert.equal(itens[0].tipo, "video");
  assert.equal(itens[1].tipo, "foto");
});

test("fora do site não entra; repetido não entra; respeita o máximo", () => {
  const itens = montarPortfolio(
    [linha("a", "image"), linha("b", "image", { status: "gallery" }), linha("c", "video"), linha("d", "image")],
    [],
    2,
  );
  assert.deepEqual(
    itens.map((i) => i.id),
    ["c", "a"],
  );
});

test("Reels do conteúdo vêm primeiro, com o link do post", () => {
  const itens = montarPortfolio([linha("a", "image", { instagram_url: "https://www.instagram.com/p/123/" })], [
    { video: "/v.mp4", url: "https://www.instagram.com/reel/9/", legenda: "Volume brasileiro" },
  ]);
  assert.equal(itens[0].id, "reel-0");
  assert.equal(itens[0].url, "https://www.instagram.com/reel/9/");
  assert.equal(itens[0].legenda, "Volume brasileiro");
  assert.equal(itens[1].url, "https://www.instagram.com/p/123/");
});

test("legenda: a da foto, senão o produto; enquadramento vem junto", () => {
  const [a, b] = montarPortfolio([
    linha("a", "image", { caption: "  Fio a fio  ", focus_x: 30, focus_y: 60, zoom: 1.4 }),
    linha("b", "video"),
  ]);
  assert.equal(b.legenda, "Fio a fio");
  assert.deepEqual(b.foco, { x: 30, y: 60, zoom: 1.4 });
  assert.equal(a.legenda, "Volume inglês");
});
