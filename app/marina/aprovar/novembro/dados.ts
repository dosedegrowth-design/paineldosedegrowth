/**
 * LINK 3 — estampas novas (Onça, Tijolo, Rei Rainha, Paraíso), pasta do
 * Drive "1UfKYWGtjE4zXccBIrUrCGPb22jJVYLoN", recebida em 24/11/2026.
 *
 * AS LEGENDAS SÃO AS DELAS, copiadas do PDF legendas-estampas-novas-dez-26.pdf
 * que veio na mesma pasta, na ordem das páginas. Nada escrito por nós.
 * O nome da peça e da estampa sai do nome do arquivo e do PDF, que batem.
 *
 * Formatos: a pasta "Reels/Story" tem as 10 fotos em 9:16 e a pasta
 * "Carrossel" tem 6 em 4:5. As outras 4 (Chemise e Calça Onça, Camisa T
 * Tijolo, Caftan e Camisa Ana Rei Rainha) só vieram em 9:16: o Feed delas
 * é um recorte nosso da mesma foto, a partir do topo, sem cortar cabeça.
 * O campo CONFERIR avisa isso no card.
 *
 * 25/11 (Lucas: "peça nenhuma pode cortar a cabeça"): 9 fotos tinham a cabeça
 * na borda. Fundo estendido por IA (nano-banana-2) só fora da foto; a foto
 * original foi colada por cima, sem mudar roupa nem modelo.
 */

import type { AnuncioNovo } from "@/lib/marina/aprovar";

const D = "/marina/aprovar/novembro";
const BOTAO = "Comprar agora";

const faz = (
  id: string,
  peca: string,
  tipo: AnuncioNovo["tipo"],
  titulo: string,
  legenda: string,
): AnuncioNovo => ({
  id,
  peca,
  tipo,
  titulo,
  texto: `${peca}\n\n${legenda}`,
  botao: BOTAO,
  feed: `${D}/${id}__45.jpg`,
  reels: `${D}/${id}__916.jpg`,
});

export const NOVOS: AnuncioNovo[] = [
  // ---- Onça (páginas 1 a 3 do PDF) ----
  faz("onca-camisa-t-saia-degrau", "Camisa T Onça e Saia Degrau Onça", "camisa", "ONÇA",
    "Feito 100% seda a Camisa T Onça e Saia degrau tem design exclusivo com o toque Marina Saleme."),
  faz("onca-regata-saia-degrau", "Regata e Saia Degrau Onça", "outro", "ONÇA",
    "Feminino e atemporal, a onça volta para o verão. Regata e Saia Degrau Onça 100% seda perfeitos para qualquer hora."),
  faz("onca-chemise-calca", "Chemise Onça e Calça Onça", "vestido", "ONÇA",
    "O animal print nunca sai de moda e está com nova cara no Chemise Onça + Calça Onça 100% linho, perfeito para viver o verão."),
  // ---- Tijolo (páginas 4 a 7) ----
  faz("tijolo-camisa-t", "Camisa T Tijolo", "camisa", "TIJOLO",
    "A Camisa T na estampa Tijolo. Feita 100% em seda com modelagem moderna fora do básico, sem perder elegância."),
  faz("tijolo-vestido-asa", "Vestido Asa Tijolo", "vestido", "TIJOLO",
    "Versátil e elegante, Vestido Asa Tijolo feito 100% seda tem modelagem exclusiva com o DNA Marina Saleme."),
  faz("tijolo-camisa-ana", "Camisa Ana Tijolo", "camisa", "TIJOLO",
    "Uma queridinha da marca: Camisa Ana na estampa Tijolo. Feita 100% em seda com a estampa exclusiva."),
  faz("tijolo-vestido-luiza", "Vestido Luiza Tijolo", "vestido", "TIJOLO",
    "O vestido perfeito para o verão, 100% seda, o Vestido Luiza Tijolo tem o shape moderno para todas as horas."),
  // ---- Rei Rainha (páginas 8 e 9) ----
  faz("rei-rainha-caftan", "Caftan Rei Rainha", "vestido", "REI RAINHA",
    "O conforto do Caftan Rei Rainha 100% seda, faz dele o modelo para toda hora."),
  faz("rei-rainha-camisa-ana", "Camisa Ana Rei Rainha", "camisa", "REI RAINHA",
    "Camisa clássica Ana na estampa Rei Rainha. Feita 100% em seda com estampa exclusiva."),
  // ---- Paraíso (página 10) ----
  faz("paraiso-top-lele", "Top Lelê Paraíso", "outro", "PARAÍSO",
    "Top Lelê estampa Paraíso, modelo único com mangas amplas, fora do óbvio, mas com a elegância do 100% seda."),
];

const RECORTE = "O Feed é um recorte nosso da foto de Reels (essa veio só em 9:16). Se preferirem outra foto para o Feed, digam no comentário.";

const FUNDO = (onde: string) =>
  `Na foto ${onde}, a cabeça encostava na borda. Aumentamos só o fundo acima dela para não cortar; a roupa e a modelo são a foto original.`;

/** Avisos que aparecem em laranja no card. */
export const CONFERIR: Record<string, string> = {
  "onca-chemise-calca": RECORTE,
  "tijolo-camisa-t": `${RECORTE} ${FUNDO("de Feed e na de Reels")}`,
  "rei-rainha-caftan": RECORTE,
  "rei-rainha-camisa-ana": `${RECORTE} ${FUNDO("de Feed e na de Reels")}`,
  "onca-regata-saia-degrau": FUNDO("de Feed"),
  "tijolo-camisa-ana": FUNDO("de Feed e na de Reels"),
  "tijolo-vestido-asa": FUNDO("de Feed"),
  "tijolo-vestido-luiza": FUNDO("de Feed"),
};

export const TODOS = NOVOS.map((a) => ({ id: a.id, nome: a.peca }));
