/**
 * LINK 2 — os anúncios novos, só com as fotos da pasta do Drive
 * "146Mpoob0R5J4FwzDN6-6vLqbSKU9GdHv".
 *
 * AS LEGENDAS SÃO AS DA BIA, copiadas dos dois PDFs que vieram na mesma
 * pasta (camisas-ultimas-pecas.pdf e chemises-ultimas-pecas.pdf). Nada
 * aqui é escrito por nós (Lucas, 12/11/2026: "o PDF que a Bia enviou já
 * tem as legendas corretas"). A primeira versão descrevia a foto por
 * conta própria e errou: trocou nome de produto e chamou de calça um pano
 * amarrado na cintura. Só foram corrigidos os acentos que vieram tortos
 * no PDF ("Condiçòes" → "Condições", "fluído" → "fluido").
 *
 * COMO CADA FOTO FOI AMARRADA AO PRODUTO, em ordem de força da prova:
 *  1. arquivo idêntico ao da loja (a Bia tirou a foto do próprio produto
 *     na Shopify): Camisa Ana Pied de Poule Preto e Vestido de Amarrar Geo;
 *  2. nome do arquivo bate com o nome do produto na loja;
 *  3. estampa igual à de um anúncio cujo nome a API do Meta confirma
 *     (Camisa Ana Tribeca).
 * Onde a prova não fecha, o campo `conferir` diz o que falta. Não
 * inventamos nome.
 *
 * As 17 fotos foram olhadas uma a uma: todas têm modelo, nenhuma é still,
 * nenhuma é gerada por IA. Nada foi acrescentado de fora da pasta.
 */

import type { AnuncioNovo, CarrosselNovo } from "@/lib/marina/aprovar";

const N = "/marina/aprovar/novos";
const BOTAO = "Comprar agora";
const FECHO = "Condições especiais, aproveite, últimas peças.";

/** Monta o texto do anúncio: nome da peça e a legenda da Bia. */
const texto = (peca: string, legenda: string) => `${peca}\n\n${legenda}\n\n${FECHO}`;

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
  texto: texto(peca, legenda),
  botao: BOTAO,
  feed: `${N}/${id}__45.jpg`,
  reels: `${N}/${id}__916.jpg`,
});

export const NOVOS: AnuncioNovo[] = [
  // ---- camisas, legendas de camisas-ultimas-pecas.pdf ----
  faz("camisas-ultimas-pecas-jpg", "Camisa Ana Tribeca", "camisa", "TRIBECA",
    "100% seda, estampa exclusiva, perfeita caimento leve e elegante."),
  faz("camisa-ana-casablanca-laranja-jpg", "Camisa Ana Casablanca", "camisa", "CASABLANCA",
    "100% seda, corte clássico e atemporal."),
  faz("camisa-ana-riviera-jpg", "Camisa Ana Riviera", "camisa", "RIVIERA",
    "100% seda, estampa exclusiva, perfeita para toda ocasião, leve e elegante."),
  faz("camisa-ana-damas-jpg", "Camisa Ana Damas", "camisa", "DAMAS",
    "100% seda, estampa exclusiva, perfeita caimento leve e elegante."),
  faz("camisa-t-casablanca-laranja-jpg", "Camisa T Casablanca", "camisa", "CASABLANCA",
    "100% seda, estampa exclusiva, perfeita, caimento leve e elegante."),
  faz("camisa-ana-copacabana-png", "Camisa Ana Copacabana", "camisa", "COPACABANA",
    "100% seda, estampa exclusiva, perfeita, caimento leve e elegante."),
  faz("camisa-t-linha-branca-png", "Camisa T Linha", "camisa", "LINHA",
    "100% seda, estampa elegante e caimento sofisticado."),
  faz("camisa-t-atenas-amarela-jpg", "Camisa T Atenas", "camisa", "ATENAS",
    "100% seda, estampa elegante e atemporal."),

  // ---- não está no PDF: foto nova, subida em 12/11, idêntica à da loja ----
  faz("camisa-ana-pied-de-poule-preto-1-jpg", "Camisa Ana Pied de Poule Preto", "camisa", "PIED DE POULE",
    "100% seda, estampa exclusiva, caimento leve e elegante."),

  // ---- vestidos e chemises, legendas de chemises-ultimas-pecas.pdf ----
  faz("2e9045c9-f102-4c16-b0a3-72749d5baa67-jpg", "Vestido de Amarrar Geo", "vestido", "GEO",
    "100% seda, perfeito para o verão, caimento leve e moderno."),
  faz("vestido-de-amarrar-pied-poule-verde-jpg", "Vestido de Amarrar Pied Poule", "vestido", "PIED DE POULE",
    "100% seda, perfeito para o verão, tecido fluido e elegante."),
  faz("chemise-miriam-ultimas-pecas-jpg", "Chemise Miriam Atenas", "vestido", "ATENAS",
    "100% linho, caimento leve e elegante."),
  faz("chemises-ultimas-pecas-jpg", "Vestido Asa Mikonos", "vestido", "MIKONOS",
    "100% seda, corte elegante e estampa exclusiva."),
  faz("chemises-ultimas-pecas-png", "Vestido Princesa Bastão Imperador", "vestido", "BASTÃO IMPERADOR",
    "100% seda, corte feminino e estampa exclusiva."),
  faz("marina-saleme-056-jpg", "Chemise Stripes", "vestido", "STRIPES",
    "100% viscose, caimento leve pra todos os momentos."),
  faz("chemises-ultimas-pecas-1-png", "Chemise Miriam Atenas", "vestido", "ATENAS",
    "100% linho, caimento leve e elegante."),
  faz("image-38629060-1160-4e97-90c7-7feeeb40306c-jpg", "Vestido Princesa Bastão Imperador", "vestido", "BASTÃO IMPERADOR",
    "100% seda, corte feminino e estampa exclusiva."),
];

