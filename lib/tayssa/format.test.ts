/**
 * Datas. Rodar (o servidor roda em UTC):
 *   TZ=UTC node --experimental-strip-types --test lib/tayssa/format.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { criterioLegivel, dateLong, dateShort, dateTime, faltaLegivel, numero } from "./format.ts";

test("instante das 22h em São Paulo continua no mesmo dia", () => {
  // 01:30 UTC do dia 22 = 22:30 do dia 21 em São Paulo
  assert.equal(dateLong("2026-10-22T01:30:00Z"), "21 de outubro");
  assert.equal(dateShort("2026-10-22T01:30:00Z"), "21/10/2026");
  assert.equal(dateTime("2026-10-22T01:30:00Z"), "21/10/2026 22:30");
});

test("data civil (sem hora) não muda de dia", () => {
  assert.equal(dateLong("2026-10-22"), "22 de outubro");
  assert.equal(dateShort("2026-01-01"), "01/01/2026");
});

test("o que falta, com o verbo concordando", () => {
  assert.equal(faltaLegivel(20, 1), "faltam 20 pontos e 1 mês seguido");
  assert.equal(faltaLegivel(0, 1), "falta 1 mês seguido");
  assert.equal(faltaLegivel(1, 0), "falta 1 ponto");
  assert.equal(faltaLegivel(0, 2), "faltam 2 meses seguidos");
  assert.equal(faltaLegivel(0, 0), "");
});

test("pontos escritos como no Brasil", () => {
  assert.equal(numero(1020), "1.020");
  assert.equal(faltaLegivel(215, 0), "faltam 215 pontos");
  assert.equal(faltaLegivel(1000, 3), "faltam 1.000 pontos e 3 meses seguidos");
  assert.equal(criterioLegivel(1000, 3), "1.000 pontos e 3 meses seguidos");
  assert.equal(criterioLegivel(400, 0), "400 pontos");
});
