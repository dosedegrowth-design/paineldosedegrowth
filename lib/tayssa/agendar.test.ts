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
  manutencaoComVolume,
  mensagemConfirmacao,
  nomeDaCliente,
  diaSoVip,
  avisoDaReservaVip,
  partesDoDia,
  reais,
  valorLegivel,
  mesesDaAgenda,
  prazoDoSinal,
  sinalNoPrazo,
  valorComTaxa,
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

test("mensagem em campos, pedindo o Pix do sinal", () => {
  const m = mensagemAgendamento({
    servico: "Manutenção de cílios",
    tecnica: "Volume brasileiro",
    dia: "2026-10-23",
    hora: "14:00",
    nome: "  Ana ",
    valor: 120,
    sinal: 50,
  });
  assert.equal(
    m,
    [
      "Oi, Tayssa, tudo bem? Aqui é Ana. Marquei meu horário pelo site.",
      "",
      "*Serviço:* Manutenção de cílios (Volume brasileiro)",
      "*Dia:* sexta, 23/10",
      "*Horário:* 14h",
      "*Valor:* R$ 120",
      "",
      "Me manda a chave Pix do sinal de R$ 50 para eu garantir o horário?",
    ].join("\n"),
  );
});

test("sem nome e sem valor, os campos que faltam não aparecem", () => {
  const m = mensagemAgendamento({ servico: "Manutenção de cílios", dia: "2026-10-24", hora: "10:30", nome: "", sinal: 50 });
  assert.ok(m.startsWith("Oi, Tayssa, tudo bem? Marquei meu horário pelo site."));
  assert.match(m, /\*Serviço:\* Manutenção de cílios\n/);
  assert.match(m, /\*Horário:\* 10h30/);
  assert.doesNotMatch(m, /Aqui é|Valor:/);
});

test("com o link do horário, a mensagem termina nele (o WhatsApp mostra o folder)", () => {
  const link = "https://tayssafarias.com.br/horario/0b0e5c1e-1111-4222-8333-944445555666";
  const m = mensagemAgendamento({ servico: "Volume inglês", dia: "2026-11-07", hora: "10:00", nome: "Ana", sinal: 50, link });
  assert.ok(m.endsWith(`garantir o horário?\n\nMeu horário: ${link}`));
  // sem link, nada de linha vazia sobrando
  const semLink = mensagemAgendamento({ servico: "Volume inglês", dia: "2026-11-07", hora: "10:00", nome: "Ana", sinal: 50, link: null });
  assert.ok(semLink.endsWith("garantir o horário?"));
});

test("com o comprovante anexado: o sinal vira campo e a mensagem não pede a chave (vai com a foto do cartão)", () => {
  const m = mensagemAgendamento({ servico: "Volume brasileiro", dia: "2026-11-12", hora: "09:00", nome: "Gabi", valor: 170, sinal: 50, comprovante: true });
  assert.equal(
    m,
    [
      "Oi, Tayssa, tudo bem? Aqui é Gabi. Fiz meu agendamento pelo site.",
      "",
      "*Serviço:* Volume brasileiro",
      "*Dia:* quinta, 12/11",
      "*Horário:* 9h",
      "*Valor:* R$ 170",
      "*Sinal:* R$ 50 pago no Pix, comprovante anexado no site",
    ].join("\n"),
  );
  assert.doesNotMatch(m, /chave Pix/);
  const comLink = mensagemAgendamento({ servico: "Volume inglês", dia: "2026-11-07", hora: "10:00", nome: "Ana", sinal: 50, comprovante: true, link: "https://x/horario/1" });
  assert.ok(comLink.endsWith("comprovante anexado no site\n\nMeu horário: https://x/horario/1"));
});

test("nome na mensagem: o apelido, ou o nome do cadastro com as iniciais em maiúscula", () => {
  assert.equal(nomeDaCliente("Robert israel", null), "Robert Israel");
  assert.equal(nomeDaCliente("Gabriella Pessoa", "Gabi"), "Gabi");
  assert.equal(nomeDaCliente("  ana   da silva ", "  "), "Ana da Silva");
  // o resto da palavra fica como ela escreveu
  assert.equal(nomeDaCliente("MARIA mcDonald"), "MARIA McDonald");
});

