/**
 * Testes das regras puras. Rodar:
 *   node --experimental-strip-types --test lib/tayssa/rules.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  activeBlackout,
  appointmentEnded,
  appointmentStarted,
  birthdayInfo,
  gradeDeHorarios,
  horariosDoDia,
  horariosParaMarcar,
  isInactive,
  loyaltyProgress,
  mesesSeguidos,
  progressoVip,
  referralProgress,
  trechosOcupados,
  validadeDoAniversario,
} from "./rules.ts";
import { normalizeBrPhone, formatBrPhone } from "./phone.ts";
import { renderTemplate, whatsappUrl } from "./whatsapp.ts";

const benefits = [
  { id: "a", key: "loyalty_100", name: "Primeiro marco", description: null, threshold: 100, threshold_unit: "points" as const, active: true, type: "loyalty" as const, config: {} },
  { id: "b", key: "loyalty_250", name: "Cliente de casa", description: null, threshold: 250, threshold_unit: "points" as const, active: true, type: "loyalty" as const, config: {} },
  { id: "c", key: "referral_reward", name: "Indicação", description: null, threshold: 3, threshold_unit: "referrals" as const, active: true, type: "referral" as const, config: {} },
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

// o programa da Tayssa (29/10/2026): mimo em 400 (só pontos), kit em 800 com 2 meses seguidos
const programa = [
  { id: "m", key: "loyalty_100", name: "Mimo surpresa", description: null, threshold: 400, threshold_unit: "points" as const, active: true, type: "loyalty" as const, config: {} },
  { id: "k", key: "loyalty_250", name: "Kit de higienização", description: null, threshold: 800, threshold_unit: "points" as const, active: true, type: "loyalty" as const, config: { meses_seguidos: 2 } },
  { id: "c", key: "card_complete", name: "Cartão completo", description: null, threshold: 8, threshold_unit: "services" as const, active: true, type: "loyalty" as const, config: { per_card: true } },
];
// pontos por atendimento: toda aplicação vale o mesmo, qualquer técnica
const APLICACAO = 150;
const MANUTENCAO = 95;

test("fidelidade: o kit pede pontos E meses seguidos", () => {
  // pontos de uma vez só: o mimo abre, o kit não
  const deUmaVez = loyaltyProgress(900, programa, 1);
  assert.equal(deUmaVez.milestones.length, 2); // o cartão tem ciclo próprio
  assert.equal(deUmaVez.current?.key, "loyalty_100");
  assert.equal(deUmaVez.next?.key, "loyalty_250");
  assert.equal(deUmaVez.pointsToNext, 0);
  assert.equal(deUmaVez.mesesToNext, 1);
  // os pontos já bastam, mas o anel só fecha com o mês que falta
  assert.equal(deUmaVez.progressToNext, 0.5);
  // com a constância, o kit abre
  const comConstancia = loyaltyProgress(900, programa, 2);
  assert.equal(comConstancia.current?.key, "loyalty_250");
  assert.equal(comConstancia.next, null);
  // meses sem os pontos também não
  const semPontos = loyaltyProgress(585, programa, 3);
  assert.equal(semPontos.next?.key, "loyalty_250");
  assert.equal(semPontos.pointsToNext, 215);
  assert.equal(semPontos.mesesToNext, 0);
});

test("a simulação da Tayssa: só cílios chega ao VIP", () => {
  // aplicação, manutenção, manutenção, três vezes
  const visitas = [APLICACAO, MANUTENCAO, MANUTENCAO, APLICACAO, MANUTENCAO, MANUTENCAO, APLICACAO, MANUTENCAO, MANUTENCAO];
  const total = (n: number) => visitas.slice(0, n).reduce((s, v) => s + v, 0);
  assert.equal(total(4), 490); // o mimo (400) chega na 4ª visita
  assert.equal(total(7), 830); // o kit (800) na 7ª, com a constância
  assert.equal(total(9), 1020); // e o VIP (1.000) na 9ª
  assert.equal(loyaltyProgress(total(3), programa, 2).current, null);
  assert.equal(loyaltyProgress(total(4), programa, 2).current?.key, "loyalty_100");
  assert.equal(loyaltyProgress(total(7), programa, 4).current?.key, "loyalty_250");
  const vip = { pontos: 1000, meses: 3 };
  assert.equal(progressoVip(total(8), 4, vip).cumpre, false);
  assert.equal(progressoVip(total(9), 5, vip).cumpre, true);
  // os mesmos 1.020 pontos em um mês só não fazem VIP
  assert.equal(progressoVip(total(9), 1, vip).cumpre, false);
});

test("constância: meses seguidos com atendimento", () => {
  const hoje = new Date(2026, 9, 29); // 29/10/2026
  // agosto, setembro e outubro
  assert.equal(mesesSeguidos(["2026-08-03", "2026-09-20", "2026-10-02", "2026-10-21"], hoje), 3);
  // outubro ainda está aberto: sem visita nele, conta até setembro (não zera)
  assert.equal(mesesSeguidos(["2026-08-03", "2026-09-20"], hoje), 2);
  // um mês inteiro sem visita (setembro) recomeça a contagem
  assert.equal(mesesSeguidos(["2026-07-10", "2026-08-03", "2026-10-02"], hoje), 1);
  assert.equal(mesesSeguidos(["2026-07-10", "2026-08-03"], hoje), 0);
  assert.equal(mesesSeguidos([], hoje), 0);
  // a virada do ano não quebra a sequência
  assert.equal(mesesSeguidos(["2026-11-30", "2026-12-15", "2027-01-08"], new Date(2027, 0, 20)), 3);
  // muitas visitas no mesmo mês contam um mês só
  assert.equal(mesesSeguidos(["2026-10-01", "2026-10-02", "2026-10-03", "2026-10-04"], hoje), 1);
});

test("VIP: meta de pontos e meses seguidos, os dois", () => {
  const c = { pontos: 1000, meses: 3 };
  const pronta = progressoVip(1020, 3, c);
  assert.equal(pronta.cumpre, true);
  assert.equal(pronta.fracao, 1);
  // muitos pontos de uma vez não fazem ninguém VIP
  const deUmaVez = progressoVip(1500, 1, c);
  assert.equal(deUmaVez.cumpre, false);
  assert.equal(deUmaVez.faltamMeses, 2);
  assert.equal(deUmaVez.faltamPontos, 0);
  assert.ok(Math.abs(deUmaVez.fracao - 1 / 3) < 1e-9);
  // constância sem a meta de pontos também não
  const semPontos = progressoVip(750, 4, c);
  assert.equal(semPontos.cumpre, false);
  assert.equal(semPontos.faltamPontos, 250);
  assert.equal(semPontos.fracao, 0.75);
});

test("indicação: cada indicação confirmada vale um benefício", () => {
  assert.deepEqual(referralProgress(0, 1), { approved: 0, threshold: 1, inCycle: 0, remaining: 1, cyclesEarned: 0 });
  assert.deepEqual(referralProgress(2, 1), { approved: 2, threshold: 1, inCycle: 0, remaining: 1, cyclesEarned: 2 });
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

test("aniversário: o mês inteiro (a regra da Tayssa)", () => {
  const today = new Date(2026, 8, 14); // 14/09/2026
  // fez aniversário dia 2: a janela é setembro inteiro, ainda aberta
  const a = birthdayInfo("1995-09-02", today, 3, 3, true);
  assert.equal(a.inWindow, true);
  assert.equal(a.mesInteiro, true);
  assert.equal(a.cycleYear, 2026);
  assert.equal(a.windowStart.getDate(), 1);
  assert.equal(a.windowEnd.getDate(), 30);
  // nos dias antes/depois ela estaria fora (janela de 31/08 a 05/09)
  assert.equal(birthdayInfo("1995-09-02", today, 3, 3).inWindow, false);
  // agosto passou: o próximo é o de 2027, fora da janela
  const b = birthdayInfo("1995-08-31", today, 3, 3, true);
  assert.equal(b.inWindow, false);
  assert.equal(b.cycleYear, 2027);
  // outubro: ainda não abriu
  assert.equal(birthdayInfo("1995-10-01", today, 3, 3, true).inWindow, false);
  // perto da virada: dezembro de 2026 é o ciclo de 2026, janeiro o de 2027
  assert.equal(birthdayInfo("1990-12-31", new Date(2026, 11, 1), 0, 0, true).cycleYear, 2026);
  assert.equal(birthdayInfo("1990-01-20", new Date(2026, 11, 20), 0, 0, true).cycleYear, 2027);
  // 29/02 em ano sem esse dia: fevereiro até o dia 28, aniversário no 28
  const f = birthdayInfo("1996-02-29", new Date(2027, 1, 10), 0, 0, true);
  assert.equal(f.inWindow, true);
  assert.equal(f.windowEnd.getDate(), 28);
  assert.equal(f.nextDate.getMonth(), 1);
  assert.equal(f.nextDate.getDate(), 28);
});

test("aniversário: validade do presente até o fim do mês dela", () => {
  const today = new Date(2026, 8, 14); // 14/09/2026
  // de 14 a 30/09: 17 dias contando hoje
  assert.equal(validadeDoAniversario(birthdayInfo("1995-09-02", today, 3, 3, true), today, 14), 17);
  // liberado antes do mês (outubro): até 31/10
  assert.equal(validadeDoAniversario(birthdayInfo("1995-10-20", today, 3, 3, true), today, 14), 48);
  // fora do modo mês inteiro, a validade padrão
  assert.equal(validadeDoAniversario(birthdayInfo("1995-09-16", today, 3, 3), today, 14), 14);
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

test("horário marcado: começou, terminou", () => {
  const a = { scheduled_date: "2026-10-21", scheduled_time: "10:30:00", duration_min: 90 };
  // 10h29: nem começou; 10h30: começou (não desmarca mais); 12h00: terminou
  assert.equal(appointmentStarted(a, new Date(2026, 9, 21, 10, 29)), false);
  assert.equal(appointmentStarted(a, new Date(2026, 9, 21, 10, 30)), true);
  assert.equal(appointmentEnded(a, new Date(2026, 9, 21, 11, 59)), false);
  assert.equal(appointmentEnded(a, new Date(2026, 9, 21, 12, 0)), true);
  // às 20h15 do mesmo dia o das 10h30 já não é "próximo"
  assert.equal(appointmentEnded(a, new Date(2026, 9, 21, 20, 15)), true);
  // amanhã ainda está por vir; sem duração conta 1h
  assert.equal(appointmentEnded({ ...a, scheduled_date: "2026-10-22" }, new Date(2026, 9, 21, 20, 15)), false);
  assert.equal(appointmentEnded({ ...a, duration_min: null }, new Date(2026, 9, 21, 11, 31)), true);
});

test("agenda: cada dia com a sua grade", () => {
  const b = { slots: ["09:00", "10:00"], slots_por_dia: { "1": ["10:00", "11:00"], "6": [] } };
  assert.deepEqual(horariosDoDia(b, 1), ["10:00", "11:00"]);
  // sem lista própria (ou lista vazia), vale a geral
  assert.deepEqual(horariosDoDia(b, 3), ["09:00", "10:00"]);
  assert.deepEqual(horariosDoDia(b, 6), ["09:00", "10:00"]);
  assert.deepEqual(horariosDoDia({ slots: ["09:00"] }, 2), ["09:00"]);
  // segunda das 10h às 16h, de hora em hora: o último é o último início
  assert.deepEqual(gradeDeHorarios("10:00", "16:00", 60), ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"]);
  assert.deepEqual(gradeDeHorarios("09:00", "10:30", 45), ["09:00", "09:45", "10:30"]);
  assert.deepEqual(gradeDeHorarios("16:00", "10:00", 60), []);
  assert.deepEqual(gradeDeHorarios("10:00", "16:00", 0), []);
});

test("agenda: serviço longo segura os horários seguintes", () => {
  const sabado = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00"];
  // volume de 3h às 9h; a Tayssa fechou as 14h; um pedido sem duração às 13h conta a padrão (60)
  const ocupado = trechosOcupados(
    sabado,
    [
      { scheduled_time: "09:00:00", duration_min: 180 },
      { scheduled_time: "13:00:00", duration_min: null },
    ],
    ["14:00"],
    60
  );
  const agora = new Date(2026, 9, 30, 8, 0); // sexta, 8h
  const h = horariosParaMarcar("2026-10-31", sabado, ocupado, agora, 4);
  const por = Object.fromEntries(h.map((s) => [s.time, s]));
  // 8h livre, mas só 60 minutos até o volume das 9h
  assert.deepEqual(por["08:00"], { time: "08:00", available: true, ate: 60 });
  // 9h, 10h e 11h presos pelo volume; 12h livre até o pedido das 13h
  assert.equal(por["09:00"].available, false);
  assert.equal(por["10:00"].available, false);
  assert.equal(por["11:00"].available, false);
  assert.deepEqual(por["12:00"], { time: "12:00", available: true, ate: 60 });
  // 13h ocupado; 14h fechado pela Tayssa até o horário seguinte; 15h livre até o fim do dia
  assert.equal(por["13:00"].available, false);
  assert.equal(por["14:00"].available, false);
  assert.deepEqual(por["15:00"], { time: "15:00", available: true, ate: null });
  // antecedência: no próprio dia às 10h, com 4h de antecedência, 13h ainda não dá e 15h dá
  const hoje = horariosParaMarcar("2026-10-31", sabado, [], new Date(2026, 9, 31, 10, 0), 4);
  assert.equal(hoje.find((s) => s.time === "13:00")?.available, false);
  assert.equal(hoje.find((s) => s.time === "14:00")?.available, true);
});
