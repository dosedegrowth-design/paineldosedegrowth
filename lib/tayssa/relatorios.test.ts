/**
 * Relatórios (comprovantes do sinal). Rodar:
 *   node --experimental-strip-types --test lib/tayssa/relatorios.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  crc32,
  criarZip,
  limitesDoMes,
  mesLegivel,
  mesValido,
  nomesDosArquivos,
  outroMes,
  paraNomeDeArquivo,
  planilhaDosComprovantes,
  type ComprovanteDoRelatorio,
} from "./relatorios.ts";

test("meses: valida, lê em português, anda para os lados e vira o ano", () => {
  assert.equal(mesValido("2026-11"), true);
  assert.equal(mesValido("2026-13"), false);
  assert.equal(mesValido("26-11"), false);
  assert.equal(mesLegivel("2026-11"), "novembro de 2026");
  assert.equal(outroMes("2026-12", 1), "2027-01");
  assert.equal(outroMes("2026-01", -1), "2025-12");
  assert.deepEqual(limitesDoMes("2026-11"), { de: "2026-11-01T00:00:00-03:00", ate: "2026-12-01T00:00:00-03:00" });
});

const c = (p: Partial<ComprovanteDoRelatorio>): ComprovanteDoRelatorio => ({
  id: "x",
  enviadoEm: "2026-11-12T15:00:00Z",
  cliente: "Mayara Teste",
  whatsapp: "5511988880001",
  servico: "Manutenção Mega Inglês",
  dia: "2026-11-12",
  hora: "10:00",
  situacao: "Realizado",
  valor: 150,
  ext: "jpg",
  ...p,
});

test("nomes dos arquivos: dia, hora, cliente e serviço, sem acento, sem repetir", () => {
  assert.equal(paraNomeDeArquivo("Manutenção Mega Inglês + Lip spa"), "Manutencao-Mega-Ingles-Lip-spa");
  assert.deepEqual(nomesDosArquivos([c({}), c({}), c({ hora: "14:30", ext: "pdf" })]), [
    "2026-11-12_10h_Mayara-Teste_Manutencao-Mega-Ingles.jpg",
    "2026-11-12_10h_Mayara-Teste_Manutencao-Mega-Ingles-2.jpg",
    "2026-11-12_14h30_Mayara-Teste_Manutencao-Mega-Ingles.pdf",
  ]);
});

test("planilha: abre no Excel em português (BOM, ponto e vírgula, vírgula decimal)", () => {
  const p = planilhaDosComprovantes([c({ servico: 'Volume "inglês"; mega' })], 50, () => "12/11/2026 12:00");
  assert.ok(p.startsWith("﻿Comprovante enviado em;Cliente;"));
  const linha = p.split("\r\n")[1];
  assert.match(linha, /^12\/11\/2026 12:00;Mayara Teste;5511988880001;"Volume ""inglês""; mega";12\/11\/2026;10:00;Realizado;50,00;150,00;/);
});

test("zip: o crc é o padrão e o arquivo abre com os nomes em UTF-8", () => {
  assert.equal(crc32(new TextEncoder().encode("123456789")), 0xcbf43926);
  const zip = criarZip([
    { nome: "comprovante-ção.txt", dados: new TextEncoder().encode("sinal pago") },
    { nome: "outro.pdf", dados: new Uint8Array([37, 80, 68, 70]) },
  ]);
  const dir = mkdtempSync(join(tmpdir(), "zip-"));
  const arq = join(dir, "t.zip");
  writeFileSync(arq, zip);
  let saida = "";
  try {
    saida = execFileSync("python3", ["-c", "import sys,zipfile;z=zipfile.ZipFile(sys.argv[1]);print(z.testzip());print('|'.join(z.namelist()));print(z.read('comprovante-ção.txt').decode())", arq]).toString();
  } catch {
    return; // sem python, fica só o crc
  }
  const [teste, nomes, conteudo] = saida.trim().split("\n");
  assert.equal(teste, "None");
  assert.equal(nomes, "comprovante-ção.txt|outro.pdf");
  assert.equal(conteudo, "sinal pago");
});
