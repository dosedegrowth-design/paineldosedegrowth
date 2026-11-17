/**
 * Relatórios do painel (Lucas, 16/11/2026: "no painel tem que ter relatórios
 * para ela baixar os comprovantes e enviar para a Larissa"). Os comprovantes
 * do sinal de um mês: a lista, um .zip com todos os arquivos e a planilha.
 * Puro (sem banco, sem Next) para ser testado.
 */

const MESES = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

/** "2026-11" válido (mês de 01 a 12) */
export function mesValido(mes: string | null | undefined): mes is string {
  return Boolean(mes && /^\d{4}-(0[1-9]|1[0-2])$/.test(mes));
}

/** "2026-11" → "novembro de 2026" */
export function mesLegivel(mes: string): string {
  const [a, m] = mes.split("-").map(Number);
  return `${MESES[(m ?? 1) - 1]} de ${a}`;
}

/** O mês ao lado: -1 = o anterior, +1 = o seguinte ("2026-01" − 1 = "2025-12") */
export function outroMes(mes: string, passo: number): string {
  const [a, m] = mes.split("-").map(Number);
  const total = a * 12 + (m - 1) + passo;
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, "0")}`;
}

/**
 * O começo e o fim do mês em instantes (horário de Brasília, UTC−3): o
 * comprovante das 22h do dia 30 é do mês 30, não do seguinte.
 */
export function limitesDoMes(mes: string): { de: string; ate: string } {
  return { de: `${mes}-01T00:00:00-03:00`, ate: `${outroMes(mes, 1)}-01T00:00:00-03:00` };
}

/** Qualquer período (dia, semana, personalizado): do começo do primeiro dia ao começo do dia seguinte ao último. */
export function limitesDoPeriodo(de: string, ate: string): { de: string; ate: string } {
  const [a, m, d] = ate.split("-").map(Number);
  const seguinte = new Date(Date.UTC(a, m - 1, d + 1)).toISOString().slice(0, 10);
  return { de: `${de}T00:00:00-03:00`, ate: `${seguinte}T00:00:00-03:00` };
}

/** Sem acento e sem nada que atrapalhe num nome de arquivo: "Manutenção Mega Inglês" → "Manutencao-Mega-Ingles" */
export function paraNomeDeArquivo(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export type ComprovanteDoRelatorio = {
  id: string;
  /** quando ela anexou (instante) */
  enviadoEm: string;
  cliente: string;
  whatsapp: string | null;
  servico: string;
  /** "AAAA-MM-DD" e "HH:MM" do horário */
  dia: string;
  hora: string;
  situacao: string;
  /** valor dos serviços, quando cadastrado */
  valor: number | null;
  /** extensão do arquivo ("jpg", "pdf"…) */
  ext: string;
};

/**
 * O nome de cada arquivo dentro do .zip: o dia do horário, a cliente e o
 * serviço, para a Larissa achar sem abrir ("2026-11-12_10h_Mayara_Volume-ingles.jpg").
 * Repetido ganha um número no fim.
 */
export function nomesDosArquivos(lista: readonly ComprovanteDoRelatorio[]): string[] {
  const vistos = new Map<string, number>();
  return lista.map((c) => {
    const base = [c.dia, c.hora.replace(":", "h").replace(/h00$/, "h"), paraNomeDeArquivo(c.cliente), paraNomeDeArquivo(c.servico)]
      .filter(Boolean)
      .join("_");
    const n = (vistos.get(base) ?? 0) + 1;
    vistos.set(base, n);
    return `${base}${n > 1 ? `-${n}` : ""}.${c.ext}`;
  });
}

/** Um campo da planilha: entre aspas quando precisa (ponto e vírgula, aspas, quebra de linha). */
function campo(v: string | number | null | undefined): string {
  const t = v == null ? "" : String(v);
  return /[";\n\r]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
}

/** "170.5" → "170,50" (o Excel em português lê vírgula) */
function dinheiro(v: number | null): string {
  return v == null ? "" : v.toFixed(2).replace(".", ",");
}

/** "AAAA-MM-DD" → "DD/MM/AAAA" */
function dataBr(iso: string): string {
  const [a, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${a}`;
}

/**
 * A planilha (CSV com ponto e vírgula e o BOM do UTF-8: o Excel em
 * português abre direto, com os acentos certos). Uma linha por comprovante,
 * com o nome do arquivo que está no .zip.
 */
