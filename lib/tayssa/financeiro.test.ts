import { test } from "node:test";
import assert from "node:assert/strict";
import {
  brl,
  dividir,
  divisaoValida,
  ehRecorrente,
  frequenciaLegivel,
  historicoDaCliente,
  lerNumero,
  nomeCurto,
  parametrosDoPeriodo,
  periodoVizinho,
  resolverPeriodo,
  resumir,
  situacaoPagamento,
  type AtendimentoFin,
} from "./financeiro.ts";

test("divide 70/30 nos exemplos da Tayssa e a soma sempre bate no centavo", () => {
  assert.deepEqual(dividir(100, 70), { tayssa: 70, larissa: 30 });
  assert.deepEqual(dividir(200, 70), { tayssa: 140, larissa: 60 });
  assert.deepEqual(dividir(300, 70), { tayssa: 210, larissa: 90 });
  assert.deepEqual(dividir(185, 70), { tayssa: 129.5, larissa: 55.5 });
  const { tayssa, larissa } = dividir(33.33, 66.67);
  assert.equal(Math.round((tayssa + larissa) * 100), 3333);
});

test("percentuais precisam somar 100", () => {
  assert.equal(divisaoValida(70, 30), true);
  assert.equal(divisaoValida(66.67, 33.33), true);
  assert.equal(divisaoValida(70, 20), false);
  assert.equal(divisaoValida(-10, 110), false);
});

test("lê números escritos como no Brasil", () => {
  assert.equal(lerNumero("70"), 70);
  assert.equal(lerNumero("66,5"), 66.5);
  assert.equal(lerNumero("R$ 1.234,50"), 1234.5);
  assert.equal(lerNumero("170.5"), 170.5);
  assert.equal(lerNumero(""), null);
  assert.equal(lerNumero("abc"), null);
});

test("situação do pagamento", () => {
  assert.equal(situacaoPagamento(170, 170), "pago");
  assert.equal(situacaoPagamento(170, 50), "parcial");
  assert.equal(situacaoPagamento(170, 0), "pendente");
  assert.equal(situacaoPagamento(null, 50), "sem_valor");
  assert.equal(situacaoPagamento(170, 200), "pago");
});

test("períodos: hoje, ontem, semana (de domingo), mês, mês passado e personalizado", () => {
  const hoje = "2026-11-17"; // terça
  assert.deepEqual(resolverPeriodo({ periodo: "hoje" }, hoje), { tipo: "hoje", de: hoje, ate: hoje, rotulo: "Hoje, 17/11" });
  assert.equal(resolverPeriodo({ periodo: "ontem" }, hoje).de, "2026-11-16");
  const s = resolverPeriodo({ periodo: "semana" }, hoje);
  assert.equal(s.de, "2026-11-15");
  assert.equal(s.ate, "2026-11-21");
  assert.equal(s.rotulo, "Semana de 15/11 a 21/11/2026");
  const m = resolverPeriodo({}, hoje);
  assert.deepEqual([m.tipo, m.de, m.ate, m.rotulo], ["mes", "2026-11-01", "2026-11-30", "Novembro de 2026"]);
  const mp = resolverPeriodo({ periodo: "mes-passado" }, "2026-01-10");
  assert.deepEqual([mp.de, mp.ate], ["2025-12-01", "2025-12-31"]);
  const p = resolverPeriodo({ periodo: "personalizado", de: "2026-11-20", ate: "2026-11-02" }, hoje);
  assert.deepEqual([p.de, p.ate], ["2026-11-02", "2026-11-20"]);
  // data inválida cai no padrão, sem quebrar
  assert.equal(resolverPeriodo({ periodo: "dia", data: "2026-02-30" }, hoje).de, hoje);
  assert.equal(resolverPeriodo({ periodo: "xyz" }, hoje).tipo, "mes");
});

test("o período ao lado e os parâmetros do endereço", () => {
  const hoje = "2026-11-17";
  assert.equal(periodoVizinho(resolverPeriodo({ periodo: "mes" }, hoje), -1, hoje).de, "2026-10-01");
  assert.equal(periodoVizinho(resolverPeriodo({ periodo: "semana" }, hoje), 1, hoje).de, "2026-11-22");
  assert.equal(periodoVizinho(resolverPeriodo({ periodo: "hoje" }, hoje), -1, hoje).de, "2026-11-16");
  assert.deepEqual(parametrosDoPeriodo(resolverPeriodo({ periodo: "mes", mes: "2026-10" }, hoje)), { periodo: "mes", mes: "2026-10" });
});

