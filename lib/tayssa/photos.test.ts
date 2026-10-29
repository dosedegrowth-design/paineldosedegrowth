/**
 * Testes da distribuição das fotos pelo site. Rodar:
 *   node --experimental-strip-types --test lib/tayssa/photos.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { assignPhotos, type LibraryPhoto } from "./photos.ts";

const foto = (id: string, lash_style: string, featured = false): LibraryPhoto => ({
  id,
  public_url: `https://x/${id}.jpg`,
  lash_style,
  caption: null,
  alt: lash_style,
  width: 800,
  height: 1000,
  featured,
});

test("a foto da abertura e as da sequência não se repetem logo abaixo", () => {
  const a = assignPhotos([
    foto("h", "Volume inglês", true),
    foto("m1", "Mega brasileiro", true),
    foto("v1", "Volume brasileiro"),
    foto("f1", "Volume Fox eyes"),
  ]);
  assert.equal(a.hero?.src, "https://x/h.jpg");
  // a primeira técnica não repete a abertura
  assert.equal(a.work[0].src, "https://x/m1.jpg");
  assert.equal(a.work[1].src, "https://x/f1.jpg");
  // o serviço pega outra foto do mesmo nome, não a da sequência
  assert.equal(a.byService["volume-brasileiro"].src, "https://x/v1.jpg");
  // com uma foto só do serviço, ela se repete em vez de faltar
  assert.equal(a.byService["volume-fox-eyes"].src, "https://x/f1.jpg");
});
