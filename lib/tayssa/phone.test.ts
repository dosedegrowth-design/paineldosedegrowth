/**
 * Telefones. Rodar:
 *   node --experimental-strip-types --test lib/tayssa/phone.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeBrPhone } from "./phone.ts";

test("celular com e sem o 9 é a mesma linha", () => {
  assert.equal(normalizeBrPhone("(11) 98765-4321"), "5511987654321");
  assert.equal(normalizeBrPhone("(11) 8765-4321"), "5511987654321");
  assert.equal(normalizeBrPhone("55 11 8765 4321"), "5511987654321");
  assert.equal(normalizeBrPhone("+55 (11) 98765-4321"), "5511987654321");
});

test("fixo continua com 8 dígitos", () => {
  assert.equal(normalizeBrPhone("(11) 3222-1234"), "551132221234");
  assert.equal(normalizeBrPhone("5511 3222 1234"), "551132221234");
});

test("DDD 55 (RS) não se confunde com o código do país", () => {
  assert.equal(normalizeBrPhone("(55) 99999-1234"), "5555999991234");
  assert.equal(normalizeBrPhone("(55) 3222-1234"), "555532221234");
});

test("o que não é telefone volta null", () => {
  assert.equal(normalizeBrPhone(""), null);
  assert.equal(normalizeBrPhone("123"), null);
  assert.equal(normalizeBrPhone("abc"), null);
});