/**
 * O que ainda precisa da palavra da Bia. Aparece na tela, para elas
 * corrigirem no comentário em vez de a gente chutar.
 */
export const CONFERIR: Record<string, string> = {
  "camisa-t-linha-branca-png":
    "O PDF escreve Camisa T Linha; na loja o produto é Camisa Ana Linha. Qual é o certo?",
  "chemises-ultimas-pecas-jpg":
    "Esta é a mesma peça da foto da Chemise Miriam Atenas, mas é a foto que a loja usa no Vestido Asa Mikonos. Qual dos dois é?",
  "chemises-ultimas-pecas-1-png":
    "Chemise amarela lisa: confirmem se é a Chemise Miriam Atenas (a do PDF é 100% linho).",
  "image-38629060-1160-4e97-90c7-7feeeb40306c-jpg":
    "Mesma estampa do Vestido Princesa Bastão Imperador, mas aqui só aparece o tecido aberto. Confirmem a peça.",
  "camisa-ana-pied-de-poule-preto-1-jpg":
    "Esta não estava no PDF: a foto é a mesma do produto Camisa Ana Pied de Poule Preto na loja. A legenda foi escrita no padrão das outras.",
};

export const CARROSSEIS: CarrosselNovo[] = [
  {
    id: "carrossel-camisas",
    nome: "Carrossel · Camisas",
    titulo: "Marina Saleme Estamparia",
    botao: BOTAO,
    texto: `Camisas em 100% seda, estampa exclusiva, caimento leve e elegante.\n\n${FECHO}\n\nArraste para ver todas.`,
    cards: [
      { src: `${N}/camisas-ultimas-pecas-jpg__45.jpg`, nome: "Camisa Ana Tribeca" },
      { src: `${N}/camisa-ana-casablanca-laranja-jpg__45.jpg`, nome: "Camisa Ana Casablanca" },
      { src: `${N}/camisa-ana-riviera-jpg__45.jpg`, nome: "Camisa Ana Riviera" },
      { src: `${N}/camisa-ana-damas-jpg__45.jpg`, nome: "Camisa Ana Damas" },
      { src: `${N}/camisa-ana-copacabana-png__45.jpg`, nome: "Camisa Ana Copacabana" },
      { src: `${N}/camisa-ana-pied-de-poule-preto-1-jpg__45.jpg`, nome: "Camisa Ana Pied de Poule Preto" },
      { src: `${N}/camisa-t-casablanca-laranja-jpg__45.jpg`, nome: "Camisa T Casablanca" },
      { src: `${N}/camisa-t-atenas-amarela-jpg__45.jpg`, nome: "Camisa T Atenas" },
      { src: `${N}/camisa-t-linha-branca-png__45.jpg`, nome: "Camisa T Linha" },
    ],
  },
  {
    id: "carrossel-vestidos",
    nome: "Carrossel · Vestidos e chemises",
    titulo: "Marina Saleme Estamparia",
    botao: BOTAO,
    texto: `Vestidos e chemises, cada um em uma estampa exclusiva.\n\n${FECHO}\n\nArraste para ver.`,
    cards: [
      { src: `${N}/2e9045c9-f102-4c16-b0a3-72749d5baa67-jpg__45.jpg`, nome: "Vestido de Amarrar Geo" },
      { src: `${N}/vestido-de-amarrar-pied-poule-verde-jpg__45.jpg`, nome: "Vestido de Amarrar Pied Poule" },
      { src: `${N}/chemise-miriam-ultimas-pecas-jpg__45.jpg`, nome: "Chemise Miriam Atenas" },
      { src: `${N}/chemises-ultimas-pecas-png__45.jpg`, nome: "Vestido Princesa Bastão Imperador" },
      { src: `${N}/marina-saleme-056-jpg__45.jpg`, nome: "Chemise Stripes" },
      { src: `${N}/chemises-ultimas-pecas-jpg__45.jpg`, nome: "Vestido Asa Mikonos" },
    ],
  },
];

export const TODOS_NOVOS = [
  ...NOVOS.map((a) => ({ id: a.id, nome: a.peca })),
  ...CARROSSEIS.map((c) => ({ id: c.id, nome: c.nome })),
];
