/**
 * As peças que a Bia mandou só em still, a estampa sem modelo, e que
 * precisam de foto para virar anúncio. Estoque conferido na Shopify em
 * 11/11/2026.
 *
 * `foto` é a versão leve que a página mostra; `original` é o arquivo que
 * ela subiu, no tamanho em que chegou, para quem for editar.
 */

const BRIEFING =
  "https://hkjukobqpjezhpxzplpj.supabase.co/storage/v1/object/public/marina-briefing/briefing";
const LOJA = "https://marinasaleme-estamparia.com/products";

export type Peca = {
  nome: string;
  estampa: string;
  estoque: string;
  pecas: number;
  preco: string;
  fotos: string[];
  originais: string[];
  loja: string | null;
  obs?: string;
};

export const FAZER: Peca[] = [
  {
    nome: "Camisa Ana Rei Rainha Listra Vermelha",
    estampa: "Rei e Rainha",
    estoque: "P 4 · M 2 · G 3 · GG 1",
    pecas: 10,
    preco: "R$ 1.150",
    fotos: ["01_CAMISA_ANA_RR_LISTRA_VERMELHA.jpg"],
    originais: [`${BRIEFING}/0fd692ba-aefd-44cc-85a3-c341bb45321b.jpg`],
    loja: `${LOJA}/camisa-ana-rei-rainha-listra-vermelha`,
  },
  {
    nome: "Camisa T Tijolo",
    estampa: "Tijolo",
    estoque: "P 6 · M 3",
    pecas: 9,
    preco: "R$ 1.575",
    fotos: ["02_CAMISA_T_TIJOLO_a.jpg", "02_CAMISA_T_TIJOLO_b.jpg"],
    originais: [
      `${BRIEFING}/0637c14b-bcf7-4e36-9efb-47744adb7a09.png`,
      `${BRIEFING}/74eef969-67c7-40f3-b93b-a85b238e6932.png`,
    ],
    loja: `${LOJA}/camisa-t-tijolo`,
    obs: "O G zerou desde 31/10.",
  },
  {
    nome: "Camisa T Rei Rainha",
    estampa: "Rei e Rainha",
    estoque: "P 2 · M 1 · G 2 · GG 2",
    pecas: 7,
    preco: "R$ 1.190",
    fotos: ["03_CAMISA_T_REI_RAINHA.jpg"],
    originais: [`${BRIEFING}/a754b00d-eaf5-4a8c-bd24-4c2033a4236b.png`],
    loja: `${LOJA}/camisa-t-tijolo-copia`,
  },
  {
    nome: "Saia Prega Damas",
    estampa: "Damas",
    estoque: "P 3 · M 2",
    pecas: 5,
    preco: "R$ 1.008",
    fotos: ["93_SAIA_PREGA_DAMAS_loja.jpg"],
    originais: [
      "https://cdn.shopify.com/s/files/1/0272/7929/4543/files/MARINASALEME7.png?v=1728318928",
    ],
    loja: `${LOJA}/saia-prega-damas`,
    obs: "Não veio still dela no briefing. Esta é a foto da loja, só para mostrar a estampa: uma das imagens enviadas era a Camisa Ana repetida e a outra tinha selo de IA.",
  },
  {
    nome: "Saia Envelope Paraíso Vermelho",
    estampa: "Paraíso",
    estoque: "tamanho único",
    pecas: 5,
    preco: "R$ 1.920",
    fotos: ["04_SAIA_ENVELOPE_PARAISO.jpg"],
    originais: [`${BRIEFING}/be94d0a3-385a-448b-973f-307499524610.jpg`],
    loja: `${LOJA}/saia-envelope-ipanema-rosa-copia`,
  },
  {
    nome: "Caftan Rei Rainha",
    estampa: "Rei e Rainha",
    estoque: "tamanho único",
    pecas: 4,
    preco: "R$ 2.500",
    fotos: ["05_CAFTAN_REI_RAINHA.jpg"],
    originais: [`${BRIEFING}/591d16c7-800d-4793-aaf7-f1c7542d576c.png`],
    loja: `${LOJA}/cafta-iguana-amarelo`,
  },
  {
    nome: "Vestido Luiza Rei Rainha",
    estampa: "Rei e Rainha",
    estoque: "P 1 · M 1 · G 1",
    pecas: 3,
    preco: "R$ 1.850",
    fotos: ["06_VESTIDO_LUIZA_REI_RAINHA.jpg"],
    originais: [`${BRIEFING}/bf86718f-7d89-4ca8-a8e4-5f8c91df834a.png`],
    loja: `${LOJA}/vestido-luiza-rei-rainha`,
  },
  {
    nome: "Top Lele Paraíso Vermelho",
    estampa: "Paraíso",
    estoque: "só P",
    pecas: 3,
    preco: "R$ 1.850",
    fotos: ["07_TOP_LELE_PARAISO.jpg"],
    originais: [`${BRIEFING}/276b165f-8c07-45eb-86ce-1b98f9984b9c.png`],
    loja: `${LOJA}/top-lele-paraiso-vermelho`,
    obs: "M e G zeraram desde 31/10. Só sobrou o P para vestir na modelo.",
  },
  {
    nome: "Camisa Jota Rei Rainha Listra Vermelha",
    estampa: "Rei e Rainha",
    estoque: "só G",
    pecas: 3,
    preco: "R$ 1.380",
    fotos: ["08_CAMISA_JOTA_RR_LISTRA.jpg"],
    originais: [`${BRIEFING}/bd48f310-6790-4579-ae16-416550bb6a92.png`],
    loja: `${LOJA}/camisa-jota-rei-rainha-listra-vermelha`,
    obs: "P e M zeraram desde 31/10. Só sobrou o G para vestir na modelo.",
  },
  {
    nome: "Panneau Rei Rainha",
    estampa: "Rei e Rainha",
    estoque: "tamanho único",
    pecas: 1,
    preco: "R$ 1.490",
    fotos: ["09_PANNEAU_REI_RAINHA.jpg"],
    originais: [`${BRIEFING}/09cfaeb6-15f2-404f-a2a9-51081d0cef43.png`],
    loja: `${LOJA}/panneau-rei-rainha`,
  },
];

