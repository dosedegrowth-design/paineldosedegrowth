/**
 * Datas. Rodar (o servidor roda em UTC):
 *   TZ=UTC node --experimental-strip-types --test lib/tayssa/format.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { dateLong, dateShort, dateTime } from "./format.ts";

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