test("mensagem de confirmação: o nome, confirmado, comprovante aceito e os campos", () => {
  const m = mensagemConfirmacao({
    nome: "Robert Israel",
    servico: "Volume brasileiro",
    dia: "2026-11-12",
    hora: "19:00",
    comprovante: true,
    endereco: "Rua Constantino Neri, 25, Pirituba, São Paulo - SP, CEP 02936-050",
    sala: "",
    interfone: "",
    tolerancia: 10,
    recado: null,
    link: "https://tayssafarias.com.br/meus-horarios",
  });
  assert.equal(
    m,
    [
      "Olá, Robert Israel, tudo bem? Seu atendimento acabou de ser confirmado e o seu comprovante foi aceito.",
      "",
      "*Serviço:* Volume brasileiro",
      "*Dia:* quinta, 12/11",
      "*Horário:* 19h",
      "*Endereço:* Rua Constantino Neri, 25, Pirituba, São Paulo - SP, CEP 02936-050",
      "",
      "A tolerância de atraso é de 10 minutos. Passando disso, o sinal é perdido.",
      "",
      "Seus horários ficam aqui: https://tayssafarias.com.br/meus-horarios",
      "",
      "Qualquer dúvida, é só me chamar. Te espero!",
    ].join("\n"),
  );
});

test("mensagem de confirmação: sala, interfone e o recado dela entram; sem comprovante não fala dele", () => {
  const m = mensagemConfirmacao({
    nome: "Gabi",
    servico: "Manutenção de cílios",
    tecnica: "Volume inglês",
    dia: "2026-11-12",
    hora: "09:00",
    comprovante: false,
    sala: "Sala 12",
    interfone: "12",
    tolerancia: 0,
    recado: " Chega uns 5 minutinhos antes. ",
  });
  assert.ok(m.startsWith("Olá, Gabi, tudo bem? Seu atendimento acabou de ser confirmado.\n"));
  assert.match(m, /\*Serviço:\* Manutenção de cílios \(Volume inglês\)\n/);
  assert.match(m, /\*Sala:\* Sala 12\n\*Interfone:\* 12\n\nChega uns 5 minutinhos antes\.\n\n/);
  assert.doesNotMatch(m, /comprovante|tolerância|Endereço|ficam aqui/);
});

test("manutenção com o volume no nome não pergunta o volume e o valor é de partida", () => {
  // os nomes de produção (lista do Lucas, 12/11/2026)
  assert.equal(manutencaoComVolume("Manutenção Mega Fox eyes"), true);
  assert.equal(manutencaoComVolume("Manutenção Mega Inglês"), true);
  assert.equal(manutencaoComVolume("manutencao mega brasileiro"), true);
  assert.equal(manutencaoComVolume("Manutenção de cílios"), false);
  assert.equal(manutencaoComVolume("Manutenção"), false);
  assert.equal(manutencaoComVolume("Volume brasileiro"), false);
  // a aplicação Mega não é manutenção
  assert.equal(manutencaoComVolume("Mega Inglês"), false);
  assert.equal(ehManutencao("mega-ingles", "Mega Inglês"), false);
  // a genérica pergunta de qual volume; a do volume, não
  assert.equal(ehManutencao("manutencao-cilios", "Manutenção de cílios"), true);
  assert.equal(ehManutencao("manutencao-mega-fox-eyes", "Manutenção Mega Fox eyes"), false);
  assert.equal(ehManutencao("volume-ingles", "Volume inglês"), false);
});

test("prioridade VIP: dezembro só para VIP até a Tayssa abrir para todas", () => {
  const p = { ativa: true, desde: "2026-12-01", abre_em: "" };
  const agora = new Date(2026, 10, 9, 10, 0); // segunda, 09/11, 10h
  assert.equal(diaSoVip("2026-11-30", p, agora), false);
  assert.equal(diaSoVip("2026-12-01", p, agora), true);
  assert.equal(diaSoVip("2027-01-04", p, agora), true);
  assert.equal(avisoDaReservaVip(p, agora, "vip"), "Você é VIP: dezembro já está aberto para você, antes de todo mundo.");
  assert.equal(
    avisoDaReservaVip(p, agora, "cliente"),
    "Dezembro abre primeiro para as clientes VIP. Para as demais, abre em breve.",
  );
  // com o dia marcado, abre sozinho na hora
  const marcado = { ...p, abre_em: "2026-11-16T09:00" };
  assert.equal(
    avisoDaReservaVip(marcado, agora, "anonima"),
    "Dezembro abre primeiro para as clientes VIP. Para as demais, abre na segunda, 16/11, às 9h.",
  );
  assert.equal(diaSoVip("2026-12-05", marcado, new Date(2026, 10, 16, 8, 59)), true);
  assert.equal(diaSoVip("2026-12-05", marcado, new Date(2026, 10, 16, 9, 0)), false);
  assert.equal(avisoDaReservaVip(marcado, new Date(2026, 10, 16, 9, 0), "cliente"), null);
  // desligada ou sem o dia de início: nada fica guardado
  assert.equal(diaSoVip("2026-12-05", { ...p, ativa: false }, agora), false);
  assert.equal(diaSoVip("2026-12-05", { ...p, desde: "" }, agora), false);
  // começando no meio do mês
  assert.equal(
    avisoDaReservaVip({ ...p, desde: "2026-12-15" }, agora, "cliente"),
    "As datas a partir de 15/12 abrem primeiro para as clientes VIP. Para as demais, abrem em breve.",
  );
});

