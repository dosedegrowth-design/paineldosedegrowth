/**
 * Telefones. Rodar:
 *   node --experimental-strip-types --test lib/tayssa/phone.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { chaveDoLogin, mascaraTelefone, normalizeBrPhone } from "./phone.ts";

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

test("entrar: com @ é e-mail, sem é o WhatsApp", () => {
  assert.deepEqual(chaveDoLogin(" Maria@Exemplo.com "), { tipo: "email", valor: "maria@exemplo.com" });
  assert.deepEqual(chaveDoLogin("(11) 98765-4321"), { tipo: "whatsapp", valor: "5511987654321" });
  assert.deepEqual(chaveDoLogin("11 8765 4321"), { tipo: "whatsapp", valor: "5511987654321" });
  assert.equal(chaveDoLogin("maria@"), null);
  assert.equal(chaveDoLogin("123"), null);
  assert.equal(chaveDoLogin("   "), null);
});

test("máscara do WhatsApp enquanto digita", () => {
  assert.equal(mascaraTelefone(""), "");
  assert.equal(mascaraTelefone("1"), "(1");
  assert.equal(mascaraTelefone("11"), "(11");
  assert.equal(mascaraTelefone("119"), "(11) 9");
  assert.equal(mascaraTelefone("119876"), "(11) 9876");
  assert.equal(mascaraTelefone("1198765"), "(11) 9876-5");
  assert.equal(mascaraTelefone("1198765432"), "(11) 9876-5432");
  assert.equal(mascaraTelefone("11987654321"), "(11) 98765-4321");
  // já mascarado, digitado de novo por cima: não muda
  assert.equal(mascaraTelefone("(11) 98765-4321"), "(11) 98765-4321");
  // colou com +55 ou com dígito a mais
  assert.equal(mascaraTelefone("+55 11 98765-4321"), "(11) 98765-4321");
  assert.equal(mascaraTelefone("119876543210"), "(11) 98765-4321");
  // apagar: "(11) " sem o espaço vira "(11", e o hífen sai com o dígito
  assert.equal(mascaraTelefone("(11)"), "(11");
  assert.equal(mascaraTelefone("(11) 9876-"), "(11) 9876");
  // o que a máscara entrega o servidor entende
  assert.equal(normalizeBrPhone(mascaraTelefone("11987654321")), "5511987654321");
});
