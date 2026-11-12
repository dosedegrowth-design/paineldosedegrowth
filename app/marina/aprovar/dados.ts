/**
 * LINK 1 — o que está rodando hoje na conta Marina Saleme - 02
 * (782476046702053). Lido do Meta em 12/11/2026: 56 anúncios ativos que
 * usam 37 criativos distintos, porque os de junho rodam nas duas campanhas
 * ao mesmo tempo. A aprovação é por criativo, que é o que a equipe vê.
 *
 * Gasto e impressões são dos últimos 7 dias, somados quando o mesmo
 * criativo roda em mais de uma campanha.
 *
 * Todas as 51 imagens foram conferidas uma a uma: nenhuma é still, todas
 * têm modelo.
 */

import type { AnuncioNoAr } from "@/lib/marina/aprovar";

const M = "/marina/aprovar/no-ar";
const CRI = "/marina/criativos";

const CAMPANHA_NOV = "Conversão Vendas · Novembro 2026 · Últimas Peças";
const CONJ_NOV = "01 Novembro · Compradoras + RMKT 30d + Lookalike 1%";
const CAMPANHA_JUN = "Tráfego Site · 17/06 e Alcance Ipanema Verão";
const CONJ_JUN = "Bairros Premium · Feed e Mulheres 40-65";

const img = (f: string, p = "4 / 5") =>
  ({ tipo: "imagem", src: `${M}/${f}.jpg`, proporcao: p }) as const;

