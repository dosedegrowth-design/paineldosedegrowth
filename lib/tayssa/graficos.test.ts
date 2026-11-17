import { test } from "node:test";
import assert from "node:assert/strict";
import {
  arcos,
  escala,
  fatiasDoPeriodo,
  grupoDoPeriodo,
  passoDosRotulos,
  percentuaisInteiros,
  reaisCurto,
  rotuloDaColuna,
  serieDoPeriodo,
  servicosMaisFeitos,
} from "./graficos.ts";

test("o período decide o grupo das colunas: dia até 31, semana até 120, mês depois", () => {
  assert.equal(grupoDoPeriodo("2026-11-01", "2026-11-30"), "dia");
  assert.equal(grupoDoPeriodo("2026-11-01", "2026-12-01"), "dia"); // 31 dias
  assert.equal(grupoDoPeriodo("2026-11-01", "2026-12-02"), "semana");
  assert.equal(grupoDoPeriodo("2026-01-01", "2026-12-31"), "mes");
});

test("por dia: todo dia do período tem coluna, com a soma do dia e hoje marcado", () => {
  const s = serieDoPeriodo(
    [
      { data: "2026-11-17", valor: 170 },
      { data: "2026-11-17", valor: 120.5 },
      { data: "2026-11-15", valor: null }, // sem valor: conta o atendimento, não soma
      { data: "2026-11-10", valor: 999 }, // fora do período
    ],
    "2026-11-15",
    "2026-11-21",
    "2026-11-17",
  );
  assert.equal(s.grupo, "dia");
  assert.equal(s.pontos.length, 7);
  assert.deepEqual(
    s.pontos.map((p) => p.valor),
    [0, 0, 290.5, 0, 0, 0, 0],
  );
  assert.equal(s.pontos[0].atendimentos, 1);
  assert.equal(s.maior, 290.5);
  assert.equal(s.pontos[2].atual, true);
  assert.equal(s.pontos[2].rotuloLongo, "ter, 17/11");
  assert.deepEqual(rotuloDaColuna(s.pontos[0], s.grupo, 7), { cima: "dom", baixo: "15" });
});

test("por semana começa no domingo e por mês junta o mês inteiro", () => {
  const sem = serieDoPeriodo([{ data: "2026-11-18", valor: 100 }, { data: "2026-11-21", valor: 50 }], "2026-10-01", "2026-12-15", "2026-11-17");
  assert.equal(sem.grupo, "semana");
  const daSemana = sem.pontos.find((p) => p.inicio === "2026-11-15");
  assert.ok(daSemana);
  assert.equal(daSemana.fim, "2026-11-21");
  assert.equal(daSemana.valor, 150);
  assert.equal(daSemana.rotuloLongo, "semana de 15/11");
  assert.equal(sem.pontos[0].inicio, "2026-10-01"); // a primeira semana começa no começo do período

  const mes = serieDoPeriodo([{ data: "2026-11-02", valor: 80 }], "2026-01-01", "2026-12-31", "2026-11-17");
  assert.equal(mes.pontos.length, 12);
  assert.equal(mes.pontos[10].rotulo, "nov");
  assert.equal(mes.pontos[10].rotuloLongo, "novembro de 2026");
  assert.equal(mes.pontos[10].valor, 80);
  assert.equal(mes.pontos[10].atual, true);
});

test("rótulos embaixo das colunas nunca passam de sete", () => {
  assert.equal(passoDosRotulos(7), 1);
  assert.equal(passoDosRotulos(30), 5);
  assert.equal(passoDosRotulos(31), 5);
});

test("o eixo termina num número redondo", () => {
  assert.deepEqual(escala(290.5), { topo: 400, marcas: [0, 200, 400] });
  assert.deepEqual(escala(480), { topo: 500, marcas: [0, 250, 500] });
  assert.deepEqual(escala(1700), { topo: 2000, marcas: [0, 1000, 2000] });
  assert.deepEqual(escala(0), { topo: 100, marcas: [0, 50, 100] });
});

test("dinheiro curto para o eixo", () => {
  assert.equal(reaisCurto(480), "R$ 480");
  assert.equal(reaisCurto(1200), "R$ 1.200");
  assert.equal(reaisCurto(12500), "R$ 12,5 mil");
  assert.equal(reaisCurto(1_250_000), "R$ 1,3 mi");
});

test("percentuais inteiros somam 100", () => {
  assert.deepEqual(percentuaisInteiros([1, 1, 1]), [34, 33, 33]);
  assert.deepEqual(percentuaisInteiros([50, 0, 50]), [50, 0, 50]);
  assert.deepEqual(percentuaisInteiros([0, 0]), [0, 0]);
  const p = percentuaisInteiros([170, 50, 35.5, 12]);
  assert.equal(p.reduce((s, v) => s + v, 0), 100);
});

test("a rosca: formas de pagamento (cartão junto) e o pendente por último", () => {
  const { fatias, total, pctRecebido } = fatiasDoPeriodo({
    porForma: { pix: 500, dinheiro: 170, cartao_credito: 100, cartao_debito: 30, outro: 0 },
    pendente: 200,
  });
  assert.deepEqual(
    fatias.map((f) => [f.id, f.valor]),
    [
      ["pix", 500],
      ["dinheiro", 170],
      ["cartao", 130],
      ["pendente", 200],
    ],
  );
  assert.equal(total, 1000);
  assert.equal(fatias.reduce((s, f) => s + f.pct, 0), 100);
  assert.equal(pctRecebido, 80);
  // quase tudo recebido não arredonda para 100%
  assert.equal(fatiasDoPeriodo({ porForma: { pix: 995, dinheiro: 0, cartao_credito: 0, cartao_debito: 0, outro: 0 }, pendente: 5 }).pctRecebido, 99);
  assert.deepEqual(fatiasDoPeriodo({ porForma: { pix: 0, dinheiro: 0, cartao_credito: 0, cartao_debito: 0, outro: 0 }, pendente: 0 }), { fatias: [], total: 0, pctRecebido: 0 });
});

test("os arcos cobrem a volta inteira", () => {
  const a = arcos([{ valor: 1 }, { valor: 3 }]);
  assert.deepEqual(a, [
    { inicio: 0, fim: 0.25, meio: 0.125 },
    { inicio: 0.25, fim: 1, meio: 0.625 },
  ]);
});

test("serviços mais feitos: cinco e o resto em Outros", () => {
  const lista = ["A", "B", "C", "D", "E", "F", "G"].map((nome, i) => ({ nome, vezes: 10 - i }));
  const b = servicosMaisFeitos(lista);
  assert.equal(b.length, 6);
  assert.deepEqual(b[5], { nome: "Outros (2)", vezes: 5 + 4, outros: true });
  // com seis, mostra os seis (um "Outros" de um só não ajuda)
  assert.equal(servicosMaisFeitos(lista.slice(0, 6)).length, 6);
  assert.equal(servicosMaisFeitos(lista.slice(0, 6)).some((x) => x.outros), false);
});
