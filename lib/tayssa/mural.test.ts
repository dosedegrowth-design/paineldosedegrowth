/**
 * Mural do VIP. Rodar:
 *   node --experimental-strip-types --test lib/tayssa/mural.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fileirasDoMural, fotosDoMural } from "./mural.ts";

const foto = (id: string, extra: Record<string, unknown> = {}) => ({
  public_url: `https://x.supabase.co/${id}`,
  media_type: "image" as const,
  status: "active" as const,
  ...extra,
});

test("só imagem publicada; vídeo e galeria ficam de fora", () => {
  const fotos = fotosDoMural(
    [foto("a"), foto("v", { media_type: "video" }), foto("g", { status: "gallery" }), foto("b", { focus_x: 30, focus_y: 70, zoom: 1.2 })],
    [],
    0,
  );
  assert.deepEqual(
    fotos.map((f) => f.src),
    ["https://x.supabase.co/a", "https://x.supabase.co/b"],
  );
  assert.deepEqual(fotos[1].foco, { x: 30, y: 70, zoom: 1.2 });
});

test("com poucas publicadas, completa com as fotos do site, sem repetir", () => {
  const fotos = fotosDoMural([foto("a")], ["/tayssa/photos/hero.jpg", "/tayssa/photos/hero.jpg", "/tayssa/photos/work-01.jpg"]);
  assert.deepEqual(
    fotos.map((f) => f.src),
    ["https://x.supabase.co/a", "/tayssa/photos/hero.jpg", "/tayssa/photos/work-01.jpg"],
  );
  const cheias = fotosDoMural(["1", "2", "3", "4", "5", "6"].map((i) => foto(i)), ["/x.jpg"]);
  assert.equal(cheias.length, 6);
});

test("fileiras cobrem a largura e vizinhas começam em fotos diferentes", () => {
  const fotos = fotosDoMural([], ["/a.jpg", "/b.jpg", "/c.jpg"], 6);
  const f = fileirasDoMural(fotos, 4, 7);
  assert.equal(f.length, 4);
  assert.ok(f.every((linha) => linha.length === 7));
  for (let i = 1; i < f.length; i++) assert.notEqual(f[i][0].src, f[i - 1][0].src);
  assert.deepEqual(fileirasDoMural([], 4), []);
});