export const NO_AR: AnuncioNoAr[] = [
  {
    id: "nov-01-sacolao-azul-vestida",
    nome: "01 Sacolão Stripes Azul (modelo vestida)",
    campanha: CAMPANHA_NOV, conjunto: CONJ_NOV, formato: "Feed 4:5",
    texto: "Bolsa de lona 100% algodão com alças de couro, forrada e com bolso interno. Fundo estruturado e botões que regulam a largura. Listras em azul.",
    titulo: "STRIPES", botao: "Comprar agora", gasto: "R$ 2,02", impressoes: "29",
    midia: img("out_sacolao_azul_vestida"),
  },
  {
    id: "nov-02-sacolao-verde",
    nome: "02 Sacolão Stripes Verde",
    campanha: CAMPANHA_NOV, conjunto: CONJ_NOV, formato: "Feed 4:5",
    texto: "Bolsa de lona 100% algodão com alças de couro, forrada e com bolso interno. Fundo estruturado e botões que regulam a largura. Listras em verde, para a praia e para a cidade.",
    titulo: "STRIPES", botao: "Comprar agora", gasto: "R$ 3,42", impressoes: "30",
    midia: img("out_sacolao_verde"),
  },
  {
    id: "nov-03-sacolao-vermelho",
    nome: "03 Sacolão Stripes Vermelho",
    campanha: CAMPANHA_NOV, conjunto: CONJ_NOV, formato: "Feed 4:5",
    texto: "Bolsa de lona 100% algodão com alças de couro, forrada e com bolso interno. Fundo estruturado e botões que regulam a largura. Listras em vermelho.",
    titulo: "STRIPES", botao: "Comprar agora", gasto: "R$ 1,02", impressoes: "15",
    midia: img("out_sacolao_vermelho"),
  },
  {
    id: "nov-04-sacolao-azul",
    nome: "04 Sacolão Stripes Azul",
    campanha: CAMPANHA_NOV, conjunto: CONJ_NOV, formato: "Feed 4:5",
    texto: "Bolsa de lona 100% algodão com alças de couro, forrada e com bolso interno. Fundo estruturado e botões que regulam a largura. Listras em azul.",
    titulo: "STRIPES", botao: "Comprar agora", gasto: "R$ 21,77", impressoes: "184",
    midia: img("out_sacolao_azul"),
  },
  {
    id: "nov-05-lenco-sevilha",
    nome: "05 Lenço Sevilha Rosa",
    campanha: CAMPANHA_NOV, conjunto: CONJ_NOV, formato: "Feed 4:5",
    texto: "O Lenço Sevilha é super versátil: pode ser usado como top, na cintura, no pescoço. Base rosa com a cruz de palmeiras douradas ao centro, panteras e barrado vermelho.",
    titulo: "SEVILHA", botao: "Comprar agora", gasto: "R$ 367,39", impressoes: "1.922",
    midia: img("out_lenco_sevilha"),
  },
  {
    id: "nov-06-camisa-t-ipanema",
    nome: "06 Camisa T Ipanema Marrom",
    campanha: CAMPANHA_NOV, conjunto: CONJ_NOV, formato: "Feed 4:5",
    texto: "A Camisa T tem corte reto e gola careca, com mangas 3/4 e regulador em botão. A estampa Ipanema Marrom é atemporal, e compõe com a Saia Degrau Ipanema Marrom.",
    titulo: "IPANEMA", botao: "Comprar agora", gasto: "R$ 4,07", impressoes: "17",
    midia: img("out_ipanema_marrom"),
  },
  {
    id: "nov-07-carrossel-vitrine",
    nome: "07 Carrossel Vitrine Últimas Peças",
    campanha: CAMPANHA_NOV, conjunto: CONJ_NOV, formato: "Carrossel 1:1 · 10 peças",
    texto: "Últimas peças. São poucas unidades de cada, em seda, linho e algodão.\n\nArraste para ver o que ainda tem.",
    titulo: "Marina Saleme Estamparia", botao: "Comprar agora", gasto: "R$ 11,18", impressoes: "75",
    midia: { tipo: "carrossel", cards: [
      { src: `${M}/car_C1_01_moletom.jpg`, nome: "Moletom Iguana", descricao: "R$ 502,50 · P, M e G" },
      { src: `${M}/car_C1_02_saia_stripes.jpg`, nome: "Saia Stripes Mostarda", descricao: "R$ 944 · do P ao GG" },
      { src: `${M}/car_C1_03_calca_gloria.jpg`, nome: "Calça Glória Azulejo Laranja", descricao: "R$ 1.008 · do P ao GG" },
      { src: `${M}/car_C1_04_tribeca.jpg`, nome: "Camisa Ana Tribeca", descricao: "R$ 952 · G e GG" },
      { src: `${M}/car_C1_05_tata_ourico.jpg`, nome: "Vestido Tata Ouriço", descricao: "R$ 1.240 · M e G" },
      { src: `${M}/car_C1_06_fit_balaozinho.jpg`, nome: "Vestido Fit Balãozinho", descricao: "R$ 1.650 · M e G" },
      { src: `${M}/car_C1_07_copacabana.jpg`, nome: "Camisa Ana Copacabana", descricao: "R$ 952 · M, G e GG" },
      { src: `${M}/car_C1_08_princesa_damas.jpg`, nome: "Vestido Princesa Damas", descricao: "R$ 2.480 · P e G" },
      { src: `${M}/car_C1_09_amarrar_geo.jpg`, nome: "Vestido de Amarrar Geo", descricao: "R$ 1.312,50 · P e M" },
      { src: `${M}/car_C1_10_juliana_verde.jpg`, nome: "Calça Juliana Pied de Poule", descricao: "R$ 760 · P, M e G" },
    ] },
  },
  {
    id: "nov-08-carrossel-camisa-ana",
    nome: "08 Carrossel A Camisa Ana em três estampas",
    campanha: CAMPANHA_NOV, conjunto: CONJ_NOV, formato: "Carrossel 1:1 · 3 peças",
    texto: "A Camisa Ana é o corte clássico da casa: não é larga nem justa, tem o caimento certo. Colarinho e punho, sem bolso na frente.\n\nEm três estampas: Tribeca, Copacabana e Zodíaco.",
    titulo: "Marina Saleme Estamparia", botao: "Comprar agora", gasto: "R$ 44,72", impressoes: "168",
    midia: { tipo: "carrossel", cards: [
      { src: `${M}/car_C2_01_tribeca.jpg`, nome: "Camisa Ana Tribeca", descricao: "100% crepe de chine · R$ 952" },
      { src: `${M}/car_C2_02_copacabana.jpg`, nome: "Camisa Ana Copacabana", descricao: "100% seda · R$ 952" },
      { src: `${M}/car_C2_03_zodiaco.jpg`, nome: "Camisa Ana Zodíaco", descricao: "100% seda · R$ 825" },
    ] },
  },
  {
    id: "nov-09-carrossel-vestidos",
    nome: "09 Carrossel Vestidos de seda",
    campanha: CAMPANHA_NOV, conjunto: CONJ_NOV, formato: "Carrossel 1:1 · 5 peças",
    texto: "Cinco vestidos, cinco estampas, todos em seda.\n\nSão poucas unidades de cada. Arraste para ver.",
    titulo: "Marina Saleme Estamparia", botao: "Comprar agora", gasto: "R$ 23,30", impressoes: "92",
    midia: { tipo: "carrossel", cards: [
      { src: `${M}/car_C3_01_tata_ourico.jpg`, nome: "Vestido Tata Ouriço", descricao: "100% seda · R$ 1.240 · M e G" },
      { src: `${M}/car_C3_02_fit_balaozinho.jpg`, nome: "Vestido Fit Balãozinho", descricao: "Tafetá de seda · R$ 1.650 · M e G" },
      { src: `${M}/car_C3_03_princesa_damas.jpg`, nome: "Vestido Princesa Damas", descricao: "100% seda · R$ 2.480 · P e G" },
      { src: `${M}/car_C3_04_amarrar_geo.jpg`, nome: "Vestido de Amarrar Geo", descricao: "Seda pura · R$ 1.312,50 · P e M" },
      { src: `${M}/car_C3_05_mikonos.jpg`, nome: "Vestido Asa Longo Mikonos", descricao: "100% seda · R$ 1.400 · última, no G" },
    ] },
  },
  {
    id: "nov-10-carrossel-pied-de-poule",
    nome: "10 Carrossel Pied de Poule duas cores",
    campanha: CAMPANHA_NOV, conjunto: CONJ_NOV, formato: "Carrossel 1:1 · 2 peças",
    texto: "Calça 100% linho, leve e arejada. Bolso lateral e elástico nos tornozelos: usa mais curta e bufante, ou mais longa e reta.\n\nA mesma Pied de Poule em duas cores.",
    titulo: "Marina Saleme Estamparia", botao: "Comprar agora", gasto: "R$ 34,59", impressoes: "113",
    midia: { tipo: "carrossel", cards: [
      { src: `${M}/car_C4_01_juliana_roxo.jpg`, nome: "Calça Juliana Pied de Poule Roxo", descricao: "100% linho · R$ 760 · só no G" },
      { src: `${M}/car_C4_02_juliana_verde.jpg`, nome: "Calça Juliana Pied de Poule Verde", descricao: "100% linho · R$ 760 · P, M e G" },
    ] },
  },
  {
    id: "nov-11-carrossel-look",
    nome: "11 Carrossel O look Azulejo mais Zodíaco",
    campanha: CAMPANHA_NOV, conjunto: CONJ_NOV, formato: "Carrossel 1:1 · 3 peças",
    texto: "A Camisa Ana Zodíaco compõe com a Calça Glória Azulejo Laranja. As duas em 100% seda.\n\nO look inteiro, e cada peça de perto.",
    titulo: "Marina Saleme Estamparia", botao: "Comprar agora", gasto: "R$ 4,12", impressoes: "19",
    midia: { tipo: "carrossel", cards: [
      { src: `${M}/car_C5_01_look.jpg`, nome: "O look inteiro", descricao: "Camisa Ana Zodíaco e Calça Glória Azulejo" },
      { src: `${M}/car_C5_02_camisa_zodiaco.jpg`, nome: "Camisa Ana Zodíaco", descricao: "100% seda · R$ 825 · G e GG" },
      { src: `${M}/car_C5_03_calca_gloria.jpg`, nome: "Calça Glória Azulejo Laranja", descricao: "100% seda · R$ 1.008 · do P ao GG" },
    ] },
  },
  {
    id: "nov-12-feed-moletom",
    nome: "12 Feed Moletom Iguana",
    campanha: CAMPANHA_NOV, conjunto: CONJ_NOV, formato: "Feed 4:5",
    texto: "Moletinho leve e fininho, de formato amplo e desestruturado.\n\nA iguana é estampada, com os detalhes bordados à mão.\n\nNos tamanhos P, M e G.",
    titulo: "IGUANA", botao: "Comprar agora", gasto: "R$ 180,92", impressoes: "931",
    midia: img("feed_F1_moletom_iguana"),
  },
  {
    id: "nov-13-feed-saia-stripes",
    nome: "13 Feed Saia Stripes Mostarda",
    campanha: CAMPANHA_NOV, conjunto: CONJ_NOV, formato: "Feed 4:5",
    texto: "Saia midi levemente evasé, de cintura alta e cós largo, com duas pregas macho na frente.\n\n100% algodão, por isso bem estruturada.\n\nDo P ao GG.",
    titulo: "STRIPES", botao: "Comprar agora", gasto: "R$ 13,14", impressoes: "56",
    midia: img("feed_F2_saia_stripes"),
  },
  {
    id: "nov-14-feed-calca-gloria",
    nome: "14 Feed Calça Glória Azulejo Laranja",
    campanha: CAMPANHA_NOV, conjunto: CONJ_NOV, formato: "Feed 4:5",
    texto: "Modelagem reta, cintura alta e comprimento um pouco mais curto.\n\n100% seda, na estampa Azulejo.\n\nCompõe com a Camisa Ana Zodíaco, como na foto. Do P ao GG.",
    titulo: "AZULEJO", botao: "Comprar agora", gasto: "R$ 71,37", impressoes: "379",
    midia: img("feed_F3_calca_gloria"),
  },
  {
    id: "nov-15-feed-tribeca",
    nome: "15 Feed Camisa Ana Tribeca",
    campanha: CAMPANHA_NOV, conjunto: CONJ_NOV, formato: "Feed 4:5",
    texto: "A Camisa Ana é o corte clássico da casa: não é larga nem justa, tem o caimento certo.\n\nColarinho e punho, sem bolso na frente. 100% crepe de chine.\n\nNa estampa Tribeca, nos tamanhos G e GG.",
    titulo: "TRIBECA", botao: "Comprar agora", gasto: "R$ 92,37", impressoes: "369",
    midia: img("feed_F4_camisa_ana_tribeca"),
  },
  {
    id: "nov-16-reels-lele-paraiso",
    nome: "16 Reels Vestido Lelê Longo Paraíso",
    campanha: CAMPANHA_NOV, conjunto: CONJ_NOV, formato: "Reels 9:16",
    texto: "Mangas longas e bem amplas, com faixas na cintura para amarrar na frente ou nas costas.\n\n100% crepe de chine, na estampa Paraíso.\n\nEstampa nova e são poucas peças.",
    titulo: "PARAÍSO", botao: "Comprar agora", gasto: "R$ 225,71", impressoes: "1.352",
    midia: { tipo: "video", src: `${CRI}/reels_R1_vestido_lele_paraiso.mp4`, capa: `${M}/capa_R1_vestido_lele_paraiso.jpg`, proporcao: "9 / 16" },
  },
  {
    id: "nov-17-reels-moletom",
    nome: "17 Reels Moletom Iguana",
    campanha: CAMPANHA_NOV, conjunto: CONJ_NOV, formato: "Reels 9:16",
    texto: "Moletinho leve e fininho, de formato amplo e desestruturado.\n\nA iguana é estampada, com os detalhes bordados à mão.\n\nNos tamanhos P, M e G.",
    titulo: "IGUANA", botao: "Comprar agora", gasto: "R$ 271,93", impressoes: "1.111",
    midia: { tipo: "video", src: `${CRI}/reels_R2_moletom_iguana.mp4`, capa: `${M}/capa_R2_moletom_iguana.jpg`, proporcao: "9 / 16" },
  },
  {
    id: "nov-18-reels-princesa-damas",
    nome: "18 Reels Vestido Princesa Damas",
    campanha: CAMPANHA_NOV, conjunto: CONJ_NOV, formato: "Reels 9:16",
    texto: "Decote em V e mangas curtas, com botões até a altura dos joelhos e zíper na lateral.\n\nA fenda frontal é discreta e abre com o movimento. 100% seda.\n\nModelagem pequena. Nos tamanhos P e G.",
    titulo: "DAMAS", botao: "Comprar agora", gasto: "R$ 1,46", impressoes: "17",
    midia: { tipo: "video", src: `${CRI}/reels_R3_vestido_princesa_damas.mp4`, capa: `${M}/capa_R3_vestido_princesa_damas.jpg`, proporcao: "9 / 16" },
  },
];

