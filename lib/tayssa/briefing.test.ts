/**
 * Briefing da Tayssa. Rodar:
 *   node --experimental-strip-types --test lib/tayssa/briefing.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { parteFeita, progresso, type ArquivoBriefing } from "./briefing.ts";

const arquivo = (tipo: ArquivoBriefing["tipo"], i = 0): ArquivoBriefing => ({
  id: `${tipo}-${i}`,
  tipo,
  url: `https://x.supabase.co/${tipo}-${i}`,
  nome: `${tipo}.jpg`,
  mime: "image/jpeg",
  bytes: 1000,
  tecnica: null,
});

test("marcar pronto conta, mesmo com a parte vazia", () => {
  assert.equal(parteFeita("voce", { pronto: true } as never, []), true);
  assert.equal(parteFeita("voce", undefined, []), false);
});

test("biografia curta demais ainda não conta", () => {
  assert.equal(parteFeita("voce", { nome: "Tayssa", bio: "Oi!", tempo: "", formacao: "" }, []), false);
  assert.equal(
    parteFeita("voce", { nome: "", bio: "Comecei em 2018 atendendo em casa, hoje tenho o meu estúdio.", tempo: "", formacao: "" }, []),
    true,
  );
});

test("fotos: três do trabalho ou o link do Drive", () => {
  assert.equal(parteFeita("midia", { drive: "" }, [arquivo("trabalho", 1), arquivo("trabalho", 2)]), false);
  assert.equal(parteFeita("midia", { drive: "" }, [1, 2, 3].map((i) => arquivo("trabalho", i))), true);
  assert.equal(parteFeita("midia", { drive: "https://drive.google.com/x" }, []), true);
  // retrato não é foto do trabalho
  assert.equal(parteFeita("midia", { drive: "" }, [1, 2, 3].map((i) => arquivo("retrato", i))), false);
});

test("regras do VIP: cada uma conferida; 'quero mudar' precisa dizer o quê", () => {
  const vip = (b: Record<string, { ok: "" | "sim" | "mudar"; texto: string }>) => parteFeita("vip", { beneficios: b }, []);
  assert.equal(vip({ a: { ok: "sim", texto: "" }, b: { ok: "", texto: "" } }), false);
  assert.equal(vip({ a: { ok: "sim", texto: "" }, b: { ok: "mudar", texto: "" } }), false);
  assert.equal(vip({ a: { ok: "sim", texto: "" }, b: { ok: "mudar", texto: "15% em vez de 10%" } }), true);
  assert.equal(vip({}), false);
});

test("progresso deixa de fora a parte opcional e o fechamento", () => {
  const { feitas, total } = progresso(
    {
      voce: { pronto: true },
      numeros: { pronto: true },
      final: { pronto: true },
    },
    [],
  );
  assert.equal(total, 7);
  assert.equal(feitas, 1);
});
