/**
 * Gera o INDICE-CRIATIVOS.txt de uma lancha, a partir do criativos.json.
 * É o arquivo que vai junto dos PNGs no Drive, pra quem for subir a campanha
 * não precisar abrir o repositório pra achar título, botão e textos.
 *
 *   node indice.mjs --lancha=24-pes
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const MOTOR = path.dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => a.replace(/^--/, '').split('='))
);
if (!args.lancha) {
  console.error('falta --lancha=<pasta>');
  process.exit(1);
}
const LANCHA = path.join(MOTOR, '..', String(args.lancha));
const d = JSON.parse(await readFile(path.join(LANCHA, 'criativos.json'), 'utf8'));

/** O .txt vai pro Drive e é aberto no Bloco de Notas do Windows, que ainda
 *  erra acento em arquivo sem BOM. Sai sem acento, de propósito. */
const semAcento = (s) =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    .replace(/[–—]/g, '-');

const L = [];
const p = (s = '') => L.push(semAcento(s));

const precos = d.precos_em_teste || {};
const chavesPreco = Object.keys(precos);
const nFeed = d.criativos.reduce((t, c) => {
  const modos = c.modos || ['forte'];
  return t + modos.reduce((s, m) => s + (m === 'sobrio' ? 1 : chavesPreco.length), 0);
}, 0);

p(`VEM PRA PARATY - ${(d.titulo_indice || args.lancha).toUpperCase()}`);
p('Criativos de Meta Ads - setembro de 2026 - Dose de Growth');
p('');
p(`${nFeed * 2} arquivos: ${nFeed} em Feed 1080x1350 e ${nFeed} em Story 1080x1920.`);
p('');
if (d.ficha) {
  p('A LANCHA');
  for (const linha of d.ficha) p('  ' + linha);
  p('');
}
p('OS TRES REGISTROS');
p('  sobrio   - serifada leve sobre a foto, sem preco e sem CTA desenhado');
p('  forte    - bloco navy com preco, lotacao e CTA. Contraste alto');
p('  roteiro  - as paradas do dia numeradas, com preco e CTA');
p('');
p('AS VARIANTES DE PRECO');
for (const [k, v] of Object.entries(precos)) p(`  ${k.padEnd(8)}- ${v}`);
p('  O registro sobrio nao tem preco na arte, entao nao tem variante.');
p('');
p('='.repeat(64));
p(`AS ${d.criativos.length} PECAS`);
p('='.repeat(64));

for (const c of d.criativos) {
  p('');
  const n = String(c.n).padStart(2, '0');
  p(`${n}. ${String(c.titulo_peca || c.key).toUpperCase()}   [${c.funil || '-'}]  publico: ${c.publico || '-'}`);
  if (c.hipotese) p(`    hipotese: ${c.hipotese}`);
  p(`    foto: ${c.foto}   registros: ${(c.modos || ['forte']).join(', ')}`);
  if (c.frase) p(`    frase na arte: ${c.frase.replace(/<\/?em>/g, '').replace(/\n/g, ' / ')}`);
  if (c.apoio) p(`    linha de apoio: ${c.apoio}`);
  if (c.paradas?.length) {
    p('    paradas:');
    c.paradas.forEach((s, i) => p(`      ${String(i + 1).padStart(2, '0')}. ${s}`));
  }
  p(`    titulo do anuncio: ${c.titulo || '-'}`);
  p(`    botao: ${c.cta || '-'}`);
  p('    textos principais para testar:');
  (c.textos || []).forEach((t, i) => {
    p(`      ${i + 1}) [${t.rotulo || '-'}] ${t.primeira_linha ?? t}`);
    String(t.resto || '')
      .split('\n')
      .filter(Boolean)
      .forEach((l) => p(`         ${l}`));
  });
}

p('');
p('='.repeat(64));
p('COMO NOMEIA O ARQUIVO');
p('='.repeat(64));
p(`  ${d.prefixo}-<numero>-<peca>-<registro>[-<preco>]-<formato>.png`);
p(`  ex: ${d.prefixo}-01-${d.criativos[0].key}-forte-${chavesPreco[0] || 'p'}-feed.png`);
p('');

await writeFile(path.join(LANCHA, 'INDICE-CRIATIVOS.txt'), L.join('\r\n'), 'utf8');
console.log(`INDICE-CRIATIVOS.txt gerado em ${args.lancha}/ (${L.length} linhas)`);