test("com valor cadastrado, a mensagem leva o valor", () => {
  const m = mensagemAgendamento({ servico: "Volume inglês", dia: "2026-10-23", hora: "14:00", nome: "Ana", valor: 220, sinal: 50 });
  assert.match(m, /\*Horário:\* 14h\n\*Valor:\* R\$ 220\n/);
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
  // manutenção de um volume: o valor é sempre o de partida
  assert.equal(valorLegivel(150, [], true), "a partir de R$ 150");
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

test("os meses da fita de dias, com o primeiro dia de cada um", () => {
  const dias = ["2026-11-06", "2026-11-07", "2026-11-30", "2026-12-01", "2026-12-24", "2027-01-02"].map((iso) => ({ iso }));
  assert.deepEqual(mesesDaAgenda(dias), [
    { chave: "2026-11", nome: "Novembro", primeiro: "2026-11-06" },
    { chave: "2026-12", nome: "Dezembro", primeiro: "2026-12-01" },
    { chave: "2027-01", nome: "Janeiro", primeiro: "2027-01-02" },
  ]);
  assert.deepEqual(mesesDaAgenda([]), []);
});

test("o pedido segura o horário por 24h, no horário de Brasília", () => {
  // 05/11 às 15h em Brasília (18h UTC) + 24h = sexta, 06/11 às 15h
  assert.equal(prazoDoSinal("2026-11-05T18:00:00Z", 24).legivel, "sexta, 06/11 às 15h");
  assert.equal(prazoDoSinal("2026-11-05T18:30:00Z", 24).legivel, "sexta, 06/11 às 15h30");
  // perto da meia-noite: vira o dia certo em Brasília, não em UTC
  assert.equal(prazoDoSinal("2026-11-06T02:00:00Z", 24).legivel, "sexta, 06/11 às 23h");
  assert.equal(prazoDoSinal("2026-11-07T12:00:00Z", 2).legivel, "sábado, 07/11 às 11h");
  assert.equal(sinalNoPrazo("2026-11-05T18:00:00Z", 24, new Date("2026-11-06T17:59:00Z")), true);
  assert.equal(sinalNoPrazo("2026-11-05T18:00:00Z", 24, new Date("2026-11-06T18:00:00Z")), false);
});

test("dezembro: a taxa de horário especial no resumo e nas mensagens", () => {
  assert.equal(valorComTaxa(170, 30), "R$ 170 + R$ 30 de taxa de horário especial");
  assert.equal(valorComTaxa(170, 0), "R$ 170");
  assert.equal(valorComTaxa(null, 30), "+ R$ 30 de taxa de horário especial");
  assert.equal(valorComTaxa(null, 0), null);
  const pedido = mensagemAgendamento({
    servico: "Volume brasileiro",
    dia: "2026-12-24",
    hora: "10:00",
    nome: "Gabi",
    valor: 170,
    taxa: 30,
    sinal: 50,
    comprovante: true,
  });
  assert.match(pedido, /\*Valor:\* R\$ 170\n\*Taxa de horário especial:\* R\$ 30\n\*Sinal:\*/);
  // sem taxa, a linha não aparece
  assert.doesNotMatch(
    mensagemAgendamento({ servico: "Lip spa", dia: "2026-11-17", hora: "10:00", nome: "Gabi", valor: 35, sinal: 50 }),
    /Taxa/,
  );
  const confirmacao = mensagemConfirmacao({
    nome: "Gabi",
    servico: "Volume brasileiro",
    dia: "2026-12-24",
    hora: "10:00",
    comprovante: true,
    taxa: 30,
  });
  assert.match(confirmacao, /\*Horário:\* 10h\n\*Taxa de horário especial:\* R\$ 30\n/);
});
