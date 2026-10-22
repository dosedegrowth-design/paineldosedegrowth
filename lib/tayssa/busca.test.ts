/**
 * Busca do painel. Rodar:
 *   node --experimental-strip-types --test lib/tayssa/busca.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { bateBusca, semAcento } from "./busca.ts";

test("busca sem acento e sem caixa", () => {
  assert.equal(semAcento("Cartão Mídia"), "cartao midia");
  assert.equal(bateBusca("cartao", ["Cliente Demo Cartão Cheio"]), true);
  assert.equal(bateBusca("MIDIA", ["Mídia", "Site"]), true);
  assert.equal(bateBusca("zzz", ["Cliente Demo"]), false);
  assert.equal(bateBusca("  ", ["qualquer"]), true);
});

test("telefone com máscara acha só pelos dígitos", () => {
  assert.equal(bateBusca("(11) 90000-0002", ["Cliente Demo VIP", "5511900000002"]), true);
  assert.equal(bateBusca("90000-0002", [null, "5511900000002"]), true);
  assert.equal(bateBusca("+55 11 9", ["5511900000002"]), true);
  assert.equal(bateBusca("(11) 99999-9999", ["5511900000002"]), false);
  // número curto demais não vira busca por dígitos (evita "1" achar todo mundo)
  assert.equal(bateBusca("12", ["5511900000002"]), false);
});
