// node --experimental-strip-types --test lib/tayssa/analytics.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { ATALHOS, enderecoDoAtalho, foraDaAnalise, GA_TAYSSA } from "./analytics.ts";

test("o Analytics conta o site e a área da cliente, e fica fora do painel, do entrar e do folder", () => {
  for (const conta of ["/", "/tayssa", "/meus-horarios", "/minha-conta", "/vip", "/vip/beneficios", "/cadastro", "/indicar", "/tayssa/vip/agendar"]) {
    assert.equal(foraDaAnalise(conta), false, conta);
  }
  for (const fora of [
    "/admin",
    "/admin/agenda",
    "/tayssa/admin/clientes",
    "/entrar",
    "/entrar/link",
    "/tayssa/entrar/definir-senha",
    "/horario/0f1c9477-4caa-475d-b4d3-737fe1a24c12",
    "/tayssa/horario/abc/cartao",
  ]) {
    assert.equal(foraDaAnalise(fora), true, fora);
  }
  // só o começo do caminho decide: um serviço com "admin" no meio não sai da conta
  assert.equal(foraDaAnalise("/administracao"), false);
  assert.match(GA_TAYSSA, /^G-[A-Z0-9]+$/);
});

test("atalhos levam ao início com a origem marcada", () => {
  assert.equal(enderecoDoAtalho("https://tayssafarias.com.br/", "ig"), "https://tayssafarias.com.br/?utm_source=instagram&utm_medium=bio");
  assert.equal(
    enderecoDoAtalho("https://tayssafarias.com.br/", "stories"),
    "https://tayssafarias.com.br/?utm_source=instagram&utm_medium=stories",
  );
  assert.equal(
    enderecoDoAtalho("http://localhost:3014/tayssa", "whatsapp"),
    "http://localhost:3014/tayssa?utm_source=whatsapp&utm_medium=conversa",
  );
  assert.deepEqual(Object.keys(ATALHOS).sort(), ["ig", "stories", "whatsapp"]);
});
