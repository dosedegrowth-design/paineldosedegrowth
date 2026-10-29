/**
 * Testes da distribuição das fotos pelo site. Rodar:
 *   node --experimental-strip-types --test lib/tayssa/photos.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { PHOTOS, assignPhotos, type LibraryPhoto } from "./photos.ts";

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

test("a abertura mostra o mesmo retrato da biografia", () => {
  const a = assignPhotos([foto("h", "Volume inglês", true), foto("f1", "Volume Fox eyes")]);
  assert.equal(a.hero?.src, PHOTOS.portrait.src);
  assert.equal(a.portrait?.src, PHOTOS.portrait.src);
  // na janela quadrada, o rosto dela fica no terço de cima
  assert.equal(a.hero?.posicao, PHOTOS.portrait.posicao);
  // a foto em destaque não some: abre a sequência de trabalho
  assert.equal(a.work[0].src, "https://x/h.jpg");
});

test("o retrato da biblioteca abre o site e não vira foto de trabalho", () => {
  const a = assignPhotos([foto("r", "Retrato da Tayssa Lash", true), foto("v1", "Volume inglês")]);
  assert.equal(a.hero?.src, "https://x/r.jpg");
  assert.equal(a.portrait?.src, "https://x/r.jpg");
  assert.equal(a.work[0].src, "https://x/v1.jpg");
  // "Lash" no nome não põe o retrato no lugar de um serviço de cílios
  assert.notEqual(a.byService["aplicacao-cilios"]?.src, "https://x/r.jpg");
});

test("a primeira técnica é o volume inglês: outro volume não entra no lugar", () => {
  const a = assignPhotos([
    foto("b", "Mega brasileiro", true),
    foto("e", "Volume egípcio", true),
    foto("i", "Volume inglês"),
  ]);
  assert.equal(a.work[0].src, "https://x/i.jpg");
  // sem foto de volume inglês, entra o estático, que não afirma técnica
  const s = assignPhotos([foto("b", "Mega brasileiro", true)]);
  assert.equal(s.work[0].src, PHOTOS.work01.src);
});

test("as fotos da sequência não se repetem logo abaixo, nos serviços", () => {
  const a = assignPhotos([
    foto("m1", "Mega inglês", true),
    foto("v1", "Volume inglês"),
    foto("f1", "Volume Fox eyes"),
  ]);
  assert.equal(a.work[0].src, "https://x/m1.jpg");
  assert.equal(a.work[1].src, "https://x/f1.jpg");
  // o serviço pega outra foto do mesmo nome, não a da sequência
  assert.equal(a.byService["volume-ingles"].src, "https://x/v1.jpg");
  // com uma foto só do serviço, ela se repete em vez de faltar
  assert.equal(a.byService["volume-fox-eyes"].src, "https://x/f1.jpg");
});
