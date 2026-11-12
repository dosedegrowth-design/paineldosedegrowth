/**
 * Testes das regras puras. Rodar:
 *   node --experimental-strip-types --test lib/tayssa/rules.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  activeBlackout,
  ajusteDePontos,
  appointmentEnded,
  appointmentStarted,
  birthdayInfo,
  gradeDeHorarios,
  horariosDoDia,
  horariosParaMarcar,
  isInactive,
  loyaltyProgress,
  marcosPerdidos,
  mesesSeguidos,
  pedidoDeVip,
  progressoVip,
  referralProgress,
  somaDePontos,
  trechosOcupados,
  validadeDoAniversario,
  vipPrimeiro,
  bookableDays,
  diaAberto,
  horariosDaData,
  lerPeriodoEspecial,
  taxaDoHorario,
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

test("VIP: 4 atendimentos em até 70 dias, de 15 a 20 dias entre um e outro", () => {
  const c = { visitas: 4, janelaDias: 70, intervaloMin: 15, intervaloMax: 20 };
  const hoje = new Date(2026, 10, 9); // 09/11/2026
  // nenhum atendimento: a contagem começa no próximo
  const zero = progressoVip([], hoje, c);
  assert.equal(zero.contam, 0);
  assert.equal(zero.cumpre, false);
  assert.equal(zero.proximaDe, null);
  // dois na sequência: o próximo vai de 15 a 20 dias depois do último
  const dois = progressoVip(["2026-10-12", "2026-10-30"], hoje, c);
  assert.equal(dois.contam, 2);
  assert.equal(dois.faltam, 2);
  assert.equal(dois.proximaDe, "2026-11-14");
  assert.equal(dois.proximaAte, "2026-11-19");
  assert.equal(dois.fracao, 0.5);
  // os quatro, cada um de 15 a 20 dias do anterior: cumpre
  const pronta = progressoVip(["2026-08-01", "2026-08-18", "2026-09-05", "2026-09-22"], hoje, c);
  assert.equal(pronta.cumpre, true);
  assert.equal(pronta.contam, 4);
  // e continua cumprindo mesmo meses depois (a Tayssa ainda vai confirmar)
  assert.equal(progressoVip(["2026-08-01", "2026-08-18", "2026-09-05", "2026-09-22"], new Date(2027, 0, 10), c).cumpre, true);
  // um antes de 15 dias não conta e não zera
  const cedo = progressoVip(["2026-10-20", "2026-10-27", "2026-11-05"], hoje, c);
  assert.equal(cedo.contam, 2);
  assert.equal(cedo.ultima, "2026-11-05");
  // mais de 20 dias entre dois: recomeça no atendimento novo
  const recomeca = progressoVip(["2026-09-01", "2026-09-18", "2026-10-25"], hoje, c);
  assert.equal(recomeca.contam, 1);
  assert.equal(recomeca.ultima, "2026-10-25");
  // passaram mais de 20 dias sem atendimento: venceu, volta a zero
  const venceu = progressoVip(["2026-10-01", "2026-10-17"], hoje, c);
  assert.equal(venceu.venceu, true);
  assert.equal(venceu.contam, 0);
  assert.equal(venceu.proximaDe, null);
  // o mesmo dia duas vezes conta uma
  assert.equal(progressoVip(["2026-10-30", "2026-10-30"], hoje, c).contam, 1);
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

test("prioridade VIP: os pedidos de quem é VIP vêm primeiro, cada grupo do mais próximo ao mais distante", () => {
  const p = (id: string, vip: boolean, data: string, hora: string) => ({ id, vip, scheduled_date: data, scheduled_time: hora });
  const ordem = vipPrimeiro([
    p("a", false, "2026-12-02", "09:00"),
    p("b", true, "2026-12-10", "14:00"),
    p("c", false, "2026-12-01", "10:00"),
    p("d", true, "2026-12-03", "09:00"),
  ]).map((x) => x.id);
  assert.deepEqual(ordem, ["d", "b", "c", "a"]);
});

// ------------------------------------------------------------
// Dezembro de 2026 (carrossel "Agenda de Dezembro" da Tayssa)
// ------------------------------------------------------------

const horas = (de: number, ate: number) =>
  Array.from({ length: ate - de + 1 }, (_, i) => `${String(de + i).padStart(2, "0")}:00`);

const DEZEMBRO = lerPeriodoEspecial({
  desde: "2026-12-01",
  ate: "2026-12-31",
  slots_por_dia: {
    "0": horas(7, 17),
    "1": horas(7, 21),
    "2": horas(7, 21),
    "3": horas(7, 21),
    "4": horas(7, 21),
    "5": horas(7, 21),
    "6": horas(7, 21),
  },
  taxa: 30,
  dias: { "2026-12-24": { slots: horas(6, 15), taxa_em_todos: true } },
  folgas: ["2026-12-25", "2026-12-30", "2026-12-31"],
});

const CASA = {
  weekdays: [1, 2, 3, 4, 5, 6],
  slots: horas(9, 19),
  slots_por_dia: { "1": horas(10, 16), "2": horas(9, 19), "6": horas(8, 15) },
  horizon_days: 60,
  especial: DEZEMBRO,
};

test("dezembro: horários próprios, domingo aberto, 24/12 das 6h às 15h e folgas", () => {
  assert.ok(DEZEMBRO);
  // terça, 01/12: das 7h às 21h
  assert.deepEqual(horariosDaData(CASA, "2026-12-01"), horas(7, 21));
  // domingo, 06/12: das 7h às 17h (fora de dezembro, domingo não abre)
  assert.deepEqual(horariosDaData(CASA, "2026-12-06"), horas(7, 17));
  assert.equal(diaAberto(CASA, "2026-12-06"), true);
  assert.equal(diaAberto(CASA, "2026-11-15"), false);
  // véspera de Natal: das 6h às 15h
  assert.deepEqual(horariosDaData(CASA, "2026-12-24"), horas(6, 15));
  // folgas: sem horário e fechadas
  for (const folga of ["2026-12-25", "2026-12-30", "2026-12-31"]) {
    assert.deepEqual(horariosDaData(CASA, folga), []);
    assert.equal(diaAberto(CASA, folga), false);
  }
  // fora de dezembro, os horários de sempre (terça de novembro)
  assert.deepEqual(horariosDaData(CASA, "2026-11-17"), horas(9, 19));
  assert.deepEqual(horariosDaData({ ...CASA, especial: null }, "2026-12-01"), horas(9, 19));
});

test("dezembro: taxa de R$ 30 no primeiro e no último horário; no dia 24, em todos", () => {
  // dia comum de dezembro: só as pontas
  assert.equal(taxaDoHorario(CASA, "2026-12-01", "07:00"), 30);
  assert.equal(taxaDoHorario(CASA, "2026-12-01", "21:00"), 30);
  assert.equal(taxaDoHorario(CASA, "2026-12-01", "12:00"), 0);
  // domingo: o último é às 17h
  assert.equal(taxaDoHorario(CASA, "2026-12-06", "17:00"), 30);
  assert.equal(taxaDoHorario(CASA, "2026-12-06", "16:00"), 0);
  // 24/12: qualquer horário do dia, e só os do dia
  for (const h of horas(6, 15)) assert.equal(taxaDoHorario(CASA, "2026-12-24", h), 30, h);
  assert.equal(taxaDoHorario(CASA, "2026-12-24", "16:00"), 0);
  // folga, fora de dezembro e sem período: nada
  assert.equal(taxaDoHorario(CASA, "2026-12-25", "09:00"), 0);
  assert.equal(taxaDoHorario(CASA, "2026-11-17", "09:00"), 0);
  assert.equal(taxaDoHorario({ ...CASA, especial: null }, "2026-12-01", "09:00"), 0);
  // a hora pode vir com segundos (como vem do banco)
  assert.equal(taxaDoHorario(CASA, "2026-12-01", "07:00:00"), 30);
});

test("dezembro: os dias que abrem para marcar conhecem o domingo e as folgas", () => {
  const dias = bookableDays(new Date(2026, 10, 12), CASA).map((d) => d.iso);
  assert.ok(dias.includes("2026-12-06"), "domingo de dezembro abre");
  assert.ok(dias.includes("2026-12-24"), "véspera abre");
  assert.ok(!dias.includes("2026-11-15"), "domingo de novembro não abre");
  for (const folga of ["2026-12-25", "2026-12-30", "2026-12-31"]) assert.ok(!dias.includes(folga), folga);
  assert.ok(dias.includes("2026-11-17"), "terça de novembro segue aberta");
});

test("período especial do banco: só o que está no formato entra", () => {
  assert.equal(lerPeriodoEspecial(null), null);
  assert.equal(lerPeriodoEspecial("dezembro"), null);
  assert.equal(lerPeriodoEspecial({ desde: "2026-12-31", ate: "2026-12-01" }), null);
  const p = lerPeriodoEspecial({
    desde: "2026-12-01",
    ate: "2026-12-31",
    slots_por_dia: { "1": ["07:00", "7h", "25:00", "08:00", "07:00"], "9": ["10:00"] },
    taxa: "30",
    dias: { "24/12": { slots: ["06:00"] }, "2026-12-24": { slots: ["06:00"], taxa_em_todos: true } },
    folgas: ["2026-12-25", "25/12"],
  });
  assert.deepEqual(p?.slots_por_dia, { "1": ["07:00", "08:00"] });
  assert.equal(p?.taxa, 30);
  assert.deepEqual(Object.keys(p?.dias ?? {}), ["2026-12-24"]);
  assert.deepEqual(p?.folgas, ["2026-12-25"]);
  assert.equal(lerPeriodoEspecial({ desde: "2026-12-01", ate: "2026-12-31", taxa: -5 })?.taxa, 0);
});

// ------------------------------------------------------------
// Correção de pontos na ficha (Lucas, 12/11/2026)
// ------------------------------------------------------------

test("correção de pontos: marcou manutenção, fez aplicação (tira 95, adiciona 150)", () => {
  const tira = ajusteDePontos(95, 95, "tirar");
  assert.deepEqual(tira, { ok: true, pontos: -95, total: 0 });
  const poe = ajusteDePontos(0, 150, "adicionar");
  assert.deepEqual(poe, { ok: true, pontos: 150, total: 150 });
  // na ordem contrária dá no mesmo
  assert.deepEqual(ajusteDePontos(95, 150, "adicionar"), { ok: true, pontos: 150, total: 245 });
  assert.deepEqual(ajusteDePontos(245, 95, "tirar"), { ok: true, pontos: -95, total: 150 });
});

test("correção de pontos: nunca deixa o saldo negativo nem usa serviço sem pontos", () => {
  const r = ajusteDePontos(95, 150, "tirar");
  assert.equal(r.ok, false);
  assert.equal(!r.ok && r.motivo, "Ela tem 95 pontos: não dá para tirar 150.");
  const um = ajusteDePontos(1, 1020, "tirar");
  assert.equal(!um.ok && um.motivo, "Ela tem 1 ponto: não dá para tirar 1.020.");
  assert.equal(ajusteDePontos(500, 0, "adicionar").ok, false);
  assert.equal(ajusteDePontos(500, 0, "tirar").ok, false);
});

test("correção de pontos: soma e marcos perdidos quando o total cai", () => {
  assert.equal(somaDePontos([{ points: 95 }, { points: -95 }, { points: 150 }]), 150);
  assert.equal(somaDePontos([]), 0);
  const marcos = [
    { id: "m400", type: "loyalty" as const, threshold: 400, threshold_unit: "points" as const },
    { id: "m800", type: "loyalty" as const, threshold: 800, threshold_unit: "points" as const },
    { id: "cartao", type: "loyalty" as const, threshold: 8, threshold_unit: "services" as const },
    { id: "ind", type: "referral" as const, threshold: 1, threshold_unit: "referrals" as const },
  ];
  // 450 → 300: perdeu o de 400 (o cartão e a indicação não são de pontos)
  assert.deepEqual(marcosPerdidos(450, 300, marcos).map((m) => m.id), ["m400"]);
  // 900 → 350: perdeu os dois
  assert.deepEqual(marcosPerdidos(900, 350, marcos).map((m) => m.id), ["m400", "m800"]);
  // subiu ou não cruzou nada: nenhum
  assert.deepEqual(marcosPerdidos(300, 450, marcos), []);
  assert.deepEqual(marcosPerdidos(450, 400, marcos), []);
});

test("pedido de VIP: cadastro do site sem resposta da Tayssa (a conta já marca horário)", () => {
  const cadastro = { signup_source: "self", reviewed_at: null, status: "active" };
  assert.equal(pedidoDeVip(cadastro, "none"), true);
  // conta antiga, de antes da mudança, ainda em "pending"
  assert.equal(pedidoDeVip({ ...cadastro, status: "pending" }, "none"), true);
  // respondido (aprovou ou "agora não"), já VIP, veio da agenda ou conta desativada: não é pedido
  assert.equal(pedidoDeVip({ ...cadastro, reviewed_at: "2026-11-12T21:00:00Z" }, "none"), false);
  assert.equal(pedidoDeVip(cadastro, "active"), false);
  assert.equal(pedidoDeVip({ ...cadastro, signup_source: "agenda" }, "none"), false);
  assert.equal(pedidoDeVip({ ...cadastro, status: "inactive" }, "none"), false);
  assert.equal(pedidoDeVip(cadastro, undefined), true);
});
