/**
 * Agendar pelo site. Rodar:
 *   node --experimental-strip-types --test lib/tayssa/agendar.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  cabeNoHorario,
  diaLegivel,
  diasAbertos,
  duracaoLegivel,
  ehManutencao,
  horaLegivel,
  horariosDaSemana,
  mensagemAgendamento,
  partesDoDia,
  reais,
  valorLegivel,
} from "./agendar.ts";

test("hora no jeito de falar", () => {
  assert.equal(horaLegivel("14:00"), "14h");
  assert.equal(horaLegivel("09:00:00"), "9h");
  assert.equal(horaLegivel("10:30"), "10h30");
});

test("dia civil, sem virar por fuso", () => {
  assert.equal(diaLegivel("2026-10-24"), "sábado, 24/10");
  assert.equal(diaLegivel("2026-01-02"), "sexta, 02/01");
  assert.deepEqual(partesDoDia("2026-10-23"), { semana: "sex", numero: "23", mes: "out" });
});

test("valor do sinal", () => {
  assert.equal(reais(50), "R$ 50");
  assert.equal(reais(37.5), "R$ 37,50");
  assert.equal(reais(1200), "R$ 1.200");
});

test("só dias com horário livre", () => {
  const dias = [
    { iso: "2026-10-23", slots: [{ time: "09:00", available: false }] },
    { iso: "2026-10-24", slots: [{ time: "09:00", available: false }, { time: "10:30", available: true }] },
  ];
  assert.deepEqual(diasAbertos(dias).map((d) => d.iso), ["2026-10-24"]);
});

test("mensagem completa, pedindo o Pix do sinal", () => {
  const m = mensagemAgendamento({
    servico: "Manutenção de cílios",
    tecnica: "Volume brasileiro",
    dia: "2026-10-23",
    hora: "14:00",
    nome: "  Ana ",
    sinal: 50,
  });
  assert.equal(
    m,
    [
      "Oi, Tayssa! Quero agendar pelo site.",
      "",
      "Serviço: Manutenção de cílios (Volume brasileiro)",
      "Dia: sexta, 23/10",
      "Horário: 14h",
      "Nome: Ana",
      "",
      "Pode me mandar a chave Pix do sinal de R$ 50 para eu garantir o horário?",
    ].join("\n"),
  );
});

test("manutenção sem técnica e sem nome ainda", () => {
  const m = mensagemAgendamento({ servico: "Manutenção de cílios", dia: "2026-10-24", hora: "10:30", nome: "", sinal: 50 });
  assert.match(m, /Serviço: Manutenção de cílios\n/);
  assert.doesNotMatch(m, /Nome:/);
  assert.match(m, /Horário: 10h30/);
});

test("com valor cadastrado, a mensagem leva o valor", () => {
  const m = mensagemAgendamento({ servico: "Volume inglês", dia: "2026-10-23", hora: "14:00", nome: "Ana", valor: 220, sinal: 50 });
  assert.match(m, /Horário: 14h\nValor: R\$ 220\nNome: Ana/);
});

test("serviço longo só cabe onde o tempo dele alcança", () => {
  // livre às 10h, mas às 11h já tem alguém: cabem 60 minutos
  const slot = { time: "10:00", available: true, ate: 60 };
  assert.equal(cabeNoHorario(slot, 60), true);
  assert.equal(cabeNoHorario(slot, 180), false);
  // sem ninguém depois: cabe qualquer serviço; sem duração conhecida, vale o início livre
  assert.equal(cabeNoHorario({ available: true, ate: null }, 180), true);
  assert.equal(cabeNoHorario({ available: true, ate: 30 }, null), true);
  assert.equal(cabeNoHorario({ available: false, ate: null }, 30), false);
  const dias = [
    { iso: "2026-11-02", slots: [{ time: "10:00", available: true, ate: 60 }] },
    { iso: "2026-11-03", slots: [{ time: "09:00", available: true, ate: null }] },
  ];
  assert.deepEqual(diasAbertos(dias, 180).map((d) => d.iso), ["2026-11-03"]);
  assert.deepEqual(diasAbertos(dias, 60).map((d) => d.iso), ["2026-11-02", "2026-11-03"]);
});

test("tempo e valor do jeito de falar", () => {
  assert.equal(duracaoLegivel(180), "3h");
  assert.equal(duracaoLegivel(90), "1h30");
  assert.equal(duracaoLegivel(40), "40 min");
  assert.equal(duracaoLegivel(null), null);
  assert.equal(valorLegivel(120), "R$ 120");
  // a manutenção do Fox eyes custa mais: a manutenção começa "a partir de"
  assert.equal(valorLegivel(120, [120, 130, null]), "a partir de R$ 120");
  assert.equal(valorLegivel(120, [120, null]), "R$ 120");
  assert.equal(valorLegivel(null, [130]), null);
  assert.equal(ehManutencao("manutencao-cilios"), true);
  assert.equal(ehManutencao("volume-brasileiro", "Volume brasileiro"), false);
});

test("horários da semana agrupados como a Tayssa fala", () => {
  const terSex = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];
  const booking = {
    weekdays: [1, 2, 3, 4, 5, 6],
    slots: terSex,
    slots_por_dia: {
      "1": ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"],
      "6": ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00"],
    },
  };
  assert.deepEqual(horariosDaSemana(booking), [
    { dias: "Segunda", horas: "10h às 16h" },
    { dias: "Terça a sexta", horas: "9h às 19h" },
    { dias: "Sábado", horas: "8h às 15h" },
  ]);
  // dia de folga no meio quebra o grupo; dois dias seguidos viram "e"
  assert.deepEqual(horariosDaSemana({ weekdays: [2, 3, 5], slots: ["09:00", "18:00"] }), [
    { dias: "Terça e quarta", horas: "9h às 18h" },
    { dias: "Sexta", horas: "9h às 18h" },
  ]);
});
