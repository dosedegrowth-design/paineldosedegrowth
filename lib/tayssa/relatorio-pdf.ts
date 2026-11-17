import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { RelatorioDados } from "@/lib/tayssa/queries/gestao";
import { resumoDoRelatorio } from "./financeiro.ts";

/**
 * O relatório em PDF (17/11/2026): A4, na cara do painel (vinho, dourado,
 * branco), para baixar e compartilhar. Período, atendimentos, faturamento,
 * formas de pagamento, a divisão Tayssa/Larissa e o detalhamento. Sem nome
 * inteiro nem telefone de cliente (o relatório sai do painel).
 */

const VINHO = rgb(0x6d / 255, 0x15 / 255, 0x30 / 255);
const VINHO_CLARO = rgb(0xf7 / 255, 0xec / 255, 0xef / 255);
const ROSA = rgb(0xf3 / 255, 0xdb / 255, 0xe3 / 255);
const OURO = rgb(0xac / 255, 0x80 / 255, 0x2e / 255);
const TINTA = rgb(0x2a / 255, 0x0d / 255, 0x18 / 255);
const MUDO = rgb(0x7a / 255, 0x52 / 255, 0x60 / 255);
const LINHA = rgb(0xee / 255, 0xdf / 255, 0xe3 / 255);
const BRANCO = rgb(1, 1, 1);


const A4 = { w: 595.28, h: 841.89 };
const MARGEM = 40;

/** Só o que a fonte padrão do PDF escreve (WinAnsi): o resto vira algo parecido ou some. */
export function textoSeguro(t: string): string {
  return t
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/…/g, "...")
    .replace(/[–—]/g, "-")
    .replace(/[^\x20-\x7E -ÿ]/g, "");
}

function brl(v: number): string {
  const [int, dec] = Math.abs(v).toFixed(2).split(".");
  return `${v < 0 ? "-" : ""}R$ ${int.replace(/\B(?=(\d{3})+(?!\d))/g, ".")},${dec}`;
}