/** Os de junho/julho: topo e meio, rodando nas duas campanhas ao mesmo tempo. */
export const NO_AR_TOPO: AnuncioNoAr[] = [
  { id: "jun-calca-leque-op1", nome: "Calça Leque Verde · Opção 1", formato: "Feed 4:5", gasto: "R$ 88,34", impressoes: "8.072",
    texto: "A Calça Leque Verde tem caimento leve e soltinho, modelagem reta, elástico na cintura e bolsos laterais. Compõe com a Camisa Lenço Leque Verde.",
    titulo: "LEQUE", botao: "Comprar agora", campanha: CAMPANHA_JUN, conjunto: CONJ_JUN, midia: img("jun_conjunto") },
  { id: "jun-roma-op2", nome: "Vestido Roma Leque Verde · Opção 2", formato: "Feed 4:5", gasto: "R$ 23,44", impressoes: "2.622",
    texto: "Vestido Roma Leque Verde: verde e preto, cintura marcada, tecido fluido. Veja tudo o que chegou no site.",
    titulo: "LEQUE", botao: "Comprar agora", campanha: CAMPANHA_JUN, conjunto: CONJ_JUN, midia: img("jun_roma_op2") },
  { id: "jun-camisat-rosa-op2", nome: "Camisa T Leque Rosa · Opção 2", formato: "Feed 4:5", gasto: "R$ 13,94", impressoes: "8.618",
    texto: "Camisa T Leque Rosa: a camisa de todo dia, com uma estampa que não é de todo dia.",
    titulo: "LEQUE", botao: "Comprar agora", campanha: CAMPANHA_JUN, conjunto: CONJ_JUN, midia: img("jun_camisaT_rosa") },
  { id: "jun-clarice-op1", nome: "Vestido Clarice Leque Cinza · Opção 1", formato: "Feed 4:5", gasto: "R$ 11,82", impressoes: "2.752",
    texto: "O Vestido Clarice Leque Cinza tem decote transpassado, manga curta e caimento leve. Estampa Leque em cinza com leques coloridos. Elegante sem esforço.",
    titulo: "LEQUE", botao: "Comprar agora", campanha: CAMPANHA_JUN, conjunto: CONJ_JUN, midia: img("jun_clarice_op1") },
  { id: "jun-roma-op1", nome: "Vestido Roma Leque Verde · Opção 1", formato: "Feed 4:5", gasto: "R$ 9,35", impressoes: "2.247",
    texto: "O Vestido Roma em estampa Leque Verde tem cinto, manga longa e comprimento midi. Conheça a coleção completa no site.",
    titulo: "LEQUE", botao: "Comprar agora", campanha: CAMPANHA_JUN, conjunto: CONJ_JUN, midia: img("jun_roma_op1") },
  { id: "jun-conjunto-op2", nome: "Conjunto Leque Verde · Opção 2", formato: "Feed 4:5", gasto: "R$ 9,28", impressoes: "1.891",
    texto: "Conjunto Leque Verde: Camisa Lenço de mangas amplas e Calça reta, em viscose. Juntos ou separados, sempre funciona.",
    titulo: "LEQUE", botao: "Comprar agora", campanha: CAMPANHA_JUN, conjunto: CONJ_JUN, midia: img("jun_conjunto") },
  { id: "jun-princesa-op1", nome: "Vestido Princesa Leque Berinjela · Opção 1", formato: "Feed 4:5", gasto: "R$ 9,01", impressoes: "1.672",
    texto: "O Vestido Princesa Leque Berinjela é longo, com botões na frente e manga curta. Estampa Leque em berinjela e dourado. Clássico e atual.",
    titulo: "LEQUE", botao: "Comprar agora", campanha: CAMPANHA_JUN, conjunto: CONJ_JUN, midia: img("jun_princesa_berinjela") },
  { id: "jun-princesa-op2", nome: "Vestido Princesa Leque Berinjela · Opção 2", formato: "Feed 4:5", gasto: "R$ 8,20", impressoes: "1.250",
    texto: "Vestido Princesa Leque Berinjela: abotoado, longo, de caimento reto. A estampa faz o trabalho, o corte faz o resto.",
    titulo: "LEQUE", botao: "Comprar agora", campanha: CAMPANHA_JUN, conjunto: CONJ_JUN, midia: img("jun_princesa_berinjela") },
  { id: "jun-clarice-op2", nome: "Vestido Clarice Leque Cinza · Opção 2", formato: "Feed 4:5", gasto: "R$ 6,85", impressoes: "615",
    texto: "Vestido Clarice Leque Cinza, midi, transpassado, em tecido fluido. Do almoço ao jantar sem trocar de roupa.",
    titulo: "LEQUE", botao: "Comprar agora", campanha: CAMPANHA_JUN, conjunto: CONJ_JUN, midia: img("jun_clarice_op2") },
  { id: "jul-camisat-marrom", nome: "Camisa T Ipanema Marrom", formato: "Feed 4:5", gasto: "R$ 6,77", impressoes: "2.679",
    texto: "Estampa inspirada no calçadão da praia de Ipanema. Uma releitura livre, com as cores utilizadas nos anos 70, trazendo um desenho bem vintage.",
    titulo: "Camisa T Ipanema Marrom", botao: "Comprar agora", campanha: CAMPANHA_JUN, conjunto: CONJ_JUN, midia: img("jul_camisaT_marrom") },
  { id: "jul-bardot-op2", nome: "Vestido Bardot Ipanema · Opção 2", formato: "Feed 4:5", gasto: "R$ 6,54", impressoes: "4.080",
    texto: "Estampa inspirada no calçadão da praia de Ipanema. Uma releitura livre, com as cores utilizadas nos anos 70, trazendo um desenho bem vintage.",
    titulo: "Vestido Bardot Ipanema", botao: "Comprar agora", campanha: CAMPANHA_JUN, conjunto: CONJ_JUN, midia: img("jul_bardot") },
  { id: "jul-camisat-saia", nome: "Camisa T e Saia Degrau Ipanema", formato: "Feed 4:5", gasto: "R$ 6,48", impressoes: "3.325",
    texto: "Estampa inspirada no calçadão da praia de Ipanema. Uma releitura livre, com as cores utilizadas nos anos 70, trazendo um desenho bem vintage.",
    titulo: "Camisa T e Saia Degrau Ipanema", botao: "Comprar agora", campanha: CAMPANHA_JUN, conjunto: CONJ_JUN, midia: img("jul_camisaT_saia") },
  { id: "mai-camisa-lenco-ipanema", nome: "Camisa Lenço Ipanema", formato: "Feed 4:5", gasto: "R$ 6,35", impressoes: "2.057",
    texto: "Estampa inspirada no calçadão da praia de Ipanema. Uma releitura livre, com as cores utilizadas nos anos 70, trazendo um desenho bem vintage.",
    titulo: "Marina Saleme | Moda Autoral com Estampas Exclusivas", botao: "Comprar agora", campanha: CAMPANHA_JUN, conjunto: CONJ_JUN, midia: img("mai_marca_2") },
  { id: "jun-lele-op2", nome: "Vestido Lelê Leque Cinza · Opção 2", formato: "Feed 4:5", gasto: "R$ 5,26", impressoes: "3.803",
    texto: "Vestido Lelê Leque Cinza: manga ampla, comprimento longo, tecido que acompanha o movimento. Uma peça só resolve o dia inteiro.",
    titulo: "LEQUE", botao: "Comprar agora", campanha: CAMPANHA_JUN, conjunto: CONJ_JUN, midia: img("jun_lele_op2") },
  { id: "jun-camisa-lenco-op1", nome: "Camisa Lenço Leque Verde · Opção 1", formato: "Feed 4:5", gasto: "R$ 1,71", impressoes: "987",
    texto: "A Camisa Lenço Leque Verde é fluida, de mangas amplas e caimento leve. Conjunto em viscose que compõe com a Calça Leque Verde.",
    titulo: "LEQUE", botao: "Comprar agora", campanha: CAMPANHA_JUN, conjunto: CONJ_JUN, midia: img("jun_camisa_lenco") },
  { id: "jun-camisa-lenco-op2", nome: "Camisa Lenço Leque Verde · Opção 2", formato: "Feed 4:5", gasto: "R$ 1,66", impressoes: "614",
    texto: "Camisa Lenço Leque Verde: ampla, leve, de manga longa. Veste com calça, com short, com o que você quiser.",
    titulo: "LEQUE", botao: "Comprar agora", campanha: CAMPANHA_JUN, conjunto: CONJ_JUN, midia: img("jun_camisa_lenco") },
  { id: "jun-camisat-rosa-op1", nome: "Camisa T Leque Rosa · Opção 1", formato: "Feed 4:5", gasto: "R$ 4,19", impressoes: "2.695",
    texto: "A Camisa T Leque Rosa é de corte clássico, com colarinho e punho, em estampa Leque rosa e preto. Cabe em qualquer look.",
    titulo: "LEQUE", botao: "Comprar agora", campanha: CAMPANHA_JUN, conjunto: CONJ_JUN, midia: img("jun_camisaT_rosa") },
  { id: "jul-bardot-op1", nome: "Vestido Bardot Ipanema · Opção 1", formato: "Feed 4:5", gasto: "R$ 3,10", impressoes: "1.339",
    texto: "Estampa inspirada no calçadão da praia de Ipanema. Uma releitura livre, com as cores utilizadas nos anos 70, trazendo um desenho bem vintage.",
    titulo: "Marina Saleme | Moda Autoral com Estampas Exclusivas", botao: "Comprar agora", campanha: CAMPANHA_JUN, conjunto: CONJ_JUN, midia: img("mai_marca_1") },
  { id: "jun-lele-op1", nome: "Vestido Lelê Leque Cinza · Opção 1", formato: "Feed 4:5", gasto: "R$ 0,37", impressoes: "211",
    texto: "O Vestido Lelê Leque Cinza é longo, de mangas amplas e caimento fluido. A estampa Leque em cinza recebe leques coloridos, um a um. Veste com leveza e faz presença.",
    titulo: "LEQUE", botao: "Comprar agora", campanha: CAMPANHA_JUN, conjunto: CONJ_JUN, midia: img("jun_lele_op1") },
];

export const TODOS_NO_AR = [...NO_AR, ...NO_AR_TOPO];
