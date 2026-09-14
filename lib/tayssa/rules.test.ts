/**
 * Testes das regras puras. Rodar:
 *   node --experimental-strip-types --test lib/tayssa/rules.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  activeBlackout,
  birthdayInfo,
  isInactive,
  loyaltyProgress,
  referralProgress,
} from "./rules.ts";
import { normalizeBrPhone, formatBrPhone } from "./phone.ts";
import { renderTemplate, whatsappUrl } from "./whatsapp.ts";

const benefits = [
  { id: "a", key: "loyalty_100", name: "Primeiro marco", description: null, threshold: 100, active: true, type: "loyalty" as const },
  { id: "b", key: "loyalty_250", name: "Cliente de casa", description: null, threshold: 250, active: true, type: "loyalty" as const },
  { id: "c", key: "referral_reward", name: "Indicação", description: null, threshold: 3, active: true, type: "referral" as const },
];

test("fidelidade: progresso entre marcos", () => {
  const p = loyaltyProgress(140, benefits);
  assert.equal(p.milestones.length, 2);
  assert.equal(p.current?.key, "loyalty_100");
  assert.equal(p.next?.key, "loyalty_250");
  assert.equal(p.pointsToNext, 110);
  assert.ok(Math.abs(p.progressToNext - 40 / 150) < 1e-9);
});

test("fidelidade: zero pontos e todos os marcos", () => {
  assert.equal(loyaltyProgress(0, benefits).current, null);
  const done = loyaltyProgress(300, benefits);
  assert.equal(done.next, null);
  assert.equal(done.progressToNext, 1);
  assert.equal(done.overall, 1);
});

test("indicação: ciclos de 3", () => {
  assert.deepEqual(referralProgress(0, 3), { approved: 0, threshold: 3, inCycle: 0, remaining: 3, cyclesEarned: 0 });
  assert.deepEqual(referralProgress(2, 3), { approved: 2, threshold: 3, inCycle: 2, remaining: 1, cyclesEarned: 0 });
  assert.deepEqual(referralProgress(3, 3), { approved: 3, threshold: 3, inCycle: 0, remaining: 3, cyclesEarned: 1 });
  assert.deepEqual(referralProgress(7, 3), { approved: 7, threshold: 3, inCycle: 1, remaining: 2, cyclesEarned: 2 });
  assert.equal(referralProgress(5, 0).threshold, 1);
});

test("aniversário: janela e próxima data", () => {
  const today = new Date(2026, 8, 14); // 14/09/2026
  const a = birthdayInfo("1995-09-16", today, 3, 3);
  assert.equal(a.inWindow, true);
  assert.equal(a.daysUntil, 2);
  assert.equal(a.cycleYear, 2026);
  const b = birthdayInfo("1995-01-10", today, 3, 3);
  assert.equal(b.inWindow, false);
  assert.equal(b.nextDate.getFullYear(), 2027);
  const c = birthdayInfo("1995-09-10", today, 3, 3); // janela até 13/09 já passou
  assert.equal(c.inWindow, false);
  assert.equal(c.nextDate.getFullYear(), 2027);
  const d = birthdayInfo("2000-09-14", today, 0, 0);
  assert.equal(d.isToday, true);
});

test("blackout e inatividade", () => {
  const periods = [{ name: "Dezembro", starts_on: "2026-12-01", ends_on: "2026-12-31", benefit_types: ["birthday"], active: true }];
  assert.equal(activeBlackout(new Date(2026, 11, 15), periods, "birthday")?.name, "Dezembro");
  assert.equal(activeBlackout(new Date(2026, 11, 15), periods, "loyalty"), null);
  assert.equal(activeBlackout(new Date(2026, 10, 30), periods, "birthday"), null);
  assert.equal(isInactive("2026-08-01", 30, new Date(2026, 8, 14)), true);
  assert.equal(isInactive("2026-09-01", 30, new Date(2026, 8, 14)), false);
  assert.equal(isInactive(null, 30, new Date()), true);
});

test("telefone BR", () => {
  assert.equal(normalizeBrPhone("(11) 99982-7606"), "5511999827606");
  assert.equal(normalizeBrPhone("+55 11 99982-7606"), "5511999827606");
  assert.equal(normalizeBrPhone("011 99982 7606"), "5511999827606");
  assert.equal(normalizeBrPhone("1234"), null);
  assert.equal(formatBrPhone("5511999827606"), "(11) 99982-7606");
});

test("whatsapp: template e url", () => {
  assert.equal(renderTemplate("Oi, {name}! {benefit}", { name: "Mariana", benefit: "Lip spa" }), "Oi, Mariana! Lip spa");
  assert.equal(renderTemplate("{x}", {}), "");
  assert.equal(whatsappUrl("5511999827606", "Oi, Tayssa!"), "https://wa.me/5511999827606?text=Oi%2C%20Tayssa!");
});
