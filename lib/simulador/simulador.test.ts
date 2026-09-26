/**
 * Testes da lógica pura do simulador. Rodar:
 *   node --experimental-strip-types --test lib/simulador/simulador.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { isValidCpf, maskCpf, nextCpfValue, onlyDigits } from "./cpf.ts";
import { firstName, isValidFullName, normalizeName, titleCaseName } from "./name.ts";
import {
  formatBRL,
  formatBRLWhole,
  generateEstimateCents,
  positionInRange,
  randomIntInclusive,
} from "./estimate.ts";
import { buildWhatsappUrl, renderMessage } from "./whatsapp.ts";

const nbsp = (s: string) => s.replace(/ /g, " ");

/* ---------- CPF ---------- */

test("cpf: máscara progressiva", () => {
  assert.equal(maskCpf(""), "");
  assert.equal(maskCpf("1"), "1");
  assert.equal(maskCpf("123"), "123");
  assert.equal(maskCpf("1234"), "123.4");
  assert.equal(maskCpf("1234567"), "123.456.7");
  assert.equal(maskCpf("1234567890"), "123.456.789-0");
  assert.equal(maskCpf("12345678909"), "123.456.789-09");
  assert.equal(maskCpf("123456789091234"), "123.456.789-09", "corta em 11 dígitos");
  assert.equal(maskCpf("abc123.456xyz"), "123.456", "ignora o que não é dígito");
});

test("cpf: backspace apaga o dígito antes do separador", () => {
  // usuário tinha "123.456", apertou backspace: o navegador entrega "123.456"
  // sem o ponto → "123456" → sem o ajuste voltaria a "123.456" e travaria
  assert.equal(nextCpfValue("123.456", "123.45", "deleteContentBackward"), "123.45");
  assert.equal(nextCpfValue("123.", "123", "deleteContentBackward"), "12");
  assert.equal(nextCpfValue("123.456.789-", "123.456.789", "deleteContentBackward"), "123.456.78");
  // digitação normal não é afetada
  assert.equal(nextCpfValue("123", "1234", "insertText"), "123.4");
  // colar um CPF inteiro
  assert.equal(nextCpfValue("", "529.982.247-25", "insertFromPaste"), "529.982.247-25");
});

test("cpf: validação dos dígitos verificadores", () => {
  assert.equal(isValidCpf("529.982.247-25"), true);
  assert.equal(isValidCpf("123.456.789-09"), true);
  assert.equal(isValidCpf("12345678909"), true);
  assert.equal(isValidCpf("123.456.789-00"), false, "dígito verificador errado");
  assert.equal(isValidCpf("111.111.111-11"), false, "sequência repetida");
  assert.equal(isValidCpf("000.000.000-00"), false);
  assert.equal(isValidCpf("123.456.789"), false, "incompleto");
  assert.equal(isValidCpf(""), false);
  assert.equal(onlyDigits("529.982.247-25"), "52998224725");
});

/* ---------- nome ---------- */

test("nome: exige nome completo", () => {
  assert.equal(isValidFullName("Maria da Silva"), true);
  assert.equal(isValidFullName("  josé   ANTÔNIO  "), true);
  assert.equal(isValidFullName("Ana-Clara D'Ávila"), true);
  assert.equal(isValidFullName("Maria"), false, "uma palavra só");
  assert.equal(isValidFullName("M S"), false, "curto demais");
  assert.equal(isValidFullName("Maria 123"), false, "números");
  assert.equal(isValidFullName(""), false);
  assert.equal(isValidFullName("a".repeat(60) + " " + "b".repeat(30)), false, "longo demais");
});

test("nome: normalização e primeiro nome", () => {
  assert.equal(normalizeName("  maria   da  silva "), "maria da silva");
  assert.equal(titleCaseName("maria DA silva"), "Maria da Silva");
  assert.equal(titleCaseName("ana-clara dos santos"), "Ana-Clara dos Santos");
  assert.equal(firstName("  joão pedro alves"), "João");
  assert.equal(firstName("MARIA"), "Maria");
});

/* ---------- estimativa ---------- */

test("estimativa: sempre dentro da faixa, em reais inteiros", () => {
  const range = { minBRL: 870, maxBRL: 1400 };
  for (let i = 0; i < 2000; i++) {
    const cents = generateEstimateCents(range);
    assert.ok(cents >= 87000 && cents <= 140000, `fora da faixa: ${cents}`);
    assert.equal(cents % 100, 0);
  }
  assert.equal(generateEstimateCents(range, () => 0), 87000, "extremo inferior");
  assert.equal(generateEstimateCents(range, () => 0.999999), 140000, "extremo superior");
  assert.equal(randomIntInclusive(5, 5), 5);
});

test("estimativa: formatação em reais", () => {
  assert.equal(nbsp(formatBRL(108700)), "R$ 1.087,00");
  assert.equal(nbsp(formatBRL(87000)), "R$ 870,00");
  assert.equal(nbsp(formatBRLWhole(1400)), "R$ 1.400");
  assert.equal(positionInRange(87000, { minBRL: 870, maxBRL: 1400 }), 0);
  assert.equal(positionInRange(140000, { minBRL: 870, maxBRL: 1400 }), 1);
  assert.ok(Math.abs(positionInRange(113500, { minBRL: 870, maxBRL: 1400 }) - 0.5) < 1e-9);
});

/* ---------- WhatsApp ---------- */

test("whatsapp: url padrão com mensagem e nome, sem CPF", () => {
  const url = buildWhatsappUrl(
    "+55 (11) 99999-9999",
    "Olá! Fiz uma simulação. Meu nome é {nome} e a estimativa foi de {valor}.",
    { nome: "Maria da Silva", valor: "R$ 1.087,00" }
  );
  assert.ok(url.startsWith("https://wa.me/5511999999999?text="));
  const text = decodeURIComponent(url.split("text=")[1]);
  assert.equal(text, "Olá! Fiz uma simulação. Meu nome é Maria da Silva e a estimativa foi de R$ 1.087,00.");
  assert.ok(!/\d{3}\.\d{3}\.\d{3}-\d{2}/.test(url), "CPF nunca vai na URL");
  assert.equal(renderMessage("Oi {nome}", { nome: "Ana", valor: "" }), "Oi Ana");
});