export function planilhaDosComprovantes(
  lista: readonly ComprovanteDoRelatorio[],
  sinal: number,
  enviadoLegivel: (instante: string) => string,
): string {
  const nomes = nomesDosArquivos(lista);
  const linhas = [
    ["Comprovante enviado em", "Cliente", "WhatsApp", "Serviço", "Dia do horário", "Horário", "Situação", "Sinal (R$)", "Valor dos serviços (R$)", "Arquivo no .zip"],
    ...lista.map((c, i) => [
      enviadoLegivel(c.enviadoEm),
      c.cliente,
      c.whatsapp ?? "",
      c.servico,
      dataBr(c.dia),
      c.hora,
      c.situacao,
      dinheiro(sinal),
      dinheiro(c.valor),
      nomes[i],
    ]),
  ];
  return `﻿${linhas.map((l) => l.map(campo).join(";")).join("\r\n")}\r\n`;
}

// ------------------------------------------------------------
// .zip sem compressão (comprovante já vem comprimido: foto e PDF), sem
// dependência de fora. Formato "store" com o nome em UTF-8.
// ------------------------------------------------------------

const TABELA_CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

export function crc32(dados: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < dados.length; i++) c = TABELA_CRC[(c ^ dados[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/** data e hora no formato do MS-DOS que o .zip usa */
function dataDos(d: Date): { hora: number; dia: number } {
  return {
    hora: (d.getHours() << 11) | (d.getMinutes() << 5) | Math.floor(d.getSeconds() / 2),
    dia: (Math.max(0, d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate(),
  };
}

export type ArquivoDoZip = { nome: string; dados: Uint8Array; data?: Date };

/**
 * Monta o .zip aos pedaços, um arquivo de cada vez: a resposta sai em
 * fluxo (a Vercel corta resposta inteira acima de 4,5 MB, e um mês de
 * comprovantes passa disso fácil) e só um arquivo fica na memória.
 */
export function montadorDeZip() {
  const enc = new TextEncoder();
  const central: Uint8Array[] = [];
  let posicao = 0;
  return {
    /** Os pedaços de um arquivo, na ordem: o cabeçalho e os dados. */
    arquivo(a: ArquivoDoZip): Uint8Array[] {
      const nome = enc.encode(a.nome);
      const crc = crc32(a.dados);
      const { hora, dia } = dataDos(a.data ?? new Date());
      const local = new Uint8Array(30 + nome.length);
      const vl = new DataView(local.buffer);
      vl.setUint32(0, 0x04034b50, true);
      vl.setUint16(4, 20, true); // versão
      vl.setUint16(6, 0x0800, true); // nome em UTF-8
      vl.setUint16(8, 0, true); // sem compressão
      vl.setUint16(10, hora, true);
      vl.setUint16(12, dia, true);
      vl.setUint32(14, crc, true);
      vl.setUint32(18, a.dados.length, true);
      vl.setUint32(22, a.dados.length, true);
      vl.setUint16(26, nome.length, true);
      vl.setUint16(28, 0, true);
      local.set(nome, 30);

      const c = new Uint8Array(46 + nome.length);
      const vc = new DataView(c.buffer);
      vc.setUint32(0, 0x02014b50, true);
      vc.setUint16(4, 20, true);
      vc.setUint16(6, 20, true);
      vc.setUint16(8, 0x0800, true);
      vc.setUint16(10, 0, true);
      vc.setUint16(12, hora, true);
      vc.setUint16(14, dia, true);
      vc.setUint32(16, crc, true);
      vc.setUint32(20, a.dados.length, true);
      vc.setUint32(24, a.dados.length, true);
      vc.setUint16(28, nome.length, true);
      vc.setUint32(42, posicao, true);
      c.set(nome, 46);
      central.push(c);
      posicao += local.length + a.dados.length;
      return [local, a.dados];
    },
    /** O fim do .zip: o índice com todos os arquivos. */
    fim(): Uint8Array {
      const tamanho = central.reduce((s, c) => s + c.length, 0);
      const tudo = new Uint8Array(tamanho + 22);
      let i = 0;
      for (const c of central) {
        tudo.set(c, i);
        i += c.length;
      }
      const vf = new DataView(tudo.buffer, i);
      vf.setUint32(0, 0x06054b50, true);
      vf.setUint16(8, central.length, true);
      vf.setUint16(10, central.length, true);
      vf.setUint32(12, tamanho, true);
      vf.setUint32(16, posicao, true);
      return tudo;
    },
  };
}

/** Os arquivos num .zip de uma vez. Nomes repetidos devem chegar já diferentes (`nomesDosArquivos`). */
export function criarZip(arquivos: readonly ArquivoDoZip[]): Uint8Array {
  const zip = montadorDeZip();
  const partes = [...arquivos.flatMap((a) => zip.arquivo(a)), zip.fim()];
  const tudo = new Uint8Array(partes.reduce((s, p) => s + p.length, 0));
  let i = 0;
  for (const p of partes) {
    tudo.set(p, i);
    i += p.length;
  }
  return tudo;
}
