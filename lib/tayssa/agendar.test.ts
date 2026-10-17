/**
 * Agendar pelo site. Rodar:
 *   node --experimental-strip-types --test lib/tayssa/agendar.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { diaLegivel, diasAbertos, horaLegivel, mensagemAgendamento, partesDoDia, reais } from "./agendar.ts";

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
    servico: "Aplicação de cílios",
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
      "Serviço: Aplicação de cílios — Volume brasileiro",
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
  const m = mensagemAgendamento({ servico: "Aplicação de cílios", tecnica: "Volume inglês", dia: "2026-10-23", hora: "14:00", nome: "Ana", valor: 220, sinal: 50 });
  assert.match(m, /Horário: 14h\nValor: R\$ 220\nNome: Ana/);
});