function dataBr(iso: string): string {
  const [a, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${a}`;
}

function pct(n: number): string {
  return `${String(Math.round(n * 100) / 100).replace(".", ",")}%`;
}

type Ctx = { doc: PDFDocument; page: PDFPage; y: number; f: PDFFont; b: PDFFont; paginas: PDFPage[]; rodape: string };

function caber(t: string, largura: number, tam: number, fonte: PDFFont): string {
  let s = textoSeguro(t);
  if (fonte.widthOfTextAtSize(s, tam) <= largura) return s;
  while (s.length > 1 && fonte.widthOfTextAtSize(`${s}...`, tam) > largura) s = s.slice(0, -1);
  return `${s.trimEnd()}...`;
}

function texto(c: Ctx, t: string, x: number, y: number, tam: number, fonte: PDFFont, cor = TINTA, largura?: number) {
  const s = largura ? caber(t, largura, tam, fonte) : textoSeguro(t);
  c.page.drawText(s, { x, y, size: tam, font: fonte, color: cor });
}

function aDireita(c: Ctx, t: string, xDireita: number, y: number, tam: number, fonte: PDFFont, cor = TINTA) {
  const s = textoSeguro(t);
  c.page.drawText(s, { x: xDireita - fonte.widthOfTextAtSize(s, tam), y, size: tam, font: fonte, color: cor });
}

function novaPagina(c: Ctx) {
  c.page = c.doc.addPage([A4.w, A4.h]);
  c.paginas.push(c.page);
  // faixa fina no topo das páginas seguintes
  c.page.drawRectangle({ x: 0, y: A4.h - 6, width: A4.w, height: 6, color: VINHO });
  c.y = A4.h - MARGEM;
}

/** Garante espaço; se não cabe, vira a página. */
function espaco(c: Ctx, altura: number): boolean {
  if (c.y - altura < MARGEM + 24) {
    novaPagina(c);
    return true;
  }
  return false;
}

function titulo(c: Ctx, t: string) {
  espaco(c, 40);
  c.y -= 22;
  texto(c, t, MARGEM, c.y, 12.5, c.b, VINHO);
  c.page.drawRectangle({ x: MARGEM, y: c.y - 6, width: 28, height: 1.6, color: OURO });
  c.y -= 16;
}

function caixas(c: Ctx, itens: { rotulo: string; valor: string }[]) {
  const gap = 8;
  const largura = (A4.w - MARGEM * 2 - gap * (itens.length - 1)) / itens.length;
  espaco(c, 56);
  const topo = c.y;
  itens.forEach((it, i) => {
    const x = MARGEM + i * (largura + gap);
    c.page.drawRectangle({ x, y: topo - 48, width: largura, height: 48, color: VINHO_CLARO });
    texto(c, it.rotulo, x + 10, topo - 17, 8, c.f, MUDO, largura - 20);
    texto(c, it.valor, x + 10, topo - 36, 13.5, c.b, TINTA, largura - 20);
  });
  c.y = topo - 58;
}

type Coluna = { rotulo: string; largura: number; direita?: boolean };

function tabela(c: Ctx, colunas: Coluna[], linhas: { valores: string[]; negrito?: boolean }[]) {
  const total = A4.w - MARGEM * 2;
  const soma = colunas.reduce((s, col) => s + col.largura, 0);
  const larguras = colunas.map((col) => (col.largura / soma) * total);
  const cabecalho = () => {
    espaco(c, 24);
    c.page.drawRectangle({ x: MARGEM, y: c.y - 18, width: total, height: 18, color: VINHO });
    let x = MARGEM;
    colunas.forEach((col, i) => {
      if (col.direita) aDireita(c, col.rotulo, x + larguras[i] - 6, c.y - 12.5, 8, c.b, BRANCO);
      else texto(c, col.rotulo, x + 6, c.y - 12.5, 8, c.b, BRANCO, larguras[i] - 12);
      x += larguras[i];
    });
    c.y -= 18;
  };
  cabecalho();
  linhas.forEach((l, n) => {
    if (espaco(c, 17)) cabecalho();
    if (n % 2 === 1) c.page.drawRectangle({ x: MARGEM, y: c.y - 16, width: total, height: 16, color: rgb(0xfc / 255, 0xf8 / 255, 0xf9 / 255) });
    let x = MARGEM;
    l.valores.forEach((v, i) => {
      const fonte = l.negrito ? c.b : c.f;
      if (colunas[i].direita) aDireita(c, v, x + larguras[i] - 6, c.y - 11.5, 8.5, fonte);
      else texto(c, v, x + 6, c.y - 11.5, 8.5, fonte, TINTA, larguras[i] - 12);
      x += larguras[i];
    });
    c.page.drawLine({ start: { x: MARGEM, y: c.y - 16 }, end: { x: MARGEM + total, y: c.y - 16 }, thickness: 0.4, color: LINHA });
    c.y -= 16;
  });
  c.y -= 6;
}

export async function gerarPdfRelatorio(d: RelatorioDados): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(textoSeguro(`Relatório ${d.periodo.rotulo} · ${d.negocio}`));
  doc.setAuthor(textoSeguro(d.negocio));
  doc.setCreator("Painel Tayssa Farias");
  const f = await doc.embedFont(StandardFonts.Helvetica);
  const b = await doc.embedFont(StandardFonts.HelveticaBold);
  const page = doc.addPage([A4.w, A4.h]);
  const c: Ctx = { doc, page, y: A4.h, f, b, paginas: [page], rodape: `${d.negocio} · ${d.periodo.rotulo}` };
  // o modelo do repasse (17/11/2026): a cliente paga no salão e a Larissa repassa a parte da Tayssa por quinzena
  const r = resumoDoRelatorio(d.linhas, d.periodo.de, d.periodo.ate);
  const pctT = r.pctTayssa ?? 70;

  // cabeçalho vinho com o fio dourado
  page.drawRectangle({ x: 0, y: A4.h - 104, width: A4.w, height: 104, color: VINHO });
  page.drawRectangle({ x: 0, y: A4.h - 107, width: A4.w, height: 3, color: OURO });
  texto(c, d.negocio, MARGEM, A4.h - 46, 21, b, BRANCO);
  texto(c, "Relatório de atendimentos e repasse", MARGEM, A4.h - 66, 10.5, f, ROSA);
  aDireita(c, d.periodo.rotulo, A4.w - MARGEM, A4.h - 46, 12.5, b, BRANCO);
  aDireita(c, d.periodo.de === d.periodo.ate ? dataBr(d.periodo.de) : `${dataBr(d.periodo.de)} a ${dataBr(d.periodo.ate)}`, A4.w - MARGEM, A4.h - 63, 9.5, f, ROSA);
  const gerado = new Date(d.geradoEm);
  const geradoTxt = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(gerado);
  aDireita(c, `Gerado em ${geradoTxt}`, A4.w - MARGEM, A4.h - 80, 8.5, f, ROSA);
  c.y = A4.h - 112;

  titulo(c, "Resumo");
  caixas(c, [
    { rotulo: "Atendimentos realizados", valor: String(r.atendimentos) },
    { rotulo: "Faturamento", valor: brl(r.faturamento) },
    { rotulo: `Parte da Tayssa (${pct(pctT)})`, valor: brl(r.tayssa) },
    { rotulo: `Parte da ${d.larissa} (${pct(Math.round((100 - pctT) * 10) / 10)})`, valor: brl(r.larissa) },
  ]);
  espaco(c, 14);
  texto(c, "As clientes pagam no salão (Pix ou maquininha). A parte da Tayssa é repassada por quinzena.", MARGEM, c.y - 2, 8.5, f, MUDO);
  c.y -= 16;

  titulo(c, "Repasse para a Tayssa");
  tabela(
    c,
    [
      { rotulo: "Quinzena", largura: 2.1 },
      { rotulo: "Dias", largura: 1.3 },
      { rotulo: "Atendimentos", largura: 1.05, direita: true },
      { rotulo: "Faturamento", largura: 1.25, direita: true },
      { rotulo: "Repasse", largura: 1.2, direita: true },
      { rotulo: "Data do repasse", largura: 1.3, direita: true },
    ],
    [
      ...r.repasses.map((q) => ({
        valores: [q.nome, `${dataBr(q.inicio).slice(0, 5)} a ${dataBr(q.fim).slice(0, 5)}`, String(q.atendimentos), brl(q.faturamento), brl(q.tayssa), dataBr(q.repasseEm)],
      })),
      ...(r.repasses.length > 1 ? [{ valores: ["Total", "", String(r.atendimentos), brl(r.faturamento), brl(r.tayssa), ""], negrito: true }] : []),
    ],
  );

  titulo(c, "Atendimentos");
  if (d.linhas.length) {
    tabela(
      c,
      [
        { rotulo: "Data", largura: 1.05 },
        { rotulo: "Cliente", largura: 1.3 },
        { rotulo: "Serviço", largura: 2.5 },
        { rotulo: "Valor", largura: 1.05, direita: true },
        { rotulo: "Tayssa", largura: 1, direita: true },
        { rotulo: d.larissa, largura: 1, direita: true },
      ],
      d.linhas.map((l) => ({
        valores: [`${dataBr(l.data).slice(0, 5)}${l.hora ? ` ${l.hora}` : ""}`, l.cliente, l.servico, l.valor != null ? brl(l.valor) : "-", brl(l.tayssa), brl(l.larissa)],
      })),
    );
  } else {
    espaco(c, 14);
    texto(c, "Nenhum atendimento realizado neste período.", MARGEM, c.y - 4, 9, f, MUDO);
    c.y -= 14;
  }

  // rodapé de cada página: o negócio, o período e a página
  c.paginas.forEach((p, i) => {
    const t = textoSeguro(`${c.rodape}  ·  página ${i + 1} de ${c.paginas.length}`);
    p.drawLine({ start: { x: MARGEM, y: 30 }, end: { x: A4.w - MARGEM, y: 30 }, thickness: 0.5, color: LINHA });
    p.drawText(t, { x: MARGEM, y: 18, size: 7.5, font: f, color: MUDO });
    // a flor da casa, discreta: quatro pétalas douradas
    const cx = A4.w - MARGEM - 4;
    const cy = 21;
    for (const [dx, dy] of [
      [0, 3],
      [0, -3],
      [3, 0],
      [-3, 0],
    ]) {
      p.drawCircle({ x: cx + dx, y: cy + dy, size: 2.2, color: OURO, opacity: 0.8 });
    }
    p.drawCircle({ x: cx, y: cy, size: 1.3, color: VINHO });
  });

  return doc.save();
}
