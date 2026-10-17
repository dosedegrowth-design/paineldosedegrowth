/**
 * Números que sobem. Rodar:
 *   node --experimental-strip-types --test lib/tayssa/numeros.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { formatarNumero, partesDoNumero } from "./numeros.ts";

test("lê o número do jeito brasileiro", () => {
  assert.deepEqual(partesDoNumero("2,16 mi"), { prefixo: "", alvo: 2.16, decimais: 2, sufixo: " mi" });
  assert.deepEqual(partesDoNumero("+5 mil"), { prefixo: "+", alvo: 5, decimais: 0, sufixo: " mil" });
  assert.deepEqual(partesDoNumero("1.240"), { prefixo: "", alvo: 1240, decimais: 0, sufixo: "" });
  assert.deepEqual(partesDoNumero("96,2%"), { prefixo: "", alvo: 96.2, decimais: 1, sufixo: "%" });
  assert.deepEqual(partesDoNumero("R$ 1.200,50"), { prefixo: "R$ ", alvo: 1200.5, decimais: 2, sufixo: "" });
  assert.equal(partesDoNumero("sem número"), null);
});

test("o caminho até o número guarda o formato", () => {
  const p = partesDoNumero("+3.704")!;
  assert.equal(formatarNumero(p, 0), "+0");
  assert.equal(formatarNumero(p, 1852.4), "+1.852");
  assert.equal(formatarNumero(p, 3704), "+3.704");
  const q = partesDoNumero("2,16 mi")!;
  assert.equal(formatarNumero(q, 0), "0,00 mi");
  assert.equal(formatarNumero(q, 2.16), "2,16 mi");
});