const atend = (o: Partial<AtendimentoFin>): AtendimentoFin => ({
  id: Math.random().toString(36),
  clienteId: "c1",
  data: "2026-11-10",
  servico: "Volume brasileiro",
  valor: 100,
  pctTayssa: 70,
  pagamentos: [],
  ...o,
});

test("resumo: faturamento não é recebido, a divisão sai sozinha e quem não tem valor fica de fora", () => {
  const r = resumir([
    atend({ valor: 100, pagamentos: [{ valor: 100, forma: "pix" }] }),
    atend({ clienteId: "c2", valor: 200, pagamentos: [{ valor: 50, forma: "pix" }, { valor: 50, forma: "dinheiro" }] }),
    atend({ clienteId: "c3", valor: 300, servico: "Design de sobrancelhas + Lip spa" }),
    atend({ clienteId: "c3", valor: null }),
  ]);
  assert.equal(r.atendimentos, 4);
  assert.equal(r.clientes, 3);
  assert.equal(r.semValor, 1);
  assert.equal(r.bruto, 600);
  assert.equal(r.recebido, 200);
  assert.equal(r.pendente, 400);
  assert.equal(r.ticketMedio, 200);
  assert.equal(r.porForma.pix, 150);
  assert.equal(r.porForma.dinheiro, 50);
  assert.deepEqual(r.tayssa, { pct: 70, bruto: 420, recebido: 140, aReceber: 280 });
  assert.deepEqual(r.larissa, { pct: 30, bruto: 180, recebido: 60, aReceber: 120 });
  assert.equal(r.tayssa.bruto + r.larissa.bruto, r.bruto);
  assert.ok(r.servicos.some((s) => s.nome === "Lip spa" && s.vezes === 1));
});

test("mudar a divisão vale para os próximos: cada atendimento usa o próprio percentual", () => {
  const r = resumir([atend({ valor: 100, pctTayssa: 70 }), atend({ valor: 100, pctTayssa: 60 })]);
  assert.equal(r.tayssa.bruto, 130);
  assert.equal(r.larissa.bruto, 70);
  assert.equal(r.divisaoVariou, true);
  // atendimento antigo (sem percentual guardado) usa o padrão
  assert.equal(resumir([atend({ valor: 100, pctTayssa: null })], 70).tayssa.bruto, 70);
});

test("histórico da cliente: quantidade, primeira e última, total e frequência", () => {
  const h = historicoDaCliente([
    { data: "2026-10-01", servico: "Volume inglês", valor: 170, pagamentos: [{ valor: 170, forma: "pix" }] },
    { data: "2026-10-19", servico: "Manutenção de cílios", valor: 120, pagamentos: [] },
    { data: "2026-11-06", servico: "Manutenção de cílios + Lip spa", valor: 155, pagamentos: [{ valor: 50, forma: "pix" }] },
  ]);
  assert.equal(h.quantidade, 3);
  assert.equal(h.primeira, "2026-10-01");
  assert.equal(h.ultima, "2026-11-06");
  assert.equal(h.totalGasto, 445);
  assert.equal(h.totalPago, 220);
  assert.equal(h.frequenciaDias, 18);
  assert.equal(h.servicos[0].nome, "Manutenção de cílios");
  assert.equal(frequenciaLegivel(h.frequenciaDias, h.quantidade), "volta a cada ~18 dias");
  assert.equal(ehRecorrente(h.quantidade), true);
  assert.equal(historicoDaCliente([]).primeira, null);
});

test("nome curto e dinheiro do relatório", () => {
  assert.equal(nomeCurto("mariana souza lima"), "Mariana L.");
  assert.equal(nomeCurto("Bia"), "Bia");
  assert.equal(nomeCurto(""), "Cliente");
  assert.equal(brl(1234.5), "R$ 1.234,50");
  assert.equal(brl(70), "R$ 70,00");
});
