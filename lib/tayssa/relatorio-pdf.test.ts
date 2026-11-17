import { test } from "node:test";
import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { PDFDocument } from "pdf-lib";
import { gerarPdfRelatorio, textoSeguro } from "./relatorio-pdf.ts";
import { linhaFin } from "./financeiro.ts";

const atend = Array.from({ length: 60 }, (_, i) => ({
  id: `a${i}`,
  clienteId: `c${i % 9}`,
  data: `2026-11-${String((i % 28) + 1).padStart(2, "0")}`,
  servico: i % 3 ? "Volume brasileiro" : "Manutenção de cílios + Design de sobrancelhas",
  valor: i % 7 ? 170 : null,
  pctTayssa: 70,
  pagamentos: i % 2 ? [{ valor: 50, forma: "pix" as const }, { valor: 120, forma: "dinheiro" as const }] : [{ valor: 50, forma: "pix" as const }],
}));

test("o PDF do relatório abre, quebra páginas e escreve acentos", async () => {
  const bytes = await gerarPdfRelatorio({
    versao: 2,
    periodo: { de: "2026-11-01", ate: "2026-11-30", rotulo: "Novembro de 2026" },
    geradoEm: "2026-11-17T18:00:00.000Z",
    negocio: "Tayssa Farias",
    larissa: "Larissa",
    linhas: atend.map((a, i) => {
      const div = linhaFin(a);
      return {
        data: a.data,
        hora: "10:00",
        cliente: i % 2 ? "Mariana L." : "Bia",
        servico: a.servico,
        valor: a.valor,
        formas: i % 2 ? "Pix + Dinheiro" : "Pix",
        tayssa: div.tayssa,
        larissa: div.larissa,
      };
    }),
  });
  assert.equal(new TextDecoder().decode(bytes.slice(0, 5)), "%PDF-");
  const doc = await PDFDocument.load(bytes);
  assert.ok(doc.getPageCount() >= 2, "60 atendimentos ocupam mais de uma página");
  if (process.env.PDF_SAIDA) writeFileSync(process.env.PDF_SAIDA, bytes);
});

test("texto seguro para a fonte do PDF", () => {
  assert.equal(textoSeguro("Ação “ok” — já… 💅"), 'Ação "ok" - já... ');
});
