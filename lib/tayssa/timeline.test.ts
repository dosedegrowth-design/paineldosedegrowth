/**
 * Linha do tempo. Rodar:
 *   node --experimental-strip-types --test lib/tayssa/timeline.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildTimeline } from "./timeline.ts";
import { birthdayInfo, loyaltyProgress } from "./rules.ts";
import type { AppointmentRow, AppointmentStatus, ClientBenefitRow, ClientBenefitStatus } from "./types.ts";

const today = new Date(2026, 8, 16); // 16/set/2026
const benefitsCatalog = [
  { id: "a", key: "loyalty_100", name: "Primeiro marco", description: null, threshold: 100, threshold_unit: "points" as const, active: true, type: "loyalty" as const },
  { id: "b", key: "loyalty_250", name: "Cliente de casa", description: null, threshold: 250, threshold_unit: "points" as const, active: true, type: "loyalty" as const },
];
const svc = (id: string, date: string, status: "approved" | "pending" | "rejected", points = 25) =>
  ({ id, client_id: "me", service_id: null, service_name: "Manutenção", service_date: date, amount: null, points, status, notes: null, submitted_by: "admin" as const, submitted_at: date, reviewed_by: null, reviewed_at: null, review_note: null });
const ben = (id: string, status: ClientBenefitStatus, dates: Partial<Pick<ClientBenefitRow, "available_at" | "eligible_at" | "created_at" | "redeemed_at" | "requested_at" | "approved_at" | "updated_at">>): ClientBenefitRow =>
  ({ id, client_id: "me", benefit_id: "x", cycle_key: "k", status, title: `Benefício ${id}`, description: null, eligible_at: "2026-01-01T00:00:00Z", available_at: null, requested_at: null, approved_at: null, redeemed_at: null, rejected_at: null, expires_at: null, client_note: null, admin_note: null, created_by: null, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z", ...dates });
const apt = (id: string, date: string, status: AppointmentStatus): AppointmentRow =>
  ({ id, client_id: "me", service_id: null, service_name: "Aplicação", scheduled_date: date, scheduled_time: "14:00:00", duration_min: 90, status, client_note: null, admin_note: null, client_service_id: null, created_at: "", updated_at: "" });

test("jornada: o que vem sai em ordem de data, marco sem data por último", () => {
  const t = buildTimeline({
    services: [],
    benefits: [],
    appointments: [apt("a2", "2026-09-30", "confirmed"), apt("a1", "2026-09-18", "requested"), apt("old", "2026-09-01", "confirmed"), apt("c", "2026-09-20", "cancelled")],
    birthday: birthdayInfo("1995-09-22", today, 3, 3),
    loyalty: loyaltyProgress(140, benefitsCatalog),
    today,
    limits: { upcoming: 10 },
  });
  assert.deepEqual(t.upcoming.map((i) => i.kind), ["appointment", "birthday", "appointment", "milestone"]);
  assert.equal(t.upcoming[0].id, "apt:a1");
  assert.match(t.upcoming[1].detail, /em 6 dias/);
  assert.equal(t.upcoming[3].detail, "faltam 110 pontos");
  assert.equal(t.upcoming[3].value, "250");
});

test("jornada: passado do mais recente ao mais antigo, só o que conta", () => {
  const t = buildTimeline({
    services: [svc("s1", "2026-08-01", "approved", 30), svc("s2", "2026-09-10", "pending"), svc("s3", "2026-09-12", "rejected")],
    benefits: [ben("b1", "available", { available_at: "2026-09-05T12:00:00Z" }), ben("b2", "pending_validation", { eligible_at: "2026-09-14T12:00:00Z" }), ben("b3", "expired", {}), ben("b4", "redeemed", { redeemed_at: "2026-07-01T12:00:00Z" })],
    appointments: [],
    birthday: null,
    loyalty: loyaltyProgress(300, benefitsCatalog),
    today,
  });
  assert.deepEqual(t.recent.map((i) => i.id), ["ben:b2", "svc:s2", "ben:b1", "svc:s1", "ben:b4"]);
  assert.equal(t.recent[3].value, "+30");
  assert.equal(t.recent[0].kind, "validating");
  // todos os marcos alcançados: nada "a vir" além de horário/aniversário
  assert.equal(t.upcoming.length, 0);
});

test("jornada: limites e aniversário na janela", () => {
  const t = buildTimeline({
    services: Array.from({ length: 10 }, (_, i) => svc(`s${i}`, `2026-0${1 + (i % 8)}-1${i % 9}`, "approved")),
    benefits: [],
    appointments: [],
    birthday: birthdayInfo("1995-09-16", today, 7, 7),
    loyalty: loyaltyProgress(0, benefitsCatalog),
    today,
    limits: { recent: 4 },
  });
  assert.equal(t.recent.length, 4);
  assert.equal(t.upcoming[0].kind, "birthday");
  assert.equal(t.upcoming[0].detail, "é hoje — parabéns");
  assert.equal(t.upcoming[0].date, "2026-09-16");
});
