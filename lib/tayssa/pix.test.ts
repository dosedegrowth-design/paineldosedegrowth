import { test } from "node:test";
import assert from "node:assert/strict";
import { chavePix, chavePixValida, crc16, gerarPixCopiaECola, pixDoPedido, textoDoPix, txidDoPedido } from "./pix.ts";

test("CRC16 do exemplo do manual do BR Code (Banco Central)", () => {
  // exemplo oficial: chave aleatória, "Fulano de Tal", BRASILIA, txid ***
  const semCrc =
    "00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-4266554400005204000053039865802BR5913Fulano de Tal6008BRASILIA62070503***6304";
  assert.equal(crc16(semCrc), "1D3D");
});

test("código da Tayssa: CNPJ, valor do sinal e o pedido no txid", () => {
  const codigo = gerarPixCopiaECola({
    chave: "50.318.762/0001-09",
    nome: "Larissa Silva Purificação",
    cidade: "São Paulo",
    valor: 50,
    txid: txidDoPedido("8e7c9870-4666-4143-93fe-80f0455fff3c"),
  });
  assert.ok(codigo.startsWith("000201"));
  assert.ok(codigo.includes("0014br.gov.bcb.pix011450318762000109"), "chave só com os números");
  assert.ok(codigo.includes("540550.00"), "valor do sinal");
  assert.ok(codigo.includes("5925LARISSA SILVA PURIFICACAO"), "nome sem acento, até 25");
  assert.ok(codigo.includes("6009SAO PAULO"));
  assert.ok(codigo.includes("62160512TL8E7C987046"), "txid do pedido");
  // o CRC fecha o código e confere
  const corpo = codigo.slice(0, -4);
  assert.ok(corpo.endsWith("6304"));
  assert.equal(codigo.slice(-4), crc16(corpo));
});

test("chave como o Pix espera", () => {
  assert.equal(chavePix("50.318.762/0001-09"), "50318762000109");
  assert.equal(chavePix("123.456.789-09"), "12345678909");
  assert.equal(chavePix("(11) 99982-7606"), "+5511999827606");
  assert.equal(chavePix("+55 11 99982-7606"), "+5511999827606");
  assert.equal(chavePix("5511999827606"), "+5511999827606");
  assert.equal(chavePix("Tayssa@Email.com "), "tayssa@email.com");
  assert.equal(chavePix("123E4567-E12B-12D1-A456-426655440000"), "123e4567-e12b-12d1-a456-426655440000");
  assert.equal(chavePix("  "), "");
});

test("chave válida: CNPJ e CPF com dígitos que conferem, celular, e-mail, aleatória", () => {
  assert.equal(chavePixValida("50.318.762/0001-09"), true);
  assert.equal(chavePixValida("50.318.762/0001-08"), false, "dígito errado");
  assert.equal(chavePixValida("529.982.247-25"), true);
  assert.equal(chavePixValida("111.111.111-11"), false);
  assert.equal(chavePixValida("(11) 99982-7606"), true);
  assert.equal(chavePixValida("tayssa@email.com"), true);
  assert.equal(chavePixValida("tayssa@"), false);
  assert.equal(chavePixValida("123e4567-e12b-12d1-a456-426655440000"), true);
  assert.equal(chavePixValida("qualquer coisa"), false);
});

test("nome longo corta sem quebrar palavra", () => {
  assert.equal(textoDoPix("Maria Manoela Procópio Mendonça", 25), "MARIA MANOELA PROCOPIO");
  assert.equal(textoDoPix("São Paulo", 15), "SAO PAULO");
});

test("sem chave cadastrada, o site não mostra Pix", () => {
  assert.equal(pixDoPedido(null, 50, "x"), null);
  assert.equal(pixDoPedido({ chave: " ", nome: "A", cidade: "B", banco: "" }, 50, "x"), null);
  assert.ok(
    pixDoPedido({ chave: "50318762000109", nome: "A", cidade: "B", banco: "" }, 50, "abc")?.startsWith("000201"),
  );
});