export const FORA: Peca[] = [
  {
    nome: "Saia Midi Paraíso Preto",
    estampa: "Paraíso",
    estoque: "esgotou",
    pecas: 0,
    preco: "R$ 1.920",
    fotos: ["90_SAIA_MIDI_PARAISO_ESGOTADA.jpg"],
    originais: [`${BRIEFING}/81480716-3226-4599-8dd7-2a78def0fa5d.png`],
    loja: `${LOJA}/saia-midi-paraiso`,
    obs: "Tinha 1 peça em 31/10 e vendeu.",
  },
  {
    nome: "Vestido Clarice Paraíso Preto",
    estampa: "Paraíso",
    estoque: "esgotou",
    pecas: 0,
    preco: "R$ 2.480",
    fotos: ["91_VESTIDO_CLARICE_ESGOTADO.jpg"],
    originais: [`${BRIEFING}/464ef6ca-1019-45e7-b13f-1544149bad6b.png`],
    loja: `${LOJA}/vestido-clarice-para`,
    obs: "Tinha 2 peças em 31/10 e venderam as duas.",
  },
  {
    nome: "Caftan Amélia Paraíso Preto",
    estampa: "Paraíso",
    estoque: "rascunho",
    pecas: 0,
    preco: "R$ 2.750",
    fotos: ["92_CAFTAN_AMELIA_RASCUNHO.jpg"],
    originais: [`${BRIEFING}/95563341-e559-41dc-8845-ed0a6475b2cc.png`],
    loja: null,
    obs: "Continua como rascunho na loja, não está à venda. Só vale fotografar se for publicar.",
  },
];

export const TOTAL_PECAS = FAZER.reduce((s, p) => s + p.pecas, 0);
