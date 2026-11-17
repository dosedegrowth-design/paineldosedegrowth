import { test } from "node:test";
import assert from "node:assert/strict";
import { dataVizinha, diasDaSemana, estadoVisual, faixas, gradeDoMes, intervaloDaVista, ocupaAgenda, seCruzam } from "./agenda-visual.ts";

const agora = { iso: "2026-11-17", min: 10 * 60 + 30 };

test("estado visual: agendado, confirmado, em atendimento, concluído, cancelado e falta", () => {
  const base = { data: "2026-11-17", hora: "10:00", duracao: 90 };
  assert.equal(estadoVisual({ ...base, status: "requested" }, agora), "agendado");
  assert.equal(estadoVisual({ ...base, status: "confirmed" }, agora), "em_atendimento");
  assert.equal(estadoVisual({ ...base, status: "confirmed", hora: "12:00" }, agora), "confirmado");
  assert.equal(estadoVisual({ ...base, status: "confirmed", data: "2026-11-18" }, agora), "confirmado");
  assert.equal(estadoVisual({ ...base, status: "done" }, agora), "concluido");
  assert.equal(estadoVisual({ ...base, status: "cancelled" }, agora), "cancelado");
  assert.equal(estadoVisual({ ...base, status: "no_show" }, agora), "faltou");
  assert.equal(ocupaAgenda("cancelled"), false);
  assert.equal(ocupaAgenda("done"), true);
});

test("horários que se cruzam (o fim de um no começo do outro não cruza)", () => {
  assert.equal(seCruzam({ ini: 600, dur: 180 }, { ini: 720, dur: 60 }), true);
  assert.equal(seCruzam({ ini: 600, dur: 120 }, { ini: 720, dur: 60 }), false);
});

test("semana de domingo a sábado e o mês em semanas", () => {
  assert.deepEqual(diasDaSemana("2026-11-17"), ["2026-11-15", "2026-11-16", "2026-11-17", "2026-11-18", "2026-11-19", "2026-11-20", "2026-11-21"]);
  const nov = gradeDoMes("2026-11-17");
  assert.equal(nov[0][0], "2026-11-01"); // 1º de novembro de 2026 é domingo
  assert.equal(nov.length, 5);
  assert.equal(nov[nov.length - 1][6], "2026-12-05");
  assert.deepEqual(intervaloDaVista("mes", "2026-11-17"), { de: "2026-11-01", ate: "2026-12-05" });
  assert.equal(dataVizinha("mes", "2026-11-17", 1), "2026-12-01");
  assert.equal(dataVizinha("semana", "2026-11-17", -1), "2026-11-10");
});

test("faixas: quem se cruza fica lado a lado, quem não cruza ocupa a largura toda", () => {
  const r = faixas([
    { id: "a", ini: 600, dur: 180 },
    { id: "b", ini: 660, dur: 60 },
    { id: "c", ini: 900, dur: 60 },
  ]);
  const por = Object.fromEntries(r.map((x) => [x.id, x]));
  assert.deepEqual([por.a.faixa, por.a.faixas], [0, 2]);
  assert.deepEqual([por.b.faixa, por.b.faixas], [1, 2]);
  assert.deepEqual([por.c.faixa, por.c.faixas], [0, 1]);
});
